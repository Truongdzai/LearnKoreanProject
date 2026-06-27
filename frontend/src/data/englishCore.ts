/**
 * Kho từ vựng lõi tiếng Anh — "3000 từ để hiểu 90% hội thoại".
 * Mỗi từ được học theo phương pháp ICES:
 *  - Image (img)        : emoji/hình ảnh gợi nhớ.
 *  - Connect (connect)  : mẹo liên tưởng / phát âm sang tiếng Việt.
 *  - Experience (ex)    : câu ví dụ đặt từ vào ngữ cảnh thật.
 *  - Sound              : phát âm bằng Web Speech (xem util pronounce), kèm IPA.
 *
 * Đây là phần LÕI ưu tiên #1 theo nguyên tắc 3C (Compress): chỉ giữ từ tần suất cao,
 * dùng tới đâu học tới đó. Cấu trúc theo "unit" để mở rộng dần tới 3000 từ.
 */

export type WordPos = 'noun' | 'verb' | 'adj' | 'question' | 'phrase'

export interface IcesWord {
  /** Từ tiếng Anh */
  en: string
  /** Phiên âm IPA (Sound) */
  ipa: string
  /** Nghĩa tiếng Việt */
  vi: string
  /** Loại từ */
  pos: WordPos
  /** Image — emoji gợi nhớ */
  img: string
  /** Connect — mẹo liên tưởng / nhớ nhanh */
  connect: string
  /** Experience — câu ví dụ tiếng Anh */
  ex: string
  /** Nghĩa câu ví dụ */
  exVi: string
}

export interface VocabUnit {
  id: string
  /** Tên unit hiển thị */
  name: string
  /** Mô tả ngắn */
  sub: string
  pos: WordPos
  /** Màu nền (dùng class tone-*) */
  tone: string
  emoji: string
  words: IcesWord[]
}

/* ------------------------------------------------------------------ */
/* 1) DANH TỪ CỐT LÕI — Everyday objects, people, food                 */
/* ------------------------------------------------------------------ */

