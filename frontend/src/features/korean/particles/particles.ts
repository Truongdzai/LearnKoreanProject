import { decompose } from '@/core/utils/hangul'
import { KO_ALL_WORDS } from '@/data/koreanCore'
import { FRAMES, GROUPS, type Frame, type GroupId } from '@/data/korean/particleFrames'

// Trợ từ đổi dạng theo âm cuối của danh từ đứng trước: có patchim hay không (riêng (으)로 còn xét ㄹ).

export type KindId = 'topic' | 'subject' | 'object' | 'and' | 'ro' | 'cop' | 'with' | 'or' | 'voc'

export interface Kind {
  id: KindId
  label: string
  role: string
  withB: string
  noB: string
  note: string
}

export const KINDS: Kind[] = [
  { id: 'topic', label: '은/는', role: 'chủ đề — "còn… thì"', withB: '은', noB: '는', note: 'Có patchim + 은, không patchim + 는.' },
  { id: 'subject', label: '이/가', role: 'chủ ngữ', withB: '이', noB: '가', note: 'Có patchim + 이, không patchim + 가. Riêng 저 → 제가, 나 → 내가, 너 → 네가, 누구 → 누가.' },
  { id: 'object', label: '을/를', role: 'tân ngữ', withB: '을', noB: '를', note: 'Có patchim + 을, không patchim + 를.' },
  { id: 'and', label: '와/과', role: '"và" (văn viết)', withB: '과', noB: '와', note: 'Ngược với trực giác: có patchim + 과, không patchim + 와.' },
  { id: 'ro', label: '(으)로', role: 'phương tiện, hướng, "bằng"', withB: '으로', noB: '로', note: 'Có patchim + 으로; không patchim hoặc tận cùng ㄹ + 로 (지하철로, 연필로).' },
  { id: 'cop', label: '이에요/예요', role: '"là"', withB: '이에요', noB: '예요', note: 'Có patchim + 이에요, không patchim + 예요.' },
  { id: 'with', label: '(이)랑', role: '"với, và" (văn nói)', withB: '이랑', noB: '랑', note: 'Có patchim + 이랑, không patchim + 랑.' },
  { id: 'or', label: '(이)나', role: '"hoặc"', withB: '이나', noB: '나', note: 'Có patchim + 이나, không patchim + 나.' },
  { id: 'voc', label: '아/야', role: 'gọi tên thân mật', withB: '아', noB: '야', note: 'Tên có patchim + 아, không patchim + 야. Chỉ dùng với bạn bè, người nhỏ tuổi hơn.' },
]

export const KIND_BY_ID = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<KindId, Kind>

const SPECIAL_SUBJECT: Record<string, string> = { 저: '제가', 나: '내가', 너: '네가', 누구: '누가' }

export function tailOf(word: string): string | null {
  const p = decompose(word.slice(-1))
  return p ? p.tail : null
}

export function attach(noun: string, kind: KindId): string {
  if (kind === 'subject' && SPECIAL_SUBJECT[noun]) return SPECIAL_SUBJECT[noun]
  const k = KIND_BY_ID[kind]
  const tail = tailOf(noun)
  const b = kind === 'ro' ? !!tail && tail !== 'ㄹ' : !!tail
  return noun + (b ? k.withB : k.noB)
}

// Dạng sai hay gặp: dùng nhầm biến thể còn lại, hoặc gắn đuôi bình thường cho đại từ đặc biệt
export function wrongForm(noun: string, kind: KindId): string {
  if (kind === 'subject' && SPECIAL_SUBJECT[noun]) return noun + '가'
  const k = KIND_BY_ID[kind]
  const right = attach(noun, kind)
  return right === noun + k.withB ? noun + k.noB : noun + k.withB
}

export function explain(noun: string, kind: KindId): string {
  const k = KIND_BY_ID[kind]
  if (kind === 'subject' && SPECIAL_SUBJECT[noun]) {
    return `${noun} + 가 không giữ nguyên mà đổi thành ${SPECIAL_SUBJECT[noun]}.`
  }
  const tail = tailOf(noun)
  const last = noun.slice(-1)
  if (kind === 'ro' && tail === 'ㄹ') return `${last} tận cùng ㄹ → + 로, không thêm 으: ${attach(noun, kind)}.`
  return tail
    ? `${last} có patchim ${tail} → + ${k.withB}: ${attach(noun, kind)}.`
    : `${last} không có patchim → + ${k.noB}: ${attach(noun, kind)}.`
}

// ── Kho danh từ cho phần gắn dạng ──

