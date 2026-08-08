
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


export type ToeicTaskKind =
  | 'grammar' | 'vocab' | 'practice' | 'minitest' | 'review' | 'video'
  | 'custom' | 'weak' | 'wrongbook' | 'speak' | 'write' | 'guide' | 'errorlog'

export interface ToeicTask {
  id: string
  kind: ToeicTaskKind
  label: string
  capsuleId?: string
  unitId?: string
  pct?: number
  part?: number
  n?: number
  swIds?: string[]
  times?: number
  chapter?: string
}

export interface ToeicDay {
  d: number
  week: number
  phase: number
  title: string
  tasks: ToeicTask[]
}

export interface ToeicPhase {
  phase: number
  name: string
  range: string
  goal: string
  output: string
}

export interface ToeicWeek {
  w: number
  phase: number
  theme: string
}

export const TOEIC_TOTAL_DAYS = 84

export const TOEIC_PHASES: ToeicPhase[] = [
  {
    phase: 1, name: 'Chẩn đoán & bộ công cụ', range: 'Tuần 1–2 · ngày 1–14',
    goal: 'Chưa cố bao phủ toàn bộ đề. Hai tuần này tạo CÔNG CỤ: cách phân tích câu, cách ghi từ, cách nghe kèm bản chép lời, cách ghi âm, cách viết nhật ký lỗi.',
    output: 'Bản ghi âm ban đầu · bài viết ban đầu · nhật ký lỗi · bộ từ vựng có âm thanh.',
  },
  {
    phase: 2, name: 'Hệ động từ & diễn ngôn ngắn', range: 'Tuần 3–4 · ngày 15–28',
    goal: 'Chuyển từ đơn vị nhỏ sang diễn ngôn: hệ thống động từ, hỏi và phản hồi, nghe theo cụm, Part 3 và Part 6, mô tả tranh, viết câu từ ảnh.',
    output: 'Một bài Listening rút gọn · bốn bài mô tả tranh · 10 câu Writing từ ảnh.',
  },
  {
    phase: 3, name: 'Quan hệ logic & văn bản đơn', range: 'Tuần 5–6 · ngày 29–42',
    goal: 'Giới từ, liên từ, mệnh đề; nhận ra cách diễn đạt tương đương; Part 4 và Part 7 đoạn đơn; câu hỏi Speaking ngắn; email yêu cầu thông tin.',
    output: 'Hai email hoàn chỉnh · một bài Reading có bấm giờ · bản ghi câu 5–7.',
  },
  {
    phase: 4, name: 'Kết nối nhiều nguồn', range: 'Tuần 7–8 · ngày 43–56',
    goal: 'Ghép thông tin nằm ở nhiều chỗ: Part 7 văn bản đôi và ba, Speaking câu 8–10 theo bảng, email đề xuất hoặc xử lý vấn đề.',
    output: 'Bốn bài đọc nhiều văn bản · bốn bộ trả lời theo lịch trình · hai email.',
  },
  {
    phase: 5, name: 'Tổ chức lập luận', range: 'Tuần 9–10 · ngày 57–70',
    goal: 'Duy trì một quan điểm có lý do và ví dụ: Speaking câu 11, Writing bài luận, tích hợp lại từ vựng và ngữ pháp đã học.',
    output: 'Bốn bài nói một phút · hai bài luận 30 phút có sửa.',
  },
  {
    phase: 6, name: 'Bấm giờ & tổng duyệt', range: 'Tuần 11–12 · ngày 71–84',
    goal: 'Luyện thời gian, làm đề đầy đủ có chọn lọc, ôn đúng những lỗi còn lặp lại và điều chỉnh chiến lược. Không đổi chiến lược vào ngày thi.',
    output: 'Một đến hai bài mô phỏng đủ bốn kỹ năng · báo cáo tiến bộ · kế hoạch giai đoạn tiếp theo.',
  },
]

