// Bảng chữ Hangul cho người Việt: cách đọc so với âm tiếng Việt, mẹo nhớ theo hình
// chữ (vua Sejong vẽ phụ âm theo khẩu hình, nguyên âm theo Trời · Đất · Người) và
// lộ trình 9 bài từ 6 nguyên âm gốc tới đọc trọn từ thật.

export type JamoKind = 'basic' | 'aspirated' | 'tense' | 'vowel' | 'yvowel' | 'compound'

export interface Jamo {
  j: string
  kind: JamoKind
  rom: string
  vi: string
  hint: string
  ex: string
  exRom: string
  exVi: string
  name?: string
  tail?: string
}

export const CONSONANTS: Jamo[] = [
  { j: 'ㄱ', name: '기역', kind: 'basic', rom: 'g', tail: 'k', vi: 'giữa "c" và "g": đầu từ gần "c" nhẹ, giữa từ thành "g"',
    hint: 'Gốc lưỡi cong lên chặn cuống họng — nét chữ vẽ đúng hình cái lưỡi đó, như số 7 viết vuông.', ex: '가방', exRom: 'gabang', exVi: 'cái túi' },
  { j: 'ㄲ', name: '쌍기역', kind: 'tense', rom: 'kk', tail: 'k', vi: '"c" gằn, căng cổ họng, không thổi hơi',
    hint: 'Hai ㄱ đứng sát nhau = âm căng. Đọc như đang nghiến răng nói "c".', ex: '꽃', exRom: 'kkot', exVi: 'bông hoa' },
  { j: 'ㄴ', name: '니은', kind: 'basic', rom: 'n', tail: 'n', vi: '"n" như tiếng Việt',
    hint: 'Đầu lưỡi chạm lợi trên. Hình cái nệm nằm ngang — "n" của nệm.', ex: '나무', exRom: 'namu', exVi: 'cái cây' },
  { j: 'ㄷ', name: '디귿', kind: 'basic', rom: 'd', tail: 't', vi: 'giữa "t" và "đ": đầu từ gần "t" nhẹ, giữa từ gần "đ"',
    hint: 'ㄴ thêm một nắp trên: cùng chỗ đặt lưỡi nhưng bật ra. Như cái đĩa úp.', ex: '다리', exRom: 'dari', exVi: 'cái chân; cây cầu' },
  { j: 'ㄸ', name: '쌍디귿', kind: 'tense', rom: 'tt', vi: 'rất gần "t" tiếng Việt: gọn, không có hơi',
    hint: 'Hai ㄷ sát nhau = âm căng. Không bao giờ đứng cuối âm tiết.', ex: '딸', exRom: 'ttal', exVi: 'con gái' },
  { j: 'ㄹ', name: '리을', kind: 'basic', rom: 'r', tail: 'l', vi: 'đầu từ hay giữa hai nguyên âm: "r" lướt nhẹ (lưỡi chạm một cái); cuối âm tiết: "l"',
    hint: 'Hình lò xo uốn khúc, như lưỡi đang uốn. Không rung lưỡi như "r" miền Nam.', ex: '라면', exRom: 'ramyeon', exVi: 'mì gói' },
  { j: 'ㅁ', name: '미음', kind: 'basic', rom: 'm', tail: 'm', vi: '"m" như tiếng Việt',
    hint: 'Hình cái miệng khép kín — "m" của miệng.', ex: '물', exRom: 'mul', exVi: 'nước' },
  { j: 'ㅂ', name: '비읍', kind: 'basic', rom: 'b', tail: 'p', vi: 'giữa "p" và "b": đầu từ gần "b" nhẹ hơi, giữa từ là "b"',
    hint: 'Cái miệng ㅁ mọc hai tai — như cái bình có quai.', ex: '바다', exRom: 'bada', exVi: 'biển' },
  { j: 'ㅃ', name: '쌍비읍', kind: 'tense', rom: 'pp', vi: '"b" gằn, môi mím chặt rồi bật gọn, không có hơi',
    hint: 'Hai ㅂ sát nhau = âm căng. Không đứng cuối âm tiết.', ex: '빵', exRom: 'ppang', exVi: 'bánh mì' },
  { j: 'ㅅ', name: '시옷', kind: 'basic', rom: 's', tail: 't', vi: '"x" nhẹ; đứng trước ㅣ và nguyên âm có "y" thì gần "sh" (시 = "shi")',
    hint: 'Hình chiếc răng: hơi lọt qua kẽ răng. Như mái nhà nhọn.', ex: '사과', exRom: 'sagwa', exVi: 'quả táo' },
  { j: 'ㅆ', name: '쌍시옷', kind: 'tense', rom: 'ss', tail: 't', vi: '"x" căng và sắc hơn ㅅ',
    hint: 'Hai ㅅ sát nhau = âm căng, rít mạnh hơn.', ex: '쌀', exRom: 'ssal', exVi: 'gạo' },
  { j: 'ㅇ', name: '이응', kind: 'basic', rom: '', tail: 'ng', vi: 'đầu âm tiết: câm, chỉ giữ chỗ; cuối âm tiết: "ng"',
    hint: 'Hình cổ họng tròn. Đứng đầu là số 0 — không có tiếng; đứng cuối là "ng".', ex: '우유', exRom: 'uyu', exVi: 'sữa' },
  { j: 'ㅈ', name: '지읒', kind: 'basic', rom: 'j', tail: 't', vi: 'giữa "ch" và "gi": đầu từ gần "ch" nhẹ, giữa từ gần "j" tiếng Anh',
    hint: 'ㅅ đội thêm nắp phẳng: lưỡi áp vòm miệng rồi xì ra.', ex: '집', exRom: 'jip', exVi: 'ngôi nhà' },
  { j: 'ㅉ', name: '쌍지읒', kind: 'tense', rom: 'jj', vi: '"ch" gằn và gọn, không có hơi — gần "ch" tiếng Việt',
    hint: 'Hai ㅈ sát nhau = âm căng. Không đứng cuối âm tiết.', ex: '짜다', exRom: 'jjada', exVi: 'mặn' },
  { j: 'ㅊ', name: '치읓', kind: 'aspirated', rom: 'ch', tail: 't', vi: '"ch" thổi mạnh luồng hơi',
    hint: 'ㅈ đội thêm mũ = thêm hơi. Mũ càng cao, hơi càng nhiều.', ex: '차', exRom: 'cha', exVi: 'xe hơi; trà' },
  { j: 'ㅋ', name: '키읔', kind: 'aspirated', rom: 'k', tail: 'k', vi: '"kh" — "c" thổi mạnh luồng hơi ra',
    hint: 'ㄱ thêm một gạch = thêm hơi. Đặt tay trước miệng phải thấy gió.', ex: '커피', exRom: 'keopi', exVi: 'cà phê' },
  { j: 'ㅌ', name: '티읕', kind: 'aspirated', rom: 't', tail: 't', vi: '"th" như tiếng Việt',
    hint: 'ㄷ thêm một gạch giữa = thêm hơi.', ex: '토끼', exRom: 'tokki', exVi: 'con thỏ' },
  { j: 'ㅍ', name: '피읖', kind: 'aspirated', rom: 'p', tail: 'p', vi: '"p" thổi mạnh hơi; hai môi chạm nhau, không phải "ph" (f)',
    hint: 'ㅂ xoay ngang và thêm nét = thêm hơi.', ex: '포도', exRom: 'podo', exVi: 'quả nho' },
  { j: 'ㅎ', name: '히읗', kind: 'basic', rom: 'h', tail: 't', vi: '"h" như tiếng Việt; giữa từ hay bị nuốt nhẹ',
    hint: 'Vòng tròn cổ họng ㅇ đội mũ — hơi thở ra từ họng.', ex: '하나', exRom: 'hana', exVi: 'một' },
]

