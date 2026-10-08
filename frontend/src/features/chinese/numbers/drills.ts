import { DIGITS, WEEKDAYS, age, count, date, groups4, phone, price, priceFormal, splitMoney, time, variants, year, yuanLabel, zh } from './zhnum'

export type ModeId = 'price' | 'listen' | 'count' | 'mixed'

export type Visual =
  | { type: 'price'; amount: number; emoji: string; label: string }
  | { type: 'reading'; text: string }
  | { type: 'listen' }
  | { type: 'count'; emoji: string; n: number; noun: string; nounVi: string }
  | { type: 'clock'; h: number; m: number }
  | { type: 'date'; month: number; day: number }
  | { type: 'weekday'; vi: string }
  | { type: 'year'; y: number }
  | { type: 'age'; n: number }
  | { type: 'phone'; digits: string }

export interface ZOption {
  text: string
  why?: string
}

export interface ZQuestion {
  id: string
  mode: ModeId
  input: 'choice' | 'digits'
  ask: string
  visual: Visual
  options: ZOption[]
  answer: string
  // Câu tiếng Trung để đọc lên và hiện ở lời giải
  say: string
  shown?: string
  zhOptions: boolean
  note: string
}

export const ROUND = 10

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[k]] = [a[k], a[i]]
  }
  return a
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))

let seq = 0
const qid = () => `z${++seq}`

export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// 3 phương án sai khác nhau, không trùng đáp án và không trùng cách nói đúng khác
function assemble(answer: string, wrong: (ZOption | null)[], alsoRight: string[] = []): ZOption[] {
  const seen = new Set([answer, ...alsoRight])
  const picked: ZOption[] = []
  for (const w of wrong) {
    if (!w || !w.text || seen.has(w.text)) continue
    seen.add(w.text)
    picked.push(w)
    if (picked.length === 3) break
  }
  return shuffle([{ text: answer }, ...picked])
}

// ── Đọc giá ──

interface ShopItem { emoji: string; vi: string; min: number; max: number; step: number; fixed?: number[] }

const SHOP: ShopItem[] = [
  { emoji: '🧋', vi: 'Trà sữa', min: 12, max: 22, step: 0.5 },
  { emoji: '☕', vi: 'Cà phê', min: 18, max: 38, step: 1 },
  { emoji: '🥟', vi: 'Bánh bao', min: 1.5, max: 4, step: 0.5 },
  { emoji: '🍜', vi: 'Bát mì', min: 12, max: 28, step: 1 },
  { emoji: '🍎', vi: 'Táo (1 cân)', min: 5.8, max: 12.8, step: 1 },
  { emoji: '🚇', vi: 'Vé tàu điện', min: 2, max: 8, step: 1 },
  { emoji: '🚕', vi: 'Taxi', min: 13, max: 68.5, step: 0.5 },
  { emoji: '🎬', vi: 'Vé xem phim', min: 35, max: 80, step: 5 },
  { emoji: '🎫', vi: 'Vé tham quan', min: 0, max: 0, step: 1, fixed: [105, 108, 120, 150, 205, 160, 102, 180] },
  { emoji: '🧥', vi: 'Áo khoác', min: 0, max: 0, step: 1, fixed: [208, 305, 350, 506, 560, 1050, 1500] },
  { emoji: '🏨', vi: 'Phòng khách sạn', min: 168, max: 588, step: 10 },
  { emoji: '👟', vi: 'Giày thể thao', min: 199, max: 899, step: 100 },
  { emoji: '🛵', vi: 'Xe máy điện', min: 2600, max: 8800, step: 200 },
  { emoji: '🏠', vi: 'Tiền thuê nhà / tháng', min: 1500, max: 8500, step: 500 },
  { emoji: '📱', vi: 'Điện thoại', min: 1999, max: 6999, step: 1000 },
  { emoji: '💻', vi: 'Máy tính xách tay', min: 4999, max: 12999, step: 1000 },
  { emoji: '🚗', vi: 'Ô tô', min: 69800, max: 259800, step: 10000 },
]

export function shopPrice(item: ShopItem): number {
  if (item.fixed) return pick(item.fixed)
  const v = item.min + item.step * randInt(0, Math.round((item.max - item.min) / item.step))
  return Math.round(v * 100) / 100
}

