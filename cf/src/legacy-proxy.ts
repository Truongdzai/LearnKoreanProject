import { getSandbox } from '@cloudflare/sandbox'

const SANDBOX_ID = 'vyling-app'

let cachedOrigin: string | null = null
let booting: Promise<string> | null = null

function sandboxFor(env: Env) {
	return getSandbox(env.Sandbox, SANDBOX_ID, {
		transport: 'rpc',
		keepAlive: true,
	})
}

export async function ensureBackend(env: Env): Promise<string> {
	if (cachedOrigin) return cachedOrigin
	if (booting) return booting

	booting = (async () => {
		const port = Number(env.APP_PORT || '8000')
		const sandbox = sandboxFor(env)

		await sandbox.startProcess(
			`python3 -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
			{
				cwd: '/app',
				env: {
					PYTHONUNBUFFERED: '1',
					PYTHONIOENCODING: 'utf-8',
					...(env.LLM_API_KEY ? { VYLING_LLM_API_KEY: env.LLM_API_KEY } : {}),
					...(env.JWT_SECRET ? { VYLING_JWT_SECRET: env.JWT_SECRET } : {}),
				},
			},
		)

		const tunnel = await sandbox.tunnels.get(port)
		cachedOrigin = tunnel.url
		return tunnel.url
	})()

	try {
		return await booting
	} catch (error) {
		booting = null
		cachedOrigin = null
		throw error
	} finally {
		if (cachedOrigin) booting = null
	}
}

function invalidate() {
	cachedOrigin = null
	booting = null
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
