import { ZH_ALL_WORDS } from '@/data/chineseCore'
import { markTone, parseSyllable, spokenTones, splitSyllable, type Tone } from '@/core/utils/pinyin'
import type { HQuestion } from '../../korean/hangul/quiz'
import { shuffle } from '../../korean/hangul/quiz'

const HAN = /[一-鿿]/

export interface ZhWord {
  zh: string
  pinyin: string
  vi: string
  syl: string[]
  tones: Tone[]
}

// Chỉ lấy từ mà số âm tiết pinyin khớp số chữ Hán, để ghép được chữ ↔ âm.
export const WORDS: ZhWord[] = ZH_ALL_WORDS.flatMap((w) => {
  const syl = (w.pinyin || '').split(' ').filter(Boolean)
  const chars = Array.from(w.zh || '').filter((c) => HAN.test(c))
  if (!syl.length || syl.length !== chars.length) return []
  return [{ zh: w.zh!, pinyin: w.pinyin!, vi: w.vi, syl, tones: syl.map((s) => parseSyllable(s).tone) }]
})

export const SINGLES = WORDS.filter((w) => w.syl.length === 1 && w.tones[0] !== 5)
export const PAIRS = WORDS.filter((w) => w.syl.length === 2)

export interface CharExample { ch: string; syl: string; word: ZhWord }

// Mỗi âm tiết gốc (không thanh) → các chữ ví dụ lấy từ kho từ, để bảng âm bấm nghe được.
export const EXAMPLES: Map<string, CharExample[]> = (() => {
  const map = new Map<string, CharExample[]>()
  for (const w of WORDS) {
    const chars = Array.from(w.zh).filter((c) => HAN.test(c))
    w.syl.forEach((s, k) => {
      const base = parseSyllable(s).base
      const list = map.get(base) ?? []
      if (!list.some((x) => x.ch === chars[k])) list.push({ ch: chars[k], syl: s, word: w })
      map.set(base, list)
    })
  }
  return map
})()

export const pairKey = (t: Tone[]) => t.join('-')

const TONE_LABEL: Record<number, string> = { 1: '1 ˉ', 2: '2 ˊ', 3: '3 ˇ', 4: '4 ˋ', 5: 'nhẹ' }
export const pairLabel = (key: string) => key.split('-').map((n) => TONE_LABEL[Number(n)]).join('  +  ')

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

let seq = 0
const qid = () => `zq${++seq}`

export function singleToneQuestion(): HQuestion {
  const w = pick(SINGLES)
  const tone = w.tones[0]
  return {
    id: qid(), kind: 'hear', item: `t${tone}`, ask: 'Nghe và chọn thanh điệu', prompt: '', audio: w.zh,
    options: ['1 ˉ', '2 ˊ', '3 ˇ', '4 ˋ'], answer: TONE_LABEL[tone], hangulOptions: false,
    explain: `${w.zh} ${w.pinyin} · ${w.vi} — thanh ${tone}`,
  }
}

