/**
 * Đẩy các khoá bí mật từ config.toml lên Cloudflare Worker.
 *
 *   node scripts/set_cf_secrets.mjs            # xem sẽ đẩy những gì (không đẩy)
 *   node scripts/set_cf_secrets.mjs --apply    # đẩy thật
 *
 * Vì sao cần script riêng thay vì một dòng lệnh: dòng lệnh phải lồng nhiều lớp
 * dấu nháy, PowerShell và cmd.exe nuốt mất nên `wrangler secret put` nhận
 * chuỗi rỗng và im lặng bỏ qua.
 *
 * Khoá KHÔNG bao giờ được in ra màn hình — chỉ hiện tên và độ dài.
 * Nó đi thẳng từ config.toml vào stdin của wrangler.
 */
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONFIG = resolve(ROOT, 'config.toml')
const CF = resolve(ROOT, 'cf')
const WRANGLER = resolve(CF, 'node_modules', 'wrangler', 'bin', 'wrangler.js')

/** [mục trong config.toml] → tên secret trên Cloudflare */
const MAP = [
	{ section: 'llm', key: 'api_key', secret: 'LLM_API_KEY' },
	{ section: 'admin', key: 'password', secret: 'ADMIN_PASSWORD' },
	{ section: 'smtp', key: 'password', secret: 'SMTP_PASSWORD' },
	{ section: 'oauth', key: 'google_client_secret', secret: 'GOOGLE_CLIENT_SECRET' },
	{ section: 'oauth', key: 'facebook_app_secret', secret: 'FACEBOOK_APP_SECRET' },
	{ section: 'together', key: 'api_key', secret: 'TOGETHER_API_KEY' },
]

/** Đọc một giá trị chuỗi trong đúng mục [section] của file TOML. */
function readToml(text, section, key) {
	const lines = text.split(/\r?\n/)
	let inSection = false
	for (const line of lines) {
		const s = line.trim()
		if (s.startsWith('[')) {
			inSection = s === `[${section}]`
			continue
		}
		if (!inSection) continue
		const m = s.match(/^([A-Za-z0-9_]+)\s*=\s*"([^"]*)"/)
		if (m && m[1] === key) return m[2]
	}
	return ''
}

function putSecret(name, value) {
	return new Promise((done) => {
		const p = spawn(process.execPath, [WRANGLER, 'secret', 'put', name], {
			cwd: CF,
			stdio: ['pipe', 'pipe', 'pipe'],
		})
		let out = ''
		p.stdout.on('data', (d) => (out += d))
		p.stderr.on('data', (d) => (out += d))
		p.on('close', (code) => done({ ok: code === 0, out }))
		p.stdin.write(value)
		p.stdin.end()
	})
}

async function main() {
	const apply = process.argv.includes('--apply')

	let text
	try {
		text = readFileSync(CONFIG, 'utf8')
	} catch {
		console.error('Không đọc được config.toml ở gốc dự án.')
		process.exit(1)
	}

	const found = []
	for (const m of MAP) {
		const v = readToml(text, m.section, m.key).trim()
		if (v) found.push({ ...m, value: v })
	}

	if (!found.length) {
		console.log('Không tìm thấy khoá nào có giá trị trong config.toml.')
		return
	}

	console.log(`Tìm thấy ${found.length} khoá trong config.toml:\n`)
	for (const f of found) {
		console.log(`  ${f.secret.padEnd(22)} ← [${f.section}].${f.key}  (${f.value.length} ký tự)`)
	}

	if (!apply) {
		console.log('\nChạy lại kèm --apply để đẩy lên Cloudflare:')
		console.log('  node scripts/set_cf_secrets.mjs --apply')
		return
	}

	console.log('\nĐang đẩy lên Cloudflare…\n')
	let ok = 0
	for (const f of found) {
		const r = await putSecret(f.secret, f.value)
		if (r.ok) {
			ok += 1
			console.log(`  ✓ ${f.secret}`)
		} else {
			console.log(`  ✗ ${f.secret}`)
			console.log(
				'    ' + r.out.split('\n').filter((l) => /error|ERROR/i.test(l)).slice(0, 2).join(' | '),
			)
		}
	}
	console.log(`\nXong ${ok}/${found.length}.`)
	if (ok) console.log('Deploy lại để container nhận khoá:  npm run deploy --prefix cf')
}

main()
