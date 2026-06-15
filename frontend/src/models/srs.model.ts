export interface SrsCard {
  id: number
  front: string
  back?: string
  source?: string
  reps: number
  ivl: number
  ease: number
  due: string
  last_reviewed?: string
}

export interface SrsStats {
  total: number
  due: number
  new: number
  learned: number
  reviewed_today: number
}

export interface DueResponse extends SrsStats {
  cards: SrsCard[]
}

export type SrsRating = 1 | 2 | 3 | 4
