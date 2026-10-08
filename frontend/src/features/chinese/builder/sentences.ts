import { ZH_ALL_WORDS } from '@/data/chineseCore'
import { hasPinyin, joinSyllables, pinyinSyllables } from '../numbers/zhnum'

// Câu để ghép lấy từ câu ví dụ trong kho từ tiếng Trung: chỉ giữ câu đơn (một dấu câu ở cuối, không dấu phẩy).
// Tiếng Trung không có dấu cách nên tách thẻ bằng cách khớp từ dài nhất trong kho, rồi gộp số + lượng từ,
// gắn 的 / 了 / 们 vào từ đứng trước cho thẻ gọn và có nghĩa.

export type LevelId = 'easy' | 'hard'

export interface Sentence {
  zh: string
  vi: string
  tiles: string[]
  end: string
}

export interface Tile {
  id: string
  text: string
}

export const LEVELS: { id: LevelId; label: string; desc: string }[] = [
  { id: 'easy', label: 'Câu ngắn', desc: 'Câu 3–4 thẻ: chủ ngữ, động từ, tân ngữ và vị trí của 的, 吗.' },
  { id: 'hard', label: 'Câu dài', desc: 'Câu 5–7 thẻ: thời gian, nơi chốn (在…), 也 / 都 / 很 — những chỗ ngược trật tự tiếng Việt.' },
]

export const ROUND = 8

const EXTRA = [
  '我们', '你们', '他们', '她们', '大家', '一起', '什么', '怎么', '为什么', '哪儿', '哪里', '这儿', '那儿', '这里', '那里',
  '每天', '早上', '晚上', '上午', '中午', '下午', '今天', '明天', '昨天', '现在', '去年', '今年', '明年', '周末', '春节',
  '已经', '正在', '可以', '应该', '因为', '所以', '但是', '如果', '喜欢', '认识', '知道', '觉得', '好吃', '好听', '好看',
  '散步', '等于', '岁数', '多少', '多大', '中文', '越南', '越南人', '中国人', '小明', '一下', '有点儿', '非常', '还是',
  '没有', '不是', '可能', '一定', '需要', '准备', '开始', '时候', '地方', '东西', '事情', '电话', '朋友', '老师',
  '帮助', '咖啡', '公园', '语言', '河内', '马上', '门口', '请问', '书店', '关门', '右拐', '左拐', '有点', '早饭', '这些', '那些',
  '首都', '钥匙', '下面', '上面', '里面', '外面', '客人', '报纸', '回来', '比较', '起飞', '不用', '刷卡', '输入', '看见', '小心',
  '打开', '舒服', '关灯', '红色', '衬衫', '头发', '天空', '短裤', '图片', '特别', '发音', '重要', '英语', '简单', '外国',
  '天天', '张开', '洗手', '好好', '常常', '游戏', '出示', '下个月', '到期', '上学', '上班', '下班', '晚饭', '午饭', '水果',
  '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天', '星期日', '下星期', '上星期', '下一站', '火车站',
  '地铁站', '左边', '右边', '旁边', '前面', '后面', '做完', '吃饭', '蓝色', '白色', '黑色', '绿色', '劳动节', '国庆节',
]

const DICT = new Set<string>([...ZH_ALL_WORDS.map((w) => w.zh ?? '').filter((z) => /^\p{Script=Han}{2,4}$/u.test(z)), ...EXTRA])

const NUM = '一二三四五六七八九十百千万两几这那每哪半'
const MEASURE = '个本杯件条张只双位辆瓶碗块岁点次口家顶节部楼种些层斤遍月号日把课天所'
const ATTACH = '的了们着过得'

