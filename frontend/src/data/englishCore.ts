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

export type WordPos = 'noun' | 'verb' | 'adj' | 'question' | 'phrase' | 'adverb' | 'prep'

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

/* ------------------------------------------------------------------ */
/* 5) DANH TỪ NƠI CHỐN & ĐỜI SỐNG — places, transport, time, weather    */
/* ------------------------------------------------------------------ */

const NOUNS2: IcesWord[] = [
  { en: 'airport', ipa: '/ˈer.pɔːrt/', vi: 'sân bay', pos: 'noun', img: '✈️', connect: 'Air (không khí) + port (cảng) = cảng hàng không.', ex: 'We arrived at the airport at six.', exVi: 'Chúng tôi đến sân bay lúc sáu giờ.' },
  { en: 'hospital', ipa: '/ˈhɑː.spɪ.təl/', vi: 'bệnh viện', pos: 'noun', img: '🏥', connect: '"Hót-xpi-tồ" — nơi có bác sĩ.', ex: 'My grandmother is in the hospital.', exVi: 'Bà tôi đang nằm viện.' },
  { en: 'restaurant', ipa: '/ˈres.tə.rɑːnt/', vi: 'nhà hàng', pos: 'noun', img: '🍽️', connect: '"Rét-tơ-ràn" — nơi ăn ngon.', ex: 'This restaurant serves good pho.', exVi: 'Nhà hàng này bán phở ngon.' },
  { en: 'hotel', ipa: '/hoʊˈtel/', vi: 'khách sạn', pos: 'noun', img: '🏨', connect: '"Hâu-teo" — nhấn âm sau.', ex: 'We stayed at a small hotel.', exVi: 'Chúng tôi ở một khách sạn nhỏ.' },
  { en: 'market', ipa: '/ˈmɑːr.kɪt/', vi: 'chợ', pos: 'noun', img: '🧺', connect: 'Supermarket = siêu thị.', ex: 'Mom goes to the market every morning.', exVi: 'Mẹ đi chợ mỗi sáng.' },
  { en: 'store', ipa: '/stɔːr/', vi: 'cửa hàng', pos: 'noun', img: '🏪', connect: 'App Store — "cửa hàng" ứng dụng.', ex: 'The store opens at eight.', exVi: 'Cửa hàng mở lúc tám giờ.' },
  { en: 'station', ipa: '/ˈsteɪ.ʃən/', vi: 'nhà ga, trạm', pos: 'noun', img: '🚉', connect: 'Bus station, train station.', ex: 'Meet me at the train station.', exVi: 'Gặp tôi ở ga tàu nhé.' },
  { en: 'bus', ipa: '/bʌs/', vi: 'xe buýt', pos: 'noun', img: '🚌', connect: 'Xe buýt — mượn từ "bus" luôn.', ex: 'I take the bus to school.', exVi: 'Tôi đi học bằng xe buýt.' },
  { en: 'train', ipa: '/treɪn/', vi: 'tàu hỏa', pos: 'noun', img: '🚆', connect: 'Training — train còn là "luyện tập".', ex: 'The train leaves at nine.', exVi: 'Tàu rời ga lúc chín giờ.' },
  { en: 'plane', ipa: '/pleɪn/', vi: 'máy bay', pos: 'noun', img: '🛫', connect: 'Viết tắt của airplane.', ex: 'The plane lands in two hours.', exVi: 'Máy bay hạ cánh sau hai giờ nữa.' },
  { en: 'room', ipa: '/ruːm/', vi: 'căn phòng', pos: 'noun', img: '🛏️', connect: 'Living room, bedroom.', ex: 'My room is small but clean.', exVi: 'Phòng tôi nhỏ nhưng sạch.' },
  { en: 'door', ipa: '/dɔːr/', vi: 'cửa', pos: 'noun', img: '🚪', connect: '"Đo" — mở door ra.', ex: 'Please close the door.', exVi: 'Làm ơn đóng cửa.' },
  { en: 'window', ipa: '/ˈwɪn.doʊ/', vi: 'cửa sổ', pos: 'noun', img: '🪟', connect: 'Windows máy tính = những "cửa sổ".', ex: 'Open the window, it is hot.', exVi: 'Mở cửa sổ đi, trời nóng.' },
  { en: 'table', ipa: '/ˈteɪ.bəl/', vi: 'cái bàn', pos: 'noun', img: '🍽️', connect: '"Thây-bồ" — bàn ăn.', ex: 'The food is on the table.', exVi: 'Đồ ăn ở trên bàn.' },
  { en: 'chair', ipa: '/tʃer/', vi: 'cái ghế', pos: 'noun', img: '🪑', connect: '"Che" — ngồi ghế nghỉ chân.', ex: 'This chair is comfortable.', exVi: 'Cái ghế này ngồi thoải mái.' },
  { en: 'bed', ipa: '/bed/', vi: 'cái giường', pos: 'noun', img: '🛌', connect: 'Go to bed — đi ngủ.', ex: 'I go to bed at eleven.', exVi: 'Tôi đi ngủ lúc mười một giờ.' },
  { en: 'kitchen', ipa: '/ˈkɪtʃ.ən/', vi: 'nhà bếp', pos: 'noun', img: '🍳', connect: '"Kít-chừn" — nơi nấu ăn.', ex: 'She is cooking in the kitchen.', exVi: 'Cô ấy đang nấu ăn trong bếp.' },
  { en: 'bathroom', ipa: '/ˈbæθ.ruːm/', vi: 'nhà vệ sinh', pos: 'noun', img: '🚿', connect: 'Bath (tắm) + room (phòng).', ex: 'Where is the bathroom?', exVi: 'Nhà vệ sinh ở đâu?' },
  { en: 'week', ipa: '/wiːk/', vi: 'tuần', pos: 'noun', img: '📆', connect: 'Weekend = cuối tuần.', ex: 'See you next week.', exVi: 'Hẹn gặp bạn tuần sau.' },
  { en: 'month', ipa: '/mʌnθ/', vi: 'tháng', pos: 'noun', img: '🗓️', connect: '"Măn-thờ" — 12 months một năm.', ex: 'I will travel next month.', exVi: 'Tháng sau tôi sẽ đi du lịch.' },
  { en: 'weekend', ipa: '/ˈwiːk.end/', vi: 'cuối tuần', pos: 'noun', img: '🎉', connect: 'Week + end = cuối tuần.', ex: 'What do you do on weekends?', exVi: 'Cuối tuần bạn làm gì?' },
  { en: 'birthday', ipa: '/ˈbɜːrθ.deɪ/', vi: 'sinh nhật', pos: 'noun', img: '🎂', connect: 'Birth (sinh) + day (ngày).', ex: 'My birthday is in May.', exVi: 'Sinh nhật tôi vào tháng Năm.' },
  { en: 'party', ipa: '/ˈpɑːr.ti/', vi: 'bữa tiệc', pos: 'noun', img: '🥳', connect: '"Pa-ti" — tiệc tùng.', ex: 'We are having a party tonight.', exVi: 'Tối nay chúng tôi mở tiệc.' },
  { en: 'music', ipa: '/ˈmjuː.zɪk/', vi: 'âm nhạc', pos: 'noun', img: '🎵', connect: '"Miu-dík" — nghe nhạc mỗi ngày.', ex: 'I listen to music every day.', exVi: 'Tôi nghe nhạc mỗi ngày.' },
  { en: 'movie', ipa: '/ˈmuː.vi/', vi: 'bộ phim', pos: 'noun', img: '🎬', connect: '"Mu-vi" — phim chiếu rạp.', ex: 'Let us watch a movie tonight.', exVi: 'Tối nay xem phim nhé.' },
  { en: 'game', ipa: '/ɡeɪm/', vi: 'trò chơi', pos: 'noun', img: '🎮', connect: 'Chơi game — quen thuộc rồi!', ex: 'Football is a fun game.', exVi: 'Bóng đá là một trò chơi vui.' },
  { en: 'weather', ipa: '/ˈweð.ər/', vi: 'thời tiết', pos: 'noun', img: '⛅', connect: '"Que-thờ" — nói chuyện thời tiết để bắt chuyện.', ex: 'The weather is nice today.', exVi: 'Hôm nay thời tiết đẹp.' },
  { en: 'rain', ipa: '/reɪn/', vi: 'mưa', pos: 'noun', img: '🌧️', connect: 'Rainbow = cầu vồng (sau mưa).', ex: 'It will rain this afternoon.', exVi: 'Chiều nay trời sẽ mưa.' },
  { en: 'question', ipa: '/ˈkwes.tʃən/', vi: 'câu hỏi', pos: 'noun', img: '❓', connect: 'Question mark = dấu chấm hỏi.', ex: 'Can I ask you a question?', exVi: 'Tôi hỏi bạn một câu được không?' },
  { en: 'answer', ipa: '/ˈæn.sər/', vi: 'câu trả lời', pos: 'noun', img: '✅', connect: 'W câm — đọc "en-xờ".', ex: 'I do not know the answer.', exVi: 'Tôi không biết câu trả lời.' },
  { en: 'problem', ipa: '/ˈprɑː.bləm/', vi: 'vấn đề', pos: 'noun', img: '⚠️', connect: 'No problem! — Không sao!', ex: 'We have a small problem.', exVi: 'Chúng ta có một vấn đề nhỏ.' },
  { en: 'idea', ipa: '/aɪˈdiː.ə/', vi: 'ý tưởng', pos: 'noun', img: '💡', connect: '"Ai-đia" — nảy ra ý tưởng.', ex: 'That is a great idea!', exVi: 'Đó là một ý tưởng tuyệt vời!' },
]

/* ------------------------------------------------------------------ */
/* 6) ĐỘNG TỪ GIAO TIẾP & SINH HOẠT — daily interactions                */
/* ------------------------------------------------------------------ */

