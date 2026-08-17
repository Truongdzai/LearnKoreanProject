import { spawn } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'frontend', 'dist')
const CF = resolve(ROOT, 'cf')
const WRANGLER = resolve(CF, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const BUCKET = 'vyling-site'
const PARALLEL = 8

const HEAVY = ['wordimg/', 'audio/', 'cosmetics/']

const TYPES = {
	html: 'text/html; charset=utf-8',
	js: 'text/javascript; charset=utf-8',
	css: 'text/css; charset=utf-8',
	json: 'application/json; charset=utf-8',
	webmanifest: 'application/manifest+json; charset=utf-8',
	svg: 'image/svg+xml',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	webp: 'image/webp',
	ico: 'image/x-icon',
	woff2: 'font/woff2',
	woff: 'font/woff',
	ttf: 'font/ttf',
	txt: 'text/plain; charset=utf-8',
	xml: 'application/xml; charset=utf-8',
	mp3: 'audio/mpeg',
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
	const all = process.argv.includes('--all')
	const only = process.argv.find((a) => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]) || ''

	let files = walk(DIST)
		.map((f) => relative(DIST, f).split(sep).join('/'))
		.filter((k) => !k.endsWith('.map'))

	if (!all) files = files.filter((k) => !HEAVY.some((h) => k.startsWith(h)))
	if (only) files = files.filter((k) => k.startsWith(only))

	if (!files.length) {
		console.log('Không có file nào khớp.')
		return
	}

	const totalMb = files.reduce((n, k) => n + statSync(join(DIST, k)).size, 0) / 1024 / 1024
	console.log(`${files.length} file · ${totalMb.toFixed(1)} MB → r2://${BUCKET}`)
	if (!all) console.log(`(bỏ qua ${HEAVY.join(', ')} — dùng --all để đẩy cả)`)
	console.log()

	let done = 0
	let failed = 0
	const errors = []
	for (let i = 0; i < files.length; i += PARALLEL) {
		const batch = files.slice(i, i + PARALLEL)
		await Promise.all(
			batch.map(async (key) => {
				const ext = key.split('.').pop().toLowerCase()
				const args = ['r2', 'object', 'put', `${BUCKET}/${key}`, '--file', join(DIST, key), '--remote']
				if (TYPES[ext]) args.push('--content-type', TYPES[ext])
				const r = await run(args)
				done += 1
				if (!r.ok) {
					failed += 1
					errors.push(key)
				}
			}),
		)
		const pct = ((done / files.length) * 100).toFixed(0)
		process.stdout.write(`\r  ${done}/${files.length} (${pct}%) — lỗi: ${failed}   `)
	}
	console.log(`\n\nXong. Thành công ${done - failed}/${files.length}.`)
	if (failed) {
		console.log('Chưa đẩy được:')
		for (const k of errors.slice(0, 10)) console.log(`  ${k}`)
		console.log('Chạy lại lệnh này để thử tiếp.')
	}
}

main()
