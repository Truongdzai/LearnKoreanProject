import passages from './english/reading/passages.json'

export type ReadLevel = 'a1' | 'a1p' | 'a2'

export interface ReadGloss {
  w: string
  ipa: string
  vi: string
}

export interface ReadQuestion {
  q: string
  options: string[]
  answer: number
  explainVi: string
}

export interface ReadPassage {
  id: string
  level: ReadLevel
  emoji: string
  title: string
  titleVi: string
  topic: string
  minutes: number
  text: string[]
  glossary: ReadGloss[]
  questions: ReadQuestion[]
}

export const PASSAGES = passages as ReadPassage[]

export const READ_PASS = 67

export const READ_LEVELS: { id: ReadLevel; name: string; sub: string; tone: string }[] = [
  { id: 'a1', name: 'A1', sub: 'Câu ngắn, thì hiện tại', tone: 'tone-a' },
  { id: 'a1p', name: 'A1+', sub: 'Có quá khứ, câu dài hơn', tone: 'tone-c' },
  { id: 'a2', name: 'A2', sub: 'Kể chuyện, có ý ẩn', tone: 'tone-e' },
]

export function wordCount(p: ReadPassage): number {
  return p.text.join(' ').split(/\s+/).filter(Boolean).length
}

export function passagesAt(level: ReadLevel): ReadPassage[] {
  return PASSAGES.filter((p) => p.level === level)
}

const PUNCT = /[.,!?;:"'“”‘’()]/g

export function distinctWords(p: ReadPassage): number {
  const seen = new Set<string>()
  for (const raw of p.text.join(' ').split(/\s+/)) {
    const w = raw.replace(PUNCT, '').toLowerCase()
    if (w) seen.add(w)
  }
  return seen.size
}

export function newWordPct(p: ReadPassage): number {
  const total = distinctWords(p)
  if (!total) return 0
  return Math.round((p.glossary.length / total) * 100)
}
