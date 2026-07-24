
import part1 from './english/toeic/part1.json'
import part2 from './english/toeic/part2.json'
import part3 from './english/toeic/part3.json'
import part4 from './english/toeic/part4.json'
import part5 from './english/toeic/part5.json'
import part6 from './english/toeic/part6.json'
import part7 from './english/toeic/part7.json'
import grammar from './english/toeic/grammar.json'


export interface ToeicP1Item {
  id: string
  img: string
  statements: string[]
  answer: number
  skill: string
  vi: string
  trap?: string
}

export interface ToeicP2Item {
  id: string
  q: string
  options: string[]
  answer: number
  skill: string
  vi: string
  trap?: string
}

export type Speaker = 'M' | 'W' | 'M2' | 'W2'

export interface ScriptLine {
  s: Speaker
  text: string
}

export interface ToeicSubQuestion {
  q: string
  options: string[]
  answer: number
  skill: string
}

export interface ToeicGraphic {
  title: string
  headers: string[]
  rows: string[][]
  note?: string
}

export interface ToeicConvItem {
  id: string
  title: string
  kind?: string
  script: ScriptLine[]
  graphic?: ToeicGraphic
  questions: ToeicSubQuestion[]
}

export interface ToeicP5Item {
  id: string
  text: string
  options: string[]
  answer: number
  skill: string
  explain: string
}

export interface ToeicP6Blank {
  options: string[]
  answer: number
  skill: string
  explain: string
}

export interface ToeicP6Item {
  id: string
  title: string
  kind: string
  text: string
  blanks: ToeicP6Blank[]
}

export interface ToeicP7Item {
  id: string
  title: string
  kind: string
  text: string
  questions: ToeicSubQuestion[]
}

export interface GrammarDrill {
  text: string
  options: string[]
  answer: number
  explain: string
}

export interface GrammarCapsule {
  id: string
  title: string
  tag: string
  points: string[]
  examples: { en: string; vi: string }[]
  drill: GrammarDrill[]
}

export const TOEIC_P1 = part1 as ToeicP1Item[]
export const TOEIC_P2 = part2 as ToeicP2Item[]
export const TOEIC_P3 = part3 as ToeicConvItem[]
export const TOEIC_P4 = part4 as ToeicConvItem[]
export const TOEIC_P5 = part5 as ToeicP5Item[]
export const TOEIC_P6 = part6 as ToeicP6Item[]
export const TOEIC_P7 = part7 as ToeicP7Item[]
export const GRAMMAR_CAPSULES = grammar as GrammarCapsule[]


export interface SkillInfo {
  vi: string
  group: 'listening' | 'grammar' | 'reading'
  advice: string
}

