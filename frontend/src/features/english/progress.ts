import { useCallback, useEffect, useState } from 'react'

/** Phát âm tiếng Anh bằng Web Speech API (phần "Sound" của ICES). */
export function speakEN(text: string, rate = 0.95): void {
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = rate
    speechSynthesis.speak(u)
  } catch {
    /* trình duyệt không hỗ trợ */
  }
}

const KEY = 'vyling.en.learned'

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function write(list: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/** Quản lý tập từ đã thuộc, lưu trong localStorage để giữ tiến độ cho cả khách. */
export function useLearnedWords() {
  const [learned, setLearned] = useState<Set<string>>(() => new Set(read()))

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setLearned(new Set(read()))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const mark = useCallback((word: string, on = true) => {
    setLearned((prev) => {
      const next = new Set(prev)
      if (on) next.add(word)
      else next.delete(word)
      write([...next])
      return next
    })
  }, [])

  const has = useCallback((word: string) => learned.has(word), [learned])

  return { learned, mark, has }
}
