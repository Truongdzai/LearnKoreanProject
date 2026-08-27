import { useEffect, useState } from 'react'

let words: Set<string> | null = null
let pending: Promise<void> | null = null
const listeners = new Set<() => void>()

export function loadStaticImages(): Promise<void> {
  if (words) return Promise.resolve()
  if (!pending) {
    pending = import('@/data/english/wordImages.json')
      .then((m) => {
        words = new Set(((m.default as { words?: string[] }).words ?? []).map((w) => w.toLowerCase()))
      })
      .catch(() => {
        words = new Set()
      })
      .then(() => {
        for (const fn of listeners) fn()
      })
  }
  return pending
}

export function staticImage(term: string): string | null {
  if (!words) return null
  const key = term.trim().toLowerCase().replace(/[?:/\\*"<>|]/g, '').trim()
  return words.has(key) ? `/wordimg/${encodeURIComponent(key)}.webp` : null
}

export function useStaticImages(): boolean {
  const [ready, setReady] = useState(() => !!words)

  useEffect(() => {
    if (words) { setReady(true); return }
    const notify = () => setReady(true)
    listeners.add(notify)
    return () => { listeners.delete(notify) }
  }, [])

  return ready
}
