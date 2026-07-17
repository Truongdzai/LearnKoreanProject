/**
 * Kho từ vựng lõi tiếng Anh — "3000 từ để hiểu 90% hội thoại".
 * Mỗi từ được học theo phương pháp ICES:
 *  - Image (img)        : emoji/hình ảnh gợi nhớ.
 *  - Connect (connect)  : mẹo liên tưởng / phát âm sang tiếng Việt.
 *  - Experience (ex)    : câu ví dụ đặt từ vào ngữ cảnh thật.
 *  - Sound              : phát âm bằng Web Speech (xem util pronounce), kèm IPA.
 *
 * Đây là phần LÕI ưu tiên #1 theo nguyên tắc 3C (Compress): chỉ giữ từ tần suất cao,
 * dùng tới đâu học tới đó. Cấu trúc theo "unit" để mở rộng dần tới 3000 từ.
 */

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


export type WordPos = 'noun' | 'verb' | 'adj' | 'question' | 'phrase' | 'adverb' | 'prep'

export interface IcesWord {
  /** Từ tiếng Anh */
  en: string
  /** Phiên âm IPA (Sound) */
  ipa: string
  /** Nghĩa tiếng Việt */
  vi: string
  /** Loại từ */
  pos: WordPos
  /** Image — emoji gợi nhớ */
  img: string
  /** Connect — mẹo liên tưởng / nhớ nhanh */
  connect: string
  /** Experience — câu ví dụ tiếng Anh */
  ex: string
  /** Nghĩa câu ví dụ */
  exVi: string
}

export interface VocabUnit {
  id: string
  /** Tên unit hiển thị */
  name: string
  /** Mô tả ngắn */
  sub: string
  pos: WordPos
  /** Màu nền (dùng class tone-*) */
  tone: string
  emoji: string
  words: IcesWord[]
}

/* ------------------------------------------------------------------ */
/* KHO TỪ THEO UNIT — dữ liệu tách ra JSON tại ./english/units/       */
/* Thêm unit mới = thêm 1 file JSON + 1 dòng import + 1 phần tử mảng.  */
/* ------------------------------------------------------------------ */

export const UNITS: VocabUnit[] = [
  nouns, verbs, questions, adjectives, places, verbs2, adverbs, preps,
  phrases, body, timenum, worklife, foodshop, feelings, nature,
  home, tech, phrases2,
] as unknown as VocabUnit[]

export const ALL_WORDS: IcesWord[] = UNITS.flatMap((u) => u.words)

/** Tổng số từ trong mục tiêu chương trình (đích 3000 từ để hiểu 90% hội thoại). */
export const TARGET_WORDS = 3000

/* ---------------------- KẾ HOẠCH 3 THÁNG (12 tuần) ---------------------- */

/**
 * Mỗi tuần là một danh sách NHIỆM VỤ cụ thể gắn với hành động thật trong app:
 *  - vocab : tự hoàn thành khi thuộc đủ % số từ của unit (đếm từ tập "đã thuộc").
 *  - quiz  : tự hoàn thành khi bài kiểm tra tuần đạt điểm yêu cầu.
 *  - video / speak / review / custom : người học tự tick, kèm nút nhảy tới đúng trang.
 */
export type WeekTaskKind = 'vocab' | 'total' | 'quiz' | 'video' | 'speak' | 'review' | 'custom'

/** Đích đến khi bấm nút hành động của nhiệm vụ. */
export type WeekTaskGo = 'learn' | 'quiz' | 'library' | 'speaking' | 'flashcards' | 'vocab' | 'summary' | null

export interface WeekTask {
  id: string
  kind: WeekTaskKind
  label: string
  /** vocab: unit và % số từ (cộng dồn) cần thuộc */
  unitId?: string
  pct?: number
  /** total: mốc KHO TỪ tích lũy (từ lõi + thẻ tiếng Anh mọi nguồn) hướng tới 3000 */
  targetTotal?: number
  /** quiz: điểm % cần đạt */
  passPct?: number
  /** Trang mở khi bấm nút hành động (mặc định suy ra từ kind) */
  go?: WeekTaskGo
}

