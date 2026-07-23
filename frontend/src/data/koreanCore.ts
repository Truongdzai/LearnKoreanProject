
import { type IcesWord, type VocabUnit } from './vocabCore'

import greetings from './korean/units/greetings.json'
import family from './korean/units/family.json'
import verbs from './korean/units/verbs.json'
import places from './korean/units/places.json'
import food from './korean/units/food.json'
import timenum from './korean/units/timenum.json'

export const KO_UNITS: VocabUnit[] = [
  greetings, family, verbs, places, food, timenum,
] as unknown as VocabUnit[]

export const KO_ALL_WORDS: IcesWord[] = KO_UNITS.flatMap((u) => u.words)
