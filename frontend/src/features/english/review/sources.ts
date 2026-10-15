import type { LabKey } from '@/core/labScores'
import type { LabView } from '../shared/labView'
import * as tense from '../tenses/frames'
import { view as tenseView } from '../tenses/TenseQuiz'
import * as confuse from '../confusables/frames'
import { view as confuseView } from '../confusables/ConfuseQuiz'
import * as compare from '../compare/frames'
import { view as compareView } from '../compare/CompareQuiz'
import * as cond from '../conditionals/frames'
import { view as condView } from '../conditionals/CondQuiz'
import * as passive from '../passive/frames'
import { view as passiveView } from '../passive/PassiveQuiz'
import * as gerund from '../gerund/frames'
import { view as gerundView } from '../gerund/GerundQuiz'
import * as article from '../articles/frames'
import { view as articleView } from '../articles/ArticleQuiz'
import * as relative from '../relative/frames'
import { view as relativeView } from '../relative/RelativeQuiz'
import * as question from '../questions/frames'
import { view as questionView } from '../questions/QuestionQuiz'
import * as phrasal from '../phrasal/frames'
import { view as phrasalView } from '../phrasal/PhrasalQuiz'
import * as quantity from '../quantity/frames'
import { view as quantityView } from '../quantity/QuantityQuiz'
import * as modal from '../modals/frames'
import { view as modalView } from '../modals/ModalQuiz'

// Các phòng điền chỗ trống mà lượt "Ôn câu sai" gom câu về: mỗi phòng có bộ câu, cách điền đáp án
// và cách hỏi / giải thích riêng (lấy đúng từ phòng đó để lời giải thích không đổi).

export interface BaseFrame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
}

export interface ReviewSource {
  key: LabKey
  pane: string
  name: string
  frames: BaseFrame[]
  filled: (f: BaseFrame) => string
  view: LabView<BaseFrame, unknown>
}

// Mỗi phòng có kiểu câu riêng; ở đây chỉ cần phần chung nên ép về BaseFrame một lần tại chỗ khai báo
function source<F extends BaseFrame, R>(
  key: LabKey, pane: string, name: string, frames: F[], filled: (f: F) => string, view: LabView<F, R>,
): ReviewSource {
  return { key, pane, name, frames, filled, view } as unknown as ReviewSource
}

export const SOURCES: ReviewSource[] = [
  source('entense', 'tense', 'Chọn thì', tense.FRAMES, tense.filled, tenseView),
  source('enarticle', 'article', 'Mạo từ', article.FRAMES, article.filled, articleView),
  source('enquantity', 'quantity', 'Lượng từ', quantity.FRAMES, quantity.filled, quantityView),
  source('enmodal', 'modal', 'Động từ khuyết thiếu', modal.FRAMES, modal.filled, modalView),
  source('encompare', 'compare', 'So sánh', compare.FRAMES, compare.filled, compareView),
  source('encond', 'cond', 'Câu điều kiện', cond.FRAMES, cond.filled, condView),
  source('enpassive', 'passive', 'Câu bị động', passive.FRAMES, passive.filled, passiveView),
  source('engerund', 'gerund', 'V-ing hay to V', gerund.FRAMES, gerund.filled, gerundView),
  source('enrelative', 'relative', 'Mệnh đề quan hệ', relative.FRAMES, relative.filled, relativeView),
  source('enquestion', 'question', 'Câu hỏi đuôi', question.FRAMES, question.filled, questionView),
  source('enphrasal', 'phrasal', 'Cụm động từ', phrasal.FRAMES, phrasal.filled, phrasalView),
  source('enconfuse', 'confuse', 'Từ dễ nhầm', confuse.FRAMES, confuse.filled, confuseView),
]

export const ROUND = 10

export interface ReviewItem {
  id: string
  en: string
  vi: string
  answer: string
  shuffled: string[]
  key: LabKey
  src: BaseFrame
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Lấy lần lượt mỗi phòng một câu (xoay vòng) để một lượt không dồn hết vào phòng có nhiều câu sai nhất
export function buildReview(weak: Partial<Record<LabKey, string[]>>): ReviewItem[] {
  const queues = SOURCES.map((s) => {
    const ids = new Set(weak[s.key] ?? [])
    return { s, frames: shuffle(s.frames.filter((f) => ids.has(f.id))) }
  }).filter((q) => q.frames.length)
  const picked: ReviewItem[] = []
  for (let round = 0; picked.length < ROUND && queues.some((q) => q.frames.length > round); round++) {
    for (const q of shuffle(queues)) {
      const f = q.frames[round]
      if (!f || picked.length >= ROUND) continue
      picked.push({ id: `${q.s.key}:${f.id}`, en: f.en, vi: f.vi, answer: f.answer, shuffled: shuffle(f.options), key: q.s.key, src: f })
    }
  }
  return shuffle(picked)
}
