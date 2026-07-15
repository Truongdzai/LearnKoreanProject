/** Pronunciation scoring by comparing Hangul at the jamo (consonant/vowel) level. */

const clean = (s: string) => s.replace(/[.,!?;:"'`()~…\-]/g, '').replace(/\s+/g, ' ').trim()

/** Decompose a string into a flat token array of jamo (so near-misses score partially). */
function toJamo(text: string): string[] {
  const out: string[] = []
  for (const ch of clean(text).replace(/\s/g, '')) {
    const code = ch.charCodeAt(0) - 0xac00
    if (code >= 0 && code < 11172) {
      out.push('L' + Math.floor(code / 588))
      out.push('V' + Math.floor((code % 588) / 28))
      const tail = code % 28
      if (tail) out.push('T' + tail)
    } else {
      out.push(ch.toLowerCase())
    }
  }
  return out
}

/** Levenshtein distance over token arrays. */
function editDistance(a: string[], b: string[]): number {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let cur = new Array(n + 1).fill(0)
  for (let i = 1; i <= m; i++) {
    cur[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    }
    ;[prev, cur] = [cur, prev]
  }
  return prev[n]
}

/** Accuracy 0–100 comparing what the learner said to the target sentence. */
export function pronunciationScore(target: string, heard: string): number {
  const t = toJamo(target)
  const h = toJamo(heard)
  if (!t.length) return 0
  if (!h.length) return 0
  const dist = editDistance(t, h)
  const score = Math.round((1 - dist / Math.max(t.length, h.length)) * 100)
  return Math.max(0, Math.min(100, score))
}

export interface WordMark {
  word: string
  ok: boolean
}

/** Per-word match for highlighting: a target word is "ok" if it appears in what was heard. */
export function markWords(target: string, heard: string): WordMark[] {
  const heardSet = new Set(clean(heard).split(' ').map((w) => w.replace(/\s/g, '')))
  const heardJoined = clean(heard).replace(/\s/g, '')
  return clean(target)
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const bare = word.replace(/\s/g, '')
      return { word, ok: heardSet.has(bare) || heardJoined.includes(bare) }
    })
}

export function scoreBand(n: number): { labelKey: string; tone: 'good' | 'mid' | 'low' } {
  if (n >= 85) return { labelKey: 'band.excellent', tone: 'good' }
  if (n >= 65) return { labelKey: 'band.great', tone: 'good' }
  if (n >= 40) return { labelKey: 'band.ok', tone: 'mid' }
  return { labelKey: 'band.more', tone: 'low' }
}
