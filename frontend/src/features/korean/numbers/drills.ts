import {
  MONTHS, SINO_DIGITS, age, date, groups4, native, nativeAdn, phone, price, sino, time,
} from './numerals'

export type ModeId = 'price' | 'listen' | 'count' | 'mixed'

export type Visual =
  | { type: 'price'; n: number; emoji: string; label: string }
  | { type: 'reading'; text: string }
  | { type: 'listen' }
  | { type: 'count'; emoji: string; n: number; noun: string; nounVi: string }
  | { type: 'clock'; h: number; m: number }
  | { type: 'date'; month: number; day: number }
  | { type: 'age'; n: number }
  | { type: 'phone'; digits: string }

export interface NOption {
  text: string
  // Vì sao phương án này sai: hiện ra khi người học chọn nhầm.
  why?: string
}

export interface NQuestion {
  id: string
  mode: ModeId
  input: 'choice' | 'digits'
  ask: string
  visual: Visual
  options: NOption[]
  answer: string
  // Cách đọc đúng bằng tiếng Hàn (để phát âm và hiện ở phần giải thích).
  say: string
  // Đáp án hiển thị cho kiểu gõ số (35,000 thay vì 35000).
  shown?: string
  koOptions: boolean
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
const qid = () => `n${++seq}`

// 35000 → '35,000' (cách viết trên bảng giá ở Hàn).
export const krNum = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// Lấy 3 phương án sai khác nhau, không trùng đáp án đúng (và không trùng cách nói đúng khác, nếu có).
function assemble(answer: string, wrong: (NOption | null)[], alsoRight: string[] = []): NOption[] {
  const seen = new Set([answer, ...alsoRight])
  const picked: NOption[] = []
  for (const w of wrong) {
    if (!w || !w.text || seen.has(w.text)) continue
    seen.add(w.text)
    picked.push(w)
    if (picked.length === 3) break
  }
  return shuffle([{ text: answer }, ...picked])
}

// ── Đọc giá ──────────────────────────────────────────────

interface ShopItem { emoji: string; vi: string; min: number; max: number; step: number }

const SHOP: ShopItem[] = [
  { emoji: '☕', vi: 'Cà phê', min: 3000, max: 6500, step: 500 },
  { emoji: '🍙', vi: 'Cơm nắm', min: 1000, max: 2500, step: 100 },
  { emoji: '🚇', vi: 'Vé tàu điện', min: 1400, max: 1600, step: 50 },
  { emoji: '🍜', vi: 'Mì lạnh', min: 8000, max: 13000, step: 500 },
  { emoji: '🍓', vi: 'Hộp dâu tây', min: 8900, max: 15900, step: 1000 },
  { emoji: '🎫', vi: 'Vé xem phim', min: 12000, max: 16000, step: 1000 },
  { emoji: '💇', vi: 'Cắt tóc', min: 10000, max: 25000, step: 1000 },
  { emoji: '🚕', vi: 'Taxi', min: 4800, max: 23000, step: 100 },
  { emoji: '🍗', vi: 'Gà rán', min: 16000, max: 24000, step: 1000 },
  { emoji: '🎁', vi: 'Quà lưu niệm', min: 5000, max: 45000, step: 5000 },
  { emoji: '👟', vi: 'Giày thể thao', min: 39000, max: 129000, step: 1000 },
  { emoji: '🧥', vi: 'Áo khoác', min: 59000, max: 189000, step: 1000 },
  { emoji: '🏨', vi: 'Phòng khách sạn', min: 65000, max: 250000, step: 5000 },
  { emoji: '📱', vi: 'Điện thoại', min: 890000, max: 1500000, step: 10000 },
]

export function shopPrice(item: ShopItem): number {
  return item.min + item.step * randInt(0, Math.floor((item.max - item.min) / item.step))
}

// Đọc theo nhóm nghìn như tiếng Việt: 35.000 = "35 nghìn" → 삼십오천.
export function viet3(n: number): string {
  if (n < 10_000) return ''
  const m = Math.floor(n / 1_000_000)
  const t = n >= 1_000_000 ? Math.floor(n / 1000) % 1000 : Math.floor(n / 1000)
  const r = n % 1000
  const parts: string[] = []
  if (m) parts.push(sino(m * 1_000_000))
  if (t) parts.push(sino(t) + '천')
  if (r) parts.push(sino(r))
  return parts.join(' ')
}

// Dùng số thuần Hàn cho chữ số đầu: 35.000 → 세만 오천.
export function nativeLead(n: number): string {
  if (n < 10) return ''
  const reading = sino(n)
  const d = Number(String(n)[0])
  if (d === 1) return reading.startsWith('일') ? '한' + reading.slice(1) : '한' + reading
  return reading.startsWith(SINO_DIGITS[d]) ? nativeAdn(d) + reading.slice(1) : ''
}

// Đặt nhầm hàng ở nhóm sau: 35.000 → 30.500.
export function zeroSlip(n: number): number {
  const rest = n % 10_000
  if (!rest || rest % 10) return 0
  return n - rest + rest / 10
}

const VIET3_WHY = 'Đếm theo nghìn như tiếng Việt. Tiếng Hàn gom 4 chữ số một nhóm (만 = vạn = 10.000).'
const IL_WHY = 'Khi nói, không đọc 일 trước 십, 백, 천, 만: 만 원 chứ không phải 일만 원.'
const NATIVE_WHY = 'Tiền luôn đọc bằng số Hán (일, 이, 삼…), không dùng số thuần Hàn (한, 두, 세…).'
const otherAmount = (n: number) => `Đây là ${krNum(n)}원 — lệch hàng chữ số.`

export function priceWrongs(n: number): { lead: NOption[]; slip: NOption[] } {
  const won = (s: string) => (s ? `${s} 원` : '')
  const slip: NOption[] = []
  if (n * 10 <= 999_999_999) slip.push({ text: price(n * 10), why: otherAmount(n * 10) })
  if (n % 10 === 0 && n >= 100) slip.push({ text: price(n / 10), why: otherAmount(n / 10) })
  const z = zeroSlip(n)
  if (z) slip.push({ text: price(z), why: otherAmount(z) })
  return {
    lead: [
      { text: won(viet3(n)), why: VIET3_WHY },
      { text: won(sino(n, { keepIl: true })), why: IL_WHY },
      { text: won(nativeLead(n)), why: NATIVE_WHY },
    ],
    slip,
  }
}

function priceNote(n: number): string {
  const g = groups4(n)
  if (g.length < 2) return 'Dưới 10.000 thì đọc thẳng: 천 (nghìn), 백 (trăm), 십 (mười).'
  return `Tách 4 số từ phải: ${g.join(' | ')}. Nhóm trước vạch đọc kèm ${g.length > 2 ? '억, rồi 만' : '만'}.`
}

export function priceQuestion(item: ShopItem, reverse: boolean): NQuestion {
  const n = shopPrice(item)
  const right = price(n)
  if (reverse) {
    const nums = [n * 10, n % 10 === 0 ? n / 10 : 0, zeroSlip(n), n % 100 === 0 ? n / 100 : n * 100]
    const opts = assemble(`${krNum(n)}원`, nums.filter((x) => x > 0 && x <= 999_999_999).map((x) => ({
      text: `${krNum(x)}원`, why: `${krNum(x)}원 đọc là ${price(x)}.`,
    })))
    return {
      id: qid(), mode: 'price', input: 'choice', ask: 'Người bán nói giá này — bảng giá nào đúng?',
      visual: { type: 'reading', text: right }, options: opts, answer: `${krNum(n)}원`, say: right,
      koOptions: false, note: priceNote(n),
    }
  }
  const { lead, slip } = priceWrongs(n)
  // Ưu tiên ba lỗi người Việt hay mắc; thiếu thì bù bằng lỗi lệch hàng.
  const wrong = [...shuffle(lead), ...shuffle(slip)]
  return {
    id: qid(), mode: 'price', input: 'choice', ask: 'Đọc giá này bằng tiếng Hàn',
    visual: { type: 'price', n, emoji: item.emoji, label: item.vi }, options: assemble(right, wrong),
    answer: right, say: right, koOptions: true, note: priceNote(n),
  }
}

export function priceRound(size = ROUND): NQuestion[] {
  const items = shuffle(SHOP).slice(0, size)
  while (items.length < size) items.push(pick(SHOP))
  // Ba câu đảo chiều: nghe cách đọc → chọn bảng giá.
  const reverseAt = new Set(shuffle(Array.from({ length: size }, (_, i) => i)).slice(0, 3))
  return items.map((it, i) => priceQuestion(it, reverseAt.has(i)))
}

// ── Nghe số ──────────────────────────────────────────────

const HAN_VIET: Record<string, string> = {
  일: 'nhất', 이: 'nhị', 삼: 'tam', 사: 'tứ', 오: 'ngũ', 육: 'lục', 칠: 'thất', 팔: 'bát', 구: 'cửu',
  십: 'thập', 백: 'bách', 천: 'thiên', 만: 'vạn',
}

// 삼백육십오 → 'tam bách lục thập ngũ': mỗi âm tiết số Hán ứng đúng một chữ Hán Việt.
export function hanViet(reading: string): string {
  return Array.from(reading.replace(/\s+/g, '')).map((c) => HAN_VIET[c] ?? '?').join(' ')
}

export function listenQuestion(kind: 'small' | 'price' | 'big' | 'year' | 'phone'): NQuestion {
  let n = 0
  let say = ''
  let answer = ''
  let shown = ''
  let note = ''
  if (kind === 'phone') {
    const digits = `010-${randInt(1000, 9999)}-${randInt(1000, 9999)}`
    answer = digits.replace(/\D/g, '')
    say = phone(digits)
    shown = digits
    note = 'Số điện thoại đọc từng chữ số, 0 đọc là 공.'
  } else {
    if (kind === 'small') n = Math.random() < 0.5 ? randInt(11, 99) : randInt(101, 999)
    else if (kind === 'year') n = randInt(1980, 2030)
    else if (kind === 'price') n = pick([randInt(1, 99) * 100, randInt(10, 99) * 1000, randInt(100, 999) * 100])
    else n = pick([randInt(10, 99) * 10_000, randInt(100, 999) * 10_000, randInt(101, 999) * 1000])
    answer = String(n)
    shown = kind === 'year' ? `năm ${n}` : krNum(n) + (kind === 'price' || kind === 'big' ? '원' : '')
    say = kind === 'year' ? `${sino(n)} 년` : kind === 'small' ? sino(n) : price(n)
    note = n >= 10_000
      ? `Nghe thấy 만 là có vạch chia 4 số: ${groups4(n).join(' | ')}.`
      : `Số Hán ghép y như Hán Việt: ${sino(n)} = ${hanViet(sino(n))}.`
  }
  return {
    id: qid(), mode: 'listen', input: 'digits', ask: 'Nghe rồi gõ lại các chữ số', visual: { type: 'listen' },
    options: [], answer, say, shown, koOptions: false, note,
  }
}

export function listenRound(size = ROUND): NQuestion[] {
  const kinds: Parameters<typeof listenQuestion>[0][] = ['small', 'small', 'price', 'price', 'price', 'price', 'big', 'big', 'year', 'phone']
  return shuffle(kinds.slice(0, size)).map(listenQuestion)
}

// ── Đếm đồ vật ───────────────────────────────────────────

interface CountItem { noun: string; vi: string; emoji: string; counter: string; wrong: string[] }

// Lượng từ sai chọn tay cho từng danh từ: tránh lượng từ người Hàn vẫn dùng (아메리카노 두 개, 티셔츠 한 장).
export const COUNT_ITEMS: CountItem[] = [
  { noun: '사과', vi: 'quả táo', emoji: '🍎', counter: '개', wrong: ['명', '마리', '권'] },
  { noun: '빵', vi: 'cái bánh mì', emoji: '🍞', counter: '개', wrong: ['명', '마리', '잔'] },
  { noun: '학생', vi: 'học sinh', emoji: '🧑‍🎓', counter: '명', wrong: ['마리', '개', '권'] },
  { noun: '친구', vi: 'người bạn', emoji: '🧑', counter: '명', wrong: ['마리', '개', '대'] },
  { noun: '고양이', vi: 'con mèo', emoji: '🐱', counter: '마리', wrong: ['명', '권', '대'] },
  { noun: '물고기', vi: 'con cá', emoji: '🐟', counter: '마리', wrong: ['명', '권', '잔'] },
  { noun: '책', vi: 'quyển sách', emoji: '📕', counter: '권', wrong: ['명', '마리', '잔'] },
  { noun: '커피', vi: 'ly cà phê', emoji: '☕', counter: '잔', wrong: ['명', '마리', '권'] },
  { noun: '맥주', vi: 'chai bia', emoji: '🍾', counter: '병', wrong: ['명', '마리', '권'] },
  { noun: '자동차', vi: 'chiếc ô tô', emoji: '🚗', counter: '대', wrong: ['명', '마리', '권'] },
  { noun: '표', vi: 'tấm vé', emoji: '🎫', counter: '장', wrong: ['명', '마리', '잔'] },
  { noun: '신발', vi: 'đôi giày', emoji: '👟', counter: '켤레', wrong: ['명', '마리', '권'] },
  { noun: '장미', vi: 'bông hồng', emoji: '🌹', counter: '송이', wrong: ['명', '마리', '권'] },
  { noun: '밥', vi: 'bát cơm', emoji: '🍚', counter: '그릇', wrong: ['명', '마리', '장'] },
  { noun: '옷', vi: 'bộ quần áo', emoji: '👕', counter: '벌', wrong: ['명', '마리', '잔'] },
]

const COUNTER_VI: Record<string, string> = {
  개: 'đồ vật', 명: 'người', 마리: 'con vật', 권: 'sách', 잔: 'ly, cốc', 병: 'chai', 대: 'xe, máy móc',
  장: 'giấy, vé', 켤레: 'giày, tất', 송이: 'hoa', 그릇: 'bát, tô', 벌: 'quần áo',
}

export function countQuestion(item: CountItem, n: number): NQuestion {
  const right = `${item.noun} ${nativeAdn(n)} ${item.counter}`
  const cardinal = native(n) !== nativeAdn(n)
  const wrongCounters = shuffle(item.wrong)
  const wrong: (NOption | null)[] = [
    { text: `${item.noun} ${sino(n)} ${item.counter}`, why: `${item.counter} đi với số thuần Hàn (한, 두, 세…), không dùng số Hán.` },
    cardinal ? { text: `${item.noun} ${native(n)} ${item.counter}`, why: `Trước lượng từ, ${native(n)} rút gọn thành ${nativeAdn(n)}.` } : null,
    ...wrongCounters.map((c) => ({ text: `${item.noun} ${nativeAdn(n)} ${c}`, why: `${c} dùng để đếm ${COUNTER_VI[c]}; ${item.noun} đếm bằng ${item.counter}.` })),
  ]
  const shortForm = cardinal ? `${native(n)} → ${nativeAdn(n)} trước lượng từ` : `${nativeAdn(n)} giữ nguyên trước lượng từ`
  return {
    id: qid(), mode: 'count', input: 'choice', ask: 'Đếm và chọn cách nói đúng',
    visual: { type: 'count', emoji: item.emoji, n, noun: item.noun, nounVi: item.vi }, options: assemble(right, wrong),
    answer: right, say: right, koOptions: true,
    note: `${item.counter} (${COUNTER_VI[item.counter]}) đi với số thuần Hàn: ${shortForm}.`,
  }
}

export function countRound(size = ROUND): NQuestion[] {
  const items = shuffle(COUNT_ITEMS).slice(0, size)
  while (items.length < size) items.push(pick(COUNT_ITEMS))
  // 1–4 là chỗ đổi dạng (한 두 세 네) nên ra nhiều hơn.
  return items.map((it) => countQuestion(it, Math.random() < 0.6 ? randInt(1, 4) : randInt(5, 9)))
}

// ── Giờ · ngày · tuổi · điện thoại ───────────────────────

export function timeQuestion(h: number, m: number): NQuestion {
  const useHalf = m === 30 && Math.random() < 0.6
  const right = time(h, m, useHalf)
  const alsoRight = m === 30 ? [time(h, m, !useHalf)] : []
  const minPart = (s: string) => (m === 0 ? '' : m === 30 && useHalf ? ' 반' : ` ${s} 분`)
  const hourAdn = `${nativeAdn(h)} 시`
  const wrong: (NOption | null)[] = [
    { text: `${sino(h)} 시${minPart(sino(m))}`, why: 'Giờ đếm bằng số thuần Hàn: 한 시, 두 시, 세 시…' },
    native(h) !== nativeAdn(h) ? { text: `${native(h)} 시${minPart(sino(m))}`, why: `Trước 시, ${native(h)} rút gọn thành ${nativeAdn(h)}.` } : null,
    m !== 0 ? { text: `${hourAdn} ${nativeAdn(m)} 분`, why: `Phút đếm bằng số Hán (${sino(m)} 분). ${nativeAdn(m)} 분 lại nghe như "${m} vị" (분 kính trọng).` } : null,
    m === 0 ? { text: `${hourAdn} 반`, why: '반 nghĩa là rưỡi (30 phút).' } : null,
    m === 0
      ? { text: `${sino(h)} 시 반`, why: 'Giờ đếm bằng số thuần Hàn; còn 반 nghĩa là rưỡi.' }
      : { text: `${sino(h)} 시 ${nativeAdn(m)} 분`, why: 'Giờ dùng số thuần Hàn, phút dùng số Hán — câu này đảo ngược cả hai.' },
  ]
  const note = m === 0
    ? `Giờ dùng số thuần Hàn: ${hourAdn}.`
    : m === 30
      ? `Giờ thuần Hàn + phút số Hán. 30 phút nói ${time(h, 30)} hoặc ${time(h, 30, false)} đều đúng.`
      : `Giờ thuần Hàn (${hourAdn}), phút số Hán (${sino(m)} 분).`
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Bây giờ là mấy giờ?', visual: { type: 'clock', h, m },
    options: assemble(right, wrong, alsoRight), answer: right, say: right, koOptions: true, note,
  }
}

