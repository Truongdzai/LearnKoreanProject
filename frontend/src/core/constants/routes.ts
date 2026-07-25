import type { AppView } from './enum'

export const ROUTES: Record<AppView, string> = {
  home: '/',
  learn: '/hoc',
  library: '/kho-video',
  myvideos: '/video-cua-toi',
  courses: '/khoa-hoc',
  path: '/lo-trinh',
  speaking: '/luyen-noi',
  english: '/tieng-anh-3-thang',
  toeic: '/luyen-thi-toeic',
  korean: '/tu-vung-han',
  vocab: '/tu-vung',
  flashcards: '/on-tap',
  activities: '/hoat-dong',
  leaderboard: '/bang-xep-hang',
  quests: '/nhiem-vu',
  shop: '/cua-hang',
  garden: '/vuon-cua-toi',
  lingo: '/hot-lingo',
  dashboard: '/tong-quan',
  pricing: '/bang-gia',
  admin: '/quan-tri',
}

const VIEW_BY_PATH: Record<string, AppView> = Object.entries(ROUTES).reduce(
  (acc, [view, path]) => {
    acc[path] = view as AppView
    return acc
  },
  {} as Record<string, AppView>,
)

const TITLE_KEY: Partial<Record<AppView, string>> = {
  learn: 'page.learn',
  courses: 'nav.path',
  dashboard: 'page.dashboard',
  pricing: 'page.pricing',
  admin: 'page.admin',
}

function normalize(pathname: string): string {
  const p = decodeURIComponent(pathname || '/').toLowerCase().replace(/\/+$/, '')
  return p || '/'
}

export function pathForView(view: AppView): string {
  return ROUTES[view] || '/'
}

export function viewForPath(pathname: string): AppView | null {
  return VIEW_BY_PATH[normalize(pathname)] || null
}

export function titleKeyForView(view: AppView): string {
  return TITLE_KEY[view] || `nav.${view}`
}