const NOUNS: IcesWord[] = [
  { en: 'people', ipa: '/ˈpiː.pəl/', vi: 'mọi người, người', pos: 'noun', img: '👥', connect: '"Pi-pồ" — nhiều người đứng cạnh nhau.', ex: 'Many people live in this city.', exVi: 'Nhiều người sống ở thành phố này.' },
  { en: 'man', ipa: '/mæn/', vi: 'đàn ông', pos: 'noun', img: '👨', connect: '"Men" số nhiều của man.', ex: 'The man is reading a book.', exVi: 'Người đàn ông đang đọc sách.' },
  { en: 'woman', ipa: '/ˈwʊm.ən/', vi: 'phụ nữ', pos: 'noun', img: '👩', connect: '"Wu-mừn" — số nhiều là women /ˈwɪm.ɪn/.', ex: 'That woman is my teacher.', exVi: 'Người phụ nữ đó là cô giáo của tôi.' },
  { en: 'child', ipa: '/tʃaɪld/', vi: 'đứa trẻ', pos: 'noun', img: '🧒', connect: 'Số nhiều bất quy tắc: children.', ex: 'The child is playing outside.', exVi: 'Đứa trẻ đang chơi ngoài sân.' },
  { en: 'friend', ipa: '/frend/', vi: 'bạn bè', pos: 'noun', img: '🧑‍🤝‍🧑', connect: '"Phờ-renh" — friend tới the end (bạn tới cuối).', ex: 'She is my best friend.', exVi: 'Cô ấy là bạn thân nhất của tôi.' },
  { en: 'family', ipa: '/ˈfæm.əl.i/', vi: 'gia đình', pos: 'noun', img: '👨‍👩‍👧', connect: '"Phem-mì-li" — Father And Mother I Love You.', ex: 'My family has four people.', exVi: 'Gia đình tôi có bốn người.' },
  { en: 'home', ipa: '/hoʊm/', vi: 'nhà, tổ ấm', pos: 'noun', img: '🏠', connect: 'House là toà nhà, home là tổ ấm.', ex: 'I want to go home now.', exVi: 'Bây giờ tôi muốn về nhà.' },
  { en: 'house', ipa: '/haʊs/', vi: 'ngôi nhà', pos: 'noun', img: '🏡', connect: '"Hau-sờ" — chuột (mouse) sống trong house.', ex: 'They bought a new house.', exVi: 'Họ mua một ngôi nhà mới.' },
  { en: 'school', ipa: '/skuːl/', vi: 'trường học', pos: 'noun', img: '🏫', connect: '"Sờ-kun" — cool nhưng học (school).', ex: 'The children go to school by bus.', exVi: 'Bọn trẻ đến trường bằng xe buýt.' },
  { en: 'work', ipa: '/wɜːrk/', vi: 'công việc', pos: 'noun', img: '💼', connect: 'Work hard — làm việc chăm chỉ.', ex: 'I have a lot of work today.', exVi: 'Hôm nay tôi có nhiều việc.' },
  { en: 'time', ipa: '/taɪm/', vi: 'thời gian', pos: 'noun', img: '⏰', connect: '"Tai-mờ" — Time is money.', ex: 'What time is it?', exVi: 'Mấy giờ rồi?' },
  { en: 'day', ipa: '/deɪ/', vi: 'ngày', pos: 'noun', img: '📅', connect: 'Have a nice day!', ex: 'Today is a beautiful day.', exVi: 'Hôm nay là một ngày đẹp trời.' },
  { en: 'year', ipa: '/jɪr/', vi: 'năm', pos: 'noun', img: '🗓️', connect: '"Diơ" — Happy New Year.', ex: 'I am twenty years old.', exVi: 'Tôi hai mươi tuổi.' },
  { en: 'water', ipa: '/ˈwɔː.tər/', vi: 'nước', pos: 'noun', img: '💧', connect: '"Quó-tờ" — uống water mỗi ngày.', ex: 'Can I have a glass of water?', exVi: 'Cho tôi xin một cốc nước được không?' },
  { en: 'food', ipa: '/fuːd/', vi: 'thức ăn', pos: 'noun', img: '🍱', connect: '"Phút" — food tốt cho good mood.', ex: 'The food here is delicious.', exVi: 'Đồ ăn ở đây rất ngon.' },
  { en: 'rice', ipa: '/raɪs/', vi: 'cơm, gạo', pos: 'noun', img: '🍚', connect: '"Rai-sờ" — người Việt ăn rice.', ex: 'I eat rice every day.', exVi: 'Tôi ăn cơm mỗi ngày.' },
  { en: 'coffee', ipa: '/ˈkɔː.fi/', vi: 'cà phê', pos: 'noun', img: '☕', connect: 'Gần giống "cà phê".', ex: 'She drinks coffee in the morning.', exVi: 'Cô ấy uống cà phê vào buổi sáng.' },
  { en: 'money', ipa: '/ˈmʌn.i/', vi: 'tiền', pos: 'noun', img: '💰', connect: '"Mân-ni" — ai cũng cần money.', ex: 'I do not have enough money.', exVi: 'Tôi không đủ tiền.' },
  { en: 'phone', ipa: '/foʊn/', vi: 'điện thoại', pos: 'noun', img: '📱', connect: 'Smartphone — điện thoại thông minh.', ex: 'My phone battery is low.', exVi: 'Điện thoại tôi sắp hết pin.' },
  { en: 'car', ipa: '/kɑːr/', vi: 'xe hơi', pos: 'noun', img: '🚗', connect: '"Ca" — đi car cho nhanh.', ex: 'He drives a red car.', exVi: 'Anh ấy lái một chiếc xe màu đỏ.' },
  { en: 'book', ipa: '/bʊk/', vi: 'quyển sách', pos: 'noun', img: '📖', connect: '"Búc" — Facebook có chữ book.', ex: 'This book is very interesting.', exVi: 'Quyển sách này rất thú vị.' },
  { en: 'city', ipa: '/ˈsɪt.i/', vi: 'thành phố', pos: 'noun', img: '🏙️', connect: '"Si-ti" — Hồ Chí Minh City.', ex: 'New York is a big city.', exVi: 'New York là một thành phố lớn.' },
  { en: 'country', ipa: '/ˈkʌn.tri/', vi: 'đất nước', pos: 'noun', img: '🌍', connect: '"Kân-tri" — country music nhạc đồng quê.', ex: 'Vietnam is a beautiful country.', exVi: 'Việt Nam là một đất nước xinh đẹp.' },
  { en: 'name', ipa: '/neɪm/', vi: 'tên', pos: 'noun', img: '🪪', connect: 'What is your name?', ex: 'My name is Lan.', exVi: 'Tên tôi là Lan.' },
  { en: 'word', ipa: '/wɜːrd/', vi: 'từ, chữ', pos: 'noun', img: '🔤', connect: 'Learn a new word every day.', ex: 'I learned ten new words today.', exVi: 'Hôm nay tôi học được mười từ mới.' },
  { en: 'place', ipa: '/pleɪs/', vi: 'nơi chốn', pos: 'noun', img: '📍', connect: '"Plây-sờ" — a nice place to eat.', ex: 'This is a quiet place to study.', exVi: 'Đây là nơi yên tĩnh để học.' },
  { en: 'job', ipa: '/dʒɑːb/', vi: 'việc làm', pos: 'noun', img: '🧑‍💻', connect: '"Giốp" — Good job!', ex: 'She has a new job at a bank.', exVi: 'Cô ấy có công việc mới ở ngân hàng.' },
  { en: 'hand', ipa: '/hænd/', vi: 'bàn tay', pos: 'noun', img: '✋', connect: 'Handmade — làm bằng tay.', ex: 'Raise your hand if you know.', exVi: 'Giơ tay lên nếu bạn biết.' },
  { en: 'eye', ipa: '/aɪ/', vi: 'mắt', pos: 'noun', img: '👁️', connect: 'Đọc giống "I" (tôi).', ex: 'Close your eyes and relax.', exVi: 'Nhắm mắt lại và thư giãn.' },
  { en: 'morning', ipa: '/ˈmɔːr.nɪŋ/', vi: 'buổi sáng', pos: 'noun', img: '🌅', connect: 'Good morning!', ex: 'I run every morning.', exVi: 'Tôi chạy bộ mỗi buổi sáng.' },
  { en: 'night', ipa: '/naɪt/', vi: 'ban đêm', pos: 'noun', img: '🌙', connect: 'Good night — chúc ngủ ngon.', ex: 'I read a book at night.', exVi: 'Tôi đọc sách vào ban đêm.' },
  { en: 'street', ipa: '/striːt/', vi: 'đường phố', pos: 'noun', img: '🛣️', connect: '"Sờ-trít" — đi trên street.', ex: 'Be careful when you cross the street.', exVi: 'Cẩn thận khi bạn băng qua đường.' },
]