const BLOCK = new Set(['제', '씨', '님', '저', '나', '너', '누구', '것', '분', '때', '번', '개', '명', '살', '시', '분'])

const NAMES: { ko: string; vi: string }[] = [
  { ko: '민수', vi: 'Minsu (tên)' },
  { ko: '지민', vi: 'Jimin (tên)' },
  { ko: '수진', vi: 'Sujin (tên)' },
  { ko: '현우', vi: 'Hyunwoo (tên)' },
  { ko: '서연', vi: 'Seoyeon (tên)' },
  { ko: '준호', vi: 'Junho (tên)' },
  { ko: '하늘', vi: 'Haneul (tên)' },
  { ko: '유나', vi: 'Yuna (tên)' },
]

const PRONOUNS: { ko: string; vi: string }[] = [
  { ko: '저', vi: 'Tôi (lịch sự)' },
  { ko: '나', vi: 'Tôi, tớ (thân mật)' },
  { ko: '너', vi: 'Bạn, cậu (thân mật)' },
  { ko: '누구', vi: 'Ai' },
]

export const NOUNS: { ko: string; vi: string }[] = (() => {
  const seen = new Set<string>()
  const out: { ko: string; vi: string }[] = []
  for (const w of KO_ALL_WORDS) {
    const ko = w.ko ?? ''
    if (w.pos !== 'noun' || !/^[가-힣]{1,4}$/.test(ko) || BLOCK.has(ko) || seen.has(ko)) continue
    seen.add(ko)
    out.push({ ko, vi: w.vi })
  }
  return out
})()

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[k]] = [a[k], a[i]]
  }
  return a
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// ── Câu hỏi ──

export interface PItem {
  id: string
  type: 'form' | 'frame'
  ask: string
  // Câu có chỗ trống ___ (frame) hoặc danh từ cần gắn (form)
  ko: string
  vi: string
  options: string[]
  answer: string
  why: string
  // Câu đầy đủ để đọc lên sau khi trả lời
  say: string
  tag: string
}

export const ROUND = 10
let seq = 0

function formItem(kind: KindId): PItem {
  const k = KIND_BY_ID[kind]
  const src = kind === 'voc' ? pick(NAMES) : kind === 'subject' && Math.random() < 0.2 ? pick(PRONOUNS) : pick(NOUNS)
  const answer = attach(src.ko, kind)
  return {
    id: `f${++seq}`,
    type: 'form',
    ask: `Gắn ${k.label} (${k.role})`,
    ko: src.ko,
    vi: src.vi,
    options: shuffle([answer, wrongForm(src.ko, kind)]),
    answer,
    why: explain(src.ko, kind),
    say: answer,
    tag: kind,
  }
}

export function buildFormRound(kinds: KindId[]): PItem[] {
  // Xoay vòng các loại đã chọn để lượt nào cũng đủ mặt
  const order = shuffle(kinds.length ? kinds : KINDS.map((k) => k.id))
  const out: PItem[] = []
  const used = new Set<string>()
  let guard = 0
  while (out.length < ROUND && guard++ < 200) {
    const it = formItem(order[out.length % order.length])
    const key = it.ko + it.tag
    if (used.has(key)) continue
    used.add(key)
    out.push(it)
  }
  return out
}

export function frameItem(f: Frame): PItem {
  return {
    id: `${f.id}-${++seq}`,
    type: 'frame',
    ask: 'Chọn trợ từ đúng cho chỗ trống',
    ko: f.ko,
    vi: f.vi,
    options: shuffle(f.options),
    answer: f.answer,
    why: f.why,
    say: fillBlank(f.ko, f.answer),
    tag: f.id,
  }
}

export function fillBlank(ko: string, part: string): string {
  return ko.replace('___', part)
}

// Câu từng sai được rút gấp ba lần
export function buildFrameRound(groups: GroupId[], weak: string[]): PItem[] {
  const pool = FRAMES.filter((f) => !groups.length || groups.includes(f.group))
  const weighted = pool.map((f) => ({ f, w: weak.includes(f.id) ? 3 : 1 }))
  const out: PItem[] = []
  const used = new Set<string>()
  while (out.length < Math.min(ROUND, pool.length)) {
    const total = weighted.reduce((s, x) => s + (used.has(x.f.id) ? 0 : x.w), 0)
    let r = Math.random() * total
    const next = weighted.find((x) => !used.has(x.f.id) && (r -= x.w) <= 0) ?? weighted.find((x) => !used.has(x.f.id))!
    used.add(next.f.id)
    out.push(frameItem(next.f))
  }
  return out
}

export { FRAMES, GROUPS }
export type { Frame, GroupId }