// Nói tắt hàng cuối: 150 → 一百五, 1500 → 一千五, 15000 → 一万五 (cũng đúng khi nói)
export function shortForm(yuan: number): string {
  if (yuan < 100) return ''
  const s = String(yuan)
  const tail = s.slice(2)
  if (!/^0+$/.test(tail) || s[1] === '0') return ''
  const full = zh(yuan, { liang: true })
  return full.replace(/[十百千万]$/, '')
}

// Đọc theo nghìn như tiếng Việt: 69.800 → 六十九千八百
export function thousandStyle(yuan: number): string {
  if (yuan < 10_000) return ''
  const t = Math.floor(yuan / 1000)
  const r = yuan % 1000
  return zh(t) + '千' + (r ? (r < 100 ? '零' : '') + zh(r) : '')
}

// Bỏ 零 ở giữa: 105 → 一百五 (thực ra là 150)
export function dropZero(yuan: number): string {
  const full = zh(yuan, { liang: true })
  if (!full.includes('零')) return ''
  return full.replace(/零/g, '')
}

const otherAmount = (n: number) => `Đây là ${yuanLabel(n)} — lệch hàng chữ số.`

function rightForms(amount: number): string[] {
  const { yuan, jiao, fen } = splitMoney(amount)
  const out = new Set<string>()
  for (const v of variants(price(amount))) out.add(v)
  out.add(price(amount, true))
  out.add(priceFormal(amount))
  const short = shortForm(yuan)
  if (short && !jiao && !fen) for (const v of variants(short + '块')) out.add(v)
  return [...out]
}

export function priceWrongs(amount: number): ZOption[] {
  const { yuan, jiao, fen } = splitMoney(amount)
  const rest = yuan ? price(amount).replace(/^.*?块/, '') : ''
  const out: ZOption[] = []
  const ts = thousandStyle(yuan)
  if (ts) out.push({ text: ts + '块' + rest, why: 'Đếm theo nghìn như tiếng Việt. Tiếng Trung gom 4 chữ số một nhóm: 万 = vạn = 10.000.' })
  const dz = dropZero(yuan)
  if (dz) out.push({ text: dz + '块' + rest, why: `Thiếu 零: ${dz} là cách nói tắt của ${fmt(Number(String(yuan).replace(/0/g, '').padEnd(String(yuan).length, '0')))}. Số 0 ở giữa phải đọc 零 (như "linh, lẻ").` })
  if (yuan === 2) out.push({ text: '二块' + rest, why: 'Trước lượng từ (块), số 2 đọc 两: 两块.' })
  if (jiao && !fen && yuan) out.push({ text: price(yuan) + DIGITS[jiao] + '分', why: `${DIGITS[jiao]}分 là ${jiao} xu (0,0${jiao} tệ); 0,${jiao} tệ là ${DIGITS[jiao]}毛 — khi đứng cuối thì bỏ 毛: ${price(amount)}.` })
  if (amount * 10 <= 9_999_999) out.push({ text: price(amount * 10), why: otherAmount(amount * 10) })
  if (yuan >= 20 && !jiao && !fen) out.push({ text: price(amount / 10), why: otherAmount(amount / 10) })
  // Đọc từng chữ số như số điện thoại
  if (yuan >= 10) out.push({ text: Array.from(String(yuan)).map((c) => DIGITS[Number(c)]).join('') + '块' + rest, why: 'Giá tiền đọc cả số (十, 百, 千, 万), không đọc từng chữ số.' })
  if (yuan > 0 && yuan < 10 && !jiao && !fen) out.push({ text: (yuan === 2 ? '两' : DIGITS[yuan]) + '毛', why: '毛 là hào (0,1 tệ); đơn vị tệ khi nói là 块.' })
  if (amount * 100 <= 9_999_999) out.push({ text: price(amount * 100), why: otherAmount(amount * 100) })
  return out
}

