export interface PhoneInfo {
  sym: string
  rom?: string
  how: string
  trap?: string
  drill?: string[]
}

export interface PhoneFix {
  key: string
  title: string
  why: string
  how: string
  drill: string[]
}

type Info = Omit<PhoneInfo, 'sym'>

const EN: Record<string, PhoneInfo> = {
  AA: {
    sym: 'ɑː',
    how: 'Hạ hàm xuống thật thấp, lưỡi nằm thấp và lùi về sau, giữ âm dài.',
    trap: 'Đọc cụt như “a” tiếng Việt nên mất độ dài.',
    drill: ['father', 'car', 'hot', 'stop'],
  },
  AE: {
    sym: 'æ',
    how: 'Hạ hàm gần như /ɑː/ nhưng kéo lưỡi ra trước và bè miệng sang hai bên; âm nằm lưng chừng giữa “a” và “e”.',
    trap: 'Đọc thẳng thành “e” nên bad nghe ra bed.',
    drill: ['cat', 'bad', 'man', 'happy'],
  },
  AH: {
    sym: 'ə',
    how: 'Miệng gần như không mở, lưỡi buông lỏng ở giữa khoang miệng, âm ngắn và nhẹ. Ở âm tiết có trọng âm thì mở hơn và nghe rõ hơn (âm /ʌ/ trong cup).',
    trap: 'Đọc rõ và nặng như “â”, làm âm tiết không nhấn nghe to bằng âm tiết nhấn.',
    drill: ['cup', 'about', 'sofa', 'again'],
  },
  AO: {
    sym: 'ɔː',
    how: 'Chu tròn môi, đẩy lưỡi về sau và hạ thấp, giữ âm dài.',
    trap: 'Đọc thành “o” ngắn kiểu tiếng Việt.',
    drill: ['talk', 'saw', 'four', 'door'],
  },
  AW: {
    sym: 'aʊ',
    how: 'Mở “a” rồi trượt liền sang “u” tròn môi trong cùng một hơi.',
    trap: 'Tách thành hai tiếng rời “a — u”.',
    drill: ['how', 'out', 'down', 'house'],
  },
  AY: {
    sym: 'aɪ',
    how: 'Mở “a” rồi trượt lên “i”, hàm khép dần lại.',
    trap: 'Đọc cụt mất phần trượt lên “i”.',
    drill: ['my', 'time', 'five', 'like'],
  },
  B: {
    sym: 'b',
    how: 'Ngậm chặt hai môi, dồn hơi rồi bật ra, dây thanh rung ngay từ đầu.',
    trap: 'Ở cuối từ hay bị nuốt hoặc biến thành /p/.',
    drill: ['big', 'job', 'cab', 'club'],
  },
  CH: {
    sym: 'tʃ',
    how: 'Đầu lưỡi chặn hơi ở lợi trên rồi thả ra thành tiếng xì “sh” — cả hai gọn trong một nhịp.',
    trap: 'Đọc thành “ch” tiếng Việt, thiếu hẳn phần xì phía sau.',
    drill: ['church', 'watch', 'teach', 'chair'],
  },
  D: {
    sym: 'd',
    how: 'Đầu lưỡi chạm lợi trên, chặn rồi bật ra, dây thanh rung.',
    trap: 'Ở cuối từ bị nuốt hoặc đọc thành /t/.',
    drill: ['do', 'red', 'need', 'bad'],
  },
  DH: {
    sym: 'ð',
    how: 'Thè nhẹ đầu lưỡi chạm mép răng cửa trên, đẩy hơi qua khe, dây thanh RUNG.',
    trap: 'Đọc thành /d/ hoặc /z/ vì tiếng Việt không có âm này.',
    drill: ['this', 'that', 'mother', 'they'],
  },
  EH: {
    sym: 'e',
    how: 'Miệng mở vừa, lưỡi ở phía trước, âm ngắn — gần giống “e” tiếng Việt.',
    drill: ['bed', 'ten', 'said', 'friend'],
  },
  ER: {
    sym: 'ɜr',
    how: 'Nâng và cuộn nhẹ thân lưỡi lên giữa miệng, lưỡi không chạm vào đâu, giữ hơi đều. Ở âm tiết không nhấn thì nhẹ và ngắn hơn (âm /ər/ trong teacher).',
    trap: 'Bỏ mất phần cuộn lưỡi nên chỉ còn “ơ”.',
    drill: ['bird', 'her', 'teacher', 'work'],
  },
  EY: {
    sym: 'eɪ',
    how: 'Bắt đầu ở “ê” rồi trượt lên “i”, khép hàm dần.',
    trap: 'Đọc thành “ê” một nhịp, mất đuôi “i”.',
    drill: ['day', 'make', 'eight', 'name'],
  },
  F: {
    sym: 'f',
    how: 'Đặt răng cửa trên lên môi dưới rồi thổi hơi ra, dây thanh KHÔNG rung.',
    trap: 'Ở cuối từ hay bị nuốt mất.',
    drill: ['fine', 'off', 'laugh', 'half'],
  },
  G: {
    sym: 'ɡ',
    how: 'Gốc lưỡi chặn ngạc mềm rồi bật ra, dây thanh rung.',
    trap: 'Ở cuối từ biến thành /k/ hoặc mất hẳn.',
    drill: ['go', 'big', 'bag', 'egg'],
  },
  HH: {
    sym: 'h',
    how: 'Hơi thoát tự do từ họng, không bộ phận nào chặn lại.',
    trap: 'Bỏ quên /h/ ở đầu từ.',
    drill: ['he', 'hot', 'behind', 'happy'],
  },
  IH: {
    sym: 'ɪ',
    how: 'Môi thả lỏng, hé nhẹ; lưỡi thấp hơn /iː/ một chút; âm rất ngắn.',
    trap: 'Kéo dài và căng thành /iː/ — ship nghe ra sheep.',
    drill: ['sit', 'ship', 'big', 'fish'],
  },
  IY: {
    sym: 'iː',
    how: 'Kéo môi sang hai bên như đang cười, lưỡi cao và ra trước, giữ âm dài.',
    trap: 'Đọc ngắn lại thành /ɪ/ — sheep nghe ra ship.',
    drill: ['see', 'sheep', 'eat', 'tree'],
  },
  JH: {
    sym: 'dʒ',
    how: 'Giống /tʃ/ nhưng dây thanh rung suốt cả hai phần.',
    trap: 'Đọc thành “gi” hoặc /z/.',
    drill: ['job', 'age', 'bridge', 'judge'],
  },
  K: {
    sym: 'k',
    how: 'Gốc lưỡi chặn ngạc mềm rồi bật ra kèm một luồng hơi rõ ở đầu từ.',
    trap: 'Ở cuối từ bị nuốt hoàn toàn.',
    drill: ['cat', 'book', 'like', 'walk'],
  },
  L: {
    sym: 'l',
    how: 'Đầu lưỡi chạm hẳn vào lợi trên, hơi thoát ra hai bên lưỡi. Ở cuối từ thì nâng gốc lưỡi, nghe gần “ơu”.',
    trap: 'Bỏ /l/ cuối từ hoặc đổi thành /n/.',
    drill: ['like', 'call', 'people', 'feel'],
  },
  M: {
    sym: 'm',
    how: 'Ngậm hai môi, hơi thoát qua mũi.',
    drill: ['me', 'time', 'some', 'him'],
  },
  N: {
    sym: 'n',
    how: 'Đầu lưỡi chạm lợi trên, hơi thoát qua mũi.',
    trap: 'Lẫn với /l/ hoặc /ŋ/ ở cuối từ.',
    drill: ['no', 'ten', 'man', 'run'],
  },
  NG: {
    sym: 'ŋ',
    how: 'Gốc lưỡi chạm ngạc mềm, hơi ra mũi, KHÔNG bật thêm âm /g/ ở đuôi.',
    trap: 'Thêm tiếng “g” rõ ở cuối hoặc đọc thành /n/.',
    drill: ['sing', 'long', 'thinking', 'young'],
  },
  OW: {
    sym: 'oʊ',
    how: 'Bắt đầu ở “ô” rồi trượt về “u”, môi tròn dần lại.',
    trap: 'Đọc thành “ô” một nhịp, mất đuôi “u”.',
    drill: ['go', 'no', 'boat', 'know'],
  },
  OY: {
    sym: 'ɔɪ',
    how: 'Tròn môi ở “o” rồi trượt lên “i”.',
    drill: ['boy', 'coin', 'enjoy', 'voice'],
  },
  P: {
    sym: 'p',
    how: 'Ngậm hai môi, dồn hơi rồi bật mạnh — ở đầu từ phải nghe thấy luồng hơi.',
    trap: 'Bật quá nhẹ nên nghe thành /b/.',
    drill: ['pen', 'happy', 'stop', 'park'],
  },
  R: {
    sym: 'r',
    how: 'Lùi và cuộn nhẹ lưỡi, đầu lưỡi KHÔNG chạm vào đâu cả, môi hơi tròn.',
    trap: 'Rung lưỡi kiểu “r” tiếng Việt, hoặc đọc thành /z/, /g/.',
    drill: ['red', 'very', 'work', 'sorry'],
  },
  S: {
    sym: 's',
    how: 'Đầu lưỡi đưa gần lợi trên, đẩy hơi qua khe hẹp thành tiếng xì, không rung.',
    trap: 'Nuốt mất /s/ cuối nên mất luôn dấu hiệu số nhiều.',
    drill: ['see', 'bus', 'books', 'yes'],
  },
  SH: {
    sym: 'ʃ',
    how: 'Lưỡi lùi về sau hơn /s/, môi hơi chu, tiếng xì trầm và dày hơn.',
    trap: 'Đọc thành /s/.',
    drill: ['she', 'wash', 'fish', 'sure'],
  },
  T: {
    sym: 't',
    how: 'Đầu lưỡi chạm lợi trên, chặn hơi rồi bật ra.',
    trap: 'Nuốt /t/ cuối, hoặc thêm “ơ” thành “tơ”.',
    drill: ['time', 'get', 'sit', 'water'],
  },
  TH: {
    sym: 'θ',
    how: 'Thè nhẹ đầu lưỡi chạm mép răng cửa trên rồi thổi hơi qua, dây thanh KHÔNG rung.',
    trap: 'Đọc thành /t/ hoặc /s/ vì tiếng Việt không có âm này.',
    drill: ['think', 'three', 'math', 'thank'],
  },
  UH: {
    sym: 'ʊ',
    how: 'Môi tròn nhẹ, lưỡi lùi, âm ngắn và lỏng.',
    trap: 'Kéo dài và chu môi mạnh thành /uː/.',
    drill: ['book', 'good', 'put', 'look'],
  },
  UW: {
    sym: 'uː',
    how: 'Chu môi tròn nhỏ, lưỡi cao và lùi, giữ âm dài.',
    trap: 'Đọc ngắn lại thành /ʊ/.',
    drill: ['food', 'blue', 'two', 'school'],
  },
  V: {
    sym: 'v',
    how: 'Đặt răng cửa trên lên môi dưới như /f/ nhưng dây thanh RUNG và hơi ra liên tục.',
    trap: 'Đọc bằng hai môi thành /b/, hoặc thành “d” theo cách nói miền Nam.',
    drill: ['very', 'love', 'five', 'video'],
  },
  W: {
    sym: 'w',
    how: 'Chu tròn môi rồi mở nhanh sang nguyên âm sau; răng không chạm môi.',
    trap: 'Cho răng chạm môi nên thành /v/.',
    drill: ['we', 'want', 'away', 'win'],
  },
  Y: {
    sym: 'j',
    how: 'Nâng thân lưỡi gần vòm như sắp nói “i” rồi trượt ngay sang nguyên âm sau.',
    drill: ['yes', 'you', 'young', 'yellow'],
  },
  Z: {
    sym: 'z',
    how: 'Giống /s/ nhưng dây thanh rung; ở cuối từ phải giữ tiếng rung đủ nghe.',
    trap: 'Đọc thành /s/ nên mất phân biệt.',
    drill: ['zoo', 'is', 'cheese', 'because'],
  },
  ZH: {
    sym: 'ʒ',
    how: 'Giống /ʃ/ nhưng dây thanh rung.',
    trap: 'Đọc thành /z/ hoặc /ʃ/.',
    drill: ['measure', 'vision', 'usual', 'garage'],
  },
}

