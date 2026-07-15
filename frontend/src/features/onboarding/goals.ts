/** Mục tiêu học — nền tảng "dùng gì học nấy" (trụ cột 1 của sản phẩm). */

export interface LearnGoal {
  id: string
  emoji: string
  label: string
  desc: string
}

export const LEARN_GOALS: LearnGoal[] = [
  { id: 'talk', emoji: '💬', label: 'Giao tiếp', desc: 'Trò chuyện tự nhiên trong đời sống hằng ngày' },
  { id: 'work', emoji: '💼', label: 'Công việc', desc: 'Làm việc, họp hành, email với đồng nghiệp & khách hàng' },
  { id: 'travel', emoji: '✈️', label: 'Du lịch', desc: 'Tự tin đặt phòng, hỏi đường, gọi món khi đi chơi' },
  { id: 'exam', emoji: '🎓', label: 'Luyện thi', desc: 'Chinh phục TOPIK, TOEIC, JLPT… điểm cao' },
]

export function goalById(id: string): LearnGoal | undefined {
  return LEARN_GOALS.find((g) => g.id === id)
}
