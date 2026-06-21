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

export interface SpeakersResult {
  speakers: number[]
  names: string[]
  source: 'ai' | 'alt'
}

export const detectSpeakers = (id: string, segments: { start: number; ko: string }[]) =>
  apiClient.post<SpeakersResult>('/api/speakers', {
    id,
    lines: segments.map((s) => s.ko),
    starts: segments.map((s) => s.start),
  })

export interface VoiceDiarizeResult {
  speakers: number[]
  names: string[]
  source: 'voice'
  k: number
}

export const diarizeVoice = (id: string, starts: number[]) =>
  apiClient.post<VoiceDiarizeResult>('/api/diarize/voice', { id, starts })