// Đáp án là cặp thanh khi ĐỌC (đã áp dụng biến điệu 3+3), vì người học đang luyện tai.
export function pairQuestion(weights?: Record<string, number>): HQuestion {
  let w = pick(PAIRS)
  if (weights) {
    const pool = PAIRS.map((p) => ({ p, wt: weights[pairKey(spokenTones(p.tones))] ?? 1 }))
    let r = Math.random() * pool.reduce((s, x) => s + x.wt, 0)
    for (const x of pool) { r -= x.wt; if (r <= 0) { w = x.p; break } }
  }
  const spoken = spokenTones(w.tones)
  const key = pairKey(spoken)
  const near = new Set<string>()
  const [a, b] = spoken
  // Nhiễu: đổi một trong hai thanh, ưu tiên các cặp hay nhầm 2↔3, 1↔4
  const swaps: Record<number, number[]> = { 1: [4, 2], 2: [3, 1], 3: [2, 4], 4: [1, 3], 5: [3, 1] }
  for (const x of swaps[a] ?? []) near.add(pairKey([x as Tone, b]))
  for (const x of swaps[b] ?? []) near.add(pairKey([a, x as Tone]))
  near.add(pairKey([b, a] as Tone[]))
  near.delete(key)
  const options = shuffle([key, ...shuffle([...near]).slice(0, 3)]).map(pairLabel)
  const sandhi = w.tones[0] === 3 && w.tones[1] === 3
  return {
    id: qid(), kind: 'hear', item: key, ask: 'Nghe từ hai âm tiết và chọn cặp thanh', prompt: '', audio: w.zh,
    options, answer: pairLabel(key), hangulOptions: false,
    explain: `${w.zh} ${w.pinyin} · ${w.vi}${sandhi ? ' — viết 3+3 nhưng đọc 2+3' : ''}`,
  }
}

export function markQuestion(): HQuestion {
  const w = pick(WORDS)
  const s = pick(w.syl)
  const { base, tone, erhua } = parseSyllable(s)
  const right = s.toLowerCase()
  const vowels = [...base].map((c, k) => ('aeiouü'.includes(c) ? k : -1)).filter((k) => k >= 0)
  const wrong = new Set<string>()
  if (tone !== 5) {
    for (const at of vowels) {
      const marked = markTone(base[at], tone)
      const cand = base.slice(0, at) + marked + base.slice(at + 1) + (erhua ? 'r' : '')
      if (cand !== right) wrong.add(cand)
    }
    for (const t of [1, 2, 3, 4] as Tone[]) if (t !== tone) wrong.add(markTone(base, t) + (erhua ? 'r' : ''))
  }
  if (tone === 5 || vowels.length < 2) return markQuestion()
  const options = shuffle([right, ...shuffle([...wrong]).slice(0, 3)])
  return {
    id: qid(), kind: 'write', item: 'mark', ask: 'Đặt dấu thanh đúng chỗ', prompt: `${base}${erhua ? 'r' : ''} + thanh ${tone}`,
    options, answer: right, hangulOptions: false,
    explain: `${right} — có a/e thì dấu lên a/e, có ou thì lên o, còn lại lên nguyên âm cuối (trong từ ${w.zh} ${w.pinyin}).`,
  }
}

// Từ vận mẫu gốc (vd "iou", "üan" sau j) hỏi cách viết chuẩn (you, juan)
export function spellingQuestion(tries = 0): HQuestion {
  const cands = WORDS.flatMap((w) => w.syl.map((s) => ({ w, s, ...splitSyllable(parseSyllable(s).base) })))
    .filter((x) => x.written !== x.initial + x.final)
  const x = pick(cands)
  const underlying = (x.initial || '∅') + ' + ' + x.final
  const wrong = new Set<string>([x.initial + x.final, x.initial + x.final.replace('ü', 'u'), x.initial + x.final.replace('ü', 'v')])
  if (!x.initial) {
    wrong.add(x.final)
    wrong.add('y' + x.final)
    wrong.add('w' + x.final)
  }
  if (x.initial) wrong.add(x.initial + 'i' + x.final.replace(/^[iuü]/, ''))
  wrong.delete(x.written)
  // Ít hơn 3 phương án thì câu quá dễ đoán, lấy câu khác
  if (wrong.size < 2 && tries < 20) return spellingQuestion(tries + 1)
  const options = shuffle([x.written, ...shuffle([...wrong].filter(Boolean)).slice(0, 3)])
  return {
    id: qid(), kind: 'write', item: 'spell', ask: 'Ghép âm này viết bằng pinyin thế nào?', prompt: underlying,
    options, answer: x.written, hangulOptions: false,
    explain: `${underlying} → ${x.written} (trong ${x.w.zh} ${x.w.pinyin} · ${x.w.vi})`,
  }
}
