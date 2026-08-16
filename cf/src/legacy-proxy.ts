import { getSandbox, type Sandbox } from '@cloudflare/sandbox'

// Đổi giá trị này (qua biến SANDBOX_ID trong wrangler.jsonc) là cách khôi phục
// khi container/tunnel kẹt: Cloudflare dựng một sandbox hoàn toàn mới thay vì
// cố cứu cái cũ. Cái cũ tự bị dọn sau khi hết hạn nhàn rỗi.
const DEFAULT_SANDBOX_ID = 'vyling-app'

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
	// Transport KHÔNG đặt được ở đây: `SandboxOptions` không có trường đó, nên
	// `transport: 'rpc'` bị bỏ qua âm thầm. Đặt bằng biến `SANDBOX_TRANSPORT`
	// trong wrangler.jsonc — tunnels bắt buộc RPC.
	// keepAlive: false + sleepAfter là CỐ Ý, dù app có vòng lặp nền.
	// Với keepAlive:true, container không bao giờ tự ngủ — mỗi lần đổi
	// SANDBOX_ID để khôi phục sẽ để lại một container mồ côi chạy mãi và tính
	// tiền mãi. Cho ngủ thì cái cũ tự bị dọn, đổi lại là cold start sau khi
	// nhàn rỗi (proxyToBackend đã có nhánh thử lại để che).
	return getSandbox(ns, env.SANDBOX_ID || DEFAULT_SANDBOX_ID, {
		keepAlive: false,
		sleepAfter: '15m',
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
		// Chỉ bỏ BẢN GHI TUNNEL đã chết, KHÔNG gọi sandbox.destroy().
		// Đã thử destroy() và nó làm hỏng nặng hơn: hệ thống tunnel kẹt ở
		// "Tunnel recovery attempts were exhausted", startProcess bị Canceled,
		// và web trả 500 liên tục cho tới khi phải dựng sandbox mới.
		// startProcess dưới đây tự khởi động lại container nếu nó đã dừng.
		await sandbox.tunnels.destroy(port).catch(() => {})
	}

	// Secret đi từ `wrangler secret` → Worker → biến môi trường của tiến trình
	// uvicorn. `backend/config.py` đọc chúng qua `_apply_env` và ghi đè lên
	// config.example.toml (file này KHÔNG có khoá — cố ý, để khoá không bị
	// đóng gói vào image). Thiếu đường này thì mọi tính năng AI tắt câm.
	// Trường đúng tên là `envVars`, KHÔNG phải `env`. Dùng `env` thì TypeScript
	// không kêu nhưng SDK bỏ qua im lặng — uvicorn chạy mà không có khoá nào,
	// và mọi tính năng AI tắt câm dù `wrangler secret` đã đặt đúng.
	// Đặt ở cấp sandbox để mọi tiến trình sau này cũng thấy.
	const secretEnv: Record<string, string> = {
		PYTHONUNBUFFERED: '1',
		PYTHONIOENCODING: 'utf-8',
	}
	if (env.LLM_API_KEY) secretEnv.VYLING_LLM_API_KEY = env.LLM_API_KEY
	if (env.ADMIN_PASSWORD) secretEnv.VYLING_ADMIN_PASSWORD = env.ADMIN_PASSWORD
	if (env.SMTP_PASSWORD) secretEnv.VYLING_SMTP_PASSWORD = env.SMTP_PASSWORD
	if (env.GOOGLE_CLIENT_SECRET) secretEnv.VYLING_GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
	if (env.FACEBOOK_APP_SECRET) secretEnv.VYLING_FACEBOOK_APP_SECRET = env.FACEBOOK_APP_SECRET

	await sandbox.setEnvVars(secretEnv)
	await sandbox.startProcess(
		`python3 -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
		{ cwd: '/app', env: secretEnv },
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
