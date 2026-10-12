import HV from '@/data/chinese/hanviet.json'

// Đọc số tiếng Trung. Giống tiếng Hàn, tiếng Trung gom 4 chữ số một nhóm (万 = vạn, 亿 = trăm triệu),
// không theo nghìn như tiếng Việt. Số 0 ở giữa đọc 零 (như "lẻ / linh"), số 2 trước lượng từ đọc 两.

export const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const UNITS = ['', '十', '百', '千']

export interface ZhOpts {
  // 两 thay cho 二 ở chữ số đầu khi đứng trước 百 / 千 / 万 / 亿 (两千, 两万)
  liang?: boolean
}

// Một nhóm 4 chữ số (1..9999). first = nhóm đầu tiên của cả số (để đọc 十五 thay vì 一十五)
function group(n: number, first: boolean, opts: ZhOpts): string {
  const d = [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]
  let out = ''
  let zero = false
  let started = false
  for (let i = 0; i < 4; i++) {
    const v = d[i]
    const unit = UNITS[3 - i]
    if (v === 0) {
      if (started) zero = true
      continue
    }
    if (zero) out += '零'
    zero = false
    if (v === 1 && unit === '十' && !started && first) {
      out += '十'
    } else {
      const lead = !started && first && opts.liang && v === 2 && (unit === '百' || unit === '千')
      out += (lead ? '两' : DIGITS[v]) + unit
    }
    started = true
  }
  return out
}

export function zh(n: number, opts: ZhOpts = {}): string {
  if (!Number.isFinite(n) || n < 0 || n > 999_999_999_999) return ''
  n = Math.floor(n)
  if (n === 0) return '零'
  const parts: { v: number; unit: string }[] = [
    { v: Math.floor(n / 100_000_000), unit: '亿' },
    { v: Math.floor(n / 10_000) % 10_000, unit: '万' },
    { v: n % 10_000, unit: '' },
  ]
  let out = ''
  let started = false
  let skipped = false
  let prev = 0
  for (const { v, unit } of parts) {
    if (v === 0) {
      if (started) skipped = true
      continue
    }
    // Có số 0 nằm giữa hai chữ số khác 0 qua ranh giới nhóm (1.005.000 = 一百万零五千): chen 零
    if (started && (v < 1000 || skipped || prev % 10 === 0)) out += '零'
    let g = group(v, !started, opts)
    // 2万, 2亿 nói 两万, 两亿
    if (!started && opts.liang && v === 2 && unit) g = '两'
    out += g + unit
    started = true
    skipped = false
    prev = v
  }
  return out
}

// Các cách nói cũng đúng: 二 trước 百 / 千 / 万 / 亿 đổi được thành 两 (trừ khi là hàng đơn vị của 十: 十二万)
export function variants(text: string): string[] {
  const swapped = text.replace(/(^|[^十])二(?=[百千万亿])/g, '$1两')
  const back = text.replace(/两(?=[百千万亿])/g, '二')
  return [...new Set([text, swapped, back])]
}

// Chia nhóm 4 số từ phải sang: 1234567 → ['123', '4567']
export function groups4(n: number): string[] {
  const s = String(Math.floor(n))
  const out: string[] = []
  for (let end = s.length; end > 0; end -= 4) out.unshift(s.slice(Math.max(0, end - 4), end))
  return out
}

// Số đứng trước lượng từ: 2 → 两 (两个, 两本), còn lại như thường
export function count(n: number): string {
  if (n === 2) return '两'
  return zh(n, { liang: true })
}

// ── Tiền: 块 (nói) / 元 (viết), 毛 / 角 = 0,1, 分 = 0,01 ──

export interface Money {
  yuan: number
  jiao: number
  fen: number
}

export function splitMoney(amount: number): Money {
  const cents = Math.round(amount * 100)
  return { yuan: Math.floor(cents / 100), jiao: Math.floor(cents / 10) % 10, fen: cents % 10 }
}

// Cách nói thường ngày: 18.5 → 十八块五 (毛 cuối câu thường bỏ), 3.05 → 三块零五分, 2 → 两块, 0.5 → 五毛
export function price(amount: number, full = false): string {
  const { yuan, jiao, fen } = splitMoney(amount)
  let out = ''
  if (yuan) out += count(yuan) + '块'
  if (jiao) {
    const j = jiao === 2 ? '两' : DIGITS[jiao]
    out += yuan && !fen && !full ? DIGITS[jiao] : j + '毛'
  } else if (fen && yuan) {
    out += '零'
  }
  if (fen) out += (fen === 2 && !yuan && !jiao ? '两' : DIGITS[fen]) + '分'
  return out || '零块'
}