export const TOEIC_WEEKS: ToeicWeek[] = [
  { w: 1, phase: 1, theme: 'Văn phòng & lịch hẹn' },
  { w: 2, phase: 1, theme: 'Lịch trình & thông báo' },
  { w: 3, phase: 2, theme: 'Hỏi & phản hồi tại nơi làm việc' },
  { w: 4, phase: 2, theme: 'Mô tả việc đang diễn ra' },
  { w: 5, phase: 3, theme: 'Yêu cầu thông tin' },
  { w: 6, phase: 3, theme: 'Thay đổi & thông báo dịch vụ' },
  { w: 7, phase: 4, theme: 'Lịch trình & sự kiện' },
  { w: 8, phase: 4, theme: 'Sự cố & xử lý vấn đề' },
  { w: 9, phase: 5, theme: 'Quan điểm về cách làm việc' },
  { w: 10, phase: 5, theme: 'Quan điểm về đào tạo & tuyển dụng' },
  { w: 11, phase: 6, theme: 'Mô phỏng từng kỹ năng' },
  { w: 12, phase: 6, theme: 'Tổng duyệt & chốt phong độ' },
]

export const WEEK_RULE = 'Ngày thứ 7 của mỗi tuần KHÔNG học nội dung mới — chỉ truy hồi và sửa lỗi: làm lại câu từng sai mà không xem đáp án, nói lại câu Speaking cũ, viết lại email từ dàn ý.'

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
const sp = (d: number, swIds: string[], label: string, times = 1): ToeicTask =>
  ({ id: `d${d}-sp`, kind: 'speak', swIds, times, label })
const wr = (d: number, swIds: string[], label: string, times = 1): ToeicTask =>
  ({ id: `d${d}-wr`, kind: 'write', swIds, times, label })
const gd = (d: number, chapter: string, label: string): ToeicTask =>
  ({ id: `d${d}-gd`, kind: 'guide', chapter, label })
const el = (d: number, n: number): ToeicTask =>
  ({ id: `d${d}-el`, kind: 'errorlog', n, label: `Nhật ký lỗi: gắn mã nguyên nhân cho ${n} câu sai trong sổ` })

const S1 = ['s1-1', 's1-2', 's1-3', 's1-4', 's1-5', 's1-6', 's1-7', 's1-8', 's1-9', 's1-10', 's1-11']
const S2 = ['s2-1', 's2-2', 's2-3', 's2-4', 's2-5', 's2-6', 's2-7', 's2-8', 's2-9', 's2-10', 's2-11']
const W1 = ['w1-1', 'w1-2', 'w1-3', 'w1-4', 'w1-5', 'w1-6', 'w1-7', 'w1-8']
const W2 = ['w2-1', 'w2-2', 'w2-3', 'w2-4', 'w2-5', 'w2-6', 'w2-7', 'w2-8']

