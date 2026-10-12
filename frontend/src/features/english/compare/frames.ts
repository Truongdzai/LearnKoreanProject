// So sánh hơn / so sánh nhất. Chỉ dùng tính từ có MỘT dạng chuẩn (bỏ quiet, clever, simple, far…
// vốn dùng được cả hai kiểu), phương án sai là lỗi người học hay mắc: more cheap, more cheaper, gooder, expensiver.

export type AdjKind = 'short' | 'y' | 'long' | 'irr'
export type Degree = 'comp' | 'sup'

interface Adj {
  base: string
  comp: string
  sup: string
  kind: AdjKind
}

const A = (base: string, comp: string, sup: string, kind: AdjKind): Adj => ({ base, comp, sup, kind })

const ADJ: Record<string, Adj> = Object.fromEntries([
  A('cheap', 'cheaper', 'cheapest', 'short'), A('tall', 'taller', 'tallest', 'short'), A('big', 'bigger', 'biggest', 'short'),
  A('hot', 'hotter', 'hottest', 'short'), A('fast', 'faster', 'fastest', 'short'), A('old', 'older', 'oldest', 'short'),
  A('cold', 'colder', 'coldest', 'short'), A('small', 'smaller', 'smallest', 'short'), A('high', 'higher', 'highest', 'short'),
  A('young', 'younger', 'youngest', 'short'),
  A('easy', 'easier', 'easiest', 'y'), A('busy', 'busier', 'busiest', 'y'), A('heavy', 'heavier', 'heaviest', 'y'),
  A('happy', 'happier', 'happiest', 'y'), A('funny', 'funnier', 'funniest', 'y'),
  A('expensive', 'more expensive', 'most expensive', 'long'), A('difficult', 'more difficult', 'most difficult', 'long'),
  A('interesting', 'more interesting', 'most interesting', 'long'), A('dangerous', 'more dangerous', 'most dangerous', 'long'),
  A('comfortable', 'more comfortable', 'most comfortable', 'long'), A('important', 'more important', 'most important', 'long'),
  A('popular', 'more popular', 'most popular', 'long'), A('beautiful', 'more beautiful', 'most beautiful', 'long'),
  A('famous', 'more famous', 'most famous', 'long'),
  A('good', 'better', 'best', 'irr'), A('bad', 'worse', 'worst', 'irr'),
].map((a) => [a.base, a]))

export const KIND_INFO: Record<AdjKind, { name: string; rule: string }> = {
  short: { name: 'Tính từ ngắn (1 âm tiết)', rule: 'Thêm -er / -est: cheap → cheaper → the cheapest. Tận cùng phụ âm – nguyên âm – phụ âm thì gấp đôi: big → bigger, hot → hottest. Không thêm more / most.' },
  y: { name: 'Tính từ tận cùng -y', rule: 'Đổi y thành i rồi thêm -er / -est: easy → easier → the easiest, happy → happier.' },
  long: { name: 'Tính từ dài (từ 2–3 âm tiết)', rule: 'Dùng more / the most đứng trước, giữ nguyên tính từ: more expensive, the most beautiful. Không thêm -er.' },
  irr: { name: 'Bất quy tắc', rule: 'good → better → the best, bad → worse → the worst. Không nói gooder, more good, badder.' },
}

// Thêm -er / -est "máy móc" như người học hay làm (expensive → expensiver, happy → happyer)
const er = (b: string) => (b.endsWith('e') ? b + 'r' : b + 'er')
const est = (b: string) => (b.endsWith('e') ? b + 'st' : b + 'est')

// Phương án sai theo loại tính từ (luôn khác dạng đúng)
function wrongs(a: Adj, d: Degree): string[] {
  if (d === 'comp') {
    if (a.kind === 'short') return [`more ${a.base}`, `more ${a.comp}`, a.sup]
    if (a.kind === 'y') return [er(a.base), `more ${a.comp}`, a.sup]
    if (a.kind === 'long') return [er(a.base), `more ${er(a.base)}`, a.sup]
    return [`${a.base}${a.base === 'bad' ? 'der' : 'er'}`, `more ${a.base}`, a.sup]
  }
  // So sánh nhất không đưa dạng so sánh hơn làm phương án sai: "the cheaper (of the two)" vẫn có thể đúng
  if (a.kind === 'short') return [`most ${a.base}`, `most ${a.sup}`, `more ${a.sup}`]
  if (a.kind === 'y') return [est(a.base), `most ${a.sup}`, `more ${a.sup}`]
  if (a.kind === 'long') return [est(a.base), `most ${est(a.base)}`, `more ${est(a.base)}`]
  return [est(a.base), `most ${a.base}`, `most ${a.sup}`]
}

export interface Frame {
  id: string
  en: string
  vi: string
  adj: string
  degree: Degree
  kind: AdjKind
  options: string[]
  answer: string
}

// [câu (___ (tính từ)), nghĩa, tính từ, mức]
type Raw = [string, string, string, Degree]

