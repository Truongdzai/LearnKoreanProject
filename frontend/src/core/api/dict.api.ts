import { apiClient } from './client'
import type { DictResult } from '@/models/dict.model'

export const defineWord = (word: string) =>
  apiClient.get<DictResult>('/api/define?word=' + encodeURIComponent(word))
