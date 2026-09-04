import type { IconName } from '@/core/components/Icon'

export type BadgeMetric = 'xp' | 'streak' | 'cards' | 'videos' | 'plants'

export interface BadgeDef {
  id: string
  icon: IconName
  nameKey: string
  descKey: string
  target: number
  metric: BadgeMetric
  tier: 1 | 2 | 3
  shape: BadgeShape
}

export type BadgeShape =
  | 'circle' | 'hex' | 'rosette' | 'flame' | 'shield' | 'star'
  | 'diamond' | 'pentagon' | 'octagon' | 'squircle' | 'hexflat' | 'leaf'


export interface BadgeState extends BadgeDef {
  value: number
  earned: boolean
  pct: number
  remain: number
}

export const BADGES: BadgeDef[] = [
  { id: 'xp100', icon: 'rocket', nameKey: 'bd.xp100', descKey: 'bd.xp100d', target: 100, metric: 'xp', tier: 1, shape: 'circle' },
  { id: 'xp500', icon: 'trending', nameKey: 'bd.xp500', descKey: 'bd.xp500d', target: 500, metric: 'xp', tier: 2, shape: 'hex' },
  { id: 'xp2000', icon: 'crown', nameKey: 'bd.xp2000', descKey: 'bd.xp2000d', target: 2000, metric: 'xp', tier: 3, shape: 'rosette' },
  { id: 'streak3', icon: 'sparkles', nameKey: 'bd.streak3', descKey: 'bd.streak3d', target: 3, metric: 'streak', tier: 1, shape: 'flame' },
  { id: 'streak7', icon: 'flame', nameKey: 'bd.streak7', descKey: 'bd.streak7d', target: 7, metric: 'streak', tier: 2, shape: 'shield' },
  { id: 'streak30', icon: 'sun', nameKey: 'bd.streak30', descKey: 'bd.streak30d', target: 30, metric: 'streak', tier: 3, shape: 'star' },
  { id: 'cards10', icon: 'cards', nameKey: 'bd.cards10', descKey: 'bd.cards10d', target: 10, metric: 'cards', tier: 1, shape: 'diamond' },
  { id: 'cards50', icon: 'book', nameKey: 'bd.cards50', descKey: 'bd.cards50d', target: 50, metric: 'cards', tier: 2, shape: 'pentagon' },
  { id: 'cards200', icon: 'letters', nameKey: 'bd.cards200', descKey: 'bd.cards200d', target: 200, metric: 'cards', tier: 3, shape: 'octagon' },
  { id: 'videos1', icon: 'play', nameKey: 'bd.videos1', descKey: 'bd.videos1d', target: 1, metric: 'videos', tier: 1, shape: 'squircle' },
  { id: 'videos5', icon: 'film', nameKey: 'bd.videos5', descKey: 'bd.videos5d', target: 5, metric: 'videos', tier: 2, shape: 'hexflat' },
  { id: 'plants3', icon: 'sprout', nameKey: 'bd.plants3', descKey: 'bd.plants3d', target: 3, metric: 'plants', tier: 1, shape: 'leaf' },
]

export const BADGE_TONE: Record<BadgeMetric, string> = {
  xp: 'tone-gold',
  streak: 'tone-fire',
  cards: 'tone-ink',
  videos: 'tone-sea',
  plants: 'tone-leaf',
}

export const TIER_MARK = ['I', 'II', 'III'] as const

export interface BadgeInput {
  xp: number
  streak: number
  cards: number
  videos: number
  plants: number
}

export function computeBadges(input: BadgeInput): BadgeState[] {
  return BADGES.map((b) => {
    const value = input[b.metric]
    const earned = value >= b.target
    return {
      ...b,
      value,
      earned,
      pct: Math.min(100, Math.round((value / b.target) * 100)),
      remain: Math.max(0, b.target - value),
    }
  })
}

export function nextBadge(list: BadgeState[]): BadgeState | null {
  const open = list.filter((b) => !b.earned)
  if (!open.length) return null
  return open.reduce((best, b) => (b.pct > best.pct ? b : best))
}
