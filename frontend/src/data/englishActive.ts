import type { IconName } from '@/core/components/Icon'
import daily from './english/active/daily.json'
import repair from './english/active/repair.json'
import smalltalk from './english/active/smalltalk.json'
import take from './english/active/take.json'
import workit from './english/active/workit.json'
import interview from './english/active/interview.json'
import email from './english/active/email.json'
import meeting from './english/active/meeting.json'
import opinion from './english/active/opinion.json'
import wordEntries from './english/active/words.json'

export type ChunkKind = 'chunk' | 'pattern' | 'colloc' | 'phrasal' | 'strategy'

export interface ActiveChunk {
  id: string
  en: string
  pattern: string
  vi: string
  kind: ChunkKind
  cue: string
  say: string
  alts: string[]
  ask: string
  note: string
  trap: string
}

export interface SceneLine {
  sp: string
  en: string
  vi: string
}

export interface ActiveScene {
  title: string
  setting: string
  lines: SceneLine[]
}

export interface ActivePack {
  id: string
  name: string
  sub: string
  tone: string
  cefr: string
  goal: string
  why: string
  scene: ActiveScene
  chunks: ActiveChunk[]
}

export const PACKS: ActivePack[] = [
  daily, repair, smalltalk, take, workit, meeting, opinion, email, interview,
] as ActivePack[]

export const ALL_CHUNKS: ActiveChunk[] = PACKS.flatMap((p) => p.chunks)

const BY_ID = new Map<string, ActiveChunk>(ALL_CHUNKS.map((c) => [c.id, c]))
const PACK_OF = new Map<string, ActivePack>()
for (const p of PACKS) for (const c of p.chunks) PACK_OF.set(c.id, p)

export function chunkById(id: string): ActiveChunk | undefined {
  return BY_ID.get(id)
}

export function packOfChunk(id: string): ActivePack | undefined {
  return PACK_OF.get(id)
}

export function packById(id: string): ActivePack | undefined {
  return PACKS.find((p) => p.id === id)
}

export const KIND_LABEL: Record<ChunkKind, string> = {
  chunk: 'Cụm cố định',
  pattern: 'Khuôn câu',
  colloc: 'Từ đi với nhau',
  phrasal: 'Cụm động từ',
  strategy: 'Chiến lược nói',
}

export type Dim = 'recognize' | 'listen' | 'recall' | 'use' | 'respond'

export interface DimSpec {
  id: Dim
  name: string
  question: string
  icon: IconName
  tone: string
  proves: number
  hits: number
  desc: string
}

export const DIMS: DimSpec[] = [
  {
    id: 'recognize',
    name: 'Nhìn là nhận ra',
    question: 'Cụm này nghĩa là gì?',
    icon: 'eye',
    tone: 'tone-a',
    proves: 1,
    hits: 1,
    desc: 'Thấy cụm tiếng Anh, chọn đúng nghĩa. Đây là tầng dễ nhất và cũng là tầng gây ảo giác "mình nhớ rồi".',
  },
  {
    id: 'listen',
    name: 'Nghe là bắt được',
    question: 'Nghe câu, cụm nào vừa xuất hiện?',
    icon: 'headphones',
    tone: 'tone-c',
    proves: 2,
    hits: 1,
    desc: 'Nghe cả câu ở tốc độ thật rồi nhận ra cụm. Nhiều người đọc hiểu nhưng nghe không ra — đây là chỗ lộ ra điều đó.',
  },
  {
    id: 'recall',
    name: 'Tự truy xuất',
    question: 'Tình huống này, tiếng Anh nói sao?',
    icon: 'bulb',
    tone: 'tone-e',
    proves: 3,
    hits: 2,
    desc: 'Chỉ có tình huống tiếng Việt, bạn phải tự bật ra tiếng Anh. Đây là ranh giới thật giữa "biết" và "dùng được".',
  },
  {
    id: 'use',
    name: 'Tự đặt câu',
    question: 'Đặt một câu của riêng bạn',
    icon: 'note',
    tone: 'tone-b',
    proves: 4,
    hits: 1,
    desc: 'Tự viết một câu mới bằng cụm đó, gắn với đời bạn. AI chấm và sửa. Nhớ được câu mẫu chưa đủ, phải tạo ra câu mới.',
  },
  {
    id: 'respond',
    name: 'Phản xạ trả lời',
    question: 'Nghe hỏi — trả lời ngay',
    icon: 'mic',
    tone: 'tone-f',
    proves: 5,
    hits: 2,
    desc: 'Nghe một câu hỏi thật và đáp lại trong vài giây. Đây là tầng cuối: không kịp dịch trong đầu, từ phải tự bật ra.',
  },
]