export const VOWELS: Jamo[] = [
  { j: 'ㅏ', kind: 'vowel', rom: 'a', vi: '"a"', hint: 'Người (ㅣ) đứng, chấm Trời ở bên ngoài — hướng ra là âm sáng "a".', ex: '아이', exRom: 'ai', exVi: 'đứa trẻ' },
  { j: 'ㅐ', kind: 'yvowel', rom: 'ae', vi: '"e" (mở miệng rộng)', hint: 'ㅏ ghép ㅣ. Người Seoul trẻ đọc gần như ㅔ.', ex: '개', exRom: 'gae', exVi: 'con chó' },
  { j: 'ㅑ', kind: 'yvowel', rom: 'ya', vi: '"ya"', hint: 'ㅏ thêm một gạch = thêm "y" ở đầu.', ex: '야구', exRom: 'yagu', exVi: 'bóng chày' },
  { j: 'ㅒ', kind: 'compound', rom: 'yae', vi: '"ye" (mở rộng)', hint: 'ㅐ thêm một gạch = thêm "y". Ít gặp.', ex: '얘기', exRom: 'yaegi', exVi: 'câu chuyện' },
  { j: 'ㅓ', kind: 'vowel', rom: 'eo', vi: '"ơ" (miệng mở rộng hơn "ơ" một chút)', hint: 'Chấm Trời quay vào trong — âm tối. Đừng đọc thành "o".', ex: '어머니', exRom: 'eomeoni', exVi: 'mẹ' },
  { j: 'ㅔ', kind: 'yvowel', rom: 'e', vi: '"ê"', hint: 'ㅓ ghép ㅣ.', ex: '게', exRom: 'ge', exVi: 'con cua' },
  { j: 'ㅕ', kind: 'yvowel', rom: 'yeo', vi: '"yơ"', hint: 'ㅓ thêm một gạch = thêm "y".', ex: '여자', exRom: 'yeoja', exVi: 'phụ nữ' },
  { j: 'ㅖ', kind: 'compound', rom: 'ye', vi: '"yê"; sau phụ âm thường đọc như "ê"', hint: 'ㅔ thêm một gạch = thêm "y".', ex: '예', exRom: 'ye', exVi: 'vâng' },
  { j: 'ㅗ', kind: 'vowel', rom: 'o', vi: '"ô" (tròn môi)', hint: 'Chấm Trời ở trên mặt Đất (ㅡ) — âm sáng "ô".', ex: '오이', exRom: 'oi', exVi: 'dưa chuột' },
  { j: 'ㅘ', kind: 'compound', rom: 'wa', vi: '"oa"', hint: 'ㅗ + ㅏ đọc liền: ô-a → "oa".', ex: '과일', exRom: 'gwail', exVi: 'trái cây' },
  { j: 'ㅙ', kind: 'compound', rom: 'wae', vi: '"oe"', hint: 'ㅗ + ㅐ đọc liền.', ex: '왜', exRom: 'wae', exVi: 'tại sao' },
  { j: 'ㅚ', kind: 'compound', rom: 'oe', vi: '"uê"', hint: 'ㅗ + ㅣ nhưng ngày nay đọc như "uê".', ex: '회사', exRom: 'hoesa', exVi: 'công ty' },
  { j: 'ㅛ', kind: 'yvowel', rom: 'yo', vi: '"yô"', hint: 'ㅗ thêm một gạch = thêm "y".', ex: '요리', exRom: 'yori', exVi: 'nấu ăn' },
  { j: 'ㅜ', kind: 'vowel', rom: 'u', vi: '"u" (tròn môi, chu ra)', hint: 'Chấm Trời ở dưới mặt Đất — âm tối "u".', ex: '우유', exRom: 'uyu', exVi: 'sữa' },
  { j: 'ㅝ', kind: 'compound', rom: 'wo', vi: '"uơ"', hint: 'ㅜ + ㅓ đọc liền: u-ơ → "uơ".', ex: '뭐', exRom: 'mwo', exVi: 'cái gì' },
  { j: 'ㅞ', kind: 'compound', rom: 'we', vi: '"uê"', hint: 'ㅜ + ㅔ đọc liền. Ít gặp.', ex: '웨이터', exRom: 'weiteo', exVi: 'bồi bàn' },
  { j: 'ㅟ', kind: 'compound', rom: 'wi', vi: '"uy"', hint: 'ㅜ + ㅣ đọc liền: u-i → "uy".', ex: '귀', exRom: 'gwi', exVi: 'cái tai' },
  { j: 'ㅠ', kind: 'yvowel', rom: 'yu', vi: '"yu"', hint: 'ㅜ thêm một gạch = thêm "y".', ex: '유리', exRom: 'yuri', exVi: 'thuỷ tinh' },
  { j: 'ㅡ', kind: 'vowel', rom: 'eu', vi: '"ư" (môi dẹt, không tròn)', hint: 'Một gạch ngang là mặt Đất phẳng — miệng cũng dẹt như vậy.', ex: '그림', exRom: 'geurim', exVi: 'bức tranh' },
  { j: 'ㅢ', kind: 'compound', rom: 'ui', vi: '"ưi"; sau phụ âm đọc "i", trợ từ 의 thường đọc "ê"', hint: 'ㅡ + ㅣ đọc lướt: ư-i.', ex: '의사', exRom: 'uisa', exVi: 'bác sĩ' },
  { j: 'ㅣ', kind: 'vowel', rom: 'i', vi: '"i"', hint: 'Một gạch đứng là Người đứng thẳng.', ex: '이', exRom: 'i', exVi: 'răng; số hai' },
]