function priceNote(amount: number): string {
  const { yuan, jiao, fen } = splitMoney(amount)
  const parts: string[] = []
  if (yuan >= 10_000) parts.push(`Tách 4 số từ phải: ${groups4(yuan).join(' | ')} → nhóm trước vạch đọc kèm 万.`)
  else if (String(yuan).slice(1, -1).includes('0')) parts.push('Số 0 ở giữa đọc 零.')
  if (jiao || fen) parts.push('Nói: 块 (tệ) · 毛 (hào = 0,1) · 分 (xu = 0,01); hào đứng cuối thì bỏ chữ 毛.')
  else parts.push('Nói thường ngày dùng 块; trên hoá đơn, bảng giá viết 元.')
  if (yuan === 2 || String(yuan).startsWith('2')) parts.push('Số 2 đứng đầu trước 块, 百, 千, 万 thường đọc 两.')
  return parts.join(' ')
}

export function priceQuestion(item: ShopItem, reverse: boolean): ZQuestion {
  const amount = shopPrice(item)
  const right = price(amount)
  if (reverse) {
    const { yuan } = splitMoney(amount)
    const dz = dropZero(yuan) ? Number(String(yuan).replace(/0/g, '').padEnd(String(yuan).length, '0')) : 0
    const r2 = (x: number) => Math.round(x * 100) / 100
    const nums = [dz, amount * 10, amount >= 20 ? amount / 10 : amount * 100, amount * 100, amount * 1000, amount / 10, amount / 100].map(r2)
    const opts = assemble(yuanLabel(amount), nums.filter((x) => x >= 0.1 && x <= 99_999_999 && x !== amount).map((x) => ({
      text: yuanLabel(x), why: `${yuanLabel(x)} đọc là ${price(x)}.`,
    })))
    return {
      id: qid(), mode: 'price', input: 'choice', ask: 'Người bán nói giá này — bảng giá nào đúng?',
      visual: { type: 'reading', text: right }, options: opts, answer: yuanLabel(amount), say: right,
      zhOptions: false, note: priceNote(amount),
    }
  }
  const wrong = shuffle(priceWrongs(amount)).sort((a, b) => Number(/lệch hàng/.test(a.why ?? '')) - Number(/lệch hàng/.test(b.why ?? '')))
  return {
    id: qid(), mode: 'price', input: 'choice', ask: 'Đọc giá này bằng tiếng Trung',
    visual: { type: 'price', amount, emoji: item.emoji, label: item.vi }, options: assemble(right, wrong, rightForms(amount)),
    answer: right, say: right, zhOptions: true, note: priceNote(amount),
  }
}

export function priceRound(size = ROUND): ZQuestion[] {
  const items = shuffle(SHOP).slice(0, size)
  while (items.length < size) items.push(pick(SHOP))
  const reverseAt = new Set(shuffle(Array.from({ length: size }, (_, i) => i)).slice(0, 3))
  return items.map((it, i) => priceQuestion(it, reverseAt.has(i)))
}

// ── Nghe số ──

const HV_DIGIT: Record<string, string> = {
  一: 'nhất', 二: 'nhị', 两: 'lưỡng', 三: 'tam', 四: 'tứ', 五: 'ngũ', 六: 'lục', 七: 'thất', 八: 'bát', 九: 'cửu',
  十: 'thập', 百: 'bách', 千: 'thiên', 万: 'vạn', 零: 'linh', 亿: 'ức',
}

export function hanViet(reading: string): string {
  return Array.from(reading).map((c) => HV_DIGIT[c] ?? '').filter(Boolean).join(' ')
}

export function listenQuestion(kind: 'small' | 'price' | 'big' | 'year' | 'phone'): ZQuestion {
  let say = ''
  let answer = ''
  let shown = ''
  let note = ''
  if (kind === 'phone') {
    const digits = `1${pick(['3', '5', '8'])}${randInt(0, 9)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}`
    answer = digits.replace(/\D/g, '')
    say = phone(digits)
    shown = digits
    note = 'Số điện thoại đọc từng chữ số; số 1 thường đọc 幺 (yāo) cho khỏi lẫn với 七 (qī).'
  } else if (kind === 'year') {
    const y = randInt(1980, 2030)
    answer = String(y)
    say = year(y)
    shown = `năm ${y}`
    note = 'Năm đọc từng chữ số rồi thêm 年: 二零二五年.'
  } else {
    const n = kind === 'small'
      ? (Math.random() < 0.5 ? randInt(11, 99) : pick([randInt(101, 109), randInt(110, 999)]))
      : kind === 'price'
        ? pick([randInt(1, 99) * 10, randInt(10, 99) * 100, randInt(101, 999)])
        : pick([randInt(10, 99) * 1000, randInt(11, 99) * 10_000, randInt(101, 999) * 100])
    answer = String(n)
    shown = fmt(n) + (kind === 'small' ? '' : ' tệ')
    say = kind === 'small' ? zh(n) : price(n)
    note = n >= 10_000
      ? `Nghe thấy 万 là có vạch chia 4 số: ${groups4(n).join(' | ')}.`
      : `Ghép y như Hán–Việt: ${zh(n)} = ${hanViet(zh(n))}.`
  }
  return {
    id: qid(), mode: 'listen', input: 'digits', ask: 'Nghe rồi gõ lại các chữ số', visual: { type: 'listen' },
    options: [], answer, say, shown, zhOptions: false, note,
  }
}

