import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppView, ThemeMode } from '@/core/constants/enum'
import type { Lesson } from '@/models/lesson.model'
import type { Video } from '@/models/video.model'
import type { Account } from '@/models/account.model'
import type { PlantedSeed } from '@/models/gamification.model'
import type { LearningPath } from '@/models/path.model'
import { fetchTranscript } from '@/core/api/learn.api'
import { fetchVideos } from '@/core/api/content.api'
import {
  fetchState, buyItemApi, equipFrameApi, equipPetApi, upgradePlusApi, plantSeedApi, waterPlantApi,
  removePlantApi, addPathApi, saveVideoApi, removeVideoApi, claimQuestApi, dailyBonusApi,
  recordEventApi, type EventType,
} from '@/core/api/me.api'
import { SAMPLE_LESSON } from '@/data/sampleLesson'
import { viewAllowedForLang } from '@/core/constants/nav'
import { studyLang } from '@/core/constants/languages'
import { useAuth } from '@/store/auth.store'

const THEME_KEY = 'vyling.theme'
const LANG_KEY = 'vyling.learnLang'
const NATIVE_KEY = 'vyling.nativeLang'

const GUEST: Account = {
  id: '', name: 'Khách', provider: 'email', role: 'user',
  isPlus: false, coins: 0, xp: 0, level: 1, streak: 0, equippedFrame: null, equippedPet: null,
}

function loadTheme(): ThemeMode {
  try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' } catch { return 'dark' }
}

function loadLang(): string {
  try { return localStorage.getItem(LANG_KEY) || 'ko' } catch { return 'ko' }
}

function loadNative(): string {
  try { return localStorage.getItem(NATIVE_KEY) || 'vi' } catch { return 'vi' }
}

interface AppStore {
  view: AppView
  setView: (v: AppView) => void

  theme: ThemeMode
  toggleTheme: () => void

  learnLang: string
  setLearnLang: (code: string) => void

  nativeLang: string
  setNativeLang: (code: string) => void

  /** One-shot signal asking PathPage to open its wizard (e.g. after switching language). */
  wizardRequested: boolean
  requestWizard: () => void
  clearWizard: () => void

  user: Account
  isAuthed: boolean

  videos: Video[]

  owned: string[]
  savedVideos: Video[]
  paths: LearningPath[]
  garden: PlantedSeed[]

  buyItem: (itemId: string) => Promise<void>
  equipFrame: (frame: string | null) => Promise<void>
  equipPet: (pet: string | null) => Promise<void>
  upgradePlus: (planId?: string) => Promise<void>
  plantSeed: (itemId: string, art: string, name: string) => Promise<void>
  waterPlant: (id: string) => Promise<void>
  removePlant: (id: string) => Promise<void>
  saveVideo: (v: Video) => Promise<void>
  removeVideo: (id: string) => Promise<void>
  addPath: (p: LearningPath) => Promise<void>
  claimQuest: (id: string) => Promise<void>
  dailyBonus: () => Promise<number>
  recordEvent: (type: EventType, amount?: number, minutes?: number, words?: number) => void

  lookupOpen: boolean
  openLookup: (term?: string) => void
  closeLookup: () => void
  lookupSeed: string

  lesson: Lesson | null
  status: string
  statusError: boolean
  loadLesson: (url: string, opts?: { lang?: string; video?: Video }) => Promise<void>
  loadSample: () => void
}

const AppContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { account, isAuthed, setAccount, openAuth, setBonusAvailable } = useAuth()

  const [view, setView] = useState<AppView>('home')
  const [theme, setTheme] = useState<ThemeMode>(loadTheme)
  const [learnLang, setLearnLangState] = useState<string>(loadLang)
  const [nativeLang, setNativeLangState] = useState<string>(loadNative)
  const [wizardRequested, setWizardRequested] = useState(false)

  const [videos, setVideos] = useState<Video[]>([])
  const [owned, setOwned] = useState<string[]>([])
  const [savedVideos, setSavedVideos] = useState<Video[]>([])
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [garden, setGarden] = useState<PlantedSeed[]>([])

  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupSeed, setLookupSeed] = useState('')

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [status, setStatus] = useState('')
  const [statusError, setStatusError] = useState(false)

  const user = account ?? GUEST

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
  }, [theme])

  useEffect(() => {
    fetchVideos().then((r) => setVideos(r.videos)).catch(() => setVideos([]))
  }, [])

  useEffect(() => {
    if (!isAuthed) {
      setOwned([]); setSavedVideos([]); setPaths([]); setGarden([])
      return
    }
    fetchState()
      .then((s) => {
        setOwned(s.owned)
        setSavedVideos(s.savedVideos)
        setPaths(s.paths)
        setGarden(s.garden)
        setAccount(s.user)
      })
      .catch(() => { /* ignore */ })
  }, [isAuthed, setAccount])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const setLearnLang = useCallback((code: string) => {
    setLearnLangState(code)
    try { localStorage.setItem(LANG_KEY, code) } catch { /* ignore */ }
    // Leaving a view that no longer belongs to this language → back home.
    if (!viewAllowedForLang(view, code)) setView('home')
  }, [view])

  const setNativeLang = useCallback((code: string) => {
    setNativeLangState(code)
    try { localStorage.setItem(NATIVE_KEY, code) } catch { /* ignore */ }
  }, [])

  const requestWizard = useCallback(() => setWizardRequested(true), [])
  const clearWizard = useCallback(() => setWizardRequested(false), [])

  const guard = useCallback((): boolean => {
    if (isAuthed) return true
    openAuth()
    return false
  }, [isAuthed, openAuth])

  const buyItem = useCallback(async (itemId: string) => {
    if (!guard()) throw new Error('Hãy đăng nhập để mua vật phẩm.')
    const r = await buyItemApi(itemId)
    setOwned(r.owned)
    setAccount(r.user)
  }, [guard, setAccount])

  const equipFrame = useCallback(async (frame: string | null) => {
    if (!guard()) return
    const r = await equipFrameApi(frame)
    setAccount(r.user)
  }, [guard, setAccount])

  const equipPet = useCallback(async (pet: string | null) => {
    if (!guard()) return
    const r = await equipPetApi(pet)
    setAccount(r.user)
  }, [guard, setAccount])

  const upgradePlus = useCallback(async (planId = '') => {
    if (!guard()) return
    const r = await upgradePlusApi(planId)
    setAccount(r.user)
  }, [guard, setAccount])

  const plantSeed = useCallback(async (itemId: string, art: string, name: string) => {
    if (!guard()) return
    const r = await plantSeedApi(itemId, art, name)
    setGarden(r.garden)
  }, [guard])

  const waterPlant = useCallback(async (id: string) => {
    const r = await waterPlantApi(id)
    setGarden(r.garden)
  }, [])

  const removePlant = useCallback(async (id: string) => {
    const r = await removePlantApi(id)
    setGarden(r.garden)
  }, [])

  const saveVideo = useCallback(async (v: Video) => {
    if (!isAuthed) return
    const r = await saveVideoApi(v)
    setSavedVideos(r.savedVideos)
  }, [isAuthed])

  const removeVideo = useCallback(async (id: string) => {
    const r = await removeVideoApi(id)
    setSavedVideos(r.savedVideos)
  }, [])

  const addPath = useCallback(async (p: LearningPath) => {
    if (!guard()) throw new Error('Hãy đăng nhập để lưu lộ trình.')
    const r = await addPathApi(`${p.language} · ${p.level}`, p as unknown as Record<string, unknown>)
    setPaths(r.paths)
  }, [guard])

  const claimQuest = useCallback(async (id: string) => {
    if (!guard()) throw new Error('Hãy đăng nhập để nhận thưởng.')
    const r = await claimQuestApi(id)
    setAccount(r.user)
  }, [guard, setAccount])

  const dailyBonus = useCallback(async (): Promise<number> => {
    if (!guard()) throw new Error('Hãy đăng nhập để nhận thưởng.')
    const r = await dailyBonusApi()
    setAccount(r.user)
    setBonusAvailable(false)
    return r.reward
  }, [guard, setAccount, setBonusAvailable])

  const recordEvent = useCallback((type: EventType, amount = 1, minutes = 0, words = 0) => {
    if (!isAuthed) return
    recordEventApi(type, amount, minutes, words)
      .then((r) => setAccount(r.user))
      .catch(() => { /* non-blocking */ })
  }, [isAuthed, setAccount])

  const openLookup = useCallback((term = '') => {
    setLookupSeed(term)
    setLookupOpen(true)
  }, [])
  const closeLookup = useCallback(() => setLookupOpen(false), [])

  const loadLesson = useCallback(async (url: string, opts?: { lang?: string; video?: Video }) => {
    const u = (url || '').trim()
    const lang = opts?.lang || learnLang
    if (!u) {
      setStatusError(false)
      setStatus(`Hãy dán link YouTube ${studyLang(lang).name}.`)
      return
    }
    setStatusError(false)
    setStatus('Đang lấy phụ đề & dịch... (10–60 giây tùy độ dài video)')
    setLesson(null)
    setView('learn')
    try {
      const d = await fetchTranscript(u, lang)
      setLesson(d)
      setStatus('')
      recordEvent('video', 1, 0, 0)
      // Only save to "Video của tôi" once the lesson actually loaded — never save a broken video.
      if (opts?.video) saveVideo(opts.video)
    } catch (e) {
      setStatusError(true)
      setStatus((e as Error).message)
    }
  }, [recordEvent, learnLang, saveVideo])

  const loadSample = useCallback(() => {
    setStatusError(false)
    setStatus('')
    setLesson(SAMPLE_LESSON)
    setView('learn')
  }, [])

  const value: AppStore = {
    view, setView,
    theme, toggleTheme,
    learnLang, setLearnLang,
    nativeLang, setNativeLang,
    wizardRequested, requestWizard, clearWizard,
    user, isAuthed,
    videos,
    owned, savedVideos, paths, garden,
    buyItem, equipFrame, equipPet, upgradePlus,
    plantSeed, waterPlant, removePlant,
    saveVideo, removeVideo, addPath,
    claimQuest, dailyBonus, recordEvent,
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
