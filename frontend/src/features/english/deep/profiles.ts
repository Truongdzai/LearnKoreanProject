import type {
  ProfileCombo, ProfilePos, ProfileSense, WordProfile,
} from '@/models/wordprofile.model'
import { wordEntry } from '@/data/englishActive'
import { fetchWordProfile } from '@/core/api/english.api'
import index from '@/data/english/profiles/index.json'

const SHARDS = import.meta.glob<Record<string, WordProfile>>(
  '../../../data/english/profiles/*.json',
  { import: 'default' },
)

const STATIC_WORDS = new Set<string>((index as { words?: string[] }).words ?? [])

export const STATIC_PROFILE_COUNT = STATIC_WORDS.size

export interface RichWord {
  term: string
  n: number
}

export const RICHEST_WORDS: RichWord[] = ((index as { top?: RichWord[] }).top ?? []).filter(
  (w) => w && typeof w.term === 'string' && typeof w.n === 'number',
)

const memory = new Map<string, WordProfile | null>()
const shardCache = new Map<string, Promise<Record<string, WordProfile>>>()

const BLANK: Omit<WordProfile, 'term'> = {
  ipa: '', level: '', core: '', grammar: '',
  senses: [], family: [], combos: [], phrasals: [], idioms: [],
  synonyms: [], antonyms: [], confuse: [], mistakes: [],
}

function shardName(term: string): string {
  const head = term[0]
  return head >= 'a' && head <= 'z' ? head : 'other'
}

function loadShard(name: string): Promise<Record<string, WordProfile>> {
  const hit = shardCache.get(name)
  if (hit) return hit
  const key = Object.keys(SHARDS).find((k) => k.endsWith(`/${name}.json`))
  const task = key
    ? SHARDS[key]().then((m) => m ?? {}).catch(() => ({}))
    : Promise.resolve({})
  shardCache.set(name, task)
  return task
}

export function hasStaticProfile(term: string): boolean {
  return STATIC_WORDS.has(term.trim().toLowerCase())
}

function posOfEntry(raw: string): ProfilePos {
  const low = raw.toLowerCase()
  if (low.includes('động từ')) return 'verb'
  if (low.includes('tính từ')) return 'adj'
  if (low.includes('trạng từ')) return 'adverb'
  if (low.includes('giới từ')) return 'prep'
  if (low.includes('danh từ')) return 'noun'
  return 'other'
}

export function curatedProfile(term: string): WordProfile | null {
  const entry = wordEntry(term.trim().toLowerCase())
  if (!entry) return null
  const pos = posOfEntry(entry.pos)
  const senses: ProfileSense[] = entry.senses.map((s, i) => ({
    pos,
    vi: s.vi,
    en: '',
    freq: Math.max(1, 5 - Math.floor(i / 2)),
    reg: '',
    ex: s.ex,
    exVi: s.exVi,
    ex2: '',
    ex2Vi: '',
  }))
  const combos: ProfileCombo[] = entry.combos.map((g) => ({
    label: g.label,
    note: g.note ?? '',
    items: g.items.map((it) => ({ form: it.form, vi: it.vi, ex: it.ex })),
  }))
  return { ...BLANK, term, ipa: entry.ipa, core: entry.core, senses, combos }
}

function sameForm(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function glossParts(vi: string): string[] {
  return vi
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .split(/[,;/·]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 1)
}

function sameSense(a: string, b: string): boolean {
  const left = glossParts(a)
  const right = glossParts(b)
  return left.some((p) => right.includes(p))
}

export function mergeProfiles(curated: WordProfile | null, ai: WordProfile | null): WordProfile | null {
  if (!curated) return ai
  if (!ai) return curated

  const extraSenses = ai.senses.filter((s) => !curated.senses.some((c) => sameSense(c.vi, s.vi)))
  const combos = [...curated.combos]
  for (const g of ai.combos) {
    const items = g.items.filter(
      (it) => !combos.some((cg) => cg.items.some((ci) => sameForm(ci.form, it.form))),
    )
    if (items.length) combos.push({ ...g, items })
  }

  return {
    ...ai,
    term: curated.term,
    ipa: curated.ipa || ai.ipa,
    core: curated.core || ai.core,
    senses: [...curated.senses, ...extraSenses],
    combos,
  }
}

export async function loadProfile(term: string, pos = '', vi = ''): Promise<WordProfile | null> {
  const key = term.trim().toLowerCase()
  if (!key) return null

  const cached = memory.get(key)
  if (cached !== undefined) return cached

  const curated = curatedProfile(key)
  let ai: WordProfile | null = null

  if (STATIC_WORDS.has(key)) {
    const shard = await loadShard(shardName(key))
    ai = shard[key] ?? null
  }

  if (!ai) {
    try {
      const res = await fetchWordProfile(term, pos, vi)
      ai = res.profile
    } catch {
      ai = null
    }
  }

  const merged = mergeProfiles(curated, ai)
  memory.set(key, merged)
  return merged
}

export function peekProfile(term: string): WordProfile | null {
  const key = term.trim().toLowerCase()
  const hit = memory.get(key)
  return hit === undefined ? curatedProfile(key) : hit
}

export interface SenseSlot {
  sense: ProfileSense
  i: number
}

export function senseGroups(profile: WordProfile): { pos: ProfilePos; senses: SenseSlot[] }[] {
  const order: ProfilePos[] = ['verb', 'noun', 'adj', 'adverb', 'prep', 'phrase', 'other']
  const bag = new Map<ProfilePos, SenseSlot[]>()
  profile.senses.forEach((sense, i) => {
    const key = order.includes(sense.pos) ? sense.pos : 'other'
    const list = bag.get(key)
    if (list) list.push({ sense, i })
    else bag.set(key, [{ sense, i }])
  })
  return order.filter((p) => bag.has(p)).map((p) => ({ pos: p, senses: bag.get(p) ?? [] }))
}

export const POS_VI: Record<ProfilePos, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adj: 'Tính từ',
  adverb: 'Trạng từ',
  prep: 'Giới từ',
  phrase: 'Cụm từ',
  other: 'Cách dùng khác',
}
