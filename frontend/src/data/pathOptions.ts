import type { PathStep } from '@/models/path.model'

export interface LangOption {
  code: string
  name: string
  /** ISO country code used to render a real flag (see Flag component). */
  flag: string
}

export const LANGUAGES: LangOption[] = [
  { code: 'ko', name: 'Tiếng Hàn', flag: 'kr' },
  { code: 'en', name: 'Tiếng Anh', flag: 'us' },
  { code: 'ja', name: 'Tiếng Nhật', flag: 'jp' },
  { code: 'zh', name: 'Tiếng Trung', flag: 'cn' },
  { code: 'de', name: 'Tiếng Đức', flag: 'de' },
]

export const GOALS: { title: string; detail: string }[] = [
  { title: 'Bảng chữ cái & cách đọc', detail: 'Làm quen và ghi nhớ hệ thống chữ viết, cách đọc và quy tắc ghép âm của ngôn ngữ.' },
  { title: 'Phát âm cơ bản', detail: 'Luyện phát âm chuẩn, quy tắc nối âm và ngữ điệu tự nhiên.' },
  { title: 'Từ vựng sơ cấp', detail: 'Xây dựng vốn từ vựng cơ bản theo các chủ đề quen thuộc: gia đình, trường học, ăn uống.' },
  { title: 'Ngữ pháp cơ bản', detail: 'Nắm được các cấu trúc câu cơ bản: câu khẳng định, phủ định, câu hỏi.' },
  { title: 'Giao tiếp cơ bản', detail: 'Sử dụng các mẫu câu đơn giản để chào hỏi, giới thiệu bản thân và giao tiếp hằng ngày.' },
  { title: 'Giao tiếp trung cấp', detail: 'Mở rộng khả năng giao tiếp trong nhiều tình huống: học tập, công việc, du lịch.' },
  { title: 'Luyện thi chứng chỉ', detail: 'Ôn tập và nâng cao kỹ năng để đạt mục tiêu chứng chỉ ngoại ngữ mong muốn.' },
]

export const INTERESTS: { name: string; emoji: string }[] = [
  { name: 'Podcast', emoji: '🎙️' },
  { name: 'TED Talks', emoji: '🎤' },
  { name: 'Tin tức', emoji: '📰' },
  { name: 'Du lịch', emoji: '✈️' },
  { name: 'Công nghệ', emoji: '💻' },
  { name: 'Nấu ăn', emoji: '🍳' },
  { name: 'Thể thao', emoji: '⚽' },
  { name: 'Hoạt hình', emoji: '🎬' },
  { name: 'Trẻ em', emoji: '🧸' },
  { name: 'Âm nhạc', emoji: '🎵' },
  { name: 'Phim & TV', emoji: '🎭' },
  { name: 'Phim tài liệu', emoji: '📺' },
]

export const LEVELS: { code: string; name: string; tag: string; tone: string }[] = [
  { code: 'A1', name: 'Beginner', tag: 'Mới bắt đầu', tone: 'lv-a' },
  { code: 'A2', name: 'Elementary', tag: 'Hiểu cơ bản', tone: 'lv-b' },
  { code: 'B1', name: 'Intermediate', tag: 'Xây dựng tự tin', tone: 'lv-c' },
  { code: 'B2', name: 'Upper Intermediate', tag: 'Giao tiếp tốt', tone: 'lv-d' },
  { code: 'C1', name: 'Advanced', tag: 'Gần thành thạo', tone: 'lv-e' },
  { code: 'C2', name: 'Proficient', tag: 'Thành thạo', tone: 'lv-f' },
]

/** Build a simple personalised study plan from the wizard choices. */
export function buildSteps(goals: string[], interests: string[], level: string): PathStep[] {
  const steps: PathStep[] = []
  steps.push({ title: 'Khởi động & kiểm tra đầu vào', detail: `Đánh giá nhanh trình độ ${level} để chọn điểm xuất phát phù hợp.` })
  goals.slice(0, 5).forEach((g, i) => {
    steps.push({ title: `Giai đoạn ${i + 1}: ${g}`, detail: `Học theo các bài & video phù hợp mục tiêu “${g}”.` })
  })
  if (interests.length) {
    steps.push({ title: 'Học qua chủ đề bạn thích', detail: `Luyện nghe – nói với nội dung về ${interests.slice(0, 3).join(', ')}.` })
  }
  steps.push({ title: 'Ôn tập định kỳ (SRS)', detail: 'Hệ thống tự nhắc ôn từ vựng & câu đúng thời điểm để nhớ lâu.' })
  steps.push({ title: 'Tổng kết & nâng cấp lộ trình', detail: 'Đánh giá tiến độ và mở khoá giai đoạn tiếp theo.' })
  return steps
}
