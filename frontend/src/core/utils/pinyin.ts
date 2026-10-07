// Xử lý pinyin: tách thanh, đặt dấu thanh đúng quy tắc, đổi kiểu gõ số (ni3hao3) sang dấu,
// tách thanh mẫu / vận mẫu và biến điệu thanh 3.

export type Tone = 1 | 2 | 3 | 4 | 5

const MARKS: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
}

const UNMARK: Record<string, [string, Tone]> = {}
for (const [v, list] of Object.entries(MARKS)) list.forEach((m, k) => { UNMARK[m] = [v, (k + 1) as Tone] })

export interface Syllable {
  base: string
  tone: Tone
  erhua: boolean
}

// "hǎo" → { base: 'hao', tone: 3 }; "diǎnr" → { base: 'dian', tone: 3, erhua: true }; không dấu là thanh nhẹ (5)
export function parseSyllable(raw: string): Syllable {
  let tone: Tone = 5
  let base = ''
  for (const ch of raw.normalize('NFC').toLowerCase()) {
    const hit = UNMARK[ch]
    if (hit) { base += hit[0]; tone = hit[1] } else base += ch === 'v' ? 'ü' : ch
  }
  const erhua = base.length > 2 && base.endsWith('r') && base !== 'er'
  return { base: erhua ? base.slice(0, -1) : base, tone, erhua }
}

export function toneOf(raw: string): Tone {
  return parseSyllable(raw).tone
}

// Quy tắc đặt dấu: có a hoặc e thì đặt lên đó; có "ou" thì đặt lên o; còn lại đặt lên nguyên âm cuối (liú, guì).
export function markTone(base: string, tone: Tone): string {
  const b = base.normalize('NFC').toLowerCase().replace(/v/g, 'ü')
  if (tone === 5) return b
  let at = b.indexOf('a')
  if (at < 0) at = b.indexOf('e')
  if (at < 0 && b.includes('ou')) at = b.indexOf('o')
  if (at < 0) {
    for (let k = b.length - 1; k >= 0; k--) {
      if ('aeiouü'.includes(b[k])) { at = k; break }
    }
  }
  if (at < 0) return b
  return b.slice(0, at) + MARKS[b[at]][tone - 1] + b.slice(at + 1)
}

export function formatSyllable(s: Syllable): string {
  return markTone(s.base, s.tone) + (s.erhua ? 'r' : '')
}

// Gõ kiểu số: "ni3hao3", "ni3 hao3", "lv4", "ma5"/"ma0"/"ma" (thanh nhẹ) → "nǐ hǎo", "lǜ", "ma"
export function numberedToMarked(input: string): string {
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/u:/g, 'ü')
    .replace(/([a-zü]+?r?)([0-5])|([a-zü]+)/g, (m, letters: string, digit: string, bare: string) => {
      if (bare) return bare.replace(/v/g, 'ü')
      const d = Number(digit)
      const tone = (d === 0 ? 5 : d) as Tone
      const parsed = parseSyllable(letters)
      return formatSyllable({ ...parsed, tone })
    })
}

// So khớp đáp án gõ: bỏ khoảng trắng, dấu nháy, gạch nối; v = ü
export function normalizePinyin(s: string): string {
  return s.normalize('NFC').toLowerCase().replace(/v/g, 'ü').replace(/[\s'’·-]/g, '')
}

export const INITIAL_LIST = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's']

// Cách viết y/w và ü rút gọn trở về vận mẫu gốc: you → iou, wei → uei, ju → jü, yuan → üan
const ZERO_INITIAL: Record<string, string> = {
  yi: 'i', ya: 'ia', ye: 'ie', yao: 'iao', you: 'iou', yan: 'ian', yin: 'in', yang: 'iang', ying: 'ing', yong: 'iong',
  wu: 'u', wa: 'ua', wo: 'uo', wai: 'uai', wei: 'uei', wan: 'uan', wen: 'uen', wang: 'uang', weng: 'ueng',
  yu: 'ü', yue: 'üe', yuan: 'üan', yun: 'ün',
}

const CONTRACTED: Record<string, string> = { iu: 'iou', ui: 'uei', un: 'uen' }

export function splitSyllable(base: string): { initial: string; final: string; written: string } {
  const b = base.replace(/v/g, 'ü')
  if (ZERO_INITIAL[b]) return { initial: '', final: ZERO_INITIAL[b], written: b }
  const initial = INITIAL_LIST.find((x) => b.startsWith(x)) ?? ''
  let final = b.slice(initial.length)
  if ('jqx'.includes(initial) && initial && final.startsWith('u')) final = 'ü' + final.slice(1)
  final = CONTRACTED[final] ?? final
  return { initial, final, written: b }
}

// Thanh 3 đứng trước thanh 3 đọc thành thanh 2 (你好 nǐ hǎo đọc ní hǎo). Áp dụng từ trái sang phải cho chuỗi hai âm tiết.
export function spokenTones(tones: Tone[]): Tone[] {
  const out = tones.slice()
  for (let k = 0; k < out.length - 1; k++) {
    if (out[k] === 3 && out[k + 1] === 3) out[k] = 2
  }
  return out
}
