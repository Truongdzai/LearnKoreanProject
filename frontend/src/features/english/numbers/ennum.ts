// Đọc số tiếng Anh: số đếm, số thứ tự, năm, giờ, ngày tháng, giá tiền.
// Dạng chuẩn dùng "and" sau hundred (Anh, và rất phổ biến khi nói ở Mỹ); người Mỹ hay bỏ "and".

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function under100(n: number): string {
  if (n < 20) return ONES[n]
  const t = TENS[Math.floor(n / 10)]
  return n % 10 ? `${t}-${ONES[n % 10]}` : t
}

function under1000(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  if (!h) return under100(r)
  return r ? `${ONES[h]} hundred and ${under100(r)}` : `${ONES[h]} hundred`
}

const SCALES: [number, string][] = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]

export function cardinal(n: number): string {
  if (n < 1000) return under1000(n)
  const parts: string[] = []
  let rest = n
  for (const [v, name] of SCALES) {
    const g = Math.floor(rest / v)
    if (g) parts.push(`${under1000(g)} ${name}`)
    rest %= v
  }
  // 1,005 = one thousand and five; 1,250 = one thousand two hundred and fifty
  if (rest) parts.push(rest < 100 ? `and ${under100(rest)}` : under1000(rest))
  return parts.join(' ')
}

const ORD_IRR: Record<string, string> = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' }

export function ordinal(n: number): string {
  const words = cardinal(n)
  const m = words.match(/^(.*?)([a-z]+)$/)!
  const [, head, last] = m
  const tail = ORD_IRR[last] ?? (last.endsWith('y') ? last.slice(0, -1) + 'ieth' : last + 'th')
  return head + tail
}

export function ordSuffix(n: number): string {
  const t = n % 100
  if (t >= 11 && t <= 13) return n + 'th'
  return n + (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
}

export function yearWord(y: number): string {
  if (y >= 2000 && y <= 2009) return y === 2000 ? 'two thousand' : `two thousand and ${ONES[y % 10]}`
  const hi = Math.floor(y / 100)
  const lo = y % 100
  if (lo === 0) return `${under100(hi)} hundred`
  if (lo < 10) return `${under100(hi)} oh ${ONES[lo]}`
  return `${under100(hi)} ${under100(lo)}`
}

const nextHour = (h: number) => (h % 12) + 1

export function timeWord(h: number, m: number): string {
  if (m === 0) return `${ONES[h]} o'clock`
  if (m === 15) return `a quarter past ${ONES[h]}`
  if (m === 30) return `half past ${ONES[h]}`
  if (m === 45) return `a quarter to ${ONES[nextHour(h)]}`
  if (m < 30) return `${under100(m)} past ${ONES[h]}`
  return `${under100(60 - m)} to ${ONES[nextHour(h)]}`
}

// Kiểu đồng hồ số: seven forty-five, seven oh five
export function digitalTime(h: number, m: number): string {
  if (m === 0) return `${ONES[h]} o'clock`
  return `${ONES[h]} ${m < 10 ? 'oh ' + ONES[m] : under100(m)}`
}

export const timeNum = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`

export function priceWord(d: number, c: number): string {
  const dol = d ? `${cardinal(d)} ${d === 1 ? 'dollar' : 'dollars'}` : ''
  const cen = c ? `${under100(c)} ${c === 1 ? 'cent' : 'cents'}` : ''
  return dol && cen ? `${dol} and ${cen}` : dol || cen
}

export const priceNum = (d: number, c: number) => (c ? `$${d}.${String(c).padStart(2, '0')}` : `$${d}`)

export const dateWord = (d: number, m: number) => `the ${ordinal(d)} of ${MONTHS[m - 1]}`
export const dateNum = (d: number, m: number) => `${d} tháng ${m}`

export const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export const bigNum = (n: number) => n.toLocaleString('en-US')
