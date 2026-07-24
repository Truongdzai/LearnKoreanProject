import { apiClient } from './client'
import type { Lesson } from '@/models/lesson.model'

export const fetchTranscript = (url: string, lang = 'ko') =>
  apiClient.post<Lesson>('/api/transcript', { url, lang })

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

export interface GrammarPoint {
  piece: string
  explain: string
}

export interface ExplainResult {
  structure: string
  points: GrammarPoint[]
  tip: string
}

export const explainSentence = (sentence: string, vi: string, lang: string, native: string) =>
  apiClient.post<ExplainResult>('/api/transcript/explain', { sentence, vi, lang, native })

export interface LevelResult {
  level: string
  reason: string
}

export const estimateLevel = (video_id: string, lang: string, text: string) =>
  apiClient.post<LevelResult>('/api/transcript/level', { video_id, lang, text })

export const translateLines = (lines: string[], lang: string, native: string) =>
  apiClient.post<{ lines: string[] }>('/api/transcript/translate', { lines, lang, native })