// 7 âm cuối đại diện: chữ nào nằm ở patchim cũng chỉ đọc ra một trong bảy âm này.
export interface TailSound {
  id: string
  sound: string
  letters: string[]
  vi: string
  demo: string
  ex: string
  exRom: string
  exVi: string
}

export const TAIL_SOUNDS: TailSound[] = [
  { id: 'k', sound: 'k', letters: ['ㄱ', 'ㄲ', 'ㅋ'], vi: 'như "c" cuối trong "các": chặn ở cuống họng, không bật hơi ra', demo: '악', ex: '책', exRom: 'chaek', exVi: 'quyển sách' },
  { id: 'n', sound: 'n', letters: ['ㄴ'], vi: 'như "n" cuối trong "an"', demo: '안', ex: '산', exRom: 'san', exVi: 'ngọn núi' },
  { id: 't', sound: 't', letters: ['ㄷ', 'ㅌ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅎ'], vi: 'như "t" cuối trong "mát": lưỡi chặn lợi rồi dừng — kể cả ㅅ cũng đọc "t"', demo: '앋', ex: '옷', exRom: 'ot', exVi: 'quần áo' },
  { id: 'l', sound: 'l', letters: ['ㄹ'], vi: '"l" giữ lưỡi ở lợi trên, không uốn cong như "r"', demo: '알', ex: '물', exRom: 'mul', exVi: 'nước' },
  { id: 'm', sound: 'm', letters: ['ㅁ'], vi: 'như "m" cuối trong "am": khép môi', demo: '암', ex: '밤', exRom: 'bam', exVi: 'ban đêm' },
  { id: 'p', sound: 'p', letters: ['ㅂ', 'ㅍ'], vi: 'như "p" cuối trong "tháp": khép môi, không bật', demo: '압', ex: '밥', exRom: 'bap', exVi: 'cơm' },
  { id: 'ng', sound: 'ng', letters: ['ㅇ'], vi: 'như "ng" cuối trong "sang"', demo: '앙', ex: '방', exRom: 'bang', exVi: 'căn phòng' },
]