const EN_VOWELS = new Set(['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'])
const EN_LONG = new Set(['IY', 'UW', 'AO', 'AA', 'ER'])
const EN_SHORT = new Set(['IH', 'UH', 'AH', 'EH', 'AE'])
const EN_VOICED: Record<string, string> = {
  B: 'P', D: 'T', G: 'K', V: 'F', Z: 'S', ZH: 'SH', DH: 'TH', JH: 'CH',
}
const EN_VOICELESS: Record<string, string> = Object.fromEntries(
  Object.entries(EN_VOICED).map(([a, b]) => [b, a]),
)

const EN_PAIR: Record<string, string> = {
  'TH|T': 'Lưỡi bạn đang chặn kín ở lợi nên ra /t/. Âm /θ/ không chặn: lưỡi chỉ chạm hờ mép răng cho hơi lọt qua liên tục.',
  'TH|S': 'Lưỡi bạn đang nằm sau răng nên ra /s/. Đưa đầu lưỡi ra thêm chừng 2–3 mm cho chạm mép răng cửa trên rồi mới thổi hơi.',
  'TH|F': 'Bạn đang thổi ở môi. Bỏ môi ra, dùng đầu lưỡi chạm răng cửa trên.',
  'DH|D': 'Bạn chặn kín lưỡi ở lợi. Với /ð/, để lưỡi hờ ở mép răng cho hơi ra liên tục, không bật.',
  'DH|Z': 'Lưỡi lùi quá sâu. Đưa đầu lưỡi ra chạm mép răng cửa trên, vẫn giữ rung.',
  'IY|IH': 'Bạn cắt âm quá sớm. Kéo môi sang hai bên và giữ dài gần gấp đôi thì mới ra /iː/.',
  'IH|IY': 'Bạn kéo dài và căng môi quá. Thả lỏng môi, đọc thật ngắn và gọn.',
  'UW|UH': 'Bạn cắt âm quá sớm. Chu môi tròn hơn và giữ dài gấp đôi.',
  'UH|UW': 'Bạn giữ âm quá dài. Buông lỏng môi, cắt thật nhanh.',
  'AE|EH': 'Bạn mở miệng chưa đủ. Hạ hàm xuống thêm và đưa lưỡi ra trước, âm nghe hơi bẹt.',
  'EH|AE': 'Bạn mở miệng quá rộng. Khép hàm lại, giữ lưỡi ở tầm giữa.',
  'AA|AO': 'Bạn đang tròn môi. Với /ɑː/, môi để tự nhiên, chỉ hạ hàm.',
  'AO|AA': 'Bạn quên tròn môi. Chu môi lại rồi mới phát âm.',
  'AH|AA': 'Bạn mở miệng quá rộng cho một âm không nhấn. /ə/ đọc nhẹ, ngắn, gần như nuốt.',
  'ER|AH': 'Bạn thiếu phần cuộn lưỡi. Nâng thân lưỡi lên giữa miệng và giữ đều thì mới ra /ɜr/.',
  'V|B': 'Bạn đang dùng hai môi. Đặt răng cửa trên lên môi dưới, giữ hơi ra liên tục thay vì bật một phát.',
  'V|W': 'Bạn chỉ chu môi. Cho răng cửa trên chạm hẳn vào môi dưới.',
  'W|V': 'Bạn cho răng chạm môi. /w/ chỉ chu tròn môi, răng không chạm gì cả.',
  'R|L': 'Đầu lưỡi bạn đang chạm lợi. /r/ không chạm vào đâu cả — cuộn lưỡi lùi lại và hơi tròn môi.',
  'L|R': 'Đầu lưỡi bạn đang lơ lửng. /l/ phải chạm hẳn vào lợi trên.',
  'L|N': 'Hơi của bạn đang thoát ra mũi. Hạ vòm miệng xuống cho hơi thoát hai bên lưỡi.',
  'N|L': 'Bạn để hơi ra miệng. Với /n/, hơi phải ra bằng mũi.',
  'N|NG': 'Bạn nâng gốc lưỡi lên. Với /n/, đầu lưỡi chạm lợi trên còn gốc lưỡi hạ xuống.',
  'NG|N': 'Bạn chạm đầu lưỡi vào lợi. Với /ŋ/, đầu lưỡi buông tự do, gốc lưỡi mới là chỗ chặn.',
  'S|SH': 'Lưỡi bạn lùi quá sâu và môi chu. Đưa đầu lưỡi lên gần lợi, môi kéo ngang.',
  'SH|S': 'Lưỡi bạn ở quá trước. Lùi lưỡi về sau một chút và chu nhẹ môi.',
  'CH|SH': 'Bạn thiếu phần chặn ở đầu. /tʃ/ phải chặn hơi bằng lưỡi trước rồi mới thả thành tiếng xì.',
  'SH|CH': 'Bạn chặn hơi thừa. /ʃ/ để hơi ra liên tục ngay từ đầu.',
  'CH|T': 'Bạn dừng ở phần chặn mà quên thả. Sau khi chặn, thả lưỡi ra thành tiếng xì.',
  'JH|Z': 'Bạn thiếu phần chặn ở đầu. /dʒ/ chặn hơi bằng lưỡi rồi mới thả ra.',
  'F|P': 'Bạn ngậm hai môi rồi bật. /f/ để răng trên chạm môi dưới và thổi hơi liên tục.',
  'P|F': 'Bạn để hơi xì liên tục. /p/ phải ngậm kín hai môi, dồn hơi rồi bật một phát.',
}

