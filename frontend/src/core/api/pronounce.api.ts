import { apiClient } from './client'

export interface PronounceFeedback {
  feedback: string
  tips: string[]
  encouragement: string
  model?: string
}

export function fetchPronounceFeedback(input: {
  target: string
  heard: string
  score: number
  vi?: string
  lang?: string
  native?: string
}): Promise<PronounceFeedback> {
  return apiClient.post<PronounceFeedback>('/api/pronounce', input)
}
