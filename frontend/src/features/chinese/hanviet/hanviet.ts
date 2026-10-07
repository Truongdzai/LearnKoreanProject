import { ZH_ALL_WORDS } from '@/data/chineseCore'
import RAW from '@/data/chinese/hanviet.json'

// Âm Hán–Việt cho mọi chữ Hán trong kho từ tiếng Trung. Người Việt đã biết sẵn hàng nghìn từ Hán–Việt
// (học sinh, ngân hàng, điện ảnh…), nên nhìn chữ mà nhớ ra âm Hán–Việt là đoán được nghĩa và nhớ chữ nhanh hơn.

export interface HvEntry {
  c: string
  py: string
  hv: string[]
  note?: string
}

export interface ZhWord {
  zh: string
  pinyin: string
  vi: string
}

const DATA = RAW as Record<string, { py: string; hv: string[]; note?: string }>

export const CHARS: HvEntry[] = Object.entries(DATA).map(([c, e]) => ({ c, ...e }))
export const BY_CHAR = new Map(CHARS.map((e) => [e.c, e]))

export const WORDS: ZhWord[] = ZH_ALL_WORDS.flatMap((w) => (w.zh ? [{ zh: w.zh, pinyin: w.pinyin ?? '', vi: w.vi }] : []))

const HAN = /\p{Script=Han}/u

export function hanOf(text: string): string[] {
  return [...text].filter((c) => HAN.test(c))
}

export function wordsWith(c: string, n = 4): ZhWord[] {
  return WORDS.filter((w) => w.zh.includes(c)).slice(0, n)
}

// So khớp không phụ thuộc kiểu bỏ dấu cũ / mới (hòa = hoà): tách dấu thanh ra cuối mỗi tiếng
const TONE_CODE: Record<string, string> = { '\u0300': '2', '\u0301': '1', '\u0309': '3', '\u0303': '4', '\u0323': '5' }

export function canon(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\p{L}\p{M}]+/gu, (w) => {
    let tone = ''
    const base = w.replace(/[\u0300\u0301\u0309\u0303\u0323]/g, (m) => { tone = TONE_CODE[m]; return '' })
    return base.normalize('NFC') + tone
  })
}

function combos(zh: string): string[] {
  let out = ['']
  for (const c of zh) out = out.flatMap((p) => BY_CHAR.get(c)!.hv.map((h) => (p ? p + ' ' : '') + h))
  return out
}

// Tìm cách đọc (tổ hợp các âm của từng chữ) xuất hiện nguyên văn trong nghĩa tiếng Việt
export function transparentReading(w: ZhWord): string | null {
  const cs = [...w.zh]
  if (cs.length < 2 || !cs.every((c) => BY_CHAR.has(c))) return null
  const vi = canon(w.vi)
  return combos(w.zh).find((x) => vi.includes(canon(x))) ?? null
}

// Đọc cả từ: ưu tiên cách đọc khớp nghĩa (银行 ngân hàng), không thì lấy âm đầu tiên của từng chữ
export function readWord(zh: string): string | null {
  const cs = [...zh]
  if (!cs.every((c) => BY_CHAR.has(c))) return null
  return transparentReading({ zh, pinyin: '', vi: WORDS.find((w) => w.zh === zh)?.vi ?? '' })
    ?? cs.map((c) => BY_CHAR.get(c)!.hv[0]).join(' ')
}

export function allReadings(zh: string): Set<string> {
  return new Set([...zh].every((c) => BY_CHAR.has(c)) ? combos(zh).map(canon) : [])
}

export const TRANSPARENT: { w: ZhWord; hv: string }[] = WORDS.flatMap((w) => {
  const hv = transparentReading(w)
  return hv ? [{ w, hv }] : []
})

// Bỏ dấu để người không gõ được tiếng Việt vẫn tra được (hoc → học)
export function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim()
}

export function searchHv(q: string): HvEntry[] {
  const raw = canon(q.trim())
  if (!raw) return []
  const exact = CHARS.filter((e) => e.hv.some((h) => canon(h) === raw))
  if (exact.length) return exact
  const f = fold(raw)
  return CHARS.filter((e) => e.hv.some((h) => fold(h) === f))
}

// ── Thanh điệu và phụ âm đầu của pinyin ──

const TONE_MARKS: Record<string, number> = {
  ā: 1, ē: 1, ī: 1, ō: 1, ū: 1, ǖ: 1,
  á: 2, é: 2, í: 2, ó: 2, ú: 2, ǘ: 2,
  ǎ: 3, ě: 3, ǐ: 3, ǒ: 3, ǔ: 3, ǚ: 3,
  à: 4, è: 4, ì: 4, ò: 4, ù: 4, ǜ: 4,
}

export function toneOf(py: string): number {
  for (const ch of py) if (TONE_MARKS[ch]) return TONE_MARKS[ch]
  return 0
}

export function plain(py: string): string {
  return py.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v')
}

// ── Quy luật tương ứng âm ──

export interface Rule {
  id: string
  title: string
  desc: string
  applies: (e: HvEntry) => boolean
  hit: (e: HvEntry) => boolean
}

