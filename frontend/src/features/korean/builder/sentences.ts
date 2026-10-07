import { KO_ALL_WORDS } from '@/data/koreanCore'
import koLines from '@/data/korean/speaking/lines.json'

// Câu để ghép lấy từ câu ví dụ của 805 từ lõi và câu mẫu trong phần luyện nói: chỉ giữ câu đơn
// (một dấu câu ở cuối, không dấu phẩy, không số hay chữ Latin) để thứ tự từ có một đáp án rõ ràng.

export type LevelId = 'easy' | 'mid' | 'hard'

export interface Sentence {
  ko: string
  vi: string
  words: string[]
}

export interface Tile {
  id: string
  text: string
  // Trợ từ tách riêng: dính vào thẻ đứng trước, không có dấu cách
  part: boolean
}

export const LEVELS: { id: LevelId; label: string; desc: string }[] = [
  { id: 'easy', label: 'Câu ngắn', desc: 'Câu 3 từ, mỗi thẻ là một từ.' },
  { id: 'mid', label: 'Câu dài', desc: 'Câu 4–7 từ, mỗi thẻ là một từ.' },
  { id: 'hard', label: 'Tách trợ từ', desc: 'Trợ từ thành thẻ riêng (학교 + 에): phải gắn đúng trợ từ vào đúng danh từ.' },
]

export const ROUND = 8

const ONE_SENTENCE = /^[가-힣 ]+[.?!]$/

function collect(): Sentence[] {
  const pairs: { ko: string; vi: string }[] = []
  for (const w of KO_ALL_WORDS) if (w.ex && w.exVi) pairs.push({ ko: w.ex.trim(), vi: w.exVi.trim() })
  const walk = (v: unknown) => {
    if (Array.isArray(v)) { v.forEach(walk); return }
    if (!v || typeof v !== 'object') return
    const o = v as Record<string, unknown>
    if (typeof o.ko === 'string' && typeof o.vi === 'string') pairs.push({ ko: o.ko.trim(), vi: o.vi.trim() })
    Object.values(o).forEach(walk)
  }
  walk(koLines)

  const seen = new Set<string>()
  const out: Sentence[] = []
  for (const p of pairs) {
    if (seen.has(p.ko) || !ONE_SENTENCE.test(p.ko) || (p.vi.match(/[.?!]/g) ?? []).length > 1) continue
    seen.add(p.ko)
    const words = p.ko.slice(0, -1).split(' ')
    if (words.length < 3 || words.length > 7) continue
    out.push({ ko: p.ko, vi: p.vi, words })
  }
  return out
}

export const SENTENCES: Sentence[] = collect()

// ── Tách trợ từ ──

const NOUNS = new Set<string>(['저', '나', '우리', '제', '이것', '그것', '저것', '여기', '거기', '저기', '이거', '그거'])
for (const w of KO_ALL_WORDS) if (w.pos === 'noun' && w.ko && /^[가-힣]+$/.test(w.ko)) NOUNS.add(w.ko)

// Dài trước ngắn để 에서 không bị cắt thành 에 + 서
const PARTICLES = ['에게서', '한테서', '에서', '에게', '한테', '까지', '부터', '이랑', '으로', '하고', '처럼', '보다',
  '은', '는', '이', '가', '을', '를', '에', '도', '만', '와', '과', '의', '로', '랑']

export function splitParticle(word: string): [string, string] | null {
  for (const p of PARTICLES) {
    if (!word.endsWith(p) || word.length <= p.length) continue
    const stem = word.slice(0, -p.length)
    if (NOUNS.has(stem)) return [stem, p]
  }
  return null
}

let seq = 0

export function tilesFor(s: Sentence, level: LevelId): Tile[] {
  const out: Tile[] = []
  s.words.forEach((w, k) => {
    // Từ cuối là động từ / tính từ, không tách
    const split = level === 'hard' && k < s.words.length - 1 ? splitParticle(w) : null
    if (split) {
      out.push({ id: `t${++seq}`, text: split[0], part: false })
      out.push({ id: `t${++seq}`, text: split[1], part: true })
    } else {
      out.push({ id: `t${++seq}`, text: w, part: false })
    }
  })
  return out
}

function particleCount(s: Sentence): number {
  return s.words.slice(0, -1).filter((w) => splitParticle(w)).length
}

export function poolFor(level: LevelId): Sentence[] {
  if (level === 'easy') return SENTENCES.filter((s) => s.words.length === 3)
  if (level === 'mid') return SENTENCES.filter((s) => s.words.length >= 4)
  return SENTENCES.filter((s) => s.words.length <= 5 && particleCount(s) >= 2)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[k]] = [a[k], a[i]]
  }
  return a
}

// Xáo thẻ sao cho không trùng sẵn thứ tự đúng
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