const VERBS2: IcesWord[] = [
  { en: 'ask', ipa: '/æsk/', vi: 'hỏi', pos: 'verb', img: '🙋', connect: 'Ask a question — đặt câu hỏi.', ex: 'Can I ask you something?', exVi: 'Tôi hỏi bạn chút được không?' },
  { en: 'tell', ipa: '/tel/', vi: 'kể, bảo', pos: 'verb', img: '🗨️', connect: 'Tell me — kể tôi nghe. Quá khứ: told.', ex: 'Tell me about your day.', exVi: 'Kể tôi nghe về ngày của bạn đi.' },
  { en: 'talk', ipa: '/tɔːk/', vi: 'nói chuyện', pos: 'verb', img: '💬', connect: '"Tóc" — L câm.', ex: 'We talked for two hours.', exVi: 'Chúng tôi nói chuyện suốt hai tiếng.' },
  { en: 'meet', ipa: '/miːt/', vi: 'gặp gỡ', pos: 'verb', img: '🤝', connect: 'Nice to meet you! Quá khứ: met.', ex: 'Let us meet at the cafe.', exVi: 'Gặp nhau ở quán cà phê nhé.' },
  { en: 'call', ipa: '/kɔːl/', vi: 'gọi điện', pos: 'verb', img: '📞', connect: 'Call me — gọi cho tôi nhé.', ex: 'I will call you tomorrow.', exVi: 'Mai tôi sẽ gọi cho bạn.' },
  { en: 'wait', ipa: '/weɪt/', vi: 'chờ đợi', pos: 'verb', img: '⏳', connect: 'Wait a minute — chờ chút.', ex: 'Please wait for me.', exVi: 'Làm ơn chờ tôi.' },
  { en: 'walk', ipa: '/wɔːk/', vi: 'đi bộ', pos: 'verb', img: '🚶', connect: 'L câm — đọc "guóc".', ex: 'I walk to work every day.', exVi: 'Tôi đi bộ đi làm mỗi ngày.' },
  { en: 'run', ipa: '/rʌn/', vi: 'chạy', pos: 'verb', img: '🏃', connect: 'Quá khứ: ran.', ex: 'He runs very fast.', exVi: 'Anh ấy chạy rất nhanh.' },
  { en: 'sit', ipa: '/sɪt/', vi: 'ngồi', pos: 'verb', img: '🪑', connect: 'Sit down — ngồi xuống.', ex: 'Please sit here.', exVi: 'Mời ngồi đây.' },
  { en: 'stand', ipa: '/stænd/', vi: 'đứng', pos: 'verb', img: '🧍', connect: 'Stand up — đứng lên.', ex: 'Do not stand in the rain.', exVi: 'Đừng đứng dưới mưa.' },
  { en: 'play', ipa: '/pleɪ/', vi: 'chơi', pos: 'verb', img: '⚽', connect: 'Play games, play football.', ex: 'The children are playing outside.', exVi: 'Bọn trẻ đang chơi bên ngoài.' },
  { en: 'watch', ipa: '/wɑːtʃ/', vi: 'xem', pos: 'verb', img: '📺', connect: 'Watch TV; watch còn là đồng hồ đeo tay.', ex: 'I watch videos to learn English.', exVi: 'Tôi xem video để học tiếng Anh.' },
  { en: 'look', ipa: '/lʊk/', vi: 'nhìn', pos: 'verb', img: '👀', connect: 'Look at me — nhìn tôi này.', ex: 'Look at that beautiful bird!', exVi: 'Nhìn con chim đẹp kìa!' },
  { en: 'live', ipa: '/lɪv/', vi: 'sống, ở', pos: 'verb', img: '🏠', connect: 'Live show — phát "sống".', ex: 'Where do you live?', exVi: 'Bạn sống ở đâu?' },
  { en: 'stay', ipa: '/steɪ/', vi: 'ở lại', pos: 'verb', img: '🛎️', connect: 'Stay home — ở nhà.', ex: 'We stayed at home all day.', exVi: 'Chúng tôi ở nhà cả ngày.' },
  { en: 'leave', ipa: '/liːv/', vi: 'rời đi', pos: 'verb', img: '👋', connect: 'Quá khứ: left.', ex: 'The bus leaves at seven.', exVi: 'Xe buýt rời bến lúc bảy giờ.' },
  { en: 'arrive', ipa: '/əˈraɪv/', vi: 'đến nơi', pos: 'verb', img: '🛬', connect: '"Ơ-rai-vờ" — arrival = sự đến.', ex: 'We arrived home late.', exVi: 'Chúng tôi về đến nhà muộn.' },
  { en: 'start', ipa: '/stɑːrt/', vi: 'bắt đầu', pos: 'verb', img: '▶️', connect: 'Nút Start — bắt đầu.', ex: 'The movie starts at eight.', exVi: 'Phim bắt đầu lúc tám giờ.' },
  { en: 'finish', ipa: '/ˈfɪn.ɪʃ/', vi: 'hoàn thành', pos: 'verb', img: '🏁', connect: '"Phi-nís" — về đích (finish line).', ex: 'I finished my homework.', exVi: 'Tôi làm xong bài tập rồi.' },
  { en: 'stop', ipa: '/stɑːp/', vi: 'dừng lại', pos: 'verb', img: '🛑', connect: 'Bus stop — trạm dừng xe buýt.', ex: 'The rain stopped.', exVi: 'Mưa tạnh rồi.' },
  { en: 'try', ipa: '/traɪ/', vi: 'thử, cố gắng', pos: 'verb', img: '💪', connect: 'Try your best — cố hết sức.', ex: 'Try this food, it is delicious.', exVi: 'Thử món này đi, ngon lắm.' },
  { en: 'pay', ipa: '/peɪ/', vi: 'trả tiền', pos: 'verb', img: '💳', connect: 'Quá khứ: paid.', ex: 'I will pay for dinner.', exVi: 'Để tôi trả tiền bữa tối.' },
  { en: 'sell', ipa: '/sel/', vi: 'bán', pos: 'verb', img: '🏷️', connect: 'Trái nghĩa với buy. Quá khứ: sold.', ex: 'They sell fresh fruit here.', exVi: 'Ở đây bán trái cây tươi.' },
  { en: 'cook', ipa: '/kʊk/', vi: 'nấu ăn', pos: 'verb', img: '👨‍🍳', connect: 'Cook cũng là "đầu bếp".', ex: 'My father cooks very well.', exVi: 'Bố tôi nấu ăn rất ngon.' },
  { en: 'clean', ipa: '/kliːn/', vi: 'dọn dẹp', pos: 'verb', img: '🧹', connect: 'Vừa là động từ vừa là tính từ (sạch).', ex: 'I clean my room on Sundays.', exVi: 'Chủ nhật tôi dọn phòng.' },
  { en: 'wash', ipa: '/wɑːʃ/', vi: 'rửa, giặt', pos: 'verb', img: '🧼', connect: 'Wash your hands — rửa tay.', ex: 'Wash your hands before eating.', exVi: 'Rửa tay trước khi ăn.' },
  { en: 'wear', ipa: '/wer/', vi: 'mặc, đeo', pos: 'verb', img: '👕', connect: 'Quá khứ: wore.', ex: 'She is wearing a red dress.', exVi: 'Cô ấy đang mặc váy đỏ.' },
  { en: 'drive', ipa: '/draɪv/', vi: 'lái xe', pos: 'verb', img: '🚗', connect: 'Driver = tài xế. Quá khứ: drove.', ex: 'He drives to work.', exVi: 'Anh ấy lái xe đi làm.' },
  { en: 'remember', ipa: '/rɪˈmem.bər/', vi: 'nhớ', pos: 'verb', img: '🧠', connect: '"Ri-mem-bờ" — nhớ lại.', ex: 'I remember your name.', exVi: 'Tôi nhớ tên bạn.' },
  { en: 'forget', ipa: '/fərˈɡet/', vi: 'quên', pos: 'verb', img: '🫥', connect: 'Trái nghĩa với remember. Quá khứ: forgot.', ex: 'Do not forget your keys.', exVi: 'Đừng quên chìa khóa nhé.' },
  { en: 'understand', ipa: '/ˌʌn.dərˈstænd/', vi: 'hiểu', pos: 'verb', img: '💡', connect: 'Quá khứ: understood.', ex: 'Do you understand me?', exVi: 'Bạn có hiểu tôi không?' },
]

/* ------------------------------------------------------------------ */
/* 7) TRẠNG TỪ & TẦN SUẤT — time & frequency                            */
/* ------------------------------------------------------------------ */

const ADVERBS: IcesWord[] = [
  { en: 'now', ipa: '/naʊ/', vi: 'bây giờ', pos: 'adverb', img: '⏱️', connect: 'Right now — ngay bây giờ.', ex: 'I am busy now.', exVi: 'Bây giờ tôi đang bận.' },
  { en: 'today', ipa: '/təˈdeɪ/', vi: 'hôm nay', pos: 'adverb', img: '📅', connect: 'To + day — ngày này.', ex: 'Today is Monday.', exVi: 'Hôm nay là thứ Hai.' },
  { en: 'tomorrow', ipa: '/təˈmɔːr.oʊ/', vi: 'ngày mai', pos: 'adverb', img: '🌄', connect: '"Tơ-mo-râu" — ngày mai.', ex: 'See you tomorrow!', exVi: 'Hẹn gặp ngày mai!' },
  { en: 'yesterday', ipa: '/ˈjes.tər.deɪ/', vi: 'hôm qua', pos: 'adverb', img: '🌆', connect: 'Bài hát Yesterday của The Beatles.', ex: 'I was sick yesterday.', exVi: 'Hôm qua tôi bị ốm.' },
  { en: 'always', ipa: '/ˈɔːl.weɪz/', vi: 'luôn luôn', pos: 'adverb', img: '🔁', connect: 'All + ways — mọi lúc (100%).', ex: 'She always gets up early.', exVi: 'Cô ấy luôn dậy sớm.' },
  { en: 'usually', ipa: '/ˈjuː.ʒu.əl.i/', vi: 'thường thường', pos: 'adverb', img: '🕗', connect: 'Thường xuyên (~80%).', ex: 'I usually walk to school.', exVi: 'Tôi thường đi bộ đến trường.' },
  { en: 'often', ipa: '/ˈɔː.fən/', vi: 'hay, thường', pos: 'adverb', img: '📈', connect: 'T thường câm — "o-phừn" (~60%).', ex: 'We often eat out.', exVi: 'Chúng tôi hay ăn ngoài.' },
  { en: 'sometimes', ipa: '/ˈsʌm.taɪmz/', vi: 'thỉnh thoảng', pos: 'adverb', img: '🎲', connect: 'Some + times — vài lần (~30%).', ex: 'Sometimes I cook dinner.', exVi: 'Thỉnh thoảng tôi nấu bữa tối.' },
  { en: 'never', ipa: '/ˈnev.ər/', vi: 'không bao giờ', pos: 'adverb', img: '🚫', connect: '0% — Never give up!', ex: 'He never drinks coffee.', exVi: 'Anh ấy không bao giờ uống cà phê.' },
  { en: 'here', ipa: '/hɪr/', vi: 'ở đây', pos: 'adverb', img: '📍', connect: 'Come here — lại đây.', ex: 'Please sign here.', exVi: 'Vui lòng ký vào đây.' },
  { en: 'there', ipa: '/ðer/', vi: 'ở kia, đằng kia', pos: 'adverb', img: '➡️', connect: 'Trái nghĩa với here.', ex: 'The bank is over there.', exVi: 'Ngân hàng ở đằng kia.' },
  { en: 'very', ipa: '/ˈver.i/', vi: 'rất', pos: 'adverb', img: '🔥', connect: 'Very good — rất tốt.', ex: 'This coffee is very hot.', exVi: 'Cà phê này rất nóng.' },
  { en: 'too', ipa: '/tuː/', vi: 'cũng; quá', pos: 'adverb', img: '➕', connect: 'Me too — tôi cũng vậy; too + tính từ = quá.', ex: 'This shirt is too big.', exVi: 'Cái áo này quá rộng.' },
  { en: 'also', ipa: '/ˈɔːl.soʊ/', vi: 'cũng', pos: 'adverb', img: '🟰', connect: '"Ôn-xâu" — đứng trước động từ.', ex: 'I also like this song.', exVi: 'Tôi cũng thích bài hát này.' },
  { en: 'again', ipa: '/əˈɡen/', vi: 'lại, lần nữa', pos: 'adverb', img: '🔄', connect: 'Try again — thử lại.', ex: 'Please say that again.', exVi: 'Làm ơn nói lại lần nữa.' },
  { en: 'together', ipa: '/təˈɡeð.ər/', vi: 'cùng nhau', pos: 'adverb', img: '👫', connect: '"Tu-ghe-thờ" — cùng nhau.', ex: 'Let us study together.', exVi: 'Chúng ta học cùng nhau nhé.' },
  { en: 'soon', ipa: '/suːn/', vi: 'sớm, sắp', pos: 'adverb', img: '⏩', connect: 'See you soon — hẹn sớm gặp lại.', ex: 'The bus will come soon.', exVi: 'Xe buýt sắp đến rồi.' },
  { en: 'early', ipa: '/ˈɜːr.li/', vi: 'sớm', pos: 'adverb', img: '🌅', connect: 'Trái nghĩa với late.', ex: 'I wake up early every day.', exVi: 'Tôi dậy sớm mỗi ngày.' },
  { en: 'late', ipa: '/leɪt/', vi: 'muộn, trễ', pos: 'adverb', img: '⏰', connect: 'Sorry, I am late!', ex: 'Do not be late for class.', exVi: 'Đừng đi học muộn.' },
  { en: 'only', ipa: '/ˈoʊn.li/', vi: 'chỉ', pos: 'adverb', img: '1️⃣', connect: '"Âun-li" — chỉ, duy nhất.', ex: 'I have only ten dollars.', exVi: 'Tôi chỉ có mười đô.' },
  { en: 'really', ipa: '/ˈrɪə.li/', vi: 'thật sự', pos: 'adverb', img: '😮', connect: 'Really? — Thật á?', ex: 'This movie is really good.', exVi: 'Bộ phim này hay thật sự.' },
  { en: 'maybe', ipa: '/ˈmeɪ.bi/', vi: 'có lẽ', pos: 'adverb', img: '🤷', connect: 'May + be — có thể vậy.', ex: 'Maybe it will rain tomorrow.', exVi: 'Có lẽ mai trời mưa.' },
]

/* ------------------------------------------------------------------ */
/* 8) GIỚI TỪ & TỪ NỐI — glue words that build sentences                */
/* ------------------------------------------------------------------ */

const PREPS: IcesWord[] = [
  { en: 'in', ipa: '/ɪn/', vi: 'trong', pos: 'prep', img: '📦', connect: 'In the box, in Hanoi, in May.', ex: 'She lives in Da Nang.', exVi: 'Cô ấy sống ở Đà Nẵng.' },
  { en: 'on', ipa: '/ɑːn/', vi: 'trên', pos: 'prep', img: '🔛', connect: 'Trên bề mặt — on the table; on Monday.', ex: 'The keys are on the table.', exVi: 'Chìa khóa ở trên bàn.' },
  { en: 'at', ipa: '/æt/', vi: 'tại, ở', pos: 'prep', img: '🎯', connect: 'Điểm cụ thể — at home, at 7 o’clock.', ex: 'I am at the coffee shop.', exVi: 'Tôi đang ở quán cà phê.' },
  { en: 'to', ipa: '/tuː/', vi: 'đến, tới', pos: 'prep', img: '➡️', connect: 'Hướng đến — go to school.', ex: 'We went to the beach.', exVi: 'Chúng tôi đã đi biển.' },
  { en: 'from', ipa: '/frɑːm/', vi: 'từ', pos: 'prep', img: '🛫', connect: 'Điểm xuất phát — from Vietnam.', ex: 'I am from Vietnam.', exVi: 'Tôi đến từ Việt Nam.' },
  { en: 'with', ipa: '/wɪð/', vi: 'với, cùng', pos: 'prep', img: '🤝', connect: 'Cùng với — with friends.', ex: 'I go to school with my friend.', exVi: 'Tôi đi học cùng bạn.' },
  { en: 'without', ipa: '/wɪˈðaʊt/', vi: 'không có', pos: 'prep', img: '🚫', connect: 'With + out = thiếu, không có.', ex: 'I cannot live without music.', exVi: 'Tôi không thể sống thiếu âm nhạc.' },
  { en: 'for', ipa: '/fɔːr/', vi: 'cho, dành cho', pos: 'prep', img: '🎁', connect: 'This is for you — cái này cho bạn.', ex: 'This gift is for you.', exVi: 'Món quà này dành cho bạn.' },
  { en: 'of', ipa: '/ʌv/', vi: 'của', pos: 'prep', img: '🧩', connect: 'A cup of tea — một tách trà.', ex: 'This is a photo of my family.', exVi: 'Đây là ảnh gia đình tôi.' },
  { en: 'about', ipa: '/əˈbaʊt/', vi: 'về, khoảng', pos: 'prep', img: '💭', connect: 'Talk about — nói về.', ex: 'We talked about the movie.', exVi: 'Chúng tôi nói về bộ phim.' },
  { en: 'before', ipa: '/bɪˈfɔːr/', vi: 'trước', pos: 'prep', img: '⏮️', connect: 'Before dinner — trước bữa tối.', ex: 'Wash your hands before meals.', exVi: 'Rửa tay trước bữa ăn.' },
  { en: 'after', ipa: '/ˈæf.tər/', vi: 'sau', pos: 'prep', img: '⏭️', connect: 'After school — sau giờ học.', ex: 'Let us meet after work.', exVi: 'Gặp nhau sau giờ làm nhé.' },
  { en: 'under', ipa: '/ˈʌn.dər/', vi: 'dưới', pos: 'prep', img: '⬇️', connect: 'Under the table — dưới gầm bàn.', ex: 'The cat is under the chair.', exVi: 'Con mèo ở dưới ghế.' },
  { en: 'over', ipa: '/ˈoʊ.vər/', vi: 'phía trên, qua', pos: 'prep', img: '🔝', connect: 'Over there — đằng kia; over 100 — hơn 100.', ex: 'The plane flew over the city.', exVi: 'Máy bay bay qua thành phố.' },
  { en: 'near', ipa: '/nɪr/', vi: 'gần', pos: 'prep', img: '📍', connect: 'Near my house — gần nhà tôi.', ex: 'The market is near my house.', exVi: 'Chợ ở gần nhà tôi.' },
  { en: 'between', ipa: '/bɪˈtwiːn/', vi: 'giữa', pos: 'prep', img: '↔️', connect: 'Giữa hai thứ — between A and B.', ex: 'The bank is between the two shops.', exVi: 'Ngân hàng nằm giữa hai cửa hàng.' },
  { en: 'and', ipa: '/ænd/', vi: 'và', pos: 'prep', img: '➕', connect: 'Nối hai thứ cùng loại.', ex: 'I like tea and coffee.', exVi: 'Tôi thích trà và cà phê.' },
  { en: 'but', ipa: '/bʌt/', vi: 'nhưng', pos: 'prep', img: '↩️', connect: 'Chuyển ý ngược lại.', ex: 'The food is cheap but delicious.', exVi: 'Đồ ăn rẻ nhưng ngon.' },
  { en: 'or', ipa: '/ɔːr/', vi: 'hoặc', pos: 'prep', img: '🔀', connect: 'Chọn một trong hai.', ex: 'Tea or coffee?', exVi: 'Trà hay cà phê?' },
  { en: 'because', ipa: '/bɪˈkɔːz/', vi: 'bởi vì', pos: 'prep', img: '🧾', connect: 'Trả lời cho câu hỏi Why.', ex: 'I stayed home because it rained.', exVi: 'Tôi ở nhà vì trời mưa.' },
  { en: 'so', ipa: '/soʊ/', vi: 'nên, vì vậy', pos: 'prep', img: '🎯', connect: 'Chỉ kết quả — mệt nên ngủ sớm.', ex: 'I was tired, so I slept early.', exVi: 'Tôi mệt nên đi ngủ sớm.' },
  { en: 'if', ipa: '/ɪf/', vi: 'nếu', pos: 'prep', img: '🤔', connect: 'Mở đầu câu điều kiện.', ex: 'If it rains, we will stay home.', exVi: 'Nếu trời mưa, chúng ta sẽ ở nhà.' },
]

