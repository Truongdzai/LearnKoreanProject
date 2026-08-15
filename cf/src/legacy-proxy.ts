import { getSandbox, type Sandbox } from '@cloudflare/sandbox'

const SANDBOX_ID = 'vyling-app'

// Chỉ nhớ một chuỗi URL, KHÔNG bao giờ nhớ Promise ở phạm vi module: một
// Promise đang chờ mà bị request khác await sẽ ném "Cannot perform I/O on
// behalf of a different request". Chuỗi thì không mang I/O nên an toàn, và
// URL cũ hết hiệu lực đã có nhánh thử lại bên dưới xử lý.
let cachedOrigin: string | null = null

function sandboxFor(env: Env) {
	// `wrangler types` sinh `DurableObjectNamespace<undefined>` cho binding này:
	// nó chỉ suy được kiểu từ class export trong repo, mà `Sandbox` đến từ
	// package `@cloudflare/sandbox`. Hai kiểu không đủ chồng lấn nên TypeScript
	// bắt buộc phải đi qua `unknown`. Ép kiểu gói gọn đúng một chỗ này; phần
	// còn lại của Env vẫn do wrangler sinh nên không thể lệch với wrangler.jsonc.
	const ns = env.Sandbox as unknown as DurableObjectNamespace<Sandbox>
	return getSandbox(ns, SANDBOX_ID, {
		transport: 'rpc',
		keepAlive: true,
	})
}

export async function ensureBackend(env: Env): Promise<string> {
	if (cachedOrigin) return cachedOrigin

	const port = Number(env.APP_PORT || '8000')
	const sandbox = sandboxFor(env)

	// Container có thể đã chạy từ request trước (isolate này mới, nhưng
	// Durable Object thì không). Hỏi tunnel sẵn có trước khi spawn thêm
	// uvicorn — tránh hai tiến trình tranh nhau cùng một cổng.
	const running = await sandbox.tunnels.list().catch(() => [])
	const existing = running.find((t) => t.port === port)
	if (existing?.url) {
		cachedOrigin = existing.url
		return existing.url
	}

	// KHÔNG truyền secret qua env ở đây: `backend/config.py` chỉ đọc TOML
	// (config.toml, không có thì config.example.toml) và KHÔNG hề đọc biến môi
	// trường. Truyền vào chỉ tạo cảm giác an toàn giả — app không bao giờ thấy.
	// Cách nạp secret đúng: xem cf/README.md §15.
	await sandbox.startProcess(
		`python3 -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
		{
			cwd: '/app',
			env: {
				PYTHONUNBUFFERED: '1',
				PYTHONIOENCODING: 'utf-8',
			},
		},
	)

	const tunnel = await sandbox.tunnels.get(port)
	cachedOrigin = tunnel.url
	return tunnel.url
}

function invalidate() {
	cachedOrigin = null
}

export async function proxyToBackend(request: Request, env: Env): Promise<Response> {
	const incoming = new URL(request.url)

	for (let attempt = 0; attempt < 2; attempt++) {
		const origin = await ensureBackend(env)
		const target = new URL(incoming.pathname + incoming.search, origin)

		const headers = new Headers(request.headers)
		headers.set('X-Forwarded-Host', incoming.host)
		headers.set('X-Forwarded-Proto', incoming.protocol.replace(':', ''))

		try {
			return await fetch(
				new Request(target, {
					method: request.method,
					headers,
					body: request.body,
					redirect: 'manual',
				}),
			)
		} catch (error) {
			// Quick tunnel URL đổi mỗi lần container khởi động lại, nên URL đã
			// nhớ có thể chết. Bỏ cache rồi dựng lại đúng một lần.
			if (attempt === 1 || request.body) throw error
			invalidate()
		}
	}

	throw new Error('Không kết nối được backend trong sandbox.')
}