const hvStarts = (e: HvEntry, re: RegExp) => e.hv.some((h) => re.test(h))
const hvEnds = (e: HvEntry, re: RegExp) => re.test(e.hv[0])

export const RULES: Rule[] = [
  {
    id: 'f', title: 'f → ph', desc: 'Pinyin bắt đầu bằng f gần như luôn ứng với âm Hán–Việt bắt đầu bằng ph.',
    applies: (e) => /^f/.test(plain(e.py)), hit: (e) => hvStarts(e, /^ph/),
  },
  {
    id: 'd', title: 'd → đ', desc: 'Pinyin d ứng với đ: 大 dà đại, 地 dì địa, 电 diàn điện.',
    applies: (e) => /^d/.test(plain(e.py)), hit: (e) => hvStarts(e, /^đ/),
  },
  {
    id: 't', title: 't: thanh 2 → đ, thanh khác → th',
    desc: 'Pinyin t mang thanh 2 thường ứng với đ (头 tóu đầu, 题 tí đề); mang thanh 1, 3, 4 thì ứng với th (天 tiān thiên, 听 tīng thính).',
    applies: (e) => /^t/.test(plain(e.py)) && toneOf(e.py) > 0,
    hit: (e) => hvStarts(e, toneOf(e.py) === 2 ? /^đ/ : /^th/),
  },
  {
    id: 'k', title: 'k → kh', desc: 'Pinyin k ứng với kh: 看 kàn khán, 开 kāi khai, 客 kè khách.',
    applies: (e) => /^k/.test(plain(e.py)), hit: (e) => hvStarts(e, /^kh/),
  },
  {
    id: 'h', title: 'h → h', desc: 'Pinyin h thường giữ nguyên h: 好 hǎo hảo, 汉 hàn hán, 火 huǒ hoả.',
    applies: (e) => /^h/.test(plain(e.py)), hit: (e) => hvStarts(e, /^h/),
  },
  {
    id: 'r', title: 'r → nh', desc: 'Pinyin r ứng rất đều với nh: 人 rén nhân, 日 rì nhật, 热 rè nhiệt.',
    applies: (e) => /^r/.test(plain(e.py)), hit: (e) => hvStarts(e, /^nh/),
  },
  {
    id: 'w', title: 'w → v hoặc ng', desc: 'Pinyin w ứng với v (问 wèn vấn, 位 wèi vị) hoặc ng (我 wǒ ngã, 五 wǔ ngũ).',
    applies: (e) => /^w/.test(plain(e.py)), hit: (e) => hvStarts(e, /^(v|ng)/),
  },
  {
    id: 'zh', title: 'zh → tr hoặc ch', desc: 'Pinyin zh ứng với tr (中 zhōng trung) hoặc ch (正 zhèng chính).',
    applies: (e) => /^zh/.test(plain(e.py)), hit: (e) => hvStarts(e, /^(tr|ch)/),
  },
  {
    id: 'sh', title: 'sh → th hoặc s', desc: 'Pinyin sh phần lớn ứng với th (是 shì thị, 书 shū thư), đôi khi s (师 shī sư).',
    applies: (e) => /^sh/.test(plain(e.py)), hit: (e) => hvStarts(e, /^(th|s)/),
  },
  {
    id: 'j', title: 'j → k, c, gi', desc: 'Pinyin j thường ứng với k / c / gi: 家 jiā gia, 见 jiàn kiến, 机 jī cơ.',
    applies: (e) => /^j/.test(plain(e.py)), hit: (e) => hvStarts(e, /^(k|c|gi|q)/),
  },
  {
    id: 'x', title: 'x → t hoặc h', desc: 'Pinyin x ứng với t (小 xiǎo tiểu, 新 xīn tân) hoặc h (学 xué học, 夏 xià hạ).',
    applies: (e) => /^x/.test(plain(e.py)), hit: (e) => hvStarts(e, /^(t|h)/),
  },
  {
    id: 'm', title: 'Hán–Việt -m → pinyin -n',
    desc: 'Tiếng Bắc Kinh đã gộp -m vào -n, tiếng Việt thì giữ: 今 kim → jīn, 三 tam → sān, 音 âm → yīn.',
    applies: (e) => hvEnds(e, /m$/), hit: (e) => /n$/.test(plain(e.py)),
  },
  {
    id: 'stop', title: 'Hán–Việt -p, -t, -c, -ch → pinyin không có phụ âm cuối',
    desc: 'Âm Hán–Việt tận cùng p/t/c/ch (học, quốc, nhật, tập) là "nhập thanh" — tiếng Bắc Kinh đã rụng phụ âm cuối này: xué, guó, rì, xí.',
    applies: (e) => hvEnds(e, /(p|t|c|ch)$/), hit: (e) => !/(n|ng|r)$/.test(plain(e.py)),
  },
  {
    id: 'ing', title: 'pinyin -ing → Hán–Việt -nh',
    desc: '生 shēng sinh, 明 míng minh, 请 qǐng thỉnh, 病 bìng bệnh: vần -ing (và nhiều chữ -eng) ứng với -inh / -anh / -ênh.',
    applies: (e) => /ing$/.test(plain(e.py)), hit: (e) => e.hv.some((h) => /nh$/.test(h)),
  },
]

