const SOURCE = 'https://api.dictionaryapi.dev/api/v2/entries/en/'
const PREFIX = 'dict/en/'
const TIMEOUT_MS = 4000
const MAX_SENSES = 6

export interface DictSense {
	pos: string
	def: string
	ex?: string
}

export interface EdgeDict {
	word: string
	ipa: string
	audio: string
	senses: DictSense[]
	syn: string[]
}

export function cleanWord(raw: string): string {
	const w = (raw || '').trim().toLowerCase().replace(/[’]/g, "'")
	return /^[a-z][a-z'-]{0,38}$/.test(w) ? w : ''
}

interface ApiPhonetic { text?: string; audio?: string }
interface ApiDefinition { definition?: string; example?: string; synonyms?: string[] }
interface ApiMeaning { partOfSpeech?: string; definitions?: ApiDefinition[]; synonyms?: string[] }
interface ApiEntry { word?: string; phonetic?: string; phonetics?: ApiPhonetic[]; meanings?: ApiMeaning[] }

function shrink(raw: unknown, word: string): EdgeDict | null {
	if (!Array.isArray(raw) || raw.length === 0) return null
	const entries = raw as ApiEntry[]

	let ipa = ''
	let audio = ''
	for (const e of entries) {
		for (const p of e.phonetics ?? []) {
			if (!ipa && p.text) ipa = p.text
			if (!audio && p.audio) audio = p.audio
		}
		if (!ipa && e.phonetic) ipa = e.phonetic
	}

	const senses: DictSense[] = []
	const syn = new Set<string>()
	for (const e of entries) {
		for (const m of e.meanings ?? []) {
			for (const s of m.synonyms ?? []) syn.add(s)
			for (const d of m.definitions ?? []) {
				if (!d.definition || senses.length >= MAX_SENSES) continue
				senses.push({
					pos: m.partOfSpeech ?? '',
					def: d.definition,
					...(d.example ? { ex: d.example } : {}),
				})
				for (const s of d.synonyms ?? []) syn.add(s)
			}
		}
	}
	if (!senses.length) return null

	return { word: entries[0].word || word, ipa, audio, senses, syn: Array.from(syn).slice(0, 8) }
}

async function fromSource(word: string): Promise<EdgeDict | null> {
	try {
		const res = await fetch(SOURCE + encodeURIComponent(word), {
			signal: AbortSignal.timeout(TIMEOUT_MS),
		})
		if (!res.ok) return null
		return shrink(await res.json(), word)
	} catch {
		return null
	}
}

export async function lookupEn(
	env: Env,
	raw: string,
	ctx: ExecutionContext,
): Promise<EdgeDict | null> {
	const word = cleanWord(raw)
	if (!word) return null

	if (env.LESSONS) {
		const hit = await env.LESSONS.get(PREFIX + word + '.json').catch(() => null)
		if (hit) return (await hit.json()) as EdgeDict
	}

	const found = await fromSource(word)
	if (!found) return null

	if (env.LESSONS) {
		ctx.waitUntil(
			env.LESSONS.put(PREFIX + word + '.json', JSON.stringify(found), {
				httpMetadata: { contentType: 'application/json; charset=utf-8' },
			}).catch(() => {}),
		)
	}
	return found
}
