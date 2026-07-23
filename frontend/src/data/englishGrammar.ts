
import lessons from './english/grammar/lessons.json'

export interface GrammarDrill {
  text: string
  options: string[]
  answer: number
  explain: string
}

export interface GrammarLesson {
  id: string
  title: string
  tag: string
  points: string[]
  examples: { en: string; vi: string }[]
  drill: GrammarDrill[]
}

export const GRAMMAR_LESSONS = lessons as GrammarLesson[]

export const GRAMMAR_PASS = 75
