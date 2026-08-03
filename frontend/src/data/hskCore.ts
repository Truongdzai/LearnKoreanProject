import grammarRaw from './chinese/hsk/grammar.json'
import readingRaw from './chinese/hsk/reading.json'
import listeningRaw from './chinese/hsk/listening.json'

export interface HskExample { zh: string; py: string; vi: string }

export interface HskDrill {
  text: string
  options: string[]
  answer: number
  explain: string
}

export interface HskCapsule {
  id: string
  level: number
  title: string
  tag: string
  points: string[]
  examples: HskExample[]
  drill: HskDrill[]
}

export interface HskReading {
  id: string
  type: 'blank' | 'match' | 'topic' | 'detail' | 'tf' | 'order'
  level: number
  skill: string
  text: string
  q: string
  options: string[]
  answer: number
  explain: string
}

export interface HskScriptLine { s: 'M' | 'W'; text: string }

export interface HskListening {
  id: string
  level: number
  skill: string
  script: HskScriptLine[]
  q: string
  options: string[]
  answer: number
  explain: string
}

export const HSK_CAPSULES = grammarRaw as HskCapsule[]
export const HSK_READING = readingRaw as HskReading[]
export const HSK_LISTENING = listeningRaw as HskListening[]

export const CAPSULE_PASS = 70

export const HSK_PASS_SCORE = 120

export const HSK_SKILLS: Record<string, string> = {
  'r-blank': 'Điền từ vào chỗ trống',
  'r-match': 'Nối câu hỏi – câu đáp',
  'r-topic': 'Nắm ý chính đoạn văn',
  'r-detail': 'Đọc lấy chi tiết đúng',
  'r-tf': 'Xét đúng/sai theo đoạn',
  'r-order': 'Sắp xếp câu thành đoạn',
  'r-measure': 'Lượng từ',
  'r-grammar': 'Ngữ pháp trong câu',
  'l-reply': 'Nghe chọn câu đáp',
  'l-wh': 'Nghe câu hỏi 5W1H',
  'l-place': 'Nghe đoán nơi chốn',
  'l-time': 'Nghe lấy giờ giấc',
  'l-num': 'Nghe lấy con số',
  'l-detail': 'Nghe lấy chi tiết',
  'l-tf': 'Nghe xét đúng/sai',
  'l-infer': 'Nghe suy ra tình huống',
}

export function estimateHsk(listenPct: number, readPct: number): {
  listening: number
  reading: number
  total: number
  grade: 0 | 1 | 2
  label: string
} {
  const listening = Math.round(listenPct * 100)
  const reading = Math.round(readPct * 100)
  const total = listening + reading
  const grade: 0 | 1 | 2 = total >= 160 ? 2 : total >= HSK_PASS_SCORE ? 1 : 0
  const label =
    grade === 2 ? 'Đủ sức thi HSK 2 (总分 ≥ 160)'
    : grade === 1 ? 'Đạt mức HSK 1 (总分 ≥ 120)'
    : 'Chưa đạt mốc 120 — cần thêm nền'
  return { listening, reading, total, grade, label }
}

export const HSK_BANK = {
  capsules: HSK_CAPSULES.length,
  reading: HSK_READING.length,
  listening: HSK_LISTENING.length,
}
