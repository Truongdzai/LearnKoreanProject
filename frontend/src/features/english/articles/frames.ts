// Mạo từ a / an / the và "—" (không dùng mạo từ). Mỗi câu chỉ một phương án đúng: không đưa the làm phương án sai
// khi the cũng thành câu đúng (I like the music, studying at the university), không luyện nhạc cụ vì người Mỹ
// hay nói play guitar, bỏ an hotel / an historic (một số người Anh vẫn dùng).

export type ArticleGroup = 'sound' | 'first' | 'zero' | 'unique'
export type Article = 'a' | 'an' | 'the' | '—'

// "—" = không dùng mạo từ
export const ZERO: Article = '—'

export interface Frame {
  id: string
  en: string
  vi: string
  options: Article[]
  answer: Article
  group: ArticleGroup
  why: string
}

export const GROUPS: Record<ArticleGroup, { name: string; form: string; rule: string; ex: string }> = {
  sound: {
    name: 'a hay an: nghe âm đầu',
    form: 'a book · an apple · an hour · a university',
    rule: 'a + phụ âm, an + âm nguyên âm. Nghe âm của từ ngay sau, không nhìn chữ cái: an hour, an honest man (h câm), an MBA (đọc "em"), nhưng a university, a European (đọc "ju"), a one-way ticket (đọc "wʌn").',
    ex: 'I bought a one-way ticket and waited an hour.',
  },
  first: {
    name: 'a / an hay the',
    form: 'a dog → the dog',
    rule: 'a / an: nói tới lần đầu, một cái bất kỳ, hay nói nghề nghiệp (She\'s a nurse). the: cả người nói và người nghe đều biết đang nói cái nào: đã nhắc ở trước, chỉ có một trong tình huống (pass me the salt), hoặc được nói rõ (the name of the hotel).',
    ex: 'I saw a dog in the park. The dog was huge!',
  },
  zero: {
    name: 'Không mạo từ',
    form: 'I like music · have lunch · by bus · at work',
    rule: 'Không mạo từ với danh từ số nhiều / không đếm được khi nói chung (music, smoking); danh từ không đếm được như advice không bao giờ đi với a / an. Cũng không mạo từ với bữa ăn (have lunch), by + phương tiện (by bus), at home, at work, go to bed, ngôn ngữ (speak Japanese), môn thể thao (play badminton). Khi đã nói rõ cái nào thì lại dùng the: the money I gave you.',
    ex: 'We have lunch at home on Sundays.',
  },
  unique: {
    name: 'the với vật duy nhất',
    form: 'the sun · the highest · the first · the UK',
    rule: 'the đi với vật duy nhất (the sun, the internet), so sánh nhất (the highest), số thứ tự (the first, the third floor), the same, nhạc cụ (play the piano), sông, biển, đại dương (the Red River, the Pacific) và the UK, the USA. Phần lớn tên nước, thành phố, đường phố không có mạo từ: Japan, Da Nang, Hang Bac Street.',
    ex: 'She plays the piano every evening.',
  },
}

type Raw = [string, string, Article[], ArticleGroup, string]

