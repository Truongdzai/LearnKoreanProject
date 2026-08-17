import { getSandbox, type Sandbox } from '@cloudflare/sandbox'
import { isBackendDown, waitingResponse } from './waiting'

const DEFAULT_SANDBOX_ID = 'vyling-app'

let cachedOrigin: string | null = null

function sandboxFor(env: Env) {
	const ns = env.Sandbox as unknown as DurableObjectNamespace<Sandbox>
	return getSandbox(ns, env.SANDBOX_ID || DEFAULT_SANDBOX_ID, {
		keepAlive: false,
		sleepAfter: '15m',
	})
}

async function originAlive(url: string): Promise<boolean> {
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(15_000) })
			if (res.status < 500) return true
		} catch {
		}
	}
	return false
}

export async function ensureBackend(env: Env): Promise<string> {
	if (cachedOrigin) return cachedOrigin

	const port = Number(env.APP_PORT || '8000')
	const sandbox = sandboxFor(env)

	const running = await sandbox.tunnels.list().catch(() => [])
	const existing = running.find((t) => t.port === port)
	if (existing?.url) {
		if (await originAlive(existing.url)) {
			cachedOrigin = existing.url
			return existing.url
		}
		await sandbox.tunnels.destroy(port).catch(() => {})
	}

	const secretEnv: Record<string, string> = {
		PYTHONUNBUFFERED: '1',
		PYTHONIOENCODING: 'utf-8',
		APP_PORT: String(port),
	}
	if (env.LLM_API_KEY) secretEnv.VYLING_LLM_API_KEY = env.LLM_API_KEY
	if (env.ADMIN_PASSWORD) secretEnv.VYLING_ADMIN_PASSWORD = env.ADMIN_PASSWORD
	if (env.SMTP_PASSWORD) secretEnv.VYLING_SMTP_PASSWORD = env.SMTP_PASSWORD
	if (env.GOOGLE_CLIENT_SECRET) secretEnv.VYLING_GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
	if (env.FACEBOOK_APP_SECRET) secretEnv.VYLING_FACEBOOK_APP_SECRET = env.FACEBOOK_APP_SECRET

	if (env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_ACCOUNT_ID) {
		secretEnv.LITESTREAM_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID
		secretEnv.LITESTREAM_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY
		secretEnv.LITESTREAM_ENDPOINT = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
		secretEnv.LITESTREAM_BUCKET = env.DB_BUCKET || 'vyling-db'
	}

	await sandbox.setEnvVars(secretEnv)
	const proc = await sandbox.startProcess('/app/start-backend.sh', {
		cwd: '/app',
		env: secretEnv,
	})

	await proc
		.waitForPort(port, { path: '/api/health', status: { min: 200, max: 499 } })
		.catch(() => {})

	const tunnel = await sandbox.tunnels.get(port)
	cachedOrigin = tunnel.url
	return tunnel.url
}

function invalidate() {
	cachedOrigin = null
}

export async function recycleBackend(env: Env): Promise<void> {
	invalidate()
	await sandboxFor(env).destroy()
}

function why(e: unknown): string {
	return e instanceof Error ? `${e.name}: ${e.message}` : String(e)
}

