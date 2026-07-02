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