/* ------------------------------------------------------------------ */
/* 9) CỤM GIAO TIẾP HẰNG NGÀY — survival phrases                        */
/* ------------------------------------------------------------------ */

const PHRASES: IcesWord[] = [
  { en: 'hello', ipa: '/həˈloʊ/', vi: 'xin chào', pos: 'phrase', img: '👋', connect: 'Câu chào vạn năng, lúc nào cũng đúng.', ex: 'Hello! How are you?', exVi: 'Xin chào! Bạn khỏe không?' },
  { en: 'goodbye', ipa: '/ˌɡʊdˈbaɪ/', vi: 'tạm biệt', pos: 'phrase', img: '🚪', connect: 'Good + bye; nói ngắn: Bye!', ex: 'Goodbye! See you tomorrow.', exVi: 'Tạm biệt! Mai gặp lại.' },
  { en: 'thank you', ipa: '/ˈθæŋk juː/', vi: 'cảm ơn', pos: 'phrase', img: '🙏', connect: 'Thanks = cách nói ngắn gọn.', ex: 'Thank you for your help.', exVi: 'Cảm ơn bạn đã giúp đỡ.' },
  { en: "you're welcome", ipa: '/jʊr ˈwel.kəm/', vi: 'không có gì', pos: 'phrase', img: '😊', connect: 'Câu đáp chuẩn khi ai đó cảm ơn.', ex: "'Thank you!' — 'You're welcome!'", exVi: '"Cảm ơn!" — "Không có gì!"' },
  { en: 'excuse me', ipa: '/ɪkˈskjuːz miː/', vi: 'xin lỗi (gây chú ý)', pos: 'phrase', img: '🙇', connect: 'Dùng khi muốn hỏi đường, đi nhờ, gọi phục vụ.', ex: 'Excuse me, where is the bank?', exVi: 'Xin lỗi, ngân hàng ở đâu ạ?' },
  { en: "I'm sorry", ipa: '/aɪm ˈsɑːr.i/', vi: 'tôi xin lỗi', pos: 'phrase', img: '😔', connect: 'Xin lỗi thật lòng (khác excuse me).', ex: "I'm sorry, I'm late.", exVi: 'Xin lỗi, tôi đến muộn.' },
  { en: 'of course', ipa: '/əv kɔːrs/', vi: 'tất nhiên', pos: 'phrase', img: '👌', connect: '"Ọp-cọt" — đồng ý nhiệt tình.', ex: "'Can you help me?' — 'Of course!'", exVi: '"Giúp tôi được không?" — "Tất nhiên!"' },
  { en: 'no problem', ipa: '/noʊ ˈprɑː.bləm/', vi: 'không vấn đề gì', pos: 'phrase', img: '🆗', connect: 'Đáp nhẹ nhàng khi ai đó nhờ/xin lỗi.', ex: "'Sorry I'm late.' — 'No problem.'", exVi: '"Xin lỗi tôi muộn." — "Không sao."' },
  { en: 'see you later', ipa: '/siː juː ˈleɪ.tər/', vi: 'hẹn gặp lại', pos: 'phrase', img: '🕐', connect: 'Nói ngắn: See ya!', ex: 'I have to go. See you later!', exVi: 'Tôi phải đi đây. Gặp lại sau nhé!' },
  { en: 'nice to meet you', ipa: '/naɪs tuː miːt juː/', vi: 'rất vui được gặp bạn', pos: 'phrase', img: '🤝', connect: 'Câu bắt buộc khi gặp lần đầu.', ex: "Hi, I'm Nam. Nice to meet you!", exVi: 'Chào, tôi là Nam. Rất vui được gặp bạn!' },
  { en: 'how are you', ipa: '/haʊ ɑːr juː/', vi: 'bạn khỏe không', pos: 'phrase', img: '💬', connect: "Đáp: I'm fine / I'm good, thanks!", ex: 'How are you today?', exVi: 'Hôm nay bạn thế nào?' },
  { en: "I don't know", ipa: '/aɪ doʊnt noʊ/', vi: 'tôi không biết', pos: 'phrase', img: '🤷', connect: 'Nói tự nhiên: "Ai-đôn-nâu".', ex: "'Where is he?' — 'I don't know.'", exVi: '"Anh ấy đâu?" — "Tôi không biết."' },
  { en: 'wait a minute', ipa: '/weɪt ə ˈmɪn.ɪt/', vi: 'chờ một chút', pos: 'phrase', img: '⏳', connect: 'Minute = phút — chờ "một phút".', ex: "Wait a minute, I'm coming!", exVi: 'Chờ chút, tôi đến ngay!' },
  { en: "let's go", ipa: '/lets ɡoʊ/', vi: 'đi thôi', pos: 'phrase', img: '🚀', connect: "Let us = let's — rủ nhau làm gì đó.", ex: "We're ready. Let's go!", exVi: 'Sẵn sàng rồi. Đi thôi!' },
  { en: 'good luck', ipa: '/ɡʊd lʌk/', vi: 'chúc may mắn', pos: 'phrase', img: '🍀', connect: 'Lucky = may mắn.', ex: 'Good luck with your exam!', exVi: 'Chúc bạn thi tốt!' },
  { en: 'congratulations', ipa: '/kənˌɡrætʃ.əˈleɪ.ʃənz/', vi: 'chúc mừng', pos: 'phrase', img: '🎉', connect: 'Nói ngắn: Congrats!', ex: 'Congratulations on your new job!', exVi: 'Chúc mừng công việc mới của bạn!' },
  { en: 'happy birthday', ipa: '/ˈhæp.i ˈbɜːrθ.deɪ/', vi: 'chúc mừng sinh nhật', pos: 'phrase', img: '🎂', connect: 'Bài hát ai cũng thuộc.', ex: 'Happy birthday! This is for you.', exVi: 'Chúc mừng sinh nhật! Quà cho bạn này.' },
  { en: 'take care', ipa: '/teɪk ker/', vi: 'giữ gìn sức khỏe', pos: 'phrase', img: '🤗', connect: 'Lời chào tạm biệt ấm áp.', ex: 'Goodbye, take care!', exVi: 'Tạm biệt, giữ gìn sức khỏe nhé!' },
  { en: 'long time no see', ipa: '/lɔːŋ taɪm noʊ siː/', vi: 'lâu rồi không gặp', pos: 'phrase', img: '👀', connect: 'Nghe đồn gốc từ tiếng Trung "好久不见".', ex: 'Hey! Long time no see!', exVi: 'Ơ kìa! Lâu lắm không gặp!' },
  { en: "what's up", ipa: '/wɑːts ʌp/', vi: 'dạo này sao rồi', pos: 'phrase', img: '😎', connect: 'Chào thân mật kiểu Mỹ — đáp: Not much!', ex: "Hey, what's up?", exVi: 'Này, dạo này sao rồi?' },
]

/* ------------------------------------------------------------------ */
/* 10) CƠ THỂ & SỨC KHOẺ                                               */
/* ------------------------------------------------------------------ */

