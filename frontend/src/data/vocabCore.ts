
export type WordPos = 'noun' | 'verb' | 'adj' | 'question' | 'phrase' | 'adverb' | 'prep'

export interface IcesWord {
  en?: string
  ko?: string
  zh?: string
  ipa?: string
  romaja?: string
  pinyin?: string
  vi: string
  pos: WordPos
  img: string
  connect: string
  ex: string
  exVi: string
}

export interface VocabUnit {
  id: string
  name: string
  sub: string
  pos: WordPos
  tone: string
  emoji: string
  words: IcesWord[]
}

export const wTerm = (w: IcesWord): string => w.en ?? w.ko ?? w.zh ?? ''

export const wRead = (w: IcesWord): string => w.ipa ?? w.romaja ?? w.pinyin ?? ''

export type WeekTaskKind = 'vocab' | 'total' | 'quiz' | 'video' | 'speak' | 'review' | 'custom' | 'grammar' | 'toeic' | 'pron'

export type WeekTaskGo = 'learn' | 'quiz' | 'library' | 'speaking' | 'flashcards' | 'vocab' | 'summary' | null

export interface WeekTask {
  id: string
  kind: WeekTaskKind
  label: string
  unitId?: string
  pct?: number
  targetTotal?: number
  passPct?: number
  n?: number
  go?: WeekTaskGo
  lessonId?: string
  groupId?: string
}

export interface SentencePattern {
  pattern: string
  vi: string
  ex: string
  exVi: string
}

export interface WeekPlan {
  week: number
  month: 1 | 2 | 3
  phase: 'Compress' | 'Compile' | 'Consolidate'
  title: string
  focus: string
  rhythm: string
  tasks: WeekTask[]
  quizUnits?: string[]
  patterns?: SentencePattern[]
}