export async function backendLogs(env: Env): Promise<string> {
	const out: string[] = []

	out.push('### worker thay gi')
	out.push(`R2_ACCESS_KEY_ID=${env.R2_ACCESS_KEY_ID ? 'SET' : 'EMPTY'}`)
	out.push(`R2_SECRET_ACCESS_KEY=${env.R2_SECRET_ACCESS_KEY ? 'SET' : 'EMPTY'}`)
	out.push(`R2_ACCOUNT_ID=${env.R2_ACCOUNT_ID ? 'SET' : 'EMPTY'}`)

	let sandbox: ReturnType<typeof sandboxFor>
	try {
		sandbox = sandboxFor(env)
	} catch (e) {
		out.push(`(khong lay duoc sandbox: ${why(e)})`)
		return out.join('\n')
	}

	out.push('### tunnel')
	try {
		const list = await sandbox.tunnels.list()
		if (!list.length) out.push('(khong co tunnel nao)')
		for (const t of list) {
			out.push(`port=${t.port} url=${t.url}`)
			if (t.url) {
				try {
					const res = await fetch(`${t.url}/api/health`, { signal: AbortSignal.timeout(15_000) })
					out.push(`  probe -> ${res.status}`)
				} catch (e) {
					out.push(`  probe -> hong: ${why(e)}`)
				}
			}
		}
	} catch (e) {
		out.push(`(khong liet ke duoc tunnel: ${why(e)})`)
	}

	out.push('### container thay gi')
	try {
		const probe = await sandbox.exec(
			'sh -c "command -v litestream || echo LITESTREAM_MISSING;' +
			' echo ACCESS=${LITESTREAM_ACCESS_KEY_ID:+SET};' +
			' echo SECRET=${LITESTREAM_SECRET_ACCESS_KEY:+SET};' +
			' echo ENDPOINT=${LITESTREAM_ENDPOINT:+SET};' +
			' echo BUCKET=${LITESTREAM_BUCKET:+SET}"',
		)
		out.push(String(probe?.stdout ?? '').trim())
		const err = String(probe?.stderr ?? '').trim()
		if (err) out.push('stderr: ' + err)
	} catch (e) {
		out.push(`(probe hong: ${why(e)})`)
	}

	out.push('### tien trinh')
	try {
		const procs = await sandbox.listProcesses()
		for (const p of procs) {
			out.push(`--- ${p.id} — ${p.command} [${p.status}]`)
			try {
				const logs = await sandbox.getProcessLogs(p.id)
				if (logs.stdout) out.push(logs.stdout.slice(-5000))
				if (logs.stderr) out.push('stderr:', logs.stderr.slice(-3000))
			} catch (e) {
				out.push(`(khong doc duoc log: ${why(e)})`)
			}
		}
	} catch (e) {
		out.push(`(khong liet ke duoc tien trinh: ${why(e)})`)
	}

	return out.join('\n')
}

export async function backendReady(env: Env): Promise<boolean> {
	const port = Number(env.APP_PORT || '8000')
	try {
		const running = await sandboxFor(env).tunnels.list()
		const url = running.find((t) => t.port === port)?.url
		if (!url) return false
		if (!(await originAlive(url))) return false
		cachedOrigin = url
		return true
	} catch {
		return false
	}
}

const MAX_BUFFER = 12 * 1024 * 1024
const RETRY_PAUSE_MS = 2500

function pause(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, RETRY_PAUSE_MS))
}

export async function proxyToBackend(request: Request, env: Env): Promise<Response> {
	const incoming = new URL(request.url)

	let body: ArrayBuffer | null = null
	if (request.body) {
		const len = Number(request.headers.get('content-length') || '0')
		if (len > 0 && len <= MAX_BUFFER) {
			try {
				body = await request.arrayBuffer()
			} catch {
			}
		}
	}
	const streaming = !!request.body && body === null

	for (let attempt = 0; attempt < 2; attempt++) {
		const canRetry = attempt === 0 && !streaming

		let origin: string
		try {
			origin = await ensureBackend(env)
		} catch {
			invalidate()
			if (!canRetry) return waitingResponse(request)
			await pause()
			continue
		}

		const target = new URL(incoming.pathname + incoming.search, origin)
		const headers = new Headers(request.headers)
		headers.set('X-Forwarded-Host', incoming.host)
		headers.set('X-Forwarded-Proto', incoming.protocol.replace(':', ''))

		try {
			const res = await fetch(
				new Request(target, {
					method: request.method,
					headers,
					body: body ?? request.body,
					redirect: 'manual',
				}),
			)
			if (isBackendDown(res)) {
				invalidate()
				if (!canRetry) return waitingResponse(request)
				await pause()
				continue
			}
			return res
		} catch {
			invalidate()
			if (!canRetry) return waitingResponse(request)
			await pause()
		}
	}

	return waitingResponse(request)
}
