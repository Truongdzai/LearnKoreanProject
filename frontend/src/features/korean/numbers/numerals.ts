import { romanizeLine } from '@/core/utils/romanize'

// Hệ số Hán (일이삼) và hệ số thuần Hàn (하나둘셋). Mọi hàm trả '' khi số nằm ngoài phạm vi.

export const SINO_DIGITS = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
const PLACES = ['', '십', '백', '천']

const NATIVE_UNITS = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉']
const NATIVE_UNITS_ADN = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']
const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔']

export const MONTHS = ['일월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '십일월', '십이월']

const isInt = (n: number) => Number.isInteger(n)

export interface SinoOpts {
  // Cố ý giữ 일 trước 십/백/천/만 (dùng để tạo đáp án sai kiểu 일만, 일천).
  keepIl?: boolean
}

// Một nhóm 4 chữ số (1..9999), viết liền: 천이백삼십사.
function sinoGroup(g: number, keepIl = false): string {
  let out = ''
  for (let p = 3; p >= 0; p--) {
    const d = Math.floor(g / 10 ** p) % 10
    if (!d) continue
    out += (d === 1 && p > 0 && !keepIl ? '' : SINO_DIGITS[d]) + PLACES[p]
  }
  return out
}

// 0..999 999 999. Tiếng Hàn gom theo 4 chữ số (만, 억) và viết cách sau mỗi nhóm: 삼만 오천.
export function sino(n: number, opts: SinoOpts = {}): string {
  if (!isInt(n) || n < 0 || n > 999_999_999) return ''
  if (n === 0) return '영'
  const eok = Math.floor(n / 100_000_000)
  const man = Math.floor(n / 10_000) % 10_000
  const rest = n % 10_000
  const parts: string[] = []
  // 일억 luôn giữ 일; 만 thì không (만 원, không phải 일만 원).
  if (eok) parts.push(sinoGroup(eok, opts.keepIl) + '억')
  if (man) parts.push((man === 1 && !opts.keepIl ? '' : sinoGroup(man, opts.keepIl)) + '만')
  if (rest) parts.push(sinoGroup(rest, opts.keepIl))
  return parts.join(' ')
}

// Số thuần Hàn dạng đứng một mình (đếm "một, hai, ba"): 1..99.
export function native(n: number): string {
  if (!isInt(n) || n < 1 || n > 99) return ''
  return NATIVE_TENS[Math.floor(n / 10)] + NATIVE_UNITS[n % 10]
}

// Dạng đứng trước lượng từ: 한/두/세/네, 20 thành 스무 (스무 살) nhưng 21 là 스물한.
export function nativeAdn(n: number): string {
  if (!isInt(n) || n < 1 || n > 99) return ''
  if (n === 20) return '스무'
  return NATIVE_TENS[Math.floor(n / 10)] + NATIVE_UNITS_ADN[n % 10]
}

export function price(n: number): string {
  const s = sino(n)
  return s ? `${s} 원` : ''
}

// Giờ đếm bằng số thuần Hàn (1..12), phút bằng số Hán; 30 phút đọc 반 nếu half = true.
export function time(h: number, m: number, half = true): string {
  if (!isInt(h) || !isInt(m) || h < 1 || h > 12 || m < 0 || m > 59) return ''
  const hour = `${nativeAdn(h)} 시`
  if (m === 0) return hour
  if (m === 30 && half) return `${hour} 반`
  return `${hour} ${sino(m)} 분`
}

// Ngày tháng theo thứ tự tháng → ngày; tháng 6 và 10 đọc 유월, 시월.
export function date(month: number, day: number): string {
  if (!isInt(month) || !isInt(day) || month < 1 || month > 12 || day < 1 || day > 31) return ''
  return `${MONTHS[month - 1]} ${sino(day)}일`
}

export function age(n: number): string {
  const a = nativeAdn(n)
  return a ? `${a} 살` : ''
}

// Số điện thoại đọc từng chữ số, 0 đọc 공; mỗi cụm cách nhau một dấu cách.
export function phone(digits: string): string {
  return digits
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map((g) => Array.from(g).map((d) => (d === '0' ? '공' : SINO_DIGITS[Number(d)])).join(''))
    .join(' ')
}

// 35000 → ['3', '5000']: tách 4 chữ số từ phải sang, đúng như tiếng Hàn đọc.
export function groups4(n: number): string[] {
  if (!isInt(n) || n < 0) return []
  const s = String(n)
  const out: string[] = []
  for (let end = s.length; end > 0; end -= 4) out.unshift(s.slice(Math.max(0, end - 4), end))
  return out
}

// 35000 → '35.000' (cách viết của người Việt).
export function viNum(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Phiên âm cho số: romanizeLine chưa biết 육 sau 십/백 được đọc chèn ㄴ (십육 [심뉵] simnyuk).
export function romanizeNum(text: string): string {
  return romanizeLine(text.replace(/([십백])육/g, '$1뉵'))
}

export type CounterSystem = 'native' | 'sino'

export interface Counter {
  ko: string
  vi: string
  system: CounterSystem
  emoji: string
  noun: string
  nounVi: string
  n: number
  exVi: string
  note?: string
  // Danh từ đứng sau cụm số (삼 번 출구), không đứng trước như 사과 세 개.
  nounAfter?: boolean
}

export const COUNTERS: Counter[] = [
  { ko: '개', vi: 'cái, quả — đồ vật nói chung', system: 'native', emoji: '🍎', noun: '사과', nounVi: 'quả táo', n: 3, exVi: 'ba quả táo' },
  { ko: '명', vi: 'người', system: 'native', emoji: '🧑', noun: '학생', nounVi: 'học sinh', n: 2, exVi: 'hai học sinh', note: 'Kính trọng thì dùng 분: 세 분.' },
  { ko: '마리', vi: 'con — động vật', system: 'native', emoji: '🐱', noun: '고양이', nounVi: 'con mèo', n: 1, exVi: 'một con mèo' },
  { ko: '병', vi: 'chai', system: 'native', emoji: '🍾', noun: '맥주', nounVi: 'bia', n: 2, exVi: 'hai chai bia' },
  { ko: '잔', vi: 'ly, cốc', system: 'native', emoji: '☕', noun: '커피', nounVi: 'cà phê', n: 1, exVi: 'một ly cà phê' },
  { ko: '권', vi: 'quyển', system: 'native', emoji: '📕', noun: '책', nounVi: 'sách', n: 4, exVi: 'bốn quyển sách' },
  { ko: '장', vi: 'tờ, tấm — giấy, vé, ảnh', system: 'native', emoji: '🎫', noun: '표', nounVi: 'vé', n: 2, exVi: 'hai tấm vé' },
  { ko: '대', vi: 'chiếc — xe, máy móc', system: 'native', emoji: '🚗', noun: '자동차', nounVi: 'ô tô', n: 1, exVi: 'một chiếc ô tô' },
  { ko: '벌', vi: 'bộ, chiếc — quần áo', system: 'native', emoji: '👕', noun: '옷', nounVi: 'quần áo', n: 3, exVi: 'ba bộ quần áo' },
  { ko: '켤레', vi: 'đôi — giày, tất', system: 'native', emoji: '👟', noun: '신발', nounVi: 'giày', n: 2, exVi: 'hai đôi giày' },
  { ko: '살', vi: 'tuổi', system: 'native', emoji: '🎂', noun: '', nounVi: '', n: 20, exVi: 'hai mươi tuổi', note: 'Văn bản trang trọng dùng số Hán + 세: 이십 세.' },
  { ko: '시', vi: 'giờ (lúc mấy giờ)', system: 'native', emoji: '🕒', noun: '', nounVi: '', n: 3, exVi: 'ba giờ' },
  { ko: '송이', vi: 'bông, chùm — hoa, nho', system: 'native', emoji: '🌹', noun: '장미', nounVi: 'hoa hồng', n: 5, exVi: 'năm bông hồng' },
  { ko: '그릇', vi: 'bát, tô', system: 'native', emoji: '🍚', noun: '밥', nounVi: 'cơm', n: 2, exVi: 'hai bát cơm' },
  { ko: '분', vi: 'phút', system: 'sino', emoji: '⏲️', noun: '', nounVi: '', n: 5, exVi: 'năm phút', note: 'Đừng nhầm với 분 đếm người kính trọng: 다섯 분 = năm vị.' },
  { ko: '원', vi: 'won (tiền Hàn)', system: 'sino', emoji: '💵', noun: '', nounVi: '', n: 35000, exVi: '35.000 won' },
  { ko: '층', vi: 'tầng', system: 'sino', emoji: '🏢', noun: '', nounVi: '', n: 3, exVi: 'tầng 3' },
  { ko: '번', vi: 'số — số thứ tự, số xe buýt, lối ra', system: 'sino', emoji: '🚇', noun: '출구', nounVi: 'lối ra', n: 3, exVi: 'lối ra số 3', nounAfter: true, note: 'Đếm số lần thì dùng số thuần Hàn: 한 번, 두 번.' },
  { ko: '년', vi: 'năm', system: 'sino', emoji: '📅', noun: '', nounVi: '', n: 2026, exVi: 'năm 2026' },
  { ko: '월', vi: 'tháng (tên tháng)', system: 'sino', emoji: '🗓️', noun: '', nounVi: '', n: 6, exVi: 'tháng 6', note: 'Hai tháng đọc biến âm: 유월 (6), 시월 (10).' },
  { ko: '일', vi: 'ngày', system: 'sino', emoji: '📆', noun: '', nounVi: '', n: 15, exVi: 'ngày 15' },
  { ko: '개월', vi: 'tháng (khoảng thời gian)', system: 'sino', emoji: '⏳', noun: '', nounVi: '', n: 3, exVi: 'ba tháng' },
  { ko: '인분', vi: 'suất (đồ ăn)', system: 'sino', emoji: '🍖', noun: '삼겹살', nounVi: 'thịt ba chỉ', n: 2, exVi: 'hai suất thịt ba chỉ' },
  { ko: '주', vi: 'tuần', system: 'sino', emoji: '🗒️', noun: '', nounVi: '', n: 2, exVi: 'hai tuần' },
  { ko: '초', vi: 'giây', system: 'sino', emoji: '⏱️', noun: '', nounVi: '', n: 10, exVi: 'mười giây' },
]

// Số + lượng từ theo đúng hệ: 세 개, 오 분, 유월, 십오일.
export function counted(n: number, counter: string): string {
  const c = COUNTERS.find((x) => x.ko === counter)
  if (!c) return ''
  if (counter === '월') return isInt(n) && n >= 1 && n <= 12 ? MONTHS[n - 1] : ''
  if (counter === '원') return price(n)
  const num = c.system === 'native' ? nativeAdn(n) : sino(n)
  if (!num) return ''
  return counter === '일' ? `${num}일` : `${num} ${counter}`
}

export function counterExample(c: Counter): string {
  const body = counted(c.n, c.ko)
  if (!c.noun) return body
  return c.nounAfter ? `${body} ${c.noun}` : `${c.noun} ${body}`
}
