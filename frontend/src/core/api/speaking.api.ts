import { apiClient } from './client'
import { track } from '@/core/monitor'

export interface SpeakLine { ko: string; vi: string }
export interface SpeakTurn { role: 'bot' | 'me'; ko: string }

export interface SpeakReply {
  reply_ko: string
  reply_vi: string
  feedback: string
  suggestions: SpeakLine[]
  done: boolean
  model?: string
}

export function fetchSpeakReply(input: {
  persona: string
  situation: string
  user_say: string
  history: SpeakTurn[]
  level?: string
  lang?: string
  native?: string
}): Promise<SpeakReply> {
  return apiClient.post<SpeakReply>('/api/speaking/reply', input).then((r) => {
    track('speaking_turn', { lang: input.lang || 'ko', situation: input.situation.slice(0, 40) })
    return r
  })
}
