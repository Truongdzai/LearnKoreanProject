import { apiClient } from './client'
import type { DictResult, DictRichResult } from '@/models/dict.model'

export const defineWord = (word: string) =>
  apiClient.get<DictResult>('/api/define?word=' + encodeURIComponent(word))

export const defineWordRich = (word: string, lang = 'ko', native = 'vi') =>
  apiClient.get<DictRichResult>(
    `/api/define/rich?word=${encodeURIComponent(word)}&lang=${lang}&native=${native}`,
  )

export const fetchPinyin = (words: string[]) =>
  apiClient.post<{ readings: Record<string, string> }>('/api/define/pinyin', { words })