const RAW: Raw[] = [
  ['It takes ___ hour to get to the airport by taxi.', 'Đi taxi ra sân bay mất một tiếng.', ['an', 'a', 'the', '—'], 'sound', 'hour có h câm, đọc /aʊə/, âm đầu là nguyên âm → an.'],
  ['My brother works for ___ university in Australia.', 'Anh trai tôi làm việc cho một trường đại học ở Úc.', ['a', 'an', '—'], 'sound', 'university đọc /juː/, âm đầu /j/ là phụ âm → a, dù chữ đầu là u.'],
  ['She has ___ MBA from a business school in Singapore.', 'Cô ấy có bằng MBA của một trường kinh doanh ở Singapore.', ['an', 'a', '—'], 'sound', 'MBA đọc từng chữ, M đọc "em", âm đầu là nguyên âm → an.'],
  ['We met ___ European couple on the bus to Sa Pa.', 'Chúng tôi gặp một cặp vợ chồng người châu Âu trên xe khách đi Sa Pa.', ['a', 'an', '—'], 'sound', 'European đọc /jʊə/, âm đầu /j/ là phụ âm → a, dù chữ đầu là E.'],
  ['He is ___ honest man, so you can trust him.', 'Anh ấy là người trung thực, nên bạn có thể tin anh ấy.', ['an', 'a', '—'], 'sound', 'honest có h câm, đọc /ˈɒnɪst/, âm đầu là nguyên âm → an.'],
  ['I\'d like ___ one-way ticket to Da Nang, please.', 'Cho tôi một vé một chiều đi Đà Nẵng.', ['a', 'an', '—'], 'sound', 'one đọc /wʌn/, âm đầu /w/ là phụ âm → a, dù chữ đầu là o.'],
  ['My sister works as ___ engineer in Ho Chi Minh City.', 'Chị tôi làm kỹ sư ở TP. Hồ Chí Minh.', ['an', 'a', '—'], 'sound', 'engineer bắt đầu bằng âm nguyên âm → an. Nói nghề nghiệp cũng phải có a / an.'],
  ['There\'s ___ ATM next to the hotel.', 'Có một cây ATM ngay cạnh khách sạn.', ['an', 'a', '—'], 'sound', 'ATM đọc từng chữ, A đọc "ây", âm đầu là nguyên âm → an.'],
  ['I have ___ idea! Let\'s go to Da Lat this weekend.', 'Tôi có ý này! Cuối tuần này mình đi Đà Lạt đi.', ['an', 'a', '—'], 'sound', 'idea bắt đầu bằng âm nguyên âm /aɪ/ → an.'],
  ['He gave me ___ useful tip about the city.', 'Anh ấy cho tôi một mẹo hữu ích về thành phố.', ['a', 'an', '—'], 'sound', 'Mạo từ theo âm của từ đứng ngay sau: useful đọc /juː/, phụ âm /j/ → a.'],
  ['The doctor wants me to have ___ X-ray.', 'Bác sĩ muốn tôi đi chụp X-quang.', ['an', 'a', '—'], 'sound', 'X đọc /eks/, âm đầu là nguyên âm → an.'],
  ['Hoi An is ___ ancient town famous for its lanterns.', 'Hội An là một phố cổ nổi tiếng với đèn lồng.', ['an', 'a', '—'], 'sound', 'ancient bắt đầu bằng âm nguyên âm /eɪ/ → an.'],

  ['We stayed in a small hotel near the beach. ___ hotel had a lovely garden.', 'Chúng tôi ở một khách sạn nhỏ gần biển. Khách sạn đó có khu vườn rất đẹp.', ['the', 'a', '—'], 'first', 'Khách sạn đã nhắc ở câu trước, người nghe biết là cái nào → lần hai dùng the.'],
  ['I bought a shirt and a jacket at the market. ___ shirt was cheap, but the jacket was expensive.', 'Tôi mua một cái áo sơ mi và một cái áo khoác ở chợ. Áo sơ mi thì rẻ, còn áo khoác thì đắt.', ['the', 'a', '—'], 'first', 'Cái áo sơ mi vừa được nhắc tới → the shirt.'],
  ['We took a taxi from the airport. ___ driver was very friendly.', 'Chúng tôi đi taxi từ sân bay. Bác tài rất thân thiện.', ['the', 'a', '—'], 'first', 'Chiếc taxi đó chỉ có một bác tài, người nghe hiểu ngay là ai → the driver.'],
  ['Excuse me, is there ___ pharmacy near here?', 'Xin lỗi, gần đây có hiệu thuốc nào không?', ['a', 'the', 'an', '—'], 'first', 'Hỏi có một hiệu thuốc bất kỳ, chưa biết là cái nào → a. Sau is there / there is thường dùng a / an.'],
  ['Can you pass me ___ salt, please?', 'Bạn chuyển giúp tôi lọ muối được không?', ['the', 'a', '—'], 'first', 'Lọ muối trên bàn, cả hai đều biết là lọ nào → the.'],
  ['What\'s ___ name of your hotel?', 'Khách sạn của bạn tên là gì?', ['the', 'a', '—'], 'first', 'of your hotel đã nói rõ là tên nào → the name of …'],
  ['Lan is ___ old friend of mine.', 'Lan là một người bạn cũ của tôi.', ['an', 'the', 'a', '—'], 'first', 'a friend of mine = một trong những người bạn của tôi; old bắt đầu bằng nguyên âm → an.'],
  ['Do you have ___ minute? I need to ask you something.', 'Bạn có rảnh một chút không? Tôi cần hỏi bạn một việc.', ['a', 'the', '—'], 'first', 'Một phút bất kỳ, không phải phút nào đã biết → a.'],
  ['My mother is ___ nurse at Bach Mai Hospital.', 'Mẹ tôi là y tá ở Bệnh viện Bạch Mai.', ['a', 'an', '—'], 'first', 'Nói nghề nghiệp phải có a / an (một trong nhiều y tá). Tiếng Việt không cần "một" nhưng tiếng Anh thì bắt buộc.'],
  ['Look at ___ man in the red shirt. That\'s my boss.', 'Nhìn người đàn ông mặc áo đỏ kia kìa. Đó là sếp tôi.', ['the', 'a', '—'], 'first', 'in the red shirt đã chỉ rõ là người nào → the.'],
  ['I got a message from Minh, but I deleted ___ message by mistake.', 'Tôi nhận được tin nhắn của Minh, nhưng lỡ tay xoá mất tin nhắn đó.', ['the', 'a', '—'], 'first', 'Tin nhắn đã nhắc ở vế trước → lần hai dùng the.'],

  ['I usually go to work by ___ bus.', 'Tôi thường đi làm bằng xe buýt.', ['—', 'the', 'a'], 'zero', 'by + phương tiện không có mạo từ: by bus, by train, by taxi.'],
  ['What time do you usually have ___ lunch?', 'Bạn thường ăn trưa lúc mấy giờ?', ['—', 'the', 'a'], 'zero', 'Bữa ăn không có mạo từ: have breakfast, have lunch, have dinner.'],
  ['I\'m really tired, so I\'m going to ___ bed.', 'Tôi mệt quá nên đi ngủ đây.', ['—', 'the', 'a'], 'zero', 'go to bed (đi ngủ) là cụm cố định, không có mạo từ.'],
  ['My husband is still at ___ work.', 'Chồng tôi vẫn còn ở chỗ làm.', ['—', 'the', 'a'], 'zero', 'at work, go to work: không có mạo từ.'],
  ['She works from ___ home on Fridays.', 'Thứ Sáu cô ấy làm việc ở nhà.', ['—', 'the', 'a'], 'zero', 'home (nhà mình) không có mạo từ: at home, from home, go home.'],
  ['My boss speaks ___ Japanese very well.', 'Sếp tôi nói tiếng Nhật rất giỏi.', ['—', 'the', 'a'], 'zero', 'Tên ngôn ngữ không có mạo từ: speak English, learn Korean.'],
  ['My parents play ___ badminton in the park every morning.', 'Bố mẹ tôi chơi cầu lông ở công viên mỗi sáng.', ['—', 'the', 'a'], 'zero', 'Môn thể thao không có mạo từ: play badminton, play football (khác nhạc cụ: play the piano).'],
  ['Can I pay by ___ credit card?', 'Tôi trả bằng thẻ tín dụng được không?', ['—', 'the', 'an'], 'zero', 'by + cách trả tiền không có mạo từ: by credit card, by bank transfer.'],
  ['Thank you for ___ flowers you sent me.', 'Cảm ơn bạn vì những bông hoa bạn đã gửi tặng tôi.', ['the', '—', 'a'], 'zero', 'Không phải hoa nói chung mà là những bông hoa bạn đã gửi → the.'],
  ['Where is ___ money I gave you yesterday?', 'Số tiền tôi đưa bạn hôm qua đâu rồi?', ['the', '—', 'a'], 'zero', 'Số tiền cụ thể (tôi đưa bạn hôm qua) → the. Nói chung chung thì không mạo từ: Money isn\'t everything.'],
  ['I love ___ music, but I don\'t like the music in this bar.', 'Tôi rất thích âm nhạc, nhưng không thích nhạc ở quán bar này.', ['—', 'the', 'a'], 'zero', 'Âm nhạc nói chung → không mạo từ; còn nhạc ở quán bar này là nhạc cụ thể → the music.'],
  ['___ smoking is not allowed in this hotel.', 'Không được hút thuốc trong khách sạn này.', ['—', 'the', 'a'], 'zero', 'Việc hút thuốc nói chung (danh từ không đếm được) → không mạo từ.'],
  ['Can you give me ___ advice about renting a house in Hanoi?', 'Bạn có thể cho tôi lời khuyên về việc thuê nhà ở Hà Nội không?', ['—', 'an', 'a'], 'zero', 'advice không đếm được nên không đi với a / an (muốn nói "một lời khuyên": a piece of advice).'],

  ['___ sun rises in the east.', 'Mặt trời mọc ở hướng đông.', ['the', 'a', '—'], 'unique', 'Mặt trời chỉ có một → the sun (cũng vậy: the moon, the sky, the world).'],
  ['I found this recipe on ___ internet.', 'Tôi tìm thấy công thức này trên mạng.', ['the', 'an', '—'], 'unique', 'internet là vật duy nhất → on the internet (hoặc nói online).'],
  ['Ha Long Bay is one of ___ most beautiful places in Vietnam.', 'Vịnh Hạ Long là một trong những nơi đẹp nhất Việt Nam.', ['the', 'a', '—'], 'unique', 'So sánh nhất luôn có the: one of the most beautiful …'],
  ['Fansipan is ___ highest mountain in Vietnam.', 'Fansipan là ngọn núi cao nhất Việt Nam.', ['the', 'a', '—'], 'unique', 'So sánh nhất (highest) → the.'],
  ['Is this ___ first time you\'ve been to Hue?', 'Đây có phải lần đầu bạn đến Huế không?', ['the', 'a', '—'], 'unique', 'Số thứ tự (first, second, third…) thường đi với the: the first time.'],
  ['Our office is on ___ third floor.', 'Văn phòng chúng tôi ở tầng ba.', ['the', 'a', '—'], 'unique', 'Số thứ tự → the: on the third floor.'],
  ['My sister and I work for ___ same company.', 'Chị tôi và tôi làm cùng một công ty.', ['the', 'a', '—'], 'unique', 'same đi với the: the same company (không nói a same).'],
  ['___ Red River flows through Hanoi.', 'Sông Hồng chảy qua Hà Nội.', ['the', 'a', '—'], 'unique', 'Tên sông có the: the Red River, the Mekong.'],
  ['We flew across ___ Pacific Ocean to Los Angeles.', 'Chúng tôi bay qua Thái Bình Dương sang Los Angeles.', ['the', 'a', '—'], 'unique', 'Tên biển và đại dương có the: the Pacific Ocean.'],
  ['My cousin is studying in ___ UK.', 'Em họ tôi đang du học ở Vương quốc Anh.', ['the', 'a', '—'], 'unique', 'Tên nước có Kingdom / States / dạng số nhiều thì có the: the UK, the USA, the Philippines.'],
  ['Next month I\'m flying to ___ Japan for work.', 'Tháng sau tôi bay sang Nhật công tác.', ['—', 'the', 'a'], 'unique', 'Phần lớn tên nước không có mạo từ: Japan, Vietnam, Korea.'],
  ['My grandparents live in ___ Da Nang.', 'Ông bà tôi sống ở Đà Nẵng.', ['—', 'the', 'a'], 'unique', 'Tên thành phố thường không có mạo từ: Da Nang, Hanoi, London.'],
  ['The hotel is on ___ Hang Bac Street, in the Old Quarter.', 'Khách sạn ở phố Hàng Bạc, trong khu phố cổ.', ['—', 'the', 'a'], 'unique', 'Tên đường phố thường không có mạo từ: Hang Bac Street, Nguyen Hue Street.'],
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

export function buildRound(weak: string[]): (Frame & { shuffled: Article[] })[] {
  // Câu từng sai chiếm tối đa nửa lượt; nếu câu mới không đủ thì lấy thêm câu sai còn lại để lượt luôn đủ số câu
  const ws = shuffle(FRAMES.filter((f) => weak.includes(f.id)))
  const half = Math.ceil(ROUND / 2)
  const rest = shuffle(FRAMES.filter((f) => !weak.includes(f.id)))
  return shuffle([...ws.slice(0, half), ...rest, ...ws.slice(half)].slice(0, ROUND)).map((f) => ({ ...f, shuffled: shuffle(f.options) }))
}

// Câu đã điền: viết hoa khi đứng đầu câu; "—" thì bỏ chỗ trống cùng một dấu cách bên cạnh
export const filled = (f: Frame) => {
  const [a, b] = f.en.split('___')
  const start = a === '' || /[.!?]\s+$/.test(a)
  const cap = (s: string) => (start ? s.charAt(0).toUpperCase() + s.slice(1) : s)
  if (f.answer !== ZERO) return a + cap(f.answer) + b
  return b.startsWith(' ') ? a + cap(b.slice(1)) : a.replace(/ $/, '') + cap(b)
}
