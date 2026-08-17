import { createAgentRouter } from '@flue/runtime/routing'
import { Hono } from 'hono'
import { VylingOps } from './agents/vyling-ops'
import { VylingTutor } from './agents/vyling-tutor'
import { transcribe } from './asr/whisper'
import { createMcpHandler } from 'agents/mcp/server'
import { backendLogs, backendReady, proxyToBackend, recycleBackend } from './legacy-proxy'
import { prebuiltLesson } from './lessons'
import { lookupEn } from './dict'
import { buildMcpServer } from './mcp/server'

const app = new Hono<{ Bindings: Env }>()

app.use('/cf/*', async (c, next) => {
	await next()
	c.header('Access-Control-Allow-Origin', '*')
})
app.options('/cf/*', (c) =>
	c.body(null, 204, {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Max-Age': '86400',
	}),
)

app.all('/mcp', (c) =>
	createMcpHandler(() => buildMcpServer(c.env), { route: '/mcp' })(
		c.req.raw,
		c.env,
		c.executionCtx as ExecutionContext,
	),
)

app.route('/agents/vyling-tutor', createAgentRouter(VylingTutor))

app.route('/agents/vyling-ops', createAgentRouter(VylingOps))

app.get('/cf/ping', (c) =>
	c.json({
		pong: true,
		at: new Date().toISOString(),
		secrets: {
			llm: !!c.env.LLM_API_KEY,
			admin: !!c.env.ADMIN_PASSWORD,
			google: !!c.env.GOOGLE_CLIENT_SECRET,
		},
		sandboxId: c.env.SANDBOX_ID || '(mặc định)',
		transport: c.env.SANDBOX_TRANSPORT || '(mặc định)',
	}),
)

app.get('/cf/ready', async (c) =>
	(await backendReady(c.env))
		? c.json({ ready: true })
		: c.json({ ready: false }, 503, { 'Retry-After': '5', 'Cache-Control': 'no-store' }),
)

app.post('/cf/recycle', async (c) => {
	const token = c.env.DEPLOY_TOKEN
	if (!token) return c.json({ detail: 'Chưa cấu hình DEPLOY_TOKEN.' }, 503)
	if (c.req.header('X-Deploy-Token') !== token) return c.json({ detail: 'Không có quyền.' }, 403)
	await recycleBackend(c.env)
	return c.json({ recycled: true, at: new Date().toISOString() })
})

app.get('/cf/logs', async (c) => {
	const token = c.env.DEPLOY_TOKEN
	if (!token) return c.json({ detail: 'Chưa cấu hình DEPLOY_TOKEN.' }, 503)
	if (c.req.header('X-Deploy-Token') !== token) return c.json({ detail: 'Không có quyền.' }, 403)
	return c.text(await backendLogs(c.env), 200, { 'Cache-Control': 'no-store' })
})

app.post('/cf/asr', async (c) => {
	const lang = c.req.query('lang') ?? 'en'
	try {
		const audio = await c.req.arrayBuffer()
		const result = await transcribe(c.env, audio, lang)
		return c.json(result)
	} catch (error) {
		return c.json({ detail: error instanceof Error ? error.message : String(error) }, 400)
	}
})

app.post('/api/transcript', async (c) => {
	const body = await c.req.raw.text()

	const hit = await prebuiltLesson(c.env, body)
	if (hit) return hit

	const headers = new Headers(c.req.raw.headers)
	headers.delete('content-length')
	return proxyToBackend(
		new Request(c.req.url, { method: 'POST', headers, body }),
		c.env,
	)
})

app.get('/cf/dict', async (c) => {
	const found = await lookupEn(c.env, c.req.query('word') ?? '', c.executionCtx as ExecutionContext)
	if (!found) return c.json({ detail: 'Không tìm thấy từ này.' }, 404)
	return c.json(found, 200, {
		'Cache-Control': 'public, max-age=86400, s-maxage=2592000',
	})
})

app.get('/media/*', async (c) => {
	const key = c.req.path.replace(/^\/media\//, '')
	const object = await c.env.MEDIA.get(key)
	if (!object) return c.notFound()

	const headers = new Headers()
	object.writeHttpMetadata(headers)
	headers.set('etag', object.httpEtag)
	headers.set('Cache-Control', 'public, max-age=604800')
	return new Response(object.body, { headers })
})

app.all('*', (c) => proxyToBackend(c.req.raw, c.env))

export default app
