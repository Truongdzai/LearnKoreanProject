// Cặp từ dễ nhầm vì tiếng Việt dùng chung một từ (mượn / cho mượn, nói, làm, nghe, xem…).
// Mỗi câu chỉ một phương án đúng; bỏ những chỗ người bản ngữ dùng được cả hai (bring / take, also cuối câu…).

export type SetId = 'verb' | 'adj' | 'small'

export interface Pair {
  id: string
  words: string
  set: SetId
  tip: string
}

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  pair: string
}

export const SETS: { id: SetId; label: string }[] = [
  { id: 'verb', label: 'Động từ' },
  { id: 'adj', label: 'Tính từ' },
  { id: 'small', label: 'Từ nhỏ hay sai' },
]

export const PAIRS: Pair[] = [
  { id: 'borrow', words: 'borrow / lend', set: 'verb', tip: 'borrow = mượn (lấy về mình): borrow something FROM someone. lend = cho mượn (đưa đi): lend someone something.' },
  { id: 'say', words: 'say / tell', set: 'verb', tip: 'tell + người nghe: tell me, tell her a story. say không đi thẳng với người: say something, say that…, say to me.' },
  { id: 'make', words: 'make / do', set: 'verb', tip: 'make = tạo ra cái gì đó (make a mistake, a plan, noise, a cake). do = làm việc, nhiệm vụ (do homework, the housework, a favour).' },
  { id: 'see', words: 'see / look at / watch', set: 'verb', tip: 'see = nhìn thấy (tự mắt thấy). look at = hướng mắt nhìn vào. watch = xem cái đang chuyển động một lúc (TV, trận đấu).' },
  { id: 'hear', words: 'hear / listen to', set: 'verb', tip: 'hear = nghe thấy (âm thanh tự lọt vào tai). listen to = lắng nghe, chủ động chú ý.' },
  { id: 'remember', words: 'remember / remind', set: 'verb', tip: 'remember = (tự) nhớ. remind someone = nhắc ai đó nhớ: remind me to call her.' },
  { id: 'win', words: 'win / beat', set: 'verb', tip: 'win + trận đấu, giải thưởng: win the match. beat + đối thủ: beat Thailand.' },
  { id: 'rob', words: 'rob / steal', set: 'verb', tip: 'steal + đồ vật: steal a bike. rob + người hoặc nơi chốn: rob a bank, rob a tourist.' },
  { id: 'lose', words: 'lose / miss', set: 'verb', tip: 'lose = làm mất (đồ), thua (trận). miss = lỡ (xe, chuyến bay, buổi học) hoặc nhớ ai đó.' },
  { id: 'ed', words: '-ed / -ing', set: 'adj', tip: '-ed tả cảm xúc của người (I\'m bored, interested). -ing tả thứ gây ra cảm xúc đó (a boring film, interesting news).' },
  { id: 'fun', words: 'fun / funny', set: 'adj', tip: 'fun = vui (thú vị, thích thú): The party was fun. funny = buồn cười: a funny joke.' },
  { id: 'alone', words: 'alone / lonely', set: 'adj', tip: 'alone = một mình (sự thật, không ai bên cạnh). lonely = cô đơn (cảm xúc buồn).' },
  { id: 'other', words: 'another / other', set: 'small', tip: 'another + danh từ số ít (thêm một cái nữa): another cup. other + danh từ số nhiều: other students.' },
  { id: 'much', words: 'much / many', set: 'small', tip: 'many + danh từ đếm được số nhiều (many people). much + danh từ không đếm được (much water, much time).' },
  { id: 'ago', words: 'ago / before', set: 'small', tip: 'ago = cách đây (tính từ bây giờ, dùng với quá khứ đơn): three years ago. before = trước đây (đứng cuối câu, hay đi với thì hoàn thành).' },
  { id: 'during', words: 'during / while', set: 'small', tip: 'during + danh từ: during the film. while + mệnh đề (chủ ngữ + động từ): while I was watching.' },
  { id: 'either', words: 'too / either', set: 'small', tip: 'Câu khẳng định dùng too ("cũng"). Câu phủ định dùng either: She doesn\'t like it either.' },
  { id: 'job', words: 'job / work', set: 'small', tip: 'job đếm được (a job, two jobs). work không đếm được: a lot of work, không nói "a work".' },
]

