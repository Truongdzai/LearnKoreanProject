/**
 * Đẩy media/ lên bucket R2 để web đã deploy phục vụ được qua /media/*.
 *
 *   node scripts/upload_media_r2.mjs               # đẩy tất cả
 *   node scripts/upload_media_r2.mjs toeic/ets     # chỉ một nhánh
 *
 * Vì sao cần: media/ (420MB) cố tình không nằm trong image container — nhét
 * vào thì cold start rất chậm và mỗi lần deploy phải đẩy lại toàn bộ. Worker
 * phục vụ /media/* thẳng từ R2 ở edge (xem cf/src/app.ts).
 *
 * Khoá trên R2 = đường dẫn tương đối tính từ media/, khớp đúng cái mà
 * frontend yêu cầu: /media/toeic/ets/t01/x.mp3 → khoá toeic/ets/t01/x.mp3
 *
 * Chạy lại được nhiều lần: mặc định bỏ qua file đã có trên R2.
 */
import { spawn } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MEDIA = resolve(ROOT, 'media')
const CF = resolve(ROOT, 'cf')
const WRANGLER = resolve(CF, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const BUCKET = 'vyling-media'
const PARALLEL = 6

const TYPES = {
	mp3: 'audio/mpeg',
	webp: 'image/webp',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	mp4: 'video/mp4',
	json: 'application/json',
}

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name)
		if (statSync(full).isDirectory()) walk(full, out)
		else out.push(full)
	}
	return out
}

function run(args) {
	return new Promise((done) => {
		const p = spawn(process.execPath, [WRANGLER, ...args], { cwd: CF, stdio: ['ignore', 'pipe', 'pipe'] })
		let err = ''
		p.stderr.on('data', (d) => (err += d))
		p.stdout.on('data', () => {})
		p.on('close', (code) => done({ ok: code === 0, err }))
	})
}

async function main() {
	const only = process.argv[2] || ''
	const files = walk(MEDIA)
		.map((f) => relative(MEDIA, f).split(sep).join('/'))
		.filter((k) => !only || k.startsWith(only))

	if (!files.length) {
		console.log('Không có file nào khớp.')
		return
	}

	const totalMb = files.reduce((n, k) => n + statSync(join(MEDIA, k)).size, 0) / 1024 / 1024
	console.log(`${files.length} file · ${totalMb.toFixed(0)} MB → r2://${BUCKET}\n`)

	let done = 0
	let failed = 0
	for (let i = 0; i < files.length; i += PARALLEL) {
		const batch = files.slice(i, i + PARALLEL)
		await Promise.all(
			batch.map(async (key) => {
				const ext = key.split('.').pop().toLowerCase()
				const args = [
					'r2', 'object', 'put', `${BUCKET}/${key}`,
					'--file', join(MEDIA, key),
					'--remote',
				]
				if (TYPES[ext]) args.push('--content-type', TYPES[ext])
				const r = await run(args)
				done += 1
				if (!r.ok) {
					failed += 1
					console.log(`  LỖI ${key}: ${r.err.split('\n').find((l) => l.includes('ERROR')) || 'không rõ'}`)
				}
			}),
		)
		const pct = ((done / files.length) * 100).toFixed(0)
		process.stdout.write(`\r  ${done}/${files.length} (${pct}%) — lỗi: ${failed}   `)
	}
	console.log(`\n\nXong. Thành công ${done - failed}/${files.length}.`)
	if (failed) console.log('Chạy lại lệnh này để thử lại các file lỗi.')
}

main()
