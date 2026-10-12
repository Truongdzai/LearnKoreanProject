// Ghép câu tiếng Anh: những chỗ trật tự từ khác tiếng Việt.
// Mỗi câu có dạng chuẩn và (nếu có) các cách xếp khác cũng đúng — dùng đúng những thẻ đó.

export type FocusId = 'adj' | 'question' | 'freq' | 'placetime' | 'neg' | 'poss' | 'degree' | 'perfect'
export type LevelId = 'easy' | 'hard'
export type Verdict = 'exact' | 'alt' | 'wrong'

export interface Sentence {
  id: string
  en: string
  vi: string
  focus: FocusId
  alts: string[]
}

export interface Tile {
  id: string
  text: string
}

export const FOCUS: { id: FocusId; label: string; tip: string }[] = [
  { id: 'adj', label: 'Tính từ + danh từ', tip: 'Tính từ đứng TRƯỚC danh từ: a red car (xe màu đỏ). Nhiều tính từ: ý kiến → kích thước → tuổi → màu: a beautiful blue dress, a big old house.' },
  { id: 'question', label: 'Câu hỏi', tip: 'Câu hỏi đảo trợ động từ lên trước chủ ngữ: Where do you live? · Can you swim? · Did you eat? Từ để hỏi (what, where…) luôn đứng đầu câu.' },
  { id: 'freq', label: 'always / never', tip: 'Trạng từ tần suất đứng TRƯỚC động từ thường (I always drink…) nhưng SAU động từ be và động từ khuyết thiếu (She is never late · You can always call).' },
  { id: 'placetime', label: 'Nơi chốn & thời gian', tip: 'Cụm thời gian thường ở cuối câu, sau nơi chốn: I go to school every day. Muốn nhấn mạnh thì đưa thời gian lên đầu: Yesterday we met at the station.' },
  { id: 'neg', label: 'Phủ định', tip: 'Phủ định cần trợ động từ: don\'t / doesn\'t / didn\'t + động từ nguyên mẫu (He didn\'t go). Với be và can thì thêm not ngay sau: isn\'t, can\'t.' },
  { id: 'poss', label: 'Sở hữu \'s & there is', tip: 'Tiếng Việt nói "túi của chị tôi", tiếng Anh đảo lại: my sister\'s bag — người sở hữu + \'s đứng trước vật. Nói "có" ở đâu đó thì mở đầu bằng There is / There are.' },
  { id: 'degree', label: 'very / too / enough', tip: 'very well đứng sau tân ngữ (speaks English very well, không nói speaks very well English). too đứng trước tính từ, còn enough đứng SAU tính từ: old enough.' },
  { id: 'perfect', label: 'never / already / yet', tip: 'Hiện tại hoàn thành: have / has + never / already + V3. yet đứng cuối câu phủ định và câu hỏi: We haven\'t seen it yet.' },
]

type Raw = [string, string, FocusId, string[]?]

