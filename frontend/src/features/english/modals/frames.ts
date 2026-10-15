// Động từ khuyết thiếu: dạng động từ sau modal, phải / không được / không cần, nên / có thể, suy đoán.
// Mỗi câu chỉ một phương án đúng: không đưa must và have to vào cùng một câu (thường dùng thay nhau), không đưa
// can't làm phương án sai cho "không nên" (You can't… cũng hiểu là cấm), không đưa mustn't vào câu đoán phủ định
// (người Mỹ vẫn nói must not để đoán) — mức chắc chắn luôn do câu tiếng Việt quyết định.

export type ModalGroup = 'form' | 'must' | 'advice' | 'deduce'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: ModalGroup
  // Giải thích riêng cho câu
  why: string
}

export const GROUPS: Record<ModalGroup, { name: string; form: string; tip: string; rule: string; ex: string }> = {
  form: {
    name: 'Sau modal là nguyên mẫu',
    form: 'can / could / should / must / might + V',
    tip: 'Sau modal: động từ nguyên mẫu — không to, không -s, không -ing, không chia quá khứ.',
    rule: 'Sau can, could, should, must, might, would động từ luôn ở dạng nguyên mẫu: không có to, không thêm -s, -ing hay đuôi quá khứ. She can drive — không nói can drives, can to drive hay can driving. could là quá khứ của can nhưng động từ sau nó vẫn nguyên mẫu: could run.',
    ex: 'She can speak three languages.',
  },
  must: {
    name: 'Phải, không được hay không cần',
    form: 'must / have to · mustn\'t · don\'t have to',
    tip: 'phải → must / have to (quá khứ: had to) · không được → mustn\'t · không cần → don\'t have to.',
    rule: 'must và have to đều là "phải"; quá khứ là had to. mustn\'t = không được, cấm làm. don\'t have to = không cần, không bắt buộc: làm cũng được, không làm cũng được. Đừng dịch "không cần" thành mustn\'t. Không có don\'t must hay must to; chủ ngữ ngôi thứ ba thì dùng has to / doesn\'t have to.',
    ex: 'You don\'t have to pay, but you mustn\'t be late.',
  },
  advice: {
    name: 'Nên hay có thể',
    form: 'should / shouldn\'t · can / can\'t',
    tip: 'nên / không nên → should / shouldn\'t · biết, làm được, được phép → can / can\'t.',
    rule: 'should / shouldn\'t = nên / không nên, dùng để khuyên. can / can\'t = biết, làm được (khả năng) hoặc được phép (Can I sit here?). Phủ định là shouldn\'t, can\'t — không nói don\'t should, don\'t can; can không bao giờ thêm -s.',
    ex: 'She can cook really well, so you should try her pho.',
  },
  deduce: {
    name: 'Suy đoán',
    form: 'must / might / can\'t + V · + have V3',
    tip: 'chắc chắn là → must · có thể → might · không thể nào → can\'t; chuyện đã xảy ra thì thêm have + V3.',
    rule: 'Đoán điều đang đúng: chắc chắn là → must be, có thể / có lẽ → might be, không thể nào → can\'t be. Đoán chuyện đã xảy ra: must / might / can\'t + have + V3 (must have rained, can\'t have seen). Suy đoán phủ định dùng can\'t; mustn\'t có nghĩa là "không được".',
    ex: 'That can\'t be Nam — he\'s in Da Nang this week.',
  },
}

type Raw = [string, string, string[], ModalGroup, string]

