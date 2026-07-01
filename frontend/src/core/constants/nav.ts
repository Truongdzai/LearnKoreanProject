import type { NavItem } from '@/types'

/** Languages that learn through the video pipeline (video library, speaking, paths…). */
export const VIDEO_LANGS = ['ko', 'en', 'ja', 'zh', 'de', 'vi']

/**
 * Sidebar items. `langs` lists which learning languages an item belongs to;
 * items without `langs` are universal (gamification, account, home…) and always show.
 */
export const NAV: NavItem[] = [
  { id: 'home', icon: 'home', label: 'Trang chủ' },
  { id: 'library', icon: 'film', label: 'Kho video', langs: VIDEO_LANGS },
  { id: 'myvideos', icon: 'tv', label: 'Video của tôi', langs: VIDEO_LANGS },
  { id: 'path', icon: 'map', label: 'Lộ trình', langs: VIDEO_LANGS },
  { id: 'speaking', icon: 'mic', label: 'Luyện nói', langs: VIDEO_LANGS },
  { id: 'english', icon: 'globe', label: 'Tiếng Anh 3 tháng', langs: ['en'] },
  { id: 'lingo', icon: 'trending', label: 'Hot Lingo', langs: ['ko'] },
  { id: 'vocab', icon: 'cards', label: 'Từ vựng' },
  { id: 'flashcards', icon: 'letters', label: 'Ôn tập' },
  { id: 'activities', icon: 'chart', label: 'Hoạt động' },
  { id: 'leaderboard', icon: 'trophy', label: 'Bảng xếp hạng' },
  { id: 'quests', icon: 'target', label: 'Nhiệm vụ' },
  { id: 'shop', icon: 'store', label: 'Cửa hàng' },
  { id: 'garden', icon: 'sprout', label: 'Vườn của tôi' },
]

/** Nav items visible for a given learning language. */
export function navForLang(lang: string): NavItem[] {
  return NAV.filter((n) => !n.langs || n.langs.includes(lang))
}

/** Whether a view is reachable from the sidebar for a given language. */
export function viewAllowedForLang(view: string, lang: string): boolean {
  const item = NAV.find((n) => n.id === view)
  // Sub-views not in the nav (learn, pricing, dashboard, admin…) are always allowed.
  if (!item) return true
  return !item.langs || item.langs.includes(lang)
}