export const DIM_BY_ID: Record<Dim, DimSpec> = DIMS.reduce((acc, d) => {
  acc[d.id] = d
  return acc
}, {} as Record<Dim, DimSpec>)

export interface LevelSpec {
  lv: number
  name: string
  en: string
  desc: string
  tone: string
}

export const LEVELS: LevelSpec[] = [
  { lv: 0, name: 'Chưa gặp', en: 'New', desc: 'Cụm này còn nằm ngoài vốn của bạn.', tone: 'tone-a' },
  { lv: 1, name: 'Nhận ra', en: 'Recognition', desc: 'Nhìn thấy thì hiểu. Chưa nghe ra, chưa nói ra được.', tone: 'tone-a' },
  { lv: 2, name: 'Nghe hiểu', en: 'Comprehension', desc: 'Nghe trong câu ở tốc độ thật thì bắt được.', tone: 'tone-c' },
  { lv: 3, name: 'Truy xuất', en: 'Recall', desc: 'Gặp tình huống là tự nhớ ra cụm cần dùng.', tone: 'tone-e' },
  { lv: 4, name: 'Dùng được', en: 'Usage', desc: 'Tự đặt được câu mới đúng và tự nhiên.', tone: 'tone-b' },
  { lv: 5, name: 'Tự động', en: 'Automaticity', desc: 'Bật ra trong vài giây, không cần dịch trong đầu.', tone: 'tone-f' },
]

export function levelSpec(lv: number): LevelSpec {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, lv))]
}

export const AUTOMATIC_MS = 4000
export const FAST_MS = 2500

export type SpeedBand = 'fast' | 'ok' | 'slow' | 'none'

export function speedBand(ms: number): SpeedBand {
  if (!ms) return 'none'
  if (ms <= FAST_MS) return 'fast'
  if (ms <= AUTOMATIC_MS) return 'ok'
  return 'slow'
}

export const SPEED_LABEL: Record<SpeedBand, string> = {
  fast: 'Bật ra ngay',
  ok: 'Còn phải nghĩ',
  slow: 'Chưa vào vòng lõi',
  none: 'Chưa đo',
}

export interface LoopStep {
  id: string
  n: number
  name: string
  en: string
  icon: IconName
  tone: string
  desc: string
}

export const LOOP: LoopStep[] = [
  { id: 'input', n: 1, name: 'Nạp vào', en: 'Input', icon: 'headphones', tone: 'tone-a', desc: 'Nghe và đọc một mẩu ngôn ngữ thật trong tình huống có thật.' },
  { id: 'notice', n: 2, name: 'Nhận diện', en: 'Notice', icon: 'eye', tone: 'tone-c', desc: 'Soi ra các cụm, khuôn câu và cách nói tự nhiên nằm trong đó.' },
  { id: 'recall', n: 3, name: 'Truy xuất', en: 'Recall', icon: 'bulb', tone: 'tone-e', desc: 'Bỏ đáp án đi, tự lôi cụm đó ra từ trí nhớ — có bấm giờ.' },
  { id: 'output', n: 4, name: 'Bật ra', en: 'Output', icon: 'mic', tone: 'tone-f', desc: 'Tự nói, tự viết bằng cụm vừa học. Đây là bước hầu hết người học bỏ qua.' },
  { id: 'feedback', n: 5, name: 'Phản hồi', en: 'Feedback', icon: 'bell', tone: 'tone-b', desc: 'AI soi lỗi ngay, xếp loại lỗi và ghi vào sổ trước khi lỗi hoá thạch.' },
  { id: 'retry', n: 6, name: 'Nói lại', en: 'Retry', icon: 'refresh', tone: 'tone-d', desc: 'Sửa xong nói lại ngay — não chỉ ghi nhớ bản đúng khi bạn tự phát ra nó.' },
  { id: 'review', n: 7, name: 'Ôn lại', en: 'Review', icon: 'calendar', tone: 'tone-a', desc: 'Gặp lại đúng lúc sắp quên, và lần này kiểm ở chiều khó hơn lần trước.' },
]

