export interface BadgeDef {
  id: string
  emoji: string
  nameKey: string
  descKey: string
  target: number
  metric: 'xp' | 'streak' | 'cards' | 'videos' | 'plants'
}

export interface BadgeState extends BadgeDef {
  value: number
  earned: boolean
  pct: number
}

export const BADGES: BadgeDef[] = [
  { id: 'xp100', emoji: '⭐', nameKey: 'bd.xp100', descKey: 'bd.xp100d', target: 100, metric: 'xp' },
  { id: 'xp500', emoji: '🌟', nameKey: 'bd.xp500', descKey: 'bd.xp500d', target: 500, metric: 'xp' },
  { id: 'xp2000', emoji: '💫', nameKey: 'bd.xp2000', descKey: 'bd.xp2000d', target: 2000, metric: 'xp' },
  { id: 'streak3', emoji: '🔥', nameKey: 'bd.streak3', descKey: 'bd.streak3d', target: 3, metric: 'streak' },
  { id: 'streak7', emoji: '🚒', nameKey: 'bd.streak7', descKey: 'bd.streak7d', target: 7, metric: 'streak' },
  { id: 'streak30', emoji: '🌋', nameKey: 'bd.streak30', descKey: 'bd.streak30d', target: 30, metric: 'streak' },
  { id: 'cards10', emoji: '🃏', nameKey: 'bd.cards10', descKey: 'bd.cards10d', target: 10, metric: 'cards' },
  { id: 'cards50', emoji: '📚', nameKey: 'bd.cards50', descKey: 'bd.cards50d', target: 50, metric: 'cards' },
  { id: 'cards200', emoji: '🏛️', nameKey: 'bd.cards200', descKey: 'bd.cards200d', target: 200, metric: 'cards' },
  { id: 'videos1', emoji: '🎬', nameKey: 'bd.videos1', descKey: 'bd.videos1d', target: 1, metric: 'videos' },
  { id: 'videos5', emoji: '📺', nameKey: 'bd.videos5', descKey: 'bd.videos5d', target: 5, metric: 'videos' },
  { id: 'plants3', emoji: '🌸', nameKey: 'bd.plants3', descKey: 'bd.plants3d', target: 3, metric: 'plants' },
]

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
    return { ...b, value, earned, pct: Math.min(100, Math.round((value / b.target) * 100)) }
  })
}