const BODY: IcesWord[] = [
  { en: 'head', ipa: '/hed/', vi: 'đầu', pos: 'noun', img: '👤', connect: '"Hét" — đau đầu vì tiếng hét.', ex: 'My head hurts.', exVi: 'Đầu tôi đau.' },
  { en: 'face', ipa: '/feɪs/', vi: 'khuôn mặt', pos: 'noun', img: '🙂', connect: '"Phêy-s" — mặt để lên "Facebook".', ex: 'Wash your face every morning.', exVi: 'Rửa mặt mỗi sáng nhé.' },
  { en: 'hair', ipa: '/her/', vi: 'tóc', pos: 'noun', img: '💇', connect: '"He-rờ" — hè nóng đi cắt tóc.', ex: 'She has long black hair.', exVi: 'Cô ấy có mái tóc đen dài.' },
  { en: 'mouth', ipa: '/maʊθ/', vi: 'miệng', pos: 'noun', img: '👄', connect: '"Mao-th" — miệng mở to tròn chữ O.', ex: 'Open your mouth, please.', exVi: 'Há miệng ra nào.' },
  { en: 'nose', ipa: '/noʊz/', vi: 'mũi', pos: 'noun', img: '👃', connect: '"Nâu-z" — mũi biết (knows) mọi mùi.', ex: 'My nose is itchy.', exVi: 'Mũi tôi ngứa quá.' },
  { en: 'ear', ipa: '/ɪr/', vi: 'tai', pos: 'noun', img: '👂', connect: 'Nghe = hear — trong hear có ear.', ex: 'Speak into my left ear.', exVi: 'Nói vào tai trái của tôi.' },
  { en: 'tooth', ipa: '/tuːθ/', vi: 'răng', pos: 'noun', img: '🦷', connect: 'Số nhiều bất quy tắc: teeth.', ex: 'I brush my teeth twice a day.', exVi: 'Tôi đánh răng hai lần mỗi ngày.' },
  { en: 'arm', ipa: '/ɑːrm/', vi: 'cánh tay', pos: 'noun', img: '💪', connect: '"Am" — ôm ai đó bằng cánh tay.', ex: 'He broke his arm.', exVi: 'Anh ấy bị gãy tay.' },
  { en: 'leg', ipa: '/leɡ/', vi: 'chân', pos: 'noun', img: '🦵', connect: '"Léc" — mỏi chân lết về nhà.', ex: 'My legs are tired after running.', exVi: 'Chạy xong chân tôi mỏi nhừ.' },
  { en: 'foot', ipa: '/fʊt/', vi: 'bàn chân', pos: 'noun', img: '🦶', connect: 'Số nhiều: feet. Bóng đá = football.', ex: 'My right foot hurts.', exVi: 'Bàn chân phải của tôi bị đau.' },
  { en: 'heart', ipa: '/hɑːrt/', vi: 'trái tim', pos: 'noun', img: '❤️', connect: '"Hạt" — trái tim quý như hạt ngọc.', ex: 'My heart beats fast.', exVi: 'Tim tôi đập nhanh.' },
  { en: 'blood', ipa: '/blʌd/', vi: 'máu', pos: 'noun', img: '🩸', connect: 'Đọc là "blăd", KHÔNG phải "blu-d".', ex: 'Doctors check your blood.', exVi: 'Bác sĩ kiểm tra máu của bạn.' },
  { en: 'skin', ipa: '/skɪn/', vi: 'da', pos: 'noun', img: '🧴', connect: '"Sờ-kin" — sờ da thấy mịn.', ex: 'Her skin is very soft.', exVi: 'Da cô ấy rất mềm.' },
  { en: 'back', ipa: '/bæk/', vi: 'lưng', pos: 'noun', img: '🔙', connect: 'Back vừa là "lưng" vừa là "quay lại".', ex: 'My back hurts from sitting.', exVi: 'Ngồi nhiều nên lưng tôi đau.' },
  { en: 'stomach', ipa: '/ˈstʌm.ək/', vi: 'bụng, dạ dày', pos: 'noun', img: '🫃', connect: 'Đọc "STẮM-mờc" — ch cuối đọc là k.', ex: 'My stomach is full.', exVi: 'Bụng tôi no căng.' },
  { en: 'sick', ipa: '/sɪk/', vi: 'ốm, bệnh', pos: 'adj', img: '🤒', connect: '"Sích" — ốm nằm xích trên giường.', ex: 'I feel sick today.', exVi: 'Hôm nay tôi thấy không khoẻ.' },
  { en: 'headache', ipa: '/ˈhed.eɪk/', vi: 'đau đầu', pos: 'noun', img: '🤕', connect: 'head (đầu) + ache (đau) = đau đầu.', ex: 'I have a headache.', exVi: 'Tôi bị đau đầu.' },
  { en: 'fever', ipa: '/ˈfiː.vɚ/', vi: 'sốt', pos: 'noun', img: '🌡️', connect: '"Phi-vờ" — sốt phi mã.', ex: 'The baby has a fever.', exVi: 'Em bé bị sốt.' },
  { en: 'cough', ipa: '/kɔːf/', vi: 'ho', pos: 'verb', img: '😷', connect: 'Đọc là "cóf" — đuôi -gh đọc là f.', ex: "I can't stop coughing.", exVi: 'Tôi ho mãi không dứt.' },
  { en: 'medicine', ipa: '/ˈmed.ɪ.sən/', vi: 'thuốc', pos: 'noun', img: '💊', connect: '"Me-đi-sừn" — mẹ đi mua thuốc.', ex: 'Take this medicine after meals.', exVi: 'Uống thuốc này sau bữa ăn.' },
  { en: 'doctor', ipa: '/ˈdɑːk.tɚ/', vi: 'bác sĩ', pos: 'noun', img: '🧑‍⚕️', connect: '"Đốc-tờ" — bác sĩ đốc thúc uống thuốc.', ex: 'You should see a doctor.', exVi: 'Bạn nên đi khám bác sĩ.' },
  { en: 'nurse', ipa: '/nɜːrs/', vi: 'y tá', pos: 'noun', img: '👩‍⚕️', connect: '"Nớc-s" — y tá rót nước cho bệnh nhân.', ex: 'The nurse is very kind.', exVi: 'Cô y tá rất tận tình.' },
  { en: 'hurt', ipa: '/hɜːrt/', vi: 'đau, làm đau', pos: 'verb', img: '🤕', connect: '"Hớt" — đau chạy hớt hải.', ex: 'Does it hurt a lot?', exVi: 'Có đau lắm không?' },
  { en: 'pain', ipa: '/peɪn/', vi: 'cơn đau', pos: 'noun', img: '😖', connect: 'No pain no gain — không đau không thành.', ex: 'I feel a pain in my back.', exVi: 'Tôi thấy đau ở lưng.' },
  { en: 'healthy', ipa: '/ˈhel.θi/', vi: 'khoẻ mạnh', pos: 'adj', img: '🥗', connect: 'health + y — ăn rau cho healthy.', ex: 'Eating fruit keeps you healthy.', exVi: 'Ăn trái cây giúp bạn khoẻ mạnh.' },
  { en: 'strong', ipa: '/strɔːŋ/', vi: 'khoẻ, mạnh', pos: 'adj', img: '🏋️', connect: '"Sờ-troong" — khoẻ mạnh như trâu.', ex: 'He is strong enough to carry it.', exVi: 'Anh ấy đủ khoẻ để vác nó.' },
  { en: 'weak', ipa: '/wiːk/', vi: 'yếu', pos: 'adj', img: '🥀', connect: 'Ngược với strong; đồng âm week (tuần).', ex: 'I feel weak after being sick.', exVi: 'Ốm dậy tôi thấy yếu hẳn.' },
  { en: 'exercise', ipa: '/ˈek.sɚ.saɪz/', vi: 'tập thể dục', pos: 'verb', img: '🏃', connect: '"Éc-xơ-sai-z" — tập sai tư thế là "éc".', ex: 'I exercise every morning.', exVi: 'Sáng nào tôi cũng tập thể dục.' },
  { en: 'rest', ipa: '/rest/', vi: 'nghỉ ngơi', pos: 'verb', img: '😴', connect: '"Rét-st" — trời rét ở nhà nghỉ ngơi.', ex: 'You need to rest more.', exVi: 'Bạn cần nghỉ ngơi nhiều hơn.' },
  { en: 'body', ipa: '/ˈbɑː.di/', vi: 'cơ thể', pos: 'noun', img: '🧍', connect: '"Bo-đi" — giữ body săn chắc.', ex: 'A healthy body, a healthy mind.', exVi: 'Cơ thể khoẻ, tinh thần khoẻ.' },
]

/* ------------------------------------------------------------------ */
/* 11) SỐ ĐẾM & THỜI GIAN                                              */
/* ------------------------------------------------------------------ */

const TIMENUM: IcesWord[] = [
  { en: 'one', ipa: '/wʌn/', vi: 'một', pos: 'noun', img: '1️⃣', connect: 'Đọc "oăn", không phải "on".', ex: 'I have one brother.', exVi: 'Tôi có một anh trai.' },
  { en: 'two', ipa: '/tuː/', vi: 'hai', pos: 'noun', img: '2️⃣', connect: 'Đồng âm với "too" (cũng).', ex: 'Two coffees, please.', exVi: 'Cho hai ly cà phê.' },
  { en: 'three', ipa: '/θriː/', vi: 'ba', pos: 'noun', img: '3️⃣', connect: 'Âm "th" — đặt lưỡi giữa hai hàm răng.', ex: 'The class starts at three.', exVi: 'Lớp bắt đầu lúc 3 giờ.' },
  { en: 'four', ipa: '/fɔːr/', vi: 'bốn', pos: 'noun', img: '4️⃣', connect: 'Đồng âm với "for" (cho).', ex: 'A table for four, please.', exVi: 'Cho bàn 4 người.' },
  { en: 'five', ipa: '/faɪv/', vi: 'năm', pos: 'noun', img: '5️⃣', connect: 'High five — đập tay 5 ngón.', ex: 'Give me five minutes.', exVi: 'Cho tôi 5 phút.' },
  { en: 'six', ipa: '/sɪks/', vi: 'sáu', pos: 'noun', img: '6️⃣', connect: '"Sích-s".', ex: 'I wake up at six.', exVi: 'Tôi dậy lúc 6 giờ.' },
  { en: 'seven', ipa: '/ˈsev.ən/', vi: 'bảy', pos: 'noun', img: '7️⃣', connect: '"Sé-vừn" — cửa hàng 7-Eleven.', ex: 'The store opens at seven.', exVi: 'Cửa hàng mở lúc 7 giờ.' },
  { en: 'eight', ipa: '/eɪt/', vi: 'tám', pos: 'noun', img: '8️⃣', connect: 'Đồng âm "ate" (đã ăn) — ăn tối lúc 8 giờ.', ex: 'Dinner is at eight.', exVi: 'Bữa tối lúc 8 giờ.' },
  { en: 'nine', ipa: '/naɪn/', vi: 'chín', pos: 'noun', img: '9️⃣', connect: '"Nai-n".', ex: 'I work from nine to five.', exVi: 'Tôi làm từ 9 giờ tới 5 giờ.' },
  { en: 'ten', ipa: '/ten/', vi: 'mười', pos: 'noun', img: '🔟', connect: '"Ten" — mười điểm!', ex: 'Count from one to ten.', exVi: 'Đếm từ 1 đến 10 nào.' },
  { en: 'hundred', ipa: '/ˈhʌn.drəd/', vi: 'trăm', pos: 'noun', img: '💯', connect: '"Hăn-đờ-rợt".', ex: 'This shirt costs two hundred.', exVi: 'Cái áo này giá hai trăm.' },
  { en: 'thousand', ipa: '/ˈθaʊ.zənd/', vi: 'nghìn', pos: 'noun', img: '🧮', connect: '"Thao-zừnd".', ex: 'The phone costs a thousand dollars.', exVi: 'Điện thoại giá một nghìn đô.' },
  { en: 'million', ipa: '/ˈmɪl.jən/', vi: 'triệu', pos: 'noun', img: '💰', connect: 'Triệu phú = millionaire.', ex: 'This city has two million people.', exVi: 'Thành phố này có 2 triệu dân.' },
  { en: 'first', ipa: '/fɜːrst/', vi: 'thứ nhất, đầu tiên', pos: 'adj', img: '🥇', connect: 'Số 1 = first, viết tắt 1st.', ex: 'This is my first time in Korea.', exVi: 'Đây là lần đầu tôi tới Hàn Quốc.' },
  { en: 'last', ipa: '/læst/', vi: 'cuối cùng; vừa qua', pos: 'adj', img: '🏁', connect: 'Ngược với first; last week = tuần trước.', ex: 'I saw him last night.', exVi: 'Tôi gặp anh ấy tối qua.' },
  { en: 'hour', ipa: '/ˈaʊ.ɚ/', vi: 'giờ (60 phút)', pos: 'noun', img: '⏳', connect: 'Chữ h CÂM — đọc "ao-ơ".', ex: 'The movie is two hours long.', exVi: 'Bộ phim dài 2 tiếng.' },
  { en: 'minute', ipa: '/ˈmɪn.ɪt/', vi: 'phút', pos: 'noun', img: '⏱️', connect: '"Mi-nít".', ex: 'Wait a minute, please.', exVi: 'Chờ một phút nhé.' },
  { en: 'Monday', ipa: '/ˈmʌn.deɪ/', vi: 'thứ Hai', pos: 'noun', img: '📅', connect: 'Moon-day — ngày Mặt Trăng.', ex: 'I go back to work on Monday.', exVi: 'Thứ Hai tôi đi làm lại.' },
  { en: 'Tuesday', ipa: '/ˈtuːz.deɪ/', vi: 'thứ Ba', pos: 'noun', img: '📅', connect: '"Tiu-z-đây".', ex: 'We have class on Tuesday.', exVi: 'Thứ Ba mình có lớp.' },
  { en: 'Wednesday', ipa: '/ˈwenz.deɪ/', vi: 'thứ Tư', pos: 'noun', img: '📅', connect: 'Đọc "OEN-z-đây" — chữ d đầu câm.', ex: 'The meeting is on Wednesday.', exVi: 'Cuộc họp vào thứ Tư.' },
  { en: 'Thursday', ipa: '/ˈθɜːrz.deɪ/', vi: 'thứ Năm', pos: 'noun', img: '📅', connect: '"Thớc-z-đây".', ex: 'I play soccer on Thursday.', exVi: 'Thứ Năm tôi đá bóng.' },
  { en: 'Friday', ipa: '/ˈfraɪ.deɪ/', vi: 'thứ Sáu', pos: 'noun', img: '🎉', connect: 'TGIF — Thank God It\'s Friday.', ex: 'See you on Friday night!', exVi: 'Hẹn gặp tối thứ Sáu nhé!' },
  { en: 'Saturday', ipa: '/ˈsæt̬.ɚ.deɪ/', vi: 'thứ Bảy', pos: 'noun', img: '🛍️', connect: '"Sát-tơ-đây".', ex: 'I go shopping on Saturday.', exVi: 'Thứ Bảy tôi đi mua sắm.' },
  { en: 'Sunday', ipa: '/ˈsʌn.deɪ/', vi: 'Chủ nhật', pos: 'noun', img: '☀️', connect: 'Sun-day — ngày Mặt Trời, ngày nghỉ.', ex: 'We rest on Sunday.', exVi: 'Chủ nhật cả nhà nghỉ ngơi.' },
  { en: 'date', ipa: '/deɪt/', vi: 'ngày (lịch); buổi hẹn', pos: 'noun', img: '🗓️', connect: 'Hỏi ngày: What\'s the date?', ex: "What's the date today?", exVi: 'Hôm nay là ngày bao nhiêu?' },
  { en: 'season', ipa: '/ˈsiː.zən/', vi: 'mùa', pos: 'noun', img: '🍂', connect: '"Si-zừn" — phim dài tập cũng chia season.', ex: 'Which season do you like best?', exVi: 'Bạn thích mùa nào nhất?' },
  { en: 'spring', ipa: '/sprɪŋ/', vi: 'mùa xuân', pos: 'noun', img: '🌸', connect: 'Spring còn là "lò xo" — cây cối bật dậy.', ex: 'Flowers bloom in spring.', exVi: 'Hoa nở vào mùa xuân.' },
  { en: 'summer', ipa: '/ˈsʌm.ɚ/', vi: 'mùa hè', pos: 'noun', img: '🏖️', connect: '"Săm-mơ" — hè nóng sạm da.', ex: 'We go to the beach in summer.', exVi: 'Hè là cả nhà đi biển.' },
  { en: 'autumn', ipa: '/ˈɑː.t̬əm/', vi: 'mùa thu', pos: 'noun', img: '🍁', connect: '"O-tựm" — người Mỹ hay dùng fall.', ex: 'The leaves turn red in autumn.', exVi: 'Mùa thu lá chuyển đỏ.' },
  { en: 'winter', ipa: '/ˈwɪn.t̬ɚ/', vi: 'mùa đông', pos: 'noun', img: '❄️', connect: '"Uyn-tơ" — đông về có gió (wind).', ex: 'It snows here in winter.', exVi: 'Mùa đông ở đây có tuyết.' },
]

/* ------------------------------------------------------------------ */
/* 12) CÔNG VIỆC & HỌC HÀNH                                            */
/* ------------------------------------------------------------------ */

