import type { Lesson } from '@/models/lesson.model'

export const SAMPLE_LESSON: Lesson = {
  id: 'GnwIG51ah7k',
  title: 'Bài học mẫu — Những câu tiếng Hàn cơ bản',
  channel: 'Trường Học Ngoại Ngữ',
  source: 'bài học mẫu',
  segments: [
    { start: 0, ko: '안녕하세요, 만나서 반갑습니다.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { start: 4, ko: '저는 한국어를 공부해요.', vi: 'Tôi học tiếng Hàn.' },
    { start: 8, ko: '오늘 날씨가 정말 좋아요.', vi: 'Hôm nay thời tiết thật đẹp.' },
    { start: 12, ko: '학교에서 친구를 만났어요.', vi: 'Tôi đã gặp bạn ở trường.' },
    { start: 16, ko: '주말에 영화를 봤어요.', vi: 'Cuối tuần tôi đã xem phim.' },
    { start: 20, ko: '한국 음식을 정말 좋아해요.', vi: 'Tôi rất thích đồ ăn Hàn Quốc.' },
    { start: 24, ko: '감사합니다. 다음에 또 만나요.', vi: 'Cảm ơn. Hẹn gặp lại lần sau.' },
  ],
}
