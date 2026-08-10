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

export interface SoundSource {
  lang: string
  phones: (word: string) => string[]
  read: (word: string) => string
}

const HANGUL = /[가-힣]/
const MERGED = 0.25

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
      out.push(cell(a[i - 1], b[j - 1], sub <= MERGED ? 'ok' : 'sub', sub, i - 1))
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