export const SKILLS: Record<string, SkillInfo> = {
  'l-photo': { vi: 'Tả ảnh (Part 1)', group: 'listening', advice: 'Trước khi audio chạy, tự đặt tên người/vật/vị trí trong ảnh bằng tiếng Anh; đề 2026 hay tả CHI TIẾT PHỤ và dùng từ vị trí (propped against, mounted on).' },
  'l-wh': { vi: 'Nghe câu hỏi WH', group: 'listening', advice: 'Tập nghe RÕ từ đầu tiên (Who/What/Where/When/Why/How) — nó quyết định dạng câu trả lời.' },
  'l-yesno': { vi: 'Câu hỏi Yes/No & câu đuôi', group: 'listening', advice: 'Luyện phản xạ với Do/Does/Did/Have ở đầu câu và các câu trả lời gián tiếp (Not yet, Almost…).' },
  'l-choice': { vi: 'Câu hỏi lựa chọn A hay B', group: 'listening', advice: 'Câu hỏi "or" không bao giờ trả lời Yes/No — nghe kỹ hai vế để chọn.' },
  'l-statement': { vi: 'Phản hồi câu trần thuật', group: 'listening', advice: 'Với câu kể (báo tin, than phiền), chọn phản hồi hợp tình huống thay vì tìm "câu trả lời".' },
  'l-similar': { vi: 'Bẫy âm gần giống', group: 'listening', advice: 'Đáp án lặp lại từ trong câu hỏi hoặc từ phát âm na ná thường là bẫy — nghe NGHĨA, đừng nghe TỪ.' },
  'l-detail': { vi: 'Nghe bắt chi tiết', group: 'listening', advice: 'Đọc trước câu hỏi để biết cần nghe gì (giờ, nơi, số); chi tiết thường được nói bằng từ đồng nghĩa.' },
  'l-infer': { vi: 'Suy luận khi nghe', group: 'listening', advice: 'Chú ý câu cuối hội thoại — hành động tiếp theo thường nằm ở đó.' },
  'l-main': { vi: 'Nắm ý chính bài nghe', group: 'listening', advice: 'Đừng dịch từng từ; tự hỏi "họ đang nói về chuyện gì?" sau 2 câu đầu.' },
  'l-purpose': { vi: 'Ngữ cảnh & mục đích bài nói', group: 'listening', advice: 'Đoán bối cảnh (sân bay? cửa hàng?) ngay từ câu chào đầu tiên của bài nói.' },
  'l-graphic': { vi: 'Nhìn bảng/biểu đồ khi nghe', group: 'listening', advice: 'ĐỌC BẢNG TRƯỚC khi audio chạy và khoanh cột chứa đáp án. Audio KHÔNG BAO GIỜ đọc thẳng ô đó — nó nói dữ kiện ở cột kia (số người, giờ, giá) để bạn tự dóng sang. Nghe con số/điều kiện rồi mới nhìn lại bảng.' },
  'word-form': { vi: 'Từ loại (word form)', group: 'grammar', advice: 'Học các hậu tố (-tion, -ive, -ly…) và vị trí trong câu — dạng câu nhiều điểm nhất Part 5. Ôn viên nang "Từ loại & hậu tố".' },
  'tense': { vi: 'Thì động từ', group: 'grammar', advice: 'Tìm dấu hiệu thời gian trong câu (ago, since, by the time, next year) trước khi chọn.' },
  'prep': { vi: 'Giới từ', group: 'grammar', advice: 'Học theo cụm (by Friday, until 8, access to, in advance) thay vì học lẻ từng giới từ.' },
  'conj': { vi: 'Liên từ & từ nối', group: 'grammar', advice: 'Nhìn sau chỗ trống: mệnh đề → although/because; danh từ → despite/because of.' },
  'pronoun': { vi: 'Đại từ', group: 'grammar', advice: 'Xác định vai trò: trước danh từ → sở hữu (their); sau động từ → tân ngữ (them).' },
  'vocab': { vi: 'Từ vựng ngữ cảnh', group: 'grammar', advice: 'Gặp từ mới trong đề là lưu vào SRS ngay — từ vựng Part 5 lặp lại rất nhiều giữa các đề.' },
  'comparative': { vi: 'So sánh', group: 'grammar', advice: 'So sánh 2 → -er/more; nhóm từ 3 trở lên ("of the three") → -est/most.' },
  'relative': { vi: 'Mệnh đề quan hệ', group: 'grammar', advice: 'whose + danh từ (sở hữu), who làm chủ ngữ, whom làm tân ngữ, where cho nơi chốn.' },
  'modal': { vi: 'Động từ khuyết thiếu', group: 'grammar', advice: 'Sau modal luôn là V nguyên thể; phân biệt must not (cấm) với don\'t have to (không cần).' },
  'agreement': { vi: 'Hoà hợp chủ - vị', group: 'grammar', advice: 'Gạch bỏ cụm giới từ giữa chủ ngữ và động từ để thấy chủ ngữ thật (The PRICE of the tickets IS…).' },
  'passive': { vi: 'Câu bị động', group: 'grammar', advice: 'Chủ ngữ không tự làm hành động được → be + V3 (the report was written).' },
  'gerund': { vi: 'V-ing / to V', group: 'grammar', advice: 'Thuộc nhóm động từ: enjoy/consider/suggest + V-ing; want/plan/agree + to V; sau giới từ luôn V-ing.' },
  'article': { vi: 'Mạo từ & lượng từ', group: 'grammar', advice: 'an + âm nguyên âm; much + không đếm được; many + đếm được số nhiều.' },
  'sentence': { vi: 'Chèn câu vào đoạn (Part 6)', group: 'reading', advice: 'Đọc câu NGAY TRƯỚC và NGAY SAU chỗ trống: câu đúng phải nối mạch ý và không mâu thuẫn thông tin đã nêu. Loại nhanh phương án nói ngược với đoạn (đang miễn phí lại bảo có phí) hoặc lạc chủ đề.' },
  'r-detail': { vi: 'Đọc tìm chi tiết', group: 'reading', advice: 'Đọc câu hỏi trước, xác định từ khoá rồi quét (scan) văn bản — đừng đọc tuần tự từ đầu.' },
  'r-main': { vi: 'Ý chính văn bản', group: 'reading', advice: 'Đọc lướt (skim) tiêu đề, dòng chủ đề email và đoạn đầu — ý chính thường nằm ở đó, chưa cần đọc chi tiết.' },
  'r-infer': { vi: 'Suy luận khi đọc', group: 'reading', advice: 'Đáp án suy luận phải CÓ CƠ SỞ trong bài — loại các phương án "nghe hợp lý" nhưng bài không nhắc.' },
  'r-vocab': { vi: 'Từ đồng nghĩa trong bài', group: 'reading', advice: 'Thay từng phương án vào câu gốc, chọn từ giữ nguyên nghĩa của câu.' },
  'r-nots': { vi: 'Câu hỏi NOT/EXCEPT', group: 'reading', advice: 'Đánh dấu 3 phương án tìm THẤY trong bài — cái còn lại là đáp án.' },
  'r-insert': { vi: 'Chèn câu vào vị trí [1]–[4]', group: 'reading', advice: 'Bắt từ nối và đại từ trong câu cần chèn (However, This, They, instead…) rồi tìm chỗ mà câu TRƯỚC nó cung cấp đúng đối tượng được nhắc lại. Thử đọc liền mạch 3 câu quanh mỗi vị trí thay vì đoán.' },
}


