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

/**
 * Origin phía sau tunnel còn sống không.
 *
 * Chú ý: origin chết thì Cloudflare trả 530/1033 — đó vẫn là HTTP response
 * hợp lệ nên `fetch` KHÔNG ném lỗi. Phải xét mã trạng thái mới biết, đây đúng
 * là chỗ bản đầu làm sai.
 */
async function originAlive(url: string): Promise<boolean> {
	try {
		const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(8_000) })
		return res.status < 500
	} catch {
		return false
	}
}

export async function ensureBackend(env: Env): Promise<string> {
	if (cachedOrigin) return cachedOrigin

	const port = Number(env.APP_PORT || '8000')
	const sandbox = sandboxFor(env)

	// Container có thể đã chạy từ request trước (isolate này mới, nhưng
	// Durable Object thì không). Hỏi tunnel sẵn có trước khi spawn thêm
	// uvicorn — tránh hai tiến trình tranh nhau cùng một cổng.
	//
	// NHƯNG phải kiểm tunnel còn sống thật. Sau khi deploy image mới,
	// Cloudflare dừng container cũ mà BẢN GHI TUNNEL VẪN CÒN. Tin nó mà không
	// kiểm thì proxy mãi vào một origin đã chết và không bao giờ dựng lại
	// container — web đứng ở bản cũ vĩnh viễn.
	const running = await sandbox.tunnels.list().catch(() => [])
	const existing = running.find((t) => t.port === port)
	if (existing?.url) {
		if (await originAlive(existing.url)) {
			cachedOrigin = existing.url
			return existing.url
		}
		await sandbox.tunnels.destroy(port).catch(() => {})
	}

	// Secret đi từ `wrangler secret` → Worker → biến môi trường của tiến trình
	// uvicorn. `backend/config.py` đọc chúng qua `_apply_env` và ghi đè lên
	// config.example.toml (file này KHÔNG có khoá — cố ý, để khoá không bị
	// đóng gói vào image). Thiếu đường này thì mọi tính năng AI tắt câm.
	await sandbox.startProcess(
		`python3 -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
		{
			cwd: '/app',
			env: {
				PYTHONUNBUFFERED: '1',
				PYTHONIOENCODING: 'utf-8',
				...(env.LLM_API_KEY ? { VYLING_LLM_API_KEY: env.LLM_API_KEY } : {}),
				...(env.ADMIN_PASSWORD ? { VYLING_ADMIN_PASSWORD: env.ADMIN_PASSWORD } : {}),
				...(env.SMTP_PASSWORD ? { VYLING_SMTP_PASSWORD: env.SMTP_PASSWORD } : {}),
				...(env.GOOGLE_CLIENT_SECRET
					? { VYLING_GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET }
					: {}),
				...(env.FACEBOOK_APP_SECRET
					? { VYLING_FACEBOOK_APP_SECRET: env.FACEBOOK_APP_SECRET }
					: {}),
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

/**
 * Huỷ container đang chạy để lần gọi sau dựng lại bằng image mới nhất.
 *
 * Cần vì `keepAlive: true`: deploy image mới KHÔNG thay được instance đang
 * sống — nó cứ chạy tiếp bản cũ (kiểm bằng `wrangler containers instances`,
 * cột VERSION đứng yên). Nên mỗi lần deploy có đổi `backend/` hoặc
 * `frontend/dist` đều phải gọi cái này, nếu không web thật vẫn là bản cũ.
 */
export async function recycleBackend(env: Env): Promise<void> {
	invalidate()
	await sandboxFor(env).destroy()
}

export async function proxyToBackend(request: Request, env: Env): Promise<Response> {
	const incoming = new URL(request.url)

	for (let attempt = 0; attempt < 2; attempt++) {
		const origin = await ensureBackend(env)
		const target = new URL(incoming.pathname + incoming.search, origin)

		const headers = new Headers(request.headers)
		headers.set('X-Forwarded-Host', incoming.host)
		headers.set('X-Forwarded-Proto', incoming.protocol.replace(':', ''))

		// Có body thì không thử lại được: body là stream, đọc rồi không phát lại.
		const canRetry = attempt === 0 && !request.body

		try {
			const res = await fetch(
				new Request(target, {
					method: request.method,
					headers,
					body: request.body,
					redirect: 'manual',
				}),
			)
			// 530/1033/502… = tunnel còn bản ghi nhưng origin đã chết. Đây là
			// response HỢP LỆ nên không rơi vào catch — phải xét riêng, nếu
			// không sẽ trả thẳng trang lỗi Cloudflare cho người dùng.
			if (res.status >= 500 && canRetry) {
				invalidate()
				continue
			}
			return res
		} catch (error) {
			if (!canRetry) throw error
			invalidate()
		}
	}

	throw new Error('Không kết nối được backend trong sandbox.')
}
