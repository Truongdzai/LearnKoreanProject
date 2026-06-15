import type { Video } from '@/models/video.model'

export const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

export const VIDEOS: Video[] = [
  { id: 'GnwIG51ah7k', title: 'Podcast cho người mới #01 — 취미 (Sở thích)', channel: '최수수 ChoiSusu', level: 'TOPIK 1', dur: '3:58', topic: '취미', tone: 'tone-a' },
  { id: 'U_ZzQIV5KgM', title: 'Podcast cho người mới #02 — 날씨와 계절 (Thời tiết & mùa)', channel: '최수수 ChoiSusu', level: 'TOPIK 1', dur: '7:13', topic: '날씨', tone: 'tone-b' },
  { id: 'b11o5ykzKZQ', title: 'Podcast cho người mới #07 — 여행 (Du lịch)', channel: '최수수 ChoiSusu', level: 'TOPIK 1', dur: '15:41', topic: '여행', tone: 'tone-c' },
  { id: 'aZi2d3k0BEE', title: 'Podcast cho người mới #11 — 주말 (Cuối tuần)', channel: '최수수 ChoiSusu', level: 'TOPIK 1', dur: '12:48', topic: '주말', tone: 'tone-d' },
  { id: 'sO14dpV2hv4', title: 'Podcast cho người mới #16 — 일본 여행 후 (Sau chuyến đi Nhật)', channel: '최수수 ChoiSusu', level: 'TOPIK 1', dur: '12:23', topic: '여행 후', tone: 'tone-e' },
  { id: '8rvv4RXQYb4', title: 'Nghe chậm — 자기소개 (Giới thiệu bản thân)', channel: 'Korean with Mina', level: 'TOPIK 1', dur: '7:31', topic: '자기소개', tone: 'tone-f' },
  { id: 'kHsEZUcyD7c', title: 'Nghe chậm lặp lại — luyện phản xạ', channel: 'Korean with Mina', level: 'TOPIK 1', dur: '5:22', topic: '반복 듣기', tone: 'tone-a' },
  { id: 'o6AP3nVNj_8', title: 'Truyện ngắn A0 — 윤지는 학교에 가요', channel: '몰입한국어 Immersion', level: 'Vỡ lòng', dur: '10:01', topic: '짧은 이야기', tone: 'tone-b' },
  { id: 'tpnmeXH9VZ4', title: 'Truyện ngắn A1 — 우리 가족 (Gia đình tôi)', channel: '몰입한국어 Immersion', level: 'Vỡ lòng', dur: '5:50', topic: '우리 가족', tone: 'tone-c' },
  { id: 'xHCZVokgaKU', title: '100 câu hội thoại sơ cấp (TOPIK 1)', channel: 'Everyday Korean 매일 한국어', level: 'TOPIK 1', dur: '19:32', topic: '100문장', tone: 'tone-d' },
  { id: 'uRvvbTD5cIw', title: 'Hội thoại sơ cấp 1.1 — nghe & hiểu', channel: 'KTS KOREA', level: 'TOPIK 1', dur: '14:03', topic: '초급 대화', tone: 'tone-e' },
  { id: 'abuhSDWTuHE', title: 'Hội thoại đời sống — hỏi đường, mua sắm, tàu điện', channel: 'Everyday Korean 매일 한국어', level: 'TOPIK 1-2', dur: '23:49', topic: '일상 회화', tone: 'tone-f' },
]

export const LEVELS = ['Tất cả', 'Vỡ lòng', 'TOPIK 1', 'TOPIK 1-2'] as const