export interface PartMeta {
  part: number
  section: 'listening' | 'reading'
  name: string
  desc: string
  strategy: string[]
  realCount: number
}

export const PART_META: PartMeta[] = [
  {
    part: 1, section: 'listening', name: 'Tả ảnh', realCount: 6,
    desc: 'Nhìn ảnh chụp thật (đen trắng như đề thi), nghe 4 câu mô tả không in trên đề, chọn câu tả đúng nhất.',
    strategy: [
      'Trước khi audio chạy: tự đặt tên người / vật / vị trí trong ảnh bằng tiếng Anh.',
      'Xu hướng 2026: đáp án đúng hay tả CHI TIẾT PHỤ (đồ vật, vị trí) chứ không phải người ở giữa ảnh.',
      'Học từ vị trí: propped against (dựng tựa), mounted on (gắn trên), stacked (xếp chồng), in a row (thành hàng).',
      'Bẫy kinh điển: bị động đang diễn ra (is being installed) chỉ đúng khi có NGƯỜI đang làm việc đó trong ảnh.',
    ],
  },
  {
    part: 2, section: 'listening', name: 'Hỏi – Đáp', realCount: 25,
    desc: 'Nghe 1 câu hỏi + 3 câu trả lời (không có chữ trên đề), chọn câu trả lời hợp nhất.',
    strategy: [
      'Từ ĐẦU TIÊN quyết định tất cả: Who → người, Where → nơi, When → thời gian.',
      'Đáp án lặp lại từ của câu hỏi hoặc từ phát âm giống → 80% là bẫy.',
      'Câu hỏi "A or B?" không bao giờ trả lời Yes/No.',
      'Trả lời gián tiếp ("Ask the manager", "Not yet") thường là đáp án đúng.',
    ],
  },
  {
    part: 3, section: 'listening', name: 'Hội thoại ngắn', realCount: 39,
    desc: 'Nghe hội thoại 2 người rồi trả lời 3 câu hỏi trắc nghiệm.',
    strategy: [
      'ĐỌC TRƯỚC 3 câu hỏi trong lúc chờ audio — biết cần nghe gì.',
      'Câu 1 thường hỏi ngữ cảnh/mục đích, câu 3 thường hỏi hành động tiếp theo.',
      'Đáp án hay dùng TỪ ĐỒNG NGHĨA với từ trong bài (buy → purchase).',
      'Câu có bảng ("Look at the graphic"): đọc bảng TRƯỚC, audio chỉ nói dữ kiện ở cột kia để bạn tự dóng sang.',
    ],
  },
  {
    part: 4, section: 'listening', name: 'Bài nói ngắn', realCount: 30,
    desc: 'Nghe 1 người nói (thông báo, tin nhắn thoại, quảng cáo…) rồi trả lời 3 câu hỏi.',
    strategy: [
      'Câu chào đầu tiên tiết lộ bối cảnh: "This is your captain" → máy bay.',
      'Số liệu (giờ, giá, số phòng) gần như chắc chắn sẽ được hỏi — ghi nhớ khi nghe.',
      'Chú ý câu mệnh lệnh "Please…" — thường thành câu hỏi "người nghe được yêu cầu làm gì?".',
      'Câu có bảng: đáp án đúng KHÔNG được đọc thành lời, phải ghép điều kiện nghe được với bảng in sẵn.',
    ],
  },
  {
    part: 5, section: 'reading', name: 'Hoàn thành câu', realCount: 30,
    desc: 'Chọn từ/cụm từ đúng điền vào chỗ trống trong câu đơn.',
    strategy: [
      'Nhìn 4 phương án TRƯỚC: cùng gốc từ → câu hỏi từ loại, chỉ cần xét vị trí; khác nghĩa → phải dịch.',
      'Câu từ loại: xác định chỗ trống cần danh/động/tính/trạng từ là chọn được ngay, không cần hiểu cả câu.',
      'Mỗi câu tối đa 30 giây — phân vân quá thì chọn và đi tiếp, đừng để mất điểm Part 7.',
    ],
  },
  {
    part: 6, section: 'reading', name: 'Hoàn thành đoạn văn', realCount: 16,
    desc: 'Điền 4 chỗ trống trong 1 văn bản ngắn (email, thông báo, thư).',
    strategy: [
      'Đọc CẢ ĐOẠN chứ đừng chỉ đọc câu chứa chỗ trống — đáp án thì/từ nối phụ thuộc câu trước sau.',
      'Câu chọn "câu hoàn chỉnh" điền vào đoạn: chọn câu nối tiếp mạch ý câu liền trước.',
    ],
  },
  {
    part: 7, section: 'reading', name: 'Đọc hiểu', realCount: 54,
    desc: 'Đọc văn bản (email, quảng cáo, tin nhắn, bài báo…) và trả lời câu hỏi.',
    strategy: [
      'Đọc câu hỏi trước → quét văn bản tìm từ khoá, không đọc tuần tự.',
      'Câu hỏi NOT: tìm 3 cái CÓ trong bài, cái còn lại là đáp án.',
      'Văn bản kép: câu khó thường phải GHÉP thông tin từ cả hai văn bản.',
      'Dạng chèn câu vào vị trí [1]–[4]: bám từ nối và đại từ (However, This, She…) để tìm chỗ mạch ý khớp nhau.',
      'Quản trị thời gian: mục tiêu ~1 phút/câu, làm văn bản đơn trước.',
    ],
  },
]


