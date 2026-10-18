// Câu tường thuật: said / told / asked, câu hỏi tường thuật, lời bảo told / asked + to V, lùi thì.
// Mỗi câu chỉ một phương án đúng: không đưa said to V (He said to wait vẫn nói được), to not V hay câu hỏi có / không
// đảo ngữ trần (She asked was I OK) làm phương án sai; không để cùng lúc hai dạng đều đúng (lived / was living,
// lost / had lost). Câu lùi thì luôn có ngữ cảnh cho thấy chuyện đã qua hoặc không còn đúng, vì nếu vẫn đúng thì
// giữ nguyên thì cũng được (She said she lives in Hue).

export type ReportedGroup = 'saytell' | 'question' | 'command' | 'backshift'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: ReportedGroup
  why: string
}

export const GROUPS: Record<ReportedGroup, { name: string; form: string; rule: string; ex: string; ask: string }> = {
  saytell: {
    name: 'said, told hay asked',
    form: 'said (that)… · said to sb · told sb (that)… · asked sb…',
    rule: 'say không cần người nghe: He said (that) he was busy; muốn nhắc người nghe thì thêm to: said to me. Khi kể lại lời nói, tell luôn có người nghe ngay sau, không có to: She told me…, không nói told to me hay said me. Kể lại câu hỏi thì dùng asked. Cụm cố định: tell a story, tell sb the way, tell sb about sth; say goodbye, say sorry.',
    ex: 'He said he was tired, and he told me he wanted to go home.',
    ask: 'Chọn cách dùng say, tell hay ask cho đúng:',
  },
  question: {
    name: 'Câu hỏi tường thuật',
    form: 'asked + từ để hỏi + chủ ngữ + động từ · asked if / whether…',
    rule: 'Kể lại câu hỏi thì câu không còn là câu hỏi: không đảo ngữ, bỏ do / does / did, và thường lùi thì như câu kể (Where do you live? → She asked me where I lived). Câu hỏi có / không hay câu hỏi lựa chọn (… or …?) thì thêm if hoặc whether, không dùng that.',
    ex: 'She asked me where I worked and if I liked my job.',
    ask: 'Chọn cách kể lại câu hỏi cho đúng:',
  },
  command: {
    name: 'Lời bảo, lời nhờ',
    form: 'told / asked + người + to V · not to V',
    rule: 'Kể lại lời bảo, lời dặn, lời nhờ: told / asked + người nghe + to V (He told me to wait). Phủ định thì đặt not trước to: She asked us not to smoke. Không bỏ to (told me wait), không dùng don\'t sau to (to don\'t smoke), không nói said me to hay told to me.',
    ex: 'The doctor told me to rest and not to drink coffee.',
    ask: 'Chọn cách kể lại lời bảo, lời nhờ cho đúng:',
  },
  backshift: {
    name: 'Lùi thì, đổi từ chỉ thời gian',
    form: 'will → would · can → could · is → was · tomorrow → the next day · here → there',
    rule: 'Kể lại lời nói trong quá khứ mà chuyện đó nay đã qua hoặc không còn đúng thì lùi động từ một thì: will → would, can → could, am / is → was, is doing → was doing, have done / did → had done. Từ chỉ thời gian, nơi chốn đổi theo lúc và nơi kể: tomorrow → the next day, yesterday → the day before, this evening → that evening, here → there. Nếu điều được kể bây giờ vẫn đúng thì giữ nguyên thì cũng được.',
    ex: 'On Monday Lan said she would call me the next day.',
    ask: 'Kể lại lời nói trong quá khứ — chọn dạng đúng:',
  },
}

type Raw = [string, string, string[], ReportedGroup, string]