/* ------------------------------------------------------------------ */
/* 2) ĐỘNG TỪ CỐT LÕI — basic actions                                  */
/* ------------------------------------------------------------------ */

const VERBS: IcesWord[] = [
  { en: 'be', ipa: '/biː/', vi: 'thì, là, ở', pos: 'verb', img: '🐝', connect: 'To be or not to be (đọc như con ong "bee").', ex: 'I am a student.', exVi: 'Tôi là học sinh.' },
  { en: 'have', ipa: '/hæv/', vi: 'có', pos: 'verb', img: '🤲', connect: 'Have a nice day — "có" một ngày đẹp.', ex: 'I have two brothers.', exVi: 'Tôi có hai anh trai.' },
  { en: 'do', ipa: '/duː/', vi: 'làm', pos: 'verb', img: '🛠️', connect: 'What do you do? — Bạn làm gì?', ex: 'What do you do on weekends?', exVi: 'Cuối tuần bạn làm gì?' },
  { en: 'go', ipa: '/ɡoʊ/', vi: 'đi', pos: 'verb', img: '🚶', connect: 'Quá khứ: went.', ex: 'Let us go to the park.', exVi: 'Chúng ta đi công viên nào.' },
  { en: 'come', ipa: '/kʌm/', vi: 'đến', pos: 'verb', img: '🙋', connect: 'Come here — lại đây.', ex: 'Please come to my house tonight.', exVi: 'Tối nay hãy đến nhà tôi nhé.' },
  { en: 'eat', ipa: '/iːt/', vi: 'ăn', pos: 'verb', img: '🍽️', connect: '"Ít" — quá khứ: ate.', ex: 'We eat dinner at seven.', exVi: 'Chúng tôi ăn tối lúc bảy giờ.' },
  { en: 'drink', ipa: '/drɪŋk/', vi: 'uống', pos: 'verb', img: '🥤', connect: 'Drink water — uống nước.', ex: 'Do not drink cold water.', exVi: 'Đừng uống nước lạnh.' },
  { en: 'see', ipa: '/siː/', vi: 'nhìn, thấy', pos: 'verb', img: '👀', connect: 'See you later — hẹn gặp lại.', ex: 'I can see the mountain.', exVi: 'Tôi có thể thấy ngọn núi.' },
  { en: 'know', ipa: '/noʊ/', vi: 'biết', pos: 'verb', img: '🧠', connect: 'K câm — đọc như "no".', ex: 'I know the answer.', exVi: 'Tôi biết câu trả lời.' },
  { en: 'think', ipa: '/θɪŋk/', vi: 'nghĩ', pos: 'verb', img: '💭', connect: 'I think so — tôi nghĩ vậy.', ex: 'I think it will rain.', exVi: 'Tôi nghĩ trời sẽ mưa.' },
  { en: 'want', ipa: '/wɑːnt/', vi: 'muốn', pos: 'verb', img: '🙏', connect: 'I want you — anh muốn em.', ex: 'I want a cup of tea.', exVi: 'Tôi muốn một tách trà.' },
  { en: 'need', ipa: '/niːd/', vi: 'cần', pos: 'verb', img: '❗', connect: '"Nít" — I need help.', ex: 'You need to sleep more.', exVi: 'Bạn cần ngủ nhiều hơn.' },
  { en: 'like', ipa: '/laɪk/', vi: 'thích', pos: 'verb', img: '👍', connect: 'Nút Like trên Facebook.', ex: 'I like Vietnamese food.', exVi: 'Tôi thích món ăn Việt Nam.' },
  { en: 'love', ipa: '/lʌv/', vi: 'yêu', pos: 'verb', img: '❤️', connect: 'I love you.', ex: 'She loves her family.', exVi: 'Cô ấy yêu gia đình mình.' },
  { en: 'make', ipa: '/meɪk/', vi: 'làm, tạo ra', pos: 'verb', img: '🏗️', connect: 'Make a cake — làm bánh.', ex: 'Let us make a plan.', exVi: 'Hãy lập một kế hoạch.' },
  { en: 'work', ipa: '/wɜːrk/', vi: 'làm việc', pos: 'verb', img: '🧑‍🔧', connect: 'It works! — Nó chạy được!', ex: 'I work from nine to five.', exVi: 'Tôi làm việc từ chín giờ đến năm giờ.' },
  { en: 'speak', ipa: '/spiːk/', vi: 'nói', pos: 'verb', img: '🗣️', connect: 'Speaker — loa, người nói.', ex: 'Do you speak English?', exVi: 'Bạn có nói tiếng Anh không?' },
  { en: 'say', ipa: '/seɪ/', vi: 'nói, bảo', pos: 'verb', img: '💬', connect: 'Quá khứ: said /sed/.', ex: 'What did you say?', exVi: 'Bạn vừa nói gì?' },
  { en: 'read', ipa: '/riːd/', vi: 'đọc', pos: 'verb', img: '📚', connect: 'Quá khứ viết giống nhưng đọc /red/.', ex: 'I read the news every morning.', exVi: 'Tôi đọc tin tức mỗi sáng.' },
  { en: 'write', ipa: '/raɪt/', vi: 'viết', pos: 'verb', img: '✍️', connect: 'W câm — đọc giống "right".', ex: 'Please write your name here.', exVi: 'Vui lòng viết tên bạn vào đây.' },
  { en: 'listen', ipa: '/ˈlɪs.ən/', vi: 'lắng nghe', pos: 'verb', img: '👂', connect: 'T câm — "li-sừn".', ex: 'Listen to me carefully.', exVi: 'Hãy lắng nghe tôi cẩn thận.' },
  { en: 'learn', ipa: '/lɜːrn/', vi: 'học', pos: 'verb', img: '🎓', connect: 'Learn English — học tiếng Anh.', ex: 'I want to learn how to swim.', exVi: 'Tôi muốn học bơi.' },
  { en: 'help', ipa: '/help/', vi: 'giúp đỡ', pos: 'verb', img: '🆘', connect: 'Help me! — Cứu tôi!', ex: 'Can you help me, please?', exVi: 'Bạn giúp tôi được không?' },
  { en: 'give', ipa: '/ɡɪv/', vi: 'cho, đưa', pos: 'verb', img: '🎁', connect: 'Give and take — cho và nhận.', ex: 'Please give me the book.', exVi: 'Làm ơn đưa tôi quyển sách.' },
  { en: 'take', ipa: '/teɪk/', vi: 'lấy, cầm', pos: 'verb', img: '🤏', connect: 'Take a photo — chụp ảnh.', ex: 'Take an umbrella with you.', exVi: 'Hãy mang theo một chiếc ô.' },
  { en: 'buy', ipa: '/baɪ/', vi: 'mua', pos: 'verb', img: '🛒', connect: 'Đọc giống "bye". Quá khứ: bought.', ex: 'I want to buy a new shirt.', exVi: 'Tôi muốn mua một chiếc áo mới.' },
  { en: 'use', ipa: '/juːz/', vi: 'dùng, sử dụng', pos: 'verb', img: '🧰', connect: '"Diu-zờ" — useful = hữu ích.', ex: 'Can I use your pen?', exVi: 'Tôi dùng bút của bạn được không?' },
  { en: 'find', ipa: '/faɪnd/', vi: 'tìm thấy', pos: 'verb', img: '🔎', connect: 'Quá khứ: found.', ex: 'I cannot find my keys.', exVi: 'Tôi không tìm thấy chìa khóa.' },
  { en: 'open', ipa: '/ˈoʊ.pən/', vi: 'mở', pos: 'verb', img: '🚪', connect: 'Open the door — mở cửa.', ex: 'Please open the window.', exVi: 'Làm ơn mở cửa sổ.' },
  { en: 'sleep', ipa: '/sliːp/', vi: 'ngủ', pos: 'verb', img: '😴', connect: '"Sờ-líp" — ngủ ngon.', ex: 'I sleep eight hours a night.', exVi: 'Tôi ngủ tám tiếng mỗi đêm.' },
]

