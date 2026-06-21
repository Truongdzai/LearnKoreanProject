export interface Segment {
  start: number
  ko: string
  vi?: string
  /** speaker index assigned for role-play (0-based); optional. */
  speaker?: number
}

export interface Lesson {
  id: string
  title: string
  channel?: string
  source: string
  segments: Segment[]
}
