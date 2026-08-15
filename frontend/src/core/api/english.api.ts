import { apiClient } from './client'
import { track } from '@/core/monitor'
import type { WordProfileResult } from '@/models/wordprofile.model'

export type CoachTask = 'use' | 'respond' | 'retell' | 'email' | 'free'
export type CoachErrorKind = 'pron' | 'grammar' | 'word' | 'fluency'

export interface CoachError {
  kind: CoachErrorKind
  wrong: string
  right: string
  note: string
}

export interface CoachResult {
  ok: boolean
  score: number
  used_target: boolean
  fixed: string
  natural: string
  praise: string
  tip: string
  followup: string
  errors: CoachError[]
  model?: string
}

export interface CoachInput {
  task: CoachTask
  target?: string
  pattern?: string
  meaning?: string
  cue?: string
  prompt?: string
  say: string
  level?: string
  seconds?: number
}

export interface WordImage {
  url: string
  full: string
  title: string
  author: string
  author_url: string
  license: string
  license_url: string
  source: string
  provider: string
  query: string
  ai?: boolean
}

export interface WordImageResult {
  word: string
  image: WordImage | null
  cached: boolean
}

export function fetchWordImage(word: string, q = '', onlyCached = false): Promise<WordImageResult> {
  const qs = new URLSearchParams({ word })
  if (q) qs.set('q', q)
  if (onlyCached) qs.set('only_cached', 'true')
  return apiClient.get<WordImageResult>(`/api/en/image?${qs.toString()}`)
}

export interface WordReady {
  word: string
  rich: boolean
  image: boolean
  profile: boolean
}

export function fetchWordProfile(word: string, pos = '', vi = ''): Promise<WordProfileResult> {
  const qs = new URLSearchParams({ word })
  if (pos) qs.set('pos', pos)
  if (vi) qs.set('vi', vi)
  return apiClient.get<WordProfileResult>(`/api/en/profile?${qs.toString()}`).then((r) => {
    track('en_profile', { cached: r.cached, senses: r.profile?.senses.length ?? 0 })
    return r
  })
}

export function fetchWordReady(word: string): Promise<WordReady> {
  return apiClient.get<WordReady>(`/api/en/ready?word=${encodeURIComponent(word)}`)
}

export function coachEnglish(input: CoachInput): Promise<CoachResult> {
  return apiClient.post<CoachResult>('/api/en/coach', input).then((r) => {
    track('en_coach', { task: input.task, score: r.score })
    return r
  })
}