const WORKLIFE: IcesWord[] = [
  { en: 'office', ipa: '/ˈɑː.fɪs/', vi: 'văn phòng', pos: 'noun', img: '🏢', connect: '"O-phít-s" — nơi cày 8 tiếng mỗi ngày.', ex: 'I go to the office by bus.', exVi: 'Tôi đến văn phòng bằng xe buýt.' },
  { en: 'company', ipa: '/ˈkʌm.pə.ni/', vi: 'công ty', pos: 'noun', img: '🏬', connect: '"Căm-pơ-ni" — com = cơm: nơi kiếm cơm.', ex: 'She works for a big company.', exVi: 'Cô ấy làm cho một công ty lớn.' },
  { en: 'boss', ipa: '/bɑːs/', vi: 'sếp', pos: 'noun', img: '🧑‍💼', connect: '"Bót-s" — sếp lớn gọi là boss.', ex: 'My boss is very busy today.', exVi: 'Hôm nay sếp tôi rất bận.' },
  { en: 'meeting', ipa: '/ˈmiː.t̬ɪŋ/', vi: 'cuộc họp', pos: 'noun', img: '📊', connect: 'meet (gặp) + ing = buổi gặp = họp.', ex: 'The meeting starts at ten.', exVi: 'Cuộc họp bắt đầu lúc 10 giờ.' },
  { en: 'email', ipa: '/ˈiː.meɪl/', vi: 'thư điện tử', pos: 'noun', img: '📧', connect: 'Giữ nguyên như tiếng Việt vẫn dùng.', ex: 'Please send me an email.', exVi: 'Gửi email cho tôi nhé.' },
  { en: 'computer', ipa: '/kəmˈpjuː.t̬ɚ/', vi: 'máy tính', pos: 'noun', img: '💻', connect: '"Cơm-piu-tơ".', ex: 'I use a computer at work.', exVi: 'Tôi dùng máy tính ở chỗ làm.' },
  { en: 'internet', ipa: '/ˈɪn.t̬ɚ.net/', vi: 'mạng internet', pos: 'noun', img: '🌐', connect: 'Chú ý trọng âm rơi vào ĐẦU từ.', ex: 'The internet is slow today.', exVi: 'Hôm nay mạng chậm quá.' },
  { en: 'report', ipa: '/rɪˈpɔːrt/', vi: 'báo cáo', pos: 'noun', img: '📄', connect: '"Ri-pót" — nộp report cho sếp.', ex: 'I need to finish this report.', exVi: 'Tôi phải làm xong bản báo cáo này.' },
  { en: 'salary', ipa: '/ˈsæl.ɚ.i/', vi: 'lương', pos: 'noun', img: '💵', connect: 'Thời xưa trả lương bằng muối (salt) → salary.', ex: 'The salary is paid monthly.', exVi: 'Lương trả theo tháng.' },
  { en: 'customer', ipa: '/ˈkʌs.tə.mɚ/', vi: 'khách hàng', pos: 'noun', img: '🛒', connect: '"Cắt-s-tơ-mơ" — khách hàng là thượng đế.', ex: 'The customer is always right.', exVi: 'Khách hàng luôn đúng.' },
  { en: 'teacher', ipa: '/ˈtiː.tʃɚ/', vi: 'giáo viên', pos: 'noun', img: '👩‍🏫', connect: 'teach (dạy) + er (người) = người dạy.', ex: 'Our teacher is very patient.', exVi: 'Cô giáo của tụi mình rất kiên nhẫn.' },
  { en: 'student', ipa: '/ˈstuː.dənt/', vi: 'học sinh, sinh viên', pos: 'noun', img: '🎒', connect: '"Sờ-tiu-đừnt".', ex: 'She is a university student.', exVi: 'Cô ấy là sinh viên đại học.' },
  { en: 'class', ipa: '/klæs/', vi: 'lớp học', pos: 'noun', img: '🏫', connect: '"Cờ-lát-s" — vào class điểm danh.', ex: 'I have an English class tonight.', exVi: 'Tối nay tôi có lớp tiếng Anh.' },
  { en: 'lesson', ipa: '/ˈles.ən/', vi: 'bài học', pos: 'noun', img: '📖', connect: '"Lét-sừn" — mỗi ngày một lesson.', ex: "Today's lesson is about food.", exVi: 'Bài học hôm nay về đồ ăn.' },
  { en: 'homework', ipa: '/ˈhoʊm.wɝːk/', vi: 'bài tập về nhà', pos: 'noun', img: '📝', connect: 'home + work = việc làm ở nhà.', ex: 'I do my homework after dinner.', exVi: 'Ăn tối xong tôi làm bài tập.' },
  { en: 'exam', ipa: '/ɪɡˈzæm/', vi: 'kỳ thi', pos: 'noun', img: '🧾', connect: '"Íc-zam" — mùa thi là mùa exam.', ex: 'Good luck on your exam!', exVi: 'Chúc thi tốt nhé!' },
  { en: 'pen', ipa: '/pen/', vi: 'bút', pos: 'noun', img: '🖊️', connect: '"Pen" — bút bi.', ex: 'Can I borrow your pen?', exVi: 'Cho tôi mượn cây bút nhé?' },
  { en: 'paper', ipa: '/ˈpeɪ.pɚ/', vi: 'giấy', pos: 'noun', img: '📃', connect: '"Pây-pơ".', ex: 'Write your name on the paper.', exVi: 'Viết tên bạn lên tờ giấy.' },
  { en: 'letter', ipa: '/ˈlet̬.ɚ/', vi: 'lá thư; chữ cái', pos: 'noun', img: '✉️', connect: 'Vừa là thư, vừa là chữ cái A B C.', ex: 'I wrote a letter to my friend.', exVi: 'Tôi viết thư cho bạn tôi.' },
  { en: 'news', ipa: '/nuːz/', vi: 'tin tức', pos: 'noun', img: '📰', connect: 'Luôn có s nhưng là danh từ số ÍT.', ex: 'Did you hear the news?', exVi: 'Bạn nghe tin gì chưa?' },
  { en: 'plan', ipa: '/plæn/', vi: 'kế hoạch', pos: 'noun', img: '🗂️', connect: '"Pờ-lan" — lên plan cho tuần mới.', ex: 'What is your plan for the weekend?', exVi: 'Cuối tuần bạn định làm gì?' },
  { en: 'project', ipa: '/ˈprɑː.dʒekt/', vi: 'dự án', pos: 'noun', img: '🧱', connect: '"Pờ-ro-djệct" — chạy project cùng team.', ex: 'We finished the project on time.', exVi: 'Bọn tôi hoàn thành dự án đúng hạn.' },
  { en: 'break', ipa: '/breɪk/', vi: 'giờ nghỉ', pos: 'noun', img: '🍵', connect: 'Take a break — nghỉ xả hơi một chút.', ex: "Let's take a ten-minute break.", exVi: 'Nghỉ 10 phút nào.' },
  { en: 'holiday', ipa: '/ˈhɑː.lə.deɪ/', vi: 'ngày nghỉ, kỳ nghỉ', pos: 'noun', img: '🎊', connect: 'holy + day — ngày lễ = ngày nghỉ.', ex: 'Next week is a holiday.', exVi: 'Tuần sau được nghỉ lễ.' },
  { en: 'schedule', ipa: '/ˈskedʒ.uːl/', vi: 'lịch trình', pos: 'noun', img: '📆', connect: '"Sờ-ke-djun" — xếp lịch là lên schedule.', ex: 'My schedule is full this week.', exVi: 'Tuần này lịch tôi kín mít.' },
  { en: 'interview', ipa: '/ˈɪn.t̬ɚ.vjuː/', vi: 'phỏng vấn', pos: 'noun', img: '🎤', connect: '"In-tơ-viu".', ex: 'I have a job interview tomorrow.', exVi: 'Mai tôi có buổi phỏng vấn xin việc.' },
  { en: 'university', ipa: '/ˌjuː.nəˈvɝː.sə.t̬i/', vi: 'đại học', pos: 'noun', img: '🎓', connect: '"Diu-ni-vơ-si-ti".', ex: 'My sister studies at a university.', exVi: 'Chị tôi học đại học.' },
  { en: 'skill', ipa: '/skɪl/', vi: 'kỹ năng', pos: 'noun', img: '🛠️', connect: '"Sờ-kiu" — nâng skill mỗi ngày.', ex: 'Speaking is an important skill.', exVi: 'Nói là một kỹ năng quan trọng.' },
  { en: 'team', ipa: '/tiːm/', vi: 'đội, nhóm', pos: 'noun', img: '🤝', connect: '"Tim" — teamwork đồng đội một lòng.', ex: 'Our team won the game.', exVi: 'Đội của tụi tôi thắng trận đó.' },
  { en: 'success', ipa: '/səkˈses/', vi: 'thành công', pos: 'noun', img: '🏆', connect: '"Sắc-xét-s" — thành công nhờ nỗ lực.', ex: 'Hard work brings success.', exVi: 'Chăm chỉ đem lại thành công.' },
]

/* ------------------------------------------------------------------ */
/* 13) ĂN UỐNG & MUA SẮM                                               */
/* ------------------------------------------------------------------ */

const FOODSHOP: IcesWord[] = [
  { en: 'breakfast', ipa: '/ˈbrek.fəst/', vi: 'bữa sáng', pos: 'noun', img: '🍳', connect: 'break + fast: "phá" cơn đói sau một đêm.', ex: 'I have breakfast at seven.', exVi: 'Tôi ăn sáng lúc 7 giờ.' },
  { en: 'lunch', ipa: '/lʌntʃ/', vi: 'bữa trưa', pos: 'noun', img: '🍱', connect: '"Lăn-ch" — trưa đói lăn ra ăn.', ex: 'What do you want for lunch?', exVi: 'Trưa nay bạn muốn ăn gì?' },
  { en: 'dinner', ipa: '/ˈdɪn.ɚ/', vi: 'bữa tối', pos: 'noun', img: '🍽️', connect: '"Đin-nơ".', ex: 'We eat dinner together.', exVi: 'Cả nhà ăn tối cùng nhau.' },
  { en: 'meal', ipa: '/miːl/', vi: 'bữa ăn', pos: 'noun', img: '🥘', connect: '"Min" — meal ngon miễn bàn.', ex: 'This meal is delicious.', exVi: 'Bữa này ngon quá.' },
  { en: 'bread', ipa: '/bred/', vi: 'bánh mì', pos: 'noun', img: '🍞', connect: '"Bờ-rét".', ex: 'I buy fresh bread every morning.', exVi: 'Sáng nào tôi cũng mua bánh mì nóng.' },
  { en: 'egg', ipa: '/eɡ/', vi: 'trứng', pos: 'noun', img: '🥚', connect: '"Éc" — trứng ốp la.', ex: 'I eat two eggs for breakfast.', exVi: 'Sáng tôi ăn hai quả trứng.' },
  { en: 'meat', ipa: '/miːt/', vi: 'thịt', pos: 'noun', img: '🥩', connect: 'Đồng âm meet (gặp) — đi chợ "gặp" thịt.', ex: "I don't eat much meat.", exVi: 'Tôi không ăn nhiều thịt.' },
  { en: 'chicken', ipa: '/ˈtʃɪk.ɪn/', vi: 'gà, thịt gà', pos: 'noun', img: '🍗', connect: '"Chích-kừn".', ex: 'Fried chicken is my favorite.', exVi: 'Gà rán là món khoái khẩu của tôi.' },
  { en: 'beef', ipa: '/biːf/', vi: 'thịt bò', pos: 'noun', img: '🐄', connect: '"Bíp" — phở bò = beef noodle soup.', ex: 'This beef is very soft.', exVi: 'Thịt bò này mềm lắm.' },
  { en: 'pork', ipa: '/pɔːrk/', vi: 'thịt heo', pos: 'noun', img: '🐖', connect: '"Pốc".', ex: 'We need pork for this dish.', exVi: 'Món này cần thịt heo.' },
  { en: 'fish', ipa: '/fɪʃ/', vi: 'cá', pos: 'noun', img: '🐟', connect: '"Phít-sh".', ex: 'Fresh fish is good for you.', exVi: 'Cá tươi rất tốt cho sức khoẻ.' },
  { en: 'fruit', ipa: '/fruːt/', vi: 'trái cây', pos: 'noun', img: '🍎', connect: 'Đọc "phrút" — KHÔNG đọc "phru-ít".', ex: 'Eat more fruit every day.', exVi: 'Ăn nhiều trái cây mỗi ngày nhé.' },
  { en: 'apple', ipa: '/ˈæp.əl/', vi: 'táo', pos: 'noun', img: '🍏', connect: 'Hãng Apple — quả táo cắn dở.', ex: 'An apple a day keeps the doctor away.', exVi: 'Mỗi ngày một quả táo, khỏi gặp bác sĩ.' },
  { en: 'banana', ipa: '/bəˈnæn.ə/', vi: 'chuối', pos: 'noun', img: '🍌', connect: '"Bơ-na-na".', ex: 'Monkeys love bananas.', exVi: 'Khỉ mê chuối lắm.' },
  { en: 'vegetable', ipa: '/ˈvedʒ.tə.bəl/', vi: 'rau củ', pos: 'noun', img: '🥦', connect: 'Đọc "VÉ-djờ-tơ-bồ" — 3 âm thôi.', ex: 'Eat your vegetables first.', exVi: 'Ăn rau trước đi nào.' },
  { en: 'milk', ipa: '/mɪlk/', vi: 'sữa', pos: 'noun', img: '🥛', connect: '"Miu-k".', ex: 'I drink milk before bed.', exVi: 'Tôi uống sữa trước khi ngủ.' },
  { en: 'tea', ipa: '/tiː/', vi: 'trà', pos: 'noun', img: '🍵', connect: '"Ti" — gần âm "chè" tiếng Việt.', ex: 'Would you like some tea?', exVi: 'Bạn dùng chút trà nhé?' },
  { en: 'juice', ipa: '/dʒuːs/', vi: 'nước ép', pos: 'noun', img: '🧃', connect: '"Djút-s".', ex: 'Orange juice, please.', exVi: 'Cho một ly nước cam.' },
  { en: 'sugar', ipa: '/ˈʃʊɡ.ɚ/', vi: 'đường', pos: 'noun', img: '🍬', connect: 'Đọc "SHU-gơ" — s đọc thành sh.', ex: 'No sugar in my coffee, please.', exVi: 'Cà phê của tôi không đường nhé.' },
  { en: 'salt', ipa: '/sɔːlt/', vi: 'muối', pos: 'noun', img: '🧂', connect: '"Xon-t".', ex: 'Add a little salt to the soup.', exVi: 'Thêm chút muối vào canh.' },
  { en: 'soup', ipa: '/suːp/', vi: 'canh, súp', pos: 'noun', img: '🍲', connect: '"Súp" — như tiếng Việt.', ex: 'The soup is too hot.', exVi: 'Canh nóng quá.' },
  { en: 'noodle', ipa: '/ˈnuː.dəl/', vi: 'mì, món sợi', pos: 'noun', img: '🍜', connect: '"Nu-đồ" — mì, phở, bún đều là noodle.', ex: 'I ate a bowl of noodles.', exVi: 'Tôi ăn một tô mì.' },
  { en: 'cake', ipa: '/keɪk/', vi: 'bánh ngọt', pos: 'noun', img: '🎂', connect: '"Kêy-k" — bánh sinh nhật.', ex: 'She made a chocolate cake.', exVi: 'Cô ấy làm bánh sô-cô-la.' },
  { en: 'menu', ipa: '/ˈmen.juː/', vi: 'thực đơn', pos: 'noun', img: '📋', connect: '"Me-niu" — như tiếng Việt.', ex: 'Can I see the menu?', exVi: 'Cho tôi xem thực đơn nhé?' },
  { en: 'order', ipa: '/ˈɔːr.dɚ/', vi: 'gọi món, đặt hàng', pos: 'verb', img: '🧾', connect: '"O-đơ" — order trà sữa.', ex: 'Are you ready to order?', exVi: 'Anh chị gọi món chưa ạ?' },
  { en: 'bill', ipa: '/bɪl/', vi: 'hoá đơn', pos: 'noun', img: '💳', connect: '"Biu" — xin bill tính tiền.', ex: 'Can we have the bill, please?', exVi: 'Cho tụi tôi xin hoá đơn nhé?' },
  { en: 'price', ipa: '/praɪs/', vi: 'giá', pos: 'noun', img: '💲', connect: '"Pờ-rai-s".', ex: 'The price is too high.', exVi: 'Giá cao quá.' },
  { en: 'sale', ipa: '/seɪl/', vi: 'giảm giá', pos: 'noun', img: '🏷️', connect: '"Sêu" — săn sale cuối năm.', ex: 'These shoes are on sale.', exVi: 'Đôi giày này đang giảm giá.' },
  { en: 'gift', ipa: '/ɡɪft/', vi: 'quà tặng', pos: 'noun', img: '🎁', connect: '"Ghíp-t".', ex: 'This gift is for you.', exVi: 'Món quà này tặng bạn.' },
  { en: 'bag', ipa: '/bæɡ/', vi: 'túi, cặp', pos: 'noun', img: '👜', connect: '"Bác" — xách bag đi chợ.', ex: 'My bag is very heavy.', exVi: 'Túi của tôi nặng quá.' },
]

