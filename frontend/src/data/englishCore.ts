
import { GRAMMAR_LESSONS } from './englishGrammar'
import { PRON_GROUPS, PRON_PASS } from './englishPronunciation'
import nouns from './english/units/nouns.json'
import verbs from './english/units/verbs.json'
import questions from './english/units/questions.json'
import adjectives from './english/units/adjectives.json'
import places from './english/units/places.json'
import verbs2 from './english/units/verbs2.json'
import adverbs from './english/units/adverbs.json'
import preps from './english/units/preps.json'
import phrases from './english/units/phrases.json'
import body from './english/units/body.json'
import timenum from './english/units/timenum.json'
import worklife from './english/units/worklife.json'
import foodshop from './english/units/foodshop.json'
import feelings from './english/units/feelings.json'
import nature from './english/units/nature.json'
import home from './english/units/home.json'
import tech from './english/units/tech.json'
import phrases2 from './english/units/phrases2.json'
import colors from './english/units/colors.json'
import animals from './english/units/animals.json'
import clothing from './english/units/clothing.json'
import sports from './english/units/sports.json'
import transport from './english/units/transport.json'
import jobs from './english/units/jobs.json'
import school from './english/units/school.json'
import cooking from './english/units/cooking.json'
import plants from './english/units/plants.json'
import weather2 from './english/units/weather2.json'
import verbs3 from './english/units/verbs3.json'
import adjectives2 from './english/units/adjectives2.json'
import house2 from './english/units/house2.json'
import shopping from './english/units/shopping.json'
import health2 from './english/units/health2.json'
import travel2 from './english/units/travel2.json'
import office from './english/units/office.json'
import communication from './english/units/communication.json'
import numbers2 from './english/units/numbers2.json'
import feelings2 from './english/units/feelings2.json'
import adverbs2 from './english/units/adverbs2.json'
import time2 from './english/units/time2.json'
import directions from './english/units/directions.json'
import materials from './english/units/materials.json'
import musicArt from './english/units/music_art.json'
import science from './english/units/science.json'
import cityUnit from './english/units/city.json'
import movement from './english/units/movement.json'
import phrasal from './english/units/phrasal.json'
import idioms from './english/units/idioms.json'
import festivals from './english/units/festivals.json'
import environment from './english/units/environment.json'
import ocean from './english/units/ocean.json'
import collocations from './english/units/collocations.json'
import phrasal2 from './english/units/phrasal2.json'
import society from './english/units/society.json'
import family from './english/units/family.json'
import mindverbs from './english/units/mindverbs.json'
import online from './english/units/online.json'
import edading from './english/units/edading.json'
import prepphrases from './english/units/prepphrases.json'
import fashion from './english/units/fashion.json'
import irregular from './english/units/irregular.json'
import connectors from './english/units/connectors.json'
import restaurant from './english/units/restaurant.json'
import tools from './english/units/tools.json'
import education from './english/units/education.json'
import character from './english/units/character.json'
import emergency from './english/units/emergency.json'
import appearance from './english/units/appearance.json'
import love from './english/units/love.json'
import media from './english/units/media.json'
import verbs4 from './english/units/verbs4.json'
import verbs5 from './english/units/verbs5.json'
import adjectives4 from './english/units/adjectives4.json'
import landforms from './english/units/landforms.json'
import soundlight from './english/units/soundlight.json'
import abstractNouns from './english/units/abstract.json'
import measure from './english/units/measure.json'
import handling from './english/units/handling.json'
import verbs6 from './english/units/verbs6.json'
import verbs7 from './english/units/verbs7.json'
import adjectives5 from './english/units/adjectives5.json'
import adjectives6 from './english/units/adjectives6.json'
import nouns2 from './english/units/nouns2.json'
import nouns3 from './english/units/nouns3.json'
import birds from './english/units/birds.json'
import containers from './english/units/containers.json'
import toys from './english/units/toys.json'
import sleep from './english/units/sleep.json'
import war from './english/units/war.json'
import spirit from './english/units/spirit.json'
import verbs8 from './english/units/verbs8.json'
import organs from './english/units/organs.json'
import food2 from './english/units/food2.json'
import adjectives7 from './english/units/adjectives7.json'
import jobs2 from './english/units/jobs2.json'
import people from './english/units/people.json'
import hygiene from './english/units/hygiene.json'
import sweets from './english/units/sweets.json'
import christmas from './english/units/christmas.json'
import computing from './english/units/computing.json'
import business2 from './english/units/business2.json'
import idioms2 from './english/units/idioms2.json'
import phrasal3 from './english/units/phrasal3.json'
import nouns4 from './english/units/nouns4.json'
import verbs9 from './english/units/verbs9.json'
import adjectives8 from './english/units/adjectives8.json'
import health3 from './english/units/health3.json'
import airport from './english/units/airport.json'
import farm from './english/units/farm.json'
import law from './english/units/law.json'
import fitness from './english/units/fitness.json'
import phrases3 from './english/units/phrases3.json'
import adverbs3 from './english/units/adverbs3.json'
import driving from './english/units/driving.json'
import worldfood from './english/units/worldfood.json'
import world from './english/units/world.json'
import repair from './english/units/repair.json'


