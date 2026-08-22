import { normWord, splitWords } from './speechDiff'
import { isNoSpaceLang } from '@/core/segment'
import { alignPhones, hasSounds, soundsOf, type PhoneCell, type SoundSource } from './phonemeDiff'
import { buildFix, isToneTok, isVowelTok, phoneLabel, type PhoneFix } from '@/data/phoneCoach'

export type WordState = 'ok' | 'near' | 'wrong' | 'missing' | 'extra'

export type ErrorKind =
  | 'vowel' | 'consonant' | 'both' | 'ending' | 'tone' | 'missing' | 'extra' | 'other'

export interface Deviation {
  want: string
  got: string
  state: 'sub' | 'miss' | 'extra'
  atEnd: boolean
  vowel: boolean
  tone: boolean
}

export interface WordGrade {
  target: string
  heard: string
  state: WordState
  score: number
  known: boolean
  unsure: boolean
  kind: ErrorKind
  cells: PhoneCell[]
  devs: Deviation[]
}

export interface GradeIssue extends Deviation {
  words: string[]
  count: number
  fix: PhoneFix | null
}

export interface SpeechGrade {
  score: number
  words: WordGrade[]
  issues: GradeIssue[]
  detailed: boolean
  skipped: string[]
}

export interface GradeInput {
  target: string
  heard: string
  alternatives?: string[]
}

interface Sounded {
  word: string
  known: boolean
  sounds: string[]
}

const OK = 0.985
const NEAR = 0.62
const GAP = -0.55
const UNSURE_FLOOR = 0.7
const SUB_FLOOR = 0.75
const DEV_MIN = 0.3

export const EMPTY_GRADE: SpeechGrade = {
  score: 0, words: [], issues: [], detailed: false, skipped: [],
}

function prep(src: SoundSource, words: string[]): Sounded[] {
  return words.map((word) => {
    const known = hasSounds(src, word)
    return { word, known, sounds: known ? soundsOf(src, word) : Array.from(normWord(word)) }
  })
}

function sameCells(sounds: string[]): PhoneCell[] {
  return sounds.map((t, i) => ({
    want: t, got: t, state: 'ok' as const, cost: 0, ai: i, atEnd: i === sounds.length - 1,
  }))
}

function penalty(c: PhoneCell): number {
  if (c.state === 'ok') return 0
  return c.state === 'sub' ? Math.max(c.cost, SUB_FLOOR) : c.cost
}

function match(lang: string, a: Sounded, b: Sounded): { cells: PhoneCell[]; score: number } {
  const paired = a.known === b.known
  const want = paired ? a.sounds : Array.from(normWord(a.word))
  const got = paired ? b.sounds : Array.from(normWord(b.word))
  if (!want.length && !got.length) return { cells: [], score: 1 }
  if (normWord(a.word) === normWord(b.word)) {
    return { cells: sameCells(want), score: 1 }
  }
  const { cells } = alignPhones(lang, want, got)
  const last = want.length - 1
  cells.forEach((c) => { c.atEnd = c.ai === last })
  const span = Math.max(want.length, got.length, 1)
  const cost = cells.reduce((s, c) => s + penalty(c), 0)
  return { cells, score: Math.max(0, Math.min(1, 1 - cost / span)) }
}

function devsOf(lang: string, cells: PhoneCell[]): Deviation[] {
  return cells
    .filter((c) => c.state !== 'ok')
    .filter((c) => c.state !== 'sub' || isVowelTok(lang, c.want) === isVowelTok(lang, c.got))
    .map((c) => {
      const tok = c.state === 'extra' ? c.got : c.want
      return {
        want: c.want,
        got: c.got,
        state: c.state as Deviation['state'],
        atEnd: c.atEnd,
        vowel: isVowelTok(lang, tok),
        tone: isToneTok(lang, tok),
      }
    })
}

function kindOf(devs: Deviation[]): ErrorKind {
  if (!devs.length) return 'other'
  if (devs.every((d) => d.tone)) return 'tone'
  const real = devs.filter((d) => !d.tone)
  const vowel = real.some((d) => d.vowel)
  const cons = real.some((d) => !d.vowel)
  if (cons && !vowel && real.every((d) => d.atEnd)) return 'ending'
  if (vowel && cons) return 'both'
  if (vowel) return 'vowel'
  return 'consonant'
}

function stateOf(score: number): WordState {
  if (score >= OK) return 'ok'
  return score >= NEAR ? 'near' : 'wrong'
}

function pairWords(lang: string, want: Sounded[], got: Sounded[]): WordGrade[] {
  const m = want.length
  const n = got.length
  const cache = new Map<number, { cells: PhoneCell[]; score: number }>()
  const at = (i: number, j: number) => {
    const k = i * n + j
    let hit = cache.get(k)
    if (!hit) { hit = match(lang, want[i], got[j]); cache.set(k, hit) }
    return hit
  }
  const step = (i: number, j: number) => at(i, j).score * 2 - 0.6

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] + GAP
  for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] + GAP
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + step(i - 1, j - 1),
        dp[i - 1][j] + GAP,
        dp[i][j - 1] + GAP,
      )
    }
  }

  const out: WordGrade[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + step(i - 1, j - 1)) {
      const w = want[i - 1]
      const h = got[j - 1]
      const { cells, score } = at(i - 1, j - 1)
      const known = w.known && h.known
      const devs = known && score >= DEV_MIN ? devsOf(lang, cells) : []
      out.push({
        target: w.word,
        heard: h.word,
        state: stateOf(score),
        score,
        known,
        unsure: false,
        kind: kindOf(devs),
        cells,
        devs,
      })
      i -= 1
      j -= 1
    } else if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] + GAP)) {
      const w = want[i - 1]
      out.push({
        target: w.word,
        heard: '',
        state: 'missing',
        score: 0,
        known: w.known,
        unsure: false,
        kind: 'missing',
        cells: w.sounds.map((t, k) => ({
          want: t, got: '', state: 'miss' as const, cost: 1, ai: k, atEnd: k === w.sounds.length - 1,
        })),
        devs: [],
      })
      i -= 1
    } else {
      const h = got[j - 1]
      out.push({
        target: '',
        heard: h.word,
        state: 'extra',
        score: 0,
        known: h.known,
        unsure: false,
        kind: 'extra',
        cells: [],
        devs: [],
      })
      j -= 1
    }
  }
  return out.reverse()
}

