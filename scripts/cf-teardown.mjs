/**
 * Gỡ TOÀN BỘ hạ tầng Cloudflare của VyLing để hoá đơn về 0.
 *
 * Vì sao cần file này: xoá code trong repo KHÔNG xoá thứ đã deploy. Worker,
 * container, instance AI Search, bucket R2 nằm trên tài khoản Cloudflare và cứ
 * thế chạy (và tính tiền) cho tới khi bị xoá bằng API. Script này gọi đúng
 * những lệnh wrangler đó, theo thứ tự an toàn.
 *
 * Cách dùng (chạy trên máy bạn, KHÔNG chạy được trên CI vì cần đăng nhập):
 *
 *   npx wrangler login --cwd cf     # một lần, mở trình duyệt
 *   node scripts/cf-teardown.mjs            # chỉ LIỆT KÊ, không xoá gì
 *   node scripts/cf-teardown.mjs --yes      # xoá phần tính tiền (worker, container, AI Search…)
 *   node scripts/cf-teardown.mjs --yes --buckets   # xoá luôn bucket R2 (MẤT DỮ LIỆU)
 *
 * Bước cuối — hạ gói Workers Paid 5 USD/tháng về Free — CHỈ làm được trên
 * Dashboard. Script in sẵn đường bấm ở cuối.
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CF = resolve(ROOT, 'cf')
const LOCAL_WRANGLER = resolve(CF, 'node_modules', 'wrangler', 'bin', 'wrangler.js')

const WORKER = 'vyling'
const AI_SEARCH = 'vyling-knowledge'
const BUCKETS = [
	'vyling-media', 'vyling-media-dev',
	'vyling-knowledge', 'vyling-knowledge-dev',
	'vyling-lessons', 'vyling-lessons-dev',
	'vyling-site', 'vyling-site-dev',
	'vyling-db',
]

const args = process.argv.slice(2)
const APPLY = args.includes('--yes')
const DROP_BUCKETS = args.includes('--buckets')

const done = []
const failed = []

function wrangler(argv, { quiet = false } = {}) {
	const useLocal = existsSync(LOCAL_WRANGLER)
	const cmd = useLocal ? process.execPath : (process.platform === 'win32' ? 'npx.cmd' : 'npx')
	const full = useLocal ? [LOCAL_WRANGLER, ...argv] : ['--yes', 'wrangler', ...argv]

	const res = spawnSync(cmd, full, {
		cwd: CF,
		encoding: 'utf8',
		stdio: quiet ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'pipe', 'inherit'],
	})
	if (res.error) return { ok: false, out: String(res.error.message) }
	return { ok: res.status === 0, out: `${res.stdout ?? ''}${res.stderr ?? ''}`.trim() }
}

function show(title, argv) {
	console.log(`\n── ${title}`)
	const res = wrangler(argv, { quiet: true })
	const text = res.out || '(trống)'
	console.log(text.split('\n').map((l) => `   ${l}`).join('\n'))
	return res
}

function destroy(title, argv) {
	if (!APPLY) {
		console.log(`   [khô] sẽ chạy: wrangler ${argv.join(' ')}`)
		return
	}
	process.stdout.write(`   xoá ${title}… `)
	const res = wrangler(argv, { quiet: true })
	if (res.ok) {
		console.log('xong')
		done.push(title)
	} else {
		const first = (res.out.split('\n').find((l) => l.trim()) ?? 'không rõ lỗi').trim()
		console.log(`BỎ QUA (${first})`)
		failed.push(`${title}: ${first}`)
	}
}

/** Lấy cột id/tên từ bảng hoặc JSON mà wrangler in ra. */
function idsFrom(out, pattern) {
	const ids = new Set()
	for (const line of out.split('\n')) {
		const m = line.match(pattern)
		if (m) ids.add(m[1])
	}
	return [...ids]
}

console.log('VyLing — gỡ hạ tầng Cloudflare')
console.log(APPLY ? 'CHẾ ĐỘ: XOÁ THẬT' : 'CHẾ ĐỘ: chỉ liệt kê (thêm --yes để xoá thật)')

const who = show('Đang đăng nhập bằng tài khoản nào', ['whoami'])
// wrangler whoami vẫn thoát 0 khi chưa đăng nhập, nên phải đọc cả nội dung.
if (!who.ok || /not authenticated|You are not authenticated/i.test(who.out)) {
	console.log('\nChưa đăng nhập. Chạy: npx wrangler login --cwd cf  rồi thử lại.')
	process.exit(1)
}

// 1) Worker: xoá Worker là xoá luôn Durable Object + container gắn theo nó.
//    Đây là khoản tiền container (RAM + đĩa + CPU) trên hoá đơn.
console.log('\n[1/6] Worker + Durable Object + container')
show('Worker đang có', ['deployments', 'list', '--name', WORKER])
destroy(`worker ${WORKER}`, ['delete', '--name', WORKER, '--force'])

// 2) Container/image còn sót lại (Worker xoá rồi mà image vẫn nằm trong registry).
console.log('\n[2/6] Container và image còn sót')
const apps = show('Container application', ['containers', 'list'])
for (const id of idsFrom(apps.out, /^\s*([0-9a-f-]{36})\b/i)) {
	destroy(`container ${id}`, ['containers', 'delete', id, '--yes'])
}
const images = show('Image trong registry', ['containers', 'images', 'list'])
for (const tag of idsFrom(images.out, /(vyling[^\s|]*)/i)) {
	destroy(`image ${tag}`, ['containers', 'images', 'delete', tag])
}

