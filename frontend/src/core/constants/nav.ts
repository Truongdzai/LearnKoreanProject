import type { NavItem } from '@/types'

export const VIDEO_LANGS = ['ko', 'en', 'ja', 'zh', 'de', 'vi']

const PATH_LANGS = VIDEO_LANGS.filter((l) => l !== 'en')

export const NAV: NavItem[] = [
  { id: 'home', icon: 'home', label: 'Trang chủ' },
  { id: 'library', icon: 'film', label: 'Kho video', langs: VIDEO_LANGS },
  { id: 'myvideos', icon: 'tv', label: 'Video của tôi', langs: VIDEO_LANGS },
  { id: 'path', icon: 'map', label: 'Lộ trình', langs: PATH_LANGS },
  { id: 'speaking', icon: 'mic', label: 'Luyện nói', langs: VIDEO_LANGS },
  { id: 'english', icon: 'globe', label: 'Tiếng Anh 3 tháng', langs: ['en'] },
  { id: 'toeic', icon: 'book', label: 'Luyện thi TOEIC', langs: ['en'] },
  { id: 'korean', icon: 'cards', label: 'Từ vựng lõi Hàn', langs: ['ko'] },
  { id: 'lingo', icon: 'trending', label: 'Hot Lingo', langs: ['ko'] },
  { id: 'vocab', icon: 'cards', label: 'Từ vựng' },
  { id: 'flashcards', icon: 'letters', label: 'Ôn tập' },
  { id: 'activities', icon: 'chart', label: 'Hoạt động' },
  { id: 'leaderboard', icon: 'trophy', label: 'Bảng xếp hạng' },
  { id: 'quests', icon: 'target', label: 'Nhiệm vụ' },
  { id: 'shop', icon: 'store', label: 'Cửa hàng' },
  { id: 'garden', icon: 'sprout', label: 'Vườn của tôi' },
]

export function navForLang(lang: string): NavItem[] {
  return NAV.filter((n) => !n.langs || n.langs.includes(lang))
}

export function viewAllowedForLang(view: string, lang: string): boolean {
  const item = NAV.find((n) => n.id === view)
  if (!item) return true
  return !item.langs || item.langs.includes(lang)
}