const PUNCT = /[.,!?;:"“”'’()\-—]/g

export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const CONTRACTIONS: [RegExp, string][] = [
  [/\bi am\b/g, "i'm"],
  [/\bit is\b/g, "it's"],
  [/\bthat is\b/g, "that's"],
  [/\bi would\b/g, "i'd"],
  [/\bi will\b/g, "i'll"],
  [/\bi have\b/g, "i've"],
  [/\bdo not\b/g, "don't"],
  [/\bdoes not\b/g, "doesn't"],
  [/\bcan not\b/g, "cannot"],
  [/\bwe are\b/g, "we're"],
  [/\bwe will\b/g, "we'll"],
  [/\bwhat is\b/g, "what's"],
  [/\blet us\b/g, "let's"],
]

function fold(s: string): string {
  let out = normalizeAnswer(s)
  for (const [re, to] of CONTRACTIONS) out = out.replace(re, to)
  return out
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = cur
  }
  return prev[n]
}

export interface MatchResult {
  ok: boolean
  close: boolean
  score: number
  best: string
}

export function matchAny(said: string, targets: string[]): MatchResult {
  const mine = fold(said)
  const first = targets[0] ?? ''
  if (!mine || !targets.length) return { ok: false, close: false, score: 0, best: first }

  let best = first
  let bestScore = 0
  for (const t of targets) {
    const want = fold(t)
    const dist = levenshtein(mine, want)
    const score = 1 - dist / Math.max(want.length, mine.length, 1)
    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }
  return {
    ok: bestScore >= 0.9,
    close: bestScore >= 0.72,
    score: Math.round(bestScore * 100),
    best,
  }
}

export function matchSay(said: string, chunk: ActiveChunk): MatchResult {
  const targets = [chunk.say, ...chunk.alts]
  const mine = fold(said)
  if (!mine) return { ok: false, close: false, score: 0, best: chunk.say }

  let best = chunk.say
  let bestScore = 0
  for (const t of targets) {
    const want = fold(t)
    const dist = levenshtein(mine, want)
    const score = 1 - dist / Math.max(want.length, mine.length, 1)
    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }
  return {
    ok: bestScore >= 0.9,
    close: bestScore >= 0.72,
    score: Math.round(bestScore * 100),
    best,
  }
}

export function usesChunk(said: string, chunk: ActiveChunk): boolean {
  const mine = fold(said)
  const key = fold(chunk.en).replace(/…|\.\.\./g, '').trim()
  if (!key) return false
  const words = key.split(' ').filter((w) => w.length > 2)
  if (!words.length) return mine.includes(key)
  const hit = words.filter((w) => mine.includes(w.replace(/s$/, ''))).length
  return hit / words.length >= 0.6
}

const FAMILY_HEADS = [
  'take', 'get', 'make', 'put', 'work', 'look', 'come', 'go', 'keep', 'run', 'hold',
  'turn', 'bring', 'give', 'set', 'break', 'call', 'catch', 'pick', 'follow', 'push',
  'pull', 'check', 'close', 'cut', 'hand', 'hang', 'leave', 'let', 'move', 'pass',
  'play', 'send', 'show', 'stand', 'start', 'stop', 'walk', 'watch', 'say', 'tell',
  'think', 'feel', 'find', 'sound', 'mean', 'mind', 'add', 'agree', 'say',
]

const IRREGULAR: Record<string, string> = {
  took: 'take', taken: 'take', got: 'get', gotten: 'get', made: 'make',
  went: 'go', gone: 'go', came: 'come', gave: 'give', given: 'give',
  kept: 'keep', held: 'hold', brought: 'bring', broke: 'break', broken: 'break',
  caught: 'catch', left: 'leave', ran: 'run', said: 'say', told: 'tell',
  thought: 'think', felt: 'feel', found: 'find', sent: 'send', shown: 'show',
  stood: 'stand', meant: 'mean',
}