export function estimateScore(rawL: number, totalL: number, rawR: number, totalR: number): {
  listening: number
  reading: number
  total: number
} {
  const curve = (pct: number, gentle: number): number => {
    if (pct <= 0) return 5
    const scaled = 5 + 490 * Math.pow(pct, gentle)
    return Math.min(495, Math.round(scaled / 5) * 5)
  }
  const listening = totalL > 0 ? curve(rawL / totalL, 0.92) : 0
  const reading = totalR > 0 ? curve(rawR / totalR, 1.05) : 0
  return { listening, reading, total: listening + reading }
}

const L_ANCHORS: [number, number][] = [[0, 5], [10, 40], [20, 90], [30, 135], [40, 190], [50, 255], [60, 315], [70, 370], [80, 425], [90, 480], [100, 495]]
const R_ANCHORS: [number, number][] = [[0, 5], [10, 35], [20, 85], [30, 140], [40, 200], [50, 250], [60, 300], [70, 355], [80, 410], [90, 465], [100, 495]]

function interp(anchors: [number, number][], raw: number): number {
  const x = Math.max(0, Math.min(100, raw))
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1]
    const [x1, y1] = anchors[i]
    if (x <= x1) {
      const y = y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
      return Math.round(y / 5) * 5
    }
  }
  return 495
}

