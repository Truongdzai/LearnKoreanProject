// Ghép / tách âm tiết Hangul theo bảng Unicode (U+AC00…U+D7A3) và bộ gõ 2-set (Dubeolsik).
// Âm tiết = 0xAC00 + (đầu × 21 + giữa) × 28 + cuối.

export const LEADS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

export const VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ',
  'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
]

// Vị trí 0 là "không có patchim".
export const TAILS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
  'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

const BASE = 0xac00
const LAST = 0xd7a3

const VOWEL_PAIRS: Record<string, string> = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
}

const TAIL_PAIRS: Record<string, string> = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ',
}

// Ngược lại: nguyên âm / patchim ghép tách ra thành các phím đã gõ.
const VOWEL_SPLIT: Record<string, string[]> = Object.fromEntries(
  Object.entries(VOWEL_PAIRS).map(([pair, v]) => [v, Array.from(pair)]),
)
const TAIL_SPLIT: Record<string, string[]> = Object.fromEntries(
  Object.entries(TAIL_PAIRS).map(([pair, t]) => [t, Array.from(pair)]),
)

const CONSONANTS = new Set([...LEADS, ...TAILS.slice(1)])

export function isConsonant(j: string): boolean {
  return CONSONANTS.has(j)
}

export function isVowel(j: string): boolean {
  return VOWELS.includes(j)
}

export function isSyllable(ch: string): boolean {
  const c = ch.charCodeAt(0)
  return c >= BASE && c <= LAST
}

export interface Parts {
  lead: string
  vowel: string
  tail: string
}

export function compose(lead: string, vowel: string, tail = ''): string {
  const l = LEADS.indexOf(lead)
  const v = VOWELS.indexOf(vowel)
  const t = TAILS.indexOf(tail)
  if (l < 0 || v < 0 || t < 0) return ''
  return String.fromCharCode(BASE + (l * 21 + v) * 28 + t)
}

export function decompose(ch: string): Parts | null {
  if (!ch || !isSyllable(ch)) return null
  const code = ch.charCodeAt(0) - BASE
  return {
    lead: LEADS[Math.floor(code / 588)],
    vowel: VOWELS[Math.floor((code % 588) / 28)],
    tail: TAILS[code % 28],
  }
}

// Chuỗi phím 2-set cần bấm để ra một đoạn chữ (dùng cho gợi ý phím kế tiếp).
export function toJamoKeys(text: string): string[] {
  const out: string[] = []
  for (const ch of Array.from(text)) {
    const p = decompose(ch)
    if (p) {
      out.push(p.lead)
      out.push(...(VOWEL_SPLIT[p.vowel] ?? [p.vowel]))
      if (p.tail) out.push(...(TAIL_SPLIT[p.tail] ?? [p.tail]))
    } else if (VOWEL_SPLIT[ch]) {
      out.push(...VOWEL_SPLIT[ch])
    } else if (TAIL_SPLIT[ch]) {
      out.push(...TAIL_SPLIT[ch])
    } else {
      out.push(ch)
    }
  }
  return out
}

// Ghép dãy phím đã gõ thành chữ, giống bộ gõ thật: patchim nhảy sang âm tiết sau
// khi gặp nguyên âm, nguyên âm và patchim đôi tự gộp, phím lẻ hiện nguyên dạng.
export function composeKeys(keys: string[]): string {
  let out = ''
  let i = 0
  const n = keys.length
  const vowelAt = (k: number) => k < n && isVowel(keys[k])
  const consAt = (k: number) => k < n && isConsonant(keys[k])

  while (i < n) {
    const k = keys[i]
    if (consAt(i) && LEADS.includes(k) && vowelAt(i + 1)) {
      const lead = k
      let vowel = keys[i + 1]
      i += 2
      if (vowelAt(i) && VOWEL_PAIRS[vowel + keys[i]]) {
        vowel = VOWEL_PAIRS[vowel + keys[i]]
        i += 1
      }
      let tail = ''
      if (consAt(i) && TAILS.includes(keys[i]) && !vowelAt(i + 1)) {
        tail = keys[i]
        i += 1
        if (consAt(i) && TAIL_PAIRS[tail + keys[i]] && !vowelAt(i + 1)) {
          tail = TAIL_PAIRS[tail + keys[i]]
          i += 1
        }
      }
      out += compose(lead, vowel, tail)
    } else if (vowelAt(i)) {
      let vowel = k
      i += 1
      if (vowelAt(i) && VOWEL_PAIRS[vowel + keys[i]]) {
        vowel = VOWEL_PAIRS[vowel + keys[i]]
        i += 1
      }
      out += vowel
    } else {
      out += k
      i += 1
    }
  }
  return out
}