const WORDS = /[a-z']+/g

function isForm(word: string, head: string): boolean {
  if (word === head) return true
  if (IRREGULAR[word] === head) return true
  const stem = head.endsWith('e') ? head.slice(0, -1) : head
  const dbl = head + head[head.length - 1]
  return word === `${head}s` || word === `${head}es`
    || word === `${head}d` || word === `${head}ed` || word === `${head}ing`
    || word === `${stem}ing` || word === `${stem}ed`
    || word === `${dbl}ing` || word === `${dbl}ed`
}

function headsIn(text: string): string[] {
  const found = new Set<string>()
  for (const raw of text.toLowerCase().match(WORDS) ?? []) {
    const w = raw.replace(/^'+|'+$/g, '')
    if (!w) continue
    for (const h of FAMILY_HEADS) {
      if (isForm(w, h)) found.add(h)
    }
  }
  return [...found]
}

export interface WordSense {
  vi: string
  ex: string
  exVi: string
}

export interface ComboItem {
  form: string
  vi: string
  ex: string
}

export interface ComboGroup {
  label: string
  note?: string
  items: ComboItem[]
}

export interface WordEntry {
  ipa: string
  pos: string
  core: string
  senses: WordSense[]
  combos: ComboGroup[]
}

export const WORD_ENTRIES = wordEntries as Record<string, WordEntry>

export function wordEntry(head: string): WordEntry | undefined {
  return WORD_ENTRIES[head]
}

export function comboCount(entry: WordEntry): number {
  return entry.combos.reduce((n, g) => n + g.items.length, 0)
}

export interface FamilyGloss {
  ipa: string
  pos: string
  vi: string
}

export const FAMILY_GLOSS: Record<string, FamilyGloss> = {
  take: { ipa: '/teɪk/', pos: 'v.', vi: 'lấy, mang, nhận, dùng, đảm nhận…' },
  look: { ipa: '/lʊk/', pos: 'v.', vi: 'nhìn, trông, có vẻ, tìm…' },
  let: { ipa: '/let/', pos: 'v.', vi: 'để cho, cho phép, rủ (Let’s…)' },
  say: { ipa: '/seɪ/', pos: 'v.', vi: 'nói, bảo, phát biểu' },
  work: { ipa: '/wɜːrk/', pos: 'v. · n.', vi: 'làm việc, chạy được, phù hợp; công việc' },
  run: { ipa: '/rʌn/', pos: 'v.', vi: 'chạy, vận hành, điều hành, cạn (run out)' },
  mean: { ipa: '/miːn/', pos: 'v. · adj.', vi: 'có nghĩa là, định, ám chỉ; keo kiệt' },
  make: { ipa: '/meɪk/', pos: 'v.', vi: 'làm ra, khiến cho, đạt được' },
  go: { ipa: '/ɡoʊ/', pos: 'v.', vi: 'đi, trở nên, diễn ra, hợp với' },
  get: { ipa: '/ɡet/', pos: 'v.', vi: 'lấy được, trở nên, hiểu, tới nơi' },
  agree: { ipa: '/əˈɡriː/', pos: 'v.', vi: 'đồng ý, nhất trí, hợp nhau' },
}

export interface WordFamily {
  head: string
  members: ActiveChunk[]
}

const FAMILY_MIN = 3

const HEADS_OF = new Map<string, string[]>()
const familyMap = new Map<string, ActiveChunk[]>()
for (const c of ALL_CHUNKS) {
  const heads = headsIn(c.en)
  HEADS_OF.set(c.id, heads)
  for (const h of heads) {
    const list = familyMap.get(h) ?? []
    list.push(c)
    familyMap.set(h, list)
  }
}

export const FAMILIES: WordFamily[] = [...familyMap.entries()]
  .filter(([, members]) => members.length >= FAMILY_MIN)
  .map(([head, members]) => ({ head, members }))
  .sort((a, b) => b.members.length - a.members.length)

const FAMILY_HEAD_SET = new Set(FAMILIES.map((f) => f.head))

export function familiesOf(chunkId: string): string[] {
  return (HEADS_OF.get(chunkId) ?? []).filter((h) => FAMILY_HEAD_SET.has(h))
}

export function familySiblings(chunk: ActiveChunk): ActiveChunk[] {
  const heads = familiesOf(chunk.id)
  if (!heads.length) return []
  const out = new Map<string, ActiveChunk>()
  for (const h of heads) {
    for (const m of familyMap.get(h) ?? []) {
      if (m.id !== chunk.id) out.set(m.id, m)
    }
  }
  return [...out.values()]
}

export interface BlindSpot {
  id: string
  title: string
  symptom: string
  why: string
  fix: string
  icon: IconName
  tone: string
}

export const BLIND_SPOTS: BlindSpot[] = [
  {
    id: 'speed',
    title: 'Tốc độ truy xuất',
    symptom: '“Tôi biết từ này mà lúc cần lại không nhớ ra.”',
    why: 'Bạn phải đi qua quá nhiều chặng: ý tưởng → tiếng Việt → tìm từ → tìm cấu trúc → soát ngữ pháp → ghép câu → nói. Bảy chặng thì không thể kịp.',
    fix: 'Mọi bài truy xuất ở đây đều bấm giờ. Đích không phải nhớ nhiều hơn mà là nhớ ra nhanh hơn.',
    icon: 'clock',
    tone: 'tone-e',
  },
  {
    id: 'output',
    title: 'Nạp nhiều nhưng không bật ra',
    symptom: 'Xem phim, nghe podcast, học từ đều đặn — vẫn không nói được câu nào.',
    why: 'Hiểu người khác và tự tạo ra ngôn ngữ là hai năng lực khác nhau. Input mãi chỉ nuôi được năng lực thứ nhất.',
    fix: 'Buổi học nào cũng có khối “Bật ra”: tự đặt câu, tự kể lại, tự trả lời. Không có Output thì buổi học chưa xong.',
    icon: 'mic',
    tone: 'tone-f',
  },
  {
    id: 'shadow',
    title: 'Nhại theo tạo ảo giác biết nói',
    symptom: 'Nhại “I have been working here for three months” rất mượt, nhưng bị hỏi thì đứng hình.',
    why: 'Bắt chước không phải tự sản xuất. Khi có sẵn chữ trước mắt, não bạn chỉ đang chép âm thanh.',
    fix: 'Sau bước nhại theo luôn có bước bỏ lời thoại và tự kể lại bằng lời của bạn.',
    icon: 'refresh',
    tone: 'tone-c',
  },
  {
    id: 'selfcheck',
    title: 'Tự chấm sai mức mình đang ở',
    symptom: 'Cảm giác “mình nhớ rồi” — nhưng đó chỉ là nhận ra mặt chữ.',
    why: 'Nhận ra là tầng dễ nhất trong năm tầng. Nó tạo cảm giác thành thạo giả.',
    fix: 'Mỗi cụm bị soi từ năm phía khác nhau. Chỉ khi qua hết mới được ghi là làm chủ.',
    icon: 'eye',
    tone: 'tone-a',
  },
  {
    id: 'feedback',
    title: 'Nói sai mà không ai sửa',
    symptom: '“Yesterday I go to company” lặp mãi thành thói quen.',
    why: 'Lỗi không được sửa sớm sẽ hoá thạch. Chữa một lỗi đã thành nếp tốn gấp nhiều lần học đúng từ đầu.',
    fix: 'AI chấm ngay sau mỗi lần bạn nói, xếp loại lỗi và tự ghi vào Sổ lỗi để bạn chữa dứt điểm từng cái.',
    icon: 'bell',
    tone: 'tone-b',
  },
  {
    id: 'movie',
    title: 'Hiểu phim ≠ giao tiếp được',
    symptom: 'Xem phim không cần phụ đề, gặp người thật vẫn ú ớ.',
    why: 'Người thật nói chồng lời, đổi chủ đề, hỏi bất ngờ và bắt bạn đáp lại ngay. Phim thì không.',
    fix: 'Phim và video là nguyên liệu đầu vào, không phải cả quá trình. Sau khi xem phải có phần đối đáp có sức ép thời gian.',
    icon: 'film',
    tone: 'tone-d',
  },
  {
    id: 'goal',
    title: 'Mục tiêu quá chung chung',
    symptom: '“Tôi học tiếng Anh để giao tiếp.”',
    why: 'Mục tiêu rộng thì không có nội dung nào bị loại ra, nên học mãi không thấy tới đích.',
    fix: 'Chọn một gói tình huống sát nhất với việc bạn thật sự phải làm bằng tiếng Anh — tiếp khách, họp hành, xin việc, viết thư, hay chỉ là chuyện trò hằng ngày — rồi học đúng gói đó trước.',
    icon: 'target',
    tone: 'tone-e',
  },
]

export const PACK_COUNT = PACKS.length
export const CHUNK_COUNT = ALL_CHUNKS.length