/* ------------------------------------------------------------------ */
/* 14) CẢM XÚC & TÍNH CÁCH                                             */
/* ------------------------------------------------------------------ */

const FEELINGS: IcesWord[] = [
  { en: 'angry', ipa: '/ˈæŋ.ɡri/', vi: 'tức giận', pos: 'adj', img: '😠', connect: 'Angry Birds — bầy chim nổi giận.', ex: 'Why are you angry with me?', exVi: 'Sao bạn giận mình vậy?' },
  { en: 'afraid', ipa: '/əˈfreɪd/', vi: 'sợ', pos: 'adj', img: '😨', connect: '"Ơ-phrêy-d".', ex: 'I am afraid of dogs.', exVi: 'Tôi sợ chó.' },
  { en: 'worried', ipa: '/ˈwɝː.id/', vi: 'lo lắng', pos: 'adj', img: '😟', connect: 'Câu quen: Don\'t worry — đừng lo.', ex: 'She is worried about the exam.', exVi: 'Cô ấy lo cho kỳ thi.' },
  { en: 'nervous', ipa: '/ˈnɝː.vəs/', vi: 'hồi hộp', pos: 'adj', img: '😬', connect: 'Căng dây thần kinh (nerve) → nervous.', ex: 'I feel nervous before interviews.', exVi: 'Trước phỏng vấn tôi hay hồi hộp.' },
  { en: 'excited', ipa: '/ɪkˈsaɪ.t̬ɪd/', vi: 'háo hức', pos: 'adj', img: '🤩', connect: '"Íc-sai-tịt".', ex: 'The kids are excited about the trip.', exVi: 'Bọn trẻ háo hức về chuyến đi.' },
  { en: 'surprised', ipa: '/sɚˈpraɪzd/', vi: 'ngạc nhiên', pos: 'adj', img: '😮', connect: 'Surprise! — bất ngờ chưa!', ex: 'I was surprised to see him.', exVi: 'Tôi bất ngờ khi gặp anh ấy.' },
  { en: 'bored', ipa: '/bɔːrd/', vi: 'chán', pos: 'adj', img: '🥱', connect: '"Bo-đ" — chán muốn "bò" ra bàn.', ex: "I'm bored — let's go out.", exVi: 'Chán quá — ra ngoài chơi đi.' },
  { en: 'lonely', ipa: '/ˈloʊn.li/', vi: 'cô đơn', pos: 'adj', img: '🌙', connect: 'alone (một mình) → lonely (cô đơn).', ex: 'He feels lonely in the new city.', exVi: 'Anh ấy thấy cô đơn ở thành phố mới.' },
  { en: 'proud', ipa: '/praʊd/', vi: 'tự hào', pos: 'adj', img: '🦚', connect: '"Pờ-rao-d".', ex: 'I am proud of you.', exVi: 'Mình tự hào về bạn.' },
  { en: 'shy', ipa: '/ʃaɪ/', vi: 'nhút nhát', pos: 'adj', img: '😳', connect: '"Shai" — ngại ngùng đỏ mặt.', ex: 'She is too shy to speak.', exVi: 'Cô ấy nhát quá không dám nói.' },
  { en: 'funny', ipa: '/ˈfʌn.i/', vi: 'buồn cười', pos: 'adj', img: '🤣', connect: 'fun (vui) + ny — vui nhộn.', ex: 'That movie is really funny.', exVi: 'Phim đó buồn cười thật.' },
  { en: 'kind', ipa: '/kaɪnd/', vi: 'tốt bụng', pos: 'adj', img: '😇', connect: '"Kai-nd" — người kind ai cũng quý.', ex: 'Thank you, you are so kind.', exVi: 'Cảm ơn, bạn tốt quá.' },
  { en: 'friendly', ipa: '/ˈfrend.li/', vi: 'thân thiện', pos: 'adj', img: '🤗', connect: 'friend + ly — cư xử như bạn bè.', ex: 'People here are very friendly.', exVi: 'Người ở đây rất thân thiện.' },
  { en: 'smart', ipa: '/smɑːrt/', vi: 'thông minh', pos: 'adj', img: '🧠', connect: 'smartphone = điện thoại thông minh.', ex: 'She is the smartest in class.', exVi: 'Cô ấy thông minh nhất lớp.' },
  { en: 'lazy', ipa: '/ˈleɪ.zi/', vi: 'lười', pos: 'adj', img: '🦥', connect: '"Lêy-zi" — lười chảy thây.', ex: 'The cat is fat and lazy.', exVi: 'Con mèo vừa mập vừa lười.' },
  { en: 'brave', ipa: '/breɪv/', vi: 'dũng cảm', pos: 'adj', img: '🦁', connect: '"Bờ-rêy-v".', ex: 'Be brave and try again.', exVi: 'Dũng cảm thử lại nào.' },
  { en: 'honest', ipa: '/ˈɑː.nɪst/', vi: 'trung thực', pos: 'adj', img: '🤲', connect: 'Chữ h CÂM — đọc "O-nịt-st".', ex: 'He is an honest man.', exVi: 'Ông ấy là người trung thực.' },
  { en: 'polite', ipa: '/pəˈlaɪt/', vi: 'lịch sự', pos: 'adj', img: '🙇', connect: '"Pơ-lai-t".', ex: 'Always be polite to customers.', exVi: 'Luôn lịch sự với khách hàng.' },
  { en: 'rude', ipa: '/ruːd/', vi: 'thô lỗ', pos: 'adj', img: '😤', connect: '"Rút" — ngược với polite.', ex: "Don't be rude to your parents.", exVi: 'Đừng hỗn với bố mẹ.' },
  { en: 'quiet', ipa: '/ˈkwaɪ.ət/', vi: 'yên lặng', pos: 'adj', img: '🤫', connect: '"Quai-ợt" — đừng nhầm quite (khá).', ex: 'Please be quiet in the library.', exVi: 'Trong thư viện xin giữ yên lặng.' },
  { en: 'patient', ipa: '/ˈpeɪ.ʃənt/', vi: 'kiên nhẫn', pos: 'adj', img: '🧘', connect: 'Vừa là "kiên nhẫn" vừa là "bệnh nhân".', ex: 'Be patient — good things take time.', exVi: 'Kiên nhẫn nhé — điều tốt cần thời gian.' },
  { en: 'confident', ipa: '/ˈkɑːn.fə.dənt/', vi: 'tự tin', pos: 'adj', img: '😎', connect: '"Con-phi-đừnt".', ex: 'Speak loudly and be confident.', exVi: 'Nói to lên và tự tin vào.' },
  { en: 'serious', ipa: '/ˈsɪr.i.əs/', vi: 'nghiêm túc', pos: 'adj', img: '🧐', connect: 'Câu quen: Are you serious?', ex: 'Are you serious?', exVi: 'Bạn nói thật đấy à?' },
  { en: 'careful', ipa: '/ˈker.fəl/', vi: 'cẩn thận', pos: 'adj', img: '⚠️', connect: 'care + ful — đầy sự cẩn trọng.', ex: 'Be careful when you cross the street.', exVi: 'Qua đường cẩn thận nhé.' },
  { en: 'cute', ipa: '/kjuːt/', vi: 'dễ thương', pos: 'adj', img: '🐰', connect: '"Kiu-t" — cute như cún con.', ex: 'Your puppy is so cute!', exVi: 'Cún của bạn dễ thương ghê!' },
  { en: 'handsome', ipa: '/ˈhæn.səm/', vi: 'đẹp trai', pos: 'adj', img: '🤵', connect: 'Đọc "HAN-sừm" — chữ d câm.', ex: 'Her brother is very handsome.', exVi: 'Anh trai cô ấy đẹp trai lắm.' },
  { en: 'smile', ipa: '/smaɪl/', vi: 'mỉm cười', pos: 'verb', img: '😊', connect: '"Sờ-mai" — cười lên nào.', ex: 'She smiled at me.', exVi: 'Cô ấy mỉm cười với tôi.' },
  { en: 'cry', ipa: '/kraɪ/', vi: 'khóc', pos: 'verb', img: '😢', connect: '"Cờ-rai".', ex: 'The baby is crying.', exVi: 'Em bé đang khóc.' },
  { en: 'laugh', ipa: '/læf/', vi: 'cười to', pos: 'verb', img: '😂', connect: 'Đọc "láp" — đuôi -gh đọc là f.', ex: 'They laughed at the joke.', exVi: 'Cả đám cười ầm vì câu đùa.' },
  { en: 'feel', ipa: '/fiːl/', vi: 'cảm thấy', pos: 'verb', img: '💭', connect: '"Phiu" — hôm nay feel thế nào?', ex: 'How do you feel today?', exVi: 'Hôm nay bạn thấy trong người sao?' },
]

/* ------------------------------------------------------------------ */
/* 15) THIÊN NHIÊN & DU LỊCH                                           */
/* ------------------------------------------------------------------ */

