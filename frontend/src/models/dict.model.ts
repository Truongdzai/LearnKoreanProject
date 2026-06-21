export interface DictEntry {
  term: string
  hanja: string
  pos: string
  meaning: string
}

export interface DictResult {
  word: string
  matched: 'exact' | 'base' | 'none'
  entries: DictEntry[]
}

export interface DictRich {
  phon?: string
  level?: string
  pos?: string
  meaning: string
  explain: string
  usage: string
  examples: { ko: string; vi: string }[]
  phrases: string[]
  mistakes: string
  synonyms: string[]
  ai?: boolean
}

export interface DictRichResult extends DictResult {
  rich: DictRich | null
}
