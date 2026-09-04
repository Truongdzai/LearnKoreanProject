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

export interface PronVoicing {
  off: string
  on: string
  offWord: string
  offIpa: string
  offVi: string
  onWord: string
  onIpa: string
  onVi: string
}

export interface PronSyllable {
  w: string
  ipa: string
  vi: string
  parts: string[]
  hit: number
}

export interface PronClassPair {
  base: string
  nounIpa: string
  nounVi: string
  verbIpa: string
  verbVi: string
  nounParts: string[]
  verbParts: string[]
  sent: string
  vi: string
}

export interface PronFamily {
  note: string
  items: PronSyllable[]
}

export interface PronShift {
  at: number
  mean: string
}

export interface PronFocus {
  words: string[]
  vi: string
  content: number[]
  shifts: PronShift[]
}

export interface PronGroup {
  id: string
  title: string
  sub: string
  why: string
  tip: string
  pairs?: PronPair[]
  words?: PronWord[]
  voicing?: PronVoicing[]
  syllables?: PronSyllable[]
  classPairs?: PronClassPair[]
  families?: PronFamily[]
  focus?: PronFocus[]
  sentences: PronSentence[]
}

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

