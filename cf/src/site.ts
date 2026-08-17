const WORKER_PREFIXES = ['/api/', '/cf/', '/media/', '/mcp', '/agents/']

const IMMUTABLE = /^\/assets\//
const HAS_EXT = /\.[a-z0-9]{2,5}$/i

export function isWorkerPath(path: string): boolean {
	return WORKER_PREFIXES.some((p) => path === p.replace(/\/$/, '') || path.startsWith(p))
}

function keyFor(path: string): string {
	const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
	if (!clean) return 'index.html'
	return HAS_EXT.test(clean) ? clean : `${clean}/index.html`
}

function headersFor(path: string, object: R2ObjectBody): Headers {
	const headers = new Headers()
	object.writeHttpMetadata(headers)
	headers.set('etag', object.httpEtag)
	if (IMMUTABLE.test(path)) {
		headers.set('Cache-Control', 'public, max-age=31536000, immutable')
	} else {
		headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
	}
	headers.set('X-Vyling-Static', 'r2')
	return headers
}

export async function serveStatic(
	env: Env,
	request: Request,
	ctx?: ExecutionContext,
): Promise<Response | null> {
	if (!env.SITE) return null
	if (request.method !== 'GET' && request.method !== 'HEAD') return null

	const path = new URL(request.url).pathname
	if (isWorkerPath(path)) return null

	const cacheable = IMMUTABLE.test(path)
	const cache = caches.default

	if (cacheable) {
		const hit = await cache.match(request).catch(() => undefined)
		if (hit) return hit
	}

	const object = await env.SITE.get(keyFor(path)).catch(() => null)
	if (object) {
		const res = new Response(request.method === 'HEAD' ? null : object.body, {
			headers: headersFor(path, object),
		})
		if (cacheable && request.method === 'GET' && ctx) {
			ctx.waitUntil(cache.put(request, res.clone()))
		}
		return res
	}

	if (HAS_EXT.test(path)) return null

	const shell = await env.SITE.get('index.html').catch(() => null)
	if (!shell) return null
	return new Response(request.method === 'HEAD' ? null : shell.body, {
		headers: headersFor('/', shell),
	})
}
