import { apiClient } from './client'
import { track } from '@/core/monitor'

export interface TutorTurn { role: 'bot' | 'me'; text: string }

export interface TutorPair { target: string; vi: string }

export interface QuotaInfo {
  used: number
  limit: number
  left: number
  authed?: boolean
}

export interface TutorReply {
  reply: string
  examples: TutorPair[]
  words: TutorPair[]
  suggestions: string[]
  quota?: QuotaInfo
  model?: string
}

export interface TutorProfile {
  authed: boolean
  name?: string
  lang: string
  goal?: string | null
  level?: number
  streak?: number
  known: number
  cards_total?: number
  cards_due?: number
  cards_learned?: number
  plan_day?: number
  plan_week?: number
  pron_passed?: number
  grammar_passed?: number
  quota?: QuotaInfo
}

export interface FitScore {
  words: number
  unique: number
  known_pct: number
  band: 'easy' | 'fit' | 'hard' | 'unknown'
  new_words: string[]
}

export const fetchTutorProfile = (lang: string) =>
  apiClient.get<TutorProfile>(`/api/tutor/profile?lang=${encodeURIComponent(lang)}`)

export const askTutor = (input: { message: string; history: TutorTurn[]; lang: string; native: string }) =>
  apiClient.post<TutorReply>('/api/tutor/chat', input).then((r) => {
    track('tutor_ask', { lang: input.lang, turn: input.history.length + 1 })
    return r
  })

export const fetchFit = (video_ids: string[], lang: string) =>
  apiClient.post<{ fit: Record<string, FitScore>; known: number }>('/api/tutor/fit', { video_ids, lang })
