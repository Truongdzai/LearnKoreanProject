import sounds from './english/pronunciation/sounds.json'

export interface PronPair {
  a: string
  aIpa: string
  aVi: string
  b: string
  bIpa: string
  bVi: string
}

export interface PronWord {
  w: string
  ipa: string
  vi: string
}

export interface PronSentence {
  en: string
  vi: string
}

export interface PronGroup {
  id: string
  emoji: string
  title: string
  sub: string
  why: string
  tip: string
  pairs?: PronPair[]
  words?: PronWord[]
  sentences: PronSentence[]
}

export const PRON_GROUPS = sounds as PronGroup[]

export const PRON_PASS = 70

export function pronWords(g: PronGroup): PronWord[] {
  if (g.words) return g.words
  const out: PronWord[] = []
  for (const p of g.pairs ?? []) {
    out.push({ w: p.a, ipa: p.aIpa, vi: p.aVi })
    out.push({ w: p.b, ipa: p.bIpa, vi: p.bVi })
  }
  return out
}

const STRIP = /[^a-z' ]/g
const STRIP_KO = /[^가-힣 ]/g

export function normalizeSpoken(s: string, lang = 'en'): string {
  if (lang === 'ko') return s.replace(STRIP_KO, ' ').replace(/\s+/g, ' ').trim()
  return s.toLowerCase().replace(/[’]/g, "'").replace(STRIP, ' ').replace(/\s+/g, ' ').trim()
}

export function scoreSpoken(target: string, heard: string, lang = 'en'): number {
  if (lang === 'ko') {
    const w = normalizeSpoken(target, 'ko').replace(/ /g, '')
    const g = normalizeSpoken(heard, 'ko').replace(/ /g, '')
    if (!w || !g) return 0
    if (w === g) return 100
    let hit = 0
    const pool = [...g]
    for (const ch of w) {
      const i = pool.indexOf(ch)
      if (i >= 0) { hit += 1; pool.splice(i, 1) }
    }
    const penalty = Math.max(0, g.length - w.length) * 0.5
    return Math.max(0, Math.round(((hit - penalty) / w.length) * 100))
  }
  const want = normalizeSpoken(target).split(' ').filter(Boolean)
  const got = normalizeSpoken(heard).split(' ').filter(Boolean)
  if (!want.length || !got.length) return 0
  const pool = [...got]
  let hit = 0
  for (const w of want) {
    const i = pool.indexOf(w)
    if (i >= 0) { hit += 1; pool.splice(i, 1) }
  }
  return Math.round((hit / want.length) * 100)
}