const KO_L = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const KO_V = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const KO_T = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

const KO_INIT: Record<string, Info> = {
  'ㄱ': { rom: 'g/k', how: 'Gốc lưỡi chạm ngạc mềm rồi bật RẤT nhẹ, không có luồng hơi. Đầu từ nghe gần “k”, giữa từ nghe gần “g”.', trap: 'Bật hơi mạnh nên thành ㅋ.', drill: ['가다', '고기', '가방'] },
  'ㄲ': { rom: 'kk', how: 'Căng cứng cổ họng và gốc lưỡi, nén hơi rồi bung ra gọn, tuyệt đối không có gió.', trap: 'Đọc lỏng thành ㄱ hoặc bật hơi thành ㅋ.', drill: ['까치', '꿈', '끝'] },
  'ㅋ': { rom: 'k', how: 'Như ㄱ nhưng đẩy một luồng hơi mạnh — để bàn tay trước miệng phải thấy gió.', trap: 'Bật quá nhẹ nên thành ㄱ.', drill: ['코', '커피', '크다'] },
  'ㄴ': { rom: 'n', how: 'Đầu lưỡi chạm lợi trên, hơi thoát qua mũi.', drill: ['나', '누나', '나라'] },
  'ㄷ': { rom: 'd/t', how: 'Đầu lưỡi chạm lợi trên, bật nhẹ, không có gió.', trap: 'Bật hơi mạnh nên thành ㅌ.', drill: ['다리', '도시', '더위'] },
  'ㄸ': { rom: 'tt', how: 'Căng lưỡi và cổ họng, nén rồi bung gọn, không có gió.', drill: ['딸', '땅', '떡'] },
  'ㅌ': { rom: 't', how: 'Như ㄷ nhưng bật kèm một luồng hơi mạnh.', drill: ['타다', '토마토', '트럭'] },
  'ㄹ': { rom: 'r/l', how: 'Đầu lưỡi gõ nhẹ MỘT cái vào lợi trên rồi buông ngay — nằm giữa “l” và “r”, không rung lưỡi.', trap: 'Rung lưỡi kiểu “r” hoặc giữ lưỡi lâu thành “l” nặng.', drill: ['라디오', '사람', '나라'] },
  'ㅁ': { rom: 'm', how: 'Ngậm hai môi, hơi thoát qua mũi.', drill: ['마음', '무엇', '메모'] },
  'ㅂ': { rom: 'b/p', how: 'Ngậm hai môi, bật rất nhẹ, không có gió.', trap: 'Bật hơi mạnh nên thành ㅍ.', drill: ['바다', '부모', '비'] },
  'ㅃ': { rom: 'pp', how: 'Căng môi và cổ họng, nén rồi bung gọn, không có gió.', drill: ['빵', '뽀뽀', '빨리'] },
  'ㅍ': { rom: 'p', how: 'Như ㅂ nhưng bật kèm luồng hơi mạnh.', drill: ['포도', '피자', '팔'] },
  'ㅅ': { rom: 's', how: 'Đầu lưỡi gần lợi trên, hơi xì nhẹ và thoáng. Đứng trước ㅣ, ㅑ… thì nghe gần “sh”.', trap: 'Xì quá mạnh thành ㅆ.', drill: ['사람', '소리', '시간'] },
  'ㅆ': { rom: 'ss', how: 'Như ㅅ nhưng căng cứng hơn, tiếng xì mạnh và gọn.', drill: ['쌀', '싸다', '씻다'] },
  'ㅇ': { rom: '—', how: 'Ở đầu âm tiết đây chỉ là chỗ trống, không phát ra tiếng; chỉ khi làm âm cuối mới đọc thành “ng”.', drill: ['아이', '우유', '오이'] },
  'ㅈ': { rom: 'j', how: 'Đầu lưỡi chạm lợi rồi thả thành tiếng xì nhẹ, không có gió.', trap: 'Bật hơi mạnh nên thành ㅊ.', drill: ['자다', '주다', '지금'] },
  'ㅉ': { rom: 'jj', how: 'Căng cổ họng, nén rồi bung gọn, không có gió.', drill: ['짜다', '찌개', '쭉'] },
  'ㅊ': { rom: 'ch', how: 'Như ㅈ nhưng kèm một luồng hơi mạnh.', drill: ['차', '추다', '친구'] },
  'ㅎ': { rom: 'h', how: 'Hơi thoát tự do từ họng, không bộ phận nào chặn.', drill: ['하나', '호수', '휴식'] },
}

