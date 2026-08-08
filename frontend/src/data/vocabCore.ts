
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

export interface WordDef {
  def?: string
  defVi?: string
}

export type WordDefs = Record<string, WordDef>

const DEF_FILES: Record<string, () => Promise<{ default: WordDefs }>> = {
  en: () => import('./english/defs.json'),
  ko: () => import('./korean/defs.json'),
  zh: () => import('./chinese/defs.json'),
}

export async function loadDefs(lang: string): Promise<WordDefs> {
  const pick = DEF_FILES[lang]
  if (!pick) return {}
  const mod = await pick()
  return mod.default
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

const POS_VI: Record<WordPos, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adj: 'Tính từ',
  adverb: 'Trạng từ',
  prep: 'Giới từ',
  question: 'Từ để hỏi',
  phrase: 'Cụm từ',
}

export const posLabel = (pos: WordPos): string => POS_VI[pos] ?? 'Từ vựng'

const LANG_VI: Record<string, string> = {
  en: 'tiếng Anh',
  ko: 'tiếng Hàn',
  zh: 'tiếng Trung',
  ja: 'tiếng Nhật',
  vi: 'tiếng Việt',
  de: 'tiếng Đức',
}

export const langLabel = (lang: string): string => LANG_VI[lang] ?? 'ngoại ngữ'

export type WeekTaskKind = 'vocab' | 'total' | 'quiz' | 'video' | 'speak' | 'review' | 'custom' | 'grammar' | 'toeic' | 'pron'

export type WeekTaskGo = 'learn' | 'quiz' | 'library' | 'speaking' | 'flashcards' | 'vocab' | 'summary' | 'hsk' | null

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
