export type SpeakLevel = 'beginner' | 'intermediate' | 'advanced'

export interface SpeakLevelDef {
  id: SpeakLevel
  emoji: string
  labelKey: string
  descKey: string
}

export const LEVELS: SpeakLevelDef[] = [
  { id: 'beginner', emoji: '🌱', labelKey: 'sp.lvBeginner', descKey: 'sp.lvBeginnerDesc' },
  { id: 'intermediate', emoji: '🌤️', labelKey: 'sp.lvMid', descKey: 'sp.lvMidDesc' },
  { id: 'advanced', emoji: '🔥', labelKey: 'sp.lvAdvanced', descKey: 'sp.lvAdvancedDesc' },
]

const KEY = 'vyling.speakLevel'

export function loadLevel(): SpeakLevel {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'beginner' || saved === 'intermediate' || saved === 'advanced') return saved
  } catch { }
  return 'beginner'
}

export function saveLevel(level: SpeakLevel) {
  try { localStorage.setItem(KEY, level) } catch { }
}

export function levelLabelKey(level: string): string {
  return LEVELS.find((l) => l.id === level)?.labelKey || 'sp.lvBeginner'
}

export const MATCH_TOPICS = [
  { id: 'daily', emoji: '☕' },
  { id: 'travel', emoji: '✈️' },
  { id: 'work', emoji: '💼' },
  { id: 'school', emoji: '🎓' },
  { id: 'food', emoji: '🍜' },
  { id: 'movies', emoji: '🎬' },
  { id: 'tech', emoji: '💻' },
  { id: 'sport', emoji: '⚽' },
  { id: 'health', emoji: '🩺' },
  { id: 'exam', emoji: '📝' },
]

export const MAX_MATCH_TOPICS = 5