const NATURE: IcesWord[] = [
  { en: 'sky', ipa: '/skaɪ/', vi: 'bầu trời', pos: 'noun', img: '🌌', connect: '"Sờ-kai".', ex: 'The sky is clear today.', exVi: 'Hôm nay trời quang.' },
  { en: 'sun', ipa: '/sʌn/', vi: 'mặt trời', pos: 'noun', img: '🌞', connect: 'Đồng âm son (con trai).', ex: 'The sun rises in the east.', exVi: 'Mặt trời mọc đằng đông.' },
  { en: 'moon', ipa: '/muːn/', vi: 'mặt trăng', pos: 'noun', img: '🌕', connect: '"Mun" — trăng tròn mùng một... à rằm!', ex: 'The moon is bright tonight.', exVi: 'Tối nay trăng sáng.' },
  { en: 'star', ipa: '/stɑːr/', vi: 'ngôi sao', pos: 'noun', img: '⭐', connect: '"Sờ-ta" — ngôi sao, cũng là minh tinh.', ex: 'I can see many stars tonight.', exVi: 'Tối nay thấy đầy sao trên trời.' },
  { en: 'cloud', ipa: '/klaʊd/', vi: 'mây', pos: 'noun', img: '☁️', connect: 'Lưu ảnh "lên mây" cũng là cloud.', ex: 'There are dark clouds — it may rain.', exVi: 'Mây đen kìa — chắc sắp mưa.' },
  { en: 'wind', ipa: '/wɪnd/', vi: 'gió', pos: 'noun', img: '🌬️', connect: '"Uynh-d".', ex: 'The wind is strong today.', exVi: 'Hôm nay gió mạnh.' },
  { en: 'snow', ipa: '/snoʊ/', vi: 'tuyết', pos: 'noun', img: '⛄', connect: 'Bạch Tuyết = Snow White.', ex: 'It snows a lot in Korea.', exVi: 'Ở Hàn tuyết rơi nhiều.' },
  { en: 'storm', ipa: '/stɔːrm/', vi: 'bão', pos: 'noun', img: '🌩️', connect: '"Sờ-tom".', ex: 'The storm is coming tonight.', exVi: 'Tối nay bão về.' },
  { en: 'sea', ipa: '/siː/', vi: 'biển', pos: 'noun', img: '🌊', connect: 'Đồng âm see (nhìn) — ra biển ngắm.', ex: 'We swim in the sea.', exVi: 'Bọn tôi tắm biển.' },
  { en: 'beach', ipa: '/biːtʃ/', vi: 'bãi biển', pos: 'noun', img: '🏖️', connect: '"Bít-ch" — nhớ kéo dài âm i.', ex: "Let's go to the beach!", exVi: 'Ra biển chơi đi!' },
  { en: 'river', ipa: '/ˈrɪv.ɚ/', vi: 'sông', pos: 'noun', img: '🏞️', connect: '"Ri-vơ".', ex: 'The river runs through the city.', exVi: 'Con sông chảy qua thành phố.' },
  { en: 'lake', ipa: '/leɪk/', vi: 'hồ', pos: 'noun', img: '🛶', connect: '"Lêy-k" — Hồ Gươm = Sword Lake.', ex: 'We walked around the lake.', exVi: 'Bọn tôi đi dạo quanh hồ.' },
  { en: 'mountain', ipa: '/ˈmaʊn.tən/', vi: 'núi', pos: 'noun', img: '⛰️', connect: '"Mao-từn".', ex: 'They climbed the mountain.', exVi: 'Họ leo núi.' },
  { en: 'forest', ipa: '/ˈfɔːr.ɪst/', vi: 'rừng', pos: 'noun', img: '🌲', connect: '"Pho-rịt-st".', ex: 'Many animals live in the forest.', exVi: 'Nhiều loài vật sống trong rừng.' },
  { en: 'tree', ipa: '/triː/', vi: 'cây', pos: 'noun', img: '🌳', connect: '"Tờ-ri".', ex: 'The kids climb the tree.', exVi: 'Bọn trẻ trèo cây.' },
  { en: 'flower', ipa: '/ˈflaʊ.ɚ/', vi: 'hoa', pos: 'noun', img: '🌺', connect: '"Phờ-lao-ơ".', ex: 'These flowers smell nice.', exVi: 'Hoa này thơm ghê.' },
  { en: 'grass', ipa: '/ɡræs/', vi: 'cỏ', pos: 'noun', img: '🌿', connect: '"Gờ-rát-s".', ex: "Don't walk on the grass.", exVi: 'Đừng giẫm lên cỏ.' },
  { en: 'animal', ipa: '/ˈæn.ə.məl/', vi: 'động vật', pos: 'noun', img: '🐾', connect: '"E-ni-mồ".', ex: 'What animal do you like?', exVi: 'Bạn thích con vật nào?' },
  { en: 'dog', ipa: '/dɑːɡ/', vi: 'chó', pos: 'noun', img: '🐶', connect: '"Đoóc".', ex: 'My dog waits for me at the door.', exVi: 'Con chó nhà tôi đợi tôi trước cửa.' },
  { en: 'cat', ipa: '/kæt/', vi: 'mèo', pos: 'noun', img: '🐱', connect: '"Két".', ex: 'The cat sleeps all day.', exVi: 'Con mèo ngủ cả ngày.' },
  { en: 'bird', ipa: '/bɝːd/', vi: 'chim', pos: 'noun', img: '🐦', connect: '"Bơ-d".', ex: 'Birds sing in the morning.', exVi: 'Chim hót buổi sáng.' },
  { en: 'island', ipa: '/ˈaɪ.lənd/', vi: 'hòn đảo', pos: 'noun', img: '🏝️', connect: 'Đọc "AI-lừnd" — chữ s CÂM.', ex: 'Phu Quoc is a beautiful island.', exVi: 'Phú Quốc là một hòn đảo đẹp.' },
  { en: 'map', ipa: '/mæp/', vi: 'bản đồ', pos: 'noun', img: '🗺️', connect: '"Mép" — mở map khỏi lạc.', ex: 'Look at the map first.', exVi: 'Xem bản đồ trước đã.' },
  { en: 'trip', ipa: '/trɪp/', vi: 'chuyến đi', pos: 'noun', img: '🧭', connect: '"Tờ-ríp" — đi trip cuối tuần.', ex: 'How was your trip?', exVi: 'Chuyến đi thế nào?' },
  { en: 'ticket', ipa: '/ˈtɪk.ɪt/', vi: 'vé', pos: 'noun', img: '🎫', connect: '"Tích-kịt".', ex: 'I bought two tickets.', exVi: 'Tôi mua hai vé.' },
  { en: 'passport', ipa: '/ˈpæs.pɔːrt/', vi: 'hộ chiếu', pos: 'noun', img: '🛂', connect: 'pass + port: giấy để qua cảng.', ex: "Don't forget your passport.", exVi: 'Đừng quên hộ chiếu nhé.' },
  { en: 'luggage', ipa: '/ˈlʌɡ.ɪdʒ/', vi: 'hành lý', pos: 'noun', img: '🧳', connect: '"Lắc-ghịt-djờ" — kéo hành lý lắc lư.', ex: 'My luggage is over 20 kilos.', exVi: 'Hành lý của tôi quá 20 ký.' },
  { en: 'camera', ipa: '/ˈkæm.rə/', vi: 'máy ảnh', pos: 'noun', img: '📷', connect: 'Như tiếng Việt vẫn gọi.', ex: 'I take photos with my camera.', exVi: 'Tôi chụp ảnh bằng máy ảnh.' },
  { en: 'road', ipa: '/roʊd/', vi: 'con đường', pos: 'noun', img: '🛣️', connect: '"Râu-d".', ex: 'This road goes to the airport.', exVi: 'Đường này ra sân bay.' },
  { en: 'bridge', ipa: '/brɪdʒ/', vi: 'cây cầu', pos: 'noun', img: '🌉', connect: '"Bờ-rít-djờ".', ex: 'We crossed the old bridge.', exVi: 'Bọn tôi băng qua cây cầu cũ.' },
]

export const UNITS: VocabUnit[] = [
  { id: 'nouns', name: 'Danh từ cốt lõi', sub: 'Người, đồ vật, đồ ăn quanh ta', pos: 'noun', tone: 'tone-a', emoji: '🧩', words: NOUNS },
  { id: 'verbs', name: 'Động từ cốt lõi', sub: 'Những hành động dùng mỗi ngày', pos: 'verb', tone: 'tone-c', emoji: '🏃', words: VERBS },
  { id: 'questions', name: 'Từ để hỏi', sub: 'Who, What, Where, When, Why, How', pos: 'question', tone: 'tone-d', emoji: '❓', words: QUESTIONS },
  { id: 'adjectives', name: 'Tính từ ứng dụng cao', sub: 'Good, bad, big, small, happy…', pos: 'adj', tone: 'tone-e', emoji: '🎨', words: ADJ },
  { id: 'places', name: 'Nơi chốn & đời sống', sub: 'Sân bay, nhà hàng, thời tiết, ý tưởng…', pos: 'noun', tone: 'tone-b', emoji: '🏙️', words: NOUNS2 },
  { id: 'verbs2', name: 'Động từ giao tiếp & sinh hoạt', sub: 'Ask, meet, play, pay, remember…', pos: 'verb', tone: 'tone-f', emoji: '🤝', words: VERBS2 },
  { id: 'adverbs', name: 'Trạng từ & tần suất', sub: 'Now, always, sometimes, very, too…', pos: 'adverb', tone: 'tone-b', emoji: '⏱️', words: ADVERBS },
  { id: 'preps', name: 'Giới từ & từ nối', sub: 'In, on, at, because, but, if…', pos: 'prep', tone: 'tone-f', emoji: '🔗', words: PREPS },
  { id: 'phrases', name: 'Cụm giao tiếp hằng ngày', sub: 'Thank you, excuse me, good luck…', pos: 'phrase', tone: 'tone-a', emoji: '💬', words: PHRASES },
  { id: 'body', name: 'Cơ thể & sức khoẻ', sub: 'Head, heart, sick, doctor, medicine…', pos: 'noun', tone: 'tone-d', emoji: '🫀', words: BODY },
  { id: 'timenum', name: 'Số đếm & thời gian', sub: 'One–ten, thứ trong tuần, bốn mùa…', pos: 'noun', tone: 'tone-a', emoji: '🕐', words: TIMENUM },
  { id: 'worklife', name: 'Công việc & học hành', sub: 'Office, meeting, salary, exam, skill…', pos: 'noun', tone: 'tone-c', emoji: '💼', words: WORKLIFE },
  { id: 'foodshop', name: 'Ăn uống & mua sắm', sub: 'Breakfast, menu, order, price, sale…', pos: 'noun', tone: 'tone-e', emoji: '🍜', words: FOODSHOP },
  { id: 'feelings', name: 'Cảm xúc & tính cách', sub: 'Angry, excited, kind, confident…', pos: 'adj', tone: 'tone-b', emoji: '💛', words: FEELINGS },
  { id: 'nature', name: 'Thiên nhiên & du lịch', sub: 'Sky, sea, mountain, trip, passport…', pos: 'noun', tone: 'tone-f', emoji: '🏝️', words: NATURE },
]

export const ALL_WORDS: IcesWord[] = UNITS.flatMap((u) => u.words)

/** Tổng số từ trong mục tiêu chương trình (đích 3000 từ để hiểu 90% hội thoại). */
export const TARGET_WORDS = 3000

/* ---------------------- KẾ HOẠCH 3 THÁNG (12 tuần) ---------------------- */

/**
 * Mỗi tuần là một danh sách NHIỆM VỤ cụ thể gắn với hành động thật trong app:
 *  - vocab : tự hoàn thành khi thuộc đủ % số từ của unit (đếm từ tập "đã thuộc").
 *  - quiz  : tự hoàn thành khi bài kiểm tra tuần đạt điểm yêu cầu.
 *  - video / speak / review / custom : người học tự tick, kèm nút nhảy tới đúng trang.
 */
export type WeekTaskKind = 'vocab' | 'total' | 'quiz' | 'video' | 'speak' | 'review' | 'custom'

/** Đích đến khi bấm nút hành động của nhiệm vụ. */
export type WeekTaskGo = 'learn' | 'quiz' | 'library' | 'speaking' | 'flashcards' | 'vocab' | 'summary' | null

export interface WeekTask {
  id: string
  kind: WeekTaskKind
  label: string
  /** vocab: unit và % số từ (cộng dồn) cần thuộc */
  unitId?: string
  pct?: number
  /** total: mốc KHO TỪ tích lũy (từ lõi + thẻ tiếng Anh mọi nguồn) hướng tới 3000 */
  targetTotal?: number
  /** quiz: điểm % cần đạt */
  passPct?: number
  /** Trang mở khi bấm nút hành động (mặc định suy ra từ kind) */
  go?: WeekTaskGo
}

/** Mẫu câu của tuần — phần "Compile": ghép từ đã học thành câu nói được ngay. */
export interface SentencePattern {
  pattern: string
  vi: string
  ex: string
  exVi: string
}

export interface WeekPlan {
  week: number
  month: 1 | 2 | 3
  phase: 'Compress' | 'Compile' | 'Consolidate'
  title: string
  focus: string
  /** Nhịp 7 ngày gợi ý, hiển thị trong chi tiết tuần */
  rhythm: string
  tasks: WeekTask[]
  /** Unit dùng cho bài kiểm tra tuần */
  quizUnits?: string[]
  patterns?: SentencePattern[]
}

