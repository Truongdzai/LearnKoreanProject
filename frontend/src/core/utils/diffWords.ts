import { words } from '@/core/segment'

const PUNCT = /[.,!?;:"'`’‘“”()[\]{}~…—–\-*/\\_+=<>@#$%^&|]/g

export function normWord(w: string): string {
  return w.replace(PUNCT, '').replace(/\s+/g, '').toLowerCase()
}

export type DiffKind = 'ok' | 'wrong' | 'miss'

export interface DiffMark {
  word: string
  kind: DiffKind
  typed?: string
}

export interface DiffResult {
  marks: DiffMark[]
  extra: string[]
  correct: number
  total: number
  accuracy: number
}

interface Tok {
  raw: string
  n: string
}

function toks(text: string, lang?: string): Tok[] {
  return words(text, lang)
    .map((w) => ({ raw: w, n: normWord(w) }))
    .filter((t) => t.n.length > 0)
}

type Op = { t: DiffKind | 'extra'; raw: string }

export function diffWords(target: string, typed: string, lang?: string): DiffResult {
  const a = toks(target, lang)
  const b = toks(typed, lang)
  const m = a.length
  const n = b.length

  if (!m) return { marks: [], extra: b.map((t) => t.raw), correct: 0, total: 0, accuracy: 0 }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i].n === b[j].n ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const ops: Op[] = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (a[i].n === b[j].n) {
      ops.push({ t: 'ok', raw: a[i].raw }); i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ t: 'miss', raw: a[i].raw }); i++
    } else {
      ops.push({ t: 'extra', raw: b[j].raw }); j++
    }
  }
  while (i < m) { ops.push({ t: 'miss', raw: a[i].raw }); i++ }
  while (j < n) { ops.push({ t: 'extra', raw: b[j].raw }); j++ }

  const marks: DiffMark[] = []
  const extra: string[] = []
  let k = 0
  while (k < ops.length) {
    if (ops[k].t === 'ok') { marks.push({ word: ops[k].raw, kind: 'ok' }); k++; continue }

    let end = k
    while (end < ops.length && ops[end].t !== 'ok') end++
    const missed = ops.slice(k, end).filter((o) => o.t === 'miss').map((o) => o.raw)
    const added = ops.slice(k, end).filter((o) => o.t === 'extra').map((o) => o.raw)
    missed.forEach((w, idx) => {
      marks.push(idx < added.length ? { word: w, kind: 'wrong', typed: added[idx] } : { word: w, kind: 'miss' })
    })
    if (added.length > missed.length) extra.push(...added.slice(missed.length))
    k = end
  }

  const correct = marks.filter((mk) => mk.kind === 'ok').length
  const accuracy = Math.round((correct / Math.max(m, n)) * 100)
  return { marks, extra, correct, total: m, accuracy: Math.max(0, Math.min(100, accuracy)) }
}

export interface WordSlot {
  raw: string
  bare: string
}

export function wordSlots(target: string, lang?: string): WordSlot[] {
  return words(target, lang)
    .map((w) => ({ raw: w, bare: w.replace(PUNCT, '').replace(/\s+/g, '') }))
    .filter((s) => s.bare.length > 0)
}

export function starLine(target: string, lang?: string): string {
  return wordSlots(target, lang).map((s) => '*'.repeat(s.bare.length)).join(' ')
}

