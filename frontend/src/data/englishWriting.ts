export interface WritePrompt {
  id: string
  emoji: string
  level: 'a1' | 'a1p' | 'a2'
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
