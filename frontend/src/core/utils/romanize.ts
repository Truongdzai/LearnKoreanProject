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

// Patchim ㅎ (kể cả ㄶ ㅀ) gặp ㄱ ㄷ ㅂ ㅈ thì gộp thành âm bật hơi: 좋고 joko, 많다 manta.
const ASPIRATE: Record<number, string> = { 0: 'k', 3: 't', 7: 'p', 12: 'ch' }

function assimilate(tail: number, nextLead: number): [string, string] {
  const coda = TAIL_CODA[tail]
  let lead = LEAD[nextLead]
  if ((coda === 'l' && lead === 'r') || (coda === 'n' && lead === 'r') || (coda === 'l' && lead === 'n'))
    return ['l', 'l']
  if (tail === 27 && ASPIRATE[nextLead]) return ['', ASPIRATE[nextLead]]
  if (tail === 6 && ASPIRATE[nextLead]) return ['n', ASPIRATE[nextLead]]
  if (tail === 15 && ASPIRATE[nextLead]) return ['l', ASPIRATE[nextLead]]
  // ㄹ sau phụ âm khác ㄴ/ㄹ đọc thành ㄴ: 정류장 jeongnyujang, 등록 deungnok.
  if (lead === 'r' && coda && coda !== 'l') lead = 'n'
  if (coda === 'k' && (lead === 'n' || lead === 'm')) return ['ng', lead]
  if (coda === 't' && (lead === 'n' || lead === 'm')) return ['n', lead]
  if (coda === 'p' && (lead === 'n' || lead === 'm')) return ['m', lead]
  return [coda, lead]
}

// ㄷ, ㅌ nối với 이 thì vòm hoá: 같이 gachi, 굳이 guji.
function liaison(tail: number, nextVowel: number): [string, string] {
  if (nextVowel === 20) {
    if (tail === 7) return ['', 'j']
    if (tail === 25) return ['', 'ch']
    if (tail === 13) return ['l', 'ch']
  }
  return TAIL_LIAISON[tail]
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
      const [coda, moved] = liaison(s.tail, next.vowel)
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
