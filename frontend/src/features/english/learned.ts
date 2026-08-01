import { useCallback, useEffect, useState } from 'react'
import { fetchPlanApi, savePlanApi } from '@/core/api/me.api'
import { getToken } from '@/core/api/client'


export const learnedKey = (lang: string) => `vyling.${lang}.learned`

export function readLearned(lang: string): string[] {
  try {
    const raw = localStorage.getItem(learnedKey(lang))
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function writeLearned(lang: string, list: string[]): void {
  try {
    localStorage.setItem(learnedKey(lang), JSON.stringify(list))
  } catch {
  }
}

const wordsPlanId = (lang: string) => `${lang}words`
const wordsPushTimers: Record<string, number | undefined> = {}
const wordsPulled: Record<string, boolean> = {}

function pushWordsToServer(lang: string, list: string[]): void {
  if (!getToken()) return
  window.clearTimeout(wordsPushTimers[lang])
  wordsPushTimers[lang] = window.setTimeout(() => {
    savePlanApi(wordsPlanId(lang), { words: list }).catch(() => {  })
  }, 1500)
}

export function useLearnedWords(lang = 'en') {
  const [learned, setLearned] = useState<Set<string>>(() => new Set(readLearned(lang)))

  useEffect(() => {
    setLearned(new Set(readLearned(lang)))
  }, [lang])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === learnedKey(lang)) setLearned(new Set(readLearned(lang)))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [lang])

  useEffect(() => {
    if (wordsPulled[lang] || !getToken()) return
    wordsPulled[lang] = true
    fetchPlanApi<{ words?: string[] }>(wordsPlanId(lang))
      .then((r) => {
        const remote = r.data?.words ?? []
        const local = readLearned(lang)
        const merged = [...new Set([...local, ...remote])]
        if (merged.length !== local.length) {
          writeLearned(lang, merged)
          setLearned(new Set(merged))
        }
        if (merged.length !== remote.length) pushWordsToServer(lang, merged)
      })
      .catch(() => { wordsPulled[lang] = false })
  }, [lang])

  const mark = useCallback((word: string, on = true) => {
    setLearned((prev) => {
      const next = new Set(prev)
      if (on) next.add(word)
      else next.delete(word)
      const list = [...next]
      writeLearned(lang, list)
      pushWordsToServer(lang, list)
      return next
    })
  }, [lang])

  const has = useCallback((word: string) => learned.has(word), [learned])

  return { learned, mark, has }
}
