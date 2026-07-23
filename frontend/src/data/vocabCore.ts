
export type WordPos = 'noun' | 'verb' | 'adj' | 'question' | 'phrase' | 'adverb' | 'prep'

export interface IcesWord {
  en?: string
  ko?: string
  ipa?: string
  romaja?: string
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

export const wTerm = (w: IcesWord): string => w.en ?? w.ko ?? ''

export const wRead = (w: IcesWord): string => w.ipa ?? w.romaja ?? ''
