/**
 * Rà kho video: video nào chủ sở hữu đã TẮT nhúng.
 *
 *   node scripts/audit_embed.mjs            # chỉ báo
 *   node scripts/audit_embed.mjs --fix      # + gỡ khỏi backend/services/catalog.py
 *
 * Vì sao cần: video bị tắt nhúng vẫn phát bình thường khi mở thẳng trên
 * YouTube, và trên localhost đôi khi cũng phát được — nên lỗi chỉ lộ ra với
 * người dùng thật trên tên miền thật, hiện dòng "Chủ sở hữu video đã tắt tính
 * năng phát trên các trang web khác".
 *
 * Cách kiểm: oEmbed trả 401 với video tắt nhúng, 404 với video đã xoá/riêng tư.
 * Không cần API key.
 *
 * Chạy lại mỗi lần thêm video vào kho — quyền nhúng có thể bị đổi bất cứ lúc nào.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CATALOG = resolve(ROOT, 'backend', 'services', 'catalog.py')
const BATCH = 8
const TIMEOUT_MS = 15_000

function readCatalog() {
	const src = readFileSync(CATALOG, 'utf8')
	const out = []
	for (const line of src.split(/\r?\n/)) {
		const m = line.match(/^\s*\("([A-Za-z0-9_-]{11})",\s*"([^"]*)".*"(en|ko|zh|ja|de|vi)"/)
		if (m) out.push({ id: m[1], title: m[2], lang: m[3] })
	}
	return out
}

async function embeddable(id) {
	const url = `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
		return res.ok ? { ok: true } : { ok: false, status: res.status }
	} catch {
		// Mạng chập chờn thì coi như CHƯA kết luận được — không gỡ nhầm video tốt.
		return { ok: true, unknown: true }
	}
}

async function main() {
	const fix = process.argv.includes('--fix')
	const videos = readCatalog()
	console.log(`Đang kiểm ${videos.length} video…\n`)

	const bad = []
	for (let i = 0; i < videos.length; i += BATCH) {
		const slice = videos.slice(i, i + BATCH)
		const results = await Promise.all(slice.map((v) => embeddable(v.id)))
		results.forEach((r, k) => {
			if (!r.ok) bad.push({ ...slice[k], status: r.status })
		})
	}

	if (!bad.length) {
		console.log('Tất cả video đều nhúng được.')
		return
	}

	const byLang = {}
	for (const b of bad) (byLang[b.lang] ??= []).push(b)
	console.log(`KHÔNG nhúng được: ${bad.length}\n`)
	for (const [lang, list] of Object.entries(byLang)) {
		console.log(`  ${lang} — ${list.length} video`)
		for (const b of list) console.log(`    ${b.id} [${b.status}] ${b.title}`)
	}

	if (!fix) {
		console.log('\nChạy lại với --fix để gỡ khỏi catalog.py.')
		return
	}

	const ids = new Set(bad.map((b) => b.id))
	const kept = readFileSync(CATALOG, 'utf8')
		.split(/\r?\n/)
		.filter((line) => {
			const m = line.match(/^\s*\("([A-Za-z0-9_-]{11})",/)
			return !(m && ids.has(m[1]))
		})
	writeFileSync(CATALOG, kept.join('\n'), 'utf8')
	console.log(`\nĐã gỡ ${bad.length} video khỏi catalog.py.`)
	console.log('Khởi động lại backend để seed() đồng bộ lại kho.')
}

main()
