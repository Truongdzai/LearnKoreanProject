export interface Segment {
  start: number
  ko: string
  vi?: string
}

export interface Lesson {
  id: string
  title: string
  channel?: string
  source: string
  segments: Segment[]
}
