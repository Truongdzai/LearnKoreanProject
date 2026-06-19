import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppView, ThemeMode } from '@/core/constants/enum'
import type { Lesson } from '@/models/lesson.model'
import type { Video } from '@/models/video.model'
import type { UserProfile, PlantedSeed } from '@/models/gamification.model'
import type { LearningPath } from '@/models/path.model'
import { fetchTranscript } from '@/core/api/learn.api'
import { SAMPLE_LESSON } from '@/data/sampleLesson'

const LS_KEY = 'vyling.v1'

interface Persisted {
  theme: ThemeMode
  user: UserProfile
  owned: string[]
  savedVideos: Video[]
  paths: LearningPath[]
  garden: PlantedSeed[]
}

const DEFAULT_USER: UserProfile = {
  name: 'Bạn',
  isPlus: false,
  coins: 480,
  xp: 4820,
  level: 12,
  streak: 5,
  equippedFrame: null,
}

function loadPersisted(): Persisted {
  const base: Persisted = { theme: 'dark', user: DEFAULT_USER, owned: [], savedVideos: [], paths: [], garden: [] }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return base
    const p = JSON.parse(raw) as Partial<Persisted>
    return {
      theme: p.theme === 'light' ? 'light' : 'dark',
      user: { ...DEFAULT_USER, ...(p.user || {}) },
      owned: p.owned || [],
      savedVideos: p.savedVideos || [],
      paths: p.paths || [],
      garden: p.garden || [],
    }
  } catch {
    return base
  }
}

interface AppStore {
  view: AppView
  setView: (v: AppView) => void

  theme: ThemeMode
  toggleTheme: () => void

  user: UserProfile
  addCoins: (n: number) => void
  spendCoins: (n: number) => boolean
  upgradePlus: () => void
  equipFrame: (id: string | null) => void

  owned: string[]
  buyItem: (id: string, price: number) => boolean

  savedVideos: Video[]
  saveVideo: (v: Video) => void
  removeVideo: (id: string) => void

  paths: LearningPath[]
  addPath: (p: LearningPath) => void

  garden: PlantedSeed[]
  plantSeed: (itemId: string, art: string, name: string) => void
  waterPlant: (id: string) => void
  removePlant: (id: string) => void

  lookupOpen: boolean
  openLookup: (term?: string) => void
  closeLookup: () => void
  lookupSeed: string

  lesson: Lesson | null
  status: string
  statusError: boolean
  loadLesson: (url: string) => Promise<void>
  loadSample: () => void
}

const AppContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadPersisted, [])
  const [view, setView] = useState<AppView>('home')
  const [theme, setTheme] = useState<ThemeMode>(initial.theme)
  const [user, setUser] = useState<UserProfile>(initial.user)
  const [owned, setOwned] = useState<string[]>(initial.owned)
  const [savedVideos, setSavedVideos] = useState<Video[]>(initial.savedVideos)
  const [paths, setPaths] = useState<LearningPath[]>(initial.paths)
  const [garden, setGarden] = useState<PlantedSeed[]>(initial.garden)

  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupSeed, setLookupSeed] = useState('')

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [status, setStatus] = useState('')
  const [statusError, setStatusError] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const data: Persisted = { theme, user, owned, savedVideos, paths, garden }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data))
    } catch {
      /* ignore quota */
    }
  }, [theme, user, owned, savedVideos, paths, garden])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const addCoins = useCallback((n: number) => setUser((u) => ({ ...u, coins: u.coins + n })), [])
  const spendCoins = useCallback((n: number) => {
    let ok = false
    setUser((u) => {
      if (u.coins >= n) {
        ok = true
        return { ...u, coins: u.coins - n }
      }
      return u
    })
    return ok
  }, [])
  const upgradePlus = useCallback(() => setUser((u) => ({ ...u, isPlus: true })), [])
  const equipFrame = useCallback((id: string | null) => setUser((u) => ({ ...u, equippedFrame: id })), [])

  const buyItem = useCallback((id: string, price: number) => {
    let ok = false
    setUser((u) => {
      if (u.coins >= price) {
        ok = true
        return { ...u, coins: u.coins - price }
      }
      return u
    })
    if (ok) setOwned((o) => (o.includes(id) ? o : [...o, id]))
    return ok
  }, [])

  const saveVideo = useCallback((v: Video) => {
    setSavedVideos((list) => (list.some((x) => x.id === v.id) ? list : [v, ...list]))
  }, [])
  const removeVideo = useCallback((id: string) => {
    setSavedVideos((list) => list.filter((x) => x.id !== id))
  }, [])

  const addPath = useCallback((p: LearningPath) => setPaths((list) => [p, ...list]), [])

  const plantSeed = useCallback((itemId: string, art: string, name: string) => {
    setGarden((g) => [...g, { id: 'pl' + Date.now() + Math.random().toString(36).slice(2, 6), itemId, art, name, growth: 8, plantedAt: Date.now() }])
  }, [])
  const waterPlant = useCallback((id: string) => {
    setGarden((g) => g.map((p) => (p.id === id ? { ...p, growth: Math.min(100, p.growth + 14) } : p)))
  }, [])
  const removePlant = useCallback((id: string) => setGarden((g) => g.filter((p) => p.id !== id)), [])

  const openLookup = useCallback((term = '') => {
    setLookupSeed(term)
    setLookupOpen(true)
  }, [])
  const closeLookup = useCallback(() => setLookupOpen(false), [])

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

  const value: AppStore = {
    view, setView,
    theme, toggleTheme,
    user, addCoins, spendCoins, upgradePlus, equipFrame,
    owned, buyItem,
    savedVideos, saveVideo, removeVideo,
    paths, addPath,
    garden, plantSeed, waterPlant, removePlant,
    lookupOpen, openLookup, closeLookup, lookupSeed,
    lesson, status, statusError, loadLesson, loadSample,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore phải được dùng bên trong <AppStoreProvider>')
  return ctx
}
