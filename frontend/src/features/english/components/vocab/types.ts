import type { IcesWord, VocabUnit, WordDef } from '@/data/vocabCore'

export interface Card {
  w: IcesWord
  term: string
  read: string
  us: string
  uk: string
  unit: VocabUnit
}

export interface ModeProps {
  card: Card
  pool: Card[]
  lang: string
  def: WordDef
  accents: boolean
  speak: (text: string) => void
  onNext: () => void
  onDone: (correct: boolean) => void
}
