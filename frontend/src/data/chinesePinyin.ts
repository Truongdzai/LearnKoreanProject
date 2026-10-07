// Hệ pinyin cho người Việt: thanh mẫu, vận mẫu, bảng âm tiết hợp lệ của tiếng phổ thông, thanh điệu và quy tắc viết.

export interface PyInitial {
  p: string
  group: string
  vi: string
  trap?: string
}

export const INITIALS: PyInitial[] = [
  { p: 'b', group: 'Môi', vi: '"p" không bật hơi — gần "b" nhẹ', trap: 'Đừng rung dây thanh như "b" tiếng Việt quá mạnh; người Bắc Kinh nghe gần "p" gọn.' },
  { p: 'p', group: 'Môi', vi: '"p" bật hơi mạnh', trap: 'Hai môi khép rồi bật, không phải "ph" (f) của tiếng Việt.' },
  { p: 'm', group: 'Môi', vi: '"m"' },
  { p: 'f', group: 'Môi', vi: '"ph"' },
  { p: 'd', group: 'Đầu lưỡi', vi: '"t" không bật hơi — gần "t" tiếng Việt', trap: 'Không đọc thành "đ" (đ tiếng Việt có hơi bập vào trong).' },
  { p: 't', group: 'Đầu lưỡi', vi: '"th"' },
  { p: 'n', group: 'Đầu lưỡi', vi: '"n"' },
  { p: 'l', group: 'Đầu lưỡi', vi: '"l"' },
  { p: 'g', group: 'Cuống lưỡi', vi: '"c/k" không bật hơi' },
  { p: 'k', group: 'Cuống lưỡi', vi: '"k" bật hơi mạnh', trap: 'Không phải "kh" xát của tiếng Việt — đây là âm tắc rồi bật hơi.' },
  { p: 'h', group: 'Cuống lưỡi', vi: 'gần "kh" tiếng Việt (xát ở cuống họng)', trap: 'Đọc "h" của tiếng Việt thì quá nhẹ; hãy đọc như "kh".' },
  { p: 'j', group: 'Mặt lưỡi', vi: 'gần "ch" tiếng Việt, không bật hơi', trap: 'Mặt lưỡi áp vòm cứng, môi dẹt; chỉ đi với i và ü.' },
  { p: 'q', group: 'Mặt lưỡi', vi: '"ch" bật hơi', trap: 'Không đọc là "kw" hay "k" như tiếng Anh.' },
  { p: 'x', group: 'Mặt lưỡi', vi: 'gần "x" tiếng Việt nhưng mặt lưỡi nâng cao, môi dẹt' },
  { p: 'zh', group: 'Uốn lưỡi', vi: '"tr" uốn lưỡi, không bật hơi', trap: 'Đầu lưỡi cong lên chạm vòm cứng — như "tr" đọc chuẩn, cong hơn.' },
  { p: 'ch', group: 'Uốn lưỡi', vi: '"tr" uốn lưỡi, bật hơi' },
  { p: 'sh', group: 'Uốn lưỡi', vi: '"s" uốn lưỡi (như "s" đọc chuẩn)' },
  { p: 'r', group: 'Uốn lưỡi', vi: 'gần "r" tiếng Việt nhưng không rung, lưỡi cong như sh', trap: 'Không đọc thành "z" hay "d".' },
  { p: 'z', group: 'Đầu lưỡi – răng', vi: '"ch" đọc bằng đầu lưỡi sát răng (ts), không bật hơi', trap: 'Không đọc "d/gi" như tiếng Việt.' },
  { p: 'c', group: 'Đầu lưỡi – răng', vi: '"ts" bật hơi mạnh', trap: 'Không đọc là "c/k" như tiếng Việt — đây là lỗi hay gặp nhất.' },
  { p: 's', group: 'Đầu lưỡi – răng', vi: '"x" tiếng Việt' },
]

