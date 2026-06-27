export interface Video {
  id: string
  title: string
  channel: string
  level: string
  dur: string
  topic: string
  tone: string
  /** Learning language this video belongs to ('ko', 'en', …). */
  lang?: string
}
