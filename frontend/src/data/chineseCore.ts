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
import family from './chinese/units/family.json'
import body from './chinese/units/body.json'
import weather from './chinese/units/weather.json'
import transport from './chinese/units/transport.json'
import directions from './chinese/units/directions.json'
import school from './chinese/units/school.json'
import work from './chinese/units/work.json'
import home from './chinese/units/home.json'
import clothes from './chinese/units/clothes.json'
import restaurant from './chinese/units/restaurant.json'
import hobby from './chinese/units/hobby.json'
import travel from './chinese/units/travel.json'
import money from './chinese/units/money.json'
import measure from './chinese/units/measure.json'
import particles from './chinese/units/particles.json'

export const ZH_UNITS: VocabUnit[] = [
  greetings, people, family, numbers,
  questions, verbs, particles, measure,
  food, time, places, adjectives,
  daily, common, shopping, money,
  weather, transport, directions, home,
  clothes, restaurant, school, work,
  body, hobby, travel,
] as VocabUnit[]

export const ZH_ALL_WORDS: IcesWord[] = ZH_UNITS.flatMap((u) => u.words)

export const ZH_TARGET_WORDS = 300

export { wTerm, wRead } from './vocabCore'