const KO_VOW: Record<string, Info> = {
  'ㅏ': { rom: 'a', how: 'Mở miệng rộng như “a” tiếng Việt.', drill: ['아침', '가다'] },
  'ㅐ': { rom: 'ae', how: 'Miệng mở vừa, lưỡi ra trước. Tiếng Hàn hiện đại gần như không phân biệt ㅐ với ㅔ.', drill: ['개', '내일'] },
  'ㅑ': { rom: 'ya', how: 'Thêm âm lướt “y” trước ㅏ.', drill: ['야구', '이야기'] },
  'ㅒ': { rom: 'yae', how: 'Thêm âm lướt “y” trước ㅐ.', drill: ['얘기'] },
  'ㅓ': { rom: 'eo', how: 'Mở miệng như “a” nhưng lưỡi lùi và môi KHÔNG tròn — nghe lưng chừng giữa “ơ” và “o”.', trap: 'Tròn môi nên thành ㅗ, 어 nghe ra 오.', drill: ['어머니', '없다', '건강'] },
  'ㅔ': { rom: 'e', how: 'Miệng mở vừa, lưỡi ra trước — gần “ê” tiếng Việt.', drill: ['네', '메모'] },
  'ㅕ': { rom: 'yeo', how: 'Thêm âm lướt “y” trước ㅓ, vẫn không tròn môi.', drill: ['여자', '연습'] },
  'ㅖ': { rom: 'ye', how: 'Thêm âm lướt “y” trước ㅔ.', drill: ['예쁘다', '계속'] },
  'ㅗ': { rom: 'o', how: 'Chu tròn môi rõ, lưỡi lùi về sau.', trap: 'Bẹt môi nên thành ㅓ.', drill: ['오리', '고기', '노래'] },
  'ㅘ': { rom: 'wa', how: 'Chu môi thành “w” rồi trượt sang ㅏ.', drill: ['과일', '왜'] },
  'ㅙ': { rom: 'wae', how: 'Chu môi “w” rồi trượt sang ㅐ.', drill: ['왜', '괜찮다'] },
  'ㅚ': { rom: 'oe', how: 'Ngày nay đọc gần như “we”.', drill: ['외국', '회사'] },
  'ㅛ': { rom: 'yo', how: 'Thêm âm lướt “y” trước ㅗ, giữ tròn môi.', drill: ['요리', '교실'] },
  'ㅜ': { rom: 'u', how: 'Chu tròn môi nhỏ lại, lưỡi cao và lùi.', trap: 'Bẹt môi nên thành ㅡ.', drill: ['우유', '문', '누나'] },
  'ㅝ': { rom: 'wo', how: 'Chu môi “w” rồi trượt sang ㅓ.', drill: ['원', '뭐'] },
  'ㅞ': { rom: 'we', how: 'Chu môi “w” rồi trượt sang ㅔ.', drill: ['웨딩'] },
  'ㅟ': { rom: 'wi', how: 'Chu môi “w” rồi trượt sang ㅣ.', drill: ['위', '귀'] },
  'ㅠ': { rom: 'yu', how: 'Thêm âm lướt “y” trước ㅜ.', drill: ['유리', '휴식'] },
  'ㅡ': { rom: 'eu', how: 'Kéo môi NGANG như đang cười gượng, tuyệt đối không tròn môi, lưỡi cao.', trap: 'Tròn môi nên thành ㅜ, 그 nghe ra 구.', drill: ['그림', '음식', '크다'] },
  'ㅢ': { rom: 'ui', how: 'Đọc liền ㅡ rồi ㅣ. Ở cuối từ thường nghe thành “i”, ở tiểu từ sở hữu nghe thành “e”.', drill: ['의사', '희망'] },
  'ㅣ': { rom: 'i', how: 'Kéo môi sang hai bên, lưỡi cao và ra trước.', drill: ['이름', '시간'] },
}

const KO_FIN: Record<string, PhoneInfo> = {
  k: { sym: 'ㄱ', rom: 'k', how: 'Chặn hơi ở gốc lưỡi rồi DỪNG lại, không bật ra và không thêm nguyên âm phía sau.', trap: 'Bật hơi hoặc thêm “ư” ở cuối.', drill: ['학교', '박', '부엌'] },
  n: { sym: 'ㄴ', rom: 'n', how: 'Đầu lưỡi chạm lợi trên và giữ nguyên, hơi ra bằng mũi.', trap: 'Đổi thành “ng”.', drill: ['산', '눈', '문'] },
  t: { sym: 'ㄷ', rom: 't', how: 'Chặn đầu lưỡi ở lợi rồi dừng, không bật. Mọi chữ ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ khi làm âm cuối đều đọc như nhau.', trap: 'Đọc bung ra thành “s” hoặc “t” có hơi.', drill: ['옷', '있다', '꽃'] },
  l: { sym: 'ㄹ', rom: 'l', how: 'Đầu lưỡi chạm lợi trên và GIỮ nguyên, nghe như “l” kéo dài.', trap: 'Gõ lưỡi rồi buông nên thành “r”.', drill: ['물', '길', '팔'] },
  m: { sym: 'ㅁ', rom: 'm', how: 'Ngậm kín hai môi và giữ, hơi ra bằng mũi.', drill: ['밤', '김치', '봄'] },
  p: { sym: 'ㅂ', rom: 'p', how: 'Ngậm hai môi rồi DỪNG, không bật hơi ra. Chữ ㅂ ㅍ ㅄ ㄿ làm âm cuối đều đọc như nhau.', trap: 'Bật môi ra hoặc thêm “ư”.', drill: ['밥', '집', '앞'] },
  ng: { sym: 'ㅇ', rom: 'ng', how: 'Gốc lưỡi chạm ngạc mềm, hơi ra mũi, không bật thêm “g”.', trap: 'Đọc thành “n”.', drill: ['강', '방', '사랑'] },
}

const KO_FIN_CLASS = [
  '', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l',
  'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't',
]

const KO_SILENT = 'L' + KO_L.indexOf('ㅇ')

