const LEAD = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']

const VOWEL = [
  'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo',
  'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i',
]

const TAIL_CODA = [
  '', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l',
  'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't',
]

const TAIL_LIAISON: [string, string][] = [
  ['', ''], ['', 'g'], ['', 'kk'], ['k', 's'], ['', 'n'], ['n', 'j'], ['n', ''],
  ['', 'd'], ['', 'r'], ['l', 'g'], ['l', 'm'], ['l', 'b'], ['l', 's'], ['l', 't'],
  ['l', 'p'], ['', 'r'], ['', 'm'], ['', 'b'], ['p', 's'], ['', 's'], ['', 'ss'],
  ['ng', ''], ['', 'j'], ['', 'ch'], ['', 'k'], ['', 't'], ['', 'p'], ['', ''],
]

interface Syllable {
  lead: number
  vowel: number
  tail: number
}

function decompose(ch: string): Syllable | null {
  const code = ch.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) return null
  return { lead: Math.floor(code / 588), vowel: Math.floor((code % 588) / 28), tail: code % 28 }
}

// Returns [coda that stays on this syllable, onset forced onto the next syllable].
function assimilate(tail: number, nextLead: number): [string, string] {
  const coda = TAIL_CODA[tail]
  const lead = LEAD[nextLead]
  if ((coda === 'l' && lead === 'r') || (coda === 'n' && lead === 'r') || (coda === 'l' && lead === 'n'))
    return ['l', 'l']
  if (coda === 'k' && (lead === 'n' || lead === 'm')) return ['ng', lead]
  if (coda === 't' && (lead === 'n' || lead === 'm')) return ['n', lead]
  if (coda === 'p' && (lead === 'n' || lead === 'm')) return ['m', lead]
  if (tail === 27) {
    if (nextLead === 0) return ['', 'k']
    if (nextLead === 3) return ['', 't']
    if (nextLead === 12) return ['', 'ch']
    if (nextLead === 7) return ['', 'p']
  }
  return [coda, lead]
}

export function romanizeWord(word: string): string {
  const chars = Array.from(word)
  const syl = chars.map(decompose)
  if (syl.every((s) => s === null)) return ''

  let out = ''
  let onsetOverride: string | null = null

  for (let i = 0; i < chars.length; i++) {
    const s = syl[i]
    if (!s) {
      out += chars[i]
      onsetOverride = null
      continue
    }
    out += (onsetOverride ?? LEAD[s.lead]) + VOWEL[s.vowel]
    onsetOverride = null
    if (s.tail === 0) continue

    const next = syl[i + 1]
    if (next && next.lead === 11) {
      const [coda, moved] = TAIL_LIAISON[s.tail]
      out += coda
      onsetOverride = moved
    } else if (next) {
      const [coda, moved] = assimilate(s.tail, next.lead)
      out += coda
      onsetOverride = moved
    } else {
      out += TAIL_CODA[s.tail]
    }
  }
  return out
}

export function romanizeLine(line: string): string {
  return line
    .split(/(\s+)/)
    .map((tok) => (tok.trim() ? romanizeWord(tok) : tok))
    .join('')
}