export const PLAN_12_WEEKS: WeekPlan[] = [
  {
    week: 1, month: 1, phase: 'Compress', title: 'Danh từ quanh ta',
    focus: 'Người, gia đình, đồ vật quen thuộc — nền móng của mọi câu nói, cộng thói quen gom từ mỗi ngày.',
    rhythm: 'Ngày 1–6: ~5 từ lõi/ngày + gom thêm từ qua video · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS.',
    quizUnits: ['nouns'],
    tasks: [
      { id: 'w1-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Danh từ cốt lõi" (32 từ)', unitId: 'nouns', pct: 100 },
      { id: 'w1-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w1-bank', kind: 'total', label: 'Kho từ đạt 100 — lưu thêm từ khi xem video, gói từ, thẻ tự thêm', targetTotal: 100 },
      { id: 'w1-video', kind: 'video', label: 'Xem 2 video tiếng Anh dễ + bấm từ mới trong phụ đề để lưu' },
      { id: 'w1-review', kind: 'review', label: 'Vào Ôn tập (SRS) ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 2, month: 1, phase: 'Compress', title: 'Nơi chốn, ăn uống & mua sắm',
    focus: 'Sân bay, nhà hàng, chợ búa + gọi món, hỏi giá — bộ từ "sống sót" khi ra ngoài.',
    rhythm: 'Ngày 1–6: ~10 từ lõi/ngày (2 nhóm) · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS + nghe lại từ khó.',
    quizUnits: ['places', 'foodshop'],
    tasks: [
      { id: 'w2-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Nơi chốn & đời sống" (32 từ)', unitId: 'places', pct: 100 },
      { id: 'w2-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Ăn uống & mua sắm" (30 từ)', unitId: 'foodshop', pct: 100 },
      { id: 'w2-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w2-bank', kind: 'total', label: 'Kho từ đạt 250', targetTotal: 250 },
      { id: 'w2-review', kind: 'review', label: 'Ôn tập SRS ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 3, month: 1, phase: 'Compress', title: 'Từ để hỏi, con số & thời gian',
    focus: '5W1H + số đếm, thứ trong tuần, bốn mùa — đủ để hỏi giá, hỏi giờ, hẹn lịch.',
    rhythm: 'Ngày 1–2: từ để hỏi + cụm chào · Ngày 3–5: số đếm & thời gian · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['questions', 'phrases', 'timenum'],
    tasks: [
      { id: 'w3-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Từ để hỏi" (5W1H)', unitId: 'questions', pct: 100 },
      { id: 'w3-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cụm giao tiếp hằng ngày" (20 cụm)', unitId: 'phrases', pct: 100 },
      { id: 'w3-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Số đếm & thời gian" (30 từ)', unitId: 'timenum', pct: 100 },
      { id: 'w3-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w3-bank', kind: 'total', label: 'Kho từ đạt 450', targetTotal: 450 },
      { id: 'w3-speak', kind: 'speak', label: 'Luyện nói 1 buổi chào hỏi/tán gẫu với AI' },
    ],
  },
  {
    week: 4, month: 1, phase: 'Compress', title: 'Tính từ & cảm xúc',
    focus: 'good/bad, big/small + vui buồn giận sợ — nói được cảm nhận của mình, chốt tháng nền móng.',
    rhythm: 'Ngày 1–5: ~11 từ/ngày (2 nhóm) · Ngày 6: kiểm tra tổng tháng 1 · Ngày 7: ôn toàn bộ SRS.',
    quizUnits: ['adjectives', 'feelings'],
    tasks: [
      { id: 'w4-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Tính từ ứng dụng cao" (25 từ)', unitId: 'adjectives', pct: 100 },
      { id: 'w4-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cảm xúc & tính cách" (30 từ)', unitId: 'feelings', pct: 100 },
      { id: 'w4-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w4-bank', kind: 'total', label: 'Kho từ đạt 700 — chốt tháng 1', targetTotal: 700 },
      { id: 'w4-video', kind: 'video', label: 'Xem 2 video + bấm từ mới trong phụ đề để lưu thẻ' },
    ],
  },
  {
    week: 5, month: 2, phase: 'Compile', title: 'Động từ & câu đơn đầu tiên',
    focus: 'go, eat, see, do, have… và bắt đầu GHÉP CÂU: chủ ngữ + động từ + tân ngữ.',
    rhythm: 'Ngày 1–4: 7–8 động từ/ngày · Ngày 5–6: tập mẫu câu + kiểm tra · Ngày 7: tự đặt câu.',
    quizUnits: ['verbs'],
    patterns: [
      { pattern: 'I + động từ + …', vi: 'Nói điều mình làm', ex: 'I eat breakfast at seven.', exVi: 'Tôi ăn sáng lúc 7 giờ.' },
      { pattern: 'I want to + động từ', vi: 'Nói điều mình muốn', ex: 'I want to learn English.', exVi: 'Tôi muốn học tiếng Anh.' },
      { pattern: 'I need to + động từ', vi: 'Nói điều mình cần', ex: 'I need to buy some food.', exVi: 'Tôi cần mua ít đồ ăn.' },
      { pattern: "Let's + động từ", vi: 'Rủ ai đó cùng làm', ex: "Let's go to the park.", exVi: 'Mình ra công viên đi.' },
    ],
    tasks: [
      { id: 'w5-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Động từ cốt lõi" (30 từ)', unitId: 'verbs', pct: 100 },
      { id: 'w5-pattern', kind: 'custom', label: 'Tự đặt 5 câu theo 4 mẫu câu của tuần (nói to lên!)', go: null },
      { id: 'w5-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w5-bank', kind: 'total', label: 'Kho từ đạt 1000', targetTotal: 1000 },
      { id: 'w5-review', kind: 'review', label: 'Ôn tập SRS ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 6, month: 2, phase: 'Compile', title: 'Phủ định, Yes/No & cơ thể',
    focus: 'Động từ giao tiếp (ask, meet, pay…) + từ về cơ thể, sức khoẻ; nói "không", hỏi Yes/No, nhờ vả bằng can.',
    rhythm: 'Ngày 1–5: ~12 từ/ngày (2 nhóm) · Ngày 5: mẫu câu · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['verbs2', 'body'],
    patterns: [
      { pattern: 'S + be + tính từ', vi: 'Mô tả bằng "be"', ex: 'She is very kind.', exVi: 'Cô ấy rất tốt bụng.' },
      { pattern: "I don't + động từ", vi: 'Nói điều mình KHÔNG làm', ex: "I don't like coffee.", exVi: 'Tôi không thích cà phê.' },
      { pattern: 'Do you + động từ?', vi: 'Hỏi Yes/No', ex: 'Do you speak English?', exVi: 'Bạn có nói tiếng Anh không?' },
      { pattern: 'Can you + động từ?', vi: 'Nhờ vả, hỏi khả năng', ex: 'Can you help me?', exVi: 'Bạn giúp tôi được không?' },
    ],
    tasks: [
      { id: 'w6-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Động từ giao tiếp & sinh hoạt" (31 từ)', unitId: 'verbs2', pct: 100 },
      { id: 'w6-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cơ thể & sức khoẻ" (30 từ)', unitId: 'body', pct: 100 },
      { id: 'w6-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w6-bank', kind: 'total', label: 'Kho từ đạt 1300', targetTotal: 1300 },
      { id: 'w6-speak', kind: 'speak', label: 'Luyện nói 1 buổi — tập hỏi Yes/No với nhân vật AI' },
    ],
  },
  {
    week: 7, month: 2, phase: 'Compile', title: 'Hỏi đáp đời sống & công việc',
    focus: 'Giới từ & từ nối (in/on/at, because…) + từ công sở, trường lớp; hỏi thật: giá cả, đường đi, giờ giấc.',
    rhythm: 'Ngày 1–3: giới từ · Ngày 4–5: từ công việc + mẫu câu hỏi · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['preps', 'worklife'],
    patterns: [
      { pattern: 'What is …?', vi: 'Hỏi "cái gì"', ex: 'What is this called in English?', exVi: 'Cái này tiếng Anh gọi là gì?' },
      { pattern: 'Where is …?', vi: 'Hỏi đường, hỏi chỗ', ex: 'Where is the bathroom?', exVi: 'Nhà vệ sinh ở đâu?' },
      { pattern: 'How much …?', vi: 'Hỏi giá', ex: 'How much is this shirt?', exVi: 'Cái áo này bao nhiêu tiền?' },
      { pattern: 'What time …?', vi: 'Hỏi giờ giấc', ex: 'What time do you open?', exVi: 'Mấy giờ bên bạn mở cửa?' },
    ],
    tasks: [
      { id: 'w7-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Giới từ & từ nối" (22 từ)', unitId: 'preps', pct: 100 },
      { id: 'w7-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Công việc & học hành" (30 từ)', unitId: 'worklife', pct: 100 },
      { id: 'w7-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w7-bank', kind: 'total', label: 'Kho từ đạt 1650', targetTotal: 1650 },
      { id: 'w7-speak', kind: 'speak', label: 'Luyện nói: hỏi đường / gọi món / hỏi giá với AI' },
    ],
  },
  {
    week: 8, month: 2, phase: 'Compile', title: 'Mô tả, so sánh & thế giới quanh ta',
    focus: 'Trạng từ (very, too, always…) + thiên nhiên, du lịch; mô tả và so sánh — chốt tháng ghép câu.',
    rhythm: 'Ngày 1–3: trạng từ · Ngày 4–5: từ du lịch + mẫu câu mô tả · Ngày 6: kiểm tra tổng tháng 2 · Ngày 7: xem video.',
    quizUnits: ['adverbs', 'nature'],
    patterns: [
      { pattern: "It's too + tính từ", vi: 'Chê "quá …"', ex: "It's too expensive.", exVi: 'Đắt quá.' },
      { pattern: 'tính từ + -er than', vi: 'So sánh hơn', ex: 'This one is cheaper than that one.', exVi: 'Cái này rẻ hơn cái kia.' },
      { pattern: 'as + tính từ + as', vi: 'So sánh bằng', ex: 'He is as tall as his father.', exVi: 'Cậu ấy cao bằng bố.' },
      { pattern: 'look / sound + tính từ', vi: 'Trông / nghe có vẻ', ex: 'You look happy today.', exVi: 'Hôm nay trông bạn vui thế.' },
    ],
    tasks: [
      { id: 'w8-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Trạng từ & tần suất" (22 từ)', unitId: 'adverbs', pct: 100 },
      { id: 'w8-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Thiên nhiên & du lịch" (30 từ)', unitId: 'nature', pct: 100 },
      { id: 'w8-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w8-bank', kind: 'total', label: 'Kho từ đạt 2000 — chốt tháng 2, đã đi 2/3 chặng', targetTotal: 2000 },
      { id: 'w8-video', kind: 'video', label: 'Xem 2 video, để ý cách người bản xứ mô tả đồ vật' },
    ],
  },
  {
    week: 9, month: 3, phase: 'Consolidate', title: 'Tổng ôn ngắt quãng',
    focus: 'Đã thuộc hết ~400 từ lõi — dồn sức ôn SRS, lấp lỗ hổng và tiếp tục gom từ từ video.',
    rhythm: 'Mỗi ngày 10–15 phút SRS + 1 video gom từ · Ngày 6: tổng kiểm tra · Ngày 7: xem video thư giãn.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w9-review', kind: 'review', label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'w9-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w9-bank', kind: 'total', label: 'Kho từ đạt 2300', targetTotal: 2300 },
      { id: 'w9-custom', kind: 'custom', label: 'Viết 10 câu với những từ bạn hay quên nhất', go: null },
      { id: 'w9-video', kind: 'video', label: 'Xem 2 video tiếng Anh không nhìn phụ đề lượt đầu' },
    ],
  },
  {
    week: 10, month: 3, phase: 'Consolidate', title: 'Nghe & nhại (shadowing)',
    focus: 'Luyện tai và miệng: nhại theo người bản xứ từng câu bằng tab Shadowing trong Học video.',
    rhythm: 'Mỗi ngày 1 video ngắn: nghe → nhại từng câu → chấm phát âm · Ngày 6: kiểm tra · Ngày 7: nghỉ tai.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w10-video', kind: 'video', label: 'Shadowing 3 video (mở video → tab Shadowing/Phát âm)' },
      { id: 'w10-speak', kind: 'speak', label: 'Luyện nói 2 buổi với AI, cố nói cả câu dài' },
      { id: 'w10-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w10-bank', kind: 'total', label: 'Kho từ đạt 2550', targetTotal: 2550 },
      { id: 'w10-review', kind: 'review', label: 'Duy trì SRS ít nhất 3 ngày' },
    ],
  },
  {
    week: 11, month: 3, phase: 'Consolidate', title: 'Hội thoại theo chủ đề',
    focus: 'Áp dụng tất cả vào tình huống thật: du lịch, mua sắm, công việc, phỏng vấn.',
    rhythm: 'Cách ngày 1 buổi luyện nói chủ đề khác nhau · xen kẽ video · Ngày 7: kiểm tra.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w11-speak', kind: 'speak', label: 'Hoàn thành 3 tình huống Luyện nói (du lịch / mua sắm / công việc)' },
      { id: 'w11-video', kind: 'video', label: 'Xem 2 video đúng chủ đề bạn vừa luyện nói' },
      { id: 'w11-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w11-bank', kind: 'total', label: 'Kho từ đạt 2800', targetTotal: 2800 },
      { id: 'w11-review', kind: 'review', label: 'Duy trì SRS ít nhất 3 ngày' },
    ],
  },
  {
    week: 12, month: 3, phase: 'Consolidate', title: 'Tổng kết & tốt nghiệp',
    focus: 'Chạm mốc 3000 từ, bài tổng kết cuối lộ trình, xuất bộ từ ra Word/PDF và tự tin nói chuyện với AI.',
    rhythm: 'Ngày 1–3: ôn điểm yếu + gom nốt từ · Ngày 4: bài tổng kết · Ngày 5–6: hội thoại tự do · Ngày 7: 🎓.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w12-bank', kind: 'total', label: '🎯 KHO TỪ ĐẠT 3000 — mục tiêu lớn của cả lộ trình', targetTotal: 3000 },
      { id: 'w12-quiz', kind: 'quiz', label: 'Bài tổng kết cuối lộ trình đạt từ 80%', passPct: 80 },
      { id: 'w12-speak', kind: 'speak', label: 'Trò chuyện tự do 10 phút với AI, không nhìn gợi ý' },
      { id: 'w12-export', kind: 'custom', label: 'Xuất bộ từ đã thuộc ra Word/PDF làm "bằng chứng" 3 tháng', go: 'summary' },
      { id: 'w12-review', kind: 'review', label: 'Ôn SRS lần cuối — hẹn lịch ôn duy trì mỗi tuần' },
    ],
  },
]

/** Tổng số nhiệm vụ toàn lộ trình (dùng cho thanh tiến độ tổng). */
export const PLAN_TASK_TOTAL = PLAN_12_WEEKS.reduce((s, w) => s + w.tasks.length, 0)
