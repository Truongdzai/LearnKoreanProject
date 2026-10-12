import {
  DAYS_IN, MONTHS, bigNum, cardinal, dateNum, dateWord, digitalTime, ordSuffix, ordinal, priceNum, priceWord,
  timeNum, timeWord, under100, yearWord,
} from './ennum'

export type CatId = 'teen' | 'big' | 'price' | 'year' | 'time' | 'date' | 'ord'
export type ModeId = 'read' | 'listen' | 'type'

export const CATS: { id: CatId; label: string; tip: string }[] = [
  {
    id: 'teen', label: '13 hay 30',
    tip: 'Đuôi -teen nhấn ở cuối (thir-TEEN, âm "n" rõ), đuôi -ty nhấn ở đầu (THIR-ty, giọng Mỹ đọc gần "thir-di"). Viết: forty (không có u), fifteen, fifty.',
  },
  {
    id: 'big', label: 'Số lớn',
    tip: 'Tách nhóm 3 chữ số giống tiếng Việt: thousand = nghìn, million = triệu, billion = tỷ. 150,000 = one hundred and fifty + thousand. Không thêm -s khi có số đứng trước: two thousand, không phải two thousands.',
  },
  {
    id: 'price', label: 'Giá tiền',
    tip: 'Đô-la đọc trước, xu (cent) đọc sau: $5.20 = five dollars and twenty cents; nói nhanh là "five twenty". Tiền không đọc "point".',
  },
  {
    id: 'year', label: 'Năm',
    tip: 'Năm tách đôi: 19|99 = nineteen ninety-nine, có 0 ở giữa thì đọc "oh": 1905 = nineteen oh five. 2000–2009: two thousand (and) five. Từ 2010 thường nói twenty ten, twenty twenty-four (hoặc two thousand and twenty-four).',
  },
  {
    id: 'time', label: 'Giờ',
    tip: 'past = "qua" (nửa đầu giờ), to = "kém" (nửa sau, tính theo giờ kế tiếp): 7:45 = a quarter to eight (8 giờ kém 15), 7:30 = half past seven. Kiểu đồng hồ số cũng đúng: seven forty-five.',
  },
  {
    id: 'date', label: 'Ngày tháng',
    tip: 'Ngày dùng số thứ tự: the third of May (Anh) hay May third (Mỹ). Lưu ý người Mỹ viết tháng trước: 5/3 ở Mỹ là ngày 3 tháng 5.',
  },
  {
    id: 'ord', label: 'Số thứ tự',
    tip: 'first, second, third bất quy tắc; còn lại thêm -th: fifth (ve → f), eighth, ninth (bỏ e), twelfth, twentieth (y → ie). Số ghép chỉ đổi phần cuối: twenty-first, ninety-second.',
  },
]

export const TYPE_CATS: CatId[] = ['teen', 'big', 'price', 'year', 'time']

export interface Wrong {
  say: string
  value: string
  why?: string
}

export interface Item {
  cat: CatId
  // Con số hiển thị: $5.20, 1999, 7:45, 3 tháng 5, 21st, 15,000
  value: string
  // Cách đọc chuẩn (đọc to và là đáp án)
  say: string
  // Cách nói khác cũng đúng
  alt?: string
  wrong: Wrong[]
  accept: (typed: string) => boolean
}