export function listenRound(size = ROUND): ZQuestion[] {
  const kinds: Parameters<typeof listenQuestion>[0][] = ['small', 'small', 'price', 'price', 'price', 'big', 'big', 'big', 'year', 'phone']
  return shuffle(kinds.slice(0, size)).map(listenQuestion)
}

// ── Lượng từ ──

interface CountItem { noun: string; vi: string; emoji: string; measure: string; wrong: string[] }

// Lượng từ sai chọn tay, tránh những lượng từ người Trung vẫn dùng (个 dùng được cho rất nhiều thứ nên không bao giờ làm phương án sai)
export const COUNT_ITEMS: CountItem[] = [
  { noun: '苹果', vi: 'quả táo', emoji: '🍎', measure: '个', wrong: ['本', '张', '双'] },
  { noun: '人', vi: 'người', emoji: '🧑', measure: '个', wrong: ['只', '本', '张'] },
  { noun: '鸡蛋', vi: 'quả trứng', emoji: '🥚', measure: '个', wrong: ['本', '张', '条'] },
  { noun: '书', vi: 'quyển sách', emoji: '📕', measure: '本', wrong: ['杯', '条', '双'] },
  { noun: '咖啡', vi: 'ly cà phê', emoji: '☕', measure: '杯', wrong: ['本', '条', '张'] },
  { noun: '茶', vi: 'tách trà', emoji: '🍵', measure: '杯', wrong: ['本', '条', '双'] },
  { noun: '啤酒', vi: 'chai bia', emoji: '🍾', measure: '瓶', wrong: ['本', '张', '双'] },
  { noun: '衣服', vi: 'cái áo', emoji: '👕', measure: '件', wrong: ['本', '杯', '辆'] },
  { noun: '裤子', vi: 'cái quần', emoji: '👖', measure: '条', wrong: ['本', '杯', '辆'] },
  { noun: '鱼', vi: 'con cá', emoji: '🐟', measure: '条', wrong: ['本', '杯', '辆'] },
  { noun: '票', vi: 'tấm vé', emoji: '🎫', measure: '张', wrong: ['本', '杯', '辆'] },
  { noun: '猫', vi: 'con mèo', emoji: '🐱', measure: '只', wrong: ['本', '杯', '张'] },
  { noun: '鞋', vi: 'đôi giày', emoji: '👟', measure: '双', wrong: ['本', '杯', '张'] },
  { noun: '筷子', vi: 'đôi đũa', emoji: '🥢', measure: '双', wrong: ['本', '杯', '辆'] },
  { noun: '车', vi: 'chiếc xe', emoji: '🚗', measure: '辆', wrong: ['本', '杯', '双'] },
  { noun: '自行车', vi: 'chiếc xe đạp', emoji: '🚲', measure: '辆', wrong: ['本', '杯', '双'] },
  { noun: '米饭', vi: 'bát cơm', emoji: '🍚', measure: '碗', wrong: ['本', '张', '辆'] },
  { noun: '面条', vi: 'bát mì', emoji: '🍜', measure: '碗', wrong: ['本', '张', '辆'] },
]