export interface RuleStat {
  rule: Rule
  hits: HvEntry[]
  misses: HvEntry[]
}

export function ruleStats(): RuleStat[] {
  return RULES.map((rule) => {
    const pool = CHARS.filter(rule.applies)
    return { rule, hits: pool.filter(rule.hit), misses: pool.filter((e) => !rule.hit(e)) }
  })
}

// ── Câu hỏi luyện ──

export type ModeId = 'hv' | 'char' | 'word'

export interface ZItem {
  id: string
  mode: ModeId
  // Đề: chữ / âm Hán–Việt / từ
  prompt: string
  sub: string
  options: string[]
  answer: string
  // Lời giải sau khi trả lời
  reveal: string
  speak: string
}

export const ROUND = 10
let seq = 0

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[k]] = [a[k], a[i]]
  }
  return a
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Chữ nên hỏi: bỏ các trợ từ hầu như không có từ Hán–Việt tương ứng
const SKIP = new Set(['了', '的', '吗', '呢', '么', '们', '哪', '这', '个', '些', '很', '吃', '找', '卡', '爸', '妈', '您', '她', '哥', '爷', '奶'])
export const DRILL_CHARS = CHARS.filter((e) => !SKIP.has(e.c))

function distinctHv(answer: HvEntry, n: number): string[] {
  const out = new Set<string>()
  const pool = shuffle(DRILL_CHARS)
  // Ưu tiên âm có cùng phụ âm đầu cho khó hơn
  const head = answer.hv[0].slice(0, 2)
  for (const e of pool) {
    if (out.size >= n) break
    const h = e.hv[0]
    if (h.slice(0, 2) === head && !answer.hv.includes(h)) out.add(h)
  }
  for (const e of pool) {
    if (out.size >= n) break
    const h = e.hv[0]
    if (!answer.hv.includes(h)) out.add(h)
  }
  return [...out]
}

function hvItem(e: HvEntry): ZItem {
  const w = wordsWith(e.c, 1)[0]
  const answer = e.hv[0]
  return {
    id: `h${++seq}`,
    mode: 'hv',
    prompt: e.c,
    sub: !w ? e.py : w.zh === e.c ? `${e.py} · ${w.vi}` : `${e.py} · trong ${w.zh} (${w.vi})`,
    options: shuffle([answer, ...distinctHv(e, 3)]),
    answer,
    reveal: `${e.c} = ${e.hv.join(' / ')}${e.note ? '. ' + e.note : ''}`,
    speak: e.c,
  }
}

function charItem(e: HvEntry): ZItem {
  const hv = e.hv[0]
  const others = shuffle(DRILL_CHARS.filter((x) => x.c !== e.c && !x.hv.includes(hv))).slice(0, 3).map((x) => x.c)
  return {
    id: `c${++seq}`,
    mode: 'char',
    prompt: hv,
    sub: 'Chữ nào đọc Hán–Việt như trên?',
    options: shuffle([e.c, ...others]),
    answer: e.c,
    reveal: `${e.c} (${e.py}) = ${e.hv.join(' / ')} — ${wordsWith(e.c, 2).map((w) => `${w.zh} ${w.vi}`).join('; ')}`,
    speak: e.c,
  }
}

const WORD_POOL = WORDS.filter((w) => [...w.zh].length >= 2 && [...w.zh].length <= 4 && readWord(w.zh))

function wordItem(w: ZhWord): ZItem {
  const answer = readWord(w.zh)!
  const cs = [...w.zh]
  const valid = allReadings(w.zh)
  const wrong = new Set<string>()
  // Đổi âm một chữ sang âm của chữ khác: phải nhìn từng chữ mới chọn đúng
  for (let guard = 0; wrong.size < 3 && guard < 40; guard++) {
    const k = Math.floor(Math.random() * cs.length)
    const parts = cs.map((c) => BY_CHAR.get(c)!.hv[0])
    const swap = pick(DRILL_CHARS).hv[0]
    if (swap === parts[k]) continue
    parts[k] = swap
    const s = parts.join(' ')
    if (!valid.has(canon(s))) wrong.add(s)
  }
  const t = transparentReading(w)
  return {
    id: `w${++seq}`,
    mode: 'word',
    prompt: w.zh,
    sub: w.pinyin,
    options: shuffle([answer, ...wrong]),
    answer,
    reveal: `${w.zh} = ${answer} → ${w.vi}${t ? ' (đọc lên là hiểu!)' : ''}`,
    speak: w.zh,
  }
}

export function buildRound(mode: ModeId): ZItem[] {
  if (mode === 'word') return shuffle(WORD_POOL).slice(0, ROUND).map(wordItem)
  const chars = shuffle(DRILL_CHARS).slice(0, ROUND)
  return chars.map((e) => (mode === 'hv' ? hvItem(e) : charItem(e)))
}

export const WORD_POOL_SIZE = WORD_POOL.length