/* ------------------------------------------------------------------ */
/* 3) TỪ ĐỂ HỎI — who, what, where, when, why, how                      */
/* ------------------------------------------------------------------ */

const QUESTIONS: IcesWord[] = [
  { en: 'who', ipa: '/huː/', vi: 'ai', pos: 'question', img: '🙋', connect: 'W câm — đọc "hu". Hỏi về người.', ex: 'Who is that man?', exVi: 'Người đàn ông đó là ai?' },
  { en: 'what', ipa: '/wɑːt/', vi: 'cái gì', pos: 'question', img: '❓', connect: 'What is this? — Đây là cái gì?', ex: 'What is your name?', exVi: 'Tên bạn là gì?' },
  { en: 'where', ipa: '/wer/', vi: 'ở đâu', pos: 'question', img: '📍', connect: 'Hỏi về nơi chốn (place).', ex: 'Where do you live?', exVi: 'Bạn sống ở đâu?' },
  { en: 'when', ipa: '/wen/', vi: 'khi nào', pos: 'question', img: '🕐', connect: 'Hỏi về thời gian (time).', ex: 'When is your birthday?', exVi: 'Sinh nhật bạn khi nào?' },
  { en: 'why', ipa: '/waɪ/', vi: 'tại sao', pos: 'question', img: '🤔', connect: 'Why? — Trả lời bằng "because".', ex: 'Why are you late?', exVi: 'Tại sao bạn đến muộn?' },
  { en: 'how', ipa: '/haʊ/', vi: 'như thế nào', pos: 'question', img: '⚙️', connect: 'How are you? — Bạn khỏe không?', ex: 'How do you go to work?', exVi: 'Bạn đi làm bằng cách nào?' },
  { en: 'which', ipa: '/wɪtʃ/', vi: 'cái nào', pos: 'question', img: '🔀', connect: 'Chọn lựa giữa các thứ.', ex: 'Which color do you like?', exVi: 'Bạn thích màu nào?' },
  { en: 'whose', ipa: '/huːz/', vi: 'của ai', pos: 'question', img: '🧳', connect: 'Hỏi về sở hữu.', ex: 'Whose bag is this?', exVi: 'Đây là túi của ai?' },
  { en: 'how much', ipa: '/haʊ mʌtʃ/', vi: 'bao nhiêu (tiền)', pos: 'question', img: '💵', connect: 'Hỏi giá / lượng không đếm được.', ex: 'How much is this shirt?', exVi: 'Chiếc áo này giá bao nhiêu?' },
  { en: 'how many', ipa: '/haʊ ˈmen.i/', vi: 'bao nhiêu (cái)', pos: 'question', img: '🔢', connect: 'Hỏi số lượng đếm được.', ex: 'How many people are here?', exVi: 'Có bao nhiêu người ở đây?' },
]