export const MEASURE_VI: Record<string, string> = {
  个: 'cái, quả, người (chung nhất)', 本: 'quyển (sách, vở)', 杯: 'cốc, ly', 瓶: 'chai, lọ', 件: 'chiếc (áo), việc',
  条: 'vật dài (quần, cá, đường)', 张: 'tờ, tấm (vật phẳng)', 只: 'con (vật nhỏ), chiếc (một trong đôi)',
  双: 'đôi', 辆: 'chiếc (xe)', 碗: 'bát, tô', 位: 'vị (người, lịch sự)',
}

export function countQuestion(item: CountItem, n: number): ZQuestion {
  const right = `${count(n)}${item.measure}${item.noun}`
  const wrong: (ZOption | null)[] = [
    n === 2 ? { text: `二${item.measure}${item.noun}`, why: 'Trước lượng từ, số 2 luôn đọc 两 (liǎng), không dùng 二.' } : null,
    { text: `${count(n)}${item.noun}`, why: 'Thiếu lượng từ. Giống tiếng Việt ("hai quyển sách"), giữa số và danh từ luôn có lượng từ.' },
    ...shuffle(item.wrong).map((m) => ({ text: `${count(n)}${m}${item.noun}`, why: `${m} dùng cho ${MEASURE_VI[m]}; ${item.noun} đi với ${item.measure} (${MEASURE_VI[item.measure]}).` })),
  ]
  return {
    id: qid(), mode: 'count', input: 'choice', ask: 'Đếm và chọn cách nói đúng',
    visual: { type: 'count', emoji: item.emoji, n, noun: item.noun, nounVi: item.vi },
    options: assemble(right, wrong), answer: right, say: right, zhOptions: true,
    note: `Số + lượng từ + danh từ. ${item.measure} = ${MEASURE_VI[item.measure]}.${n === 2 ? ' Số 2 trước lượng từ đọc 两.' : ''}`,
  }
}

export function countRound(size = ROUND): ZQuestion[] {
  const items = shuffle(COUNT_ITEMS).slice(0, size)
  while (items.length < size) items.push(pick(COUNT_ITEMS))
  // Số 2 là chỗ hay sai (两 / 二) nên ra nhiều hơn
  return items.map((it) => countQuestion(it, Math.random() < 0.35 ? 2 : Math.random() < 0.3 ? 1 : randInt(3, 10)))
}

// ── Giờ · ngày · thứ · năm · tuổi · điện thoại ──

const hourZh = (h: number) => (h === 2 ? '两' : zh(h))

export function timeQuestion(h: number, m: number): ZQuestion {
  const style: 'num' | 'half' | 'quarter' = m === 30 && Math.random() < 0.6 ? 'half' : m === 15 && Math.random() < 0.4 ? 'quarter' : 'num'
  const right = time(h, m, style)
  const alsoRight = [time(h, m, 'num'), time(h, m, 'half'), time(h, m, 'quarter'), m ? time(h, m, 'num').replace(/分$/, '') : '']
  const wrong: (ZOption | null)[] = [
    h === 2 ? { text: right.replace(/^两/, '二'), why: '2 giờ nói 两点 (số 2 trước 点 dùng 两).' } : null,
    m === 30 ? { text: `${hourZh(h)}点一刻`, why: '一刻 = 15 phút; 30 phút là 半 (hoặc 三十分).' } : null,
    m === 15 ? { text: `${hourZh(h)}点半`, why: '半 = 30 phút (rưỡi); 15 phút là 十五分 hoặc 一刻.' } : null,
    m && m !== 30 && m !== 15 ? { text: `${hourZh(h)}点半`, why: `半 là 30 phút; ${m} phút là ${zh(m)}分.` } : null,
    m ? { text: `${hourZh(h)}点${zh(m)}分钟`, why: '分钟 là số phút (đợi 十分钟 = đợi 10 phút); chỉ giờ thì dùng 分.' } : null,
    !m ? { text: `${hourZh(h)}点半`, why: '半 nghĩa là rưỡi (thêm 30 phút).' } : null,
    !m ? { text: `${hourZh(h)}分`, why: '分 là phút; giờ dùng 点.' } : null,
    !m ? { text: `${hourZh(h)}点一刻`, why: '一刻 là 15 phút.' } : null,
    { text: `${zh(h)}个点`, why: '个 là lượng từ đếm đồ vật; "mấy giờ" chỉ cần số + 点.' },
  ]
  const note = m === 0
    ? `Giờ đúng: số + 点${h === 2 ? ' (2 giờ là 两点)' : ''}. Có thể thêm 钟: ${right}钟.`
    : m === 30
      ? `30 phút nói 半 hoặc 三十分: ${time(h, 30, 'half')} = ${time(h, 30)}.`
      : m === 15
        ? `15 phút nói 十五分 hoặc 一刻: ${time(h, 15)} = ${time(h, 15, 'quarter')}.`
        : `Số giờ + 点 + số phút + 分 (chữ 分 cuối có thể bỏ khi nói).`
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Bây giờ là mấy giờ?', visual: { type: 'clock', h, m },
    options: assemble(right, wrong, alsoRight.filter(Boolean)), answer: right, say: right, zhOptions: true, note,
  }
}

