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