import { type IcesWord, type VocabUnit } from './vocabCore'

export type { IcesWord, VocabUnit, WordPos } from './vocabCore'
export { wTerm, wRead } from './vocabCore'


export const UNITS: VocabUnit[] = [
  nouns, verbs, questions, adjectives, places, verbs2, adverbs, preps,
  phrases, body, timenum, worklife, foodshop, feelings, nature,
  home, tech, phrases2, colors, animals, clothing, sports, transport, jobs,
  school, cooking, plants, weather2, verbs3, adjectives2,
  house2, shopping, health2, travel2, office, communication,
  numbers2, feelings2, adverbs2, time2, directions, materials,
  musicArt, science, cityUnit, movement, phrasal, idioms,
  festivals, environment, ocean, collocations, phrasal2, society,
  family, mindverbs, online, edading, prepphrases, fashion,
  irregular, connectors, restaurant, tools, education, character,
  emergency, appearance, love, media, verbs4, verbs5,
  adjectives4, landforms, soundlight, abstractNouns, measure, handling,
  verbs6, verbs7, adjectives5, adjectives6, nouns2, nouns3,
  birds, containers, toys, sleep, war, spirit, verbs8, organs, food2,
  adjectives7, jobs2, people, hygiene, sweets,
  christmas, computing, business2, idioms2, phrasal3, nouns4,
  verbs9, adjectives8, health3, airport, farm, law,
  fitness, phrases3, adverbs3, driving, worldfood, world, repair,
] as unknown as VocabUnit[]

export const ALL_WORDS: IcesWord[] = UNITS.flatMap((u) => u.words)

export const TARGET_WORDS = 3000


export type WeekTaskKind = 'vocab' | 'total' | 'quiz' | 'video' | 'speak' | 'review' | 'custom' | 'grammar' | 'toeic' | 'pron'

export type WeekTaskGo = 'learn' | 'quiz' | 'library' | 'speaking' | 'flashcards' | 'vocab' | 'summary' | null

export interface WeekTask {
  id: string
  kind: WeekTaskKind
  label: string
  unitId?: string
  pct?: number
  targetTotal?: number
  passPct?: number
  n?: number
  go?: WeekTaskGo
  lessonId?: string
  groupId?: string
}

export interface SentencePattern {
  pattern: string
  vi: string
  ex: string
  exVi: string
}

export interface WeekPlan {
  week: number
  month: 1 | 2 | 3
  phase: 'Compress' | 'Compile' | 'Consolidate'
  title: string
  focus: string
  rhythm: string
  tasks: WeekTask[]
  quizUnits?: string[]
  patterns?: SentencePattern[]
}

const gl = (week: number, seq: number, lessonId: string): WeekTask => {
  const l = GRAMMAR_LESSONS.find((x) => x.id === lessonId)
  return { id: `w${week}-g${seq}`, kind: 'grammar', lessonId, label: `Ngữ pháp: ${l?.title ?? lessonId} (luyện đạt ≥ 3/4 câu)` }
}