const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function dateQuestion(month: number, day: number): ZQuestion {
  const right = date(month, day)
  const wrong: (ZOption | null)[] = [
    { text: `${zh(day)}号${zh(month)}月`, why: 'Tiếng Trung nói tháng trước, ngày sau — ngược với tiếng Việt.' },
    { text: `${zh(month)}个月${zh(day)}号`, why: '个月 dùng để đếm số tháng (三个月 = ba tháng), không phải tên tháng.' },
    month === 2 ? { text: `两月${zh(day)}号`, why: 'Tên tháng là số thứ tự: tháng 2 là 二月, không dùng 两.' } : null,
    { text: `${zh(month)}月${zh(day)}天`, why: '天 là số ngày (三天 = ba ngày); ngày trong tháng dùng 号 (nói) hoặc 日 (viết).' },
  ]
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Đọc ngày này bằng tiếng Trung', visual: { type: 'date', month, day },
    options: assemble(right, wrong, [date(month, day, true)]), answer: right, say: right, zhOptions: true,
    note: `Tháng trước, ngày sau: ${right} (nói) = ${date(month, day, true)} (viết).`,
  }
}

export function weekdayQuestion(i: number): ZQuestion {
  const d = WEEKDAYS[i]
  const right = d.zh
  const off = WEEKDAYS[(i + 1) % 7]
  const wrong: (ZOption | null)[] = [
    i < 6 ? { text: `星期${['二', '三', '四', '五', '六', '七'][i]}`, why: `Đừng lấy nguyên con số trong tên thứ: tiếng Trung gọi Thứ Hai là 星期一, nên luôn lệch 1 — ${d.vi} là ${d.zh}.` } : null,
    i === 6 ? { text: '星期七', why: 'Không có 星期七; Chủ nhật là 星期天 hoặc 星期日.' } : null,
    { text: off.zh, why: `${off.zh} là ${off.vi}.` },
    ...shuffle(WEEKDAYS.filter((_, k) => k !== i)).map((x) => ({ text: x.zh, why: `${x.zh} là ${x.vi}.` })),
  ]
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Thứ này trong tiếng Trung là gì?', visual: { type: 'weekday', vi: d.vi },
    options: assemble(right, wrong, d.alt ? [d.alt] : []), answer: right, say: right, zhOptions: true,
    note: 'Thứ Hai → 星期一, Thứ Ba → 星期二… lấy số thứ của tiếng Việt trừ 1. Chủ nhật: 星期天 / 星期日.',
  }
}

export function yearQuestion(y: number): ZQuestion {
  const right = year(y)
  const digits = String(y)
  const swapped = digits.slice(0, 2) + digits[3] + digits[2]
  const wrong: (ZOption | null)[] = [
    { text: zh(y, { liang: true }) + '年', why: 'Năm đọc từng chữ số (二零二五年), không đọc như một số đếm.' },
    { text: zh(y) + '年', why: 'Năm đọc từng chữ số, không đọc thành "hai nghìn không trăm…".' },
    swapped !== digits ? { text: year(Number(swapped)), why: `Câu này đọc năm ${swapped}.` } : null,
    { text: Array.from(digits).map((c) => (c === '2' ? '两' : DIGITS[Number(c)])).join('') + '年', why: 'Khi đọc từng chữ số, 2 là 二, không dùng 两.' },
    { text: year(y + 10), why: `Câu này đọc năm ${y + 10}.` },
    { text: year(y - 1), why: `Câu này đọc năm ${y - 1}.` },
  ]
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Đọc năm này', visual: { type: 'year', y },
    options: assemble(right, wrong), answer: right, say: right, zhOptions: true,
    note: 'Năm: đọc từng chữ số rồi thêm 年. 0 đọc 零.',
  }
}