export interface PyFinal {
  p: string
  group: 'Đơn' | 'Kép' | 'Mũi' | 'Có i' | 'Có u' | 'Có ü'
  vi: string
}

export const FINALS: PyFinal[] = [
  { p: 'a', group: 'Đơn', vi: '"a"' },
  { p: 'o', group: 'Đơn', vi: '"ô" (sau b p m f nghe như "uô")' },
  { p: 'e', group: 'Đơn', vi: 'giữa "ư" và "ơ", lướt như "ưa"' },
  { p: 'i', group: 'Đơn', vi: '"i"; sau z c s và zh ch sh r đọc như "ư"' },
  { p: 'u', group: 'Đơn', vi: '"u"' },
  { p: 'ü', group: 'Đơn', vi: 'môi tròn như "u", lưỡi như "i" — gần "uy" đọc tròn môi' },
  { p: 'er', group: 'Đơn', vi: '"ơ" uốn lưỡi' },
  { p: 'ai', group: 'Kép', vi: '"ai"' },
  { p: 'ei', group: 'Kép', vi: '"ây"' },
  { p: 'ao', group: 'Kép', vi: '"ao"' },
  { p: 'ou', group: 'Kép', vi: '"âu"' },
  { p: 'an', group: 'Mũi', vi: '"an"' },
  { p: 'en', group: 'Mũi', vi: '"ân"' },
  { p: 'ang', group: 'Mũi', vi: '"ang"' },
  { p: 'eng', group: 'Mũi', vi: '"âng"' },
  { p: 'ong', group: 'Mũi', vi: '"ung"' },
  { p: 'ia', group: 'Có i', vi: '"ia" (đọc liền như "gia")' },
  { p: 'ie', group: 'Có i', vi: '"iê"' },
  { p: 'iao', group: 'Có i', vi: '"eo" có i đầu — "i-eo"' },
  { p: 'iou', group: 'Có i', vi: '"iêu" / "iâu" — viết gọn là iu' },
  { p: 'ian', group: 'Có i', vi: '"iên" (không đọc "ian")' },
  { p: 'in', group: 'Có i', vi: '"in"' },
  { p: 'iang', group: 'Có i', vi: '"iang"' },
  { p: 'ing', group: 'Có i', vi: '"inh"' },
  { p: 'iong', group: 'Có i', vi: '"iung"' },
  { p: 'ua', group: 'Có u', vi: '"oa"' },
  { p: 'uo', group: 'Có u', vi: '"uô"' },
  { p: 'uai', group: 'Có u', vi: '"oai"' },
  { p: 'uei', group: 'Có u', vi: '"uây" — viết gọn là ui' },
  { p: 'uan', group: 'Có u', vi: '"oan"' },
  { p: 'uen', group: 'Có u', vi: '"uân" — viết gọn là un' },
  { p: 'uang', group: 'Có u', vi: '"oang"' },
  { p: 'ueng', group: 'Có u', vi: '"uâng" (chỉ có weng)' },
  { p: 'üe', group: 'Có ü', vi: '"uê" tròn môi' },
  { p: 'üan', group: 'Có ü', vi: '"uyen" tròn môi' },
  { p: 'ün', group: 'Có ü', vi: '"uyn" tròn môi' },
]

