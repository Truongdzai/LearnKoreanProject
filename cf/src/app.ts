import { proxyToSandbox } from '@cloudflare/sandbox'
import { createAgentRouter } from '@flue/runtime/routing'
import { Hono } from 'hono'
import { VylingOps } from './agents/vyling-ops'
import { VylingTutor } from './agents/vyling-tutor'
import { transcribe } from './asr/whisper'
import { proxyToBackend } from './legacy-proxy'
import { VylingMcp } from './mcp/server'

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c, next) => {
	const proxied = await proxyToSandbox(c.req.raw, c.env)
	if (proxied) return proxied
	await next()
})

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

app.all('/mcp', (c) => VylingMcp.serve('/mcp').fetch(c.req.raw, c.env, c.executionCtx as ExecutionContext))
app.all('/sse/*', (c) => VylingMcp.serveSSE('/sse').fetch(c.req.raw, c.env, c.executionCtx as ExecutionContext))

app.route('/agents/vyling-tutor', createAgentRouter(VylingTutor))

app.route('/agents/vyling-ops', createAgentRouter(VylingOps))

app.get('/cf/ping', (c) => c.json({ pong: true, at: new Date().toISOString() }))

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