// Bố cục bàn phím 2-set chuẩn Hàn Quốc theo phím vật lý (KeyboardEvent.code), nên
// vẫn đúng khi máy đang bật bộ gõ khác.
export const KEY_ROWS: { code: string; base: string; shift?: string; latin: string }[][] = [
  [
    { code: 'KeyQ', base: 'ㅂ', shift: 'ㅃ', latin: 'Q' },
    { code: 'KeyW', base: 'ㅈ', shift: 'ㅉ', latin: 'W' },
    { code: 'KeyE', base: 'ㄷ', shift: 'ㄸ', latin: 'E' },
    { code: 'KeyR', base: 'ㄱ', shift: 'ㄲ', latin: 'R' },
    { code: 'KeyT', base: 'ㅅ', shift: 'ㅆ', latin: 'T' },
    { code: 'KeyY', base: 'ㅛ', latin: 'Y' },
    { code: 'KeyU', base: 'ㅕ', latin: 'U' },
    { code: 'KeyI', base: 'ㅑ', latin: 'I' },
    { code: 'KeyO', base: 'ㅐ', shift: 'ㅒ', latin: 'O' },
    { code: 'KeyP', base: 'ㅔ', shift: 'ㅖ', latin: 'P' },
  ],
  [
    { code: 'KeyA', base: 'ㅁ', latin: 'A' },
    { code: 'KeyS', base: 'ㄴ', latin: 'S' },
    { code: 'KeyD', base: 'ㅇ', latin: 'D' },
    { code: 'KeyF', base: 'ㄹ', latin: 'F' },
    { code: 'KeyG', base: 'ㅎ', latin: 'G' },
    { code: 'KeyH', base: 'ㅗ', latin: 'H' },
    { code: 'KeyJ', base: 'ㅓ', latin: 'J' },
    { code: 'KeyK', base: 'ㅏ', latin: 'K' },
    { code: 'KeyL', base: 'ㅣ', latin: 'L' },
  ],
  [
    { code: 'KeyZ', base: 'ㅋ', latin: 'Z' },
    { code: 'KeyX', base: 'ㅌ', latin: 'X' },
    { code: 'KeyC', base: 'ㅊ', latin: 'C' },
    { code: 'KeyV', base: 'ㅍ', latin: 'V' },
    { code: 'KeyB', base: 'ㅠ', latin: 'B' },
    { code: 'KeyN', base: 'ㅜ', latin: 'N' },
    { code: 'KeyM', base: 'ㅡ', latin: 'M' },
  ],
]

const KEY_BY_CODE = new Map(KEY_ROWS.flat().map((k) => [k.code, k]))

export function jamoForKey(code: string, shift: boolean): string | null {
  const k = KEY_BY_CODE.get(code)
  if (!k) return null
  return shift && k.shift ? k.shift : k.base
}

// Phím cần bấm để ra một chữ cái (kèm có cần giữ Shift không).
export function keyForJamo(jamo: string): { code: string; latin: string; shift: boolean } | null {
  for (const k of KEY_ROWS.flat()) {
    if (k.base === jamo) return { code: k.code, latin: k.latin, shift: false }
    if (k.shift === jamo) return { code: k.code, latin: k.latin, shift: true }
  }
  return null
}
