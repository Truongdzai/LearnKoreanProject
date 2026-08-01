import { type IcesWord, type VocabUnit } from './vocabCore'

import greetings from './chinese/units/greetings.json'
import people from './chinese/units/people.json'
import numbers from './chinese/units/numbers.json'
import questions from './chinese/units/questions.json'
import verbs from './chinese/units/verbs.json'
import food from './chinese/units/food.json'
import time from './chinese/units/time.json'
import places from './chinese/units/places.json'
import adjectives from './chinese/units/adjectives.json'
import daily from './chinese/units/daily.json'
import common from './chinese/units/common.json'
import shopping from './chinese/units/shopping.json'

export const ZH_UNITS: VocabUnit[] = [
  greetings, people, numbers, questions,
  verbs, food, time, places,
  adjectives, daily, common, shopping,
] as VocabUnit[]

export const ZH_ALL_WORDS: IcesWord[] = ZH_UNITS.flatMap((u) => u.words)

export const ZH_TARGET_WORDS = 150

export { wTerm, wRead } from './vocabCore'