// Âm tiết hợp lệ của tiếng phổ thông (không kể thanh), theo bảng âm tiết chuẩn; bỏ vài âm cực hiếm.
const TABLE: Record<string, string> = {
  '': 'a o e ai ei ao ou an en ang eng er yi ya ye yao you yan yin yang ying yong wu wa wo wai wei wan wen wang weng yu yue yuan yun',
  b: 'ba bo bai bei bao ban ben bang beng bi bie biao bian bin bing bu',
  p: 'pa po pai pei pao pou pan pen pang peng pi pie piao pian pin ping pu',
  m: 'ma mo me mai mei mao mou man men mang meng mi mie miao miu mian min ming mu',
  f: 'fa fo fei fou fan fen fang feng fu',
  d: 'da de dai dei dao dou dan den dang deng dong di die diao diu dian ding du duo dui duan dun',
  t: 'ta te tai tao tou tan tang teng tong ti tie tiao tian ting tu tuo tui tuan tun',
  n: 'na ne nai nei nao nou nan nen nang neng nong ni nie niao niu nian nin niang ning nu nuo nuan nü nüe',
  l: 'la le lai lei lao lou lan lang leng long li lia lie liao liu lian lin liang ling lu luo luan lun lü lüe',
  g: 'ga ge gai gei gao gou gan gen gang geng gong gu gua guo guai gui guan gun guang',
  k: 'ka ke kai kao kou kan ken kang keng kong ku kua kuo kuai kui kuan kun kuang',
  h: 'ha he hai hei hao hou han hen hang heng hong hu hua huo huai hui huan hun huang',
  j: 'ji jia jie jiao jiu jian jin jiang jing jiong ju jue juan jun',
  q: 'qi qia qie qiao qiu qian qin qiang qing qiong qu que quan qun',
  x: 'xi xia xie xiao xiu xian xin xiang xing xiong xu xue xuan xun',
  zh: 'zha zhe zhi zhai zhei zhao zhou zhan zhen zhang zheng zhong zhu zhua zhuo zhuai zhui zhuan zhun zhuang',
  ch: 'cha che chi chai chao chou chan chen chang cheng chong chu chuo chuai chui chuan chun chuang',
  sh: 'sha she shi shai shei shao shou shan shen shang sheng shu shua shuo shuai shui shuan shun shuang',
  r: 're ri rao rou ran ren rang reng rong ru ruo rui ruan run',
  z: 'za ze zi zai zei zao zou zan zen zang zeng zong zu zuo zui zuan zun',
  c: 'ca ce ci cai cao cou can cen cang ceng cong cu cuo cui cuan cun',
  s: 'sa se si sai sao sou san sen sang seng song su suo sui suan sun',
}

export const VALID_SYLLABLES = new Set(Object.values(TABLE).flatMap((row) => row.split(' ')))

export interface ToneInfo {
  n: 1 | 2 | 3 | 4 | 5
  name: string
  contour: number[]
  vi: string
  how: string
  ex: { zh: string; py: string; vi: string }[]
}

// Độ cao theo thang 5 bậc của Triệu Nguyên Nhậm: 55, 35, 214, 51
export const TONES: ToneInfo[] = [
  { n: 1, name: 'Thanh 1 · ˉ', contour: [5, 5], vi: 'gần thanh ngang nhưng giữ thật cao và phẳng',
    how: 'Bắt giọng cao hơn giọng nói thường một chút rồi giữ nguyên, như đang ngân "aaa".',
    ex: [{ zh: '妈', py: 'mā', vi: 'mẹ' }, { zh: '八', py: 'bā', vi: 'tám' }, { zh: '天', py: 'tiān', vi: 'trời' }] },
  { n: 2, name: 'Thanh 2 · ˊ', contour: [3, 5], vi: 'gần thanh sắc: từ giữa đi lên cao',
    how: 'Như khi hỏi lại "Hả?" vì không nghe rõ.',
    ex: [{ zh: '麻', py: 'má', vi: 'cây gai' }, { zh: '拔', py: 'bá', vi: 'nhổ' }, { zh: '茶', py: 'chá', vi: 'trà' }] },
  { n: 3, name: 'Thanh 3 · ˇ', contour: [2, 1, 4], vi: 'gần thanh hỏi: trầm xuống thấp rồi mới lên',
    how: 'Đứng trước thanh khác chỉ đọc nửa đầu (trầm thấp như thanh nặng kéo dài); hai thanh 3 liền nhau thì thanh đầu đọc thành thanh 2.',
    ex: [{ zh: '马', py: 'mǎ', vi: 'ngựa' }, { zh: '把', py: 'bǎ', vi: 'cầm, nắm' }, { zh: '好', py: 'hǎo', vi: 'tốt' }] },
  { n: 4, name: 'Thanh 4 · ˋ', contour: [5, 1], vi: 'giống thanh huyền nhưng bắt đầu từ rất cao và rơi dứt khoát',
    how: 'Như khi ra lệnh "Đi!" — ngắn, mạnh, rơi thẳng xuống.',
    ex: [{ zh: '骂', py: 'mà', vi: 'mắng' }, { zh: '爸', py: 'bà', vi: 'bố' }, { zh: '去', py: 'qù', vi: 'đi' }] },
  { n: 5, name: 'Thanh nhẹ', contour: [3, 3], vi: 'không dấu: đọc ngắn và nhẹ, độ cao phụ thuộc âm đứng trước',
    how: 'Hay gặp ở âm thứ hai của từ lặp và trợ từ: 妈妈 māma, 谢谢 xièxie, 吗 ma, 的 de.',
    ex: [{ zh: '妈妈', py: 'māma', vi: 'mẹ' }, { zh: '谢谢', py: 'xièxie', vi: 'cảm ơn' }, { zh: '我的', py: 'wǒ de', vi: 'của tôi' }] },
]