const tk = (week: number, n: number): WeekTask =>
  ({ id: `w${week}-toeic`, kind: 'toeic', n, label: `TOEIC: hoàn thành ≥ ${n}/60 ngày lộ trình` })

const pn = (week: number, groupId: string): WeekTask => {
  const g = PRON_GROUPS.find((x) => x.id === groupId)
  return { id: `w${week}-pron`, kind: 'pron', groupId, label: `Phát âm: ${g?.title ?? groupId} (kiểm tra đạt ≥ ${PRON_PASS}%)` }
}

export const PLAN_12_WEEKS: WeekPlan[] = [
  {
    week: 1, month: 1, phase: 'Compress', title: 'Danh từ & người quanh ta',
    focus: 'Người, gia đình, đồ vật quen thuộc — nền móng của mọi câu nói, cộng thói quen gom từ mỗi ngày.',
    rhythm: 'Ngày 1–6: ~12 từ lõi/ngày (3 nhóm) + gom thêm từ qua video · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS.',
    quizUnits: ['nouns', 'family', 'people'],
    tasks: [
      { id: 'w1-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Danh từ cốt lõi" (32 từ)', unitId: 'nouns', pct: 100 },
      { id: 'w1-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Gia đình & họ hàng" (26 từ)', unitId: 'family', pct: 100 },
      { id: 'w1-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Người quanh ta" (24 từ)', unitId: 'people', pct: 100 },
      gl(1, 1, 'e01'),
      gl(1, 2, 'e02'),
      pn(1, 'end-stop'),
      { id: 'w1-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w1-bank', kind: 'total', label: 'Kho từ đạt 100 — lưu thêm từ khi xem video, gói từ, thẻ tự thêm', targetTotal: 100 },
      { id: 'w1-video', kind: 'video', n: 2, label: 'Xem 2 video tiếng Anh dễ + bấm từ mới trong phụ đề để lưu' },
      { id: 'w1-review', kind: 'review', n: 3, label: 'Vào Ôn tập (SRS) ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 2, month: 1, phase: 'Compress', title: 'Nơi chốn, ăn uống & mua sắm',
    focus: 'Sân bay, nhà hàng, chợ búa + gọi món, hỏi giá, tiền nong — bộ từ "sống sót" khi ra ngoài.',
    rhythm: 'Ngày 1–6: ~15 từ lõi/ngày (3 nhóm) · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS + nghe lại từ khó.',
    quizUnits: ['places', 'foodshop', 'shopping'],
    tasks: [
      { id: 'w2-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Nơi chốn & đời sống" (32 từ)', unitId: 'places', pct: 100 },
      { id: 'w2-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Ăn uống & mua sắm" (30 từ)', unitId: 'foodshop', pct: 100 },
      { id: 'w2-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Mua sắm & tiền bạc" (28 từ)', unitId: 'shopping', pct: 100 },
      gl(2, 1, 'e05'),
      gl(2, 2, 'e06'),
      pn(2, 'end-s'),
      { id: 'w2-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w2-bank', kind: 'total', label: 'Kho từ đạt 250', targetTotal: 250 },
      { id: 'w2-review', kind: 'review', n: 3, label: 'Ôn tập SRS ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 3, month: 1, phase: 'Compress', title: 'Từ để hỏi, con số & thời gian',
    focus: '5W1H + số đếm, thứ trong tuần, bốn mùa — đủ để hỏi giá, hỏi giờ, hẹn lịch.',
    rhythm: 'Ngày 1–2: từ để hỏi + cụm chào · Ngày 3–5: số đếm & thời gian · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['questions', 'phrases', 'timenum', 'numbers2'],
    tasks: [
      { id: 'w3-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Từ để hỏi" (5W1H)', unitId: 'questions', pct: 100 },
      { id: 'w3-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cụm giao tiếp hằng ngày" (20 cụm)', unitId: 'phrases', pct: 100 },
      { id: 'w3-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Số đếm & thời gian" (30 từ)', unitId: 'timenum', pct: 100 },
      { id: 'w3-vocab4', kind: 'vocab', label: 'Thuộc toàn bộ "Số đếm & thứ tự (mở rộng)" (28 từ)', unitId: 'numbers2', pct: 100 },
      gl(3, 1, 'e10'),
      gl(3, 2, 'e13'),
      pn(3, 'vowel-i'),
      { id: 'w3-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w3-bank', kind: 'total', label: 'Kho từ đạt 450', targetTotal: 450 },
      { id: 'w3-speak', kind: 'speak', label: 'Luyện nói 1 buổi chào hỏi/tán gẫu với AI' },
    ],
  },
  {
    week: 4, month: 1, phase: 'Compress', title: 'Tính từ & cảm xúc',
    focus: 'good/bad, big/small + vui buồn giận sợ — nói được cảm nhận của mình, chốt tháng nền móng.',
    rhythm: 'Ngày 1–5: ~17 từ/ngày (3 nhóm) · Ngày 6: kiểm tra tổng tháng 1 · Ngày 7: ôn toàn bộ SRS.',
    quizUnits: ['adjectives', 'feelings', 'feelings2'],
    tasks: [
      { id: 'w4-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Tính từ ứng dụng cao" (25 từ)', unitId: 'adjectives', pct: 100 },
      { id: 'w4-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cảm xúc & tính cách" (30 từ)', unitId: 'feelings', pct: 100 },
      { id: 'w4-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Cảm xúc & tính cách (mở rộng)" (28 từ)', unitId: 'feelings2', pct: 100 },
      gl(4, 1, 'e07'),
      pn(4, 'vowel-ae'),
      { id: 'w4-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w4-bank', kind: 'total', label: 'Kho từ đạt 700 — chốt tháng 1', targetTotal: 700 },
      { id: 'w4-video', kind: 'video', n: 2, label: 'Xem 2 video + bấm từ mới trong phụ đề để lưu thẻ' },
    ],
  },
  {
    week: 5, month: 2, phase: 'Compile', title: 'Động từ & câu đơn đầu tiên',
    focus: 'go, eat, see, do, have… và bắt đầu GHÉP CÂU: chủ ngữ + động từ + tân ngữ.',
    rhythm: 'Ngày 1–4: ~15 động từ/ngày (2 nhóm) · Ngày 5–6: tập mẫu câu + kiểm tra · Ngày 7: tự đặt câu.',
    quizUnits: ['verbs', 'verbs3'],
    patterns: [
      { pattern: 'I + động từ + …', vi: 'Nói điều mình làm', ex: 'I eat breakfast at seven.', exVi: 'Tôi ăn sáng lúc 7 giờ.' },
      { pattern: 'I want to + động từ', vi: 'Nói điều mình muốn', ex: 'I want to learn English.', exVi: 'Tôi muốn học tiếng Anh.' },
      { pattern: 'I need to + động từ', vi: 'Nói điều mình cần', ex: 'I need to buy some food.', exVi: 'Tôi cần mua ít đồ ăn.' },
      { pattern: "Let's + động từ", vi: 'Rủ ai đó cùng làm', ex: "Let's go to the park.", exVi: 'Mình ra công viên đi.' },
    ],
    tasks: [
      { id: 'w5-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Động từ cốt lõi" (30 từ)', unitId: 'verbs', pct: 100 },
      { id: 'w5-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Động từ hằng ngày (mở rộng)" (28 từ)', unitId: 'verbs3', pct: 100 },
      gl(5, 1, 'e03'),
      gl(5, 2, 'e04'),
      { id: 'w5-toeic', kind: 'toeic', n: 0, label: '🎯 Bắt đầu lộ trình TOEIC 60 ngày — ngày 1 thi thử đo điểm xuất phát' },
      { id: 'w5-pattern', kind: 'custom', label: 'Tự đặt 5 câu theo 4 mẫu câu của tuần (nói to lên!)', go: null },
      pn(5, 'th'),
      { id: 'w5-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w5-bank', kind: 'total', label: 'Kho từ đạt 1000', targetTotal: 1000 },
      { id: 'w5-review', kind: 'review', n: 3, label: 'Ôn tập SRS ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 6, month: 2, phase: 'Compile', title: 'Phủ định, Yes/No & cơ thể',
    focus: 'Động từ giao tiếp (ask, meet, pay…) + từ về cơ thể, sức khoẻ; nói "không", hỏi Yes/No, nhờ vả bằng can.',
    rhythm: 'Ngày 1–5: ~18 từ/ngày (3 nhóm) · Ngày 5: mẫu câu · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['verbs2', 'body', 'health2'],
    patterns: [
      { pattern: 'S + be + tính từ', vi: 'Mô tả bằng "be"', ex: 'She is very kind.', exVi: 'Cô ấy rất tốt bụng.' },
      { pattern: "I don't + động từ", vi: 'Nói điều mình KHÔNG làm', ex: "I don't like coffee.", exVi: 'Tôi không thích cà phê.' },
      { pattern: 'Do you + động từ?', vi: 'Hỏi Yes/No', ex: 'Do you speak English?', exVi: 'Bạn có nói tiếng Anh không?' },
      { pattern: 'Can you + động từ?', vi: 'Nhờ vả, hỏi khả năng', ex: 'Can you help me?', exVi: 'Bạn giúp tôi được không?' },
    ],
    tasks: [
      { id: 'w6-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Động từ giao tiếp & sinh hoạt" (31 từ)', unitId: 'verbs2', pct: 100 },
      { id: 'w6-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cơ thể & sức khoẻ" (30 từ)', unitId: 'body', pct: 100 },
      { id: 'w6-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Cơ thể & sức khoẻ (mở rộng)" (28 từ)', unitId: 'health2', pct: 100 },
      gl(6, 1, 'e08'),
      gl(6, 2, 'e12'),
      tk(6, 5),
      pn(6, 'end-ed'),
      { id: 'w6-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w6-bank', kind: 'total', label: 'Kho từ đạt 1300', targetTotal: 1300 },
      { id: 'w6-speak', kind: 'speak', label: 'Luyện nói 1 buổi — tập hỏi Yes/No với nhân vật AI' },
    ],
  },
  {
    week: 7, month: 2, phase: 'Compile', title: 'Hỏi đáp đời sống & công việc',
    focus: 'Giới từ & từ nối (in/on/at, because…) + từ công sở, trường lớp; hỏi thật: giá cả, đường đi, giờ giấc.',
    rhythm: 'Ngày 1–3: giới từ + từ giao tiếp · Ngày 4–5: từ công việc + mẫu câu hỏi · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['preps', 'worklife', 'communication'],
    patterns: [
      { pattern: 'What is …?', vi: 'Hỏi "cái gì"', ex: 'What is this called in English?', exVi: 'Cái này tiếng Anh gọi là gì?' },
      { pattern: 'Where is …?', vi: 'Hỏi đường, hỏi chỗ', ex: 'Where is the bathroom?', exVi: 'Nhà vệ sinh ở đâu?' },
      { pattern: 'How much …?', vi: 'Hỏi giá', ex: 'How much is this shirt?', exVi: 'Cái áo này bao nhiêu tiền?' },
      { pattern: 'What time …?', vi: 'Hỏi giờ giấc', ex: 'What time do you open?', exVi: 'Mấy giờ bên bạn mở cửa?' },
    ],
    tasks: [
      { id: 'w7-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Giới từ & từ nối" (22 từ)', unitId: 'preps', pct: 100 },
      { id: 'w7-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Công việc & học hành" (30 từ)', unitId: 'worklife', pct: 100 },
      { id: 'w7-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Giao tiếp & trò chuyện" (27 từ)', unitId: 'communication', pct: 100 },
      gl(7, 1, 'e09'),
      gl(7, 2, 'e14'),
      tk(7, 10),
      pn(7, 's-sh-ch'),
      { id: 'w7-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w7-bank', kind: 'total', label: 'Kho từ đạt 1650', targetTotal: 1650 },
      { id: 'w7-speak', kind: 'speak', label: 'Luyện nói: hỏi đường / gọi món / hỏi giá với AI' },
    ],
  },
  {
    week: 8, month: 2, phase: 'Compile', title: 'Mô tả, so sánh & thế giới quanh ta',
    focus: 'Trạng từ (very, too, always…) + thiên nhiên, du lịch; mô tả và so sánh — chốt tháng ghép câu.',
    rhythm: 'Ngày 1–3: trạng từ · Ngày 4–5: từ thiên nhiên + du lịch & khách sạn · Ngày 6: kiểm tra tổng tháng 2 · Ngày 7: xem video.',
    quizUnits: ['adverbs', 'nature', 'travel2'],
    patterns: [
      { pattern: "It's too + tính từ", vi: 'Chê "quá …"', ex: "It's too expensive.", exVi: 'Đắt quá.' },
      { pattern: 'tính từ + -er than', vi: 'So sánh hơn', ex: 'This one is cheaper than that one.', exVi: 'Cái này rẻ hơn cái kia.' },
      { pattern: 'as + tính từ + as', vi: 'So sánh bằng', ex: 'He is as tall as his father.', exVi: 'Cậu ấy cao bằng bố.' },
      { pattern: 'look / sound + tính từ', vi: 'Trông / nghe có vẻ', ex: 'You look happy today.', exVi: 'Hôm nay trông bạn vui thế.' },
    ],
    tasks: [
      { id: 'w8-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Trạng từ & tần suất" (22 từ)', unitId: 'adverbs', pct: 100 },
      { id: 'w8-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Thiên nhiên & du lịch" (30 từ)', unitId: 'nature', pct: 100 },
      { id: 'w8-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Du lịch & khách sạn" (27 từ)', unitId: 'travel2', pct: 100 },
      gl(8, 1, 'e11'),
      tk(8, 16),
      pn(8, 'v-f-b-p'),
      { id: 'w8-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w8-bank', kind: 'total', label: 'Kho từ đạt 2000 — chốt tháng 2, đã đi 2/3 chặng', targetTotal: 2000 },
      { id: 'w8-video', kind: 'video', n: 2, label: 'Xem 2 video, để ý cách người bản xứ mô tả đồ vật' },
    ],
  },
  {
    week: 9, month: 3, phase: 'Consolidate', title: 'Tổng ôn + cụm động từ',
    focus: 'Đã thuộc ~650 từ lõi — dồn sức ôn SRS, học cụm động từ (get up, look for…) và tiếp tục gom từ từ video.',
    rhythm: 'Mỗi ngày 10–15 phút SRS + ~5 cụm động từ + 1 video gom từ · Ngày 6: tổng kiểm tra · Ngày 7: xem video thư giãn.',
    quizUnits: ['nouns', 'family', 'people', 'verbs', 'verbs3', 'questions', 'adjectives', 'places', 'shopping', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'health2', 'timenum', 'numbers2', 'worklife', 'communication', 'foodshop', 'feelings', 'feelings2', 'nature', 'travel2'],
    tasks: [
      { id: 'w9-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Cụm động từ thông dụng" (28 cụm)', unitId: 'phrasal', pct: 100 },
      gl(9, 1, 'e15'),
      gl(9, 2, 'e18'),
      tk(9, 22),
      { id: 'w9-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      pn(9, 'l-n-r'),
      { id: 'w9-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w9-bank', kind: 'total', label: 'Kho từ đạt 2300', targetTotal: 2300 },
      { id: 'w9-custom', kind: 'custom', label: 'Viết 10 câu với những từ bạn hay quên nhất', go: null },
      { id: 'w9-video', kind: 'video', n: 2, label: 'Xem 2 video tiếng Anh không nhìn phụ đề lượt đầu' },
    ],
  },
  {
    week: 10, month: 3, phase: 'Consolidate', title: 'Nghe & nhại (shadowing)',
    focus: 'Luyện tai và miệng: nhại theo người bản xứ từng câu bằng tab Shadowing, kèm bộ cụm phản xạ nhanh.',
    rhythm: 'Mỗi ngày 1 video ngắn: nghe → nhại từng câu → chấm phát âm · Ngày 6: kiểm tra · Ngày 7: nghỉ tai.',
    quizUnits: ['phrasal', 'phrases', 'phrases2', 'verbs', 'verbs2', 'verbs3', 'body', 'communication', 'feelings', 'feelings2'],
    tasks: [
      { id: 'w10-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Cụm phản xạ nhanh" (30 cụm)', unitId: 'phrases2', pct: 100 },
      gl(10, 1, 'e16'),
      tk(10, 28),
      { id: 'w10-video', kind: 'video', n: 3, label: 'Shadowing 3 video (mở video → tab Shadowing/Phát âm)' },
      { id: 'w10-speak', kind: 'speak', label: 'Luyện nói 2 buổi với AI, cố nói cả câu dài' },
      pn(10, 'vowel-o'),
      { id: 'w10-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w10-bank', kind: 'total', label: 'Kho từ đạt 2550', targetTotal: 2550 },
      { id: 'w10-review', kind: 'review', n: 3, label: 'Duy trì SRS ít nhất 3 ngày' },
    ],
  },
  {
    week: 11, month: 3, phase: 'Consolidate', title: 'Hội thoại theo chủ đề',
    focus: 'Áp dụng tất cả vào tình huống thật: du lịch, mua sắm, công việc, phỏng vấn — kèm bộ cụm từ đi cùng nhau (make a decision, take a break…).',
    rhythm: 'Cách ngày 1 buổi luyện nói chủ đề khác nhau · xen kẽ video · Ngày 7: kiểm tra.',
    quizUnits: ['collocations', 'travel2', 'shopping', 'worklife', 'communication', 'places', 'foodshop', 'preps', 'adverbs', 'nature'],
    tasks: [
      { id: 'w11-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Cụm từ đi cùng nhau" (26 cụm)', unitId: 'collocations', pct: 100 },
      gl(11, 1, 'e17'),
      tk(11, 34),
      { id: 'w11-speak', kind: 'speak', label: 'Hoàn thành 3 tình huống Luyện nói (du lịch / mua sắm / công việc)' },
      { id: 'w11-video', kind: 'video', n: 2, label: 'Xem 2 video đúng chủ đề bạn vừa luyện nói' },
      pn(11, 'stress'),
      { id: 'w11-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w11-bank', kind: 'total', label: 'Kho từ đạt 2800', targetTotal: 2800 },
      { id: 'w11-review', kind: 'review', n: 3, label: 'Duy trì SRS ít nhất 3 ngày' },
    ],
  },
  {
    week: 12, month: 3, phase: 'Consolidate', title: 'Tổng kết & tốt nghiệp',
    focus: 'Chạm mốc 3000 từ, bài tổng kết cuối lộ trình, xuất bộ từ ra Word/PDF và tự tin nói chuyện với AI.',
    rhythm: 'Ngày 1–3: ôn điểm yếu + gom nốt từ · Ngày 4: bài tổng kết · Ngày 5–6: hội thoại tự do · Ngày 7: 🎓.',
    quizUnits: ['nouns', 'family', 'people', 'verbs', 'verbs2', 'verbs3', 'questions', 'adjectives', 'places', 'shopping', 'adverbs', 'preps', 'phrases', 'phrases2', 'phrasal', 'collocations', 'body', 'health2', 'timenum', 'numbers2', 'worklife', 'communication', 'foodshop', 'feelings', 'feelings2', 'nature', 'travel2'],
    tasks: [
      { id: 'w12-bank', kind: 'total', label: '🎯 KHO TỪ ĐẠT 3000 — mục tiêu lớn của cả lộ trình', targetTotal: 3000 },
      { id: 'w12-grammar', kind: 'grammar', label: 'Hoàn thành cả 18 bài Ngữ pháp giao tiếp' },
      tk(12, 40),
      pn(12, 'linking'),
      { id: 'w12-quiz', kind: 'quiz', label: 'Bài tổng kết cuối lộ trình đạt từ 80%', passPct: 80 },
      { id: 'w12-speak', kind: 'speak', label: 'Trò chuyện tự do 10 phút với AI, không nhìn gợi ý' },
      { id: 'w12-export', kind: 'custom', label: 'Xuất bộ từ đã thuộc ra Word/PDF làm "bằng chứng" 3 tháng', go: 'summary' },
      { id: 'w12-review', kind: 'review', n: 1, label: 'Ôn SRS lần cuối — hẹn lịch ôn duy trì mỗi tuần' },
    ],
  },
]

export const PLAN_TASK_TOTAL = PLAN_12_WEEKS.reduce((s, w) => s + w.tasks.length, 0)