// Cách viết / đọc trang trọng: 18.5 → 十八元五角
export function priceFormal(amount: number): string {
  const { yuan, jiao, fen } = splitMoney(amount)
  let out = yuan ? zh(yuan) + '元' : ''
  if (jiao) out += DIGITS[jiao] + '角'
  else if (fen && yuan) out += '零'
  if (fen) out += DIGITS[fen] + '分'
  return out || '零元'
}

// ── Giờ, ngày, thứ, năm, điện thoại, tuổi ──

// 2:00 → 两点, 3:30 → 三点半, 2:15 → 两点十五分, 10:45 → 十点四十五分
export function time(h: number, m: number, style: 'num' | 'half' | 'quarter' = 'num'): string {
  const hour = (h === 2 ? '两' : zh(h)) + '点'
  if (m === 0) return hour
  if (m === 30 && style === 'half') return hour + '半'
  if ((m === 15 || m === 45) && style === 'quarter') return hour + (m === 15 ? '一刻' : '三刻')
  return hour + (m < 10 ? '零' + DIGITS[m] : zh(m)) + '分'
}

// Tháng trước, ngày sau: 6月6号 (nói) / 6月6日 (viết). Tháng 2 là 二月, không phải 两月
export function date(month: number, day: number, written = false): string {
  return zh(month) + '月' + zh(day) + (written ? '日' : '号')
}

// Thứ trong tuần: "Thứ Hai" của tiếng Việt là 星期一 (ngày đầu tuần), Chủ nhật là 星期天 / 星期日
export const WEEKDAYS: { vi: string; zh: string; alt?: string }[] = [
  { vi: 'Thứ Hai', zh: '星期一' },
  { vi: 'Thứ Ba', zh: '星期二' },
  { vi: 'Thứ Tư', zh: '星期三' },
  { vi: 'Thứ Năm', zh: '星期四' },
  { vi: 'Thứ Sáu', zh: '星期五' },
  { vi: 'Thứ Bảy', zh: '星期六' },
  { vi: 'Chủ nhật', zh: '星期天', alt: '星期日' },
]

// Năm đọc từng chữ số: 2025 → 二零二五年
export function year(y: number): string {
  return Array.from(String(y)).map((c) => DIGITS[Number(c)]).join('') + '年'
}

// Điện thoại đọc từng chữ số; 1 thường đọc 幺 (yāo) cho khỏi lẫn với 七
export function phone(digits: string, yao = true): string {
  return digits.split('-').map((g) => Array.from(g).map((c) => (c === '1' && yao ? '幺' : DIGITS[Number(c)])).join('')).join(' ')
}

export function age(n: number): string {
  return count(n) + '岁'
}

// ── Pinyin cho phần đọc số ──

const PY: Record<string, string> = {
  零: 'líng', 一: 'yī', 二: 'èr', 两: 'liǎng', 三: 'sān', 四: 'sì', 五: 'wǔ', 六: 'liù', 七: 'qī', 八: 'bā', 九: 'jiǔ',
  十: 'shí', 百: 'bǎi', 千: 'qiān', 万: 'wàn', 亿: 'yì', 幺: 'yāo',
  块: 'kuài', 毛: 'máo', 分: 'fēn', 元: 'yuán', 角: 'jiǎo', 点: 'diǎn', 半: 'bàn', 刻: 'kè',
  月: 'yuè', 号: 'hào', 日: 'rì', 年: 'nián', 岁: 'suì', 星: 'xīng', 期: 'qī', 天: 'tiān',
  个: 'gè', 本: 'běn', 杯: 'bēi', 瓶: 'píng', 件: 'jiàn', 条: 'tiáo', 张: 'zhāng', 只: 'zhī', 双: 'shuāng',
  辆: 'liàng', 碗: 'wǎn', 位: 'wèi',
}