// Patchim đôi chỉ đọc một trong hai chữ (khi đứng cuối hoặc trước phụ âm).
const COMPOUND_TAIL: Record<string, string> = {
  'ㄳ': 'k', 'ㄵ': 'n', 'ㄶ': 'n', 'ㄺ': 'k', 'ㄻ': 'm', 'ㄼ': 'l',
  'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'p', 'ㅀ': 'l', 'ㅄ': 'p',
}

export function isCompoundTail(letter: string): boolean {
  return letter in COMPOUND_TAIL
}

export function tailSoundOf(letter: string): TailSound | undefined {
  const id = COMPOUND_TAIL[letter]
  return TAIL_SOUNDS.find((t) => (id ? t.id === id : t.letters.includes(letter)))
}

// Cặp người Việt hay lẫn — dùng làm đáp án nhiễu cho câu hỏi nghe/nhìn.
export const CONFUSABLE: string[][] = [
  ['ㄱ', 'ㅋ', 'ㄲ'], ['ㄷ', 'ㅌ', 'ㄸ'], ['ㅂ', 'ㅍ', 'ㅃ'], ['ㅈ', 'ㅊ', 'ㅉ'], ['ㅅ', 'ㅆ'],
  ['ㄴ', 'ㄹ', 'ㅁ', 'ㅇ', 'ㅎ'],
  ['ㅓ', 'ㅗ', 'ㅜ', 'ㅡ'], ['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'], ['ㅕ', 'ㅛ', 'ㅑ', 'ㅠ'],
  ['ㅘ', 'ㅝ', 'ㅙ', 'ㅞ', 'ㅚ'], ['ㅟ', 'ㅢ', 'ㅚ'],
]

export interface HangulLesson {
  id: string
  title: string
  sub: string
  intro: string
  kind: 'vowel' | 'consonant' | 'tail' | 'words'
  items: string[]
}

