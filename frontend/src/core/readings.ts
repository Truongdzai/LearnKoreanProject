import { useEffect, useState } from 'react'
import { romanizeWord } from '@/core/utils/romanize'
import { fetchPinyin } from '@/core/api/dict.api'
import { studyLang } from '@/core/constants/languages'


const pinyinCache = new Map<string, string>()

export function useReadings(tokens: string[], lang: string): Record<string, string> {
  const kind = studyLang(lang).reading
  const [map, setMap] = useState<Record<string, string>>({})

  const key = kind === 'pinyin' ? [...new Set(tokens)].sort().join('|') : ''

  useEffect(() => {
    if (kind !== 'pinyin') return
    const uniq = [...new Set(tokens)].filter((w) => w.trim())
    const missing = uniq.filter((w) => !pinyinCache.has(w))
    if (!missing.length) {
      setMap(Object.fromEntries(uniq.map((w) => [w, pinyinCache.get(w) ?? ''])))
      return
    }
    let alive = true
    fetchPinyin(missing)
      .then((r) => {
        for (const [w, p] of Object.entries(r.readings)) pinyinCache.set(w, p)
        for (const w of missing) if (!pinyinCache.has(w)) pinyinCache.set(w, '')
        if (alive) setMap(Object.fromEntries(uniq.map((w) => [w, pinyinCache.get(w) ?? ''])))
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [key, kind])

  if (kind === 'romaja') {
    const out: Record<string, string> = {}
    for (const w of tokens) if (!(w in out)) out[w] = romanizeWord(w)
    return out
  }
  return kind === 'pinyin' ? map : {}
}

export function hasReading(lang: string): boolean {
  return studyLang(lang).reading !== null
}
