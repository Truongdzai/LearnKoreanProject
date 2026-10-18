// Số nhiều & lượng từ: đếm được hay không, much / many, a few / a little / few / little, some / any / no / none.
// Mỗi câu chỉ một phương án đúng: không đưa any làm phương án sai trong lời mời, lời nhờ (Would you like…?),
// không đưa some làm phương án sai trong câu hỏi (Did you buy some…? vẫn đúng), không đưa much / many vào câu
// khẳng định thường (ở đó người ta nói a lot of); few / little thì câu tiếng Việt nói rõ "vài" hay "hầu như không".
// Không đưa little trơn trước danh từ số nhiều vì little friends (bạn nhỏ) vẫn là cụm đúng.

export type QuantityGroup = 'count' | 'muchmany' | 'few' | 'someany'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: QuantityGroup
  why: string
}

export const GROUPS: Record<QuantityGroup, { name: string; form: string; rule: string; brief: string; ex: string }> = {
  count: {
    name: 'Đếm được hay không đếm được',
    form: 'two children · some information · a piece of advice',
    rule: 'Danh từ không đếm được (information, advice, furniture, luggage, money, news, weather) KHÔNG thêm s, không đi với a / an và đi với động từ số ít: the luggage is. Muốn đếm thì dùng a piece of: a piece of advice. Số nhiều bất quy tắc phải học thuộc: child → children, person → people, man → men, foot → feet, tooth → teeth.',
    brief: 'Không đếm được thì không thêm s, không đi với a / an; số nhiều bất quy tắc không thêm s.',
    ex: 'They have two children and a lot of luggage.',
  },
  muchmany: {
    name: 'much hay many',
    form: 'how many eggs · how much money · not much time',
    rule: 'many + đếm được số nhiều (many friends, how many eggs); much + không đếm được (much time, how much money). much / many dùng nhiều nhất trong câu hỏi, câu phủ định và sau too (too much traffic). Câu khẳng định thường nói a lot of cho cả hai loại: There\'s a lot of rain, I have a lot of friends.',
    brief: 'many + đếm được số nhiều; much + không đếm được; câu khẳng định thường dùng a lot of.',
    ex: 'How many eggs do we need, and how much milk?',
  },
  few: {
    name: 'a few, a little, few, little',
    form: 'a few friends · a little milk · very few · very little',
    rule: 'a few + đếm được số nhiều, a little + không đếm được. Có a là nghĩa tích cực "vài, một ít" (vẫn đủ): a few friends, a little money. Bỏ a là nghĩa tiêu cực "rất ít, hầu như không": few friends, little money. very đi với few / little, không nói very a few.',
    brief: 'Có a = vài, một ít (vẫn đủ); không có a = rất ít, hầu như không. a few + số nhiều, a little + không đếm được.',
    ex: 'I speak a little Japanese and have a few Japanese friends.',
  },
  someany: {
    name: 'some, any, no, none',
    form: 'some eggs · not any milk · no buses · none left',
    rule: 'some trong câu khẳng định và khi mời, nhờ (Would you like some tea? Could you give me some napkins?); any trong câu phủ định và câu hỏi thường (I don\'t have any money, Did you get any sleep?). no = not any, đi với động từ khẳng định: There are no buses. none đứng một mình, không có danh từ ngay sau (hoặc none of the …): There were none left. Không phủ định hai lần (don\'t have no).',
    brief: 'some: khẳng định, mời, nhờ; any: phủ định, câu hỏi; no + danh từ, none đứng một mình.',
    ex: 'There isn\'t any milk, but there are some eggs.',
  },
}

type Raw = [string, string, string[], QuantityGroup, string]

