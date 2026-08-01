import grammarRaw from './korean/topik/grammar.json'
import readingRaw from './korean/topik/reading.json'
import listeningRaw from './korean/topik/listening.json'
import writingRaw from './korean/topik/writing.json'

export interface TopikExample { ko: string; vi: string }

export interface TopikDrill {
  text: string
  options: string[]
  answer: number
  explain: string
}

export interface TopikCapsule {
  id: string
  level: number
  title: string
  tag: string
  points: string[]
  examples: TopikExample[]
  drill: TopikDrill[]
}

export interface TopikReading {
  id: string
  type: 'topic' | 'blank' | 'read' | 'order'
  level: number
  skill: string
  text: string
  q: string
  options: string[]
  answer: number
  explain: string
}

export interface TopikScriptLine { s: 'M' | 'W'; text: string }

export interface TopikListening {
  id: string
  level: number
  skill: string
  script: TopikScriptLine[]
  q: string
  options: string[]
  answer: number
  explain: string
}

export interface TopikWriting {
  id: string
  task: '51' | '52' | '53' | '54'
  level: number
  title: string
  prompt: string
  hint: string
  sample: string
}

export const TOPIK_CAPSULES = grammarRaw as TopikCapsule[]
export const TOPIK_READING = readingRaw as TopikReading[]
export const TOPIK_LISTENING = listeningRaw as TopikListening[]
export const TOPIK_WRITING = writingRaw as TopikWriting[]

export const CAPSULE_PASS = 70

export const TOPIK_SKILLS: Record<string, string> = {
  topic: 'Nắm chủ đề đoạn văn',
  particle: 'Trợ từ (은/는, 이/가, 에/에서…)',
  vocab: 'Từ vựng theo ngữ cảnh',
  grammar: 'Ngữ pháp nối câu',
  detail: 'Đọc lấy chi tiết đúng',
  main: 'Tìm ý chính',
  purpose: 'Mục đích văn bản',
  order: 'Sắp xếp câu',
  insert: 'Chèn câu vào đoạn',
  'l-yesno': 'Nghe câu hỏi có/không',
  'l-wh': 'Nghe câu hỏi 5W1H',
  'l-place': 'Nghe đoán nơi chốn',
  'l-topic': 'Nghe nắm chủ đề',
  'l-detail': 'Nghe lấy chi tiết',
  'l-infer': 'Nghe suy luận câu tiếp theo',
}

export function estimateTopik(listenPct: number, readPct: number): {
  listening: number
  reading: number
  total: number
  grade: 0 | 1 | 2
  label: string
} {
  const listening = Math.round(listenPct * 100)
  const reading = Math.round(readPct * 100)
  const total = listening + reading
  const grade: 0 | 1 | 2 = total >= 140 ? 2 : total >= 80 ? 1 : 0
  const label = grade === 2 ? '2급 (TOPIK I cấp 2)' : grade === 1 ? '1급 (TOPIK I cấp 1)' : 'Chưa đạt cấp — cần thêm nền'
  return { listening, reading, total, grade, label }
}

export const TOPIK_BANK = {
  capsules: TOPIK_CAPSULES.length,
  reading: TOPIK_READING.length,
  listening: TOPIK_LISTENING.length,
  writing: TOPIK_WRITING.length,
}
