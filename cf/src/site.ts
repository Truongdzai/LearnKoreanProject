const WORKER_PREFIXES = ['/api/', '/cf/', '/media/', '/mcp', '/agents/']

const IMMUTABLE = /^\/assets\//
const HAS_EXT = /\.[a-z0-9]{2,5}$/i

export function isWorkerPath(path: string): boolean {
	return WORKER_PREFIXES.some((p) => path === p.replace(/\/$/, '') || path.startsWith(p))
}

function keyFor(path: string): string {
	let raw = path
	try {
		raw = decodeURIComponent(path)
	} catch {
	}
	const clean = raw.replace(/^\/+/, '').replace(/\/+$/, '')
	if (!clean) return 'index.html'
	return HAS_EXT.test(clean) ? clean : `${clean}/index.html`
}

const MEDIA_CACHE = /^\/(wordimg|audio|cosmetics|img|icons)\//

function headersFor(path: string, object: R2Object): Headers {
	const headers = new Headers()
	object.writeHttpMetadata(headers)
	headers.set('etag', object.httpEtag)
	if (IMMUTABLE.test(path)) {
		headers.set('Cache-Control', 'public, max-age=31536000, immutable')
	} else if (MEDIA_CACHE.test(path)) {
		headers.set('Cache-Control', 'public, max-age=604800')
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

	const wantsRange = request.headers.has('range')
	const cacheable = !wantsRange && (IMMUTABLE.test(path) || MEDIA_CACHE.test(path))
	const cache = caches.default

	if (cacheable) {
		const hit = await cache.match(request).catch(() => undefined)
		if (hit) return hit
	}

	const object = await env.SITE
		.get(keyFor(path), wantsRange ? { range: request.headers } : undefined)
		.catch(() => null)

	if (object) {
		const headers = headersFor(path, object)
		headers.set('accept-ranges', 'bytes')

		let status = 200
		const part = object.range as { offset?: number; length?: number } | undefined
		if (wantsRange && part && typeof part.offset === 'number' && typeof part.length === 'number') {
			headers.set('content-range', `bytes ${part.offset}-${part.offset + part.length - 1}/${object.size}`)
			status = 206
		}

		const res = new Response(request.method === 'HEAD' ? null : object.body, { status, headers })
		if (cacheable && status === 200 && request.method === 'GET' && ctx) {
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
