const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 25

const hits = new Map<string, number[]>()

export function clientKey(req: Request): string {
	return (
		req.headers.get('CF-Connecting-IP') ||
		req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
		'unknown'
	)
}

export function overLimit(key: string): boolean {
	const now = Date.now()
	const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
	if (recent.length >= MAX_PER_WINDOW) {
		hits.set(key, recent)
		return true
	}
	recent.push(now)
	hits.set(key, recent)
	if (hits.size > 5000) {
		for (const [k, v] of hits) {
			if (!v.length || now - v[v.length - 1] > WINDOW_MS) hits.delete(k)
		}
	}
	return false
}

export const limitPerMinute = MAX_PER_WINDOW
