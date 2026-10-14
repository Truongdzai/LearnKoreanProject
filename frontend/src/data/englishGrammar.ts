export interface GrammarDrill {
  text: string
  options: string[]
  answer: number
  explain: string
}

export type GrammarLevel = 'core' | 'B1'

export interface GrammarLesson {
  id: string
  /** Bỏ trống = bài lõi A1–A2; 'B1' = bài trung cấp cho lộ trình Bootcamp. */
  level?: 'B1'
  title: string
  tag: string
  points: string[]
  examples: { en: string; vi: string }[]
  drill: GrammarDrill[]
}

export const GRAMMAR_PASS = 75

export const grammarLevel = (l: GrammarLesson): GrammarLevel => l.level ?? 'core'

