// Câu bị động: be (chia theo thì) + V3. Mỗi câu 4 phương án, chỉ một đúng — bỏ những câu mà dạng chủ động
// hoặc be + tính từ cũng thành câu đúng (Rice grows…, The room isn't clean, This car is / was made in Japan).

export type PassiveTense = 'present' | 'past' | 'perfect' | 'future' | 'modal'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  tense: PassiveTense
}

export const FORMS: Record<PassiveTense, { name: string; form: string; ex: string }> = {
  present: { name: 'Hiện tại đơn', form: 'am / is / are + V3', ex: 'English is spoken in many countries.' },
  past: { name: 'Quá khứ đơn', form: 'was / were + V3', ex: 'My bike was stolen last night.' },
  perfect: { name: 'Hiện tại hoàn thành', form: 'has / have been + V3', ex: 'The room hasn\'t been cleaned yet.' },
  future: { name: 'Tương lai', form: 'will be + V3', ex: 'Your order will be sent tomorrow.' },
  modal: { name: 'Sau must / can / have to', form: 'must / can / have to + be + V3', ex: 'Phones must be left outside.' },
}

type Raw = [string, string, [string, string, string, string], PassiveTense]

const RAW: Raw[] = [
  ['English ___ (speak) in many countries.', 'Tiếng Anh được nói ở nhiều nước.', ['is spoken', 'speaks', 'is speak', 'spoke'], 'present'],
  ['The letters ___ (deliver) every morning.', 'Thư được phát mỗi sáng.', ['are delivered', 'deliver', 'are deliver', 'delivered'], 'present'],
  ['Pho ___ (make) with rice noodles and beef.', 'Phở được nấu với bánh phở và thịt bò.', ['is made', 'makes', 'is make', 'made'], 'present'],
  ['The museum ___ (visit) by thousands of people every year.', 'Mỗi năm bảo tàng đón hàng nghìn lượt khách.', ['is visited', 'visits', 'visited', 'is visiting'], 'present'],
  ['Breakfast ___ (serve) from 6 to 10 a.m.', 'Bữa sáng được phục vụ từ 6 đến 10 giờ.', ['is served', 'serves', 'served', 'is serving'], 'present'],
  ['The windows ___ (clean) every week.', 'Cửa sổ được lau mỗi tuần.', ['are cleaned', 'clean', 'cleaned', 'are cleaning'], 'present'],

  ['This house ___ (build) in 1990.', 'Ngôi nhà này được xây năm 1990.', ['was built', 'built', 'was build', 'is building'], 'past'],
  ['My bike ___ (steal) last night.', 'Tối qua xe đạp của tôi bị lấy trộm.', ['was stolen', 'stole', 'was stole', 'is stolen'], 'past'],
  ['This song ___ (write) by a famous singer.', 'Bài hát này do một ca sĩ nổi tiếng sáng tác.', ['was written', 'wrote', 'was wrote', 'is writing'], 'past'],
  ['The meeting ___ (postpone) because of the storm.', 'Cuộc họp bị hoãn vì bão.', ['was postponed', 'postponed', 'was postpone', 'is postponing'], 'past'],
  ['The thief ___ (catch) by the police yesterday.', 'Hôm qua tên trộm bị cảnh sát bắt.', ['was caught', 'caught', 'was catched', 'is caught'], 'past'],
  ['Many trees ___ (plant) in the park last year.', 'Năm ngoái nhiều cây được trồng trong công viên.', ['were planted', 'was planted', 'planted', 'are planted'], 'past'],
  ['I ___ (invite) to the party, but I didn\'t go.', 'Tôi được mời dự tiệc nhưng không đi.', ['was invited', 'invited', 'was invite', 'am invited'], 'past'],

  ['The room ___ (not / clean) yet.', 'Phòng vẫn chưa được dọn.', ['hasn\'t been cleaned', 'hasn\'t cleaned', 'didn\'t clean', 'wasn\'t cleaning'], 'perfect'],
  ['Your package ___ (just / deliver).', 'Gói hàng của bạn vừa được giao.', ['has just been delivered', 'has just delivered', 'just delivers', 'has just been deliver'], 'perfect'],
  ['Ten new schools ___ (build) in the city since 2020.', 'Từ năm 2020 thành phố đã xây thêm mười trường mới.', ['have been built', 'have built', 'has been built', 'are building'], 'perfect'],

  ['Your order ___ (send) tomorrow.', 'Đơn hàng của bạn sẽ được gửi vào ngày mai.', ['will be sent', 'will send', 'will sent', 'sends'], 'future'],
  ['The results ___ (announce) next week.', 'Kết quả sẽ được công bố vào tuần sau.', ['will be announced', 'will announce', 'announced', 'will be announce'], 'future'],

  ['Mobile phones must ___ (leave) outside the exam room.', 'Điện thoại phải để bên ngoài phòng thi.', ['be left', 'leave', 'left', 'be leave'], 'modal'],
  ['The report has to ___ (finish) by Friday.', 'Báo cáo phải được làm xong trước thứ Sáu.', ['be finished', 'finish', 'finished', 'be finishing'], 'modal'],
  ['This medicine can ___ (buy) without a prescription.', 'Thuốc này có thể mua không cần đơn.', ['be bought', 'buy', 'bought', 'be buy'], 'modal'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, tense]) => ({ id: en, en, vi, options: opts, answer: opts[0], tense }))

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
