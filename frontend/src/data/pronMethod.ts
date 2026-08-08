import type { IconName } from '@/core/components/Icon'

export interface LoopStep {
  id: string
  icon: IconName
  title: string
  desc: string
}

export interface SessionBlock {
  span: string
  act: string
  how: string
  out: string
}

export interface RubricItem {
  id: string
  label: string
  q: string
  fix: string
}

export interface WeekDay {
  day: number
  focus: string
  sample: string
  proof: string
  go?: string
}

export const PRON_LOOP: LoopStep[] = [
  {
    id: 'listen',
    icon: 'volume',
    title: 'Nghe',
    desc: 'Nghe có mục tiêu. Mỗi lượt chỉ soi MỘT đặc điểm: phẩm chất nguyên âm, âm cuối, độ rung, trọng âm hoặc nhịp câu.',
  },
  {
    id: 'adjust',
    icon: 'target',
    title: 'Điều chỉnh',
    desc: 'Chỉnh môi, lưỡi, hàm và luồng hơi. Soi gương phần nhìn thấy được, đặt hai ngón tay lên cổ để cảm nhận dây thanh.',
  },
  {
    id: 'record',
    icon: 'mic',
    title: 'Ghi âm',
    desc: 'Ghi hai bản liên tiếp, bản sau chỉ sửa một chi tiết. Nghe lại để biết đúng thao tác nào đã làm bản ghi rõ hơn.',
  },
]

export const PRON_SESSION: SessionBlock[] = [
  {
    span: '0–3 phút',
    act: 'Nghe',
    how: 'Chọn đoạn 20–30 giây, nghe ba lần và xác định một đặc điểm cần bắt chước.',
    out: 'Một mục tiêu duy nhất.',
  },
  {
    span: '3–7 phút',
    act: 'Điều chỉnh cấu âm',
    how: 'Tách một hoặc hai âm, quan sát gương, kiểm tra luồng hơi hoặc độ rung dây thanh.',
    out: 'Năm lượt nói chậm, ổn định.',
  },
  {
    span: '7–11 phút',
    act: 'Ghi âm',
    how: 'Đọc cùng một cụm ba lần; mỗi lần chỉ sửa một chi tiết.',
    out: 'Hai đến ba bản ngắn để đối chiếu.',
  },
  {
    span: '11–15 phút',
    act: 'Nói đuổi',
    how: 'Nói bám theo câu mẫu, chú ý nhịp trọng âm, sau đó nghe lại ngay.',
    out: 'Một bản hoàn chỉnh.',
  },
]

export const PRON_RUBRIC: RubricItem[] = [
  {
    id: 'vowel',
    label: 'Nguyên âm',
    q: 'Các nguyên âm mục tiêu có khác nhau về phẩm chất hoặc chuyển động cấu âm không?',
    fix: 'Đổi vị trí lưỡi và độ mở hàm trước, chỉ dùng trường độ để tách hai âm cho rõ hơn.',
  },
  {
    id: 'ending',
    label: 'Âm cuối',
    q: 'Phần cuối của từ còn nghe được và không có âm đệm “ờ” không?',
    fix: 'Đóng đúng vị trí rồi dừng hoặc chuyển thẳng sang từ tiếp theo, không thêm nguyên âm phía sau.',
  },
  {
    id: 'voicing',
    label: 'Độ rung',
    q: 'Âm hữu thanh và vô thanh có khác biệt đủ rõ không?',
    fix: 'Giữ nguyên tư thế lưỡi, chỉ bật hoặc tắt dây thanh; đặt tay lên cổ để kiểm tra.',
  },
  {
    id: 'stress',
    label: 'Trọng âm',
    q: 'Âm tiết chính và từ khoá có nổi bật không?',
    fix: 'Kéo dài vừa phải và đổi cao độ thay vì tăng âm lượng — tăng lực dễ nghe thành gằn giọng.',
  },
  {
    id: 'tempo',
    label: 'Tốc độ',
    q: 'Tốc độ có cho phép giữ từ và ý rõ ràng không?',
    fix: 'Chia câu thành cụm ý ngắn, mỗi cụm một từ nổi bật; chỉ tăng tốc khi từ khoá đã rõ.',
  },
]

export function rubricAdvice(score: number): string {
  if (score <= 2) return 'Tách riêng từng âm và rút ngắn câu lại, đừng ghi cả đoạn dài vội.'
  if (score <= 4) return 'Ghi thêm một bản nữa, lần này chỉ sửa đúng tiêu chí còn thiếu.'
  return 'Năm tiêu chí của lượt ghi này đã nghe rõ — chưa có nghĩa mọi đặc điểm đều hoàn hảo, hãy đổi câu khó hơn.'
}

export const MINIMAL_STEPS: string[] = [
  'Nghe hai từ mà chưa nhìn phiên âm, rồi xác định máy vừa đọc từ thứ nhất hay từ thứ hai.',
  'Nói riêng nguyên âm, sau đó mới thêm phụ âm đầu và phụ âm cuối.',
  'Đọc hai từ luân phiên ba lần, giữ âm lượng ổn định.',
  'Đặt mỗi từ vào một câu ngắn rồi ghi âm.',
  'Nghe lại ở tốc độ bình thường; nếu chỉ phân biệt được khi nói rất chậm thì quay lại bước hai.',
]