const RAW: Raw[] = [
  ['My sister can ___ (drive) a car, but she can\'t ride a motorbike.', 'Chị tôi biết lái ô tô nhưng không biết đi xe máy.', ['drive', 'drives', 'to drive', 'driving'], 'form', 'Sau can là động từ nguyên mẫu: không thêm -s dù chủ ngữ là she, không có to, không thêm -ing.'],
  ['You should ___ (see) a doctor about that cough.', 'Bạn nên đi khám bác sĩ vì cơn ho đó.', ['see', 'to see', 'seeing', 'saw'], 'form', 'should + động từ nguyên mẫu: should see, không nói should to see.'],
  ['I must ___ (finish) this report before 5 p.m.', 'Tôi phải làm xong báo cáo này trước 5 giờ chiều.', ['finish', 'to finish', 'finishing', 'finished'], 'form', 'must + động từ nguyên mẫu, không có to: must finish.'],
  ['He can\'t ___ (come) to the meeting tomorrow.', 'Mai anh ấy không đến họp được.', ['come', 'to come', 'comes', 'coming'], 'form', 'Câu phủ định cũng vậy: can\'t + nguyên mẫu, không chia theo he.'],
  ['Can your son ___ (swim) yet?', 'Con trai chị đã biết bơi chưa?', ['swim', 'swims', 'to swim', 'swimming'], 'form', 'Câu hỏi: Can + chủ ngữ + nguyên mẫu. Động từ chính không thêm -s, không có to.'],
  ['We might ___ (be) a bit late because of the traffic.', 'Có thể chúng tôi sẽ đến hơi muộn vì tắc đường.', ['be', 'are', 'to be', 'being'], 'form', 'Sau might, be giữ nguyên mẫu: might be, không nói might are.'],
  ['Visitors must not ___ (take) photos inside the temple.', 'Khách tham quan không được chụp ảnh trong chùa.', ['take', 'to take', 'taking', 'took'], 'form', 'must not + nguyên mẫu: must not take.'],
  ['When I was young, I could ___ (run) 5 km without stopping.', 'Hồi còn trẻ, tôi có thể chạy 5 km không nghỉ.', ['run', 'ran', 'running', 'to run'], 'form', 'could đã là quá khứ của can, nên động từ sau nó vẫn nguyên mẫu: could run, không phải could ran.'],
  ['Would you ___ (like) some more rice?', 'Bạn có muốn ăn thêm cơm không?', ['like', 'likes', 'to like', 'liking'], 'form', 'Would you like…? là lời mời lịch sự; sau would vẫn là nguyên mẫu.'],
  ['You shouldn\'t ___ (drink) coffee so late in the evening.', 'Bạn không nên uống cà phê muộn thế vào buổi tối.', ['drink', 'to drink', 'drinking', 'drank'], 'form', 'shouldn\'t + nguyên mẫu: shouldn\'t drink.'],
  ['My father can ___ (speak) a little French.', 'Bố tôi nói được một chút tiếng Pháp.', ['speak', 'speaks', 'speaking', 'spoke'], 'form', 'can + nguyên mẫu, không thêm -s theo my father: can speak.'],
  ['Could you ___ (help) me carry this suitcase?', 'Bạn giúp tôi xách cái va li này được không?', ['help', 'to help', 'helping', 'helped'], 'form', 'Could you + nguyên mẫu…? là cách nhờ lịch sự: could you help.'],

  ['You ___ smoke inside the hospital.', 'Bạn không được hút thuốc trong bệnh viện.', ['mustn\'t', 'don\'t have to', 'don\'t must'], 'must', 'không được (cấm) → mustn\'t. don\'t have to là "không cần"; don\'t must thì sai ngữ pháp.'],
  ['Tomorrow is Sunday, so I ___ get up early.', 'Mai là Chủ nhật nên tôi không cần dậy sớm.', ['don\'t have to', 'mustn\'t', 'don\'t must'], 'must', 'không cần (không bắt buộc) → don\'t have to. mustn\'t là "không được", tức là bị cấm dậy sớm.'],
  ['All passengers ___ wear a seatbelt during take-off.', 'Mọi hành khách phải thắt dây an toàn khi máy bay cất cánh.', ['must', 'mustn\'t', 'don\'t have to', 'must to'], 'must', 'phải (quy định bắt buộc) → must + nguyên mẫu, không có to.'],
  ['Entry to the museum is free, so you ___ buy a ticket.', 'Vào bảo tàng miễn phí nên bạn không cần mua vé.', ['don\'t have to', 'mustn\'t', 'have to'], 'must', 'Miễn phí nên không cần mua vé → don\'t have to. mustn\'t sẽ thành "cấm mua vé".'],
  ['This is a secret. You ___ tell anyone.', 'Đây là bí mật. Bạn không được kể với ai.', ['mustn\'t', 'don\'t have to', 'mustn\'t to'], 'must', 'không được → mustn\'t + nguyên mẫu, không có to.'],
  ['She ___ work on Saturdays because her office is closed.', 'Thứ Bảy cô ấy không cần đi làm vì văn phòng đóng cửa.', ['doesn\'t have to', 'mustn\'t', 'don\'t have to'], 'must', 'không cần → don\'t have to; chủ ngữ she nên dùng doesn\'t have to.'],
  ['In Vietnam, you ___ drive on the right.', 'Ở Việt Nam, bạn phải lái xe bên phải.', ['have to', 'don\'t have to', 'mustn\'t'], 'must', 'phải (luật giao thông) → have to.'],
  ['Last week I ___ work late every evening.', 'Tuần trước tối nào tôi cũng phải làm việc muộn.', ['had to', 'must', 'didn\'t have to'], 'must', '"Phải" trong quá khứ → had to. must không có dạng quá khứ.'],
  ['We ___ take a taxi from the airport — my brother picked us up.', 'Chúng tôi không cần đi taxi từ sân bay — anh trai tôi đã ra đón.', ['didn\'t have to', 'mustn\'t', 'didn\'t must'], 'must', '"Không cần" trong quá khứ → didn\'t have to. Không có didn\'t must.'],
  ['Visitors ___ feed the animals at the zoo.', 'Khách tham quan không được cho thú ăn ở sở thú.', ['mustn\'t', 'don\'t have to', 'must'], 'must', 'không được (cấm) → mustn\'t.'],
  ['You ___ bring food — lunch is included in the tour.', 'Bạn không cần mang đồ ăn — tour đã bao bữa trưa.', ['don\'t have to', 'mustn\'t', 'have to'], 'must', 'Tour đã lo bữa trưa nên không cần mang → don\'t have to.'],
  ['My son ___ wear a uniform to school every day.', 'Con trai tôi ngày nào cũng phải mặc đồng phục đi học.', ['has to', 'have to', 'doesn\'t have to'], 'must', 'phải → have to; chủ ngữ my son là ngôi thứ ba số ít nên dùng has to.'],
  ['You ___ park here — it\'s a fire exit.', 'Bạn không được đỗ xe ở đây — đây là lối thoát hiểm.', ['mustn\'t', 'don\'t have to', 'must'], 'must', 'không được (cấm) → mustn\'t.'],

  ['You look tired. You ___ go to bed early tonight.', 'Trông bạn mệt lắm. Tối nay bạn nên đi ngủ sớm.', ['should', 'can', 'should to'], 'advice', 'nên (lời khuyên) → should + nguyên mẫu. can là "có thể, được phép", không phải lời khuyên.'],
  ['You ___ eat so much sugar — it\'s bad for your teeth.', 'Bạn không nên ăn nhiều đường thế — hại răng lắm.', ['shouldn\'t', 'can', 'don\'t should'], 'advice', 'không nên → shouldn\'t. Không nói don\'t should.'],
  ['My grandmother is 80, but she ___ still use a smartphone.', 'Bà tôi 80 tuổi rồi mà vẫn biết dùng điện thoại thông minh.', ['can', 'should', 'cans'], 'advice', 'biết (làm được) → can. can không bao giờ thêm -s: she can.'],
  ['Excuse me, ___ I sit here?', 'Xin lỗi, tôi có thể ngồi đây không?', ['can', 'should', 'must'], 'advice', 'Xin phép → Can I…? Should I…? là hỏi lời khuyên, Must I…? là hỏi có bắt buộc không.'],
  ['Sorry, I ___ come to your party on Saturday — I have to work.', 'Xin lỗi, thứ Bảy tôi không đến dự tiệc của bạn được — tôi phải đi làm.', ['can\'t', 'shouldn\'t', 'don\'t can'], 'advice', 'không … được (không thể) → can\'t. Không nói don\'t can.'],
  ['My son is only five, but he ___ read and write.', 'Con trai tôi mới năm tuổi mà đã biết đọc, biết viết.', ['can', 'should', 'can to'], 'advice', 'biết đọc, biết viết (khả năng) → can + nguyên mẫu, không có to.'],
  ['You ___ visit Hoi An in the evening — the lanterns are beautiful.', 'Bạn nên đến Hội An vào buổi tối — đèn lồng đẹp lắm.', ['should', 'shouldn\'t', 'should to'], 'advice', 'nên → should + nguyên mẫu: should visit.'],
  ['I ___ swim, so I always wear a life jacket on boats.', 'Tôi không biết bơi nên đi thuyền lúc nào cũng mặc áo phao.', ['can\'t', 'shouldn\'t', 'don\'t can'], 'advice', 'không biết (làm) → can\'t.'],
  ['This bag is too heavy. I ___ carry it.', 'Cái túi này nặng quá. Tôi không xách nổi.', ['can\'t', 'shouldn\'t', 'should'], 'advice', 'không nổi, không làm được → can\'t (khả năng), không phải lời khuyên.'],
  ['You\'ve got a fever. You ___ go to work today.', 'Bạn đang sốt. Hôm nay bạn không nên đi làm.', ['shouldn\'t', 'should', 'don\'t should'], 'advice', 'không nên → shouldn\'t. Không nói don\'t should.'],
  ['Hotel guests ___ use the swimming pool for free.', 'Khách ở khách sạn có thể dùng bể bơi miễn phí.', ['can', 'should', 'can to'], 'advice', 'có thể (được phép) → can + nguyên mẫu.'],
  ['What time ___ I leave for the airport?', 'Mấy giờ thì tôi nên ra sân bay?', ['should', 'can', 'should to'], 'advice', 'Hỏi lời khuyên "tôi nên…?" → Should I…?'],

  ['Minh has been working for 12 hours. He ___ be exhausted.', 'Minh đã làm việc 12 tiếng liền. Chắc chắn là anh ấy kiệt sức rồi.', ['must', 'can\'t', 'mustn\'t'], 'deduce', 'chắc chắn là → must be. mustn\'t là "không được", không dùng để đoán.'],
  ['That ___ be Lan\'s car — she sold it last month.', 'Đó không thể nào là xe của Lan — tháng trước cô ấy bán rồi.', ['can\'t', 'must', 'might'], 'deduce', 'không thể nào → can\'t be. Suy đoán phủ định dùng can\'t, không dùng mustn\'t.'],
  ['I\'m not sure where Nam is. He ___ be at the gym.', 'Tôi không chắc Nam ở đâu. Có thể anh ấy đang ở phòng tập.', ['might', 'must', 'can\'t'], 'deduce', 'có thể, không chắc → might be.'],
  ['You\'ve just had a 14-hour flight from London. You ___ be tired.', 'Bạn vừa bay 14 tiếng từ London về. Chắc chắn là bạn mệt lắm.', ['must', 'might', 'mustn\'t'], 'deduce', 'chắc chắn là → must be.'],
  ['Hung ___ be at the office — I just saw him at the airport.', 'Hùng không thể nào đang ở văn phòng — tôi vừa thấy anh ấy ở sân bay.', ['can\'t', 'must', 'might'], 'deduce', 'không thể nào → can\'t be.'],
  ['The streets are all wet. It ___ (rain) during the night.', 'Đường phố ướt hết. Chắc chắn là đêm qua trời đã mưa.', ['must have rained', 'must rained', 'must have rain', 'can\'t have rained'], 'deduce', 'Đoán chắc chắn về chuyện đã xảy ra → must have + V3: must have rained.'],
  ['I can\'t find my keys. I ___ (leave) them at the office.', 'Tôi không tìm thấy chìa khoá. Có thể tôi đã để quên ở văn phòng.', ['might have left', 'might left', 'can\'t have left'], 'deduce', 'có thể, chuyện đã xảy ra → might have + V3: might have left.'],
  ['She ___ (see) us — she walked past without saying hello.', 'Không thể nào cô ấy đã nhìn thấy chúng tôi — cô ấy đi ngang qua mà chẳng chào gì cả.', ['can\'t have seen', 'must have seen', 'can\'t have saw'], 'deduce', 'không thể nào, chuyện đã xảy ra → can\'t have + V3 (seen, không phải saw).'],
  ['This ___ be the right address — there\'s no number 45 on this street.', 'Đây không thể nào là đúng địa chỉ — phố này làm gì có nhà số 45.', ['can\'t', 'must', 'might'], 'deduce', 'không thể nào → can\'t be.'],
  ['Phuong got the top score in the exam. She ___ (study) very hard.', 'Phương đạt điểm cao nhất kỳ thi. Chắc chắn là cô ấy đã học rất chăm.', ['must have studied', 'must studied', 'can\'t have studied'], 'deduce', 'chắc chắn, chuyện đã xảy ra → must have + V3: must have studied.'],
  ['The lights are off and nobody is answering the door. They ___ (go) out.', 'Đèn tắt hết, gõ cửa không ai trả lời. Chắc chắn là họ đã ra ngoài rồi.', ['must have gone', 'must have went', 'can\'t have gone'], 'deduce', 'must have + V3; go → went → gone, nên là must have gone.'],
  ['You ___ be serious! 500,000 dong for a coffee?', 'Bạn không thể nào nói thật được! 500.000 đồng một ly cà phê á?', ['can\'t', 'must', 'might'], 'deduce', 'không thể nào → can\'t be: You can\'t be serious!'],
  ['I don\'t know why Mai didn\'t come. She ___ (forget) about the meeting.', 'Tôi không biết sao Mai không đến. Có thể cô ấy đã quên cuộc họp.', ['might have forgotten', 'might forgot', 'can\'t have forgotten'], 'deduce', 'có thể, chuyện đã xảy ra → might have + V3: might have forgotten.'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, group, why]) => ({ id: en, en, vi, options: opts, answer: opts[0], group, why }))

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

// Câu đã điền: thay chỗ trống (và gợi ý trong ngoặc nếu có) bằng đáp án
export const filled = (f: Frame) => f.en.replace(/___(\s*\([^)]*\))?/, f.answer)
