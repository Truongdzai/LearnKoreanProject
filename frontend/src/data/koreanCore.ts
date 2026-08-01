import { type IcesWord, type VocabUnit } from './vocabCore'

import greetings from './korean/units/greetings.json'
import family from './korean/units/family.json'
import honorific from './korean/units/honorific.json'
import questions from './korean/units/questions.json'
import places from './korean/units/places.json'
import connectors from './korean/units/connectors.json'
import verbs from './korean/units/verbs.json'
import food from './korean/units/food.json'
import fruit from './korean/units/fruit.json'
import timenum from './korean/units/timenum.json'
import sinonum from './korean/units/sinonum.json'
import purehan from './korean/units/purehan.json'
import time2 from './korean/units/time2.json'
import body from './korean/units/body.json'
import adjectives from './korean/units/adjectives.json'
import state from './korean/units/state.json'
import verbs2 from './korean/units/verbs2.json'
import home from './korean/units/home.json'
import kitchen from './korean/units/kitchen.json'
import directions from './korean/units/directions.json'
import colors from './korean/units/colors.json'
import city from './korean/units/city.json'
import weather from './korean/units/weather.json'
import emotions from './korean/units/emotions.json'
import animals from './korean/units/animals.json'
import character from './korean/units/character.json'
import adverbs from './korean/units/adverbs.json'
import verbs3 from './korean/units/verbs3.json'
import adjectives2 from './korean/units/adjectives2.json'
import phonecall from './korean/units/phonecall.json'
import shopping from './korean/units/shopping.json'
import restaurant from './korean/units/restaurant.json'
import hobby from './korean/units/hobby.json'
import sports from './korean/units/sports.json'
import transport from './korean/units/transport.json'
import school from './korean/units/school.json'
import health from './korean/units/health.json'
import bank from './korean/units/bank.json'
import clothing from './korean/units/clothing.json'
import tech from './korean/units/tech.json'
import work from './korean/units/work.json'
import office from './korean/units/office.json'
import travel from './korean/units/travel.json'
import particles from './korean/units/particles.json'
import social from './korean/units/social.json'
import conj2 from './korean/units/conj2.json'
import street from './korean/units/street.json'
import hada from './korean/units/hada.json'
import taste from './korean/units/taste.json'
import order from './korean/units/order.json'
import daily2 from './korean/units/daily2.json'
import body2 from './korean/units/body2.json'
import feeling2 from './korean/units/feeling2.json'
import house2 from './korean/units/house2.json'
import irregular from './korean/units/irregular.json'
import nature from './korean/units/nature.json'
import safety from './korean/units/safety.json'
import event from './korean/units/event.json'
import media from './korean/units/media.json'
import adverbs2 from './korean/units/adverbs2.json'
import tech2 from './korean/units/tech2.json'
import market from './korean/units/market.json'
import online from './korean/units/online.json'
import exam from './korean/units/exam.json'
import post from './korean/units/post.json'
import work2 from './korean/units/work2.json'
import travel2 from './korean/units/travel2.json'

export const KO_UNITS: VocabUnit[] = [
  greetings, family, honorific, particles, social,
  questions, places, connectors, conj2, street,
  verbs, food, fruit, hada, taste,
  timenum, sinonum, purehan, time2, order, daily2,
  body, adjectives, state, body2, feeling2,
  verbs2, home, kitchen, house2, irregular,
  directions, colors, city, nature, safety,
  weather, emotions, animals, character, event, media,
  adverbs, verbs3, adjectives2, phonecall, adverbs2, tech2,
  shopping, restaurant, hobby, sports, market, online,
  transport, school, health, bank, exam, post,
  clothing, tech, work, office, travel, work2, travel2,
] as unknown as VocabUnit[]

export const KO_ALL_WORDS: IcesWord[] = KO_UNITS.flatMap((u) => u.words)
