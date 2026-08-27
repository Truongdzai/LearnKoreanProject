import type { NavGroup, NavItem } from '@/types'

export const VIDEO_LANGS = ['ko', 'en', 'ja', 'zh']

const PATH_LANGS = VIDEO_LANGS.filter((l) => l !== 'en')

export const NAV: NavItem[] = [
  { id: 'home', icon: 'home', label: 'Trang chủ', group: 'learn' },
  { id: 'library', icon: 'film', label: 'Shadowing', langs: VIDEO_LANGS, group: 'learn' },
  { id: 'myvideos', icon: 'tv', label: 'Video của tôi', langs: VIDEO_LANGS, group: 'learn' },
  { id: 'path', icon: 'map', label: 'Lộ trình', langs: PATH_LANGS, group: 'learn' },
  { id: 'speaking', icon: 'mic', label: 'Luyện nói', langs: VIDEO_LANGS, group: 'learn' },
  { id: 'tutor', icon: 'bulb', label: 'Gia sư AI', langs: VIDEO_LANGS, group: 'learn' },
  { id: 'english', icon: 'globe', label: 'Tiếng Anh giao tiếp', langs: ['en'], group: 'track' },
  { id: 'toeic', icon: 'book', label: 'Luyện thi TOEIC', langs: ['en'], group: 'track' },
  { id: 'korean', icon: 'globe', label: 'Tiếng Hàn 3 tháng', langs: ['ko'], group: 'track' },
  { id: 'topik', icon: 'book', label: 'Luyện thi TOPIK', langs: ['ko'], group: 'track' },
  { id: 'chinese', icon: 'globe', label: 'Tiếng Trung 3 tháng', langs: ['zh'], group: 'track' },
  { id: 'hsk', icon: 'book', label: 'Luyện thi HSK', langs: ['zh'], group: 'track' },
  { id: 'lingo', icon: 'trending', label: 'Hot Lingo', langs: ['ko'], group: 'track' },
  { id: 'vocab', icon: 'cards', label: 'Từ vựng', group: 'cards' },
  { id: 'flashcards', icon: 'letters', label: 'Ôn tập', group: 'cards' },
  { id: 'activities', icon: 'chart', label: 'Hoạt động', group: 'record' },
  { id: 'leaderboard', icon: 'trophy', label: 'Bảng xếp hạng', group: 'record' },
  { id: 'quests', icon: 'target', label: 'Nhiệm vụ', group: 'record' },
  { id: 'shop', icon: 'store', label: 'Cửa hàng', group: 'record' },
  { id: 'garden', icon: 'sprout', label: 'Vườn của tôi', group: 'record' },
]

export const NAV_GROUPS: NavGroup[] = ['learn', 'track', 'cards', 'record']

export function navForLang(lang: string): NavItem[] {
  return NAV.filter((n) => !n.langs || n.langs.includes(lang))
}

export function navGroupsForLang(lang: string): { group: NavGroup; items: NavItem[] }[] {
  const items = navForLang(lang)
  return NAV_GROUPS
    .map((group) => ({ group, items: items.filter((n) => n.group === group) }))
    .filter((g) => g.items.length > 0)
}

export function viewAllowedForLang(view: string, lang: string): boolean {
  const item = NAV.find((n) => n.id === view)
  if (!item) return true
  return !item.langs || item.langs.includes(lang)
}

export function langsForView(view: string): string[] | null {
  const item = NAV.find((n) => n.id === view)
  return item?.langs ?? null
}