// [câu, nghĩa, [đáp án, …sai], cặp]
type Raw = [string, string, string[], string]

const RAW: Raw[] = [
  ['Can I ___ your pen for a minute?', 'Cho mình mượn cây bút một lát nhé?', ['borrow', 'lend'], 'borrow'],
  ['Could you ___ me your umbrella?', 'Bạn cho mình mượn cái ô được không?', ['lend', 'borrow'], 'borrow'],
  ['I ___ this book from the library last week.', 'Tuần trước tôi mượn cuốn sách này ở thư viện.', ['borrowed', 'lent'], 'borrow'],
  ['My brother never ___ me his car.', 'Anh tôi chẳng bao giờ cho tôi mượn xe.', ['lends', 'borrows'], 'borrow'],

  ['She ___ me a funny story.', 'Cô ấy kể cho tôi một câu chuyện vui.', ['told', 'said'], 'say'],
  ['What did he ___ about the trip?', 'Anh ấy nói gì về chuyến đi?', ['say', 'tell'], 'say'],
  ['Can you ___ me the way to the station?', 'Bạn chỉ giúp tôi đường ra ga được không?', ['tell', 'say'], 'say'],
  ['He ___ that he was tired.', 'Anh ấy nói là anh ấy mệt.', ['said', 'told'], 'say'],

  ['I have to ___ my homework tonight.', 'Tối nay tôi phải làm bài tập.', ['do', 'make'], 'make'],
  ['Don\'t ___ so much noise!', 'Đừng làm ồn thế!', ['make', 'do'], 'make'],
  ['Could you ___ me a favour?', 'Bạn giúp mình một việc được không?', ['do', 'make'], 'make'],
  ['She ___ a mistake in the test.', 'Cô ấy làm sai một câu trong bài kiểm tra.', ['made', 'did'], 'make'],
  ['Let\'s ___ a plan for the weekend.', 'Mình lên kế hoạch cho cuối tuần đi.', ['make', 'do'], 'make'],

  ['My kids ___ TV every evening.', 'Tối nào con tôi cũng xem ti vi.', ['watch', 'see', 'look at'], 'see'],
  ['___ this photo! Isn\'t it beautiful?', 'Nhìn bức ảnh này đi! Đẹp không?', ['Look at', 'Watch', 'Hear'], 'see'],
  ['I can\'t ___ anything without my glasses.', 'Không có kính thì tôi chẳng nhìn thấy gì.', ['see', 'watch', 'look'], 'see'],

  ['Please ___ me carefully.', 'Hãy nghe tôi nói cho kỹ.', ['listen to', 'hear'], 'hear'],
  ['Did you ___ that noise?', 'Bạn có nghe thấy tiếng động đó không?', ['hear', 'listen to'], 'hear'],
  ['Speak louder, please. I can\'t ___ you.', 'Nói to lên chút. Tôi không nghe thấy bạn.', ['hear', 'listen'], 'hear'],

  ['Please ___ me to call my mother.', 'Nhắc tôi gọi điện cho mẹ nhé.', ['remind', 'remember'], 'remember'],
  ['I can\'t ___ his name.', 'Tôi không nhớ nổi tên anh ấy.', ['remember', 'remind'], 'remember'],

  ['Vietnam ___ Thailand 2–0 last night.', 'Tối qua Việt Nam thắng Thái Lan 2–0.', ['beat', 'won'], 'win'],
  ['Our team ___ the match.', 'Đội chúng tôi thắng trận.', ['won', 'beat'], 'win'],

  ['Someone ___ my bike last night.', 'Tối qua có người lấy trộm xe đạp của tôi.', ['stole', 'robbed'], 'rob'],
  ['Two men ___ the bank this morning.', 'Sáng nay hai tên cướp ngân hàng.', ['robbed', 'stole'], 'rob'],

  ['Hurry up or we\'ll ___ the bus.', 'Nhanh lên kẻo lỡ xe buýt.', ['miss', 'lose'], 'lose'],
  ['I\'ve ___ my keys again! I can\'t find them anywhere.', 'Tôi lại làm mất chìa khóa rồi! Tìm mãi không thấy.', ['lost', 'missed'], 'lose'],

  ['The film was so ___ that I fell asleep.', 'Phim chán đến mức tôi ngủ quên.', ['boring', 'bored'], 'ed'],
  ['I\'m ___. Let\'s do something fun.', 'Chán quá. Làm gì vui vui đi.', ['bored', 'boring'], 'ed'],
  ['She is very ___ in history.', 'Cô ấy rất thích (quan tâm) môn lịch sử.', ['interested', 'interesting'], 'ed'],
  ['The news was really ___.', 'Tin đó thật sự bất ngờ.', ['surprising', 'surprised'], 'ed'],
  ['I was ___ when I saw the price.', 'Tôi ngạc nhiên khi thấy giá.', ['surprised', 'surprising'], 'ed'],

  ['The party was a lot of ___.', 'Bữa tiệc rất vui.', ['fun', 'funny'], 'fun'],
  ['He told a ___ joke and everyone laughed.', 'Anh ấy kể một chuyện cười và ai cũng bật cười.', ['funny', 'fun'], 'fun'],

  ['She lives ___ in a small flat.', 'Cô ấy sống một mình trong căn hộ nhỏ.', ['alone', 'lonely'], 'alone'],
  ['Since his friends moved away, he has been very ___.', 'Từ khi bạn bè chuyển đi, anh ấy rất cô đơn.', ['lonely', 'alone'], 'alone'],

  ['Can I have ___ cup of tea, please?', 'Cho tôi thêm một tách trà nữa nhé?', ['another', 'other'], 'other'],
  ['Some students like English, and ___ students like maths.', 'Có bạn thích tiếng Anh, có bạn khác thích toán.', ['other', 'another'], 'other'],

  ['How ___ water do you drink a day?', 'Mỗi ngày bạn uống bao nhiêu nước?', ['much', 'many'], 'much'],
  ['How ___ people came to the party?', 'Có bao nhiêu người đến dự tiệc?', ['many', 'much'], 'much'],
  ['I don\'t have ___ time today.', 'Hôm nay tôi không có nhiều thời gian.', ['much', 'many'], 'much'],

  ['I met her three years ___.', 'Tôi gặp cô ấy cách đây ba năm.', ['ago', 'before'], 'ago'],
  ['I have never seen him ___.', 'Trước đây tôi chưa từng gặp anh ấy.', ['before', 'ago'], 'ago'],

  ['I fell asleep ___ the film.', 'Tôi ngủ quên trong lúc chiếu phim.', ['during', 'while'], 'during'],
  ['I fell asleep ___ I was watching the film.', 'Tôi ngủ quên trong lúc đang xem phim.', ['while', 'during'], 'during'],

  ['I don\'t like coffee, and my sister doesn\'t like it ___.', 'Tôi không thích cà phê, và chị tôi cũng không.', ['either', 'too', 'also'], 'either'],

  ['I\'m looking for a new ___.', 'Tôi đang tìm việc mới.', ['job', 'work'], 'job'],
  ['I have a lot of ___ to do today.', 'Hôm nay tôi có nhiều việc phải làm.', ['work', 'job'], 'job'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, pair]) => ({ id: en, en, vi, options: opts, answer: opts[0], pair }))

export const pairOf = (id: string) => PAIRS.find((p) => p.id === id)!
export const setOf = (f: Frame) => pairOf(f.pair).set

export const ROUND = 10

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildRound(sets: SetId[], weak: string[]): (Frame & { shuffled: string[] })[] {
  const pool = FRAMES.filter((f) => !sets.length || sets.includes(setOf(f)))
  const w = shuffle(pool.filter((f) => weak.includes(f.id))).slice(0, Math.ceil(ROUND / 2))
  const rest = shuffle(pool.filter((f) => !weak.includes(f.id)))
  return shuffle([...w, ...rest].slice(0, ROUND)).map((f) => ({ ...f, shuffled: shuffle(f.options) }))
}

export const filled = (f: Frame) => f.en.replace('___', f.answer)
