import { apiClient } from './client'
import type { Lesson } from '@/models/lesson.model'

export const fetchTranscript = (url: string) =>
  apiClient.post<Lesson>('/api/transcript', { url })

export interface MinePayload {
  ko: string
  vi?: string
  source?: string
}

export const mineCard = (payload: MinePayload) =>
  apiClient.post<{ ok: boolean; anki_id: number }>('/api/mine', payload)