/* ------------------------------------------------------------------ */
/* 4) TÍNH TỪ ỨNG DỤNG CAO — good, bad, big, small, happy, tired...     */
/* ------------------------------------------------------------------ */

const ADJ: IcesWord[] = [
  { en: 'good', ipa: '/ɡʊd/', vi: 'tốt, giỏi', pos: 'adj', img: '👍', connect: 'Good job! So sánh hơn: better.', ex: 'This is a good idea.', exVi: 'Đây là một ý hay.' },
  { en: 'bad', ipa: '/bæd/', vi: 'xấu, tệ', pos: 'adj', img: '👎', connect: 'So sánh hơn: worse.', ex: 'The weather is bad today.', exVi: 'Hôm nay thời tiết xấu.' },
  { en: 'big', ipa: '/bɪɡ/', vi: 'to, lớn', pos: 'adj', img: '🐘', connect: 'A big elephant — con voi to.', ex: 'They live in a big house.', exVi: 'Họ sống trong một ngôi nhà lớn.' },
  { en: 'small', ipa: '/smɔːl/', vi: 'nhỏ', pos: 'adj', img: '🐜', connect: 'Trái nghĩa với big.', ex: 'I have a small dog.', exVi: 'Tôi có một con chó nhỏ.' },
  { en: 'happy', ipa: '/ˈhæp.i/', vi: 'vui, hạnh phúc', pos: 'adj', img: '😄', connect: 'Happy birthday!', ex: 'I am happy to see you.', exVi: 'Tôi vui khi gặp bạn.' },
  { en: 'sad', ipa: '/sæd/', vi: 'buồn', pos: 'adj', img: '😢', connect: 'Trái nghĩa với happy.', ex: 'She looks sad today.', exVi: 'Hôm nay cô ấy trông buồn.' },
  { en: 'tired', ipa: '/ˈtaɪərd/', vi: 'mệt mỏi', pos: 'adj', img: '🥱', connect: '"Tai-ợd" — sau khi làm việc.', ex: 'I am tired after work.', exVi: 'Tôi mệt sau khi làm việc.' },
  { en: 'hot', ipa: '/hɑːt/', vi: 'nóng', pos: 'adj', img: '🔥', connect: 'Hot coffee — cà phê nóng.', ex: 'It is very hot in summer.', exVi: 'Mùa hè trời rất nóng.' },
  { en: 'cold', ipa: '/koʊld/', vi: 'lạnh', pos: 'adj', img: '❄️', connect: 'Trái nghĩa với hot.', ex: 'The water is too cold.', exVi: 'Nước lạnh quá.' },
  { en: 'new', ipa: '/nuː/', vi: 'mới', pos: 'adj', img: '✨', connect: 'New phone — điện thoại mới.', ex: 'I bought a new car.', exVi: 'Tôi mua một chiếc xe mới.' },
  { en: 'old', ipa: '/oʊld/', vi: 'cũ, già', pos: 'adj', img: '👴', connect: 'How old are you?', ex: 'This is an old book.', exVi: 'Đây là một quyển sách cũ.' },
  { en: 'easy', ipa: '/ˈiː.zi/', vi: 'dễ', pos: 'adj', img: '🟢', connect: 'Easy peasy — dễ ợt.', ex: 'This test is easy.', exVi: 'Bài kiểm tra này dễ.' },
  { en: 'hard', ipa: '/hɑːrd/', vi: 'khó, cứng', pos: 'adj', img: '🧱', connect: 'Hard work — việc khó.', ex: 'Korean is hard to learn.', exVi: 'Tiếng Hàn khó học.' },
  { en: 'fast', ipa: '/fæst/', vi: 'nhanh', pos: 'adj', img: '⚡', connect: 'Fast food — đồ ăn nhanh.', ex: 'He is a fast runner.', exVi: 'Anh ấy chạy nhanh.' },
  { en: 'slow', ipa: '/sloʊ/', vi: 'chậm', pos: 'adj', img: '🐢', connect: 'Trái nghĩa với fast.', ex: 'The internet is slow today.', exVi: 'Hôm nay mạng chậm.' },
  { en: 'beautiful', ipa: '/ˈbjuː.tɪ.fəl/', vi: 'đẹp', pos: 'adj', img: '🌸', connect: 'Beauty + ful = đầy vẻ đẹp.', ex: 'What a beautiful sunset!', exVi: 'Hoàng hôn đẹp quá!' },
  { en: 'hungry', ipa: '/ˈhʌŋ.ɡri/', vi: 'đói', pos: 'adj', img: '🍽️', connect: '"Hâng-gri" — Are you hungry?', ex: 'I am very hungry now.', exVi: 'Bây giờ tôi rất đói.' },
  { en: 'expensive', ipa: '/ɪkˈspen.sɪv/', vi: 'đắt', pos: 'adj', img: '💎', connect: 'Spend nhiều = expensive.', ex: 'This phone is too expensive.', exVi: 'Điện thoại này đắt quá.' },
  { en: 'cheap', ipa: '/tʃiːp/', vi: 'rẻ', pos: 'adj', img: '🏷️', connect: 'Trái nghĩa với expensive.', ex: 'The food here is cheap.', exVi: 'Đồ ăn ở đây rẻ.' },
  { en: 'delicious', ipa: '/dɪˈlɪʃ.əs/', vi: 'ngon', pos: 'adj', img: '😋', connect: 'Khen món ăn ngon.', ex: 'This soup is delicious.', exVi: 'Món súp này rất ngon.' },
  { en: 'important', ipa: '/ɪmˈpɔːr.tənt/', vi: 'quan trọng', pos: 'adj', img: '⭐', connect: 'Im-por-tần.', ex: 'Sleep is important for health.', exVi: 'Giấc ngủ quan trọng cho sức khỏe.' },
  { en: 'busy', ipa: '/ˈbɪz.i/', vi: 'bận', pos: 'adj', img: '🏃', connect: '"Bi-zi" — I am busy.', ex: 'I am busy this week.', exVi: 'Tuần này tôi bận.' },
  { en: 'free', ipa: '/friː/', vi: 'rảnh, miễn phí', pos: 'adj', img: '🆓', connect: 'Free wifi — wifi miễn phí.', ex: 'Are you free tomorrow?', exVi: 'Mai bạn rảnh không?' },
  { en: 'right', ipa: '/raɪt/', vi: 'đúng, bên phải', pos: 'adj', img: '✅', connect: 'You are right — bạn đúng.', ex: 'Your answer is right.', exVi: 'Câu trả lời của bạn đúng.' },
  { en: 'long', ipa: '/lɔːŋ/', vi: 'dài, lâu', pos: 'adj', img: '📏', connect: 'A long time — một thời gian dài.', ex: 'It was a long day.', exVi: 'Đó là một ngày dài.' },
]