const RAW: Raw[] = [
  ['Can you give me ___ about hotels in Hoi An?', 'Bạn cho tôi ít thông tin về khách sạn ở Hội An được không?', ['some information', 'some informations', 'an information'], 'count', 'information không đếm được: không thêm s, không đi với an. Muốn đếm: a piece of information.'],
  ['Let me give you ___: always carry some cash in the countryside.', 'Để tôi cho bạn một lời khuyên: về vùng quê thì luôn mang theo ít tiền mặt.', ['a piece of advice', 'an advice', 'a piece of advices'], 'count', 'advice không đếm được nên không có an advice. "Một lời khuyên" = a piece of advice.'],
  ['My teacher gave me some useful ___ about the IELTS exam.', 'Cô giáo cho tôi vài lời khuyên hữu ích về kỳ thi IELTS.', ['advice', 'advices', 'advise'], 'count', 'advice (lời khuyên) không đếm được nên không thêm s; advise là động từ "khuyên".'],
  ['We bought ___ for our new apartment.', 'Chúng tôi mua ít đồ nội thất cho căn hộ mới.', ['some furniture', 'some furnitures', 'a furniture'], 'count', 'furniture không đếm được: không thêm s, không đi với a. Một món đồ = a piece of furniture.'],
  ['Our ___ still at the airport.', 'Hành lý của chúng tôi vẫn còn ở sân bay.', ['luggage is', 'luggages are', 'luggage are'], 'count', 'luggage không đếm được: không thêm s và động từ chia số ít → luggage is.'],
  ['Can I borrow ___? I left my wallet at home.', 'Cho tôi mượn ít tiền được không? Tôi để quên ví ở nhà rồi.', ['some money', 'a money', 'some moneys'], 'count', 'money không đếm được: không thêm s, không đi với a → some money.'],
  ['They have two ___, a boy and a girl.', 'Họ có hai con, một trai một gái.', ['children', 'childs', 'childrens'], 'count', 'child → children (bất quy tắc). children đã là số nhiều, không thêm s nữa.'],
  ['There were a lot of ___ at the night market.', 'Chợ đêm rất đông người.', ['people', 'peoples', 'person'], 'count', 'person → people. people đã là số nhiều nên không thêm s (peoples là "các dân tộc", nghĩa khác hẳn).'],
  ['My ___ hurt after walking around Hanoi all day.', 'Đi bộ quanh Hà Nội cả ngày, hai bàn chân tôi đau nhức.', ['feet', 'foots', 'feets'], 'count', 'foot → feet: đổi nguyên âm, không thêm s.'],
  ['Brush your ___ before you go to bed.', 'Đánh răng trước khi đi ngủ nhé.', ['teeth', 'tooths', 'teeths'], 'count', 'tooth → teeth: đổi nguyên âm, không thêm s.'],
  ['There are three ___ and two women on my team.', 'Nhóm tôi có ba nam và hai nữ.', ['men', 'mans', 'mens'], 'count', 'man → men, woman → women: đổi nguyên âm, không thêm s.'],
  ['We had ___ in Phu Quoc. It was sunny every day.', 'Ở Phú Quốc chúng tôi gặp thời tiết rất đẹp, ngày nào cũng nắng.', ['great weather', 'a great weather', 'great weathers'], 'count', 'weather không đếm được: không đi với a, không thêm s.'],
  ['I have ___ for you: I got the job!', 'Mình có tin vui cho bạn đây: mình được nhận việc rồi!', ['some good news', 'a good news', 'some good new'], 'count', 'news không đếm được (chữ s là một phần của từ): không đi với a. Một tin = a piece of news.'],

  ['How ___ work at your company?', 'Công ty bạn có bao nhiêu người làm việc?', ['many people', 'much people', 'many peoples'], 'muchmany', 'people là danh từ đếm được số nhiều (không thêm s) → how many people.'],
  ['How ___ did you spend in Da Lat?', 'Bạn đã tiêu bao nhiêu tiền ở Đà Lạt?', ['much money', 'many money', 'many moneys'], 'muchmany', 'money không đếm được → how much money.'],
  ['How ___ do you drink a day?', 'Mỗi ngày bạn uống bao nhiêu nước?', ['much water', 'many water', 'much waters'], 'muchmany', 'water không đếm được → how much water, không thêm s.'],
  ['How ___ are you taking on the trip?', 'Chuyến này bạn mang mấy cái vali?', ['many suitcases', 'much suitcases', 'many suitcase'], 'muchmany', 'suitcase đếm được → how many suitcases (nhớ thêm s).'],
  ['How ___ do we need for the cake?', 'Làm bánh cần bao nhiêu quả trứng?', ['many eggs', 'much eggs', 'many egg'], 'muchmany', 'egg đếm được → how many eggs (nhớ thêm s).'],
  ['I don\'t have ___ time this week, so let\'s meet next week.', 'Tuần này tôi không có nhiều thời gian, nên tuần sau mình gặp nhé.', ['much', 'many', 'a few'], 'muchmany', 'time (thời gian) không đếm được → not much time.'],
  ['There aren\'t ___ tourists in Hoi An in the rainy season.', 'Mùa mưa Hội An không có nhiều khách du lịch.', ['many', 'much', 'a little'], 'muchmany', 'tourists đếm được số nhiều → not many tourists.'],
  ['She doesn\'t drink ___ coffee, just one cup in the morning.', 'Cô ấy không uống nhiều cà phê, chỉ một cốc buổi sáng.', ['much', 'many', 'a few'], 'muchmany', 'coffee (cà phê nói chung) không đếm được → not much coffee.'],
  ['Did you take ___ photos in Hue?', 'Bạn có chụp được nhiều ảnh ở Huế không?', ['many', 'much', 'a little'], 'muchmany', 'photos đếm được số nhiều → many photos.'],
  ['The travel agent didn\'t give us ___ information.', 'Công ty du lịch không cho chúng tôi nhiều thông tin.', ['much', 'many', 'a few'], 'muchmany', 'information không đếm được → not much information.'],
  ['There\'s too ___ traffic in Ho Chi Minh City.', 'Ở TP. Hồ Chí Minh xe cộ quá đông.', ['much', 'many', 'a lot of'], 'muchmany', 'traffic không đếm được → too much traffic. Sau too không dùng a lot of.'],
  ['There are too ___ motorbikes on the road at rush hour.', 'Giờ cao điểm có quá nhiều xe máy trên đường.', ['many', 'much', 'a lot of'], 'muchmany', 'motorbikes đếm được số nhiều → too many motorbikes. Sau too không dùng a lot of.'],
  ['There\'s ___ rain in Hue in October.', 'Tháng Mười ở Huế mưa rất nhiều.', ['a lot of', 'a lot', 'many'], 'muchmany', 'Câu khẳng định thường dùng a lot of; đứng trước danh từ thì a lot phải có of. rain không đếm được nên không dùng many.'],

  ['I can speak ___ Japanese, enough to order food.', 'Tôi nói được một chút tiếng Nhật, đủ để gọi món.', ['a little', 'little', 'a few', 'few'], 'few', 'Japanese (tiếng Nhật) không đếm được → a little. "Đủ để gọi món" là nghĩa tích cực nên phải có a.'],
  ['There\'s ___ milk left, enough for one more coffee.', 'Vẫn còn một ít sữa, đủ pha thêm một cốc cà phê.', ['a little', 'little', 'a few', 'few'], 'few', 'milk không đếm được → a little. "Vẫn còn, đủ pha thêm" là nghĩa tích cực nên phải có a.'],
  ['Add ___ salt and fish sauce to the soup.', 'Cho thêm một chút muối và nước mắm vào nồi canh.', ['a little', 'a few', 'many'], 'few', 'salt không đếm được → a little salt (một chút muối).'],
  ['I\'ve made ___ friends at my new office, so I don\'t feel lonely now.', 'Tôi đã quen được vài người bạn ở văn phòng mới nên giờ không thấy cô đơn nữa.', ['a few', 'few', 'a little'], 'few', 'friends đếm được số nhiều → a few. "Vài người bạn, không cô đơn" là nghĩa tích cực nên phải có a.'],
  ['Could I have ___ more minutes to finish the test?', 'Cho em thêm vài phút để làm xong bài được không ạ?', ['a few', 'a little', 'few', 'little'], 'few', 'minutes đếm được số nhiều → a few more minutes (thêm vài phút).'],
  ['I have ___ questions about the contract. Do you have a minute?', 'Tôi có vài câu hỏi về hợp đồng. Anh có rảnh một chút không?', ['a few', 'few', 'a little'], 'few', 'questions đếm được số nhiều → a few (vài câu hỏi). few không có a lại thành "hầu như không có câu hỏi nào".'],
  ['The film was so boring that ___ people stayed until the end.', 'Phim chán đến mức hầu như chẳng ai ở lại xem đến hết.', ['few', 'a few', 'a little'], 'few', 'people số nhiều; "hầu như chẳng ai" là nghĩa tiêu cực → few, không có a.'],
  ['Very ___ tourists visit this village in the rainy season.', 'Mùa mưa hầu như chẳng có khách du lịch nào đến ngôi làng này.', ['few', 'a few', 'much'], 'few', 'tourists đếm được số nhiều → few; very few = rất ít, gần như không có. Không nói very a few; much không đi với số nhiều.'],
  ['He\'s very shy and has ___ friends at school.', 'Cậu bé rất nhút nhát, ở trường hầu như chẳng có bạn bè.', ['few', 'a few', 'a little'], 'few', 'friends số nhiều; "hầu như chẳng có" là nghĩa tiêu cực → few, không có a.'],
  ['Hurry up! We have very ___ time before the train leaves.', 'Nhanh lên! Còn rất ít thời gian nữa là tàu chạy rồi.', ['little', 'few', 'a little'], 'few', 'time không đếm được → little; very little = rất ít, gần như không còn. Không nói very a little.'],
  ['My grandmother has ___ money, but she is always happy.', 'Bà tôi hầu như chẳng có tiền, nhưng lúc nào cũng vui vẻ.', ['little', 'a little', 'few', 'a few'], 'few', 'money không đếm được; "hầu như chẳng có" là nghĩa tiêu cực → little, không có a.'],
  ['There was ___ food left after the party, so we went out for pho.', 'Tiệc xong hầu như chẳng còn đồ ăn, nên chúng tôi ra ngoài ăn phở.', ['little', 'a little', 'few', 'a few'], 'few', 'food không đếm được; "hầu như chẳng còn" là nghĩa tiêu cực → little, không có a.'],

  ['I bought ___ souvenirs for my colleagues.', 'Tôi mua ít quà lưu niệm cho đồng nghiệp.', ['some', 'any', 'a'], 'someany', 'Câu khẳng định → some. a không đi với danh từ số nhiều.'],
  ['There are ___ eggs in the fridge, so we can make an omelette.', 'Trong tủ lạnh còn mấy quả trứng, mình làm trứng tráng được đấy.', ['some', 'any', 'much'], 'someany', 'Câu khẳng định → some. eggs đếm được nên không dùng much.'],
  ['Would you like ___ tea?', 'Anh uống chút trà nhé?', ['some', 'many', 'a few'], 'someany', 'Lời mời (Would you like…?) dùng some, dù là câu hỏi. tea không đếm được nên không dùng many / a few.'],
  ['Could you give me ___ napkins, please?', 'Cho tôi xin mấy tờ giấy ăn nhé.', ['some', 'much', 'a little'], 'someany', 'Lời nhờ (Could you…?) dùng some, dù là câu hỏi. napkins đếm được nên không dùng much / a little.'],
  ['There isn\'t ___ milk left. Can you buy some?', 'Hết sạch sữa rồi. Anh mua thêm ít sữa nhé?', ['any', 'some', 'no'], 'someany', 'Câu phủ định (isn\'t) → any. isn\'t … no là phủ định hai lần, sai.'],
  ['Sorry, I don\'t have ___ change. I only have a 500,000-dong note.', 'Xin lỗi, tôi không có tiền lẻ. Tôi chỉ có tờ 500 nghìn.', ['any', 'some', 'many'], 'someany', 'Câu phủ định (don\'t have) → any. change (tiền lẻ) không đếm được nên không dùng many.'],
  ['I\'m sorry, we don\'t have ___ rooms left tonight.', 'Xin lỗi, tối nay khách sạn không còn phòng nào trống.', ['any', 'some', 'no'], 'someany', 'Câu phủ định (don\'t have) → any. don\'t … no là phủ định hai lần, sai.'],
  ['Did you get ___ sleep on the night bus?', 'Đi xe khách đêm bạn có ngủ được chút nào không?', ['any', 'many', 'a few'], 'someany', 'Câu hỏi thường → any. sleep không đếm được nên không dùng many / a few.'],
  ['There are ___ buses after midnight, so take a taxi.', 'Sau nửa đêm không còn chuyến xe buýt nào, nên bạn đi taxi nhé.', ['no', 'any', 'some'], 'someany', 'Động từ khẳng định (are) + no = không có cái nào. Muốn dùng any với nghĩa "không… nào" thì động từ phải phủ định: There aren\'t any buses.'],
  ['I have ___ idea where he is.', 'Tôi chẳng biết anh ấy đang ở đâu.', ['no', 'any', 'not'], 'someany', 'have no idea = hoàn toàn không biết. Động từ khẳng định (have) + no + danh từ; muốn dùng any thì phải phủ định động từ: I don\'t have any idea. not không thay cho no ở đây.'],
  ['I wanted to buy concert tickets, but there were ___ left.', 'Tôi định mua vé xem hoà nhạc, nhưng chẳng còn vé nào.', ['none', 'no', 'any'], 'someany', 'Không có danh từ đi sau thì dùng none (= not any tickets). no luôn phải có danh từ đi sau.'],
  ['There\'s ___ sugar in this coffee, so it\'s really bitter.', 'Cà phê này không có chút đường nào nên đắng lắm.', ['no', 'any', 'none'], 'someany', 'There\'s no sugar = không có chút đường nào. none không đứng ngay trước danh từ; any với nghĩa "không… chút nào" cần động từ phủ định: There isn\'t any sugar.'],
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

export const filled = (f: Frame) => f.en.replace(/___(\s*\([^)]*\))?/, f.answer)