export interface SpellingRule {
  title: string
  rule: string
  ex: string[]
}

export const SPELLING_RULES: SpellingRule[] = [
  { title: 'Không có phụ âm đầu, bắt đầu bằng i → viết y', rule: 'i đứng một mình thêm y (yi); ia, ie, iao, iou, ian, iang, iong đổi i thành y; in, ing thêm y.',
    ex: ['i → yi', 'ia → ya', 'iou → you', 'ian → yan', 'in → yin', 'ing → ying'] },
  { title: 'Không có phụ âm đầu, bắt đầu bằng u → viết w', rule: 'u đứng một mình thêm w (wu); ua, uo, uai, uei, uan, uen, uang, ueng đổi u thành w.',
    ex: ['u → wu', 'ua → wa', 'uei → wei', 'uen → wen', 'ueng → weng'] },
  { title: 'ü đứng đầu → viết yu', rule: 'ü, üe, üan, ün không có phụ âm đầu viết thành yu, yue, yuan, yun.',
    ex: ['ü → yu', 'üe → yue', 'üan → yuan', 'ün → yun'] },
  { title: 'Sau j, q, x và y: ü bỏ hai chấm', rule: 'j q x không bao giờ đi với u thường, nên ju, qu, xu, yu luôn đọc là ü. Chỉ n và l mới giữ hai chấm: nü, lü.',
    ex: ['jü → ju', 'qüan → quan', 'xüe → xue', 'nü (giữ)', 'lü (giữ)'] },
  { title: 'Ba vận mẫu viết gọn', rule: 'Khi có phụ âm đầu: iou viết iu, uei viết ui, uen viết un — nhưng vẫn đọc đủ âm giữa.',
    ex: ['liou → liu', 'guei → gui', 'luen → lun'] },
  { title: 'Dấu thanh đặt ở đâu', rule: 'Có a hoặc e thì dấu lên a/e; có ou thì lên o; còn lại lên nguyên âm cuối cùng (iu → dấu trên u, ui → dấu trên i).',
    ex: ['hǎo', 'xièxie', 'zhōu', 'liú', 'guì'] },
  { title: 'Hai thanh 3 liền nhau', rule: 'Thanh 3 đứng trước thanh 3 đọc thành thanh 2, nhưng vẫn viết dấu thanh 3.',
    ex: ['你好 nǐ hǎo → đọc ní hǎo', '可以 kěyǐ → đọc kéyǐ', '水果 shuǐguǒ → đọc shuíguǒ'] },
  { title: '不 và 一 đổi thanh', rule: '不 bù đứng trước thanh 4 đọc bú; 一 yī đứng trước thanh 4 đọc yí, trước thanh 1-2-3 đọc yì.',
    ex: ['不是 bú shì', '不要 bú yào', '一个 yí ge', '一天 yì tiān'] },
]