export const UNITS: VocabUnit[] = [
  { id: 'nouns', name: 'Danh từ cốt lõi', sub: 'Người, đồ vật, đồ ăn quanh ta', pos: 'noun', tone: 'tone-a', emoji: '🧩', words: NOUNS },
  { id: 'verbs', name: 'Động từ cốt lõi', sub: 'Những hành động dùng mỗi ngày', pos: 'verb', tone: 'tone-c', emoji: '🏃', words: VERBS },
  { id: 'questions', name: 'Từ để hỏi', sub: 'Who, What, Where, When, Why, How', pos: 'question', tone: 'tone-d', emoji: '❓', words: QUESTIONS },
  { id: 'adjectives', name: 'Tính từ ứng dụng cao', sub: 'Good, bad, big, small, happy…', pos: 'adj', tone: 'tone-e', emoji: '🎨', words: ADJ },
]

export const ALL_WORDS: IcesWord[] = UNITS.flatMap((u) => u.words)

/** Tổng số từ trong mục tiêu chương trình (đích 3000 từ để hiểu 90% hội thoại). */
export const TARGET_WORDS = 3000

/* ---------------------- KẾ HOẠCH 3 THÁNG (12 tuần) ---------------------- */

export interface WeekPlan {
  week: number
  month: 1 | 2 | 3
  phase: 'Compress' | 'Compile' | 'Consolidate'
  title: string
  focus: string
}

