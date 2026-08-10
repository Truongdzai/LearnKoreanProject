export type SpeakLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

export interface SpeakLevelDef {
  id: SpeakLevel
  code: string
  labelKey: string
  descKey: string
}

export const LEVELS: SpeakLevelDef[] = [
  { id: 'a1', code: 'A1', labelKey: 'sp.lv.a1', descKey: 'sp.lvd.a1' },
  { id: 'a2', code: 'A2', labelKey: 'sp.lv.a2', descKey: 'sp.lvd.a2' },
  { id: 'b1', code: 'B1', labelKey: 'sp.lv.b1', descKey: 'sp.lvd.b1' },
  { id: 'b2', code: 'B2', labelKey: 'sp.lv.b2', descKey: 'sp.lvd.b2' },
  { id: 'c1', code: 'C1', labelKey: 'sp.lv.c1', descKey: 'sp.lvd.c1' },
  { id: 'c2', code: 'C2', labelKey: 'sp.lv.c2', descKey: 'sp.lvd.c2' },
]

const LEGACY: Record<string, SpeakLevel> = {
  beginner: 'a1',
  intermediate: 'b1',
  advanced: 'c1',
}

export function normLevel(value: string | null | undefined): SpeakLevel {
  const raw = (value || '').toLowerCase()
  if (LEVELS.some((l) => l.id === raw)) return raw as SpeakLevel
  return LEGACY[raw] || 'a2'
}

const KEY = 'vyling.speakLevel'

export function loadLevel(): SpeakLevel {
  try {
    return normLevel(localStorage.getItem(KEY))
  } catch {
    return 'a2'
  }
}

export function saveLevel(level: SpeakLevel) {
  try { localStorage.setItem(KEY, level) } catch { }
}

export function levelCode(level: string): string {
  return LEVELS.find((l) => l.id === normLevel(level))?.code || 'A2'
}

export function levelLabelKey(level: string): string {
  return LEVELS.find((l) => l.id === normLevel(level))?.labelKey || 'sp.lv.a2'
}

export interface TopicDef {
  id: string
  emoji: string
  langs?: string[]
}

export const TOPICS: TopicDef[] = [
  { id: 'ielts', emoji: '📘', langs: ['en'] },
  { id: 'toeic', emoji: '📗', langs: ['en'] },
  { id: 'toefl', emoji: '📙', langs: ['en'] },
  { id: 'topik', emoji: '📕', langs: ['ko'] },
  { id: 'hsk', emoji: '📔', langs: ['zh'] },
  { id: 'jlpt', emoji: '📒', langs: ['ja'] },
  { id: 'interview', emoji: '🤝' },
  { id: 'business', emoji: '💼' },
  { id: 'academic', emoji: '🎓' },
  { id: 'daily', emoji: '☕' },
  { id: 'travel', emoji: '✈️' },
  { id: 'food', emoji: '🍜' },
  { id: 'music', emoji: '🎵' },
  { id: 'movies', emoji: '🎬' },
  { id: 'sport', emoji: '⚽' },
  { id: 'tech', emoji: '💻' },
  { id: 'gaming', emoji: '🎮' },
  { id: 'books', emoji: '📚' },
  { id: 'science', emoji: '🔬' },
  { id: 'art', emoji: '🎨' },
  { id: 'health', emoji: '🩺' },
  { id: 'fashion', emoji: '👗' },
  { id: 'nature', emoji: '🌿' },
]

export const MAX_TOPICS = 10

export function topicsFor(lang: string): TopicDef[] {
  return TOPICS.filter((tp) => !tp.langs || tp.langs.includes(lang))
}