const KO_PAIR: Record<string, string> = {
  'V4|V8': 'Bạn đang chu tròn môi. Với ㅓ, môi để bẹt tự nhiên, chỉ lưỡi lùi về sau.',
  'V8|V4': 'Bạn quên tròn môi. Chu môi lại thành hình chữ O rồi mới phát âm.',
  'V18|V13': 'Bạn đang chu tròn môi. Với ㅡ, kéo môi ngang sang hai bên.',
  'V13|V18': 'Bạn để môi bẹt. Với ㅜ, phải chu tròn môi nhỏ lại.',
  'L0|L15': 'Bạn bật hơi quá mạnh. ㄱ gần như không có gió — thử để tờ giấy trước miệng, giấy không được rung.',
  'L15|L0': 'Bạn bật hơi quá nhẹ. ㅋ phải có luồng gió rõ đẩy ra.',
  'L3|L16': 'Bạn bật hơi quá mạnh. ㄷ không có gió.',
  'L16|L3': 'Bạn bật hơi quá nhẹ. ㅌ phải có luồng gió rõ.',
  'L7|L17': 'Bạn bật hơi quá mạnh. ㅂ không có gió.',
  'L17|L7': 'Bạn bật hơi quá nhẹ. ㅍ phải có luồng gió rõ.',
  'L12|L14': 'Bạn bật hơi quá mạnh. ㅈ không có gió.',
  'L14|L12': 'Bạn bật hơi quá nhẹ. ㅊ phải có luồng gió rõ.',
  'L5|L2': 'Bạn để hơi ra mũi nên thành ㄴ. ㄹ phải gõ đầu lưỡi vào lợi rồi buông ngay, hơi ra miệng.',
  'L2|L5': 'Bạn gõ lưỡi rồi buông. Với ㄴ, giữ lưỡi chạm lợi và cho hơi ra mũi.',
}

const ZH_INIT: Record<string, Info> = {
  b: { rom: 'b', how: 'Ngậm môi bật nhẹ, KHÔNG bật hơi. Khác “b” tiếng Việt ở chỗ dây thanh không rung trước khi bật.', trap: 'Bật hơi nên thành p.', drill: ['爸爸', '不', '北京'] },
  p: { rom: 'p', how: 'Như b nhưng bật một luồng hơi mạnh ra.', trap: 'Bật quá nhẹ nên thành b.', drill: ['朋友', '苹果', '便宜'] },
  m: { rom: 'm', how: 'Ngậm hai môi, hơi ra mũi.', drill: ['妈妈', '忙', '面'] },
  f: { rom: 'f', how: 'Răng cửa trên chạm môi dưới, thổi hơi ra.', drill: ['饭', '发', '方便'] },
  d: { rom: 'd', how: 'Đầu lưỡi chạm lợi, bật nhẹ, không có gió.', trap: 'Bật hơi nên thành t.', drill: ['大', '都', '对'] },
  t: { rom: 't', how: 'Như d nhưng bật hơi mạnh.', drill: ['太', '听', '同学'] },
  n: { rom: 'n', how: 'Đầu lưỡi chạm lợi, hơi ra mũi.', trap: 'Lẫn với l.', drill: ['你', '女', '难'] },
  l: { rom: 'l', how: 'Đầu lưỡi chạm lợi, hơi thoát hai bên lưỡi.', drill: ['来', '老师', '冷'] },
  g: { rom: 'g', how: 'Gốc lưỡi chạm ngạc mềm, bật nhẹ, không có gió.', trap: 'Bật hơi nên thành k.', drill: ['哥哥', '狗', '高'] },
  k: { rom: 'k', how: 'Như g nhưng bật hơi mạnh.', drill: ['看', '开', '课'] },
  h: { rom: 'h', how: 'Hơi cọ xát ở phía sau vòm miệng, nghe khàn và sâu hơn “h” tiếng Việt.', drill: ['好', '喝', '汉语'] },
  j: { rom: 'j', how: 'Hạ đầu lưỡi xuống chân răng dưới, nâng mặt lưỡi lên vòm cứng rồi bật nhẹ, không có gió.', trap: 'Cuộn lưỡi nên thành zh.', drill: ['家', '几', '姐姐'] },
  q: { rom: 'q', how: 'Giữ lưỡi như j nhưng bật một luồng hơi mạnh.', trap: 'Đọc thành “ch” tiếng Việt.', drill: ['去', '钱', '请'] },
  x: { rom: 'x', how: 'Giữ lưỡi như j nhưng để hơi xì ra liên tục, không chặn.', trap: 'Đọc thành “s” hoặc “sh”.', drill: ['谢谢', '西', '喜欢'] },
  zh: { rom: 'zh', how: 'Cuộn đầu lưỡi lên vòm cứng rồi bật nhẹ, không có gió.', trap: 'Không cuộn lưỡi nên thành z.', drill: ['中国', '这', '知道'] },
  ch: { rom: 'ch', how: 'Cuộn lưỡi như zh nhưng bật một luồng hơi mạnh.', drill: ['吃', '车', '出'] },
  sh: { rom: 'sh', how: 'Cuộn đầu lưỡi lên vòm cứng và để hơi xì ra liên tục.', trap: 'Không cuộn lưỡi nên thành s.', drill: ['是', '书', '上'] },
  r: { rom: 'r', how: 'Cuộn lưỡi như sh nhưng dây thanh rung, gần với “r” tiếng Anh.', trap: 'Đọc thành “d” hoặc “gi”.', drill: ['人', '热', '认识'] },
  z: { rom: 'z', how: 'Đầu lưỡi sát chân răng trên, bật ra kèm tiếng xì nhẹ, không có gió.', drill: ['在', '子', '走'] },
  c: { rom: 'c', how: 'Như z nhưng bật một luồng hơi mạnh.', drill: ['菜', '从', '次'] },
  s: { rom: 's', how: 'Đầu lưỡi sát chân răng trên, xì hơi đều, lưỡi không cuộn.', drill: ['三', '色', '送'] },
  y: { rom: 'y', how: 'Âm lướt, đọc liền ngay vào nguyên âm phía sau.', drill: ['有', '一', '要'] },
  w: { rom: 'w', how: 'Chu tròn môi rồi trượt ngay sang nguyên âm sau.', drill: ['我', '为', '完'] },
}