export const TOEIC_DAYS: ToeicDay[] = [
  { d: 1, week: 1, phase: 1, title: 'Đo điểm xuất phát', tasks: [mt(1, 'Thi thử ĐẦU VÀO — cứ làm hết sức, điểm thấp là bình thường!'), gd(1, 'exam', 'Cẩm nang: đọc chương "Cấu trúc 4 kỹ năng" để biết mình sắp thi cái gì'), v(1, 'office', 50, 'Văn phòng')] },
  { d: 2, week: 1, phase: 1, title: 'Bản ghi âm đầu tiên', tasks: [sp(2, ['s1-1'], 'Speaking câu 1: đọc thành tiếng — GIỮ LẠI bản ghi này làm mốc so sánh'), g(2, 'g01'), v(2, 'office', 100, 'Văn phòng')] },
  { d: 3, week: 1, phase: 1, title: 'Học cho đúng cách', tasks: [gd(3, 'method', 'Cẩm nang: đọc chương "Cách luyện có hiệu quả" — bốn nhánh, truy hồi, giãn cách'), g(3, 'g02'), p(3, 1, 3)] },
  { d: 4, week: 1, phase: 1, title: 'Bài viết đầu tiên', tasks: [wr(4, ['w1-6'], 'Writing câu 6: email hỏi thông tin — GIỮ NGUYÊN bản đầu, chưa sửa gì'), v(4, 'worklife', 50, 'Công việc & học hành'), p(4, 2, 5)] },
  { d: 5, week: 1, phase: 1, title: 'Vũ khí Part 5: từ loại', tasks: [g(5, 'g05'), p(5, 5, 8), v(5, 'worklife', 100, 'Công việc & học hành')] },
  { d: 6, week: 1, phase: 1, title: 'Âm cuối và nhóm ý', tasks: [sp(6, ['s1-2'], 'Speaking câu 2: đọc thành tiếng, chú ý âm cuối và chỗ ngắt'), p(6, 1, 3), rv(6)] },
  { d: 7, week: 1, phase: 1, title: 'Truy hồi & sửa lỗi', tasks: [wb(7, 10), el(7, 5), cu(7, 'Hôm nay KHÔNG học mới: nói lại câu Speaking ngày 2 mà không nhìn bài, rồi so với bản ghi cũ')] },

  { d: 8, week: 2, phase: 1, title: 'Hệ mã lỗi', tasks: [gd(8, 'errors', 'Cẩm nang: đọc chương "Nhật ký lỗi" — 8 mã nguyên nhân và thứ tự ưu tiên'), g(8, 'g03'), v(8, 'timenum', 50, 'Số đếm & thời gian')] },
  { d: 9, week: 2, phase: 1, title: 'Hiện tại tiếp diễn — ngôn ngữ của ảnh', tasks: [g(9, 'g04'), p(9, 1, 3), v(9, 'timenum', 100, 'Số đếm & thời gian')] },
  { d: 10, week: 2, phase: 1, title: 'Part 2 phản xạ', tasks: [p(10, 2, 10), sp(10, ['s2-1'], 'Speaking bộ 2 câu 1: đọc thành tiếng'), rv(10)] },
  { d: 11, week: 2, phase: 1, title: 'Từ đi theo cụm', tasks: [v(11, 'collocations', 50, 'Cụm từ đi với nhau'), p(11, 5, 8), vd(11)] },
  { d: 12, week: 2, phase: 1, title: 'Viết câu theo ảnh', tasks: [wr(12, ['w1-1', 'w1-2'], 'Writing câu 1–2: viết đúng MỘT câu cho mỗi ảnh, dùng đủ 2 từ bắt buộc'), p(12, 1, 3), rv(12)] },
  { d: 13, week: 2, phase: 1, title: 'Nghe và đọc xen kẽ', tasks: [p(13, 2, 10), p(13, 5, 8), v(13, 'collocations', 100, 'Cụm từ đi với nhau')] },
  { d: 14, week: 2, phase: 1, title: 'Chốt chặng 1', tasks: [sp(14, ['s2-2'], 'Speaking bộ 2 câu 2 — nghe lại và so với bản ghi ngày 2'), wb(14, 10), el(14, 5)] },

  { d: 15, week: 3, phase: 2, title: 'Khung ngữ pháp nền', tasks: [gd(15, 'grammar', 'Cẩm nang: đọc "Khung ngữ pháp" 18 chủ điểm — mỗi chủ điểm gắn một chức năng giao tiếp'), g(15, 'g06'), v(15, 'communication', 50, 'Giao tiếp')] },
  { d: 16, week: 3, phase: 2, title: 'Bước vào Part 3', tasks: [p(16, 3, 6), v(16, 'communication', 100, 'Giao tiếp'), rv(16)] },
  { d: 17, week: 3, phase: 2, title: 'Nói chuyện tương lai', tasks: [g(17, 'g07'), p(17, 2, 10), vd(17)] },
  { d: 18, week: 3, phase: 2, title: 'Mô tả tranh — lần đầu', tasks: [sp(18, ['s1-3'], 'Speaking câu 3: mô tả tranh trong 30 giây'), p(18, 1, 3), v(18, 'places', 50, 'Nơi chốn & đời sống')] },
  { d: 19, week: 3, phase: 2, title: 'Hiện tại hoàn thành', tasks: [g(19, 'g08'), p(19, 5, 10), v(19, 'places', 100, 'Nơi chốn & đời sống')] },
  { d: 20, week: 3, phase: 2, title: 'Điền đoạn văn Part 6', tasks: [p(20, 6, 4), wr(20, ['w1-3', 'w1-4'], 'Writing câu 3–4: viết câu theo ảnh'), rv(20)] },
  { d: 21, week: 3, phase: 2, title: 'Truy hồi & sửa lỗi', tasks: [wb(21, 10), el(21, 8), cu(21, 'Nghe lại 1 hội thoại Part 3 đã làm và tự tóm tắt: ai – mục đích – vấn đề – hành động tiếp theo')] },

  { d: 22, week: 4, phase: 2, title: 'Câu hỏi WH', tasks: [g(22, 'g13'), p(22, 2, 10), v(22, 'verbs2', 50, 'Động từ giao tiếp')] },
  { d: 23, week: 4, phase: 2, title: 'Mô tả tranh lần 2', tasks: [sp(23, ['s1-4'], 'Speaking câu 4: mô tả tranh — nhớ câu định vị bối cảnh ở đầu'), p(23, 3, 6), v(23, 'verbs2', 100, 'Động từ giao tiếp')] },
  { d: 24, week: 4, phase: 2, title: 'Part 6 chuyên sâu', tasks: [p(24, 6, 8), wr(24, ['w1-5'], 'Writing câu 5: viết câu theo ảnh'), rv(24)] },
  { d: 25, week: 4, phase: 2, title: 'Nghe theo cụm ngắn', tasks: [p(25, 3, 6), v(25, 'jobs', 50, 'Nghề nghiệp'), vd(25)] },
  { d: 26, week: 4, phase: 2, title: 'Tả ảnh bộ đề 2', tasks: [sp(26, ['s2-3', 's2-4'], 'Speaking bộ 2 câu 3–4: mô tả tranh'), p(26, 1, 3), rv(26)] },
  { d: 27, week: 4, phase: 2, title: 'Viết câu theo ảnh — bộ 2', tasks: [wr(27, ['w2-1', 'w2-2', 'w2-3'], 'Writing bộ 2 câu 1–3: viết câu theo ảnh'), p(27, 5, 10), v(27, 'jobs', 100, 'Nghề nghiệp')] },
  { d: 28, week: 4, phase: 2, title: 'Chốt chặng 2', tasks: [wr(28, ['w2-4', 'w2-5'], 'Writing bộ 2 câu 4–5: viết câu theo ảnh'), mt(28, 'Thi thử giữa chặng — so điểm với ngày 1'), wb(28, 10)] },

  { d: 29, week: 5, phase: 3, title: 'Cụm từ theo tình huống', tasks: [gd(29, 'phrases', 'Cẩm nang: học "Cụm từ theo tình huống" — mỗi cụm nghe, đọc, nói và viết một lần'), g(29, 'g10'), v(29, 'preps', 50, 'Giới từ & từ nối')] },
  { d: 30, week: 5, phase: 3, title: 'Liên từ & quan hệ logic', tasks: [g(30, 'g11'), p(30, 5, 10), v(30, 'preps', 100, 'Giới từ & từ nối')] },
  { d: 31, week: 5, phase: 3, title: 'Bài nói ngắn Part 4', tasks: [p(31, 4, 6), sp(31, ['s1-5', 's1-6'], 'Speaking câu 5–6: trả lời thẳng trong 15 giây'), rv(31)] },
  { d: 32, week: 5, phase: 3, title: 'Bơi vào Part 7', tasks: [p(32, 7, 6), cu(32, 'Đọc "Chu kỳ luyện đọc" trong Cẩm nang trước khi làm — mỗi câu phải chỉ ra được BẰNG CHỨNG'), vd(32)] },
  { d: 33, week: 5, phase: 3, title: 'Câu 7 — phát triển ý', tasks: [sp(33, ['s1-7'], 'Speaking câu 7: 30 giây, cần lý do CÓ GIẢI THÍCH và một ví dụ thật'), p(33, 4, 6), v(33, 'travel2', 50, 'Du lịch & đi lại')] },
  { d: 34, week: 5, phase: 3, title: 'Email nêu vấn đề & đề xuất', tasks: [wr(34, ['w2-6'], 'Writing bộ 2 câu 6: nêu 1 vấn đề + 2 đề xuất — đếm lại cho đủ'), p(34, 7, 6), v(34, 'travel2', 100, 'Du lịch & đi lại')] },
  { d: 35, week: 5, phase: 3, title: 'Truy hồi & sửa lỗi', tasks: [wb(35, 15), el(35, 10), cu(35, 'Viết lại email ngày 4 từ dàn ý, KHÔNG nhìn bản cũ — viết xong mới mở ra so')] },

  { d: 36, week: 6, phase: 3, title: 'Mệnh đề quan hệ', tasks: [g(36, 'g15'), p(36, 7, 7), rv(36)] },
  { d: 37, week: 6, phase: 3, title: 'Modal & lời đề nghị', tasks: [g(37, 'g09'), p(37, 2, 10), v(37, 'shopping', 50, 'Mua sắm')] },
  { d: 38, week: 6, phase: 3, title: 'So sánh', tasks: [g(38, 'g12'), p(38, 5, 12), v(38, 'shopping', 100, 'Mua sắm')] },
  { d: 39, week: 6, phase: 3, title: 'Speaking bộ 2 câu 5–7', tasks: [sp(39, ['s2-5', 's2-6', 's2-7'], 'Speaking bộ 2 câu 5–7: trả lời đủ mọi vế được hỏi'), p(39, 4, 6), rv(39)] },
  { d: 40, week: 6, phase: 3, title: 'Đọc có bấm giờ', tasks: [p(40, 7, 7), cu(40, 'Bấm giờ Part 7 văn bản đơn — mốc tham khảo ~1 phút/câu, ghi lại thời gian thật của bạn'), vd(40)] },
  { d: 41, week: 6, phase: 3, title: 'Diễn đạt tương đương', tasks: [p(41, 3, 6), p(41, 4, 6), v(41, 'phrases2', 50, 'Cụm phản xạ nhanh')] },
  { d: 42, week: 6, phase: 3, title: 'Chốt chặng 3', tasks: [mt(42, 'Thi thử chặng 3'), wb(42, 15), el(42, 10)] },

  { d: 43, week: 7, phase: 4, title: 'Câu bị động', tasks: [g(43, 'g14'), p(43, 5, 12), v(43, 'business2', 50, 'Kinh doanh')] },
  { d: 44, week: 7, phase: 4, title: 'Trả lời theo bảng', tasks: [sp(44, ['s1-8', 's1-9'], 'Speaking câu 8–9: đóng gói dữ liệu thành câu hoàn chỉnh, không đọc trống'), p(44, 7, 7), v(44, 'business2', 100, 'Kinh doanh')] },
  { d: 45, week: 7, phase: 4, title: 'Văn bản đôi', tasks: [p(45, 7, 7), cu(45, 'Gắn nhãn ngắn cho từng tài liệu (A = chính sách · B = đơn hàng · C = phản hồi) TRƯỚC khi đọc sâu'), rv(45)] },
  { d: 46, week: 7, phase: 4, title: 'Câu 10 — tổng hợp nhiều dòng', tasks: [sp(46, ['s1-10'], 'Speaking câu 10: nêu tổng quan trước rồi mới liệt kê từng dòng'), p(46, 3, 6), vd(46)] },
  { d: 47, week: 7, phase: 4, title: 'V-ing hay to V', tasks: [g(47, 'g16'), p(47, 5, 12), v(47, 'tech', 50, 'Công nghệ')] },
  { d: 48, week: 7, phase: 4, title: 'Email xử lý vấn đề', tasks: [wr(48, ['w1-7'], 'Writing câu 7: xin lỗi + 2 hành động cụ thể + bước tiếp theo cho khách'), p(48, 7, 7), v(48, 'tech', 100, 'Công nghệ')] },
  { d: 49, week: 7, phase: 4, title: 'Truy hồi & sửa lỗi', tasks: [wb(49, 15), el(49, 12), cu(49, 'Nhìn bảng của câu 8–10 trong 45 giây, che đi rồi nói lại cấu trúc bảng bằng trí nhớ')] },

  { d: 50, week: 8, phase: 4, title: 'Hoà hợp chủ - vị', tasks: [g(50, 'g17'), p(50, 5, 12), rv(50)] },
  { d: 51, week: 8, phase: 4, title: 'Speaking bộ 2 câu 8–10', tasks: [sp(51, ['s2-8', 's2-9', 's2-10'], 'Speaking bộ 2 câu 8–10: có cả dạng lịch sự sửa lại giả định sai của người gọi'), p(51, 4, 6), vd(51)] },
  { d: 52, week: 8, phase: 4, title: 'Câu hỏi Look at the graphic', tasks: [p(52, 3, 6), p(52, 4, 6), v(52, 'phrases2', 100, 'Cụm phản xạ nhanh')] },
  { d: 53, week: 8, phase: 4, title: 'Email đề xuất giải pháp', tasks: [wr(53, ['w2-7'], 'Writing bộ 2 câu 7: xin lỗi + giải thích + 2 giải pháp + 1 câu hỏi cho khách'), p(53, 7, 7), rv(53)] },
  { d: 54, week: 8, phase: 4, title: 'Nhóm ba văn bản', tasks: [p(54, 7, 7), p(54, 6, 8), vd(54)] },
  { d: 55, week: 8, phase: 4, title: 'Viết lại email đầu tiên', tasks: [wr(55, ['w1-6'], 'Writing câu 6 làm lại — so với bản ngày 4 xem đã đủ yêu cầu chưa', 2), wb(55, 15), rv(55)] },
  { d: 56, week: 8, phase: 4, title: 'Chốt chặng 4', tasks: [mt(56, 'Thi thử chặng 4'), el(56, 12), cu(56, 'Đếm 3 nhóm mã lỗi nhiều nhất và chọn ĐÚNG MỘT nhóm làm mục tiêu cho 2 tuần tới')] },

  { d: 57, week: 9, phase: 5, title: 'Biết mình đang ở đâu', tasks: [gd(57, 'plan', 'Cẩm nang: đọc "Chương trình 12 tuần" và đối chiếu với sản phẩm bạn đã có'), g(57, 'g18'), v(57, 'connectors', 50, 'Từ nối')] },
  { d: 58, week: 9, phase: 5, title: 'Câu 11 — lần đầu', tasks: [sp(58, ['s1-11'], 'Speaking câu 11: nêu lập trường ngay câu đầu, 2 lý do, 1 ví dụ, 1 nhượng bộ'), p(58, 5, 12), rv(58)] },
  { d: 59, week: 9, phase: 5, title: 'Dàn ý trước khi viết', tasks: [cu(59, 'Lập dàn ý 4 đoạn cho đề Writing câu 8 TRƯỚC khi viết: lập trường – lý do 1 – lý do 2 – nhượng bộ'), p(59, 7, 7), v(59, 'connectors', 100, 'Từ nối')] },
  { d: 60, week: 9, phase: 5, title: 'Bài luận 30 phút', tasks: [wr(60, ['w1-8'], 'Writing câu 8: bài luận 30 phút — mỗi lý do phải giải thích CƠ CHẾ, không lặp lại đánh giá'), rv(60), v(60, 'education', 50, 'Học hành & đào tạo')] },
  { d: 61, week: 9, phase: 5, title: 'Sửa bài luận', tasks: [cu(61, 'Sửa bài luận theo 3 lượt: nhiệm vụ → tổ chức → ngôn ngữ. Đọc lại ĐỀ trước rồi mới đọc bài'), p(61, 3, 6), p(61, 4, 6)] },
  { d: 62, week: 9, phase: 5, title: 'Câu 11 bộ đề 2', tasks: [sp(62, ['s2-11'], 'Speaking bộ 2 câu 11: lập trường có điều kiện thường an toàn hơn khẳng định tuyệt đối'), p(62, 7, 7), vd(62)] },
  { d: 63, week: 9, phase: 5, title: 'Truy hồi & sửa lỗi', tasks: [wb(63, 15), el(63, 15), cu(63, 'Nghe lại 2 bản ghi câu 11: đếm số lần im lặng trên 2 giây và số ý thật sự có ví dụ')] },

  { d: 64, week: 10, phase: 5, title: 'Bài luận thứ hai', tasks: [wr(64, ['w2-8'], 'Writing bộ 2 câu 8: bài luận 30 phút'), p(64, 5, 12), v(64, 'education', 100, 'Học hành & đào tạo')] },
  { d: 65, week: 10, phase: 5, title: 'Nói lại câu 11', tasks: [sp(65, ['s1-11'], 'Speaking câu 11 làm lại — so với bản ngày 58', 2), p(65, 2, 10), vd(65)] },
  { d: 66, week: 10, phase: 5, title: 'Vá ngữ pháp còn hổng', tasks: [cu(66, 'Làm lại 2 viên nang ngữ pháp có điểm luyện thấp nhất'), wk(66, 10), rv(66)] },
  { d: 67, week: 10, phase: 5, title: 'Đọc dài hơi', tasks: [p(67, 7, 7), p(67, 6, 8), rv(67)] },
  { d: 68, week: 10, phase: 5, title: 'Vá điểm yếu', tasks: [wk(68, 15), p(68, 5, 12), vd(68)] },
  { d: 69, week: 10, phase: 5, title: 'Nói lại câu 11 bộ 2', tasks: [sp(69, ['s2-11'], 'Speaking bộ 2 câu 11 làm lại — mục tiêu: nói gần hết 60 giây', 2), p(69, 4, 6), rv(69)] },
  { d: 70, week: 10, phase: 5, title: 'Chốt chặng 5', tasks: [mt(70, 'Thi thử chặng 5'), wb(70, 15), el(70, 15)] },

  { d: 71, week: 11, phase: 6, title: 'Điều kiện mô phỏng', tasks: [gd(71, 'day', 'Cẩm nang: đọc "Thi thử & ngày thi" — điều kiện mô phỏng và chiến lược từng phần'), p(71, 5, 15), rv(71)] },
  { d: 72, week: 11, phase: 6, title: 'Nghe theo nhịp thi thật', tasks: [p(72, 2, 10), p(72, 3, 9), vd(72)] },
  { d: 73, week: 11, phase: 6, title: 'Đọc theo nhịp thi thật', tasks: [p(73, 7, 7), p(73, 6, 8), rv(73)] },
  { d: 74, week: 11, phase: 6, title: 'Speaking mô phỏng bộ 1', tasks: [sp(74, S1, 'Speaking: chạy trọn 11 câu bộ đề 1 trong một lượt, không dừng giữa chừng', 2), rv(74), cu(74, 'Dùng tai nghe và micrô, ngồi yên tĩnh — làm đúng như phòng thi')] },
  { d: 75, week: 11, phase: 6, title: 'Writing mô phỏng bộ 1', tasks: [wr(75, W1, 'Writing: chạy trọn 8 câu bộ đề 1 — 8′ cho câu 1–5, 10′ mỗi email, 30′ bài luận', 2), p(75, 5, 15), vd(75)] },
  { d: 76, week: 11, phase: 6, title: 'Vá điểm yếu lần cuối', tasks: [wk(76, 15), wb(76, 20), rv(76)] },
  { d: 77, week: 11, phase: 6, title: 'Truy hồi & sửa lỗi', tasks: [el(77, 20), cu(77, 'Đọc lại nhật ký lỗi 11 tuần: nhóm mã nào vẫn còn lặp? Đó là việc của tuần cuối'), rv(77)] },

  { d: 78, week: 12, phase: 6, title: 'FULL TEST Nghe – Đọc', tasks: [mt(78, 'FULL TEST 200 câu · Nghe 45′ + Đọc 75′, làm liền mạch'), cu(78, 'Không dừng âm thanh, không tra từ, không ghi chú — và ghi mức độ chắc chắn cho từng câu'), rv(78)] },
  { d: 79, week: 12, phase: 6, title: 'Chữa đề', tasks: [cu(79, 'Chữa FULL TEST: mỗi câu sai phải chỉ ra BẰNG CHỨNG trong bài rồi mới gắn mã lỗi'), wb(79, 20), el(79, 20)] },
  { d: 80, week: 12, phase: 6, title: 'Speaking mô phỏng bộ 2', tasks: [sp(80, S2, 'Speaking: chạy trọn 11 câu bộ đề 2', 2), rv(80), vd(80)] },
  { d: 81, week: 12, phase: 6, title: 'Writing mô phỏng bộ 2', tasks: [wr(81, W2, 'Writing: chạy trọn 8 câu bộ đề 2', 2), p(81, 5, 15), rv(81)] },
  { d: 82, week: 12, phase: 6, title: 'Giữ phong độ', tasks: [wk(82, 10), p(82, 3, 9), rv(82)] },
  { d: 83, week: 12, phase: 6, title: 'Ngày nhẹ trước khi thi', tasks: [cu(83, 'Hôm nay chỉ xem lại lỗi tần suất cao và các mẫu câu đã dùng ổn định — KHÔNG học từ mới'), rv(83), wb(83, 10)] },
  { d: 84, week: 12, phase: 6, title: 'Tổng kết hành trình', tasks: [cu(84, 'So điểm ngày 1 với ngày 78 · nghe lại bản ghi ngày 2 cạnh bản mô phỏng ngày 80'), gd(84, 'day', 'Đọc lại mục "Trước ngày thi" và kiểm tra giấy tờ, lịch thi trên trang IIG Việt Nam'), cu(84, 'Đăng ký lịch thi thật trong 2 tuần tới, khi phong độ đang cao')] },
]

export const TOEIC_TASK_TOTAL = TOEIC_DAYS.reduce((s, d) => s + d.tasks.length, 0)

for (const day of TOEIC_DAYS) {
  const seen = new Set<string>()
  for (const t of day.tasks) {
    let id = t.id
    while (seen.has(id)) id = id + 'x'
    t.id = id
    seen.add(id)
  }
}