const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function dateQuestion(month: number, day: number): NQuestion {
  const right = date(month, day)
  const M = MONTHS[month - 1]
  const irregular = month === 6 ? '육월' : month === 10 ? '십월' : ''
  const dayIrregular = day === 6 ? '유일' : day === 10 ? '시일' : ''
  const must: NOption[] = irregular
    ? [{ text: `${irregular} ${sino(day)}일`, why: 'Tháng 6 và tháng 10 đọc biến âm: 유월, 시월.' }]
    : []
  const rest: NOption[] = shuffle([
    { text: `${sino(day)}일 ${M}`, why: 'Tiếng Hàn nói tháng trước, ngày sau (ngược với tiếng Việt).' },
    { text: `${M} ${nativeAdn(day)} 일`, why: 'Ngày đếm bằng số Hán (일, 이, 삼…), không dùng 한, 두, 세.' },
    { text: `${sino(month)} 개월 ${sino(day)}일`, why: '개월 dùng để đếm số tháng (삼 개월 = ba tháng), không phải tên tháng.' },
    ...(dayIrregular ? [{ text: `${M} ${dayIrregular}`, why: 'Chỉ tên tháng mới biến âm; ngày vẫn là 육일, 십일.' }] : []),
  ])
  const note = irregular
    ? `Tháng trước, ngày sau. Tháng ${month} đọc ${M} (không phải ${irregular}).`
    : `Tháng trước, ngày sau, đều bằng số Hán: ${right}.`
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Đọc ngày này bằng tiếng Hàn', visual: { type: 'date', month, day },
    options: assemble(right, [...must, ...rest]), answer: right, say: right, koOptions: true, note,
  }
}