// 3) AI Search: KHÔNG nằm trong wrangler.jsonc nên deploy/delete Worker không
//    đụng tới. Mỗi lần nó index lại corpus là một lần đốt neuron Workers AI —
//    khoản to nhất trên hoá đơn tháng này.
console.log('\n[3/6] AI Search (AutoRAG)')
show('Instance đang có', ['ai-search', 'list'])
destroy(`ai-search ${AI_SEARCH}`, ['ai-search', 'delete', AI_SEARCH])

// 4) Vectorize / Queues / KV / D1: hoá đơn ghi "Enabled" cho Vectorize và
//    Queues, nên kiểm cho sạch. Index Vectorize do AI Search tự tạo có thể
//    sống sót sau khi instance bị xoá.
console.log('\n[4/6] Vectorize, Queues, KV, D1')
const vec = show('Vectorize index', ['vectorize', 'list'])
for (const name of idsFrom(vec.out, /^\s*\|?\s*([a-z0-9][a-z0-9-_]{2,})\s*\|/i)) {
	if (/^(name|id)$/i.test(name)) continue
	destroy(`vectorize ${name}`, ['vectorize', 'delete', name, '--force'])
}
const queues = show('Queue', ['queues', 'list'])
for (const name of idsFrom(queues.out, /^\s*\|?\s*([a-z0-9][a-z0-9-_]{2,})\s*\|/i)) {
	if (/^(name|id)$/i.test(name)) continue
	destroy(`queue ${name}`, ['queues', 'delete', name])
}
show('KV namespace (tự xoá tay nếu còn)', ['kv', 'namespace', 'list'])
show('D1 database (tự xoá tay nếu còn)', ['d1', 'list'])

// 5) R2: lưu trữ đang trong hạn miễn phí (10 GB) nên KHÔNG tự xoá. Chỉ xoá khi
//    bạn nói rõ --buckets, vì trong đó có media, bài học và bản sao lưu DB
//    người học. Bucket phải rỗng thì API mới cho xoá.
console.log('\n[5/6] Bucket R2')
show('Bucket đang có', ['r2', 'bucket', 'list'])
if (DROP_BUCKETS) {
	console.log('   ⚠ Xoá bucket là MẤT dữ liệu media/bài học/sao lưu. Bucket còn file sẽ báo lỗi —')
	console.log('     vào Dashboard → R2 → chọn bucket → Settings → Empty bucket rồi chạy lại.')
	for (const b of BUCKETS) destroy(`bucket ${b}`, ['r2', 'bucket', 'delete', b])
} else {
	console.log('   Bỏ qua (thêm --buckets nếu muốn xoá). 10 GB đầu miễn phí nên giữ lại KHÔNG tốn tiền.')
}

// 6) Việc còn lại chỉ Dashboard làm được.
console.log('\n[6/6] Phần CHỈ Dashboard làm được — đây mới là chỗ cắt 5 USD/tháng')
console.log(`
   a. Hạ gói Workers Paid về Free  (dòng "Workers Paid  $5.00" trên hoá đơn)
      https://dash.cloudflare.com/?to=/:account/workers/plans
      → Free plan → Change plan. Cloudflare chặn hạ gói khi còn container /
        Durable Object / AI Search → chạy xong các bước trên rồi mới bấm được.

   b. Soát mọi đăng ký khác đang gắn vào tài khoản
      https://dash.cloudflare.com/?to=/:account/billing/subscriptions
      Huỷ những dòng không dùng: R2 Paid, R2 Infrequent Access, Vectorize,
      Queues, Zaraz. (Hiện đều 0 USD, nhưng chúng là đăng ký thật.)

   c. Xem đúng thứ đã đốt neuron trước khi kết luận
      https://dash.cloudflare.com/?to=/:account/ai/workers-ai
      Bảng usage tách theo model: whisper (luyện nói) và kimi-k2.6 (gia sư /
      AI Search) sẽ lộ ngay cái nào chiếm 978.209 neuron của kỳ này.

   d. Hoá đơn đang nợ 20,60 USD là tiền đã dùng 14/08–13/09 — xoá hạ tầng
      hôm nay không xoá được nó. Muốn xin miễn/ghi có thì mở ticket:
      https://dash.cloudflare.com/?to=/:account/support
`)

console.log('\n── Tóm tắt')
if (!APPLY) {
	console.log('   Chưa xoá gì cả. Chạy lại với --yes khi đã xem xong danh sách trên.')
} else {
	console.log(`   Đã xoá: ${done.length ? done.join(', ') : '(không có gì)'}`)
	if (failed.length) {
		console.log('   Không xoá được:')
		for (const f of failed) console.log(`     - ${f}`)
		console.log('   (Thứ đã bị xoá trước đó cũng rơi vào đây — mở Dashboard xác nhận là đủ.)')
	}
	console.log('   Còn lại: bước [6/6] ở trên, nhất là mục (a) — chưa hạ gói thì vẫn mất 5 USD mỗi tháng.')
}
