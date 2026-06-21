import { apiClient } from './client'

export interface Slang {
  term: string
  read: string
  meaning: string
  example: string
  exampleVi: string
  trend: number
  platform: string
}

export interface LingoResult {
  items: Slang[]
  source: 'ai' | 'curated'
  updated: number
}

export const fetchLingo = (refresh = false) =>
  apiClient.get<LingoResult>('/api/lingo' + (refresh ? '?refresh=1' : ''))