export function ageQuestion(n: number): ZQuestion {
  const right = age(n)
  const other = n + 10 <= 99 ? n + 10 : n - 10
  const wrong: (ZOption | null)[] = [
    n === 2 ? { text: '二岁', why: '2 tuổi nói 两岁 (số 2 trước 岁 dùng 两).' } : null,
    { text: `${count(n)}年`, why: '年 là năm (khoảng thời gian: 三年 = ba năm); tuổi dùng 岁.' },
    n >= 10 ? { text: Array.from(String(n)).map((c) => DIGITS[Number(c)]).join('') + '岁', why: 'Tuổi đọc cả số (二十五), không đọc từng chữ số.' } : null,
    { text: age(other), why: `Câu này là ${other} tuổi.` },
    { text: `${count(n)}个岁`, why: '岁 đã là lượng từ, không thêm 个.' },
  ]
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Người này bao nhiêu tuổi?', visual: { type: 'age', n },
    options: assemble(right, wrong), answer: right, say: right, zhOptions: true,
    note: `Số + 岁${n === 2 ? ' (2 tuổi: 两岁)' : ''}. Hỏi tuổi: 你几岁？(trẻ em) · 你多大？ · 您多大年纪？(người lớn tuổi).`,
  }
}

export function phoneQuestion(digits: string): ZQuestion {
  const right = phone(digits)
  const groups = digits.split('-')
  const chars = Array.from(digits)
  const slots = chars.map((c, i) => (i >= 4 && /\d/.test(c) ? i : -1)).filter((i) => i >= 0)
  const at = pick(slots)
  const other = pick([...'0123456789'].filter((d) => d !== chars[at]))
  const misread = chars.map((c, i) => (i === at ? other : c)).join('')
  const wrong: (ZOption | null)[] = [
    { text: groups.map((g) => zh(Number(g))).join(' '), why: 'Số điện thoại đọc từng chữ số, không đọc thành số lớn (百, 千…).' },
    digits.includes('2') ? { text: right.replace(/二/g, '两'), why: 'Đọc từng chữ số thì 2 là 二, không dùng 两.' } : null,
    { text: phone(misread), why: `Câu này đọc số ${misread} — sai một chữ số.` },
    { text: right.replace(/幺/g, '七'), why: '幺 (yāo) là số 1; 七 là số 7.' },
  ]
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Đọc số điện thoại này', visual: { type: 'phone', digits },
    options: assemble(right, wrong, [phone(digits, false)]), answer: right, say: right, zhOptions: true,
    note: 'Đọc từng chữ số; số 1 thường đọc 幺 (yāo), đọc 一 cũng được. 0 đọc 零.',
  }
}

const randPhone = () => `1${pick(['3', '5', '8'])}${randInt(0, 9)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}`

export function mixedRound(size = ROUND): ZQuestion[] {
  const kinds = ['time', 'date', 'week', 'age', 'phone', 'time', 'year', 'week', 'date', 'age']
  return shuffle(kinds.slice(0, size)).map((k) => {
    if (k === 'time') return timeQuestion(Math.random() < 0.3 ? 2 : randInt(1, 12), pick([0, 0, 15, 30, 30, 45, 10, 20, 40, 50]))
    if (k === 'date') {
      const month = Math.random() < 0.3 ? 2 : randInt(1, 12)
      return dateQuestion(month, randInt(1, DAYS_IN[month - 1]))
    }
    if (k === 'week') return weekdayQuestion(randInt(0, 6))
    if (k === 'year') return yearQuestion(randInt(1985, 2030))
    if (k === 'age') return ageQuestion(Math.random() < 0.3 ? 2 : randInt(3, 69))
    return phoneQuestion(randPhone())
  })
}

export function buildRound(mode: ModeId): ZQuestion[] {
  if (mode === 'price') return priceRound()
  if (mode === 'listen') return listenRound()
  if (mode === 'count') return countRound()
  return mixedRound()
}