export function estimateScoreFull(rawL: number, rawR: number): {
  listening: number
  reading: number
  total: number
} {
  const listening = interp(L_ANCHORS, rawL)
  const reading = interp(R_ANCHORS, rawR)
  return { listening, reading, total: listening + reading }
}

export const TOEIC_TARGET = 750


export type ToeicTaskKind = 'grammar' | 'vocab' | 'practice' | 'minitest' | 'review' | 'video' | 'custom' | 'weak' | 'wrongbook'

export interface ToeicTask {
  id: string
  kind: ToeicTaskKind
  label: string
  capsuleId?: string
  unitId?: string
  pct?: number
  part?: number
  n?: number
}

export interface ToeicDay {
  d: number
  phase: 1 | 2 | 3 | 4
  title: string
  tasks: ToeicTask[]
}

export interface ToeicPhase {
  phase: 1 | 2 | 3 | 4
  name: string
  range: string
  goal: string
}

export const TOEIC_PHASES: ToeicPhase[] = [
  { phase: 1, name: 'Lấy gốc cấp tốc', range: 'Ngày 1–14', goal: 'Nắm 13 điểm ngữ pháp nền + 6 nhóm từ vựng lõi. Đo điểm đầu vào ngay ngày 1.' },
  { phase: 2, name: 'Làm quen dạng đề', range: 'Ngày 15–30', goal: 'Hiểu chiến thuật cả 6 Part, hoàn thành ngữ pháp nâng cao. Thi thử lần 2 ngày 30.' },
  { phase: 3, name: 'Luyện sâu & vá điểm yếu', range: 'Ngày 31–45', goal: 'Luyện khối lượng lớn theo Part + tấn công kỹ năng yếu nhất. Thi thử lần 3 ngày 45.' },
  { phase: 4, name: 'Tổng luyện nước rút', range: 'Ngày 46–60', goal: 'Nhịp thi thật mỗi ngày, tối ưu thời gian làm bài. Thi thử chung kết ngày 59.' },
]

const g = (d: number, capsuleId: string): ToeicTask => {
  const c = GRAMMAR_CAPSULES.find((x) => x.id === capsuleId)
  return { id: `d${d}-g`, kind: 'grammar', capsuleId, label: `Ngữ pháp: ${c?.title ?? capsuleId} (đạt ≥ 3/4 câu luyện)` }
}
const v = (d: number, unitId: string, pct: number, name: string): ToeicTask =>
  ({ id: `d${d}-v`, kind: 'vocab', unitId, pct, label: `Từ vựng: thuộc ${pct}% unit "${name}"` })
const p = (d: number, part: number, n: number): ToeicTask =>
  ({ id: `d${d}-p${part}`, kind: 'practice', part, n, label: `Luyện Part ${part}: ${n} câu` })
const mt = (d: number, label: string): ToeicTask => ({ id: `d${d}-mt`, kind: 'minitest', label })
const rv = (d: number): ToeicTask => ({ id: `d${d}-rv`, kind: 'review', label: 'Ôn thẻ SRS đến hạn hôm nay' })
const vd = (d: number): ToeicTask => ({ id: `d${d}-vd`, kind: 'video', label: 'Xem 1 video tiếng Anh + lưu từ mới' })
const cu = (d: number, label: string): ToeicTask => ({ id: `d${d}-cu`, kind: 'custom', label })
const wk = (d: number, n: number): ToeicTask =>
  ({ id: `d${d}-wk`, kind: 'weak', n, label: `Luyện điểm yếu: ${n} câu kỹ năng yếu nhất của bạn` })
const wb = (d: number, n: number): ToeicTask =>
  ({ id: `d${d}-wb`, kind: 'wrongbook', n, label: `Sổ tay câu sai: ôn lại ${n} câu bạn từng làm sai` })