// Chữ ngoài bảng trên: lấy pinyin từ bảng Hán–Việt của lộ trình, thêm vài danh từ đếm hay gặp
const MORE: Record<string, string> = {
  咖: 'kā', 啡: 'fēi', 啤: 'pí', 酒: 'jiǔ', 鱼: 'yú', 猫: 'māo', 每: 'měi', 给: 'gěi', 文: 'wén', 吧: 'ba', 早: 'zǎo',
  等: 'děng', 最: 'zuì', 园: 'yuán', 节: 'jié', 河: 'hé', 内: 'nèi', 过: 'guò', 纸: 'zhǐ', 口: 'kǒu', 部: 'bù', 离: 'lí',
  晚: 'wǎn', 次: 'cì', 得: 'de', 那: 'nà', 往: 'wǎng', 拐: 'guǎi', 把: 'bǎ', 别: 'bié', 重: 'zhòng', 周: 'zhōu', 末: 'mò',
  常: 'cháng', 助: 'zhù', 越: 'yuè', 南: 'nán', 王: 'wáng', 散: 'sàn', 步: 'bù', 于: 'yú', 数: 'shù', 种: 'zhǒng',
  言: 'yán', 马: 'mǎ', 劳: 'láo', 首: 'shǒu', 钥: 'yào', 匙: 'shi', 报: 'bào', 吵: 'chǎo', 较: 'jiào', 收: 'shōu',
  刷: 'shuā', 输: 'shū', 入: 'rù', 用: 'yòng', 第: 'dì', 花: 'huā', 从: 'cóng', 楼: 'lóu', 舒: 'shū', 忘: 'wàng',
  戴: 'dài', 着: 'zhe', 顶: 'dǐng', 衬: 'chèn', 衫: 'shān', 先: 'xiān', 片: 'piàn', 特: 'tè', 英: 'yīng', 简: 'jiǎn',
  够: 'gòu', 完: 'wán', 坏: 'huài', 戏: 'xì', 接: 'jiē', 示: 'shì', 丢: 'diū',
}
const pyOf = (c: string): string => PY[c] ?? MORE[c] ?? (HV as Record<string, { py: string }>)[c]?.py ?? c

const NUMERAL = new Set([...DIGITS, '两', '十', '百', '千', '万', '亿', '幺'])

function toneOf(py: string): number {
  const marks = ['āēīōūǖ', 'áéíóúǘ', 'ǎěǐǒǔǚ', 'àèìòùǜ']
  for (let t = 0; t < 4; t++) if ([...py].some((c) => marks[t].includes(c))) return t + 1
  return 0
}

// 一 đổi thanh khi đứng đầu cụm số và ngay trước đơn vị / lượng từ: 一百 yì bǎi, 一万 yí wàn, 一个 yí gè
export function pinyinOf(text: string, extra: Record<string, string> = {}): string {
  return joinSyllables(text, pinyinSyllables(text, extra))
}

// Ghép âm tiết thành chuỗi, gộp 儿 hoá: 哪儿 nǎr, 这儿 zhèr, 一点儿 yìdiǎnr
export function joinSyllables(text: string, syl: string[]): string {
  const cs = Array.from(text.replace(/[\s。？！，、·]+/g, ''))
  const merged: string[] = []
  syl.forEach((p, i) => {
    if (cs[i] === '儿' && i > 0 && '哪这那点'.includes(cs[i - 1])) merged[merged.length - 1] += 'r'
    else merged.push(p)
  })
  return merged.join(' ')
}

// Một âm tiết cho mỗi chữ (đã biến điệu 一 / 不), chưa gộp 儿
export function pinyinSyllables(text: string, extra: Record<string, string> = {}): string[] {
  const cs = Array.from(text.replace(/[\s。？！，、·]+/g, ''))
  return cs.map((c, i) => {
    const base = extra[c] ?? pyOf(c)
    // 不 trước thanh 4 đọc bú: 不是 bú shì
    if (c === '不') return toneOf(extra[cs[i + 1] ?? ''] ?? pyOf(cs[i + 1] ?? '')) === 4 ? 'bú' : base
    if (c !== '一') return base
    const prev = cs[i - 1]
    const next = cs[i + 1]
    // Số thứ tự (一月, 一号, 星期一) và chữ số đọc liền (十一, 二零一五) giữ yī
    if (!next || prev === '第' || (prev && NUMERAL.has(prev)) || (NUMERAL.has(next) && !'百千万亿'.includes(next)) || '月号日'.includes(next)) return base
    const t = toneOf(extra[next] ?? pyOf(next))
    if (!t) return base
    return t === 4 ? 'yí' : 'yì'
  })
}

// true nếu mọi chữ đều có pinyin (để không hiện dòng pinyin thiếu chữ)
export function hasPinyin(text: string): boolean {
  return Array.from(text.replace(/[\s。？！，、·]+/g, '')).every((c) => pyOf(c) !== c)
}

// ¥18.50, ¥2,999
export function yuanLabel(amount: number): string {
  const { yuan, jiao, fen } = splitMoney(amount)
  const int = String(yuan).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return '¥' + int + (jiao || fen ? '.' + jiao + fen : '')
}