export function segment(text: string): string[] {
  const cs = Array.from(text)
  const out: string[] = []
  let i = 0
  while (i < cs.length) {
    let len = 1
    for (let k = 4; k >= 2; k--) {
      if (i + k <= cs.length && DICT.has(cs.slice(i, i + k).join(''))) { len = k; break }
    }
    out.push(cs.slice(i, i + len).join(''))
    i += len
  }
  // Gộp: số liền nhau (三 + 百), số + lượng từ (三 + 个), rồi 的 / 了 / 们 vào thẻ trước
  const merged: string[] = []
  for (const t of out) {
    const prev = merged[merged.length - 1]
    const isNum = (s: string) => Array.from(s.replace(/^第/, '')).every((c) => NUM.includes(c))
    if (prev && isNum(prev) && (isNum(t) || (t.length === 1 && MEASURE.includes(t)))) merged[merged.length - 1] = prev + t
    else if (prev === '第' || (t === '半' && prev?.endsWith('点'))) merged[merged.length - 1] = prev + t
    else if (prev && t.length === 1 && ATTACH.includes(t)) merged[merged.length - 1] = prev + t
    else merged.push(t)
  }
  return merged
}

const ONE = /^[^〇\s，,。？！!?]*\p{Script=Han}[。？！]$/u

function collect(): Sentence[] {
  const seen = new Set<string>()
  const out: Sentence[] = []
  for (const w of ZH_ALL_WORDS) {
    const zh = (w.ex ?? '').trim().replace(/[?]$/, '？').replace(/[!]$/, '！')
    const vi = (w.exVi ?? '').trim()
    if (!zh || !vi || seen.has(zh) || !ONE.test(zh)) continue
    seen.add(zh)
    const tiles = segment(zh.slice(0, -1))
    if (tiles.length < 3 || tiles.length > 7) continue
    out.push({ zh, vi, tiles, end: zh.slice(-1) })
  }
  return out
}

export const SENTENCES: Sentence[] = collect()

export function poolFor(level: LevelId): Sentence[] {
  return SENTENCES.filter((s) => (level === 'easy' ? s.tiles.length <= 4 : s.tiles.length >= 5))
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[k]] = [a[k], a[i]]
  }
  return a
}

let seq = 0

export function tilesFor(s: Sentence): Tile[] {
  return s.tiles.map((text) => ({ id: `t${++seq}`, text }))
}

export function scramble(tiles: Tile[]): Tile[] {
  const target = tiles.map((t) => t.text).join('|')
  for (let k = 0; k < 12; k++) {
    const s = shuffle(tiles)
    if (s.map((t) => t.text).join('|') !== target) return s
  }
  return tiles.slice().reverse()
}

export function buildRound(level: LevelId): Sentence[] {
  return shuffle(poolFor(level)).slice(0, ROUND)
}

// ── Chấm ──

// Từ chỉ thời gian: đứng đầu câu hay ngay sau chủ ngữ đều đúng (明天我去 = 我明天去), nhưng không đứng cuối
export const TIME = new Set(['今天', '明天', '昨天', '现在', '每天', '早上', '晚上', '上午', '中午', '下午', '去年', '今年', '明年',
  '周末', '春节', '以后', '刚才', '马上', '春天', '夏天', '秋天', '冬天', '下星期', '上星期', '下个月', '星期天', '星期日'])

// Giờ cụ thể (六点, 五点半); bỏ 一点 vì còn nghĩa "một chút"
const isTimeTile = (t: string) => TIME.has(t) || /^星期.$|^[一二三四五六七八九十]{1,2}月$|^[一二三四五六七八九十]{1,3}号$/u.test(t)
  || /^([二三四五六七八九十两]|十[一二])点(半|.*分)?$/u.test(t)

export type Verdict = 'exact' | 'alt' | 'wrong'

