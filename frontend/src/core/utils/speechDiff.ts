export type WordState = 'ok' | 'near' | 'wrong' | 'missing' | 'extra'

export interface WordPair {
  target: string
  heard: string
  state: WordState
}

export type ErrorKind = 'vowel' | 'consonant' | 'both' | 'stress' | 'tone' | 'missing' | 'extra' | 'other'

export interface WordIssue extends WordPair {
  kind: ErrorKind
}

const PUNCT = /[.,!?;:"'`()[\]{}~…«»„“”‘’—–\-]/g

export function normWord(w: string): string {
  return (w || '').toLowerCase().replace(/’/g, "'").replace(PUNCT, '').trim()
}

export function splitWords(line: string, lang: string): string[] {
  const text = (line || '').trim()
  if (!text) return []
  if (lang === 'zh' || lang === 'ja') {
    const seg = (Intl as unknown as { Segmenter?: new (l: string, o: object) => { segment: (s: string) => Iterable<{ segment: string; isWordLike?: boolean }> } }).Segmenter
    if (seg) {
      const it = new seg(lang, { granularity: 'word' })
      return Array.from(it.segment(text)).filter((p) => p.isWordLike).map((p) => p.segment)
    }
    return Array.from(text.replace(/\s/g, ''))
  }
  return text.split(/\s+/).filter(Boolean)
}

const VOWELS = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY',
  'OW', 'OY', 'UH', 'UW',
])

const JAMO_VOWEL = /^V/

export function phonesOf(word: string, ph?: string): string[] {
  if (ph) return ph.split(' ').filter(Boolean)
  return Array.from(normWord(word))
}

function isVowelToken(tok: string): boolean {
  return VOWELS.has(tok) || JAMO_VOWEL.test(tok) || /^[aeiouyăâêôơư]$/i.test(tok)
}

function editOps<T>(a: T[], b: T[]): { same: number; diff: T[]; extra: T[] } {
  const m = a.length
  const n = b.length
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) d[i][0] = i
  for (let j = 0; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }
  let i = m
  let j = n
  let same = 0
  const diff: T[] = []
  const extra: T[] = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      same += 1; i -= 1; j -= 1
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      diff.push(a[i - 1]); i -= 1; j -= 1
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      diff.push(a[i - 1]); i -= 1
    } else {
      extra.push(b[j - 1]); j -= 1
    }
  }
  return { same, diff, extra }
}

const VOICE_PAIRS = [
  ['P', 'B'], ['T', 'D'], ['K', 'G'], ['F', 'V'], ['S', 'Z'],
  ['SH', 'ZH'], ['TH', 'DH'], ['CH', 'JH'], ['M', 'N'], ['N', 'NG'],
  ['L', 'R'], ['W', 'V'],
]
const NEAR_VOWELS = [
  ['IH', 'IY'], ['UH', 'UW'], ['AA', 'AO'], ['AH', 'ER'], ['AE', 'EH'],
]

const pairKey = (a: string, b: string) => (a < b ? a + '|' + b : b + '|' + a)
const NEAR_SET = new Map<string, number>()
VOICE_PAIRS.forEach(([a, b]) => NEAR_SET.set(pairKey(a, b), 0.35))
NEAR_VOWELS.forEach(([a, b]) => NEAR_SET.set(pairKey(a, b), 0.5))

function subCost(a: string, b: string): number {
  if (a === b) return 0
  return NEAR_SET.get(pairKey(a, b)) ?? 1
}

function gapCost(tok: string): number {
  return isVowelToken(tok) ? 1 : 0.7
}

export function phoneSimilarity(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 1
  if (!a.length || !b.length) return 0
  const m = a.length
  const n = b.length
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) d[i][0] = d[i - 1][0] + gapCost(a[i - 1])
  for (let j = 1; j <= n; j++) d[0][j] = d[0][j - 1] + gapCost(b[j - 1])
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j - 1] + subCost(a[i - 1], b[j - 1]),
        d[i - 1][j] + gapCost(a[i - 1]),
        d[i][j - 1] + gapCost(b[j - 1]),
      )
    }
  }
  const worst = Math.max(m, n)
  return Math.max(0, Math.min(1, 1 - d[m][n] / worst))
}

const TONE_MARKS = /[̀-ͯ]/g

function stripTone(s: string): string {
  return s.normalize('NFD').replace(TONE_MARKS, '').replace(/̄/g, '')
}

export function classify(
  targetPh: string[], heardPh: string[], targetRead = '', heardRead = '',
): ErrorKind {
  if (!heardPh.length) return 'missing'
  if (targetRead && heardRead && stripTone(targetRead) === stripTone(heardRead)
    && targetRead !== heardRead) return 'tone'
  const { diff, extra } = editOps(targetPh, heardPh)
  const changed = [...diff, ...extra]
  if (!changed.length) {
    if (targetRead && heardRead && targetRead !== heardRead) return 'stress'
    return 'other'
  }
  const vowel = changed.some(isVowelToken)
  const cons = changed.some((c) => !isVowelToken(c))
  if (vowel && cons) return 'both'
  if (vowel) return 'vowel'
  return 'consonant'
}

const NEAR = 0.45
const OK = 0.995

export interface AlignInput {
  target: string[]
  heard: string[]
  phones: (word: string) => string[]
}

export function alignWords({ target, heard, phones }: AlignInput): WordPair[] {
  const m = target.length
  const n = heard.length
  const sim = (i: number, j: number) => {
    if (normWord(target[i]) === normWord(heard[j])) return 1
    return phoneSimilarity(phones(target[i]), phones(heard[j]))
  }
  const GAP = -0.55
  const score: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) score[i][0] = score[i - 1][0] + GAP
  for (let j = 1; j <= n; j++) score[0][j] = score[0][j - 1] + GAP
  const cache: number[][] = Array.from({ length: m }, () => new Array(n).fill(-1))
  const at = (i: number, j: number) => {
    if (cache[i][j] < 0) cache[i][j] = sim(i, j)
    return cache[i][j]
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      score[i][j] = Math.max(
        score[i - 1][j - 1] + (at(i - 1, j - 1) * 2 - 0.6),
        score[i - 1][j] + GAP,
        score[i][j - 1] + GAP,
      )
    }
  }
  const out: WordPair[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && score[i][j] === score[i - 1][j - 1] + (at(i - 1, j - 1) * 2 - 0.6)) {
      const s = at(i - 1, j - 1)
      out.push({
        target: target[i - 1],
        heard: heard[j - 1],
        state: s >= OK ? 'ok' : s >= NEAR ? 'near' : 'wrong',
      })
      i -= 1; j -= 1
    } else if (i > 0 && (j === 0 || score[i][j] === score[i - 1][j] + GAP)) {
      out.push({ target: target[i - 1], heard: '', state: 'missing' })
      i -= 1
    } else {
      out.push({ target: '', heard: heard[j - 1], state: 'extra' })
      j -= 1
    }
  }
  return out.reverse()
}

export function overallScore(pairs: WordPair[], phones: (w: string) => string[]): number {
  if (!pairs.length) return 0
  let got = 0
  let total = 0
  for (const p of pairs) {
    if (p.state === 'extra') { total += 0.5; continue }
    total += 1
    if (p.state === 'ok') got += 1
    else if (p.state === 'missing') got += 0
    else got += phoneSimilarity(phones(p.target), phones(p.heard))
  }
  return Math.max(0, Math.min(100, Math.round((got / Math.max(1, total)) * 100)))
}