function altWords(src: SoundSource, alts: string[]): Set<string> {
  const set = new Set<string>()
  for (const line of alts) {
    for (const w of splitWords(line, src.lang)) {
      const k = normWord(w)
      if (k) set.add(k)
    }
  }
  return set
}

const SENTENCE_END = /[.!?…:;"“”)]$/
const SELF_WORDS = new Set(['i', "i'm", "i've", "i'll", "i'd"])
const LATIN_START = /^[A-Za-zÀ-ÖØ-öø-ÿ]/

function looksProperNoun(raw: string, idx: number, all: string[]): boolean {
  const bare = raw.replace(/^[¿¡"“'(\[]+/, '')
  if (!LATIN_START.test(bare)) return false
  const first = bare[0]
  if (first !== first.toUpperCase() || first === first.toLowerCase()) return false
  if (SELF_WORDS.has(normWord(bare))) return false
  if (idx === 0) return false
  const prev = all[idx - 1] ?? ''
  return !SENTENCE_END.test(prev)
}

export function properNouns(lang: string, target: string): Set<string> {
  const out = new Set<string>()
  if (isNoSpaceLang(lang)) return out
  const toks = splitWords(target, lang)
  toks.forEach((tok, idx) => {
    if (looksProperNoun(tok, idx, toks)) out.add(normWord(tok))
  })
  return out
}

export function gradeSpeech(src: SoundSource, input: GradeInput): SpeechGrade {
  const lang = src.lang
  const want = prep(src, splitWords(input.target, lang))
  const got = prep(src, splitWords(input.heard, lang))
  if (!want.length) return EMPTY_GRADE

  const words = pairWords(lang, want, got)
  const heardAlt = altWords(src, input.alternatives ?? [])
  const names = properNouns(lang, input.target)

  for (const w of words) {
    if (w.state === 'ok' || w.state === 'extra' || !w.target) continue
    const key = normWord(w.target)
    if (!heardAlt.has(key) && !names.has(key)) continue
    w.unsure = true
    w.devs = []
    w.kind = 'other'
    if (w.state === 'missing') w.state = 'near'
    else w.state = 'near'
    w.score = Math.max(w.score, UNSURE_FLOOR)
  }

  const bag = new Map<string, GradeIssue>()
  for (const w of words) {
    if (!w.known || w.unsure) continue
    for (const d of w.devs) {
      const key = d.state + '|' + d.want + '|' + d.got
      const hit = bag.get(key)
      if (hit) {
        hit.count += 1
        hit.atEnd = hit.atEnd || d.atEnd
        if (w.target && !hit.words.includes(w.target)) hit.words.push(w.target)
        continue
      }
      bag.set(key, {
        ...d,
        words: w.target ? [w.target] : [],
        count: 1,
        fix: buildFix({ lang, want: d.want, got: d.got, state: d.state, atEnd: d.atEnd }),
      })
    }
  }

  const rank: Record<Deviation['state'], number> = { sub: 0, miss: 1, extra: 2 }
  const issues = Array.from(bag.values()).sort(
    (a, b) => b.count - a.count || rank[a.state] - rank[b.state],
  )

  let earned = 0
  let total = 0
  for (const w of words) {
    if (w.state === 'extra') { total += 0.5; continue }
    const weight = Math.max(1, w.cells.filter((c) => c.want).length)
    total += weight
    earned += w.score * weight
  }

  return {
    score: Math.round((earned / Math.max(0.5, total)) * 100),
    words,
    issues,
    detailed: words.some((w) => w.known && w.cells.length > 0) && got.length > 0,
    skipped: Array.from(new Set(words.filter((w) => w.target && !w.known).map((w) => w.target))),
  }
}

export function devLabel(lang: string, tok: string): string {
  return tok ? phoneLabel(lang, tok) : ''
}

export function topFixes(grade: SpeechGrade, max = 3): GradeIssue[] {
  const seen = new Set<string>()
  const out: GradeIssue[] = []
  for (const issue of grade.issues) {
    if (!issue.fix || seen.has(issue.fix.key)) continue
    seen.add(issue.fix.key)
    out.push(issue)
    if (out.length >= max) break
  }
  return out
}

export function missedWords(grade: SpeechGrade): string[] {
  return Array.from(new Set(
    grade.words
      .filter((w) => (w.state === 'wrong' || w.state === 'missing') && !w.unsure && w.target)
      .map((w) => w.target),
  ))
}

export function issueNotes(lang: string, grade: SpeechGrade, max = 4): string[] {
  return grade.issues.slice(0, max).map((d) => {
    const where = d.words.length ? ' (' + d.words.join(', ') + ')' : ''
    if (d.state === 'miss') return 'thiếu âm ' + devLabel(lang, d.want) + where
    if (d.state === 'extra') return 'thừa âm ' + devLabel(lang, d.got) + where
    return devLabel(lang, d.want) + ' đọc thành ' + devLabel(lang, d.got) + where
  })
}