const RAW: Raw[] = [
  ['This bag is ___ (cheap) than that one.', 'Cái túi này rẻ hơn cái kia.', 'cheap', 'comp'],
  ['My brother is ___ (tall) than me.', 'Anh trai tôi cao hơn tôi.', 'tall', 'comp'],
  ['Ho Chi Minh City is ___ (big) than Da Nang.', 'TP. Hồ Chí Minh lớn hơn Đà Nẵng.', 'big', 'comp'],
  ['Today is ___ (hot) than yesterday.', 'Hôm nay nóng hơn hôm qua.', 'hot', 'comp'],
  ['A plane is ___ (fast) than a train.', 'Máy bay nhanh hơn tàu hỏa.', 'fast', 'comp'],
  ['My grandfather is ___ (old) than my grandmother.', 'Ông tôi lớn tuổi hơn bà tôi.', 'old', 'comp'],
  ['In winter, Hanoi is ___ (cold) than Ho Chi Minh City.', 'Mùa đông Hà Nội lạnh hơn TP. Hồ Chí Minh.', 'cold', 'comp'],
  ['My new phone is ___ (small) than my old one.', 'Điện thoại mới của tôi nhỏ hơn cái cũ.', 'small', 'comp'],
  ['This exercise is ___ (easy) than the last one.', 'Bài tập này dễ hơn bài trước.', 'easy', 'comp'],
  ['I\'m ___ (busy) this week than last week.', 'Tuần này tôi bận hơn tuần trước.', 'busy', 'comp'],
  ['Your suitcase is ___ (heavy) than mine.', 'Va li của bạn nặng hơn của tôi.', 'heavy', 'comp'],
  ['She is ___ (happy) now than she was last year.', 'Bây giờ cô ấy vui hơn năm ngoái.', 'happy', 'comp'],
  ['This hotel is ___ (expensive) than the one we stayed at last year.', 'Khách sạn này đắt hơn chỗ năm ngoái chúng tôi ở.', 'expensive', 'comp'],
  ['English is ___ (difficult) than I thought.', 'Tiếng Anh khó hơn tôi nghĩ.', 'difficult', 'comp'],
  ['The film is ___ (interesting) than the book.', 'Bộ phim hay hơn cuốn sách.', 'interesting', 'comp'],
  ['Riding a motorbike is ___ (dangerous) than taking the bus.', 'Đi xe máy nguy hiểm hơn đi xe buýt.', 'dangerous', 'comp'],
  ['This chair is ___ (comfortable) than that one.', 'Cái ghế này êm hơn cái kia.', 'comfortable', 'comp'],
  ['Health is ___ (important) than money.', 'Sức khỏe quan trọng hơn tiền bạc.', 'important', 'comp'],
  ['Your English is ___ (good) than mine.', 'Tiếng Anh của bạn giỏi hơn của tôi.', 'good', 'comp'],
  ['The traffic today is ___ (bad) than yesterday.', 'Hôm nay kẹt xe tệ hơn hôm qua.', 'bad', 'comp'],

  ['This is the ___ (cheap) restaurant in the area.', 'Đây là quán ăn rẻ nhất khu này.', 'cheap', 'sup'],
  ['Fansipan is the ___ (high) mountain in Vietnam.', 'Fansipan là ngọn núi cao nhất Việt Nam.', 'high', 'sup'],
  ['January is the ___ (cold) month of the year here.', 'Ở đây tháng Một là tháng lạnh nhất năm.', 'cold', 'sup'],
  ['Who is the ___ (young) person in your family?', 'Ai là người nhỏ tuổi nhất trong nhà bạn?', 'young', 'sup'],
  ['This is the ___ (big) city in the country.', 'Đây là thành phố lớn nhất cả nước.', 'big', 'sup'],
  ['He is the ___ (funny) person in our class.', 'Cậu ấy là người hài hước nhất lớp mình.', 'funny', 'sup'],
  ['That was the ___ (easy) test this year.', 'Đó là bài kiểm tra dễ nhất năm nay.', 'easy', 'sup'],
  ['Pho is the ___ (popular) dish in our restaurant.', 'Phở là món được gọi nhiều nhất ở quán chúng tôi.', 'popular', 'sup'],
  ['This is the ___ (beautiful) beach I have ever seen.', 'Đây là bãi biển đẹp nhất tôi từng thấy.', 'beautiful', 'sup'],
  ['It\'s the ___ (expensive) phone in the shop.', 'Đó là chiếc điện thoại đắt nhất cửa hàng.', 'expensive', 'sup'],
  ['Who is the ___ (famous) singer in your country?', 'Ca sĩ nổi tiếng nhất nước bạn là ai?', 'famous', 'sup'],
  ['She is the ___ (good) student in the class.', 'Cô ấy là học sinh giỏi nhất lớp.', 'good', 'sup'],
  ['It was the ___ (bad) day of my life.', 'Đó là ngày tồi tệ nhất đời tôi.', 'bad', 'sup'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, adj, degree]) => {
  const a = ADJ[adj]
  const answer = degree === 'comp' ? a.comp : a.sup
  return { id: en, en, vi, adj, degree, kind: a.kind, answer, options: [answer, ...wrongs(a, degree)] }
})

export const formsOf = (adj: string) => {
  const a = ADJ[adj]
  return `${a.base} → ${a.comp} → the ${a.sup}`
}

export const ROUND = 10

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildRound(weak: string[]): (Frame & { shuffled: string[] })[] {
  const w = shuffle(FRAMES.filter((f) => weak.includes(f.id))).slice(0, Math.ceil(ROUND / 2))
  const rest = shuffle(FRAMES.filter((f) => !weak.includes(f.id)))
  return shuffle([...w, ...rest].slice(0, ROUND)).map((f) => ({ ...f, shuffled: shuffle(f.options) }))
}

export const filled = (f: Frame) => f.en.replace(/___\s*\([^)]*\)/, f.answer)
