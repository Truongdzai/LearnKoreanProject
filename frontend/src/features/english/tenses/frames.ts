// Chọn thì theo dấu hiệu trong câu. Mỗi câu có 4 phương án, chọn sao cho chỉ MỘT phương án đúng:
// bỏ các cặp mà người bản ngữ vẫn chấp nhận (I just ate / did you eat yet kiểu Mỹ, I'm 20 next year,
// while I cooked…), thay bằng lỗi người Việt hay mắc (she go, I seen, I was → were).

export type TenseId = 'ps' | 'pc' | 'past' | 'pastc' | 'pp' | 'will'
export type GroupId = 'present' | 'past' | 'perfect' | 'future'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  tense: TenseId
  signal: string
}

export const TENSES: Record<TenseId, { name: string; group: GroupId; rule: string }> = {
  ps: { name: 'Hiện tại đơn', group: 'present', rule: 'Thói quen, lịch cố định, sự thật: every day, usually, always. Ngôi he / she / it thêm -s / -es; phủ định doesn\'t + V.' },
  pc: { name: 'Hiện tại tiếp diễn', group: 'present', rule: 'Đang xảy ra lúc nói: now, at the moment, Look!, Listen!, Be quiet! → am / is / are + V-ing.' },
  past: { name: 'Quá khứ đơn', group: 'past', rule: 'Việc đã xong ở thời điểm đã qua: yesterday, last week, ago, in 2010, when I was a child → V2 (phủ định didn\'t + V nguyên mẫu).' },
  pastc: { name: 'Quá khứ tiếp diễn', group: 'past', rule: 'Đang diễn ra tại một lúc trong quá khứ hoặc khi việc khác xen vào: at 8 p.m. yesterday, while… → was / were + V-ing (I / he / she / it was, you / we / they were).' },
  pp: { name: 'Hiện tại hoàn thành', group: 'perfect', rule: 'Từ quá khứ kéo tới nay hoặc kinh nghiệm: since, for … (đến giờ vẫn còn), ever, never, just, yet → have / has + V3.' },
  will: { name: 'Tương lai đơn', group: 'future', rule: 'Dự đoán, quyết định ngay lúc nói, lời hứa: I think…, maybe, tomorrow, next year, Don\'t worry… → will + V nguyên mẫu.' },
}

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'present', label: 'Hiện tại' },
  { id: 'past', label: 'Quá khứ' },
  { id: 'perfect', label: 'Hoàn thành' },
  { id: 'future', label: 'Tương lai' },
]

// [câu, nghĩa, [đáp án, sai, sai, sai], thì, dấu hiệu]
type Raw = [string, string, [string, string, string, string], TenseId, string]

