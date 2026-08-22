import { useCallback, useEffect, useState } from 'react'
import { fetchPlanApi, fetchWordsApi, markWordsApi, savePlanApi } from '@/core/api/me.api'
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

const legacyPlanId = (lang: string) => `${lang}words`
const wordsPulled: Record<string, boolean> = {}

function pushWord(lang: string, word: string, on: boolean): void {
  if (!getToken()) return
  markWordsApi(lang, on ? [word] : [], on ? [] : [word]).catch(() => {  })
}

function pushMany(lang: string, words: string[]): void {
  if (!getToken() || !words.length) return
  markWordsApi(lang, words, []).catch(() => {  })
}

async function pullRemote(lang: string): Promise<string[]> {
  const fresh = await fetchWordsApi(lang)
  if (fresh.words.length) return fresh.words
  const legacy = await fetchPlanApi<{ words?: string[] }>(legacyPlanId(lang)).catch(() => null)
  const old = legacy?.data?.words ?? []
  if (old.length) {
    await markWordsApi(lang, old, []).catch(() => {  })
    savePlanApi(legacyPlanId(lang), {}).catch(() => {  })
  }
  return old
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
    pullRemote(lang)
      .then((remote) => {
        const local = readLearned(lang)
        const merged = [...new Set([...local, ...remote])]
        if (merged.length !== local.length) {
          writeLearned(lang, merged)
          setLearned(new Set(merged))
        }
        const missing = local.filter((w) => !remote.includes(w))
        if (missing.length) pushMany(lang, missing)
      })
      .catch(() => { wordsPulled[lang] = false })
  }, [lang])

  const mark = useCallback((word: string, on = true) => {
    setLearned((prev) => {
      const next = new Set(prev)
      if (on) next.add(word)
      else next.delete(word)
      writeLearned(lang, [...next])
      pushWord(lang, word, on)
      return next
    })
  }, [lang])

  const has = useCallback((word: string) => learned.has(word), [learned])

  return { learned, mark, has }
}
