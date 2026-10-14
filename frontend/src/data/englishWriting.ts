export interface WritePrompt {
  id: string
  emoji: string
  level: 'a1' | 'a1p' | 'a2' | 'b1'
  title: string
  task: string
  minWords: number
  scaffold: string[]
  useful: { en: string; vi: string }[]
  model: string
  modelNote: string
}

export const WRITE_PROMPTS: WritePrompt[] = [
  {
    id: 'w01',
    emoji: '👋',
    level: 'a1',
    title: 'Giới thiệu bản thân',
    task: 'Viết 5–7 câu giới thiệu bạn cho một người bạn mới quen: tên, nơi sống, công việc, một sở thích và một điều bạn đang học.',
    minWords: 50,
    scaffold: [
      'Câu 1–2: tên và nơi sống. My name is… / I live in…',
      'Câu 3–4: công việc hoặc việc học. I work as… / I study…',
      'Câu 5–6: sở thích. In my free time I…',
      'Câu 7: điều đang học. At the moment I am learning…',
    ],
    useful: [
      { en: 'I live in Ho Chi Minh City with my family.', vi: 'Tôi sống ở TP.HCM với gia đình.' },
      { en: 'I work as an accountant at a small company.', vi: 'Tôi làm kế toán ở một công ty nhỏ.' },
      { en: 'In my free time I like cooking and watching football.', vi: 'Lúc rảnh tôi thích nấu ăn và xem bóng đá.' },
      { en: 'At the moment I am learning English because I want to travel.', vi: 'Hiện tại tôi đang học tiếng Anh vì tôi muốn đi du lịch.' },
    ],
    model: 'My name is Huy and I am twenty-six years old. I live in Ho Chi Minh City with my parents and my younger sister. I work as an accountant at a small import company near my house. In my free time I like cooking, and I watch football on Sunday evenings. At the moment I am learning English because I want to travel to Singapore next year. I am not very good yet, but I practise every day.',
    modelNote: 'Để ý: bài mẫu chỉ dùng hiện tại đơn và hiện tại tiếp diễn — đúng tinh thần "ngữ pháp nói lõi". Không cần câu phức mới hay.',
  },
  {
    id: 'w02',
    emoji: '📅',
    level: 'a1',
    title: 'Một ngày của bạn',
    task: 'Kể lại một ngày thường của bạn theo trình tự thời gian, từ lúc dậy tới lúc đi ngủ. Ít nhất 6 câu.',
    minWords: 60,
    scaffold: [
      'Mở: I usually get up at…',
      'Sáng: After that / Then I…',
      'Trưa & chiều: At noon… / In the afternoon…',
      'Tối: In the evening… Kết: I go to bed at…',
    ],
    useful: [
      { en: 'I usually get up at six and make coffee.', vi: 'Tôi thường dậy lúc 6 giờ và pha cà phê.' },
      { en: 'After that, I go to work by motorbike.', vi: 'Sau đó tôi đi làm bằng xe máy.' },
      { en: 'I have lunch with my colleagues at noon.', vi: 'Tôi ăn trưa với đồng nghiệp lúc trưa.' },
      { en: 'I go to bed at about eleven o\'clock.', vi: 'Tôi đi ngủ khoảng 11 giờ.' },
    ],
    model: 'I usually get up at half past six. First I wash my face and make coffee, and then I check my phone for ten minutes. I leave the house at half past seven and go to work by motorbike. It takes about thirty minutes. At noon I have lunch with my colleagues, usually rice and soup. In the afternoon I answer emails and go to meetings. I finish work at six. In the evening I cook dinner, watch one video in English, and study new words. I go to bed at about eleven o\'clock.',
    modelNote: 'Chuỗi từ nối thời gian (First… then… after that… at noon… in the evening) là bộ khung rẻ tiền mà hiệu quả — dùng lại được cho mọi bài kể chuyện.',
  },
  {
    id: 'w03',
    emoji: '🗺️',
    level: 'a1p',
    title: 'Chỉ đường cho bạn nước ngoài',
    task: 'Một người bạn nước ngoài hỏi đường từ chỗ bạn tới một quán cà phê gần đó. Viết tin nhắn chỉ đường, có ít nhất 3 bước rẽ và một mốc dễ nhận.',
    minWords: 60,
    scaffold: [
      'Mở: It is easy to find. / It is about ten minutes on foot.',
      'Bước: Go straight… / Turn left at… / Walk past…',
      'Mốc: You will see a big… on your right.',
      'Kết: If you get lost, call me.',
    ],
    useful: [
      { en: 'Go straight for about two hundred metres.', vi: 'Đi thẳng khoảng 200 mét.' },
      { en: 'Turn left at the traffic lights.', vi: 'Rẽ trái ở đèn giao thông.' },
      { en: 'Walk past the pharmacy and the bank.', vi: 'Đi qua hiệu thuốc và ngân hàng.' },
      { en: 'It is on your right, next to a bookshop.', vi: 'Quán nằm bên phải bạn, cạnh một hiệu sách.' },
    ],
    model: 'Hi Tom, it is easy to find and only about ten minutes on foot. When you leave the hotel, turn right and go straight for two hundred metres. You will pass a pharmacy and a small bank. At the traffic lights, turn left into Nguyen Hue street. Walk for another three minutes. The coffee shop is on your right, next to a bookshop with a blue sign. If you get lost, just call me and I will come out. See you at three.',
    modelNote: 'Chỉ đường gần như chỉ dùng câu mệnh lệnh (Go, turn, walk) — không có chủ ngữ. Đây là dạng câu dễ nhất trong tiếng Anh nhưng dùng được ngay ngoài đời.',
  },
  {
    id: 'w04',
    emoji: '📧',
    level: 'a1p',
    title: 'Email xin nghỉ phép',
    task: 'Viết email ngắn xin sếp nghỉ 2 ngày: nêu lý do, nói rõ ngày nào, và cho biết ai sẽ lo việc thay bạn.',
    minWords: 70,
    scaffold: [
      'Chào & mục đích: I would like to ask for two days off…',
      'Ngày: on Thursday 12 and Friday 13 June.',
      'Lý do ngắn gọn, không cần chi tiết đời tư.',
      'Bàn giao: Trung has agreed to cover my tasks.',
      'Kết lịch sự: Please let me know if that is okay.',
    ],
    useful: [
      { en: 'I would like to ask for two days off next week.', vi: 'Em muốn xin nghỉ hai ngày vào tuần sau.' },
      { en: 'I need to take my mother to hospital.', vi: 'Em cần đưa mẹ đi bệnh viện.' },
      { en: 'Trung has agreed to cover my tasks.', vi: 'Anh Trung đã đồng ý làm thay phần việc của em.' },
      { en: 'Please let me know if that is okay.', vi: 'Anh/chị cho em biết có được không ạ.' },
    ],
    model: 'Dear David,\n\nI would like to ask for two days off next week, on Thursday 12 and Friday 13 June. I need to take my mother to hospital for a small operation and stay with her for one day after that.\n\nI have finished the June report already, and Trung has agreed to cover my tasks while I am away. I will also check my email once a day in case anything urgent comes up.\n\nPlease let me know if that is okay.\n\nBest regards,\nLan',
    modelNote: 'Email công việc tiếng Anh ngắn hơn tiếng Việt nhiều. Không cần rào đón dài — nêu việc, nêu ngày, nêu phương án thay thế, hết.',
  },
  {
    id: 'w05',
    emoji: '⭐',
    level: 'a2',
    title: 'Viết đánh giá một quán ăn',
    task: 'Viết một review 80–120 từ cho quán ăn bạn từng tới: món ăn, giá, phục vụ, không gian, và bạn có quay lại không.',
    minWords: 80,
    scaffold: [
      'Mở: I went to… last weekend with…',
      'Món: We ordered… The… was excellent / a bit salty.',
      'Giá & phục vụ: It cost about… The staff were…',
      'Kết luận: I would definitely go back / I probably would not return.',
    ],
    useful: [
      { en: 'The service was quick and the staff were friendly.', vi: 'Phục vụ nhanh và nhân viên thân thiện.' },
      { en: 'The portions were generous for the price.', vi: 'Phần ăn khá đầy đặn so với giá.' },
      { en: 'It was a bit noisy, but the food made up for it.', vi: 'Hơi ồn, nhưng đồ ăn bù lại được.' },
      { en: 'I would definitely go back with friends.', vi: 'Tôi chắc chắn sẽ quay lại cùng bạn bè.' },
    ],
    model: 'I went to Bun Cha 55 last Saturday with two friends. We ordered bun cha, fried spring rolls, and iced tea. The grilled pork was excellent — smoky and not too sweet — although the spring rolls were a little oily. The whole meal cost about 150,000 dong for three people, which I think is very good value. The service was fast, and the owner even brought us extra herbs without asking. The place is small and quite noisy at lunchtime, so it is not somewhere for a quiet conversation. Still, I would definitely go back, probably on a weekday when it is calmer.',
    modelNote: 'Bài hay cần có ý chê: "although the spring rolls were a little oily", "quite noisy". Khen toàn bộ nghe giả và nghèo từ. Học cách dùng although / still / which.',
  },
  {
    id: 'w06',
    emoji: '🤝',
    level: 'a2',
    title: 'Từ chối lời mời mà không mất lòng',
    task: 'Một đồng nghiệp mời bạn dự tiệc cuối tuần nhưng bạn bận. Viết tin nhắn từ chối: cảm ơn, nêu lý do, và đề xuất một dịp khác.',
    minWords: 70,
    scaffold: [
      'Cảm ơn trước: Thanks so much for inviting me.',
      'Từ chối rõ ràng: Unfortunately I cannot make it.',
      'Lý do ngắn, không bịa dài dòng.',
      'Mở cửa lại: Could we do something the week after?',
    ],
    useful: [
      { en: 'Thanks so much for the invitation.', vi: 'Cảm ơn bạn đã mời mình.' },
      { en: 'Unfortunately, I cannot make it on Saturday.', vi: 'Tiếc là thứ Bảy mình không đi được.' },
      { en: 'I have already promised to help my sister move house.', vi: 'Mình đã hứa giúp chị mình chuyển nhà rồi.' },
      { en: 'Could we grab lunch the week after instead?', vi: 'Hay tuần sau nữa mình đi ăn trưa nhé?' },
    ],
    model: 'Hi Mai, thanks so much for inviting me — that sounds like a lot of fun. Unfortunately I cannot make it on Saturday. I promised weeks ago to help my sister move house, and it will probably take the whole day.\n\nI am really sorry to miss it, especially as I have not seen everyone since March. Could we grab lunch the week after instead? I am free on Tuesday or Thursday, so just tell me what works for you.\n\nHave a great time on Saturday, and please say hello to the others for me.',
    modelNote: 'Công thức từ chối bằng tiếng Anh có 4 nhịp: cảm ơn → từ chối thẳng → lý do ngắn → đề nghị dịp khác. Thiếu nhịp cuối là nghe lạnh.',
  },
  {
    id: 'w07',
    emoji: '📨',
    level: 'b1',
    title: 'Email phàn nàn lịch sự mà chắc',
    task: 'Bạn mua một chiếc máy lọc không khí online, giao trễ 10 ngày và máy kêu to bất thường. Viết email 120–160 từ gửi bộ phận chăm sóc khách hàng: nêu sự việc, hậu quả, yêu cầu cụ thể và hạn chót.',
    minWords: 120,
    scaffold: [
      'Mở: lý do viết + mã đơn hàng. I am writing about order #…',
      'Sự việc theo thứ tự thời gian: ordered on… / was supposed to arrive… / arrived on…',
      'Vấn đề hiện tại + bạn đã thử gì: I have already tried…',
      'Yêu cầu rõ ràng + hạn: I would like… Could you please… by…?',
    ],
    useful: [
      { en: 'I am writing to complain about order #48213.', vi: 'Tôi viết thư để phàn nàn về đơn hàng #48213.' },
      { en: 'It was supposed to arrive on 3 May, but it was delivered ten days late.', vi: 'Lẽ ra hàng phải tới ngày 3/5, nhưng đã giao trễ mười ngày.' },
      { en: 'I have already tried resetting it, but the problem has not gone away.', vi: 'Tôi đã thử khởi động lại nhưng lỗi vẫn còn.' },
      { en: 'I would appreciate it if you could arrange a replacement by Friday.', vi: 'Tôi rất mong anh/chị sắp xếp đổi máy mới trước thứ Sáu.' },
    ],
    model: 'Dear Customer Service Team,\n\nI am writing about order #48213, an air purifier which I bought from your website on 25 April. It was supposed to arrive on 3 May, but it was only delivered on 13 May.\n\nUnfortunately, the delay is not the only problem. Since the first day, the machine has made a loud rattling noise, even on the lowest setting. I have already tried resetting it and cleaning the filter, as the manual suggests, but the noise has not gone away. As a result, I cannot use it at night, which is the main reason I bought it.\n\nI would like a replacement rather than a refund. Could you please arrange for the faulty unit to be collected and a new one delivered by Friday 20 May? If this is not possible, please let me know what other options are available.\n\nI look forward to hearing from you.\n\nYours faithfully,\nNguyen Thu Ha',
    modelNote: 'Phàn nàn bằng tiếng Anh không cần gay gắt: giữ giọng bình tĩnh nhưng cụ thể — ngày tháng, mã đơn, việc đã thử, yêu cầu có hạn chót. Để ý "was supposed to" (lẽ ra phải), "has made… since" (hiện tại hoàn thành) và "rather than".',
  },
  {
    id: 'w08',
    emoji: '⚖️',
    level: 'b1',
    title: 'Trình bày quan điểm: có nên học ngoại ngữ từ nhỏ?',
    task: 'Viết bài 150–200 từ trả lời câu hỏi: "Trẻ em có nên bắt đầu học ngoại ngữ từ mẫu giáo không?" Nêu rõ quan điểm, hai lý do có ví dụ, một ý phản biện và kết luận.',
    minWords: 150,
    scaffold: [
      'Mở bài (1–2 câu): nhắc lại vấn đề + quan điểm của bạn. In my opinion…',
      'Lý do 1 + ví dụ: Firstly,… For example,…',
      'Lý do 2 + ví dụ: Secondly,…',
      'Phản biện + đáp lại: Some people argue that… However,…',
      'Kết luận (1–2 câu), không thêm ý mới: Overall,…',
    ],
    useful: [
      { en: 'In my opinion, the benefits clearly outweigh the drawbacks.', vi: 'Theo tôi, lợi ích rõ ràng lớn hơn bất lợi.' },
      { en: 'For example, my nephew picked up English songs much faster than his parents.', vi: 'Ví dụ, cháu tôi thuộc bài hát tiếng Anh nhanh hơn bố mẹ nó nhiều.' },
      { en: 'Some people argue that children should master their mother tongue first.', vi: 'Một số người cho rằng trẻ nên thành thạo tiếng mẹ đẻ trước.' },
      { en: 'However, research suggests that young children can learn two languages at once.', vi: 'Tuy nhiên, nghiên cứu cho thấy trẻ nhỏ có thể học hai ngôn ngữ cùng lúc.' },
    ],
    model: 'Many parents in Vietnam now send their children to English classes before primary school. In my opinion, starting early is a good idea, as long as it is done in the right way.\n\nFirstly, young children learn pronunciation more naturally than adults. For example, my five-year-old nephew can copy English sounds that his parents still find difficult after years of study. Secondly, learning through songs and games makes children see a foreign language as something fun rather than a school subject, and this attitude often lasts.\n\nSome people argue that children should master Vietnamese first, and that a second language might confuse them. This concern is understandable. However, research suggests that young children can learn two languages at the same time without serious problems, especially if Vietnamese is still spoken at home.\n\nOverall, I believe early language learning is worthwhile. The key is to keep it playful and not to put pressure on children to get high scores.',
    modelNote: 'Bài quan điểm B1 hay nhờ CẤU TRÚC chứ không nhờ từ khó: mỗi đoạn một ý, có ví dụ cụ thể, có thừa nhận phía bên kia ("This concern is understandable. However,…"). Kết luận nhắc lại quan điểm, không thêm lý do mới.',
  },
  {
    id: 'w09',
    emoji: '🧭',
    level: 'b1',
    title: 'Kể một chặng đường thay đổi của bạn',
    task: 'Viết bài 150–200 từ kể về một điều bạn đã thay đổi được trong một năm qua (thói quen, kỹ năng, công việc…): trước đây thế nào, điều gì khiến bạn bắt đầu, khó khăn, và bây giờ ra sao.',
    minWords: 150,
    scaffold: [
      'Trước đây: I used to… / A year ago, I couldn\'t…',
      'Bước ngoặt: Everything changed when… (quá khứ đơn + quá khứ tiếp diễn)',
      'Khó khăn + cách vượt qua: At first,… but…',
      'Bây giờ: Now I… / I have… since… (hiện tại hoàn thành)',
      'Bài học / dự định: If I had…, I would have… / Next, I want to…',
    ],
    useful: [
      { en: 'A year ago, I couldn\'t run for more than five minutes.', vi: 'Một năm trước, tôi không chạy nổi quá năm phút.' },
      { en: 'Everything changed when I was waiting for a bus and realised I was out of breath.', vi: 'Mọi thứ thay đổi khi tôi đang đợi xe buýt và nhận ra mình hụt hơi.' },
      { en: 'I have run three times a week since February.', vi: 'Tôi chạy ba buổi mỗi tuần từ tháng Hai tới giờ.' },
      { en: 'If I had started earlier, I would have saved myself a lot of stress.', vi: 'Giá tôi bắt đầu sớm hơn thì đã đỡ bao nhiêu căng thẳng.' },
    ],
    model: 'A year ago, I was too shy to speak English with anyone. I had studied grammar for years at school, but whenever a foreign customer came into our shop, I used to call my colleague and hide in the back room.\n\nEverything changed last October. I was working alone one afternoon when an Australian couple asked me for directions to the train station. I tried to answer, but I froze. They were very kind, yet I felt embarrassed for the rest of the day.\n\nThat night I decided to practise speaking every day, even for ten minutes. At first, I only talked to an AI app because I was afraid of making mistakes in front of real people. After two months, I joined a free conversation club on Saturday mornings.\n\nNow I have helped dozens of tourists, and last week I explained our return policy to a customer without any notes. My English is still far from perfect, but I am no longer afraid of it. If I had started earlier, I would have enjoyed my job much more.',
    modelNote: 'Bài kể chuyện B1 trộn nhiều thì một cách có chủ đích: used to (thói quen cũ) → quá khứ tiếp diễn + quá khứ đơn (bước ngoặt) → hiện tại hoàn thành (kết quả tới nay) → câu điều kiện loại 3 (bài học). Đây là cơ hội dùng lại các bài ngữ pháp trung cấp.',
  }
]

export const WRITE_RUBRIC: { id: string; label: string; ask: string }[] = [
  { id: 'task', label: 'Đủ ý', ask: 'Đã trả lời hết mọi phần đề bài yêu cầu chưa?' },
  { id: 'tense', label: 'Đúng thì', ask: 'Kể chuyện đã qua có dùng quá khứ? Nói thói quen có dùng hiện tại đơn?' },
  { id: 's', label: 'Chữ "s" và mạo từ', ask: 'He/she/it có "s" chưa? Danh từ đếm được số ít có a/an/the chưa?' },
  { id: 'link', label: 'Từ nối', ask: 'Có and / but / so / because / although để câu không rời rạc?' },
  { id: 'vi', label: 'Không dịch từ tiếng Việt', ask: 'Có câu nào dịch word-by-word nghe lạ không? Đọc to lên sẽ nghe ra.' },
]

export const WRITE_LOOP =
  'Viết xong đừng vội xem bài mẫu. Tự soi theo 5 tiêu chí trước, sửa lại bản của bạn, RỒI mới mở bài mẫu. Đọc mẫu trước thì bạn chỉ chép lại được, không phát hiện được lỗi của chính mình.'