/** Mẫu câu của tuần — phần "Compile": ghép từ đã học thành câu nói được ngay. */
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
  /** Nhịp 7 ngày gợi ý, hiển thị trong chi tiết tuần */
  rhythm: string
  tasks: WeekTask[]
  /** Unit dùng cho bài kiểm tra tuần */
  quizUnits?: string[]
  patterns?: SentencePattern[]
}

export const PLAN_12_WEEKS: WeekPlan[] = [
  {
    week: 1, month: 1, phase: 'Compress', title: 'Danh từ quanh ta',
    focus: 'Người, gia đình, đồ vật quen thuộc — nền móng của mọi câu nói, cộng thói quen gom từ mỗi ngày.',
    rhythm: 'Ngày 1–6: ~5 từ lõi/ngày + gom thêm từ qua video · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS.',
    quizUnits: ['nouns'],
    tasks: [
      { id: 'w1-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Danh từ cốt lõi" (32 từ)', unitId: 'nouns', pct: 100 },
      { id: 'w1-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w1-bank', kind: 'total', label: 'Kho từ đạt 100 — lưu thêm từ khi xem video, gói từ, thẻ tự thêm', targetTotal: 100 },
      { id: 'w1-video', kind: 'video', label: 'Xem 2 video tiếng Anh dễ + bấm từ mới trong phụ đề để lưu' },
      { id: 'w1-review', kind: 'review', label: 'Vào Ôn tập (SRS) ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 2, month: 1, phase: 'Compress', title: 'Nơi chốn, ăn uống & mua sắm',
    focus: 'Sân bay, nhà hàng, chợ búa + gọi món, hỏi giá — bộ từ "sống sót" khi ra ngoài.',
    rhythm: 'Ngày 1–6: ~10 từ lõi/ngày (2 nhóm) · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS + nghe lại từ khó.',
    quizUnits: ['places', 'foodshop'],
    tasks: [
      { id: 'w2-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Nơi chốn & đời sống" (32 từ)', unitId: 'places', pct: 100 },
      { id: 'w2-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Ăn uống & mua sắm" (30 từ)', unitId: 'foodshop', pct: 100 },
      { id: 'w2-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w2-bank', kind: 'total', label: 'Kho từ đạt 250', targetTotal: 250 },
      { id: 'w2-review', kind: 'review', label: 'Ôn tập SRS ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 3, month: 1, phase: 'Compress', title: 'Từ để hỏi, con số & thời gian',
    focus: '5W1H + số đếm, thứ trong tuần, bốn mùa — đủ để hỏi giá, hỏi giờ, hẹn lịch.',
    rhythm: 'Ngày 1–2: từ để hỏi + cụm chào · Ngày 3–5: số đếm & thời gian · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['questions', 'phrases', 'timenum'],
    tasks: [
      { id: 'w3-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Từ để hỏi" (5W1H)', unitId: 'questions', pct: 100 },
      { id: 'w3-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cụm giao tiếp hằng ngày" (20 cụm)', unitId: 'phrases', pct: 100 },
      { id: 'w3-vocab3', kind: 'vocab', label: 'Thuộc toàn bộ "Số đếm & thời gian" (30 từ)', unitId: 'timenum', pct: 100 },
      { id: 'w3-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w3-bank', kind: 'total', label: 'Kho từ đạt 450', targetTotal: 450 },
      { id: 'w3-speak', kind: 'speak', label: 'Luyện nói 1 buổi chào hỏi/tán gẫu với AI' },
    ],
  },
  {
    week: 4, month: 1, phase: 'Compress', title: 'Tính từ & cảm xúc',
    focus: 'good/bad, big/small + vui buồn giận sợ — nói được cảm nhận của mình, chốt tháng nền móng.',
    rhythm: 'Ngày 1–5: ~11 từ/ngày (2 nhóm) · Ngày 6: kiểm tra tổng tháng 1 · Ngày 7: ôn toàn bộ SRS.',
    quizUnits: ['adjectives', 'feelings'],
    tasks: [
      { id: 'w4-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Tính từ ứng dụng cao" (25 từ)', unitId: 'adjectives', pct: 100 },
      { id: 'w4-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cảm xúc & tính cách" (30 từ)', unitId: 'feelings', pct: 100 },
      { id: 'w4-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w4-bank', kind: 'total', label: 'Kho từ đạt 700 — chốt tháng 1', targetTotal: 700 },
      { id: 'w4-video', kind: 'video', label: 'Xem 2 video + bấm từ mới trong phụ đề để lưu thẻ' },
    ],
  },
  {
    week: 5, month: 2, phase: 'Compile', title: 'Động từ & câu đơn đầu tiên',
    focus: 'go, eat, see, do, have… và bắt đầu GHÉP CÂU: chủ ngữ + động từ + tân ngữ.',
    rhythm: 'Ngày 1–4: 7–8 động từ/ngày · Ngày 5–6: tập mẫu câu + kiểm tra · Ngày 7: tự đặt câu.',
    quizUnits: ['verbs'],
    patterns: [
      { pattern: 'I + động từ + …', vi: 'Nói điều mình làm', ex: 'I eat breakfast at seven.', exVi: 'Tôi ăn sáng lúc 7 giờ.' },
      { pattern: 'I want to + động từ', vi: 'Nói điều mình muốn', ex: 'I want to learn English.', exVi: 'Tôi muốn học tiếng Anh.' },
      { pattern: 'I need to + động từ', vi: 'Nói điều mình cần', ex: 'I need to buy some food.', exVi: 'Tôi cần mua ít đồ ăn.' },
      { pattern: "Let's + động từ", vi: 'Rủ ai đó cùng làm', ex: "Let's go to the park.", exVi: 'Mình ra công viên đi.' },
    ],
    tasks: [
      { id: 'w5-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Động từ cốt lõi" (30 từ)', unitId: 'verbs', pct: 100 },
      { id: 'w5-pattern', kind: 'custom', label: 'Tự đặt 5 câu theo 4 mẫu câu của tuần (nói to lên!)', go: null },
      { id: 'w5-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w5-bank', kind: 'total', label: 'Kho từ đạt 1000', targetTotal: 1000 },
      { id: 'w5-review', kind: 'review', label: 'Ôn tập SRS ít nhất 3 ngày trong tuần' },
    ],
  },
  {
    week: 6, month: 2, phase: 'Compile', title: 'Phủ định, Yes/No & cơ thể',
    focus: 'Động từ giao tiếp (ask, meet, pay…) + từ về cơ thể, sức khoẻ; nói "không", hỏi Yes/No, nhờ vả bằng can.',
    rhythm: 'Ngày 1–5: ~12 từ/ngày (2 nhóm) · Ngày 5: mẫu câu · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['verbs2', 'body'],
    patterns: [
      { pattern: 'S + be + tính từ', vi: 'Mô tả bằng "be"', ex: 'She is very kind.', exVi: 'Cô ấy rất tốt bụng.' },
      { pattern: "I don't + động từ", vi: 'Nói điều mình KHÔNG làm', ex: "I don't like coffee.", exVi: 'Tôi không thích cà phê.' },
      { pattern: 'Do you + động từ?', vi: 'Hỏi Yes/No', ex: 'Do you speak English?', exVi: 'Bạn có nói tiếng Anh không?' },
      { pattern: 'Can you + động từ?', vi: 'Nhờ vả, hỏi khả năng', ex: 'Can you help me?', exVi: 'Bạn giúp tôi được không?' },
    ],
    tasks: [
      { id: 'w6-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Động từ giao tiếp & sinh hoạt" (31 từ)', unitId: 'verbs2', pct: 100 },
      { id: 'w6-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Cơ thể & sức khoẻ" (30 từ)', unitId: 'body', pct: 100 },
      { id: 'w6-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w6-bank', kind: 'total', label: 'Kho từ đạt 1300', targetTotal: 1300 },
      { id: 'w6-speak', kind: 'speak', label: 'Luyện nói 1 buổi — tập hỏi Yes/No với nhân vật AI' },
    ],
  },
  {
    week: 7, month: 2, phase: 'Compile', title: 'Hỏi đáp đời sống & công việc',
    focus: 'Giới từ & từ nối (in/on/at, because…) + từ công sở, trường lớp; hỏi thật: giá cả, đường đi, giờ giấc.',
    rhythm: 'Ngày 1–3: giới từ · Ngày 4–5: từ công việc + mẫu câu hỏi · Ngày 6: kiểm tra · Ngày 7: luyện nói.',
    quizUnits: ['preps', 'worklife'],
    patterns: [
      { pattern: 'What is …?', vi: 'Hỏi "cái gì"', ex: 'What is this called in English?', exVi: 'Cái này tiếng Anh gọi là gì?' },
      { pattern: 'Where is …?', vi: 'Hỏi đường, hỏi chỗ', ex: 'Where is the bathroom?', exVi: 'Nhà vệ sinh ở đâu?' },
      { pattern: 'How much …?', vi: 'Hỏi giá', ex: 'How much is this shirt?', exVi: 'Cái áo này bao nhiêu tiền?' },
      { pattern: 'What time …?', vi: 'Hỏi giờ giấc', ex: 'What time do you open?', exVi: 'Mấy giờ bên bạn mở cửa?' },
    ],
    tasks: [
      { id: 'w7-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Giới từ & từ nối" (22 từ)', unitId: 'preps', pct: 100 },
      { id: 'w7-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Công việc & học hành" (30 từ)', unitId: 'worklife', pct: 100 },
      { id: 'w7-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w7-bank', kind: 'total', label: 'Kho từ đạt 1650', targetTotal: 1650 },
      { id: 'w7-speak', kind: 'speak', label: 'Luyện nói: hỏi đường / gọi món / hỏi giá với AI' },
    ],
  },
  {
    week: 8, month: 2, phase: 'Compile', title: 'Mô tả, so sánh & thế giới quanh ta',
    focus: 'Trạng từ (very, too, always…) + thiên nhiên, du lịch; mô tả và so sánh — chốt tháng ghép câu.',
    rhythm: 'Ngày 1–3: trạng từ · Ngày 4–5: từ du lịch + mẫu câu mô tả · Ngày 6: kiểm tra tổng tháng 2 · Ngày 7: xem video.',
    quizUnits: ['adverbs', 'nature'],
    patterns: [
      { pattern: "It's too + tính từ", vi: 'Chê "quá …"', ex: "It's too expensive.", exVi: 'Đắt quá.' },
      { pattern: 'tính từ + -er than', vi: 'So sánh hơn', ex: 'This one is cheaper than that one.', exVi: 'Cái này rẻ hơn cái kia.' },
      { pattern: 'as + tính từ + as', vi: 'So sánh bằng', ex: 'He is as tall as his father.', exVi: 'Cậu ấy cao bằng bố.' },
      { pattern: 'look / sound + tính từ', vi: 'Trông / nghe có vẻ', ex: 'You look happy today.', exVi: 'Hôm nay trông bạn vui thế.' },
    ],
    tasks: [
      { id: 'w8-vocab', kind: 'vocab', label: 'Thuộc toàn bộ "Trạng từ & tần suất" (22 từ)', unitId: 'adverbs', pct: 100 },
      { id: 'w8-vocab2', kind: 'vocab', label: 'Thuộc toàn bộ "Thiên nhiên & du lịch" (30 từ)', unitId: 'nature', pct: 100 },
      { id: 'w8-quiz', kind: 'quiz', label: 'Kiểm tra tuần đạt từ 70%', passPct: 70 },
      { id: 'w8-bank', kind: 'total', label: 'Kho từ đạt 2000 — chốt tháng 2, đã đi 2/3 chặng', targetTotal: 2000 },
      { id: 'w8-video', kind: 'video', label: 'Xem 2 video, để ý cách người bản xứ mô tả đồ vật' },
    ],
  },
  {
    week: 9, month: 3, phase: 'Consolidate', title: 'Tổng ôn ngắt quãng',
    focus: 'Đã thuộc hết ~400 từ lõi — dồn sức ôn SRS, lấp lỗ hổng và tiếp tục gom từ từ video.',
    rhythm: 'Mỗi ngày 10–15 phút SRS + 1 video gom từ · Ngày 6: tổng kiểm tra · Ngày 7: xem video thư giãn.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w9-review', kind: 'review', label: 'Ôn tập SRS đủ 5 ngày trong tuần' },
      { id: 'w9-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w9-bank', kind: 'total', label: 'Kho từ đạt 2300', targetTotal: 2300 },
      { id: 'w9-custom', kind: 'custom', label: 'Viết 10 câu với những từ bạn hay quên nhất', go: null },
      { id: 'w9-video', kind: 'video', label: 'Xem 2 video tiếng Anh không nhìn phụ đề lượt đầu' },
    ],
  },
  {
    week: 10, month: 3, phase: 'Consolidate', title: 'Nghe & nhại (shadowing)',
    focus: 'Luyện tai và miệng: nhại theo người bản xứ từng câu bằng tab Shadowing trong Học video.',
    rhythm: 'Mỗi ngày 1 video ngắn: nghe → nhại từng câu → chấm phát âm · Ngày 6: kiểm tra · Ngày 7: nghỉ tai.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w10-video', kind: 'video', label: 'Shadowing 3 video (mở video → tab Shadowing/Phát âm)' },
      { id: 'w10-speak', kind: 'speak', label: 'Luyện nói 2 buổi với AI, cố nói cả câu dài' },
      { id: 'w10-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w10-bank', kind: 'total', label: 'Kho từ đạt 2550', targetTotal: 2550 },
      { id: 'w10-review', kind: 'review', label: 'Duy trì SRS ít nhất 3 ngày' },
    ],
  },
  {
    week: 11, month: 3, phase: 'Consolidate', title: 'Hội thoại theo chủ đề',
    focus: 'Áp dụng tất cả vào tình huống thật: du lịch, mua sắm, công việc, phỏng vấn.',
    rhythm: 'Cách ngày 1 buổi luyện nói chủ đề khác nhau · xen kẽ video · Ngày 7: kiểm tra.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w11-speak', kind: 'speak', label: 'Hoàn thành 3 tình huống Luyện nói (du lịch / mua sắm / công việc)' },
      { id: 'w11-video', kind: 'video', label: 'Xem 2 video đúng chủ đề bạn vừa luyện nói' },
      { id: 'w11-quiz', kind: 'quiz', label: 'Tổng kiểm tra đạt từ 80%', passPct: 80 },
      { id: 'w11-bank', kind: 'total', label: 'Kho từ đạt 2800', targetTotal: 2800 },
      { id: 'w11-review', kind: 'review', label: 'Duy trì SRS ít nhất 3 ngày' },
    ],
  },
  {
    week: 12, month: 3, phase: 'Consolidate', title: 'Tổng kết & tốt nghiệp',
    focus: 'Chạm mốc 3000 từ, bài tổng kết cuối lộ trình, xuất bộ từ ra Word/PDF và tự tin nói chuyện với AI.',
    rhythm: 'Ngày 1–3: ôn điểm yếu + gom nốt từ · Ngày 4: bài tổng kết · Ngày 5–6: hội thoại tự do · Ngày 7: 🎓.',
    quizUnits: ['nouns', 'verbs', 'questions', 'adjectives', 'places', 'verbs2', 'adverbs', 'preps', 'phrases', 'body', 'timenum', 'worklife', 'foodshop', 'feelings', 'nature'],
    tasks: [
      { id: 'w12-bank', kind: 'total', label: '🎯 KHO TỪ ĐẠT 3000 — mục tiêu lớn của cả lộ trình', targetTotal: 3000 },
      { id: 'w12-quiz', kind: 'quiz', label: 'Bài tổng kết cuối lộ trình đạt từ 80%', passPct: 80 },
      { id: 'w12-speak', kind: 'speak', label: 'Trò chuyện tự do 10 phút với AI, không nhìn gợi ý' },
      { id: 'w12-export', kind: 'custom', label: 'Xuất bộ từ đã thuộc ra Word/PDF làm "bằng chứng" 3 tháng', go: 'summary' },
      { id: 'w12-review', kind: 'review', label: 'Ôn SRS lần cuối — hẹn lịch ôn duy trì mỗi tuần' },
    ],
  },
]

/** Tổng số nhiệm vụ toàn lộ trình (dùng cho thanh tiến độ tổng). */
export const PLAN_TASK_TOTAL = PLAN_12_WEEKS.reduce((s, w) => s + w.tasks.length, 0)
