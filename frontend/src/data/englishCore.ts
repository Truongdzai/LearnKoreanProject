import { GRAMMAR_LESSONS } from './englishGrammarData'
import { PRON_PASS } from './englishPronunciation'
import { PRON_GROUPS } from './englishPronunciationData'
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
import nouns5 from './english/units/nouns5.json'
import verbs10 from './english/units/verbs10.json'
import verbs11 from './english/units/verbs11.json'
import adjectives9 from './english/units/adjectives9.json'

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
  nouns5, verbs10, verbs11, adjectives9,
] as unknown as VocabUnit[]

export const ALL_WORDS: IcesWord[] = UNITS.flatMap((u) => u.words)

export const TARGET_WORDS = 3000

import { type WeekTask, type WeekPlan } from './vocabCore'

export type { WeekTaskKind, WeekTaskGo, WeekTask, SentencePattern, WeekPlan } from './vocabCore'

const gl = (week: number, seq: number, lessonId: string): WeekTask => {
  const l = GRAMMAR_LESSONS.find((x) => x.id === lessonId)
  return { id: `w${week}-g${seq}`, kind: 'grammar', lessonId, label: `Ngữ pháp: ${l?.title ?? lessonId} (luyện đạt ≥ 3/4 câu)` }
}

const tk = (week: number, n: number): WeekTask =>
  ({ id: `w${week}-toeic`, kind: 'toeic', n, label: `TOEIC: hoàn thành ≥ ${n}/60 ngày lộ trình` })

const pn = (week: number, groupId: string, seq?: number): WeekTask => {
  const g = PRON_GROUPS.find((x) => x.id === groupId)
  return {
    id: seq ? `w${week}-pron${seq}` : `w${week}-pron`,
    kind: 'pron',
    groupId,
    label: `Phát âm: ${g?.title ?? groupId} (kiểm tra đạt ≥ ${PRON_PASS}%)`,
  }
}

