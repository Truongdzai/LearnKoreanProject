import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { AppView } from '@/core/constants/enum'
import type { Lesson } from '@/models/lesson.model'
import { fetchTranscript } from '@/core/api/learn.api'
import { SAMPLE_LESSON } from '@/data/sampleLesson'

interface AppStore {
  view: AppView
  setView: (v: AppView) => void
  lesson: Lesson | null
  status: string
  statusError: boolean
  loadLesson: (url: string) => Promise<void>
  loadSample: () => void
}

const AppContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>('home')
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [status, setStatus] = useState('')
  const [statusError, setStatusError] = useState(false)

  const loadLesson = useCallback(async (url: string) => {
    const u = (url || '').trim()
    if (!u) {
      setStatusError(false)
      setStatus('Hãy dán link YouTube tiếng Hàn.')
      return
    }
    setStatusError(false)
    setStatus('Đang lấy phụ đề & dịch... (10–60 giây tùy độ dài video)')
    setLesson(null)
    setView('learn')
    try {
      const d = await fetchTranscript(u)
      setLesson(d)
      setStatus('')
    } catch (e) {
      setStatusError(true)
      setStatus((e as Error).message)
    }
  }, [])

  const loadSample = useCallback(() => {
    setStatusError(false)
    setStatus('')
    setLesson(SAMPLE_LESSON)
    setView('learn')
  }, [])

  return (
    <AppContext.Provider value={{ view, setView, lesson, status, statusError, loadLesson, loadSample }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore phải được dùng bên trong <AppStoreProvider>')
  return ctx
}
