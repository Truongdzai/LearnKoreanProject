// Câu hỏi đuôi & câu hỏi gián tiếp. Mỗi câu chỉ một phương án đúng: không đưa đuôi cùng chiều sau câu khẳng định
// (So you're tired, are you? vẫn đúng khi tỏ ý ngạc nhiên), không dùng have / used to / must làm động từ chính,
// sau câu mệnh lệnh chỉ để will you là đúng; câu gián tiếp tránh who / what + be (Do you know who is the boss? vẫn đúng)
// và không lấy câu hỏi có / không đảo ngữ trần làm phương án sai (Can you tell me, is it open? vẫn nói được).

export type QuestionGroup = 'tagpos' | 'tagneg' | 'tagspecial' | 'indirect'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: QuestionGroup
}

export const GROUPS: Record<QuestionGroup, { name: string; form: string; rule: string; ex: string }> = {
  tagpos: {
    name: 'Khẳng định → đuôi phủ định',
    form: 'is → isn\'t · can → can\'t · will → won\'t · works → doesn\'t',
    rule: 'Vế trước khẳng định thì đuôi phủ định, viết rút gọn (isn\'t, don\'t…). Dùng lại be, trợ động từ hoặc can / will… của vế trước (không có thì mượn do / does / did) và đại từ thay cho chủ ngữ.',
    ex: 'He works here, doesn\'t he?',
  },
  tagneg: {
    name: 'Phủ định → đuôi khẳng định',
    form: 'isn\'t → is · didn\'t → did · never / hardly / nobody → khẳng định',
    rule: 'Vế trước phủ định thì đuôi khẳng định. Các từ never, hardly, nobody đã mang nghĩa phủ định nên đuôi cũng ở dạng khẳng định.',
    ex: 'She never eats meat, does she?',
  },
  tagspecial: {
    name: 'Trường hợp đặc biệt',
    form: 'I am → aren\'t I · Let\'s → shall we · mệnh lệnh → will you · There is → isn\'t there',
    rule: 'I\'m not → am I (không dùng aren\'t I). Nothing / everything, this / that → it; everyone / nobody, these / those → they; câu There is / are giữ there ở đuôi.',
    ex: 'Let\'s go out tonight, shall we?',
  },
  indirect: {
    name: 'Câu hỏi gián tiếp',
    form: 'Could you tell me / Do you know + từ để hỏi + chủ ngữ + động từ',
    rule: 'Sau Could you tell me, Do you know, I wonder… không đảo ngữ và bỏ do / does / did, động từ chia lại theo chủ ngữ và thì (did he live → he lived). Câu hỏi có / không thì dùng if hoặc whether.',
    ex: 'Could you tell me where the bank is?',
  },
}

type Raw = [string, string, [string, string, string] | [string, string, string, string], QuestionGroup]