export const PLAN_12_WEEKS: WeekPlan[] = [
  {
    week: 1, month: 1, phase: 'Compress', title: 'Danh từ & người quanh ta',
    focus: 'Người, gia đình, đồ vật quen thuộc — nền móng của mọi câu nói, cộng thói quen gom từ mỗi ngày.',
    rhythm: 'Ngày 1–6: ~12 từ lõi/ngày (3 nhóm) + gom thêm từ qua video · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS.',
    quizUnits: ['nouns', 'family', 'people'],
    patterns: [
      { pattern: 'This is + danh từ', vi: 'Giới thiệu người, đồ vật', ex: 'This is my mother.', exVi: 'Đây là mẹ tôi.' },
      { pattern: 'I have + danh từ', vi: 'Nói mình có gì', ex: 'I have two brothers.', exVi: 'Tôi có hai anh em trai.' },
      { pattern: 'My + danh từ + is …', vi: 'Nói về người/đồ của mình', ex: 'My father is a teacher.', exVi: 'Bố tôi là giáo viên.' },
      { pattern: 'Who is …?', vi: 'Hỏi ai đó là ai', ex: 'Who is that man?', exVi: 'Người đàn ông kia là ai vậy?' },
    ],
    tasks: [
      { id: 'w1-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Danh từ cốt lõi" (32 từ)', unitId: 'nouns', pct: 100 },
      { id: 'w1-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Gia đình & họ hàng" (26 từ)', unitId: 'family', pct: 100 },
      { id: 'w1-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Người quanh ta" (24 từ)', unitId: 'people', pct: 100 },
      gl(1, 1, 'e01'),
      gl(1, 2, 'e02'),
      pn(1, 'end-stop'),
      { id: 'w1-pattern', kind: 'custom', label: 'Tự đặt 5 câu theo mẫu câu của tuần (nói to lên!)', go: null },
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
    patterns: [
      { pattern: 'I want + danh từ', vi: 'Gọi món, mua đồ', ex: 'I want a coffee, please.', exVi: 'Cho tôi một cà phê.' },
      { pattern: 'Can I have …?', vi: 'Xin / gọi lịch sự', ex: 'Can I have the menu, please?', exVi: 'Cho tôi xin thực đơn được không?' },
      { pattern: 'Is there a … near here?', vi: 'Hỏi có chỗ nào gần đây', ex: 'Is there a bank near here?', exVi: 'Gần đây có ngân hàng không?' },
      { pattern: "I'm going to + nơi chốn", vi: 'Nói mình đi đâu', ex: "I'm going to the market.", exVi: 'Tôi đi chợ đây.' },
    ],
    tasks: [
      { id: 'w2-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Nơi chốn & đời sống" (32 từ)', unitId: 'places', pct: 100 },
      { id: 'w2-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Ăn uống & mua sắm" (30 từ)', unitId: 'foodshop', pct: 100 },
      { id: 'w2-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Mua sắm & tiền bạc" (28 từ)', unitId: 'shopping', pct: 100 },
      gl(2, 1, 'e05'),
      gl(2, 2, 'e06'),
      pn(2, 'end-s'),
      { id: 'w2-pattern', kind: 'custom', label: 'Tự đặt 5 câu theo mẫu câu của tuần (nói to lên!)', go: null },
      { id: 'w2-video', kind: 'video', n: 2, label: 'Xem 2 video dễ về ăn uống/mua sắm + bấm từ mới trong phụ đề để lưu' },
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
    patterns: [
      { pattern: 'What time …?', vi: 'Hỏi giờ giấc', ex: 'What time is it now?', exVi: 'Bây giờ mấy giờ rồi?' },
      { pattern: 'When is …?', vi: 'Hỏi khi nào', ex: 'When is your birthday?', exVi: 'Sinh nhật bạn khi nào?' },
      { pattern: 'Where are you from?', vi: 'Hỏi quê quán, làm quen', ex: 'Where are you from?', exVi: 'Bạn đến từ đâu?' },
      { pattern: 'See you + thời gian', vi: 'Hẹn gặp lại', ex: 'See you on Monday.', exVi: 'Hẹn gặp thứ Hai nhé.' },
    ],
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
    patterns: [
      { pattern: "I'm + tính từ", vi: 'Nói cảm xúc của mình', ex: "I'm so happy today.", exVi: 'Hôm nay tôi vui lắm.' },
      { pattern: "It's + tính từ", vi: 'Nhận xét nhanh', ex: "It's delicious!", exVi: 'Ngon quá!' },
      { pattern: "That's + tính từ", vi: 'Phản hồi khi nghe chuyện', ex: "That's great!", exVi: 'Tuyệt vời!' },
      { pattern: 'I feel + tính từ', vi: 'Tả cảm giác trong người', ex: 'I feel tired.', exVi: 'Tôi thấy mệt.' },
    ],
    tasks: [
      { id: 'w4-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Tính từ ứng dụng cao" (25 từ)', unitId: 'adjectives', pct: 100 },
      { id: 'w4-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cảm xúc & tính cách" (30 từ)', unitId: 'feelings', pct: 100 },
      { id: 'w4-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Cảm xúc & tính cách (mở rộng)" (28 từ)', unitId: 'feelings2', pct: 100 },
      gl(4, 1, 'e07'),
      pn(4, 'vowel-ae'),
      { id: 'w4-pattern', kind: 'custom', label: 'Tự đặt 5 câu theo mẫu câu của tuần (nói to lên!)', go: null },
      { id: 'w4-read', kind: 'custom', label: 'Đọc lại phụ đề song ngữ 1 video đã xem — đọc hiểu từng câu, không bật tiếng', go: 'library' },
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
      { id: 'w5-deep', kind: 'deep', n: 3, label: 'Học sâu 3 động từ nhiều nghĩa (take, get, go…) — nắm đủ mọi nghĩa' },
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
      { id: 'w6-video', kind: 'video', n: 2, label: 'Xem 2 video, để ý câu phủ định và câu hỏi Yes/No trong phụ đề' },
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
      { id: 'w7-write', kind: 'custom', label: 'Viết 1 email/tin nhắn ngắn (3–5 câu): chào, hỏi thông tin, cảm ơn', go: null },
      { id: 'w7-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w7-bank', kind: 'total', label: 'Kho từ đạt 1650', targetTotal: 1650 },
      { id: 'w7-deep', kind: 'deep', n: 8, label: 'Nâng lên 8 từ nắm đủ nghĩa — ưu tiên từ bạn hay đoán sai nghĩa' },
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
      { id: 'w9-deep', kind: 'deep', n: 15, label: 'Nâng lên 15 từ nắm đủ nghĩa — cụm động từ tuần này là mỏ vàng' },
      { id: 'w9-custom', kind: 'custom', label: 'Viết 10 câu với những từ bạn hay quên nhất', go: null },
      { id: 'w9-read', kind: 'custom', label: 'Đọc 2 bài đọc ngắn trong TOEIC Part 7, tra và lưu từ mới', go: null },
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
      { id: 'w10-dictation', kind: 'custom', label: 'Chép chính tả 1 video ngắn (mở video → tab Chép chính tả)', go: 'library' },
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
      { id: 'w11-write', kind: 'custom', label: 'Viết 1 email công việc 5–7 câu (xin nghỉ, hẹn họp, hỏi giá) rồi đọc to lên', go: null },
      { id: 'w11-video', kind: 'video', n: 2, label: 'Xem 2 video đúng chủ đề bạn vừa luyện nói' },
      pn(11, 'stress'),
      { id: 'w11-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w11-bank', kind: 'total', label: 'Kho từ đạt 2800', targetTotal: 2800 },
      { id: 'w11-deep', kind: 'deep', n: 25, label: 'Nâng lên 25 từ nắm đủ nghĩa — đủ để nghe hiểu không còn hụt vì nghĩa lạ' },
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
      pn(12, 'rhythm', 2),
      { id: 'w12-quiz', kind: 'quiz', label: 'Bài tổng kết cuối lộ trình đạt từ 80%', passPct: 80 },
      { id: 'w12-speak', kind: 'speak', label: 'Trò chuyện tự do 10 phút với AI, không nhìn gợi ý' },
      { id: 'w12-write', kind: 'custom', label: 'Viết đoạn 8–10 câu giới thiệu bản thân — so với ngày 1 để thấy mình đã đi xa', go: null },
      { id: 'w12-export', kind: 'custom', label: 'Xuất bộ từ đã thuộc ra Word/PDF làm "bằng chứng" 3 tháng', go: 'summary' },
      { id: 'w12-review', kind: 'review', n: 1, label: 'Ôn SRS lần cuối — hẹn lịch ôn duy trì mỗi tuần' },
    ],
  },
]

export const PLAN_TASK_TOTAL = PLAN_12_WEEKS.reduce((s, w) => s + w.tasks.length, 0)

export type RoadmapMode = 'lite' | 'boot'

const bv = (week: number, seq: number, unitId: string, name: string): WeekTask =>
  ({ id: `bw${week}-v${seq}`, kind: 'vocab', unitId, pct: 100, label: `Thuộc toàn bộ "${name}"` })

const bgl = (week: number, seq: number, lessonId: string): WeekTask => {
  const l = GRAMMAR_LESSONS.find((x) => x.id === lessonId)
  return { id: `bw${week}-g${seq}`, kind: 'grammar', lessonId, label: `Ngữ pháp: ${l?.title ?? lessonId} (luyện đạt ≥ 3/4 câu)` }
}

const bpn = (week: number, seq: number, groupId: string): WeekTask => {
  const g = PRON_GROUPS.find((x) => x.id === groupId)
  return { id: `bw${week}-p${seq}`, kind: 'pron', groupId, label: `Phát âm: ${g?.title ?? groupId} (kiểm tra đạt ≥ ${PRON_PASS}%)` }
}

const btk = (week: number, n: number): WeekTask =>
  ({ id: `bw${week}-toeic`, kind: 'toeic', n, label: `TOEIC: hoàn thành ≥ ${n}/60 ngày lộ trình` })

export const PLAN_12_WEEKS_BOOT: WeekPlan[] = [
  {
    week: 1, month: 1, phase: 'Compress', title: 'Bắt đầu từ số 0 — người quanh ta',
    focus: 'Dành cho cả người mất gốc: 142 từ đầu tiên về người & vật quen thuộc, 3 bài ngữ pháp nền và sửa âm ngay từ ngày 1 — âm sai để 90 ngày sau sửa sẽ đắt gấp mười.',
    rhythm: 'Mỗi ngày ~7,5 giờ: 2h từ mới (2 nhóm) · 1h ôn SRS · 1h ngữ pháp · 1h phát âm · 1,5h nghe video dễ có phụ đề · 1h nói theo mẫu câu. Ngày 6: kiểm tra · Ngày 7: ôn + nghỉ nửa ngày.',
    quizUnits: ['nouns', 'family', 'people', 'verbs', 'questions', 'phrases'],
    patterns: [
      { pattern: 'I am + tên / nghề', vi: 'Giới thiệu mình', ex: 'I am Minh. I am a student.', exVi: 'Tôi là Minh. Tôi là sinh viên.' },
      { pattern: 'My name is …', vi: 'Nói tên', ex: 'My name is Lan.', exVi: 'Tên tôi là Lan.' },
      { pattern: 'This is + danh từ', vi: 'Giới thiệu người, đồ vật', ex: 'This is my family.', exVi: 'Đây là gia đình tôi.' },
      { pattern: 'I have + danh từ', vi: 'Nói mình có gì', ex: 'I have a question.', exVi: 'Tôi có một câu hỏi.' },
    ],
    tasks: [
      bv(1, 1, 'nouns', 'Danh từ cốt lõi'),
      bv(1, 2, 'family', 'Gia đình & họ hàng'),
      bv(1, 3, 'people', 'Người quanh ta'),
      bv(1, 4, 'verbs', 'Động từ cốt lõi'),
      bv(1, 5, 'questions', 'Từ để hỏi (5W1H)'),
      bv(1, 6, 'phrases', 'Cụm giao tiếp hằng ngày'),
      bgl(1, 1, 'e01'), bgl(1, 2, 'e02'), bgl(1, 3, 'e03'),
      bpn(1, 1, 'end-stop'), bpn(1, 2, 'th'),
      { id: 'bw1-speak', kind: 'speak', label: 'Luyện nói 3 buổi với AI: chào hỏi, tự giới thiệu (dùng mẫu câu tuần, nói to)' },
      { id: 'bw1-video', kind: 'video', n: 5, label: 'Xem 5 video tiếng Anh dễ + bấm từ mới trong phụ đề để lưu' },
      { id: 'bw1-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw1-bank', kind: 'total', label: 'Kho từ đạt 250', targetTotal: 250 },
      { id: 'bw1-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 75%', passPct: 75 },
    ],
  },
  {
    week: 2, month: 1, phase: 'Compress', title: 'Sinh tồn: ăn uống, mua sắm, con số',
    focus: 'Bộ từ "ra đường được": nơi chốn, gọi món, hỏi giá, số đếm, giờ giấc — kèm 3 bài ngữ pháp và thói quen chép chính tả đầu tiên.',
    rhythm: 'Giữ khung ~7,5 giờ/ngày như tuần 1, thêm 30 phút chép chính tả thay bớt giờ nghe tự do. Ngày 6: kiểm tra · Ngày 7: ôn + nghỉ nửa ngày.',
    quizUnits: ['places', 'foodshop', 'shopping', 'verbs2', 'timenum', 'numbers2'],
    patterns: [
      { pattern: 'I want to + động từ', vi: 'Nói điều mình muốn', ex: 'I want to buy this.', exVi: 'Tôi muốn mua cái này.' },
      { pattern: 'Can I have …?', vi: 'Xin / gọi lịch sự', ex: 'Can I have the bill, please?', exVi: 'Cho tôi xin hoá đơn.' },
      { pattern: 'How much is …?', vi: 'Hỏi giá', ex: 'How much is this shirt?', exVi: 'Cái áo này bao nhiêu tiền?' },
      { pattern: 'Where is …?', vi: 'Hỏi chỗ', ex: 'Where is the elevator?', exVi: 'Thang máy ở đâu?' },
    ],
    tasks: [
      bv(2, 1, 'places', 'Nơi chốn & đời sống'),
      bv(2, 2, 'foodshop', 'Ăn uống & mua sắm'),
      bv(2, 3, 'shopping', 'Mua sắm & tiền bạc'),
      bv(2, 4, 'verbs2', 'Động từ giao tiếp & sinh hoạt'),
      bv(2, 5, 'timenum', 'Số đếm & thời gian'),
      bv(2, 6, 'numbers2', 'Số đếm & thứ tự (mở rộng)'),
      bgl(2, 1, 'e04'), bgl(2, 2, 'e05'), bgl(2, 3, 'e06'),
      bpn(2, 1, 'end-s'), bpn(2, 2, 'vowel-i'),
      { id: 'bw2-dict', kind: 'custom', label: 'Chép chính tả 2 video ngắn (mở video → tab Chép chính tả)', go: 'library' },
      { id: 'bw2-speak', kind: 'speak', label: 'Luyện nói 3 buổi: gọi món, hỏi giá, mặc cả' },
      { id: 'bw2-video', kind: 'video', n: 5, label: 'Xem 5 video dễ + lưu từ mới từ phụ đề' },
      { id: 'bw2-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw2-bank', kind: 'total', label: 'Kho từ đạt 550', targetTotal: 550 },
      { id: 'bw2-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 75%', passPct: 75 },
    ],
  },
  {
    week: 3, month: 1, phase: 'Compress', title: 'Mô tả, cảm xúc & cơ thể',
    focus: 'Nói được mình thấy gì, cảm thấy gì, đau ở đâu — và bắt đầu viết: 10 câu tả bản thân & gia đình bằng chính từ vừa học.',
    rhythm: 'Khung 7,5 giờ/ngày · dời 30 phút cuối ngày sang viết tay 2–3 câu. Ngày 6: kiểm tra (chuẩn nâng lên 80%) · Ngày 7: ôn + nghỉ nửa ngày.',
    quizUnits: ['adjectives', 'feelings', 'feelings2', 'verbs3', 'body', 'health2'],
    patterns: [
      { pattern: "I like / don't like + N", vi: 'Thích & không thích', ex: "I like coffee but I don't like tea.", exVi: 'Tôi thích cà phê nhưng không thích trà.' },
      { pattern: 'I feel + tính từ', vi: 'Tả cảm giác', ex: 'I feel tired today.', exVi: 'Hôm nay tôi thấy mệt.' },
      { pattern: 'You look + tính từ', vi: 'Nhận xét về người khác', ex: 'You look happy!', exVi: 'Trông bạn vui thế!' },
      { pattern: 'My + bộ phận + hurts', vi: 'Nói chỗ đau', ex: 'My head hurts.', exVi: 'Tôi đau đầu.' },
    ],
    tasks: [
      bv(3, 1, 'adjectives', 'Tính từ ứng dụng cao'),
      bv(3, 2, 'feelings', 'Cảm xúc & tính cách'),
      bv(3, 3, 'feelings2', 'Cảm xúc & tính cách (mở rộng)'),
      bv(3, 4, 'verbs3', 'Động từ hằng ngày (mở rộng)'),
      bv(3, 5, 'body', 'Cơ thể & sức khoẻ'),
      bv(3, 6, 'health2', 'Cơ thể & sức khoẻ (mở rộng)'),
      bgl(3, 1, 'e07'), bgl(3, 2, 'e08'),
      bpn(3, 1, 'vowel-ae'), bpn(3, 2, 'end-ed'),
      { id: 'bw3-write', kind: 'custom', label: 'Viết 10 câu tả bản thân & gia đình bằng từ đã học', go: null },
      { id: 'bw3-speak', kind: 'speak', label: 'Luyện nói 4 buổi: tả người thân, kể một ngày của bạn, nói cảm xúc' },
      { id: 'bw3-video', kind: 'video', n: 5, label: 'Xem 5 video, thử 2 video che phần dịch tiếng Việt' },
      { id: 'bw3-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw3-bank', kind: 'total', label: 'Kho từ đạt 900', targetTotal: 900 },
      { id: 'bw3-deep', kind: 'deep', n: 5, label: 'Học sâu 5 từ nhiều nghĩa nhất — nắm đủ mọi nghĩa, không chỉ nghĩa đầu' },
      { id: 'bw3-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 80%', passPct: 80 },
    ],
  },
  {
    week: 4, month: 1, phase: 'Compress', title: 'Ghép câu dài + TOEIC khởi động',
    focus: 'Giới từ, trạng từ, từ nối — chất keo dán câu ngắn thành câu dài. Giữa tuần: thi thử TOEIC đo điểm xuất phát, bắt đầu lộ trình 60 ngày.',
    rhythm: 'Khung 7,5 giờ/ngày · thêm 45 phút TOEIC mỗi ngày (thay bớt giờ video). Tối nào cũng viết nhật ký 5 câu. Ngày 6: kiểm tra · Ngày 7: ôn + nghỉ.',
    quizUnits: ['preps', 'adverbs', 'communication', 'time2', 'directions', 'connectors'],
    patterns: [
      { pattern: 'What do you + động từ?', vi: 'Hỏi về thói quen', ex: 'What do you do on weekends?', exVi: 'Cuối tuần bạn hay làm gì?' },
      { pattern: 'I usually + động từ', vi: 'Kể thói quen', ex: 'I usually get up at six.', exVi: 'Tôi thường dậy lúc 6 giờ.' },
      { pattern: '… because …', vi: 'Nói lý do', ex: "I'm learning English because I want a better job.", exVi: 'Tôi học tiếng Anh vì muốn công việc tốt hơn.' },
      { pattern: "Let's + động từ", vi: 'Rủ rê', ex: "Let's practice together.", exVi: 'Mình luyện cùng nhau đi.' },
    ],
    tasks: [
      bv(4, 1, 'preps', 'Giới từ & từ nối'),
      bv(4, 2, 'adverbs', 'Trạng từ & tần suất'),
      bv(4, 3, 'communication', 'Giao tiếp & trò chuyện'),
      bv(4, 4, 'time2', 'Thời gian (mở rộng)'),
      bv(4, 5, 'directions', 'Chỉ đường & vị trí'),
      bv(4, 6, 'connectors', 'Từ nối & liên kết câu'),
      bgl(4, 1, 'e09'), bgl(4, 2, 'e10'),
      bpn(4, 1, 's-sh-ch'), bpn(4, 2, 'v-f-b-p'),
      { id: 'bw4-toeic', kind: 'toeic', n: 0, label: '🎯 Bắt đầu lộ trình TOEIC 60 ngày — ngày 1 thi thử đo điểm xuất phát' },
      { id: 'bw4-write', kind: 'custom', label: 'Viết nhật ký 5 câu mỗi tối (đủ 7 tối)', go: null },
      { id: 'bw4-speak', kind: 'speak', label: 'Luyện nói 4 buổi: hỏi đường, hẹn lịch, kể thói quen' },
      { id: 'bw4-video', kind: 'video', n: 5, label: 'Xem 5 video + lưu từ mới' },
      { id: 'bw4-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw4-bank', kind: 'total', label: 'Kho từ đạt 1250 — chốt tháng 1', targetTotal: 1250 },
      { id: 'bw4-quiz', kind: 'quiz', label: 'Kiểm tra tổng tháng 1 đạt từ 80%', passPct: 80 },
    ],
  },
  {
    week: 5, month: 2, phase: 'Compile', title: 'Nhà cửa, công nghệ & đời sống',
    focus: 'Từ vựng quanh chỗ ở và món đồ dùng hằng ngày; lần đầu xem video KHÔNG phụ đề lượt đầu — tai bắt đầu tự bơi.',
    rhythm: 'Khung 7,5 giờ/ngày: 1,5h từ mới · 1h SRS · 45ph TOEIC · 45ph ngữ pháp + phát âm · 2h nghe (1 video không phụ đề lượt đầu) · 1h nói · 30ph chép chính tả.',
    quizUnits: ['home', 'house2', 'tech', 'clothing', 'colors', 'weather2'],
    patterns: [
      { pattern: 'There is / There are', vi: 'Tả có gì ở đâu', ex: 'There are two windows in my room.', exVi: 'Phòng tôi có hai cửa sổ.' },
      { pattern: 'Where do you live?', vi: 'Hỏi & kể chỗ ở', ex: 'I live in Da Nang with my parents.', exVi: 'Tôi sống ở Đà Nẵng cùng bố mẹ.' },
      { pattern: 'My favorite … is …', vi: 'Nói món ưa thích', ex: 'My favorite app is YouTube.', exVi: 'Ứng dụng tôi thích nhất là YouTube.' },
      { pattern: "What's the weather like?", vi: 'Hỏi thời tiết', ex: "What's the weather like today?", exVi: 'Hôm nay thời tiết thế nào?' },
    ],
    tasks: [
      bv(5, 1, 'home', 'Nhà cửa & đồ đạc'),
      bv(5, 2, 'house2', 'Trong nhà (mở rộng)'),
      bv(5, 3, 'tech', 'Công nghệ & thiết bị'),
      bv(5, 4, 'clothing', 'Quần áo & phụ kiện'),
      bv(5, 5, 'colors', 'Màu sắc'),
      bv(5, 6, 'weather2', 'Thời tiết'),
      bgl(5, 1, 'e11'), bgl(5, 2, 'e12'),
      bpn(5, 1, 'l-n-r'), bpn(5, 2, 'vowel-o'),
      btk(5, 7),
      { id: 'bw5-dict', kind: 'custom', label: 'Chép chính tả 3 video ngắn', go: 'library' },
      { id: 'bw5-speak', kind: 'speak', label: 'Luyện nói 4 buổi: tả nhà, tả đồ vật, nói về thời tiết' },
      { id: 'bw5-video', kind: 'video', n: 6, label: 'Xem 6 video, 2 video xem không phụ đề lượt đầu' },
      { id: 'bw5-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw5-bank', kind: 'total', label: 'Kho từ đạt 1600', targetTotal: 1600 },
      { id: 'bw5-deep', kind: 'deep', n: 15, label: 'Nâng lên 15 từ nắm đủ nghĩa (mỗi ngày 2 từ ở trang Học sâu)' },
      { id: 'bw5-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 80%', passPct: 80 },
    ],
  },
  {
    week: 6, month: 2, phase: 'Compile', title: 'Công việc & trường lớp — xong 13 nhóm âm',
    focus: 'Từ vựng đi làm, đi học + phỏng vấn thử với AI. Hoàn thành nốt 3 nhóm âm cuối (trọng âm, nối âm, nhịp điệu lời nói) — từ đây phát âm đủ bộ.',
    rhythm: 'Khung 7,5 giờ/ngày · khối nói tăng lên 1,5h (có buổi phỏng vấn thử) · viết 3 email trong tuần. Ngày 6: kiểm tra (chuẩn 85%) · Ngày 7: ôn + nghỉ.',
    quizUnits: ['worklife', 'office', 'school', 'education', 'jobs', 'computing'],
    patterns: [
      { pattern: 'I work as / at …', vi: 'Nói nghề & chỗ làm', ex: 'I work as a designer at a small company.', exVi: 'Tôi làm thiết kế ở một công ty nhỏ.' },
      { pattern: "I'm working on …", vi: 'Nói việc đang làm', ex: "I'm working on a new project.", exVi: 'Tôi đang làm một dự án mới.' },
      { pattern: 'Could you + động từ?', vi: 'Nhờ vả lịch sự', ex: 'Could you send me the file?', exVi: 'Bạn gửi tôi file đó được không?' },
      { pattern: "I'll + động từ", vi: 'Hứa / nhận việc', ex: "I'll finish it by Friday.", exVi: 'Tôi sẽ xong trước thứ Sáu.' },
    ],
    tasks: [
      bv(6, 1, 'worklife', 'Công việc & học hành'),
      bv(6, 2, 'office', 'Văn phòng & công sở'),
      bv(6, 3, 'school', 'Trường lớp'),
      bv(6, 4, 'education', 'Giáo dục & học tập'),
      bv(6, 5, 'jobs', 'Nghề nghiệp'),
      bv(6, 6, 'computing', 'Máy tính & internet'),
      bgl(6, 1, 'e13'), bgl(6, 2, 'e14'),
      bpn(6, 1, 'stress'), bpn(6, 2, 'linking'), bpn(6, 3, 'rhythm'),
      btk(6, 14),
      { id: 'bw6-write', kind: 'custom', label: 'Viết 3 email: xin việc đơn giản, hỏi thông tin, cảm ơn', go: null },
      { id: 'bw6-speak', kind: 'speak', label: 'Luyện nói 4 buổi, trong đó 1 buổi phỏng vấn xin việc thử với AI' },
      { id: 'bw6-video', kind: 'video', n: 6, label: 'Xem 6 video chủ đề công việc / học tập' },
      { id: 'bw6-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw6-bank', kind: 'total', label: 'Kho từ đạt 1950', targetTotal: 1950 },
      { id: 'bw6-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 85%', passPct: 85 },
    ],
  },
  {
    week: 7, month: 2, phase: 'Compile', title: 'Du lịch & ẩm thực — tình huống thật',
    focus: 'Đưa mọi thứ vào tình huống có thật: sân bay, khách sạn, nhà hàng, hỏi đường — mỗi ngày một màn kịch với AI.',
    rhythm: 'Khung 7,5 giờ/ngày · mỗi ngày 1 tình huống Luyện nói khác nhau · 30ph đọc lại phụ đề song ngữ như bài đọc. Ngày 6: kiểm tra · Ngày 7: ôn + nghỉ.',
    quizUnits: ['travel2', 'transport', 'airport', 'city', 'restaurant', 'cooking'],
    patterns: [
      { pattern: "I'd like to + động từ", vi: 'Yêu cầu lịch sự', ex: "I'd like to check in, please.", exVi: 'Tôi muốn nhận phòng.' },
      { pattern: 'How do I get to …?', vi: 'Hỏi đường', ex: 'How do I get to the train station?', exVi: 'Đến ga tàu đi thế nào ạ?' },
      { pattern: 'Have you ever …?', vi: 'Hỏi trải nghiệm', ex: 'Have you ever tried pho?', exVi: 'Bạn ăn thử phở bao giờ chưa?' },
      { pattern: 'Can you recommend …?', vi: 'Xin gợi ý', ex: 'Can you recommend a good restaurant?', exVi: 'Bạn gợi ý cho tôi một nhà hàng ngon nhé?' },
    ],
    tasks: [
      bv(7, 1, 'travel2', 'Du lịch & khách sạn'),
      bv(7, 2, 'transport', 'Phương tiện đi lại'),
      bv(7, 3, 'airport', 'Sân bay & chuyến bay'),
      bv(7, 4, 'city', 'Thành phố & tiện ích'),
      bv(7, 5, 'restaurant', 'Nhà hàng & gọi món'),
      bv(7, 6, 'cooking', 'Nấu nướng & bếp núc'),
      bgl(7, 1, 'e15'), bgl(7, 2, 'e16'),
      btk(7, 21),
      { id: 'bw7-read', kind: 'custom', label: 'Đọc lại phụ đề song ngữ 2 video như bài đọc + chép chính tả 2 video', go: 'library' },
      { id: 'bw7-speak', kind: 'speak', label: 'Hoàn thành 5 tình huống Luyện nói: sân bay, khách sạn, gọi món, hỏi đường, mặc cả' },
      { id: 'bw7-video', kind: 'video', n: 6, label: 'Xem 6 video du lịch / ẩm thực, 2 video không phụ đề lượt đầu' },
      { id: 'bw7-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw7-bank', kind: 'total', label: 'Kho từ đạt 2300', targetTotal: 2300 },
      { id: 'bw7-deep', kind: 'deep', n: 30, label: 'Nâng lên 30 từ nắm đủ nghĩa — gồm cả cụm động từ tuần này' },
      { id: 'bw7-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 85%', passPct: 85 },
    ],
  },
  {
    week: 8, month: 2, phase: 'Compile', title: 'Nói tự nhiên: cụm động từ & thành ngữ',
    focus: 'get up, look for, make a decision… — thứ khiến câu nghe "ra chất Anh". Hoàn thành cả 18 bài ngữ pháp, chốt tháng 2.',
    rhythm: 'Khung 7,5 giờ/ngày · shadowing tăng lên 1,5h (nhại từng câu, thu âm nghe lại) · viết đoạn văn dài đầu tiên. Ngày 6: kiểm tra tổng tháng 2 · Ngày 7: ôn + nghỉ.',
    quizUnits: ['phrasal', 'phrasal2', 'collocations', 'idioms', 'prepphrases', 'irregular'],
    patterns: [
      { pattern: 'It takes + thời gian', vi: 'Nói mất bao lâu', ex: 'It takes 30 minutes to get there.', exVi: 'Đến đó mất 30 phút.' },
      { pattern: "I'm looking for …", vi: 'Đang tìm gì đó', ex: "I'm looking for a new job.", exVi: 'Tôi đang tìm việc mới.' },
      { pattern: 'động từ + up / out / on', vi: 'Cụm động từ trong câu', ex: 'I wake up at six and work out.', exVi: 'Tôi dậy lúc 6 giờ rồi tập thể dục.' },
      { pattern: "I've been + V-ing", vi: 'Việc kéo dài đến giờ', ex: "I've been learning English for two months.", exVi: 'Tôi học tiếng Anh được hai tháng rồi.' },
    ],
    tasks: [
      bv(8, 1, 'phrasal', 'Cụm động từ thông dụng'),
      bv(8, 2, 'phrasal2', 'Cụm động từ (mở rộng)'),
      bv(8, 3, 'collocations', 'Cụm từ đi cùng nhau'),
      bv(8, 4, 'idioms', 'Thành ngữ thông dụng'),
      bv(8, 5, 'prepphrases', 'Cụm giới từ'),
      bv(8, 6, 'irregular', 'Động từ bất quy tắc'),
      bgl(8, 1, 'e17'), bgl(8, 2, 'e18'),
      btk(8, 28),
      { id: 'bw8-write', kind: 'custom', label: 'Viết đoạn 10–12 câu kể một kỷ niệm (dùng quá khứ + cụm động từ)', go: null },
      { id: 'bw8-speak', kind: 'speak', label: 'Luyện nói 5 buổi, cố dùng cụm động từ & thành ngữ vừa học' },
      { id: 'bw8-video', kind: 'video', n: 6, label: 'Shadowing 6 video (tab Shadowing, nhại từng câu)' },
      { id: 'bw8-review', kind: 'review', n: 5, label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'bw8-bank', kind: 'total', label: 'Kho từ đạt 2650 — chốt tháng 2', targetTotal: 2650 },
      { id: 'bw8-quiz', kind: 'quiz', label: 'Kiểm tra tổng tháng 2 đạt từ 85%', passPct: 85 },
    ],
  },
  {
    week: 9, month: 3, phase: 'Consolidate', title: 'Cai phụ đề — nghe tốc độ thật',
    focus: 'Tuần bản lề: mọi video đều xem KHÔNG phụ đề lượt đầu, lượt hai mới soi lại chỗ điếc. Tai đau chính là lúc tai lớn.',
    rhythm: 'Khung 7,5 giờ/ngày: nghe chiếm 3h (không phụ đề lượt đầu + chép chính tả tốc độ thật) · nói 1,5h · TOEIC 1h · từ mới giảm còn 1h · SRS 1h.',
    quizUnits: ['nature', 'animals', 'environment', 'society', 'media', 'mindverbs'],
    tasks: [
      bv(9, 1, 'nature', 'Thiên nhiên & du lịch'),
      bv(9, 2, 'animals', 'Động vật'),
      bv(9, 3, 'environment', 'Môi trường'),
      bv(9, 4, 'society', 'Xã hội & cộng đồng'),
      bv(9, 5, 'media', 'Truyền thông & báo chí'),
      bv(9, 6, 'mindverbs', 'Động từ tư duy'),
      btk(9, 35),
      { id: 'bw9-dict', kind: 'custom', label: 'Chép chính tả 3 video tốc độ thật', go: 'library' },
      { id: 'bw9-speak', kind: 'speak', label: 'Luyện nói 5 buổi: kể lại nội dung video vừa xem bằng lời của bạn' },
      { id: 'bw9-video', kind: 'video', n: 6, label: 'Xem 6 video KHÔNG phụ đề lượt đầu, lượt 2 soi lại chỗ chưa nghe ra' },
      { id: 'bw9-review', kind: 'review', n: 6, label: 'Ôn tập SRS đủ 6 ngày trong tuần' },
      { id: 'bw9-bank', kind: 'total', label: 'Kho từ đạt 2900', targetTotal: 2900 },
      { id: 'bw9-deep', kind: 'deep', n: 50, label: 'Nâng lên 50 từ nắm đủ nghĩa — đây là vốn từ “nghe không hụt”' },
      { id: 'bw9-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 85%', passPct: 85 },
    ],
  },
  {
    week: 10, month: 3, phase: 'Consolidate', title: '🎯 3000 từ + cá nhân hoá theo mục tiêu',
    focus: 'Chạm mốc 3000 từ. Phần từ mới còn lại học theo ĐÚNG mục tiêu của bạn: IT, kinh doanh, du học… — dùng gì học nấy.',
    rhythm: 'Khung 7,5 giờ/ngày · mỗi ngày 1 buổi nói · từ mới chỉ học nhóm phục vụ mục tiêu cá nhân · TOEIC giữ 1h/ngày.',
    quizUnits: ['character', 'appearance', 'emergency', 'sports', 'festivals', 'love'],
    tasks: [
      bv(10, 1, 'character', 'Tính cách con người'),
      bv(10, 2, 'appearance', 'Ngoại hình'),
      bv(10, 3, 'emergency', 'Khẩn cấp & trợ giúp'),
      bv(10, 4, 'sports', 'Thể thao'),
      bv(10, 5, 'festivals', 'Lễ hội & dịp đặc biệt'),
      bv(10, 6, 'love', 'Tình cảm & hẹn hò'),
      btk(10, 42),
      { id: 'bw10-self', kind: 'custom', label: 'Học thêm ≥3 chủ đề TỰ CHỌN đúng mục tiêu của bạn trong tab Học từ vựng', go: 'learn' },
      { id: 'bw10-write', kind: 'custom', label: 'Viết 2 email công việc + 1 đoạn 150 từ về mục tiêu của bạn', go: null },
      { id: 'bw10-speak', kind: 'speak', label: 'Luyện nói 6 buổi — mỗi ngày một buổi, chủ đề gắn với mục tiêu của bạn' },
      { id: 'bw10-video', kind: 'video', n: 6, label: 'Xem 6 video đúng lĩnh vực bạn nhắm tới, không phụ đề lượt đầu' },
      { id: 'bw10-review', kind: 'review', n: 6, label: 'Ôn tập SRS đủ 6 ngày trong tuần' },
      { id: 'bw10-bank', kind: 'total', label: '🎯 KHO TỪ ĐẠT 3000 — mục tiêu lớn của cả lộ trình', targetTotal: 3000 },
      { id: 'bw10-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 90%', passPct: 90 },
    ],
  },
  {
    week: 11, month: 3, phase: 'Consolidate', title: 'Tổng duyệt đầu ra',
    focus: 'Không học mới — chỉ trám lỗ hổng và luyện đầu ra: nói dài, nghe khó, viết có lớp lang, thi thử TOEIC giữa tuần.',
    rhythm: 'Khung 7,5 giờ/ngày: 2h nói (buổi 10–15 phút liên tục) · 2h nghe khó · 1h viết · 1h TOEIC · 1h SRS + ôn chủ đề yếu · giữa tuần 1 buổi thi thử TOEIC trọn gói.',
    quizUnits: ['nouns', 'verbs', 'verbs2', 'verbs3', 'adjectives', 'adverbs', 'preps', 'phrases', 'phrases2', 'phrasal', 'phrasal2', 'collocations', 'idioms', 'connectors', 'body', 'feelings', 'worklife', 'office', 'communication', 'travel2', 'restaurant', 'directions', 'timenum', 'irregular'],
    tasks: [
      btk(11, 50),
      { id: 'bw11-mock', kind: 'custom', label: 'Thi thử TOEIC trọn gói giữa tuần, ghi lại điểm từng Part', go: null },
      { id: 'bw11-weak', kind: 'custom', label: 'Ôn lại 10 chủ đề bạn sai nhiều nhất (mở tab Kiểm tra để dò)', go: null },
      { id: 'bw11-write', kind: 'custom', label: 'Viết bài 150–200 từ trình bày quan điểm về một chủ đề bạn quan tâm', go: null },
      { id: 'bw11-speak', kind: 'speak', label: 'Nói tự do 10–15 phút với AI × 3 buổi, không nhìn gợi ý' },
      { id: 'bw11-video', kind: 'video', n: 6, label: 'Xem 6 video tốc độ thật, chép chính tả 2 trong số đó' },
      { id: 'bw11-review', kind: 'review', n: 6, label: 'Ôn tập SRS đủ 6 ngày trong tuần' },
      { id: 'bw11-deep', kind: 'deep', n: 80, label: 'Nâng lên 80 từ nắm đủ nghĩa — chốt vốn từ chủ động của khoá' },
      { id: 'bw11-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 90%', passPct: 90 },
    ],
  },
  {
    week: 12, month: 3, phase: 'Consolidate', title: 'Thi thử & tốt nghiệp',
    focus: 'Hoàn thành 60 ngày TOEIC, thi thử lần cuối để so với tuần 4, nói 20 phút liền mạch và viết bài tổng kết hành trình 90 ngày.',
    rhythm: 'Ngày 1–2: thi thử TOEIC + chữa đề · Ngày 3–4: nói dài + viết bài tổng kết · Ngày 5: bài tổng kết cuối lộ trình · Ngày 6: xuất bộ từ, lên kế hoạch duy trì · Ngày 7: 🎓.',
    quizUnits: ['nouns', 'family', 'people', 'verbs', 'verbs2', 'verbs3', 'questions', 'adjectives', 'places', 'shopping', 'adverbs', 'preps', 'phrases', 'phrases2', 'phrasal', 'phrasal2', 'collocations', 'idioms', 'connectors', 'prepphrases', 'irregular', 'body', 'health2', 'timenum', 'numbers2', 'worklife', 'office', 'communication', 'foodshop', 'feelings', 'feelings2', 'nature', 'travel2', 'transport', 'airport', 'restaurant', 'home', 'tech', 'mindverbs', 'society'],
    tasks: [
      btk(12, 58),
      { id: 'bw12-grammar', kind: 'grammar', label: 'Giữ vững 18/18 bài Ngữ pháp giao tiếp (ôn lại bài nào tụt dưới 75%)' },
      { id: 'bw12-mock', kind: 'custom', label: 'Thi thử TOEIC trọn gói lần cuối — so điểm với bài đo tuần 4', go: null },
      { id: 'bw12-speak', kind: 'speak', label: 'Trò chuyện tự do 20 phút với AI × 2 buổi, đủ mở bài – thân – kết' },
      { id: 'bw12-write', kind: 'custom', label: 'Viết bài 200 từ: hành trình 90 ngày của bạn (mở – thân – kết)', go: null },
      { id: 'bw12-export', kind: 'custom', label: 'Xuất bộ từ đã thuộc ra Word/PDF làm "bằng chứng" 90 ngày', go: 'summary' },
      { id: 'bw12-review', kind: 'review', n: 5, label: 'Ôn SRS 5 ngày — và hẹn lịch ôn duy trì mỗi tuần sau tốt nghiệp' },
      { id: 'bw12-quiz', kind: 'quiz', label: 'Bài tổng kết cuối lộ trình đạt từ 90%', passPct: 90 },
    ],
  },
]

export const PLAN_BOOT_TASK_TOTAL = PLAN_12_WEEKS_BOOT.reduce((s, w) => s + w.tasks.length, 0)
