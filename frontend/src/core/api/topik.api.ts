import { apiClient } from './client'

export interface TopikCriterion {
  name: string
  score: number
  max: number
  comment: string
}

export interface TopikError {
  wrong: string
  fix: string
  why: string
}

export interface TopikGrade {
  score: number
  max: number
  level_hint?: string
  summary: string
  criteria: TopikCriterion[]
  errors: TopikError[]
  improved: string
  next_steps?: string[]
  model?: string
}

export const gradeWriting = (input: { task: string; prompt: string; answer: string }) =>
  apiClient.post<TopikGrade>('/api/topik/writing', input)
