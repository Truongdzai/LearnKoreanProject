import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchIpa, fetchPinyin } from '@/core/api/dict.api'
import { romanizeLine } from '@/core/utils/romanize'
import { jamoTokens } from '@/core/utils/pronounce'
import { normWord, splitWords } from '@/core/utils/speechDiff'

interface Entry { read: string; ph: string[] }

export interface Phonetics {
  ready: boolean
  supported: boolean
  version: number
  read: (word: string) => string
  phones: (word: string) => string[]
  line: (text: string) => string
  ensure: (words: string[]) => Promise<void>
}

const BATCH = 400

export function usePhonetics(lang: string, source: string[]): Phonetics {
  const supported = lang === 'en' || lang === 'zh' || lang === 'ko'
  const remote = lang === 'en' || lang === 'zh'
  const table = useRef<Record<string, Entry>>({})
  const asked = useRef<Set<string>>(new Set())
  const [version, setVersion] = useState(0)
  const [ready, setReady] = useState(!remote)

  const key = useCallback(
    (word: string) => (lang === 'zh' ? word.trim() : normWord(word) || word.trim()),
    [lang],
  )

  const ensure = useCallback(async (words: string[]) => {
    if (!remote) return
    const fresh: string[] = []
    for (const w of words) {
      const k = key(w)
      if (!k || asked.current.has(k)) continue
      asked.current.add(k)
      fresh.push(w.trim())
    }
    if (!fresh.length) return
    try {
      if (lang === 'en') {
        const r = await fetchIpa(fresh.slice(0, BATCH))
        for (const [w, v] of Object.entries(r.readings)) {
          table.current[key(w)] = { read: v.ipa, ph: v.ph.split(' ').filter(Boolean) }
        }
      } else {
        const r = await fetchPinyin(fresh.slice(0, BATCH))
        for (const [w, v] of Object.entries(r.readings)) {
          table.current[key(w)] = { read: v, ph: v.split(/\s+/).filter(Boolean) }
        }
      }
      setVersion((v) => v + 1)
    } catch {  }
  }, [lang, remote, key])

  const words = useMemo(() => {
    const set = new Set<string>()
    source.forEach((line) => splitWords(line, lang).forEach((w) => set.add(w)))
    return Array.from(set)
  }, [source, lang])

  useEffect(() => {
    table.current = {}
    asked.current = new Set()
    setVersion((v) => v + 1)
    if (!remote) { setReady(true); return }
    setReady(false)
    let alive = true
    ensure(words).finally(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [lang, words, remote, ensure])

  const entry = useCallback((word: string): Entry | null => {
    const hit = table.current[key(word)]
    if (hit) return hit
    if (lang === 'ko') return { read: romanizeLine(word), ph: jamoTokens(word) }
    return null
  }, [key, lang])

  const read = useCallback((word: string) => entry(word)?.read || '', [entry])

  const phones = useCallback((word: string) => {
    const e = entry(word)
    return e?.ph.length ? e.ph : Array.from(normWord(word))
  }, [entry])

  const line = useCallback((text: string) => {
    if (lang === 'ko') return romanizeLine(text)
    return splitWords(text, lang).map((w) => read(w)).filter(Boolean).join(' ')
  }, [lang, read])

  return { ready, supported, version, read, phones, line, ensure }
}
