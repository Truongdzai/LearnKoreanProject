import { createAgentRouter } from '@flue/runtime/routing'
import { Hono } from 'hono'
import { VylingOps } from './agents/vyling-ops'
import { VylingTutor } from './agents/vyling-tutor'
import { transcribe } from './asr/whisper'
import { createMcpHandler } from 'agents/mcp/server'
import { proxyToBackend, recycleBackend } from './legacy-proxy'
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

app.get('/cf/ping', (c) => c.json({ pong: true, at: new Date().toISOString() }))

// Thay container sau khi deploy code backend mới. Bảo vệ bằng secret
// DEPLOY_TOKEN: đây là nút gây gián đoạn dịch vụ, để mở là ai cũng khởi động
// lại được web. Chưa đặt secret thì endpoint đóng hẳn, không phải mở sẵn.
app.post('/cf/recycle', async (c) => {
	const token = c.env.DEPLOY_TOKEN
	if (!token) return c.json({ detail: 'Chưa cấu hình DEPLOY_TOKEN.' }, 503)
	if (c.req.header('X-Deploy-Token') !== token) return c.json({ detail: 'Không có quyền.' }, 403)
	await recycleBackend(c.env)
	return c.json({ recycled: true, at: new Date().toISOString() })
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
