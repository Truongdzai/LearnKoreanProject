import { apiClient } from './client'
import type { DictResult, DictRichResult } from '@/models/dict.model'

export const defineWord = (word: string) =>
  apiClient.get<DictResult>('/api/define?word=' + encodeURIComponent(word))

export const defineWordRich = (word: string) =>
  apiClient.get<DictRichResult>('/api/define/rich?word=' + encodeURIComponent(word))