const RAW: Raw[] = [
  ['She has a red car.', 'Cô ấy có một chiếc xe màu đỏ.', 'adj'],
  ['I want a cup of hot coffee.', 'Tôi muốn một tách cà phê nóng.', 'adj', ['I want a hot cup of coffee.']],
  ['They live in a big old house.', 'Họ sống trong một ngôi nhà to và cũ.', 'adj'],
  ['He is a good teacher.', 'Anh ấy là một giáo viên giỏi.', 'adj'],
  ['This is an interesting book.', 'Đây là một cuốn sách hay.', 'adj'],
  ['We stayed at a small hotel near the beach.', 'Chúng tôi ở một khách sạn nhỏ gần bãi biển.', 'adj', ['Near the beach we stayed at a small hotel.', 'We stayed near the beach at a small hotel.']],
  ['My sister bought a beautiful blue dress.', 'Chị tôi đã mua một chiếc váy đẹp màu xanh dương.', 'adj'],
  ['I need a new phone.', 'Tôi cần một chiếc điện thoại mới.', 'adj'],
  ['Hanoi is a busy city.', 'Hà Nội là một thành phố nhộn nhịp.', 'adj'],

  ['Where do you live?', 'Bạn sống ở đâu?', 'question'],
  ['What does your father do?', 'Bố bạn làm nghề gì?', 'question'],
  ['Did you have breakfast?', 'Bạn đã ăn sáng chưa?', 'question'],
  ['How old is your brother?', 'Anh trai bạn bao nhiêu tuổi?', 'question'],
  ['What time does the bus leave?', 'Mấy giờ xe buýt chạy?', 'question'],
  ['Can you speak English?', 'Bạn nói được tiếng Anh không?', 'question'],
  ['Why are you late?', 'Sao bạn đến muộn?', 'question'],
  ['How much is this shirt?', 'Cái áo này giá bao nhiêu?', 'question'],
  ['Where did you go last weekend?', 'Cuối tuần trước bạn đi đâu?', 'question', ['Last weekend where did you go?']],
  ['Is there a bank near here?', 'Gần đây có ngân hàng không?', 'question'],
  ['What are you doing now?', 'Bây giờ bạn đang làm gì?', 'question'],

  ['I always drink coffee in the morning.', 'Buổi sáng tôi luôn uống cà phê.', 'freq', ['In the morning I always drink coffee.']],
  ['She is never late for work.', 'Cô ấy không bao giờ đi làm muộn.', 'freq'],
  ['We never eat meat.', 'Chúng tôi không bao giờ ăn thịt.', 'freq'],
  ['He is always busy.', 'Anh ấy lúc nào cũng bận.', 'freq'],
  ['They often play football after school.', 'Họ thường đá bóng sau giờ học.', 'freq', ['After school they often play football.', 'Often they play football after school.']],
  ['I sometimes watch films at home.', 'Thỉnh thoảng tôi xem phim ở nhà.', 'freq', ['Sometimes I watch films at home.', 'I watch films at home sometimes.', 'At home I sometimes watch films.']],
  ['You can always call me.', 'Lúc nào bạn cũng có thể gọi cho tôi.', 'freq'],

  ['I go to school every day.', 'Ngày nào tôi cũng đến trường.', 'placetime', ['Every day I go to school.']],
  ['We met at the station yesterday.', 'Hôm qua chúng tôi gặp nhau ở nhà ga.', 'placetime', ['Yesterday we met at the station.', 'We met yesterday at the station.']],
  ['She works in a bank.', 'Cô ấy làm việc ở ngân hàng.', 'placetime'],
  ['I will call you tomorrow morning.', 'Sáng mai tôi sẽ gọi cho bạn.', 'placetime', ['Tomorrow morning I will call you.']],
  ['My parents arrived in Hanoi last night.', 'Tối qua bố mẹ tôi đã tới Hà Nội.', 'placetime', ['Last night my parents arrived in Hanoi.', 'My parents arrived last night in Hanoi.']],
  ['He studies English at home every evening.', 'Tối nào anh ấy cũng học tiếng Anh ở nhà.', 'placetime', ['Every evening he studies English at home.', 'He studies English every evening at home.']],
  ['Let\'s meet at the cafe at seven.', 'Mình gặp nhau ở quán cà phê lúc bảy giờ nhé.', 'placetime', ['Let\'s meet at seven at the cafe.']],

  ['I don\'t like coffee.', 'Tôi không thích cà phê.', 'neg'],
  ['He didn\'t go to work yesterday.', 'Hôm qua anh ấy không đi làm.', 'neg', ['Yesterday he didn\'t go to work.']],
  ['She isn\'t at home.', 'Cô ấy không có nhà.', 'neg'],
  ['We can\'t swim.', 'Chúng tôi không biết bơi.', 'neg'],
  ['My brother doesn\'t eat fish.', 'Em trai tôi không ăn cá.', 'neg'],
  ['They aren\'t students.', 'Họ không phải là sinh viên.', 'neg'],
  ['There isn\'t any milk in the fridge.', 'Trong tủ lạnh không còn chút sữa nào.', 'neg', ['In the fridge there isn\'t any milk.']],

  ['This is my sister\'s bag.', 'Đây là túi của chị gái tôi.', 'poss'],
  ['My mother\'s name is Lan.', 'Mẹ tôi tên là Lan.', 'poss', ['Lan is my mother\'s name.']],
  ['Where is your teacher\'s office?', 'Văn phòng của thầy giáo bạn ở đâu?', 'poss'],
  ['I borrowed my friend\'s bike.', 'Tôi mượn xe đạp của bạn tôi.', 'poss'],
  ['There is a cat on the table.', 'Có một con mèo ở trên bàn.', 'poss', ['On the table there is a cat.']],
  ['There are many people in the park.', 'Trong công viên có rất nhiều người.', 'poss', ['In the park there are many people.']],

  ['She speaks English very well.', 'Cô ấy nói tiếng Anh rất giỏi.', 'degree'],
  ['This coffee is too hot.', 'Cà phê này nóng quá.', 'degree'],
  ['He isn\'t old enough to drive.', 'Cậu ấy chưa đủ tuổi lái xe.', 'degree'],
  ['I like this song very much.', 'Tôi rất thích bài hát này.', 'degree', ['I very much like this song.']],
  ['The room is big enough for four people.', 'Căn phòng đủ rộng cho bốn người.', 'degree'],
  ['You walk too fast.', 'Bạn đi nhanh quá.', 'degree'],

  ['I have never been to Japan.', 'Tôi chưa bao giờ đến Nhật Bản.', 'perfect'],
  ['Have you ever eaten pho?', 'Bạn đã từng ăn phở chưa?', 'perfect'],
  ['She has already finished her homework.', 'Cô ấy đã làm xong bài tập rồi.', 'perfect', ['She has finished her homework already.']],
  ['We haven\'t seen that film yet.', 'Chúng tôi chưa xem bộ phim đó.', 'perfect', ['We haven\'t yet seen that film.']],
  ['How long have you lived here?', 'Bạn sống ở đây bao lâu rồi?', 'perfect'],
]