const ZH_FIN: Record<string, Info> = {
  a: { rom: 'a', how: 'Mở miệng rộng, lưỡi hạ thấp.' },
  o: { rom: 'o', how: 'Chu tròn môi, lưỡi lùi về sau.' },
  e: { rom: 'e', how: 'Lưỡi lùi về sau, môi KHÔNG tròn — nằm giữa “ơ” và “ưa”, không phải “e” tiếng Việt.', trap: 'Đọc thành “e” hoặc “ơ” bẹt.', drill: ['喝', '这', '车'] },
  i: { rom: 'i', how: 'Kéo môi ngang, lưỡi cao ra trước. Sau z/c/s/zh/ch/sh/r thì không đọc thành “i” mà chỉ giữ vị trí lưỡi của phụ âm rồi ngân ra.', drill: ['一', '四', '是'] },
  u: { rom: 'u', how: 'Chu tròn môi nhỏ, lưỡi cao và lùi.' },
  'ü': { rom: 'ü', how: 'Đặt lưỡi ở vị trí “i” rồi chu tròn môi như “u”, giữ đồng thời cả hai.', trap: 'Bỏ phần tròn môi nên thành i, hoặc bỏ vị trí lưỡi nên thành u.', drill: ['女', '去', '绿'] },
  er: { rom: 'er', how: 'Đọc “ơ” rồi cuộn đầu lưỡi lên, không chạm vào đâu.', drill: ['二', '儿子'] },
  ai: { rom: 'ai', how: 'Trượt từ “a” sang “i”, hàm khép dần.' },
  ei: { rom: 'ei', how: 'Trượt từ “ê” sang “i”.' },
  ao: { rom: 'ao', how: 'Trượt từ “a” sang “o” tròn môi.' },
  ou: { rom: 'ou', how: 'Trượt từ “ô” sang “u”, môi tròn dần.' },
  an: { rom: 'an', how: 'Kết bằng đầu lưỡi chạm lợi trên.', trap: 'Buông lưỡi nên thành ang.', drill: ['三', '看', '晚'] },
  ang: { rom: 'ang', how: 'Kết bằng gốc lưỡi nâng lên chặn, đầu lưỡi buông tự do, hơi ra mũi.', trap: 'Chạm đầu lưỡi nên thành an.', drill: ['忙', '上', '房'] },
  en: { rom: 'en', how: 'Âm “ơn” ngắn, kết bằng đầu lưỡi chạm lợi.', drill: ['很', '们', '人'] },
  eng: { rom: 'eng', how: 'Âm “ơng”, kết bằng gốc lưỡi, hơi ra mũi.', drill: ['冷', '朋友', '风'] },
  in: { rom: 'in', how: 'Kết bằng đầu lưỡi chạm lợi.', drill: ['心', '新', '今'] },
  ing: { rom: 'ing', how: 'Kết bằng gốc lưỡi nâng lên, hơi ra mũi.', drill: ['请', '名', '听'] },
  ong: { rom: 'ong', how: 'Chu môi như “u” rồi kết bằng gốc lưỡi nâng lên.', drill: ['中', '红', '工作'] },
  ian: { rom: 'ian', how: 'Đọc gần “i-en” chứ không phải “i-an”.', trap: 'Đọc thành “i-an”.', drill: ['天', '钱', '点'] },
  uo: { rom: 'uo', how: 'Trượt từ “u” tròn môi sang “o”.' },
  ui: { rom: 'ui', how: 'Thực chất là “uei”: trượt u → ê → i.' },
  iu: { rom: 'iu', how: 'Thực chất là “iou”: trượt i → ô → u.' },
  un: { rom: 'un', how: 'Thực chất là “uen”, kết bằng đầu lưỡi chạm lợi.' },
  'üe': { rom: 'üe', how: 'Bắt đầu ở ü (lưỡi “i”, môi “u”) rồi mở sang “ê”.' },
  'ün': { rom: 'ün', how: 'Giữ ü rồi kết bằng đầu lưỡi chạm lợi.' },
  'üan': { rom: 'üan', how: 'Giữ ü rồi trượt sang “en”, không phải “an”.' },
}

const ZH_TONE: Record<string, Info> = {
  '1': { rom: 'thanh 1', how: 'Cao và bằng: giữ đều một cao độ cao hơn giọng nói thường, như đang ngân.', trap: 'Đọc như không dấu tiếng Việt nên bị thấp và trôi.', drill: ['妈 mā', '书 shū', '天 tiān'] },
  '2': { rom: 'thanh 2', how: 'Đi lên: bắt đầu ở tầm giữa rồi kéo lên cao, giống dấu sắc kéo dài.', drill: ['麻 má', '来 lái', '人 rén'] },
  '3': { rom: 'thanh 3', how: 'Xuống rồi lên: hạ giọng xuống thấp nhất rồi mới nhích lên, gần dấu hỏi. Nói chậm mới nghe rõ khúc lên.', trap: 'Chỉ hạ xuống mà quên đi lên.', drill: ['马 mǎ', '好 hǎo', '你 nǐ'] },
  '4': { rom: 'thanh 4', how: 'Đổ từ cao xuống thấp thật dứt khoát, như quát một tiếng. KHÔNG phải dấu huyền.', trap: 'Đọc thành dấu huyền nên nghe nhẹ và trôi.', drill: ['骂 mà', '是 shì', '去 qù'] },
  '5': { rom: 'thanh nhẹ', how: 'Đọc nhanh, nhẹ, không nhấn; cao độ phụ thuộc âm đứng trước.', drill: ['妈妈 māma', '什么 shénme'] },
}

const TONE_SYM: Record<string, string> = { '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁰' }

const ZH_PAIR: Record<string, string> = {
  'I:zh|I:z': 'Bạn quên cuộn lưỡi. Đưa đầu lưỡi lên chạm vòm cứng rồi mới bật.',
  'I:ch|I:c': 'Bạn quên cuộn lưỡi. Cuộn đầu lưỡi lên vòm rồi bật hơi.',
  'I:sh|I:s': 'Bạn quên cuộn lưỡi. Cuộn đầu lưỡi lên vòm rồi mới xì hơi.',
  'I:z|I:zh': 'Bạn cuộn lưỡi thừa. Hạ đầu lưỡi xuống sát chân răng trên.',
  'I:j|I:zh': 'Bạn cuộn lưỡi. Với j, đầu lưỡi phải hạ xuống chân răng DƯỚI, mặt lưỡi mới nâng lên.',
  'I:x|I:sh': 'Bạn cuộn lưỡi. Với x, hạ đầu lưỡi xuống chân răng dưới.',
  'I:n|I:l': 'Bạn để hơi ra miệng. Với n, hơi phải ra bằng mũi.',
  'I:l|I:n': 'Bạn để hơi ra mũi. Với l, hạ vòm miệng cho hơi thoát hai bên lưỡi.',
  'F:an|F:ang': 'Bạn buông đầu lưỡi. Đuôi -n phải kết bằng đầu lưỡi chạm lợi trên.',
  'F:ang|F:an': 'Bạn chạm đầu lưỡi. Đuôi -ng để đầu lưỡi tự do, gốc lưỡi mới nâng lên chặn.',
  'F:in|F:ing': 'Bạn buông đầu lưỡi. Đuôi -n kết bằng đầu lưỡi chạm lợi.',
  'F:ing|F:in': 'Bạn chạm đầu lưỡi. Đuôi -ng kết bằng gốc lưỡi.',
  'F:en|F:eng': 'Bạn buông đầu lưỡi. Đuôi -n kết bằng đầu lưỡi chạm lợi.',
  'F:eng|F:en': 'Bạn chạm đầu lưỡi. Đuôi -ng kết bằng gốc lưỡi.',
  'F:ü|F:u': 'Bạn để lưỡi lùi về sau. Giữ lưỡi ở vị trí “i” trong khi môi vẫn chu tròn.',
  'F:ü|F:i': 'Bạn quên chu môi. Giữ nguyên lưỡi rồi tròn môi lại như “u”.',
}