export function ageQuestion(n: number): NQuestion {
  const right = age(n)
  const unit = n % 10
  const wrong: (NOption | null)[] = [
    { text: `${sino(n)} 살`, why: '살 đi với số thuần Hàn. Số Hán thì dùng 세 (이십 세) trong giấy tờ.' },
    native(n) !== nativeAdn(n) ? { text: `${native(n)} 살`, why: `Trước 살, ${native(n)} đổi thành ${nativeAdn(n)}.` } : null,
    n > 20 && n < 30 ? { text: `스무${nativeAdn(unit)} 살`, why: `Chỉ đúng 20 mới thành 스무; ${n} là ${nativeAdn(n)}.` } : null,
    { text: `${nativeAdn(n)} 명`, why: '명 dùng để đếm người; tuổi dùng 살.' },
    { text: age(n + 10 <= 99 ? n + 10 : n - 10), why: `Câu này là ${n + 10 <= 99 ? n + 10 : n - 10} tuổi.` },
  ]
  const note = n === 20
    ? '20 tuổi: 스물 → 스무 trước 살.'
    : native(n) !== nativeAdn(n)
      ? `Tuổi dùng số thuần Hàn; ${native(n)} → ${nativeAdn(n)} trước 살.`
      : `Tuổi dùng số thuần Hàn + 살: ${right}.`
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Người này bao nhiêu tuổi?', visual: { type: 'age', n },
    options: assemble(right, wrong), answer: right, say: right, koOptions: true, note,
  }
}

