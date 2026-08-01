import type { PathStep } from '@/models/path.model'

export interface LangOption {
  code: string
  name: string
  flag: string
}

export const LANGUAGES: LangOption[] = [
  { code: 'ko', name: 'Tiếng Hàn', flag: 'kr' },
  { code: 'en', name: 'Tiếng Anh', flag: 'us' },
  { code: 'ja', name: 'Tiếng Nhật', flag: 'jp' },
  { code: 'zh', name: 'Tiếng Trung', flag: 'cn' },
  { code: 'de', name: 'Tiếng Đức', flag: 'de' },
  { code: 'vi', name: 'Tiếng Việt', flag: 'vn' },
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

export const LEARN_GOAL_PRESETS: Record<string, string[]> = {
  talk: ['Phát âm cơ bản', 'Từ vựng sơ cấp', 'Giao tiếp cơ bản'],
  work: ['Từ vựng sơ cấp', 'Ngữ pháp cơ bản', 'Giao tiếp trung cấp'],
  travel: ['Phát âm cơ bản', 'Từ vựng sơ cấp', 'Giao tiếp cơ bản'],
  exam: ['Ngữ pháp cơ bản', 'Từ vựng sơ cấp', 'Luyện thi chứng chỉ'],
}

const LEARN_GOAL_FOCUS: Record<string, PathStep> = {
  talk: {
    title: 'Tập trung: hội thoại đời sống',
    detail: 'Mỗi ngày shadowing 1 video hội thoại trong kho + luyện nói với AI theo tình huống thật (quán ăn, hỏi đường, kết bạn). Đúng mục tiêu Giao tiếp — bỏ qua ngữ pháp hàn lâm chưa cần.',
  },
  work: {
    title: 'Tập trung: ngôn ngữ công việc',
    detail: 'Ưu tiên từ vựng công sở, mẫu câu email/họp/báo cáo và hội thoại phỏng vấn. Học qua video chủ đề công việc trong kho — đúng thứ bạn dùng ở văn phòng.',
  },
  travel: {
    title: 'Tập trung: cụm câu du lịch sinh tồn',
    detail: 'Nắm chắc bộ câu đặt phòng, gọi món, hỏi đường, mặc cả, xử lý sự cố. Luyện phản xạ với video đường phố thật — đủ tự tin cho chuyến đi.',
  },
  exam: {
    title: 'Tập trung: nền tảng luyện thi',
    detail: 'Học từ vựng & ngữ pháp theo cấp độ đề thi, luyện nghe bằng video có phụ đề và ôn SRS đều đặn — nền chắc trước khi vào giai đoạn giải đề.',
  },
}

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function cefrCode(level: string): string {
  const m = level.toUpperCase().match(/[ABC][12]/)
  return m ? m[0] : 'A1'
}

function nextCefr(code: string): string {
  const i = CEFR_ORDER.indexOf(code)
  return i >= 0 && i < CEFR_ORDER.length - 1 ? CEFR_ORDER[i + 1] : code
}

export function buildSteps(goals: string[], interests: string[], level: string, learnGoal = ''): PathStep[] {
  const cur = cefrCode(level)
  const target = nextCefr(cur)
  const picked = goals.slice(0, 5)
  const steps: PathStep[] = []

  steps.push({
    title: 'Khởi động & kiểm tra đầu vào',
    detail: `Làm bài đánh giá nhanh để xác nhận trình độ ${cur}, chốt điểm xuất phát và đặt mục tiêu học mỗi ngày.`,
    duration: '≈2 ngày',
    cefr: cur,
  })

  const focus = LEARN_GOAL_FOCUS[learnGoal]
  if (focus) steps.push({ ...focus, duration: 'Xuyên suốt' })

  picked.forEach((g, i) => {
    steps.push({
      title: `Giai đoạn ${i + 1}: ${g}`,
      detail: `Học theo các bài & video được chọn lọc cho mục tiêu “${g}”, kèm bài tập vận dụng và mẫu câu thực tế.`,
      duration: '≈1–2 tuần',
      cefr: i === picked.length - 1 ? `${cur} → ${target}` : cur,
    })
  })

  if (interests.length) {
    steps.push({
      title: 'Học qua chủ đề bạn thích',
      detail: `Luyện nghe – nói với nội dung thật về ${interests.slice(0, 3).join(', ')} để duy trì hứng thú và phản xạ.`,
      duration: '≈1 tuần',
    })
  }

  steps.push({
    title: 'Ôn tập định kỳ (SRS)',
    detail: 'Hệ thống tự nhắc ôn từ vựng & mẫu câu đúng thời điểm quên để ghi nhớ lâu dài.',
    duration: 'Hằng ngày',
  })

  if (learnGoal === 'exam') {
    steps.push({
      title: 'Luyện đề & chiến thuật phòng thi',
      detail: 'Giải đề theo cấu trúc thật, bấm giờ từng phần và rút kinh nghiệm để đạt mục tiêu chứng chỉ.',
      duration: '≈2–3 tuần',
      cefr: target,
    })
  }

  steps.push({
    title: 'Tổng kết & nâng cấp lộ trình',
    detail: `Đánh giá tiến độ, củng cố điểm yếu và mở khoá giai đoạn kế tiếp hướng tới trình độ ${target}.`,
    duration: '≈3 ngày',
    cefr: `${cur} → ${target}`,
  })

  return steps
}
