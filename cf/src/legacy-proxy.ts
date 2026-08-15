import { getSandbox } from '@cloudflare/sandbox'

const SANDBOX_ID = 'vyling-app'

let cachedOrigin: string | null = null
let booting: Promise<string> | null = null

export async function ensureBackend(env: Env, request: Request): Promise<string> {
	if (cachedOrigin) return cachedOrigin
	if (booting) return booting

	booting = (async () => {
		const port = Number(env.APP_PORT || '8000')
		const sandbox = getSandbox(env.Sandbox, SANDBOX_ID, {
			keepAlive: true,
			normalizeId: true,
		})

		const server = await sandbox.startProcess(
			`python -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
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

		await server.waitForPort(port, {
			path: '/api/health',
			status: { min: 200, max: 499 },
			timeout: 120_000,
		})

		const { url } = await sandbox.exposePort(port, {
			hostname: new URL(request.url).hostname,
			token: 'app',
		})
		cachedOrigin = url
		return url
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

export async function proxyToBackend(request: Request, env: Env): Promise<Response> {
	const origin = await ensureBackend(env, request)
	const incoming = new URL(request.url)
	const target = new URL(incoming.pathname + incoming.search, origin)

	const headers = new Headers(request.headers)
	headers.set('X-Forwarded-Host', incoming.host)
	headers.set('X-Forwarded-Proto', incoming.protocol.replace(':', ''))

	return fetch(
		new Request(target, {
			method: request.method,
			headers,
			body: request.body,
			redirect: 'manual',
		}),
	)
}
