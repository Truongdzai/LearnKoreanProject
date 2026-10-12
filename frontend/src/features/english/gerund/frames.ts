// V-ing hay to V. Chỉ dùng động từ / cấu trúc đi với MỘT dạng (bỏ like, love, start, begin, stop, try, remember,
// forget… vốn dùng được cả hai hoặc đổi nghĩa), phương án sai là lỗi hay gặp: enjoy to swim, look forward to meet.

export type GerundGroup = 'ing' | 'to' | 'prep' | 'bare'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: GerundGroup
}

export const GROUPS: Record<GerundGroup, { name: string; rule: string; words: string }> = {
  ing: { name: 'Động từ + V-ing', rule: 'Sau enjoy, finish, mind, avoid, keep, give up, suggest dùng V-ing.', words: 'enjoy, finish, mind, avoid, keep, give up, suggest' },
  to: { name: 'Động từ + to V', rule: 'Sau want, would like, decide, hope, plan, need, agree, promise, refuse, afford dùng to + V nguyên mẫu.', words: 'want, would like, decide, hope, plan, need, agree, promise, refuse, afford' },
  prep: { name: 'Giới từ + V-ing', rule: 'Sau giới từ (in, at, for, of, before, after… và cả to trong look forward to) động từ luôn ở dạng V-ing.', words: 'interested in, good at, thank you for, tired of, before, look forward to' },
  bare: { name: 'make / let + V', rule: 'make someone do, let someone do: động từ sau tân ngữ giữ nguyên mẫu, không có to.', words: 'make, let' },
}

type Raw = [string, string, [string, string, string, string], GerundGroup]

const RAW: Raw[] = [
  ['I enjoy ___ (swim) in the sea.', 'Tôi thích bơi ở biển.', ['swimming', 'to swim', 'swim', 'swam'], 'ing'],
  ['Have you finished ___ (read) the book?', 'Bạn đọc xong cuốn sách chưa?', ['reading', 'to read', 'read', 'reads'], 'ing'],
  ['Would you mind ___ (open) the window?', 'Bạn mở giúp cửa sổ được không?', ['opening', 'to open', 'open', 'opened'], 'ing'],
  ['He avoided ___ (answer) my question.', 'Anh ấy tránh trả lời câu hỏi của tôi.', ['answering', 'to answer', 'answer', 'answered'], 'ing'],
  ['She keeps ___ (ask) the same question.', 'Cô ấy cứ hỏi mãi một câu.', ['asking', 'to ask', 'ask', 'asks'], 'ing'],
  ['I gave up ___ (smoke) last year.', 'Năm ngoái tôi bỏ thuốc lá.', ['smoking', 'to smoke', 'smoke', 'smoked'], 'ing'],
  ['She suggested ___ (go) to the cinema.', 'Cô ấy rủ đi xem phim.', ['going', 'to go', 'go', 'went'], 'ing'],

  ['She decided ___ (study) abroad.', 'Cô ấy quyết định đi du học.', ['to study', 'studying', 'study', 'studied'], 'to'],
  ['I\'d like ___ (order) a coffee, please.', 'Cho tôi gọi một cà phê.', ['to order', 'ordering', 'order', 'ordered'], 'to'],
  ['We need ___ (buy) some milk.', 'Chúng ta cần mua ít sữa.', ['to buy', 'buying', 'buy', 'bought'], 'to'],
  ['He promised ___ (call) me tonight.', 'Anh ấy hứa tối nay sẽ gọi cho tôi.', ['to call', 'calling', 'call', 'called'], 'to'],
  ['I hope ___ (see) you soon.', 'Mong sớm gặp lại bạn.', ['to see', 'seeing', 'see', 'saw'], 'to'],
  ['We plan ___ (travel) to Japan next year.', 'Chúng tôi định sang năm đi Nhật.', ['to travel', 'travelling', 'travel', 'travelled'], 'to'],
  ['He refused ___ (pay) the bill.', 'Anh ta không chịu trả tiền.', ['to pay', 'paying', 'pay', 'paid'], 'to'],
  ['They agreed ___ (meet) on Friday.', 'Họ đồng ý gặp nhau vào thứ Sáu.', ['to meet', 'meeting', 'meet', 'met'], 'to'],

  ['I\'m interested in ___ (learn) Korean.', 'Tôi thích học tiếng Hàn.', ['learning', 'to learn', 'learn', 'learned'], 'prep'],
  ['I look forward to ___ (meet) you.', 'Rất mong được gặp bạn.', ['meeting', 'meet', 'to meet', 'met'], 'prep'],
  ['Thank you for ___ (help) me.', 'Cảm ơn bạn đã giúp tôi.', ['helping', 'help', 'to help', 'helped'], 'prep'],
  ['I\'m good at ___ (cook).', 'Tôi nấu ăn giỏi.', ['cooking', 'cook', 'to cook', 'cooked'], 'prep'],
  ['I\'m tired of ___ (work) late every day.', 'Tôi chán phải làm muộn hằng ngày.', ['working', 'work', 'to work', 'worked'], 'prep'],
  ['Turn off the lights before ___ (leave) the room.', 'Tắt đèn trước khi ra khỏi phòng.', ['leaving', 'leave', 'to leave', 'left'], 'prep'],

  ['She wants ___ (become) a doctor.', 'Cô ấy muốn trở thành bác sĩ.', ['to become', 'becoming', 'become', 'became'], 'to'],
  ['I can\'t afford ___ (buy) a new car.', 'Tôi không đủ tiền mua ô tô mới.', ['to buy', 'buying', 'buy', 'bought'], 'to'],
  ['Would you like ___ (come) with us?', 'Bạn có muốn đi cùng chúng tôi không?', ['to come', 'coming', 'come', 'came'], 'to'],

  ['My parents let me ___ (stay) up late on Saturdays.', 'Thứ Bảy bố mẹ cho tôi thức khuya.', ['stay', 'to stay', 'staying', 'stayed'], 'bare'],
  ['The teacher made us ___ (write) an essay.', 'Cô giáo bắt chúng tôi viết một bài luận.', ['write', 'to write', 'writing', 'wrote'], 'bare'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, group]) => ({ id: en, en, vi, options: opts, answer: opts[0], group }))

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
  // Câu từng sai chiếm tối đa nửa lượt; nếu câu mới không đủ thì lấy thêm câu sai còn lại để lượt luôn đủ số câu
  const ws = shuffle(FRAMES.filter((f) => weak.includes(f.id)))
  const half = Math.ceil(ROUND / 2)
  const rest = shuffle(FRAMES.filter((f) => !weak.includes(f.id)))
  return shuffle([...ws.slice(0, half), ...rest, ...ws.slice(half)].slice(0, ROUND)).map((f) => ({ ...f, shuffled: shuffle(f.options) }))
}

export const filled = (f: Frame) => f.en.replace(/___\s*\([^)]*\)/, f.answer)
