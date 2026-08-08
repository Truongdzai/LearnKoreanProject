import { splitWords } from './speechDiff'
import { expandSounds, isToneTok, isVowelTok, nearCost } from '@/data/phoneCoach'

export type CellState = 'ok' | 'sub' | 'miss' | 'extra'

export interface PhoneCell {
  want: string
  got: string
  state: CellState
  cost: number
  ai: number
  atEnd: boolean
}

export interface WordCheck {
  target: string
  known: boolean
  cells: PhoneCell[]
  score: number
}

export interface SoundIssue {
  want: string
  got: string
  state: Exclude<CellState, 'ok'>
  words: string[]
  count: number
  atEnd: boolean
}

export interface SoundReport {
  score: number
  words: WordCheck[]
  issues: SoundIssue[]
  covered: boolean
  skipped: string[]
}

export interface SoundSource {
  lang: string
  phones: (word: string) => string[]
  read: (word: string) => string
}

const HANGUL = /[가-힣]/

export function soundsOf(src: SoundSource, word: string): string[] {
  return expandSounds(src.lang, src.phones(word))
}

export function hasSounds(src: SoundSource, word: string): boolean {
  if (!word.trim()) return false
  if (src.lang === 'ko') return HANGUL.test(word)
  return !!src.read(word).trim()
}

function gapCost(lang: string, tok: string): number {
  if (isToneTok(lang, tok)) return 0.6
  return isVowelTok(lang, tok) ? 1 : 0.8
}

function cell(want: string, got: string, state: CellState, cost: number, ai: number): PhoneCell {
  return { want, got, state, cost, ai, atEnd: false }
}

export function alignPhones(lang: string, a: string[], b: string[]): { cells: PhoneCell[]; cost: number } {
  const m = a.length
  const n = b.length
  if (!m || !n) {
    const cells = m
      ? a.map((t, i) => cell(t, '', 'miss', gapCost(lang, t), i))
      : b.map((t) => cell('', t, 'extra', gapCost(lang, t), -1))
    return { cells, cost: cells.reduce((s, c) => s + c.cost, 0) }
  }
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) d[i][0] = d[i - 1][0] + gapCost(lang, a[i - 1])
  for (let j = 1; j <= n; j++) d[0][j] = d[0][j - 1] + gapCost(lang, b[j - 1])
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j - 1] + nearCost(lang, a[i - 1], b[j - 1]),
        d[i - 1][j] + gapCost(lang, a[i - 1]),
        d[i][j - 1] + gapCost(lang, b[j - 1]),
      )
    }
  }
  const out: PhoneCell[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + nearCost(lang, a[i - 1], b[j - 1])) {
      const sub = nearCost(lang, a[i - 1], b[j - 1])
      out.push(cell(a[i - 1], b[j - 1], sub === 0 ? 'ok' : 'sub', sub, i - 1))
      i -= 1
      j -= 1
    } else if (i > 0 && d[i][j] === d[i - 1][j] + gapCost(lang, a[i - 1])) {
      out.push(cell(a[i - 1], '', 'miss', gapCost(lang, a[i - 1]), i - 1))
      i -= 1
    } else {
      out.push(cell('', b[j - 1], 'extra', gapCost(lang, b[j - 1]), -1))
      j -= 1
    }
  }
  return { cells: out.reverse(), cost: d[m][n] }
}

function score(cost: number, span: number): number {
  return Math.max(0, Math.min(1, 1 - cost / Math.max(1, span)))
}

export function checkSounds(src: SoundSource, target: string, heard: string): SoundReport {
  const lang = src.lang
  const tw = splitWords(target, lang)
  const hw = splitWords(heard, lang)
  const words: WordCheck[] = tw.map((w) => ({
    target: w, known: hasSounds(src, w), cells: [], score: 0,
  }))

  const want: string[] = []
  const owner: number[] = []
  const ends = new Set<number>()
  words.forEach((w, wi) => {
    if (!w.known) return
    const toks = soundsOf(src, w.target)
    toks.forEach((t) => { want.push(t); owner.push(wi) })
    if (toks.length) ends.add(want.length - 1)
  })

  const got: string[] = []
  const skipped: string[] = []
  hw.forEach((w) => {
    if (hasSounds(src, w)) soundsOf(src, w).forEach((t) => got.push(t))
    else if (w.trim()) skipped.push(w)
  })

  if (!want.length) {
    return { score: 0, words, issues: [], covered: false, skipped }
  }

  const { cells, cost } = alignPhones(lang, want, got)
  const bag = new Map<string, SoundIssue>()
  const bucket = new Map<number, PhoneCell[]>()
  let at = owner[0] ?? 0

  cells.forEach((c) => {
    if (c.ai >= 0) {
      at = owner[c.ai]
      c.atEnd = ends.has(c.ai)
    }
    const list = bucket.get(at)
    if (list) list.push(c)
    else bucket.set(at, [c])

    if (c.state === 'ok' || !got.length) return
    const k = c.state + '|' + c.want + '|' + c.got
    const hit = bag.get(k)
    const word = words[at]?.target ?? ''
    if (hit) {
      hit.count += 1
      hit.atEnd = hit.atEnd || c.atEnd
      if (word && !hit.words.includes(word)) hit.words.push(word)
      return
    }
    bag.set(k, {
      want: c.want,
      got: c.got,
      state: c.state,
      words: word ? [word] : [],
      count: 1,
      atEnd: c.atEnd,
    })
  })

  words.forEach((w, wi) => {
    const list = bucket.get(wi) ?? []
    w.cells = list
    const span = Math.max(list.filter((c) => c.want).length, list.filter((c) => c.got).length)
    w.score = list.length ? score(list.reduce((s, c) => s + c.cost, 0), span) : 0
  })

  const rank: Record<string, number> = { sub: 0, miss: 1, extra: 2 }
  const issues = Array.from(bag.values()).sort(
    (a, b) => b.count - a.count || rank[a.state] - rank[b.state],
  )

  return {
    score: Math.round(score(cost, Math.max(want.length, got.length)) * 100),
    words,
    issues,
    covered: got.length > 0,
    skipped,
  }
}
