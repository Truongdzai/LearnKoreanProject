import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const DB_PATH = resolve(ROOT, 'data', 'hanquan.db')
const OUT_DIR = resolve(HERE, 'out')

const DENY = new Set([
	'users', 'srs_cards', 'srs_reviews', 'activity_log', 'quest_progress',
	'user_items', 'user_garden', 'user_paths', 'user_plans', 'user_videos',
	'admin_audit', 'feedback', 'verify_codes', 'login_attempts', 'email_log',
	'coin_gifts', 'league_members', 'duels', 'mined_cards', 'settings',
	'speak_rooms', 'speak_room_members', 'speak_room_msgs', 'speak_signals',
	'speak_queue', 'ai_usage', 'study_log', 'word_images', 'dict_cache',
	'translation_cache', 'translation_cache_native', 'speaker_cache',
])

const SOURCES = [
	{
		table: 'dict_entries',
		id: (r, i) => `tu-dien/ko/${slug(r.term)}-${i}`,
		sql: "select term, hanja, pos, meaning from dict_entries where meaning is not null and meaning != ''",
		doc: (r) => ({
			title: r.term,
			lang: 'ko',
			kind: 'tu-dien',
			text: [
				`# ${r.term}`,
				r.hanja ? `Hán tự: ${r.hanja}` : '',
				r.pos ? `Từ loại: ${r.pos}` : '',
				'',
				r.meaning,
			].filter(Boolean).join('\n'),
		}),
	},
	{
		table: 'catalog_videos',
		id: (r) => `video/${r.lang || 'ko'}/${r.id}`,
		sql: 'select id, title, channel, level, dur, topic, tone, lang, tags from catalog_videos where active = 1',
		doc: (r) => ({
			title: r.title,
			lang: r.lang || 'ko',
			kind: 'video',
			text: [
				`# ${r.title}`,
				`Kênh: ${r.channel}`,
				`Trình độ: ${r.level}`,
				`Chủ đề: ${r.topic}`,
				r.tone ? `Sắc thái: ${r.tone}` : '',
				r.tags ? `Thẻ: ${r.tags}` : '',
				`Thời lượng: ${r.dur}`,
				`Mã video: ${r.id}`,
			].filter(Boolean).join('\n'),
		}),
	},
	{
		table: 'lesson_cache',
		id: (r) => `bai-hoc/${r.video_id}`,
		sql: 'select video_id, title, channel, source, data from lesson_cache',
		doc: (r) => {
			let lines = []
			try {
				const parsed = JSON.parse(r.data)
				const segs = parsed.segments ?? parsed.lines ?? []
				lines = segs
					.map((s) => [s.text, s.vi ?? s.translation].filter(Boolean).join(' — '))
					.filter(Boolean)
					.slice(0, 400)
			} catch {
				return null
			}
			if (!lines.length) return null
			return {
				title: r.title,
				lang: 'ko',
				kind: 'bai-hoc',
				text: [`# ${r.title}`, `Kênh: ${r.channel}`, '', ...lines].join('\n'),
			}
		},
	},
	{
		table: 'catalog_quests',
		id: (r) => `nhiem-vu/${r.id}`,
		sql: 'select id, title, descr, period, metric, target, reward from catalog_quests where active = 1',
		doc: (r) => ({
			title: r.title,
			lang: 'vi',
			kind: 'nhiem-vu',
			text: `# ${r.title}\n${r.descr}\nChu kỳ: ${r.period} · Chỉ số: ${r.metric} · Mục tiêu: ${r.target} · Thưởng: ${r.reward}`,
		}),
	},
]

function slug(s) {
	return String(s).normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'x'
}

function main() {
	const upload = process.argv.includes('--upload')
	const db = new DatabaseSync(DB_PATH, { readOnly: true })

	mkdirSync(OUT_DIR, { recursive: true })
	const manifest = []
	let total = 0

	for (const source of SOURCES) {
		if (DENY.has(source.table)) {
			throw new Error(`Bảng "${source.table}" nằm trong DENY — không được xuất.`)
		}
		const rows = db.prepare(source.sql).all()
		let n = 0
		const lines = []

		rows.forEach((row, i) => {
			const doc = source.doc(row, i)
			if (!doc) return
			lines.push(JSON.stringify({ id: source.id(row, i), ...doc }))
			n += 1
		})

		const file = resolve(OUT_DIR, `${source.table}.ndjson`)
		writeFileSync(file, lines.join('\n') + '\n', 'utf8')
		manifest.push({ table: source.table, documents: n, file: `${source.table}.ndjson` })
		total += n
		console.log(`  ${source.table.padEnd(18)} ${String(n).padStart(7)} tài liệu`)
	}

	db.close()
	writeFileSync(
		resolve(OUT_DIR, 'manifest.json'),
		JSON.stringify({ builtAt: new Date().toISOString(), total, sources: manifest }, null, 2),
		'utf8',
	)
	console.log(`\nTổng: ${total} tài liệu → ${OUT_DIR}`)

	if (upload) {
		console.log('\nĐẩy lên R2 (cần `wrangler login` trước):')
		for (const m of manifest) {
			console.log(
				`  npx wrangler r2 object put vyling-knowledge/${m.file} --file cf/ai-search/out/${m.file} --remote`,
			)
		}
		console.log('\nChạy các lệnh trên rồi bấm "Sync index" trong dashboard AI Search.')
	}
}

main()