const NATIVE_DIGIT = ['공', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉']

export function phoneQuestion(digits: string): NQuestion {
  const right = phone(digits)
  const groups = digits.split('-')
  const nativeRead = groups.map((g) => Array.from(g).map((d) => NATIVE_DIGIT[Number(d)]).join('')).join(' ')
  const asNumbers = groups.map((g, i) => (i === 0 ? phone(g) : sino(Number(g)) || phone(g))).join(' ')
  // Đổi đúng một chữ số ở cụm giữa hoặc cụm cuối.
  const chars = Array.from(digits)
  const slots = chars.map((c, i) => (i >= 4 && /\d/.test(c) ? i : -1)).filter((i) => i >= 0)
  const at = pick(slots)
  const other = pick([...'0123456789'].filter((d) => d !== chars[at]))
  const misread = chars.map((c, i) => (i === at ? other : c)).join('')
  const wrong: NOption[] = [
    { text: asNumbers, why: 'Số điện thoại đọc từng chữ số, không đọc thành số lớn (천, 백…).' },
    { text: nativeRead, why: 'Số điện thoại dùng số Hán (일, 이, 삼…), không dùng 하나, 둘, 셋.' },
    { text: phone(misread), why: `Câu này đọc số ${misread} — sai một chữ số.` },
  ]
  return {
    id: qid(), mode: 'mixed', input: 'choice', ask: 'Đọc số điện thoại này', visual: { type: 'phone', digits },
    options: assemble(right, wrong), answer: right, say: right, koOptions: true,
    note: 'Đọc từng chữ số bằng số Hán, 0 đọc là 공. Dấu gạch thường đọc lướt thành 에.',
  }
}

const randPhone = () => `010-${randInt(1000, 9999)}-${randInt(1000, 9999)}`

export function mixedRound(size = ROUND): NQuestion[] {
  const kinds = ['time', 'date', 'age', 'phone', 'time', 'date', 'age', 'phone', 'time', 'date']
  return shuffle(kinds.slice(0, size)).map((k) => {
    if (k === 'time') return timeQuestion(randInt(1, 12), pick([0, 0, 5, 10, 15, 20, 25, 30, 30, 40, 45, 50, 55]))
    if (k === 'date') {
      const month = Math.random() < 0.4 ? pick([6, 10]) : randInt(1, 12)
      const day = Math.random() < 0.25 ? pick([1, 6, 10]) : randInt(1, DAYS_IN[month - 1])
      return dateQuestion(month, day)
    }
    if (k === 'age') return ageQuestion(Math.random() < 0.5 ? pick([20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]) : randInt(1, 69))
    return phoneQuestion(randPhone())
  })
}

export function buildRound(mode: ModeId): NQuestion[] {
  if (mode === 'price') return priceRound()
  if (mode === 'listen') return listenRound()
  if (mode === 'count') return countRound()
  return mixedRound()
}
