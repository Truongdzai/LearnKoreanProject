const ID_RE =
	/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([0-9A-Za-z_-]{11})/

export function extractVideoId(url: string): string {
	const raw = (url || '').trim()
	const m = ID_RE.exec(raw)
	if (m) return m[1]
	return /^[0-9A-Za-z_-]{11}$/.test(raw) ? raw : ''
}

export async function prebuiltLesson(env: Env, body: string): Promise<Response | null> {
	if (!env.LESSONS) return null

	let url = ''
	try {
		url = String((JSON.parse(body) as { url?: unknown }).url ?? '')
	} catch {
		return null
	}

	const id = extractVideoId(url)
	if (!id) return null

	const object = await env.LESSONS.get(`${id}.json`).catch(() => null)
	if (!object) return null

	return new Response(object.body, {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
			'X-Vyling-Lesson': 'prebuilt',
		},
	})
}