export const HANGUL_LESSONS: HangulLesson[] = [
  {
    id: 'v1', title: '6 nguyên âm gốc', sub: 'ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ', kind: 'vowel', items: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'],
    intro: 'Mọi nguyên âm Hangul dựng từ ba nét: chấm Trời, gạch ngang Đất (ㅡ) và gạch đứng Người (ㅣ). Nguyên âm không đứng một mình — luôn đi sau ㅇ câm: 아, 어, 오…',
  },
  {
    id: 'c1', title: 'Phụ âm nhóm 1', sub: 'ㄱ ㄴ ㄷ ㄹ ㅁ', kind: 'consonant', items: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'],
    intro: 'Phụ âm vẽ theo khẩu hình: ㄱ là gốc lưỡi chặn họng, ㄴ là đầu lưỡi chạm lợi, ㅁ là cái miệng. Nguyên âm dọc (ㅏ ㅓ ㅣ) đứng bên phải phụ âm, nguyên âm ngang (ㅗ ㅜ ㅡ) nằm bên dưới.',
  },
  {
    id: 'c2', title: 'Phụ âm nhóm 2', sub: 'ㅂ ㅅ ㅇ ㅈ ㅎ', kind: 'consonant', items: ['ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'],
    intro: 'Hoàn tất 10 phụ âm cơ bản. Nhớ: ㅇ ở đầu âm tiết không có tiếng, ㅅ trước ㅣ đọc gần "shi".',
  },
  {
    id: 'v2', title: 'Nguyên âm có "y" và ㅐ ㅔ', sub: 'ㅑ ㅕ ㅛ ㅠ ㅐ ㅔ', kind: 'vowel', items: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅐ', 'ㅔ'],
    intro: 'Thêm một gạch vào nguyên âm gốc là thêm "y" ở đầu: ㅏ→ㅑ, ㅓ→ㅕ, ㅗ→ㅛ, ㅜ→ㅠ. ㅐ và ㅔ ngày nay đọc gần giống nhau.',
  },
  {
    id: 'c3', title: 'Phụ âm bật hơi', sub: 'ㅋ ㅌ ㅍ ㅊ', kind: 'consonant', items: ['ㅋ', 'ㅌ', 'ㅍ', 'ㅊ'],
    intro: 'Thêm một nét vào phụ âm thường = thổi thêm hơi: ㄱ→ㅋ, ㄷ→ㅌ, ㅂ→ㅍ, ㅈ→ㅊ. Đặt tay trước miệng, đọc ㅋ ㅌ ㅍ ㅊ phải thấy gió.',
  },
  {
    id: 'c4', title: 'Phụ âm căng', sub: 'ㄲ ㄸ ㅃ ㅆ ㅉ', kind: 'consonant', items: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'],
    intro: 'Viết đôi = căng cổ họng, không có hơi. Tin vui cho người Việt: "t", "ch" tiếng Việt vốn đã gần ㄸ và ㅉ. Phân biệt ba âm 가 – 카 – 까 là kỹ năng nghe quan trọng nhất của bài này.',
  },
  {
    id: 'v3', title: 'Nguyên âm ghép', sub: 'ㅘ ㅝ ㅚ ㅟ ㅢ ㅙ ㅞ ㅒ ㅖ', kind: 'vowel', items: ['ㅘ', 'ㅝ', 'ㅚ', 'ㅟ', 'ㅢ', 'ㅙ', 'ㅞ', 'ㅒ', 'ㅖ'],
    intro: 'Ghép hai nguyên âm rồi đọc lướt thành một: ㅗ+ㅏ = ㅘ (oa), ㅜ+ㅓ = ㅝ (uơ), ㅜ+ㅣ = ㅟ (uy). Chỉ ghép cùng phe: ㅗ đi với ㅏ ㅐ ㅣ, ㅜ đi với ㅓ ㅔ ㅣ.',
  },
  {
    id: 'b1', title: 'Patchim — 7 âm cuối', sub: 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ', kind: 'tail', items: TAIL_SOUNDS.map((t) => t.id),
    intro: 'Phụ âm nằm dưới đáy âm tiết gọi là patchim. Có 16 chữ nhưng chỉ đọc ra 7 âm: k · n · t · l · m · p · ng. Lợi thế của người Việt: "c", "t", "p" cuối tiếng Việt cũng không bật hơi y như vậy.',
  },
  {
    id: 'w1', title: 'Nối âm & đọc từ thật', sub: '음악 → 으막', kind: 'words', items: [],
    intro: 'Patchim gặp âm tiết bắt đầu bằng ㅇ câm thì "nhảy" sang đọc chung: 음악 đọc là "eu-mak", 한국어 là "han-gu-geo". Bài này cho bạn đọc trọn từ thật trong lộ trình.',
  },
]

export const HANGUL_PASS = 80

// Bảng âm tiết kinh điển (반절표): 14 phụ âm cơ bản × 10 nguyên âm cơ bản.
export const CHART_LEADS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
export const CHART_TENSE = ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ']
export const CHART_VOWELS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ']

export const ALL_JAMO: Jamo[] = [...CONSONANTS, ...VOWELS]

export function jamoInfo(j: string): Jamo | undefined {
  return ALL_JAMO.find((x) => x.j === j)
}
