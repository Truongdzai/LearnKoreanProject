import { UNITS } from '@/data/englishCore'
import { wTerm, type IcesWord, type VocabUnit } from '@/data/vocabCore'
import { ukIpa } from '@/core/ukIpa'
import { ALL_CHUNKS, wordEntry, type ActiveChunk, type WordEntry } from '@/data/englishActive'
import wordImages from '@/data/english/wordImages.json'

export interface DeepWord {
  term: string
  w: IcesWord
  unit: VocabUnit
  us: string
  uk: string
}

const INDEX = new Map<string, DeepWord>()
for (const unit of UNITS) {
  for (const w of unit.words) {
    const term = wTerm(w)
    const key = term.toLowerCase()
    if (!term || INDEX.has(key)) continue
    const us = w.ipa ?? ''
    INDEX.set(key, { term, w, unit, us, uk: ukIpa(term, us) })
  }
}

export const DEEP_WORD_COUNT = INDEX.size

export function findDeepWord(term: string): DeepWord | null {
  return INDEX.get(term.trim().toLowerCase()) ?? null
}

export function suggestWords(limit = 12): DeepWord[] {
  const out: DeepWord[] = []
  for (const dw of INDEX.values()) {
    out.push(dw)
    if (out.length >= limit) break
  }
  return out
}

function forms(term: string): string[] {
  const t = term.toLowerCase()
  const stem = t.endsWith('e') ? t.slice(0, -1) : t
  const dbl = t + t[t.length - 1]
  return [...new Set([
    t, `${t}s`, `${t}es`, `${t}d`, `${t}ed`, `${t}ing`,
    `${stem}ing`, `${stem}ed`, `${dbl}ing`, `${dbl}ed`,
  ])].filter(Boolean)
}

function hasWord(text: string, term: string): boolean {
  const low = text.toLowerCase()
  return forms(term).some((f) => new RegExp(`(^|[^a-z'])${f}([^a-z']|$)`).test(low))
}

export interface DeepExample {
  en: string
  vi: string
  from: string
}

export function corpusExamples(term: string, limit = 20): DeepExample[] {
  const out: DeepExample[] = []
  const seen = new Set<string>()

  const push = (en: string, vi: string, from: string) => {
    const key = en.trim().toLowerCase()
    if (!en || seen.has(key) || out.length >= limit) return
    seen.add(key)
    out.push({ en, vi, from })
  }

  const self = findDeepWord(term)
  if (self) push(self.w.ex, self.w.exVi, self.unit.name)

  for (const c of ALL_CHUNKS) {
    if (hasWord(c.say, term)) push(c.say, c.cue, 'Câu mẫu tình huống')
  }

  for (const unit of UNITS) {
    for (const w of unit.words) {
      if (wTerm(w).toLowerCase() === term.toLowerCase()) continue
      if (hasWord(w.ex, term)) push(w.ex, w.exVi, unit.name)
    }
    if (out.length >= limit) break
  }

  return out
}

export interface DeepCollocation {
  form: string
  vi: string
  ex: string
  group: string
}

export function localCollocations(term: string): DeepCollocation[] {
  const entry: WordEntry | undefined = wordEntry(term.toLowerCase())
  const out: DeepCollocation[] = []
  if (entry) {
    for (const g of entry.combos) {
      for (const it of g.items) out.push({ form: it.form, vi: it.vi, ex: it.ex, group: g.label })
    }
  }
  return out
}

const COLLOC_STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those',
])

const FUNCTION_WORDS = new Set([
  'at', 'of', 'in', 'on', 'for', 'to', 'with', 'by', 'from', 'into', 'about',
  'has', 'have', 'had', 'is', 'are', 'was', 'were', 'be', 'been', 'am',
  'and', 'or', 'but', 'so', 'if', 'than', 'then', 'as', 'there', 'here',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
])

function usablePhrase(phrase: string, term: string): boolean {
  const parts = phrase.split(' ')
  if (parts.length < 2 || parts.length > 3) return false
  if (FUNCTION_WORDS.has(parts[0])) return false
  if (FUNCTION_WORDS.has(parts[parts.length - 1])) return false
  const set = new Set(forms(term))
  const at = parts.findIndex((p) => set.has(p))
  return at === 0 || at === parts.length - 1
}

function windows(sentence: string, term: string): string[] {
  const words = sentence.toLowerCase().match(/[a-z']+/g) ?? []
  const set = new Set(forms(term))
  const out: string[] = []
  for (let i = 0; i < words.length; i++) {
    if (!set.has(words[i])) continue
    for (const [from, to] of [[i - 2, i], [i - 1, i], [i, i + 1], [i, i + 2]]) {
      if (from < 0 || to >= words.length || from === to) continue
      const slice = words.slice(from, to + 1)
      if (slice.length < 2) continue
      if (COLLOC_STOP.has(slice[slice.length - 1])) continue
      out.push(slice.join(' '))
    }
  }
  return out
}

export function minedCollocations(term: string, limit = 10): string[] {
  const count = new Map<string, number>()
  const bump = (text: string) => {
    for (const p of windows(text, term)) count.set(p, (count.get(p) ?? 0) + 1)
  }

  for (const c of ALL_CHUNKS) {
    if (hasWord(c.say, term)) bump(c.say)
    if (hasWord(c.en, term)) bump(c.en)
  }
  for (const unit of UNITS) {
    for (const w of unit.words) {
      if (hasWord(w.ex, term)) bump(w.ex)
      const t = wTerm(w)
      if (t.includes(' ') && hasWord(t, term)) bump(t)
    }
  }

  return [...count.entries()]
    .filter(([p, n]) => n >= 2 && usablePhrase(p, term))
    .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)
    .slice(0, limit)
    .map(([p]) => p)
}

export function chunkUses(term: string): ActiveChunk[] {
  return ALL_CHUNKS.filter((c) => hasWord(c.en, term) || hasWord(c.say, term))
}

export interface DeepSense {
  title: string
  desc: string
  ex: string
  exVi: string
}

export function localSenses(term: string, vi: string, defVi: string, ex: string, exVi: string): DeepSense[] {
  const entry = wordEntry(term.toLowerCase())
  if (entry) {
    return entry.senses.map((s) => ({ title: s.vi, desc: '', ex: s.ex, exVi: s.exVi }))
  }
  return [{ title: vi, desc: defVi, ex, exVi }]
}

const STATIC_IMAGES: Set<string> = new Set(
  ((wordImages as { words?: string[] }).words ?? []).map((w) => w.toLowerCase()),
)

export function staticImage(term: string): string | null {
  const key = term.trim().toLowerCase().replace(/[?:/\\*"<>|]/g, '').trim()
  return STATIC_IMAGES.has(key) ? `/wordimg/${encodeURIComponent(key)}.webp` : null
}

export const STATIC_IMAGE_COUNT = STATIC_IMAGES.size

export function coreNote(term: string): string {
  return wordEntry(term.toLowerCase())?.core ?? ''
}