const rnd = (n: number) => Math.floor(Math.random() * n)
const pick = <T,>(arr: readonly T[]): T => arr[rnd(arr.length)]

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const digitsOnly = (s: string) => s.replace(/[\s,._'’]/g, '')
// Chỉ nhận số liền hoặc tách đúng từng nhóm 3 chữ số (1500, 1,500, 1.500, 1 500) — không nhận 15.00 cho 1,500
const acceptInt = (n: number) => (t: string) => {
  const s = t.trim()
  return (/^\d+$/.test(s) || /^\d{1,3}([ ,.'’_]\d{3})+$/.test(s)) && Number(digitsOnly(s)) === n
}

// ── 13 hay 30 ──
const MISSPELL: Record<string, string> = {
  forty: 'fourty', fifteen: 'fiveteen', fifty: 'fivety', thirteen: 'threeteen', thirty: 'threety',
  eighteen: 'eightteen', eighty: 'eightty', ninety: 'ninty', nineteen: 'ninteen', twenty: 'twoty',
}

function teen(): Item {
  const d = 3 + rnd(7)
  const isTeen = Math.random() < 0.5
  const n = isTeen ? 10 + d : 10 * d
  const p = isTeen ? 10 * d : 10 + d
  const w = cardinal(n)
  const wrong: Wrong[] = [
    { say: cardinal(p), value: String(p), why: `${cardinal(p)} là ${p}.` },
    { say: MISSPELL[w] ?? ordinal(p), value: '', why: MISSPELL[w] ? `Sai chính tả — viết đúng là ${w}.` : `${ordinal(p)} là số thứ tự (thứ ${p}).` },
    { say: ordinal(n), value: '', why: `${ordinal(n)} là số thứ tự (thứ ${n}).` },
    { say: '', value: String(d), why: `${d} là ${cardinal(d)}.` },
    { say: '', value: String(11 * d), why: `${11 * d} là ${cardinal(11 * d)}.` },
  ]
  return { cat: 'teen', value: String(n), say: w, wrong, accept: acceptInt(n) }
}

const ONE_WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

// ── Số lớn ──
const MANT = [12, 15, 18, 25, 35, 45, 60, 75]

function big(): Item {
  const m = pick(MANT)
  const e = 2 + rnd(6)
  const n = m * 10 ** e
  const others = [n * 10, n / 10, n * 100, n / 100, n * 1000, n / 1000]
    .filter((x) => Number.isInteger(x) && x >= 100 && x < 1e11 && x !== n)
  const wrong: Wrong[] = shuffle(others).slice(0, 3).map((x) => ({ say: cardinal(x), value: bigNum(x), why: `${cardinal(x)} là ${bigNum(x)}.` }))
  const words = cardinal(n)
  // Lỗi thêm -s: "fifteen thousands"
  if (/(hundred|thousand|million|billion)/.test(words)) {
    const plural = words.replace(/\b(hundred|thousand|million|billion)\b/, '$1s')
    wrong.unshift({ say: plural, value: '', why: 'Có số đứng trước thì hundred / thousand / million không thêm -s (chỉ nói "thousands of people" khi không có số cụ thể).' })
  }
  const alt = n >= 1100 && n < 10000 && n % 1000 !== 0 && n % 100 === 0 ? `${under100(n / 100)} hundred` : undefined
  return { cat: 'big', value: bigNum(n), say: words, alt, wrong, accept: acceptInt(n) }
}

// ── Giá tiền ──
const CENTS = [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 80, 90, 95, 99]

function parsePrice(t: string): number | null {
  const cent = t.trim().toLowerCase().match(/^(\d{1,2})\s*(¢|c|cents?)$/)
  if (cent) return Number(cent[1])
  let s = t.trim().replace(/[$\s]/g, '').replace(/(dollars?|usd)$/i, '')
  // Bàn phím số kiểu Việt dùng dấu phẩy thập phân: 5,20 / 5,2 / ,75
  if (/^\d*,\d{1,2}$/.test(s)) s = s.replace(',', '.')
  if (/^\.\d/.test(s)) s = '0' + s
  s = s.replace(/,(?=\d{3}(\D|$))/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null
  return Math.round(Number(s) * 100)
}

function price(): Item {
  const roll = Math.random()
  const d = roll < 0.12 ? 0 : roll < 0.75 ? 1 + rnd(20) : 20 + rnd(80)
  const c = d === 0 ? pick(CENTS) : roll < 0.25 ? 0 : pick(CENTS)
  const say = priceWord(d, c)
  const alt = d && c ? `${cardinal(d)} ${c < 10 ? 'oh ' + ONE_WORD[c] : under100(c)}` : undefined
  const wrong: Wrong[] = []
  if (c && c % 10 === 0) {
    const c2 = c / 10
    wrong.push({ say: priceWord(d, c2), value: priceNum(d, c2), why: `.${String(c).padStart(2, '0')} là ${under100(c)} cents, không phải ${priceWord(0, c2)}.` })
  }
  if (c && c < 10) wrong.push({ say: priceWord(d, c * 10), value: priceNum(d, c * 10), why: `.0${c} là ${under100(c)} cents; .${c}0 mới là ${under100(c * 10)}.` })
  if (d && c && d !== c && c < 100 && d < 100) {
    wrong.push({ say: priceWord(c, d), value: priceNum(c, d), why: 'Đảo ngược: đô-la luôn đọc trước, xu đọc sau.' })
  }
  if (d > 1) {
    wrong.push({ say: say.replace(/dollars/, 'dollar'), value: '', why: 'Từ 2 đô-la trở lên phải là dollars (số nhiều).' })
  }
  if (d && c) {
    wrong.push({ say: `${cardinal(d)} point ${under100(c)} dollars`, value: '', why: `Tiền không đọc "point" — nói "${say}" hoặc gọn hơn "${alt}".` })
  }
  // Nhầm số khi nghe: đảo chữ số phần xu, -teen / -ty ở phần đô-la, lệch 10 đô-la
  const near: [number, number][] = []
  const rc = (c % 10) * 10 + Math.floor(c / 10)
  if (c >= 10 && rc !== c && rc < 100) near.push([d, rc])
  const pd = d >= 3 && d <= 9 ? 10 + d : d >= 13 && d <= 19 ? (d - 10) * 10 : d >= 30 && d <= 90 && d % 10 === 0 ? 10 + d / 10 : 0
  if (pd && c) near.push([pd, c])
  if (c) near.push([d + 10, c], [d, (c + 50) % 100 || 50])
  for (const [dd, cc] of near) {
    if (dd === d && cc === c) continue
    wrong.push({ say: priceWord(dd, cc), value: priceNum(dd, cc), why: `${priceWord(dd, cc)} là ${priceNum(dd, cc)}.` })
  }
  if (!c && d) {
    const d2 = d < 10 ? d * 10 : d * 100
    wrong.push({ say: priceWord(d2, 0), value: priceNum(d2, 0), why: `${priceWord(d2, 0)} là ${priceNum(d2, 0)}.` })
    const p = d >= 3 && d <= 9 ? 10 + d : d >= 13 && d <= 19 ? (d - 10) * 10 : d >= 30 && d <= 90 && d % 10 === 0 ? 10 + d / 10 : 0
    if (p) wrong.push({ say: priceWord(p, 0), value: priceNum(p, 0), why: `${cardinal(p)} là ${p}.` })
    if (d < 100) wrong.push({ say: priceWord(0, d), value: priceNum(0, d), why: `${priceWord(0, d)} là ${priceNum(0, d)} (cent là xu, 100 cents = 1 dollar).` })
    if (d === 1) wrong.push({ say: 'one dollars', value: '', why: '1 đô-la dùng số ít: one dollar.' })
  }
  if (!d) {
    wrong.push({ say: priceWord(c, 0), value: priceNum(c, 0), why: `Dưới 1 đô-la chỉ đọc số cent: ${priceNum(0, c)} = ${say}.` })
    if (c > 1) wrong.push({ say: `${under100(c)} cent`, value: '', why: 'Từ 2 cent trở lên là cents (số nhiều).' })
  }
  const cents = d * 100 + c
  return {
    cat: 'price', value: priceNum(d, c), say, alt, wrong,
    accept: (t) => parsePrice(t) === cents,
  }
}

// ── Năm ──
function year(): Item {
  const r = Math.random()
  const y = r < 0.15 ? 2000 + rnd(10) : r < 0.45 ? 2010 + rnd(26) : r < 0.6 ? 1800 + rnd(100) : 1900 + rnd(100)
  const lo = y % 100
  const cands: number[] = []
  if (lo >= 13 && lo <= 19) cands.push(y - lo + (lo - 10) * 10)
  if (lo >= 30 && lo % 10 === 0) cands.push(y - lo + 10 + lo / 10)
  const rev = (lo % 10) * 10 + Math.floor(lo / 10)
  if (rev !== lo && lo >= 10) cands.push(y - lo + rev)
  cands.push(y >= 2000 ? y - 100 : y + 100, y + 10, y - 1)
  if (y >= 2000 && y <= 2009) cands.push(2000 + (y % 10) * 10, 2000 + 10 + (y % 10))
  const wrong: Wrong[] = [...new Set(cands)].filter((x) => x !== y && x >= 1000 && x < 2100)
    .map((x) => ({ say: yearWord(x), value: String(x), why: `${yearWord(x)} là năm ${x}.` }))
  if (y >= 2000 && y <= 2009 && y % 10) {
    wrong.unshift({ say: `twenty ${ONE_WORD[y % 10]}`, value: '', why: `twenty ${ONE_WORD[y % 10]} là số ${20 + (y % 10)}; năm ${y} đọc two thousand and ${ONE_WORD[y % 10]}.` })
  }
  if (y < 2000 && lo >= 10) {
    wrong.unshift({ say: cardinal(y), value: '', why: `Năm không đọc như số đếm mà tách đôi: ${under100(Math.floor(y / 100))} + ${under100(lo)}.` })
  }
  const alt = y >= 2010 && y < 2100 ? `two thousand and ${under100(lo)}` : undefined
  return { cat: 'year', value: String(y), say: yearWord(y), alt, wrong, accept: acceptInt(y) }
}

// ── Giờ ──
const MINS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

// Nhận 7:45, 7.45, 7,45, 7h45, 7 45 và cả 745 / 0745 (bàn phím số không có dấu hai chấm)
function parseTime(t: string): [number, number] | null {
  const s = t.trim().toLowerCase().replace(/\s*(am|pm|a\.m\.|p\.m\.)$/, '')
  const m = s.match(/^(\d{1,2})(?:\s*[:.,h]\s*|\s+)(\d{2})$/) ?? s.match(/^(\d{1,2})(\d{2})$/) ?? s.match(/^(\d{1,2})()$/)
  if (!m) return null
  const h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  return h <= 24 && min < 60 ? [h, min] : null
}

function time(): Item {
  const h = 1 + rnd(12)
  const m = pick(MINS)
  const prev = ((h + 10) % 12) + 1
  const next = (h % 12) + 1
  const cands: [number, number][] = []
  if (m > 30) cands.push([prev, m])
  if (m && m !== 30) cands.push([h, 60 - m])
  if (m < 30) cands.push([prev, 60 - m || 30])
  cands.push([next, m], [prev, m])
  if (m === 30) cands.push([h, 0])
  if (m === 0) cands.push([h, 15], [h, 45])
  const seen = new Set<string>([timeNum(h, m)])
  const wrong: Wrong[] = []
  for (const [hh, mm] of cands) {
    const k = timeNum(hh, mm)
    if (seen.has(k)) continue
    seen.add(k)
    wrong.push({ say: timeWord(hh, mm), value: k, why: `${timeWord(hh, mm)} là ${k}.` })
  }
  return {
    cat: 'time', value: timeNum(h, m), say: timeWord(h, m), alt: m ? digitalTime(h, m) : undefined, wrong,
    accept: (t) => {
      const p = parseTime(t)
      return !!p && p[0] % 12 === h % 12 && p[1] === m
    },
  }
}

// ── Ngày tháng ──
const CONFUSE_MONTH: Record<number, number> = { 3: 5, 5: 3, 6: 7, 7: 6, 1: 6, 9: 12, 12: 9, 2: 11, 11: 2, 4: 8, 8: 4, 10: 1 }

function date(): Item {
  const m = 1 + rnd(12)
  const d = 1 + rnd(DAYS_IN[m - 1])
  const wrong: Wrong[] = [
    { say: `the ${cardinal(d)} of ${MONTHS[m - 1]}`, value: '', why: `Ngày dùng số thứ tự: ${ordinal(d)}, không phải ${cardinal(d)}.` },
  ]
  const cm = CONFUSE_MONTH[m]
  if (d <= DAYS_IN[cm - 1]) wrong.push({ say: dateWord(d, cm), value: dateNum(d, cm), why: `${MONTHS[cm - 1]} là tháng ${cm}.` })
  if (d <= 12 && d !== m && m <= DAYS_IN[d - 1]) wrong.push({ say: dateWord(m, d), value: dateNum(m, d), why: `Đảo ngày và tháng: ${dateWord(m, d)} là ngày ${m} tháng ${d}.` })
  if (d >= 13 && d <= 19 && (d - 10) * 10 <= DAYS_IN[m - 1]) {
    const d2 = (d - 10) * 10
    wrong.push({ say: dateWord(d2, m), value: dateNum(d2, m), why: `${ordinal(d2)} là ngày ${d2}.` })
  }
  const nm = (m % 12) + 1
  if (d <= DAYS_IN[nm - 1]) wrong.push({ say: dateWord(d, nm), value: dateNum(d, nm), why: `${MONTHS[nm - 1]} là tháng ${nm}.` })
  for (const d2 of [d + 10, d - 10, d + 1]) {
    if (d2 >= 1 && d2 <= DAYS_IN[m - 1]) wrong.push({ say: dateWord(d2, m), value: dateNum(d2, m), why: `${ordinal(d2)} là ngày ${d2}.` })
  }
  return {
    cat: 'date', value: dateNum(d, m), say: dateWord(d, m), alt: `${MONTHS[m - 1]} ${ordinal(d)}`, wrong,
    accept: () => false,
  }
}

// ── Số thứ tự ──
const ORDS = [1, 2, 3, 4, 5, 8, 9, 11, 12, 13, 15, 20, 21, 22, 23, 30, 31, 32, 40, 42, 50, 53, 65, 99, 100]

// Lỗi hay gặp: cứ thêm -th vào số đếm (oneth, twoth, twelveth, twentyth)
const naiveOrd = (n: number) => cardinal(n) + 'th'

function ord(): Item {
  const n = pick(ORDS)
  const right = ordinal(n)
  const wrong: Wrong[] = []
  const naive = naiveOrd(n)
  if (naive !== right) wrong.push({ say: naive, value: '', why: `Sai dạng — ${n} là ${right}.` })
  wrong.push({ say: cardinal(n), value: '', why: `${cardinal(n)} là số đếm; số thứ tự là ${right}.` })
  const near = [n + 1, n - 1, n + 10, n >= 13 && n <= 19 ? (n - 10) * 10 : n + 2].filter((x) => x > 0 && x !== n)
  for (const x of near) wrong.push({ say: ordinal(x), value: ordSuffix(x), why: `${ordinal(x)} là ${ordSuffix(x)}.` })
  return { cat: 'ord', value: ordSuffix(n), say: right, wrong, accept: (t) => digitsOnly(t).replace(/(st|nd|rd|th)$/i, '') === String(n) }
}

const MAKERS: Record<CatId, () => Item> = { teen, big, price, year, time, date, ord }

export function makeItem(cat: CatId): Item {
  return MAKERS[cat]()
}

export interface Question {
  item: Item
  mode: ModeId
  // Phương án: cách đọc (read) hoặc con số (listen)
  options: string[]
  answer: string
}

export function makeQuestion(item: Item, mode: ModeId): Question {
  if (mode === 'type') return { item, mode, options: [], answer: item.value }
  const field = mode === 'read' ? 'say' : 'value'
  const answer = item[field]
  const seen = new Set([answer.toLowerCase(), (item.alt ?? '').toLowerCase()])
  const opts: string[] = []
  // Giữ 2 phương án sai đầu (lỗi điển hình), trộn phần còn lại
  const list = [...item.wrong.slice(0, 2), ...shuffle(item.wrong.slice(2))]
  for (const w of list) {
    const v = w[field]
    if (!v || seen.has(v.toLowerCase())) continue
    seen.add(v.toLowerCase())
    opts.push(v)
    if (opts.length === 3) break
  }
  return { item, mode, options: shuffle([answer, ...opts]), answer }
}

export const ROUND = 10

export function buildRound(mode: ModeId, cats: CatId[]): Question[] {
  const pool = (cats.length ? cats : CATS.map((c) => c.id)).filter((c) => mode !== 'type' || TYPE_CATS.includes(c))
  const use = pool.length ? pool : TYPE_CATS
  // Xoay vòng các nhóm đã chọn để lượt nào cũng đủ loại
  const order: CatId[] = []
  while (order.length < ROUND * 4) order.push(...shuffle(use))
  const out: Question[] = []
  let k = 0
  while (out.length < ROUND && k < order.length) {
    const q = makeQuestion(makeItem(order[k++]), mode)
    if (mode !== 'type' && q.options.length < 4) continue
    if (out.some((x) => x.item.value === q.item.value)) continue
    out.push(q)
  }
  return shuffle(out)
}

export function whyWrong(item: Item, picked: string, mode: ModeId): string {
  const field = mode === 'read' ? 'say' : 'value'
  return item.wrong.find((w) => w[field] === picked)?.why ?? ''
}

export const catOf = (id: CatId) => CATS.find((c) => c.id === id)!