// id chính là câu tiếng Anh để danh sách câu sai vẫn đúng khi thêm / bớt câu
export const SENTENCES: Sentence[] = RAW.map(([en, vi, focus, alts]) => ({ id: en, en, vi, focus, alts: alts ?? [] }))

// Từ luôn viết hoa dù không đứng đầu câu
const PROPER = new Set(['I', 'English', 'Hanoi', 'Lan', 'Japan'])

export const words = (s: string) => s.replace(/[.?!]$/, '').split(/\s+/)
export const endMark = (s: string) => (/[.?!]$/.test(s) ? s.slice(-1) : '.')
const norm = (ws: string[]) => ws.map((w) => w.toLowerCase()).join(' ')

const tileText = (w: string, i: number) => (i === 0 && !PROPER.has(w) ? w.toLowerCase() : w)

export function tilesFor(s: Sentence): Tile[] {
  return words(s.en).map((w, i) => ({ id: `${i}`, text: tileText(w, i) }))
}

// Cách xếp (câu gốc hoặc cách khác cũng đúng) khớp dài nhất với phần đã ghép — để gợi ý không phá cách xếp đúng khác
export function bestTarget(s: Sentence, built: string[]): { words: string[]; k: number } {
  const got = built.map((w) => w.toLowerCase())
  let best = { words: words(s.en).map(tileText), k: -1 }
  for (const c of [s.en, ...s.alts]) {
    const ws = words(c).map(tileText)
    let k = 0
    while (k < ws.length && ws[k].toLowerCase() === got[k]) k++
    if (k > best.k) best = { words: ws, k }
  }
  return best
}

export function scramble(tiles: Tile[]): Tile[] {
  const a = [...tiles]
  const target = norm(tiles.map((t) => t.text))
  for (let k = 0; k < 8; k++) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    if (norm(a.map((t) => t.text)) !== target) break
  }
  return a
}

export function judge(s: Sentence, built: string[]): Verdict {
  const b = norm(built)
  if (b === norm(words(s.en))) return 'exact'
  if (s.alts.some((a) => norm(words(a)) === b)) return 'alt'
  return 'wrong'
}

// Viết hoa chữ đầu câu cho phần xem trước
export function sentenceCase(ws: string[]): string {
  if (!ws.length) return ''
  const [first, ...rest] = ws
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(' ')
}

// Gợi ý: chỉ ra chỗ đầu tiên lệch so với câu chuẩn
export function hintFor(s: Sentence, built: string[]): string {
  const { words: shown, k } = bestTarget(s, built)
  const tip = FOCUS.find((f) => f.id === s.focus)!.tip
  if (k >= shown.length) return tip
  const before = k ? `Đúng tới “${sentenceCase(shown.slice(0, k))}”, ` : ''
  const next = k ? shown[k] : sentenceCase([shown[0]])
  return `${before}${k ? 'sau đó' : 'Câu bắt đầu bằng'} “${next}”. ${tip}`
}

export const LEVELS: { id: LevelId; label: string; desc: string }[] = [
  { id: 'easy', label: 'Câu ngắn', desc: 'Câu 3–5 thẻ: câu hỏi, phủ định, tính từ trước danh từ, very well, too.' },
  { id: 'hard', label: 'Câu dài', desc: 'Câu 6–9 thẻ: nơi chốn và thời gian, always / never, sở hữu \'s, enough.' },
]

export const levelOf = (s: Sentence): LevelId => (words(s.en).length <= 5 ? 'easy' : 'hard')

export const ROUND = 8

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Một lượt: câu đúng cấp, ưu tiên câu vừa sai, lọc theo nhóm nếu có chọn
export function buildRound(level: LevelId, focus: FocusId[], weak: string[]): Sentence[] {
  const pool = SENTENCES.filter((s) => levelOf(s) === level && (!focus.length || focus.includes(s.focus)))
  const use = pool.length ? pool : SENTENCES.filter((s) => levelOf(s) === level)
  const w = shuffle(use.filter((s) => weak.includes(s.id))).slice(0, Math.ceil(ROUND / 2))
  const rest = shuffle(use.filter((s) => !weak.includes(s.id)))
  return shuffle([...w, ...rest].slice(0, ROUND))
}