export const PLAN_12_WEEKS: WeekPlan[] = [
  { week: 1, month: 1, phase: 'Compress', title: 'Danh từ quanh ta', focus: 'Người, gia đình, đồ vật, nơi chốn cơ bản.' },
  { week: 2, month: 1, phase: 'Compress', title: 'Đồ ăn & thời gian', focus: 'Food, water, day, time — chủ đề sinh hoạt.' },
  { week: 3, month: 1, phase: 'Compress', title: 'Từ để hỏi', focus: '5W1H: who/what/where/when/why/how.' },
  { week: 4, month: 1, phase: 'Compress', title: 'Tính từ thiết yếu', focus: 'good/bad, big/small, happy/tired…' },
  { week: 5, month: 2, phase: 'Compile', title: 'Động từ hành động', focus: 'go, eat, see, do, have — ghép câu đơn.' },
  { week: 6, month: 2, phase: 'Compile', title: 'Ghép câu cơ bản', focus: 'S + V + O và câu hỏi Yes/No.' },
  { week: 7, month: 2, phase: 'Compile', title: 'Hỏi & đáp đời sống', focus: 'Đặt câu hỏi với 5W1H trong tình huống thật.' },
  { week: 8, month: 2, phase: 'Compile', title: 'Mô tả người & vật', focus: 'Dùng tính từ + danh từ để miêu tả.' },
  { week: 9, month: 3, phase: 'Consolidate', title: 'Ôn tập ngắt quãng', focus: 'SRS toàn bộ từ đã học, lấp lỗ hổng.' },
  { week: 10, month: 3, phase: 'Consolidate', title: 'Nghe & nhại (shadowing)', focus: 'Luyện nghe – nói qua video thật.' },
  { week: 11, month: 3, phase: 'Consolidate', title: 'Hội thoại chủ đề', focus: 'Áp dụng vào tình huống du lịch, công việc.' },
  { week: 12, month: 3, phase: 'Consolidate', title: 'Tổng kết & kiểm tra', focus: 'Quiz tổng hợp, xuất từ vựng ra Word/PDF.' },
]