const RAW: Raw[] = [
  ['She ___ me that she was moving to Da Nang.', 'Cô ấy bảo tôi là cô ấy sắp chuyển vào Đà Nẵng.', ['told', 'said', 'spoke', 'talked'], 'saytell', 'Có người nghe (me) ngay sau → told. say không đi thẳng với người nghe: không nói said me.'],
  ['He ___ that he was too busy to come to the party.', 'Anh ấy nói là anh ấy bận quá, không đến dự tiệc được.', ['said', 'told', 'talked', 'spoke'], 'saytell', 'Sau chỗ trống không có người nghe → said that… tell bắt buộc có người nghe: told me that…, không nói told that…'],
  ['The receptionist ___ to me that the hotel was full.', 'Lễ tân nói với tôi rằng khách sạn đã hết phòng.', ['said', 'told', 'talked', 'spoke'], 'saytell', 'Có to trước người nghe → said to me. tell + người nghe thì không cần to (told me, không nói told to me); talk, speak không đi với that…'],
  ['Lan ___ that she would be late for the meeting.', 'Lan báo với tôi là cô ấy sẽ đến họp muộn.', ['told me', 'said me', 'told to me', 'spoke me'], 'saytell', 'tell + người nghe, không có to: told me. say không có người nghe ngay sau (said me sai); muốn nhắc người nghe thì nói said to me.'],
  ['My manager ___ that I could leave early.', 'Quản lý nói là tôi có thể về sớm.', ['said', 'told', 'said me', 'told to me'], 'saytell', 'Không nhắc người nghe → said that… told luôn cần người nghe ngay sau; said me và told to me đều sai.'],
  ['Did she ___ you why she was upset?', 'Cô ấy có nói với bạn vì sao cô ấy buồn không?', ['tell', 'say', 'speak', 'talk'], 'saytell', 'Người nghe (you) đứng ngay sau, rồi đến why… → tell you why… say, speak, talk không đi thẳng với người nghe: không nói say you, speak you.'],
  ['My grandmother ___ us a story about her village.', 'Bà tôi kể cho chúng tôi nghe một câu chuyện về làng của bà.', ['told', 'said', 'spoke', 'talked'], 'saytell', 'Kể chuyện là tell a story: told us a story. say, speak, talk không đi với người nghe + a story.'],
  ['What did the doctor ___ you?', 'Bác sĩ đã nói gì với bạn?', ['tell', 'say', 'speak', 'talk'], 'saytell', 'Người nghe (you) đứng ngay sau → tell: What did the doctor tell you? say không đi thẳng với người nghe; muốn dùng say thì phải có to: What did he say to you?'],
  ['She ___ me if I wanted some tea.', 'Cô ấy hỏi tôi có muốn uống trà không.', ['asked', 'told', 'said', 'spoke'], 'saytell', 'Kể lại một câu hỏi → asked + người + if… told và said không dùng để kể lại câu hỏi.'],
  ['Nam ___ goodbye to everyone and left.', 'Nam chào tạm biệt mọi người rồi đi.', ['said', 'told', 'spoke', 'talked'], 'saytell', 'Cụm cố định say goodbye (to sb), cũng như say sorry, say thank you.'],
  ['Can you ___ me about your trip to Hue?', 'Bạn kể cho tôi nghe về chuyến đi Huế được không?', ['tell', 'say', 'talk', 'speak'], 'saytell', 'tell sb about sth = kể cho ai về chuyện gì. talk, speak phải có to: talk to me about…'],

  ['She asked me where ___.', 'Cô ấy hỏi tôi sống ở đâu.', ['I lived', 'did I live', 'do I live', 'lived I'], 'question', 'Câu hỏi tường thuật giữ trật tự câu kể, bỏ do / did: Where do you live? → where I lived.'],
  ['The receptionist asked us how many nights ___.', 'Lễ tân hỏi chúng tôi sẽ ở mấy đêm.', ['we would stay', 'would we stay', 'will we stay', 'did we stay'], 'question', 'Không đảo would lên trước chủ ngữ; will lùi thành would: How many nights will you stay? → how many nights we would stay.'],
  ['My mum asked me ___ hungry.', 'Mẹ hỏi tôi có đói không.', ['if I was', 'if was I', 'that I was', 'what I was'], 'question', 'Câu hỏi có / không → if (hoặc whether) + chủ ngữ + động từ: Are you hungry? → if I was hungry. Không dùng that.'],
  ['He asked me what time ___.', 'Anh ấy hỏi tôi mấy giờ ngân hàng mở cửa.', ['the bank opened', 'did the bank open', 'does the bank open', 'opened the bank'], 'question', 'Bỏ do / does / did, chủ ngữ đứng trước động từ: What time does the bank open? → what time the bank opened.'],
  ['The customer asked how much ___.', 'Khách hàng hỏi vé giá bao nhiêu.', ['the tickets cost', 'did the tickets cost', 'do the tickets cost', 'cost the tickets'], 'question', 'How much do the tickets cost? → how much the tickets cost: bỏ do, chủ ngữ đứng trước động từ.'],
  ['She asked me ___ help her move house.', 'Cô ấy hỏi tôi có giúp cô ấy chuyển nhà được không.', ['if I could', 'if could I', 'that I could', 'what could I'], 'question', 'Can you help me? → if I could help her: if + chủ ngữ + could, không đảo could lên trước chủ ngữ.'],
  ['My friend asked me where ___ the night before.', 'Bạn tôi hỏi tối hôm trước tôi đã ở đâu.', ['I had been', 'had I been', 'have I been', 'I have been'], 'question', 'Where were you last night? → where I had been the night before: không đảo ngữ, lùi về had been.'],
  ['The interviewer asked me why ___ to leave my old job.', 'Người phỏng vấn hỏi tôi vì sao muốn nghỉ công việc cũ.', ['I wanted', 'did I want', 'do I want', 'wanted I'], 'question', 'Why do you want…? → why I wanted…: bỏ do, chủ ngữ đứng trước động từ, lùi thì.'],
  ['Mai asked me ___ tea or coffee.', 'Mai hỏi tôi thích trà hay cà phê hơn.', ['whether I preferred', 'whether did I prefer', 'that I preferred'], 'question', 'Câu hỏi lựa chọn (… or …?) dùng whether / if + câu kể: Do you prefer tea or coffee? → whether I preferred tea or coffee.'],
  ['The tourist asked me where ___ buy a SIM card.', 'Chị khách du lịch hỏi tôi chị ấy có thể mua thẻ SIM ở đâu.', ['she could', 'could she', 'can she', 'did she can'], 'question', 'Where can I buy…? → where she could buy…: chủ ngữ đứng trước could, không đảo ngữ.'],
  ['At the airport, the officer asked us ___ anything to declare.', 'Ở sân bay, nhân viên hỏi chúng tôi có gì cần khai báo không.', ['if we had', 'if had we', 'that we had', 'if did we have'], 'question', 'Do you have anything to declare? → if we had anything to declare: if + chủ ngữ + động từ, bỏ do.'],
  ['The taxi driver asked us which hotel ___ staying at.', 'Tài xế taxi hỏi chúng tôi đang ở khách sạn nào.', ['we were', 'were we', 'are we', 'did we'], 'question', 'Which hotel are you staying at? → which hotel we were staying at: chủ ngữ đứng trước be, lùi are → were.'],

  ['The guide told us ___ close together in the market.', 'Hướng dẫn viên dặn chúng tôi đi sát nhau trong chợ.', ['to stay', 'stay', 'staying', 'stayed'], 'command', 'told + người + to V: told us to stay. Không bỏ to, không dùng V-ing.'],
  ['My manager ___ the invoices again.', 'Quản lý nhờ tôi kiểm tra lại các hóa đơn.', ['asked me to check', 'asked me check', 'said me to check', 'asked me checking'], 'command', 'Lời nhờ: asked + người + to V. say không đi thẳng với người nghe: không nói said me to.'],
  ['The doctor told me ___ so much coffee.', 'Bác sĩ dặn tôi đừng uống nhiều cà phê như vậy.', ['not to drink', 'to don\'t drink', 'not drink', 'no drink'], 'command', 'Lời dặn phủ định: told + người + not to V. Không dùng don\'t sau to, không bỏ to.'],
  ['The hotel staff asked us ___ in the room.', 'Nhân viên khách sạn yêu cầu chúng tôi không hút thuốc trong phòng.', ['not to smoke', 'to don\'t smoke', 'not smoking', 'no smoking'], 'command', 'Please don\'t smoke → asked us not to smoke: not đứng trước to V.'],
  ['The teacher told the students ___ off their phones.', 'Cô giáo bảo học sinh tắt điện thoại.', ['to turn', 'turn', 'turning', 'turned'], 'command', 'Turn off your phones → told the students to turn off their phones: told + người + to V.'],
  ['Mum always ___ the door when I go out.', 'Mẹ lúc nào cũng dặn tôi khóa cửa khi ra ngoài.', ['tells me to lock', 'tells me lock', 'says me to lock', 'tells to me to lock'], 'command', 'tell + người (không có to) + to V: tells me to lock. say không dùng với người + to V.'],
  ['At the border, an officer ___ my passport.', 'Ở cửa khẩu, một nhân viên yêu cầu tôi xuất trình hộ chiếu.', ['asked me to show', 'asked me show', 'asked me showing', 'said me to show'], 'command', 'Yêu cầu ai làm gì: asked + người + to V → asked me to show.'],
  ['The flight attendant asked everyone ___ their seat belts.', 'Tiếp viên yêu cầu mọi người thắt dây an toàn.', ['to fasten', 'fasten', 'fastening', 'fastened'], 'command', 'Please fasten your seat belts → asked everyone to fasten their seat belts.'],
  ['My parents told me ___ home too late.', 'Bố mẹ dặn tôi đừng về nhà quá muộn.', ['not to come', 'not come', 'to don\'t come', 'not coming'], 'command', 'Don\'t come home too late → told me not to come: not + to V.'],
  ['He told me ___ about the price.', 'Anh ấy bảo tôi đừng lo về giá cả.', ['not to worry', 'not worry', 'to don\'t worry', 'not worrying'], 'command', 'Don\'t worry → told me not to worry. Bỏ don\'t, thay bằng not to.'],
  ['She ___ to wait outside.', 'Cô ấy bảo chúng tôi đợi ở ngoài.', ['told us', 'told', 'said us', 'told to us'], 'command', 'tell bắt buộc có người nghe ngay sau, không có to: told us to wait.'],
  ['My boss ___ finish the report before Friday.', 'Sếp bảo tôi làm xong báo cáo trước thứ Sáu.', ['told me to', 'said me to', 'told me', 'told to me'], 'command', 'told + người + to V: told me to finish. Không bỏ to, không nói said me to.'],

  ['Last month Minh said he ___ call me the next day, but he never did.', 'Tháng trước Minh nói hôm sau sẽ gọi cho tôi, nhưng rồi chẳng thấy gọi.', ['would', 'will', 'can', 'is going to'], 'backshift', '"I\'ll call you tomorrow" — ngày đó đã qua → will lùi thành would.'],
  ['When I met Lan in 2019, she said she ___ speak only a little English. Now she is fluent.', 'Hồi gặp Lan năm 2019, cô ấy nói cô ấy chỉ nói được chút ít tiếng Anh. Giờ thì cô ấy nói rất trôi chảy.', ['could', 'can', 'will', 'may'], 'backshift', '"I can speak only a little English" — nay không còn đúng → can lùi thành could.'],
  ['Last year Khoa said he ___ in Hanoi, but now he lives in Da Nang.', 'Năm ngoái Khoa nói anh ấy sống ở Hà Nội, nhưng giờ anh ấy sống ở Đà Nẵng.', ['lived', 'lives', 'is living', 'has lived'], 'backshift', '"I live in Hanoi" — nay không còn đúng → lùi thì: live → lived.'],
  ['Last Friday my boss said the new manager would arrive ___, so we met her on Saturday.', 'Thứ Sáu tuần trước sếp nói hôm sau quản lý mới sẽ đến, nên thứ Bảy chúng tôi đã gặp chị ấy.', ['the next day', 'tomorrow', 'the day before', 'yesterday'], 'backshift', 'Kể lại về sau: tomorrow → the next day (hôm sau, tính từ lúc nói). tomorrow bây giờ đã là một ngày khác.'],
  ['Back in Hanoi, I told my friends that our guide in Hoi An had lived ___ all her life.', 'Về đến Hà Nội, tôi kể với bạn bè rằng chị hướng dẫn viên ở Hội An đã sống ở đó cả đời.', ['there', 'here', 'at there', 'in here'], 'backshift', '"I\'ve lived here all my life" — người kể đã về Hà Nội, không còn ở Hội An nên here → there. Không nói at there; here hay in here (trong này) đều chỉ nơi người kể đang ở.'],
  ['Yesterday Nam told the police he ___ his passport, but an hour later he found it in his bag.', 'Hôm qua Nam trình báo với cảnh sát là anh ấy bị mất hộ chiếu, nhưng một tiếng sau lại tìm thấy ngay trong túi.', ['had lost', 'has lost', 'have lost', 'is losing'], 'backshift', '"I have lost my passport" — việc mất xảy ra trước lúc nói và nay đã tìm thấy → have lost lùi thành had lost.'],
  ['Last Monday Linh said she was too tired to cook ___.', 'Thứ Hai tuần trước Linh nói tối hôm đó cô ấy mệt quá, không nấu nổi.', ['that evening', 'this evening', 'tomorrow evening', 'last evening'], 'backshift', '"this evening" (tối nay) khi kể lại về sau → that evening (tối hôm đó).'],
  ['Last month, when I called Hoa, she said she had arrived in Seoul ___.', 'Tháng trước, khi tôi gọi cho Hoa, cô ấy nói cô ấy đã đến Seoul từ hôm trước.', ['the day before', 'yesterday', 'the next day', 'tomorrow'], 'backshift', '"yesterday" (hôm qua) khi kể lại về sau → the day before (hôm trước đó).'],
  ['Last summer my brother said he ___ going to study in Australia, but then he changed his mind.', 'Hè năm ngoái anh trai tôi nói sẽ đi du học Úc, nhưng sau đó anh ấy đổi ý.', ['was', 'is', 'will', 'has'], 'backshift', '"I\'m going to study in Australia" — dự định đã đổi → am going to lùi thành was going to.'],
  ['When I called Duc last night, he said he ___ dinner, so I called back later.', 'Tối qua tôi gọi cho Đức, anh ấy nói đang ăn tối nên lát sau tôi gọi lại.', ['was having', 'is having', 'has had', 'has'], 'backshift', '"I\'m having dinner" — việc đang làm lúc đó (tối qua) → is having lùi thành was having.'],
  ['Last month my sister said she ___ a new laptop, so we bought her one for her birthday.', 'Tháng trước em gái tôi nói em ấy cần một chiếc laptop mới, nên chúng tôi đã mua tặng em ấy nhân dịp sinh nhật.', ['needed', 'needs', 'is needing', 'has needed'], 'backshift', '"I need a new laptop" — nay đã được mua tặng, không còn cần nữa → need lùi thành needed.'],
  ['When I first met Thu, she said she ___ a student, but now she\'s a doctor.', 'Lần đầu tôi gặp Thu, cô ấy nói cô ấy là sinh viên, giờ thì cô ấy đã là bác sĩ.', ['was', 'is', 'has been', 'be'], 'backshift', '"I\'m a student" — nay không còn đúng → am lùi thành was.'],
  ['Last week Ngoc said she ___ come to the party, so we celebrated without her.', 'Tuần trước Ngọc nói cô ấy không đến dự tiệc được, nên chúng tôi liên hoan mà không có cô ấy.', ['couldn\'t', 'can\'t', 'doesn\'t', 'won\'t'], 'backshift', '"I can\'t come to the party" — bữa tiệc đã qua → can\'t lùi thành couldn\'t.'],
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

// Câu đã điền (bỏ luôn gợi ý trong ngoặc nếu có)
export const filled = (f: Frame) => f.en.replace(/___(\s*\([^)]*\))?/, f.answer)