const RAW: Raw[] = [
  ['It\'s really hot today, ___?', 'Hôm nay trời nóng thật, nhỉ?', ['isn\'t it', 'doesn\'t it', 'wasn\'t it', 'aren\'t it'], 'tagpos'],
  ['You\'re from Hue, ___?', 'Bạn là người Huế, phải không?', ['aren\'t you', 'don\'t you', 'isn\'t it', 'weren\'t you'], 'tagpos'],
  ['Your sister works in a bank, ___?', 'Chị gái bạn làm ở ngân hàng, phải không?', ['doesn\'t she', 'isn\'t she', 'don\'t she', 'doesn\'t he'], 'tagpos'],
  ['They moved to Da Nang last year, ___?', 'Năm ngoái họ chuyển đến Đà Nẵng, phải không?', ['didn\'t they', 'don\'t they', 'weren\'t they', 'haven\'t they'], 'tagpos'],
  ['You\'ll call me when you arrive, ___?', 'Đến nơi bạn sẽ gọi cho mình, đúng không?', ['won\'t you', 'don\'t you', 'aren\'t you', 'willn\'t you'], 'tagpos'],
  ['He can speak Japanese, ___?', 'Anh ấy nói được tiếng Nhật, đúng không?', ['can\'t he', 'doesn\'t he', 'isn\'t he', 'couldn\'t he'], 'tagpos'],
  ['We\'ve met before, ___?', 'Chúng ta đã gặp nhau rồi, phải không?', ['haven\'t we', 'don\'t we', 'aren\'t we', 'hadn\'t we'], 'tagpos'],
  ['The film was boring, ___?', 'Bộ phim chán thật, nhỉ?', ['wasn\'t it', 'didn\'t it', 'isn\'t it', 'weren\'t it'], 'tagpos'],
  ['Your parents live in Can Tho, ___?', 'Bố mẹ bạn sống ở Cần Thơ, phải không?', ['don\'t they', 'doesn\'t they', 'aren\'t they', 'don\'t you'], 'tagpos'],
  ['She was at the office yesterday, ___?', 'Hôm qua cô ấy có ở văn phòng, phải không?', ['wasn\'t she', 'didn\'t she', 'isn\'t she', 'wasn\'t it'], 'tagpos'],
  ['You\'ve finished the report, ___?', 'Bạn làm xong báo cáo rồi, phải không?', ['haven\'t you', 'don\'t you', 'aren\'t you', 'hasn\'t you'], 'tagpos'],
  ['You like spicy food, ___?', 'Bạn thích đồ cay, đúng không?', ['don\'t you', 'aren\'t you', 'isn\'t it', 'doesn\'t you'], 'tagpos'],

  ['Your brother doesn\'t drink coffee, ___?', 'Anh trai bạn không uống cà phê, phải không?', ['does he', 'doesn\'t he', 'is he', 'do he'], 'tagneg'],
  ['You didn\'t lock the door, ___?', 'Bạn chưa khóa cửa, đúng không?', ['did you', 'didn\'t you', 'do you', 'were you'], 'tagneg'],
  ['It isn\'t far from here, ___?', 'Chỗ đó cách đây không xa, phải không?', ['is it', 'isn\'t it', 'does it', 'was it'], 'tagneg'],
  ['They can\'t come tonight, ___?', 'Tối nay họ không đến được, phải không?', ['can they', 'can\'t they', 'do they', 'could they'], 'tagneg'],
  ['He never calls his mother, ___?', 'Anh ấy chẳng bao giờ gọi điện cho mẹ, phải không?', ['does he', 'doesn\'t he', 'is he', 'did he'], 'tagneg'],
  ['You hardly ever cook at home, ___?', 'Bạn hầu như chẳng mấy khi nấu ăn ở nhà, phải không?', ['do you', 'don\'t you', 'are you', 'did you'], 'tagneg'],
  ['Nobody called while I was out, ___?', 'Lúc tôi đi vắng không có ai gọi điện, phải không?', ['did they', 'didn\'t they', 'do they', 'was it'], 'tagneg'],
  ['We aren\'t late, ___?', 'Chúng ta không bị muộn, phải không?', ['are we', 'aren\'t we', 'do we', 'were we'], 'tagneg'],
  ['She hasn\'t replied to your email yet, ___?', 'Cô ấy vẫn chưa trả lời email của bạn, phải không?', ['has she', 'hasn\'t she', 'did she', 'does she'], 'tagneg'],
  ['You won\'t tell anyone, ___?', 'Bạn sẽ không kể với ai chứ?', ['will you', 'won\'t you', 'do you', 'would you'], 'tagneg'],
  ['The bus wasn\'t on time this morning, ___?', 'Sáng nay xe buýt không đến đúng giờ, phải không?', ['was it', 'wasn\'t it', 'did it', 'is it'], 'tagneg'],

  ['I\'m in the right room, ___?', 'Tôi vào đúng phòng rồi, phải không?', ['aren\'t I', 'isn\'t I', 'don\'t I', 'aren\'t you'], 'tagspecial'],
  ['I\'m not late, ___?', 'Tôi không đến muộn chứ?', ['am I', 'aren\'t I', 'do I', 'isn\'t it'], 'tagspecial'],
  ['Let\'s take a taxi, ___?', 'Mình đi taxi nhé?', ['shall we', 'don\'t we', 'do we', 'aren\'t we'], 'tagspecial'],
  ['Close the door, ___?', 'Đóng giúp mình cái cửa nhé?', ['will you', 'don\'t you', 'do you', 'aren\'t you'], 'tagspecial'],
  ['Don\'t forget your passport, ___?', 'Đừng quên mang hộ chiếu nhé?', ['will you', 'do you', 'don\'t you', 'are you'], 'tagspecial'],
  ['There\'s a pharmacy near here, ___?', 'Gần đây có hiệu thuốc, phải không?', ['isn\'t there', 'isn\'t it', 'doesn\'t it', 'aren\'t there'], 'tagspecial'],
  ['There aren\'t any seats left, ___?', 'Không còn ghế trống nào, phải không?', ['are there', 'aren\'t there', 'are they', 'is it'], 'tagspecial'],
  ['Nothing is wrong, ___?', 'Không có chuyện gì đâu, phải không?', ['is it', 'isn\'t it', 'does it', 'are they'], 'tagspecial'],
  ['Everything is ready for the meeting, ___?', 'Mọi thứ cho cuộc họp đã sẵn sàng, phải không?', ['isn\'t it', 'aren\'t they', 'doesn\'t it', 'isn\'t there'], 'tagspecial'],
  ['Everyone is here, ___?', 'Mọi người đến đủ cả rồi, phải không?', ['aren\'t they', 'isn\'t it', 'don\'t they', 'isn\'t everyone'], 'tagspecial'],
  ['These are your keys, ___?', 'Đây là chìa khóa của bạn, phải không?', ['aren\'t they', 'isn\'t it', 'aren\'t these', 'don\'t they'], 'tagspecial'],
  ['That\'s your new car, ___?', 'Kia là xe mới của bạn, phải không?', ['isn\'t it', 'aren\'t they', 'doesn\'t it', 'wasn\'t it'], 'tagspecial'],

  ['Could you tell me where ___?', 'Bạn chỉ giúp tôi nhà ga ở đâu được không?', ['the station is', 'is the station', 'does the station', 'the station'], 'indirect'],
  ['Do you know what time ___?', 'Bạn có biết tàu đã chạy lúc mấy giờ không?', ['the train left', 'did the train leave', 'the train leave', 'left the train'], 'indirect'],
  ['Do you know ___ open on Sunday?', 'Bạn có biết Chủ nhật này cửa hàng có mở cửa không?', ['if the shop is', 'if is the shop', 'if the shop'], 'indirect'],
  ['I wonder ___ tomorrow.', 'Không biết ngày mai trời có mưa không.', ['if it will rain', 'if will it rain', 'it will rain', 'if it rain'], 'indirect'],
  ['Do you know where ___?', 'Bạn có biết anh ấy sống ở đâu không?', ['he lives', 'does he live', 'he live', 'lives he'], 'indirect'],
  ['Could you tell me what ___?', 'Bạn kể cho tôi nghe cô ấy đã nói gì được không?', ['she said', 'did she say', 'she say', 'said she'], 'indirect'],
  ['I don\'t know why ___ so angry.', 'Tôi không hiểu sao anh ấy lại giận đến thế.', ['he is', 'is he', 'does he', 'he'], 'indirect'],
  ['Do you know when ___?', 'Bạn có biết khi nào cuộc họp bắt đầu không?', ['the meeting starts', 'does the meeting start', 'the meeting start', 'starts the meeting'], 'indirect'],
  ['Can you tell me ___ open today?', 'Bạn cho tôi biết hôm nay bảo tàng có mở cửa không?', ['whether the museum is', 'whether is the museum', 'whether the museum'], 'indirect'],
  ['I\'d like to know how long ___.', 'Tôi muốn biết chuyến bay mất bao lâu.', ['the flight takes', 'does the flight take', 'the flight take', 'takes the flight'], 'indirect'],
  ['Do you remember where ___ the car?', 'Bạn có nhớ chúng ta đã đỗ xe ở đâu không?', ['we parked', 'did we park', 'did we parked', 'parked we'], 'indirect'],
  ['Can you tell me how much ___?', 'Bạn cho tôi biết cái áo này giá bao nhiêu được không?', ['this shirt costs', 'does this shirt cost', 'costs this shirt', 'this shirt is cost'], 'indirect'],
  ['Could you tell me where ___ a taxi?', 'Bạn chỉ giúp tôi có thể bắt taxi ở đâu được không?', ['I can get', 'can I get', 'I get can', 'do I can get'], 'indirect'],
  ['I\'m not sure ___ the answer.', 'Tôi không chắc anh ấy có biết câu trả lời không.', ['whether he knows', 'whether does he know', 'whether he know', 'he knows whether'], 'indirect'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, group]) => ({ id: en, en, vi, options: opts, answer: opts[0], group }))

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

// Câu không có gợi ý trong ngoặc: thay thẳng chỗ trống bằng đáp án
export const filled = (f: Frame) => f.en.replace(/___(\s*\([^)]*\))?/, f.answer)