// Ghép thẻ thành các từ (trợ từ dính vào thẻ trước)
export function joinTiles(tiles: Tile[]): string[] {
  const words: string[] = []
  for (const t of tiles) {
    if (t.part && words.length) words[words.length - 1] += t.text
    else words.push(t.text)
  }
  return words
}

// ── Chấm ──

// Trạng từ thời gian, tần suất: đứng riêng thành một cụm, đổi chỗ được
const MOVABLE = new Set(['오늘', '내일', '어제', '지금', '매일', '요즘', '항상', '자주', '가끔', '보통', '아까', '나중에', '아마',
  '주말에', '아침에', '저녁에', '밤에', '오전에', '오후에', '내년에', '작년에', '올해', '이번에', '다음에', '먼저'])

// Trợ từ buộc chặt vào danh từ đứng sau (của, và) thì không cắt cụm ở đó
const BINDING = new Set(['의', '와', '과', '하고', '랑', '이랑'])

// Đuôi chắc chắn là trợ từ dù danh từ không có trong kho (không động từ nào chia ra 를, 에서, 에게…)
const CLEAR_ENDS = /.(를|에서|에게|한테|께서|으로)$/

function isBoundary(w: string): boolean {
  if (MOVABLE.has(w) || CLEAR_ENDS.test(w)) return true
  const split = splitParticle(w)
  return !!split && !BINDING.has(split[1])
}

// Chia câu thành các cụm: danh từ + trợ từ cách (kèm từ bổ nghĩa đứng trước), trạng từ thời gian,
// và cụm vị ngữ cuối câu. Tiếng Hàn cho đổi chỗ các cụm trước vị ngữ; vị ngữ luôn ở cuối.
export function chunks(words: string[]): string[][] {
  const out: string[][] = []
  let cur: string[] = []
  words.forEach((w, k) => {
    cur.push(w)
    // 오늘 저녁에, 매일 아침에: hai từ chỉ thời gian liền nhau là một cụm
    if (MOVABLE.has(w) && MOVABLE.has(words[k + 1] ?? '')) return
    if (k < words.length - 1 && isBoundary(w)) {
      out.push(cur)
      cur = []
    }
  })
  out.push(cur)
  return out
}

function fits(built: string[], at: number, rest: string[][]): boolean {
  if (!rest.length) return at === built.length
  return rest.some((c, k) => c.every((w, j) => built[at + j] === w) && fits(built, at + c.length, rest.filter((_, x) => x !== k)))
}

// Mệnh đề phụ (…아서, …고, …면) hoặc định ngữ (공부하는 학생) có tân ngữ riêng: đổi chỗ các cụm có thể
// kéo tân ngữ ra khỏi mệnh đề của nó, nên những câu này chỉ nhận đúng thứ tự gốc
const CLAUSE_END = /(서|고|면|니까|지만|는데|은데|려고|러)$/
const ADNOMINAL = /(는|은|던)$/

export function flexible(words: string[]): boolean {
  const cs = chunks(words)
  if (cs.length < 3) return false
  const body = cs.slice(0, -1).flat()
  if (body.some((w) => !isBoundary(w) && CLAUSE_END.test(w))) return false
  const last = cs[cs.length - 1]
  return !last.slice(0, -1).some((w) => !isBoundary(w) && !NOUNS.has(w) && (ADNOMINAL.test(w) || CLAUSE_END.test(w)))
}

export type Verdict = 'exact' | 'alt' | 'wrong'

export function judge(target: string[], built: string[]): Verdict {
  if (built.join(' ') === target.join(' ')) return 'exact'
  if (built.length !== target.length || !flexible(target)) return 'wrong'
  const cs = chunks(target)
  const last = cs[cs.length - 1]
  const tail = built.slice(built.length - last.length)
  if (tail.join(' ') !== last.join(' ')) return 'wrong'
  return fits(built.slice(0, built.length - last.length), 0, cs.slice(0, -1)) ? 'alt' : 'wrong'
}

export function hintFor(target: string[], built: string[]): string {
  if (built[built.length - 1] !== target[target.length - 1]) {
    return 'Động từ / tính từ luôn đứng cuối câu tiếng Hàn — đặt thẻ chia đuôi (…요, …니다) xuống cuối.'
  }
  const firstBad = built.findIndex((w, k) => w !== target[k])
  const sameWords = [...built].sort().join(' ') === [...target].sort().join(' ')
  if (!sameWords) return 'Có trợ từ đang gắn nhầm danh từ — mỗi trợ từ phải đứng ngay sau danh từ mà nó đánh dấu.'
  return firstBad >= 0 ? `Vị trí thứ ${firstBad + 1} chưa đúng. Thứ tự thường gặp: (thời gian) → chủ ngữ → nơi chốn → tân ngữ → động từ.` : ''
}