export const VOICING_STEPS: string[] = [
  'Kéo dài âm vô thanh trong hai giây và cảm nhận luồng hơi thoát ra.',
  'Giữ nguyên tư thế cấu âm, chỉ cho dây thanh rung để tạo âm hữu thanh tương ứng.',
  'Đưa cặp âm vào từ rồi đặt từ vào câu, đặt hai ngón tay lên cổ để đối chiếu.',
]

export const JOURNAL_LINES: string[] = [
  'Âm hoặc đặc điểm đã luyện.',
  'Từ và câu đã dùng.',
  'Lỗi nghe thấy trong bản đầu.',
  'Thao tác làm bản sau rõ hơn.',
]

const WEEK_EN: WeekDay[] = [
  { day: 1, focus: '/ɪ/ và /iː/', sample: 'ship – sheep · live – leave', proof: 'Một bản từ đơn và một bản câu.', go: 'vowel-i' },
  { day: 2, focus: 'Nguyên âm đôi /eɪ/, /aɪ/, /əʊ/', sample: 'say · my · boat', proof: 'Câu “I may buy a boat now.”', go: 'vowel-o' },
  { day: 3, focus: 'Âm cuối /t/, /k/, /p/', sample: 'seat · back · stop', proof: 'Bản ghi không có âm “ờ” sau từ.', go: 'end-stop' },
  { day: 4, focus: 'Cặp vô thanh – hữu thanh', sample: '/f – v/ · /b – p/', proof: 'Hai cặp từ kèm kết quả kiểm tra tính thanh.', go: 'v-f-b-p' },
  { day: 5, focus: 'TH, S và SH', sample: 'think – this – see – she', proof: 'Câu “She thinks this is simple.”', go: 'th' },
  { day: 6, focus: 'Trọng âm từ và nhịp câu', sample: 'record · I wanted the blue shirt.', proof: 'Hai phiên bản đổi từ nhấn.', go: 'rhythm' },
  { day: 7, focus: 'Bản ghi tổng hợp', sample: 'Nói 60 giây về một chủ đề quen thuộc', proof: 'Bản ngày 7 đặt cạnh bản ngày 1.' },
]

const WEEK_KO: WeekDay[] = [
  { day: 1, focus: 'ㅓ và ㅗ', sample: '어 – 오 · 성 – 송', proof: 'Một bản từ đơn và một bản câu.', go: 'ko-eo-o' },
  { day: 2, focus: 'ㅡ và ㅜ', sample: '스 – 수 · 글 – 굴', proof: 'Bản ghi giữ được môi dẹt ở ㅡ.', go: 'ko-eu-u' },
  { day: 3, focus: 'Âm bật hơi ㅋ ㅌ ㅍ ㅊ', sample: '가 – 카 · 달 – 탈', proof: 'Mảnh giấy trước miệng rung ở âm bật hơi.', go: 'ko-aspirate' },
  { day: 4, focus: 'Âm căng ㄲ ㄸ ㅃ ㅆ ㅉ', sample: '자 – 짜 · 사 – 싸', proof: 'Hai cặp từ nghe tách bạch.', go: 'ko-tense' },
  { day: 5, focus: 'Batchim câm và ㄹ cuối', sample: '학교 · 얼굴 · 밥', proof: 'Bản ghi không bung hơi sau batchim.', go: 'ko-batchim-stop' },
  { day: 6, focus: 'Nối âm và ngữ điệu câu', sample: '한국어 · 좋아요?', proof: 'Hai phiên bản câu hỏi và câu kể.', go: 'ko-linking' },
  { day: 7, focus: 'Bản ghi tổng hợp', sample: 'Nói 60 giây về một chủ đề quen thuộc', proof: 'Bản ngày 7 đặt cạnh bản ngày 1.' },
]

const WEEK_ZH: WeekDay[] = [
  { day: 1, focus: 'Bốn thanh cơ bản', sample: 'mā · má · mǎ · mà', proof: 'Một bản bốn thanh liền mạch.', go: 'zh-four-tones' },
  { day: 2, focus: 'Thanh 2 và thanh 3', sample: 'mái – mǎi', proof: 'Hai bản đối chiếu, chỉ đổi thanh.', go: 'zh-tone-2-3' },
  { day: 3, focus: 'Âm cuốn lưỡi zh ch sh', sample: 'zhī – zī · shī – sī', proof: 'Bản ghi giữ lưỡi cuốn suốt cả câu.', go: 'zh-retroflex' },
  { day: 4, focus: 'j q x và ü', sample: 'jū – zū · nǚ – nǔ', proof: 'Hai cặp từ nghe tách bạch.', go: 'zh-jqx' },
  { day: 5, focus: 'Đuôi -n và -ng', sample: 'yīn – yīng · bàn – bàng', proof: 'Bản ghi khép miệng đúng ở -n.', go: 'zh-n-ng' },
  { day: 6, focus: 'Thanh nhẹ và biến điệu', sample: '你好 · 不是 · 一个', proof: 'Hai phiên bản trước và sau khi biến điệu.', go: 'zh-sandhi' },
  { day: 7, focus: 'Bản ghi tổng hợp', sample: 'Nói 60 giây về một chủ đề quen thuộc', proof: 'Bản ngày 7 đặt cạnh bản ngày 1.' },
]

const WEEKS: Record<string, WeekDay[]> = { en: WEEK_EN, ko: WEEK_KO, zh: WEEK_ZH }

export function weekPlan(lang: string): WeekDay[] {
  return WEEKS[lang] ?? WEEK_EN
}