function key(a: string, b: string): string {
  return a < b ? a + '|' + b : b + '|' + a
}

function buildNear(list: [string, string, number][]): Map<string, number> {
  const m = new Map<string, number>()
  list.forEach(([a, b, c]) => m.set(key(a, b), c))
  return m
}

const EN_NEAR = buildNear([
  ['P', 'B', 0.35], ['T', 'D', 0.35], ['K', 'G', 0.35], ['F', 'V', 0.35],
  ['S', 'Z', 0.35], ['SH', 'ZH', 0.35], ['TH', 'DH', 0.35], ['CH', 'JH', 0.35],
  ['M', 'N', 0.5], ['N', 'NG', 0.45], ['L', 'R', 0.5], ['W', 'V', 0.5],
  ['S', 'SH', 0.45], ['Z', 'ZH', 0.45], ['CH', 'SH', 0.45], ['JH', 'ZH', 0.45],
  ['T', 'CH', 0.5], ['D', 'JH', 0.5], ['TH', 'S', 0.4], ['TH', 'F', 0.4],
  ['TH', 'T', 0.4], ['DH', 'D', 0.4], ['DH', 'Z', 0.4], ['F', 'P', 0.5],
  ['IH', 'IY', 0.5], ['UH', 'UW', 0.5], ['AA', 'AO', 0.5], ['AH', 'ER', 0.5],
  ['AE', 'EH', 0.5], ['AH', 'AA', 0.5], ['AH', 'UH', 0.55], ['EH', 'EY', 0.55],
  ['OW', 'AO', 0.5], ['AY', 'AA', 0.6], ['AH', 'IH', 0.6],
])

function koKeys(list: [string, string, number][], letters: string[], tag: string): [string, string, number][] {
  return list.map(([a, b, c]) => [tag + letters.indexOf(a), tag + letters.indexOf(b), c])
}

const KO_NEAR = buildNear([
  ...koKeys([
    ['ㄱ', 'ㄲ', 0.35], ['ㄱ', 'ㅋ', 0.35], ['ㄲ', 'ㅋ', 0.4],
    ['ㄷ', 'ㄸ', 0.35], ['ㄷ', 'ㅌ', 0.35], ['ㄸ', 'ㅌ', 0.4],
    ['ㅂ', 'ㅃ', 0.35], ['ㅂ', 'ㅍ', 0.35], ['ㅃ', 'ㅍ', 0.4],
    ['ㅈ', 'ㅉ', 0.35], ['ㅈ', 'ㅊ', 0.35], ['ㅉ', 'ㅊ', 0.4],
    ['ㅅ', 'ㅆ', 0.35], ['ㄴ', 'ㄹ', 0.5], ['ㄴ', 'ㅁ', 0.55], ['ㅅ', 'ㅈ', 0.55],
  ], KO_L, 'L'),
  ...koKeys([
    ['ㅓ', 'ㅗ', 0.45], ['ㅡ', 'ㅜ', 0.45], ['ㅐ', 'ㅔ', 0.2], ['ㅒ', 'ㅖ', 0.2],
    ['ㅏ', 'ㅓ', 0.5], ['ㅗ', 'ㅜ', 0.5], ['ㅡ', 'ㅣ', 0.55], ['ㅚ', 'ㅞ', 0.25],
    ['ㅘ', 'ㅝ', 0.5],
  ], KO_V, 'V'),
  ['T:k', 'T:t', 0.45], ['T:t', 'T:p', 0.45], ['T:k', 'T:p', 0.5],
  ['T:n', 'T:ng', 0.5], ['T:n', 'T:m', 0.5], ['T:m', 'T:ng', 0.5],
  ['T:n', 'T:l', 0.5], ['T:t', 'T:n', 0.6], ['T:k', 'T:ng', 0.6],
])

const ZH_NEAR = buildNear([
  ['I:zh', 'I:z', 0.4], ['I:ch', 'I:c', 0.4], ['I:sh', 'I:s', 0.4],
  ['I:zh', 'I:j', 0.5], ['I:ch', 'I:q', 0.5], ['I:sh', 'I:x', 0.5],
  ['I:b', 'I:p', 0.35], ['I:d', 'I:t', 0.35], ['I:g', 'I:k', 0.35],
  ['I:j', 'I:q', 0.35], ['I:z', 'I:c', 0.35], ['I:n', 'I:l', 0.45],
  ['I:r', 'I:l', 0.5], ['I:f', 'I:h', 0.55],
  ['F:an', 'F:ang', 0.4], ['F:en', 'F:eng', 0.4], ['F:in', 'F:ing', 0.4],
  ['F:ian', 'F:iang', 0.45], ['F:uan', 'F:uang', 0.45], ['F:e', 'F:o', 0.5],
  ['F:u', 'F:ü', 0.4], ['F:i', 'F:ü', 0.5], ['F:ou', 'F:uo', 0.5],
  ['T:1', 'T:2', 0.5], ['T:1', 'T:3', 0.5], ['T:1', 'T:4', 0.5],
  ['T:2', 'T:3', 0.5], ['T:2', 'T:4', 0.5], ['T:3', 'T:4', 0.5],
  ['T:1', 'T:5', 0.5], ['T:2', 'T:5', 0.5], ['T:3', 'T:5', 0.5], ['T:4', 'T:5', 0.5],
])

const ZH_INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']
const TONE_OF: Record<string, string> = {
  '̄': '1', '́': '2', '̌': '3', '̀': '4',
}
const TONE_MARKS = /[̀́̄̌]/g

export function splitPinyin(syllable: string): string[] {
  let tone = '5'
  const base = syllable
    .normalize('NFD')
    .replace(TONE_MARKS, (m) => { tone = TONE_OF[m] || tone; return '' })
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^a-zü]/g, '')
  if (!base) return []
  let init = ''
  for (const c of ZH_INITIALS) {
    if (base.startsWith(c)) { init = c; break }
  }
  let fin = base.slice(init.length)
  if (!fin) fin = init === 'y' ? 'i' : init === 'w' ? 'u' : ''
  if (fin.startsWith('v')) fin = 'ü' + fin.slice(1)
  if (/^[jqxy]$/.test(init) && fin.startsWith('u')) fin = 'ü' + fin.slice(1)
  const out: string[] = []
  if (init) out.push('I:' + init)
  if (fin) out.push('F:' + fin)
  out.push('T:' + tone)
  return out
}

export function expandSounds(lang: string, raw: string[]): string[] {
  if (lang === 'zh') {
    const out: string[] = []
    raw.forEach((syl) => splitPinyin(syl).forEach((t) => out.push(t)))
    return out
  }
  if (lang === 'ko') {
    const out: string[] = []
    for (const tok of raw) {
      if (tok === KO_SILENT) continue
      if (tok[0] === 'T') {
        const cls = KO_FIN_CLASS[Number(tok.slice(1))]
        if (cls) out.push('T:' + cls)
        continue
      }
      out.push(tok)
    }
    return out
  }
  return raw
}