const RAW: Raw[] = [
  ['She ___ (go) to the gym every morning.', 'Sáng nào cô ấy cũng đi tập gym.', ['goes', 'go', 'going', 'has gone'], 'ps', 'every morning'],
  ['Water ___ (boil) at 100 degrees Celsius.', 'Nước sôi ở 100 độ C.', ['boils', 'boil', 'is boiling', 'has boiled'], 'ps', 'sự thật hiển nhiên'],
  ['My father usually ___ (drink) tea after dinner.', 'Bố tôi thường uống trà sau bữa tối.', ['drinks', 'drink', 'is drinking', 'has drunk'], 'ps', 'usually'],
  ['Tom ___ (not / like) coffee, so he always orders tea.', 'Tom không thích cà phê nên lúc nào cũng gọi trà.', ['doesn\'t like', 'don\'t like', 'isn\'t liking', 'not likes'], 'ps', 'always'],
  ['The train ___ (leave) at 6:30 every evening.', 'Tối nào tàu cũng chạy lúc 6 giờ 30.', ['leaves', 'leave', 'is leaving', 'has left'], 'ps', 'every evening'],
  ['Every summer, we ___ (visit) our grandparents in the countryside.', 'Mùa hè nào chúng tôi cũng về quê thăm ông bà.', ['visit', 'visits', 'are visiting', 'have visited'], 'ps', 'every summer'],

  ['Be quiet! The baby ___ (sleep).', 'Trật tự nào! Em bé đang ngủ.', ['is sleeping', 'sleeps', 'slept', 'has slept'], 'pc', 'Be quiet!'],
  ['Look! It ___ (rain) outside.', 'Nhìn kìa! Ngoài trời đang mưa.', ['is raining', 'rains', 'raining', 'rain'], 'pc', 'Look!'],
  ['I can\'t talk now. I ___ (drive).', 'Giờ tôi không nói chuyện được. Tôi đang lái xe.', ['am driving', 'drive', 'drove', 'have driven'], 'pc', 'now'],
  ['Listen! Someone ___ (knock) at the door.', 'Nghe kìa! Có ai đang gõ cửa.', ['is knocking', 'knocks', 'knocked', 'knock'], 'pc', 'Listen!'],
  ['My sister ___ (study) for her exams at the moment.', 'Lúc này chị tôi đang ôn thi.', ['is studying', 'studies', 'studied', 'has studied'], 'pc', 'at the moment'],
  ['It\'s 7 a.m. now. Mom ___ (make) breakfast in the kitchen.', 'Bây giờ là 7 giờ sáng. Mẹ đang làm bữa sáng trong bếp.', ['is making', 'makes', 'is make', 'make'], 'pc', 'now'],
  ['Hurry up! The bus ___ (come).', 'Nhanh lên! Xe buýt đang tới kìa.', ['is coming', 'comes', 'came', 'come'], 'pc', 'Hurry up!'],

  ['I ___ (see) him yesterday.', 'Hôm qua tôi gặp anh ấy.', ['saw', 'have seen', 'see', 'seen'], 'past', 'yesterday'],
  ['They ___ (move) to Da Nang two years ago.', 'Họ chuyển vào Đà Nẵng hai năm trước.', ['moved', 'have moved', 'move', 'are moving'], 'past', 'two years ago'],
  ['She ___ (buy) a new phone last week.', 'Tuần trước cô ấy mua điện thoại mới.', ['bought', 'has bought', 'buys', 'buyed'], 'past', 'last week'],
  ['We ___ (not / go) to work yesterday because it was a holiday.', 'Hôm qua chúng tôi không đi làm vì là ngày nghỉ.', ['didn\'t go', 'haven\'t gone', 'don\'t go', 'didn\'t went'], 'past', 'yesterday'],
  ['In 2010, my family ___ (live) in Hue.', 'Năm 2010 gia đình tôi sống ở Huế.', ['lived', 'have lived', 'live', 'has lived'], 'past', 'in 2010'],
  ['I ___ (meet) my best friend three days ago.', 'Ba hôm trước tôi gặp bạn thân.', ['met', 'have met', 'meet', 'am meeting'], 'past', 'three days ago'],
  ['When I was a child, I ___ (play) football every afternoon.', 'Hồi nhỏ chiều nào tôi cũng đá bóng.', ['played', 'play', 'have played', 'am playing'], 'past', 'When I was a child'],

  ['While I ___ (cook) dinner, the phone rang.', 'Trong lúc tôi đang nấu cơm tối thì điện thoại reo.', ['was cooking', 'were cooking', 'am cooking', 'have cooked'], 'pastc', 'While …, the phone rang'],
  ['At 8 p.m. yesterday, we ___ (watch) a film.', 'Lúc 8 giờ tối qua chúng tôi đang xem phim.', ['were watching', 'was watching', 'are watching', 'have watched'], 'pastc', 'At 8 p.m. yesterday'],
  ['What ___ you doing at 10 o\'clock last night?', '10 giờ tối qua bạn đang làm gì?', ['were', 'was', 'are', 'did'], 'pastc', 'at 10 o\'clock last night'],
  ['Yesterday evening, while we ___ (have) dinner, the lights went out.', 'Tối qua đang ăn cơm thì mất điện.', ['were having', 'was having', 'are having', 'have had'], 'pastc', 'while …, the lights went out'],

  ['I ___ (live) in Hanoi since 2018.', 'Tôi sống ở Hà Nội từ năm 2018 (đến giờ).', ['have lived', 'lived', 'live', 'am living'], 'pp', 'since 2018'],
  ['She ___ (work) here for five years, and she still loves it.', 'Cô ấy làm ở đây được năm năm rồi và vẫn rất thích.', ['has worked', 'worked', 'works', 'is working'], 'pp', 'for five years … still'],
  ['Have you ever ___ (eat) durian?', 'Bạn đã bao giờ ăn sầu riêng chưa?', ['eaten', 'ate', 'eat', 'eating'], 'pp', 'ever'],
  ['I ___ (never / be) to Japan.', 'Tôi chưa bao giờ đến Nhật.', ['have never been', 'never was', 'am never', 'never been'], 'pp', 'never'],
  ['We ___ (know) each other since we were children.', 'Chúng tôi quen nhau từ hồi còn nhỏ.', ['have known', 'knew', 'know', 'are knowing'], 'pp', 'since'],
  ['Lan ___ (not / finish) her homework yet.', 'Lan vẫn chưa làm xong bài tập.', ['hasn\'t finished', 'doesn\'t finish', 'isn\'t finishing', 'not finished'], 'pp', 'yet'],
  ['He ___ (just / leave) the office, so you can\'t see him now.', 'Anh ấy vừa rời văn phòng nên giờ bạn không gặp được đâu.', ['has just left', 'just leaves', 'has just leaved', 'have just left'], 'pp', 'just'],
  ['My parents ___ (be) married for 30 years, and they are still very happy.', 'Bố mẹ tôi cưới nhau được 30 năm và vẫn rất hạnh phúc.', ['have been', 'were', 'are being', 'was'], 'pp', 'for 30 years … still'],

  ['I\'m tired. I think I ___ (go) to bed early tonight.', 'Mệt quá. Chắc tối nay tôi sẽ đi ngủ sớm.', ['will go', 'went', 'have gone', 'goes'], 'will', 'I think … tonight'],
  ['Don\'t worry, I ___ (help) you with your homework.', 'Đừng lo, mình sẽ giúp bạn làm bài tập.', ['will help', 'helped', 'have helped', 'helps'], 'will', 'Don\'t worry (lời hứa)'],
  ['Next year, my brother ___ (be) twenty.', 'Sang năm em trai tôi tròn hai mươi tuổi.', ['will be', 'was', 'has been', 'be'], 'will', 'Next year'],
  ['Maybe it ___ (rain) tomorrow.', 'Có lẽ mai trời sẽ mưa.', ['will rain', 'rained', 'has rained', 'raining'], 'will', 'Maybe … tomorrow'],
  ['It\'s cold in here. I ___ (close) the window.', 'Trong này lạnh quá. Để tôi đóng cửa sổ.', ['will close', 'closes', 'closing', 'am close'], 'will', 'quyết định ngay lúc nói'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, tense, signal]) => ({
  id: en, en, vi, options: opts, answer: opts[0], tense, signal,
}))

export const ROUND = 10

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const groupOf = (f: Frame) => TENSES[f.tense].group

// Một lượt trộn đều các nhóm đã chọn, ưu tiên câu vừa sai; phương án được xáo
export function buildRound(groups: GroupId[], weak: string[]): (Frame & { shuffled: string[] })[] {
  const pool = FRAMES.filter((f) => !groups.length || groups.includes(groupOf(f)))
  // Câu từng sai chiếm tối đa nửa lượt; nếu câu mới không đủ thì lấy thêm câu sai còn lại để lượt luôn đủ số câu
  const ws = shuffle(pool.filter((f) => weak.includes(f.id)))
  const half = Math.ceil(ROUND / 2)
  const rest = shuffle(pool.filter((f) => !weak.includes(f.id)))
  return shuffle([...ws.slice(0, half), ...rest, ...ws.slice(half)].slice(0, ROUND)).map((f) => ({ ...f, shuffled: shuffle(f.options) }))
}

// Câu đã điền đáp án (bỏ phần gợi ý trong ngoặc)
export const filled = (f: Frame) => f.en.replace(/___\s*\([^)]*\)/, f.answer).replace('___', f.answer)
