export type ProfilePos = 'noun' | 'verb' | 'adj' | 'adverb' | 'prep' | 'phrase' | 'other'

export interface ProfileSense {
  pos: ProfilePos
  vi: string
  en: string
  freq: number
  reg: string
  ex: string
  exVi: string
  ex2: string
  ex2Vi: string
}

export interface ProfileItem {
  form: string
  vi: string
  ex: string
}

export interface ProfileCombo {
  label: string
  note: string
  items: ProfileItem[]
}

export interface ProfileFamily {
  form: string
  pos: string
  vi: string
}

export interface ProfileSynonym {
  word: string
  vi: string
  diff: string
}

export interface ProfileAntonym {
  word: string
  vi: string
}

export interface ProfileConfuse {
  word: string
  vi: string
  why: string
}

export interface WordProfile {
  term: string
  ipa: string
  level: string
  core: string
  grammar: string
  senses: ProfileSense[]
  family: ProfileFamily[]
  combos: ProfileCombo[]
  phrasals: ProfileItem[]
  idioms: ProfileItem[]
  synonyms: ProfileSynonym[]
  antonyms: ProfileAntonym[]
  confuse: ProfileConfuse[]
  mistakes: string[]
  ai?: boolean
}

export interface WordProfileResult {
  word: string
  profile: WordProfile | null
  cached: boolean
}
