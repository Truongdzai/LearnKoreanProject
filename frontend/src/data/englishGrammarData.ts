import lessons from './english/grammar/lessons.json'
import { grammarLevel, type GrammarLesson } from './englishGrammar'

export const GRAMMAR_LESSONS = lessons as GrammarLesson[]

export const CORE_GRAMMAR_IDS = GRAMMAR_LESSONS.filter((l) => grammarLevel(l) === 'core').map((l) => l.id)
export const B1_GRAMMAR_IDS = GRAMMAR_LESSONS.filter((l) => grammarLevel(l) === 'B1').map((l) => l.id)
