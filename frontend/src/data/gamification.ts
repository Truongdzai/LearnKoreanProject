import type { Quest, ShopItem, LeaderEntry } from '@/models/gamification.model'

export const QUESTS: Quest[] = [
  { id: 'q1', title: 'Luyện phát âm 20 câu', desc: 'Thực hành phát âm với 20 câu', period: 'daily', reward: 50, progress: 0, target: 20, plus: true },
  { id: 'q2', title: 'Hoàn thành 5 bài học', desc: 'Hoàn thành 5 bài học trong ngày', period: 'daily', reward: 100, progress: 0, target: 5, plus: true },
  { id: 'q3', title: 'Ôn 30 thẻ từ vựng', desc: 'Ôn tập 30 flashcard hôm nay', period: 'daily', reward: 40, progress: 12, target: 30 },
  { id: 'q4', title: 'Dịch 1 video YouTube', desc: 'Dán link và tạo bài học từ video', period: 'daily', reward: 30, progress: 0, target: 1 },
  { id: 'q5', title: 'Giữ chuỗi học 7 ngày', desc: 'Học liên tục 7 ngày trong tuần', period: 'weekly', reward: 250, progress: 4, target: 7 },
  { id: 'q6', title: 'Học 50 từ mới', desc: 'Thêm 50 từ vựng mới trong tuần', period: 'weekly', reward: 200, progress: 18, target: 50 },
  { id: 'q7', title: 'Đăng nhập 10 ngày', desc: 'Nhiệm vụ đặc biệt cho Plus members — đăng nhập 10 ngày trong tháng', period: 'monthly', reward: 500, progress: 5, target: 10, plus: true },
]

export const DAILY_BONUS = 50

export const SHOP_ITEMS: ShopItem[] = [
  // Hạt giống (Garden)
  { id: 's-sun', name: 'Hoa Hướng Dương', desc: 'Trồng và chăm sóc hoa hướng dương trong vườn', price: 99, category: 'seed', art: 'sunflower' },
  { id: 's-tulip', name: 'Hoa Tulip', desc: 'Trồng và chăm sóc hoa tulip trong vườn', price: 99, category: 'seed', art: 'tulip' },
  { id: 's-lotus', name: 'Hoa Sen', desc: 'Trồng và chăm sóc hoa sen trong vườn', price: 129, category: 'seed', art: 'lotus' },
  { id: 's-rose', name: 'Hoa Hồng', desc: 'Trồng và chăm sóc hoa hồng trong vườn', price: 149, category: 'seed', art: 'rose' },
  { id: 's-sakura', name: 'Anh Đào', desc: 'Cây anh đào nở rộ theo tiến độ học', price: 199, category: 'seed', art: 'sakura', plus: true },
  { id: 's-bamboo', name: 'Trúc May Mắn', desc: 'Trúc xanh tươi tốt mỗi ngày học đều', price: 159, category: 'seed', art: 'bamboo' },

  // Khung viền animation (Frames)
  { id: 'f-aurora', name: 'Aurora Cực Quang', desc: 'Khung viền ánh sáng cực quang chuyển động', price: 999, category: 'frame', art: 'aurora', plus: true },
  { id: 'f-sakura', name: 'Spirit Blossom', desc: 'Cánh hoa anh đào bay quanh avatar', price: 1299, category: 'frame', art: 'blossom', plus: true },
  { id: 'f-flame', name: 'Phượng Hoàng Lửa', desc: 'Ngọn lửa rực rỡ viền quanh', price: 1599, category: 'frame', art: 'flame', plus: true },
  { id: 'f-ice', name: 'Băng Giá', desc: 'Tinh thể băng lấp lánh', price: 800, category: 'frame', art: 'ice' },
  { id: 'f-forest', name: 'Forest Frolic', desc: 'Lá rừng xanh xoay nhẹ', price: 700, category: 'frame', art: 'forest' },
  { id: 'f-galaxy', name: 'Dải Ngân Hà', desc: 'Tinh vân và sao lấp lánh', price: 1888, category: 'frame', art: 'galaxy', plus: true },

  // Hiệu ứng Avatar
  { id: 'a-glow', name: 'Hào Quang', desc: 'Vầng sáng dịu quanh avatar', price: 300, category: 'avatar', art: 'glow' },
  { id: 'a-spark', name: 'Tia Sáng', desc: 'Những tia lấp lánh nhỏ', price: 350, category: 'avatar', art: 'spark' },

  // Huy hiệu
  { id: 'b-star', name: 'Huy Hiệu Ngôi Sao', desc: 'Hiển thị cạnh tên của bạn', price: 250, category: 'badge', art: 'star' },
  { id: 'b-crown', name: 'Vương Miện', desc: 'Danh hiệu cho cao thủ', price: 600, category: 'badge', art: 'crown', plus: true },
]

export const LEADERBOARD: LeaderEntry[] = [
  { rank: 1, name: 'Thu Hằng Phạm', xp: 12480, level: 24, streak: 31, isPlus: true, frame: 'aurora' },
  { rank: 2, name: 'Minh Trường', xp: 11200, level: 22, streak: 28, isPlus: true, frame: 'blossom' },
  { rank: 3, name: 'Ngọc Anh', xp: 9870, level: 20, streak: 25, isPlus: true, frame: 'flame' },
  { rank: 4, name: 'Hải Đăng', xp: 8230, level: 18, streak: 19, isPlus: false, frame: null },
  { rank: 5, name: 'Lan Chi', xp: 7640, level: 17, streak: 22, isPlus: true, frame: 'galaxy' },
  { rank: 6, name: 'Quốc Bảo', xp: 6980, level: 16, streak: 14, isPlus: false, frame: null },
  { rank: 7, name: 'Phương Thảo', xp: 6210, level: 15, streak: 11, isPlus: false, frame: null },
  { rank: 8, name: 'Gia Hân', xp: 5870, level: 14, streak: 9, isPlus: true, frame: 'ice' },
  { rank: 9, name: 'Tuấn Kiệt', xp: 5340, level: 13, streak: 7, isPlus: false, frame: null },
  { rank: 10, name: 'Bạn', xp: 4820, level: 12, streak: 5, isPlus: false, frame: null },
]