export const TOEIC_60_DAYS: ToeicDay[] = [
  { d: 1, phase: 1, title: 'Đo điểm xuất phát', tasks: [mt(1, 'Thi thử ĐẦU VÀO — cứ làm hết sức, điểm thấp là bình thường!'), g(1, 'g01'), v(1, 'nouns', 50, 'Danh từ cốt lõi')] },
  { d: 2, phase: 1, title: 'Nền móng câu', tasks: [g(2, 'g02'), v(2, 'nouns', 100, 'Danh từ cốt lõi'), p(2, 2, 5)] },
  { d: 3, phase: 1, title: 'Hiện tại đơn', tasks: [g(3, 'g03'), v(3, 'places', 50, 'Nơi chốn & đời sống'), rv(3)] },
  { d: 4, phase: 1, title: 'Đang xảy ra hay thường xuyên?', tasks: [g(4, 'g04'), v(4, 'places', 100, 'Nơi chốn & đời sống'), p(4, 2, 5)] },
  { d: 5, phase: 1, title: 'Vũ khí Part 5: từ loại', tasks: [g(5, 'g05'), v(5, 'verbs', 50, 'Động từ cốt lõi'), p(5, 5, 8)] },
  { d: 6, phase: 1, title: 'Kể chuyện quá khứ', tasks: [g(6, 'g06'), v(6, 'verbs', 100, 'Động từ cốt lõi'), rv(6)] },
  { d: 7, phase: 1, title: 'Nghỉ có chủ đích', tasks: [vd(7), rv(7), cu(7, 'Nghe lại các câu Part 2 đã làm sai trong tuần (mở Phân tích)')] },
  { d: 8, phase: 1, title: 'Nói chuyện tương lai', tasks: [g(8, 'g07'), v(8, 'worklife', 50, 'Công việc & học hành'), p(8, 5, 8)] },
  { d: 9, phase: 1, title: 'since & for', tasks: [g(9, 'g08'), v(9, 'worklife', 100, 'Công việc & học hành'), p(9, 2, 5)] },
  { d: 10, phase: 1, title: 'must, should, may', tasks: [g(10, 'g09'), v(10, 'timenum', 50, 'Số đếm & thời gian'), rv(10)] },
  { d: 11, phase: 1, title: 'in, on, at, by, until', tasks: [g(11, 'g10'), v(11, 'timenum', 100, 'Số đếm & thời gian'), p(11, 5, 8)] },
  { d: 12, phase: 1, title: 'Nối câu cho mượt', tasks: [g(12, 'g11'), v(12, 'foodshop', 50, 'Ăn uống & mua sắm'), p(12, 2, 5)] },
  { d: 13, phase: 1, title: 'So sánh', tasks: [g(13, 'g12'), v(13, 'foodshop', 100, 'Ăn uống & mua sắm'), rv(13)] },
  { d: 14, phase: 1, title: 'Chốt chặng lấy gốc', tasks: [g(14, 'g13'), p(14, 5, 10), vd(14)] },

  { d: 15, phase: 2, title: 'Bị động — giọng văn công sở', tasks: [g(15, 'g14'), p(15, 2, 10), rv(15)] },
  { d: 16, phase: 2, title: 'Tăng tốc Part 2', tasks: [p(16, 2, 10), v(16, 'verbs2', 50, 'Động từ giao tiếp & sinh hoạt'), vd(16)] },
  { d: 17, phase: 2, title: 'Mệnh đề quan hệ', tasks: [g(17, 'g15'), p(17, 5, 12), rv(17)] },
  { d: 18, phase: 2, title: 'Ngày Part 5 chuyên sâu', tasks: [p(18, 5, 12), v(18, 'verbs2', 100, 'Động từ giao tiếp & sinh hoạt'), vd(18)] },
  { d: 19, phase: 2, title: 'V-ing hay to V?', tasks: [g(19, 'g16'), p(19, 3, 6), rv(19)] },
  { d: 20, phase: 2, title: 'Nghe hội thoại thật', tasks: [p(20, 3, 6), v(20, 'adjectives', 50, 'Tính từ ứng dụng cao'), vd(20)] },
  { d: 21, phase: 2, title: 'Nghỉ có chủ đích', tasks: [rv(21), wb(21, 10), cu(21, 'Nghe thụ động 15 phút tiếng Anh (podcast/video) khi rảnh tay')] },
  { d: 22, phase: 2, title: 'Hoà hợp chủ - vị', tasks: [g(22, 'g17'), p(22, 6, 4), rv(22)] },
  { d: 23, phase: 2, title: 'Điền đoạn văn Part 6', tasks: [p(23, 6, 8), v(23, 'adjectives', 100, 'Tính từ ứng dụng cao'), vd(23)] },
  { d: 24, phase: 2, title: 'Câu điều kiện', tasks: [g(24, 'g18'), p(24, 4, 6), rv(24)] },
  { d: 25, phase: 2, title: 'Bài nói ngắn Part 4', tasks: [p(25, 4, 6), v(25, 'preps', 50, 'Giới từ & từ nối'), vd(25)] },
  { d: 26, phase: 2, title: 'Bơi vào Part 7', tasks: [p(26, 7, 6), rv(26), cu(26, 'Đọc kỹ phần chiến thuật Part 7 trước khi luyện')] },
  { d: 27, phase: 2, title: 'Đọc hiểu tăng tốc', tasks: [p(27, 7, 7), v(27, 'preps', 100, 'Giới từ & từ nối'), vd(27)] },
  { d: 28, phase: 2, title: 'Phối hợp nghe + đọc', tasks: [p(28, 5, 12), p(28, 2, 8), rv(28)] },
  { d: 29, phase: 2, title: 'Tổng duyệt trước thi thử', tasks: [p(29, 3, 6), p(29, 4, 6), vd(29)] },
  { d: 30, phase: 2, title: '🎯 Thi thử giữa kỳ', tasks: [mt(30, 'Thi thử lần 2 — so điểm với ngày 1 để thấy mình đã đi bao xa'), rv(30)] },

  { d: 31, phase: 3, title: 'Đọc kết quả, chọn mục tiêu', tasks: [cu(31, 'Mở tab Phân tích: ghi lại 3 kỹ năng yếu nhất của bạn'), wk(31, 10), rv(31)] },
  { d: 32, phase: 3, title: 'Ngày nghe chuyên sâu', tasks: [p(32, 2, 10), p(32, 3, 6), v(32, 'tech', 50, 'Công nghệ & mạng số')] },
  { d: 33, phase: 3, title: 'Ngày đọc chuyên sâu', tasks: [p(33, 5, 15), rv(33), vd(33)] },
  { d: 34, phase: 3, title: 'Vá điểm yếu #2', tasks: [wk(34, 10), v(34, 'tech', 100, 'Công nghệ & mạng số'), rv(34)] },
  { d: 35, phase: 3, title: 'Hội thoại + bài nói', tasks: [p(35, 3, 6), p(35, 4, 6), vd(35)] },
  { d: 36, phase: 3, title: 'Part 6 + 7 liền mạch', tasks: [p(36, 6, 8), p(36, 7, 7), rv(36)] },
  { d: 37, phase: 3, title: 'Ôn ngữ pháp còn hổng', tasks: [cu(37, 'Làm lại 2 viên nang ngữ pháp có điểm luyện thấp nhất'), wk(37, 10), wb(37, 10)] },
  { d: 38, phase: 3, title: 'Nước rút tuần 6', tasks: [p(38, 5, 15), v(38, 'home', 50, 'Nhà cửa & đồ dùng'), rv(38)] },
  { d: 39, phase: 3, title: 'Nghe không nhìn chữ', tasks: [p(39, 2, 10), p(39, 4, 6), vd(39)] },
  { d: 40, phase: 3, title: 'Vá điểm yếu #3', tasks: [wk(40, 10), v(40, 'home', 100, 'Nhà cửa & đồ dùng'), rv(40)] },
  { d: 41, phase: 3, title: 'Đọc dài hơi', tasks: [p(41, 7, 8), rv(41), cu(41, 'Bấm giờ: mỗi câu Part 7 tối đa 1 phút')] },
  { d: 42, phase: 3, title: 'Phối hợp toàn diện', tasks: [p(42, 3, 6), p(42, 5, 12), vd(42)] },
  { d: 43, phase: 3, title: 'Từ phản xạ nhanh', tasks: [v(43, 'phrases2', 100, 'Cụm phản xạ nhanh'), wk(43, 10), rv(43)] },
  { d: 44, phase: 3, title: 'Tổng duyệt chặng 3', tasks: [p(44, 6, 8), p(44, 2, 8), wb(44, 10)] },
  { d: 45, phase: 3, title: '🎯 Thi thử lần 3', tasks: [mt(45, 'Thi thử lần 3 — mục tiêu vượt điểm lần 2 ít nhất 50 điểm'), rv(45)] },

  { d: 46, phase: 4, title: 'Phân tích & lên dây cót', tasks: [cu(46, 'So sánh 3 lần thi thử trong tab Phân tích — kỹ năng nào cải thiện chậm nhất?'), wk(46, 10), rv(46)] },
  { d: 47, phase: 4, title: 'Nhịp thi thật: nghe', tasks: [p(47, 2, 10), p(47, 3, 9), vd(47)] },
  { d: 48, phase: 4, title: 'Nhịp thi thật: đọc', tasks: [p(48, 5, 15), p(48, 7, 7), rv(48)] },
  { d: 49, phase: 4, title: 'Đổi tai đổi mắt', tasks: [p(49, 4, 9), p(49, 6, 8), vd(49)] },
  { d: 50, phase: 4, title: 'Vá điểm yếu lần cuối', tasks: [wk(50, 15), rv(50), wb(50, 15)] },
  { d: 51, phase: 4, title: 'Tổng ôn ngữ pháp', tasks: [cu(51, 'Lướt lại 18 viên nang ngữ pháp — chỉ đọc phần quy tắc, 30 phút'), p(51, 5, 15), vd(51)] },
  { d: 52, phase: 4, title: '🎯 Thi thử lần 4', tasks: [mt(52, 'Thi thử lần 4 — tập quản trị thời gian như thi thật'), rv(52)] },
  { d: 53, phase: 4, title: 'Sửa sai lần 4', tasks: [wb(53, 15), wk(53, 10), vd(53)] },
  { d: 54, phase: 4, title: 'Nghe nước rút', tasks: [p(54, 2, 10), p(54, 4, 9), rv(54)] },
  { d: 55, phase: 4, title: 'Đọc nước rút', tasks: [p(55, 7, 8), p(55, 6, 8), vd(55)] },
  { d: 56, phase: 4, title: 'Giữ phong độ', tasks: [p(56, 3, 9), p(56, 5, 12), rv(56)] },
  { d: 57, phase: 4, title: 'Ngày nhẹ trước chung kết', tasks: [rv(57), wb(57, 10), cu(57, 'Ngủ đủ — não cần nghỉ để ghi nhớ. Hôm nay chỉ ôn nhẹ')] },
  { d: 58, phase: 4, title: 'Khởi động chung kết', tasks: [wk(58, 10), p(58, 2, 5), rv(58)] },
  { d: 59, phase: 4, title: '🏁 Thi thử CHUNG KẾT', tasks: [mt(59, 'Thi thử chung kết — làm trong yên tĩnh, bấm giờ nghiêm túc'), cu(59, 'Ghi lại điểm ước lượng cuối cùng của bạn')] },
  { d: 60, phase: 4, title: '🎓 Tổng kết hành trình', tasks: [cu(60, 'So điểm ngày 1 và ngày 59 — bạn đã đi một chặng rất dài!'), rv(60), cu(60, 'Đăng ký lịch thi TOEIC thật trong 2 tuần tới khi phong độ đang cao')] },
]

export const TOEIC_TASK_TOTAL = TOEIC_60_DAYS.reduce((s, d) => s + d.tasks.length, 0)

for (const day of TOEIC_60_DAYS) {
  const seen = new Set<string>()
  for (const t of day.tasks) {
    let id = t.id
    while (seen.has(id)) id = id + 'x'
    t.id = id
    seen.add(id)
  }
}