export function judge(target: string[], built: string[]): Verdict {
  if (built.join('') === target.join('')) return 'exact'
  if (built.length !== target.length) return 'wrong'
  // Chủ ngữ + [thời gian…] + phần còn lại  ⇄  [thời gian…] + chủ ngữ + phần còn lại
  let run = 0
  if (!isTimeTile(target[0])) {
    while (1 + run < target.length - 1 && isTimeTile(target[1 + run])) run++
    if (run && built.join('|') === [...target.slice(1, 1 + run), target[0], ...target.slice(1 + run)].join('|')) return 'alt'
  } else {
    while (run < target.length - 1 && isTimeTile(target[run])) run++
    const subj = target[run]
    if (run < target.length - 1 && built.join('|') === [subj, ...target.slice(0, run), ...target.slice(run + 1)].join('|')) return 'alt'
  }
  return 'wrong'
}

export function hintFor(target: string[], built: string[]): string {
  const at = (t: string) => built.indexOf(t)
  // Thời gian bị đặt cuối câu như tiếng Việt
  const timeTile = target.find(isTimeTile)
  if (timeTile && at(timeTile) === built.length - 1) {
    return 'Thời gian (今天, 明天, 每天…) đứng trước động từ — đầu câu hoặc ngay sau chủ ngữ, không để cuối câu như tiếng Việt.'
  }
  // 在 + nơi chốn bị đặt sau động từ
  const zai = target.indexOf('在')
  if (zai >= 0 && zai + 2 < target.length && at('在') > at(target[zai + 2])) {
    return 'Nơi chốn (在 + chỗ) đứng TRƯỚC động từ: 我在家吃饭 — ngược với "Tôi ăn cơm ở nhà".'
  }
  // Từ có 的 (định ngữ) bị đặt sau danh từ
  const de = target.findIndex((t) => t.endsWith('的'))
  if (de >= 0 && de + 1 < target.length && at(target[de]) > at(target[de + 1])) {
    return 'Định ngữ + 的 đứng TRƯỚC danh từ: 我的书 (sách của tôi) — ngược với tiếng Việt.'
  }
  const adv = ['也', '都', '很', '不', '没', '还', '就', '才', '一起', '已经', '正在']
  const a = target.find((t) => adv.includes(t))
  if (a && at(a) !== target.indexOf(a)) {
    return `${a} là phó từ: đứng ngay trước động từ / tính từ, sau chủ ngữ.`
  }
  if (target[target.length - 1] === '吗' && built[built.length - 1] !== '吗') return '吗 luôn đứng cuối câu hỏi có / không.'
  const first = built.findIndex((w, k) => w !== target[k])
  return first >= 0 ? `Vị trí thứ ${first + 1} chưa đúng. Trật tự quen dùng: chủ ngữ → thời gian → nơi chốn → động từ → tân ngữ.` : ''
}

// Pinyin của từ trong kho (đã có thanh nhẹ đúng: 哥哥 gē ge, 衣服 yī fu)
const WORD_PY = new Map<string, string[]>()
for (const w of ZH_ALL_WORDS) {
  const syl = (w.pinyin ?? '').trim().split(/\s+/)
  if (w.zh && /^\p{Script=Han}+$/u.test(w.zh) && syl.length === Array.from(w.zh).length) WORD_PY.set(w.zh, syl)
}

// Pinyin cả câu: biến điệu 一 / 不 theo cả câu, rồi thay bằng pinyin chuẩn của các từ có trong kho;
// chữ nào chưa có pinyin thì trả rỗng để không hiện dòng thiếu chữ
export function pinyinOf(text: string): string {
  if (!hasPinyin(text)) return ''
  const body = text.replace(/[\s。？！，、·]+/g, '')
  const syl = pinyinSyllables(body)
  const cs = Array.from(body)
  for (let i = 0; i < cs.length;) {
    let hit = 0
    for (let k = Math.min(4, cs.length - i); k >= 2; k--) {
      const w = WORD_PY.get(cs.slice(i, i + k).join(''))
      if (w) { w.forEach((p, j) => { syl[i + j] = p }); hit = k; break }
    }
    i += hit || 1
  }
  return joinSyllables(body, syl)
}