function koInfo(tok: string): PhoneInfo | null {
  if (tok.startsWith('T:')) return KO_FIN[tok.slice(2)] ?? null
  const n = Number(tok.slice(1))
  if (!Number.isFinite(n)) return null
  if (tok[0] === 'L') {
    const ch = KO_L[n]
    return ch && KO_INIT[ch] ? { sym: ch, ...KO_INIT[ch] } : null
  }
  if (tok[0] === 'V') {
    const ch = KO_V[n]
    return ch && KO_VOW[ch] ? { sym: ch, ...KO_VOW[ch] } : null
  }
  return null
}

function zhInfo(tok: string): PhoneInfo | null {
  const body = tok.slice(2)
  if (tok.startsWith('I:')) return ZH_INIT[body] ? { sym: body, ...ZH_INIT[body] } : { sym: body, how: '' }
  if (tok.startsWith('F:')) return ZH_FIN[body] ? { sym: body, ...ZH_FIN[body] } : { sym: body, how: '' }
  if (tok.startsWith('T:')) return ZH_TONE[body] ? { sym: TONE_SYM[body] ?? body, ...ZH_TONE[body] } : null
  return null
}

export function phoneInfo(lang: string, tok: string): PhoneInfo | null {
  if (!tok) return null
  if (lang === 'ko') return koInfo(tok)
  if (lang === 'zh') return zhInfo(tok)
  return EN[tok] ?? null
}

export function phoneSym(lang: string, tok: string): string {
  return phoneInfo(lang, tok)?.sym || tok
}

export function phoneLabel(lang: string, tok: string): string {
  const info = phoneInfo(lang, tok)
  if (!info) return tok
  if (lang === 'en') return '/' + info.sym + '/'
  if (lang === 'zh') {
    if (tok.startsWith('T:')) return info.rom ?? info.sym
    return info.sym
  }
  return info.rom ? info.sym + ' (' + info.rom + ')' : info.sym
}

export function isVowelTok(lang: string, tok: string): boolean {
  if (lang === 'ko') return tok.startsWith('V')
  if (lang === 'zh') return tok.startsWith('F:')
  return EN_VOWELS.has(tok)
}

export function isToneTok(lang: string, tok: string): boolean {
  return lang === 'zh' && tok.startsWith('T:')
}

export function nearCost(lang: string, a: string, b: string): number {
  if (a === b) return 0
  const table = lang === 'ko' ? KO_NEAR : lang === 'zh' ? ZH_NEAR : EN_NEAR
  return table.get(key(a, b)) ?? 1
}

function pairTip(lang: string, want: string, got: string): string {
  const table = lang === 'ko' ? KO_PAIR : lang === 'zh' ? ZH_PAIR : EN_PAIR
  const hit = table[want + '|' + got]
  if (hit) return hit
  if (lang === 'en') {
    if (EN_VOICED[want] === got) {
      return 'Vị trí lưỡi và môi đã đúng, chỉ thiếu rung dây thanh. Đặt tay lên cổ họng: khi nói /' + EN[want].sym + '/ phải thấy rung, còn /' + EN[got].sym + '/ thì không.'
    }
    if (EN_VOICELESS[want] === got) {
      return 'Vị trí đã đúng nhưng bạn để dây thanh rung. /' + EN[want].sym + '/ chỉ có hơi, không rung — và nguyên âm đứng trước nó cũng ngắn hơn.'
    }
    if (EN_LONG.has(want) && EN_SHORT.has(got)) {
      return 'Bạn cắt âm quá sớm. Đây là nguyên âm dài — giữ gần gấp đôi thời lượng bạn vừa nói.'
    }
    if (EN_SHORT.has(want) && EN_LONG.has(got)) {
      return 'Bạn kéo âm quá dài. Đây là nguyên âm ngắn và lỏng — buông lỏng môi rồi cắt nhanh.'
    }
  }
  if (lang === 'zh' && want.startsWith('T:') && got.startsWith('T:')) {
    return 'Âm đọc đúng nhưng sai thanh điệu — người nghe sẽ hiểu ra một chữ khác. Hãy tách riêng thanh điệu ra tập trước, ngân dài rồi mới ghép vào chữ.'
  }
  return ''
}

const END_HINT: Record<string, string> = {
  en: 'Tiếng Việt không bung phụ âm cuối nên âm cuối tiếng Anh rất hay bị nuốt. Hãy cố ý kéo dài và bung rõ âm cuối, ban đầu nghe hơi quá cũng không sao.',
  ko: 'Âm cuối (batchim) trong tiếng Hàn chỉ chặn lại chứ không bật ra, nhưng vẫn phải nghe thấy chỗ chặn đó.',
  zh: 'Phần đuôi âm tiết quyết định nghĩa của chữ — nuốt đuôi là người nghe hiểu sang chữ khác.',
}

export interface FixInput {
  lang: string
  want: string
  got: string
  state: 'sub' | 'miss' | 'extra'
  atEnd: boolean
}

export function buildFix(inp: FixInput): PhoneFix | null {
  const { lang, want, got, state, atEnd } = inp
  const wantInfo = want ? phoneInfo(lang, want) : null
  const gotInfo = got ? phoneInfo(lang, got) : null

  if (state === 'extra') {
    if (!gotInfo) return null
    const vowel = isVowelTok(lang, got)
    return {
      key: 'extra|' + got,
      title: 'Thừa âm ' + phoneLabel(lang, got),
      why: vowel
        ? 'Bạn chèn thêm một nguyên âm không có trong từ. Tiếng Việt không có cụm phụ âm nên người Việt hay đệm “ơ” vào giữa, ví dụ “sờ-ping” thay vì “spring”.'
        : 'Bạn thêm một phụ âm không có trong từ, thường do đọc theo mặt chữ thay vì theo âm.',
      how: 'Đọc thật chậm, nối hai phụ âm dính liền nhau không có gì ở giữa, rồi mới tăng dần tốc độ.',
      drill: gotInfo.drill ?? [],
    }
  }

  if (state === 'miss') {
    if (!wantInfo) return null
    return {
      key: 'miss|' + want,
      title: 'Thiếu âm ' + phoneLabel(lang, want),
      why: atEnd
        ? (END_HINT[lang] ?? 'Âm này bị nuốt mất.')
        : 'Âm này không xuất hiện trong lượt nói của bạn — có thể bạn đọc lướt qua hoặc bỏ hẳn.',
      how: wantInfo.how,
      drill: wantInfo.drill ?? [],
    }
  }

  if (!wantInfo || !gotInfo) return null
  const tip = pairTip(lang, want, got)
  const generic = 'Hai âm ' + phoneLabel(lang, want) + ' và ' + phoneLabel(lang, got)
    + ' tạo bằng hai động tác khác nhau nên người nghe sẽ hiểu ra một từ khác.'
  const needle = lang === 'en' ? '/' + gotInfo.sym + '/' : gotInfo.sym
  const trap = wantInfo.trap && wantInfo.trap.includes(needle) ? ' ' + wantInfo.trap : ''
  return {
    key: 'sub|' + want + '|' + got,
    title: phoneLabel(lang, want) + ' → bạn đọc thành ' + phoneLabel(lang, got),
    why: tip || generic + trap,
    how: wantInfo.how,
    drill: wantInfo.drill ?? [],
  }
}
