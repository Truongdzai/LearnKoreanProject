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

export interface IpaReading { ipa: string; ph: string }

export const fetchIpa = (words: string[]) =>
  apiClient.post<{ readings: Record<string, IpaReading> }>('/api/define/ipa', { words })

export interface EdgeDictSense { pos: string; def: string; ex?: string }
export interface EdgeDict {
  word: string
  ipa: string
  audio: string
  senses: EdgeDictSense[]
  syn: string[]
}

export async function fetchEdgeDict(word: string): Promise<EdgeDict | null> {
  try {
    const res = await fetch('/cf/dict?word=' + encodeURIComponent(word), {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return (await res.json()) as EdgeDict
  } catch {
    return null
  }
}
