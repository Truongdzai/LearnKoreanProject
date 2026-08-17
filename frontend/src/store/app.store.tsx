import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AppView, ThemeMode } from '@/core/constants/enum'
import type { Lesson } from '@/models/lesson.model'
import type { Video } from '@/models/video.model'
import type { Account } from '@/models/account.model'
import type { PlantedSeed } from '@/models/gamification.model'
import type { LearningPath } from '@/models/path.model'
import { fetchTranscript, translateLines } from '@/core/api/learn.api'
import { fetchVideos } from '@/core/api/content.api'
import {
  fetchState, buyItemApi, equipFrameApi, equipPetApi, equipBgApi, setAvatarApi, upgradePlusApi, plantSeedApi, waterPlantApi,
  removePlantApi, addPathApi, saveVideoApi, removeVideoApi, claimQuestApi, dailyBonusApi,
  recordEventApi, setGoalApi, goalBonusApi, type EventType,
} from '@/core/api/me.api'
import { langsForView, viewAllowedForLang } from '@/core/constants/nav'
import { META_DESC, PUBLIC_VIEWS, pathForView, titleKeyForView, viewForPath } from '@/core/constants/routes'
import { studyLang, AVAILABLE_STUDY_LANGS, NATIVE_CODE } from '@/core/constants/languages'
import { translate, studyLangName, type UiLang } from '@/core/i18n/translations'
import { pageview } from '@/core/analytics'
import { announce } from '@/core/a11y'
import { track } from '@/core/monitor'
import { useAuth } from '@/store/auth.store'

const THEME_KEY = 'vyling.theme'
const LANG_KEY = 'vyling.learnLang'
const NATIVE_KEY = 'vyling.nativeLang'
const GOAL_KEY = 'vyling.goal'
const GOAL_ASKED_KEY = 'vyling.goalAsked'
const DAILY_GOAL_KEY = 'vyling.dailyGoal'
const TODAY_XP_KEY = 'vyling.todayXp'
const UI_LANG_KEY = 'vyling.uiLang'

function loadUiLang(nativeCode: string): UiLang {
  try {
    const saved = localStorage.getItem(UI_LANG_KEY)
    if (saved === 'vi' || saved === 'en') return saved
  } catch {  }
  return nativeCode === 'vi' ? 'vi' : 'en'
}

const EVENT_XP: Record<string, number> = { lesson: 30, pronounce: 5, review: 2, video: 25, word: 4, login: 0, toeic: 10 }

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadTodayXp(): number {
  try {
    const raw = JSON.parse(localStorage.getItem(TODAY_XP_KEY) || '{}')
    return raw.d === todayKey() ? Number(raw.xp) || 0 : 0
  } catch { return 0 }
}

function saveTodayXp(xp: number) {
  try { localStorage.setItem(TODAY_XP_KEY, JSON.stringify({ d: todayKey(), xp })) } catch {  }
}

function loadDailyGoal(): number {
  try { return Number(localStorage.getItem(DAILY_GOAL_KEY)) || 50 } catch { return 50 }
}

const GUEST: Account = {
  id: '', name: 'Khách', provider: 'email', role: 'user',
  isPlus: false, coins: 0, xp: 0, level: 1, streak: 0, equippedFrame: null, equippedPet: null, equippedBg: null,
}

function loadTheme(): ThemeMode {
  try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' } catch { return 'dark' }
}

function loadLang(): string {
  const fallback = AVAILABLE_STUDY_LANGS[0]?.code || 'en'
  try {
    const saved = localStorage.getItem(LANG_KEY) || fallback
    return AVAILABLE_STUDY_LANGS.some((l) => l.code === saved) ? saved : fallback
  } catch { return fallback }
}

function loadNative(): string {
  return NATIVE_CODE
}

async function applyNativeTranslation(d: Lesson, lang: string, native: string): Promise<Lesson> {
  if (!native || native === 'vi' || native === lang) return d
  const lines = d.segments.map((s) => s.ko)
  if (!lines.length) return d
  try {
    const r = await translateLines(lines, lang, native)
    const tr = r.lines || []
    const segments = d.segments.map((s, i) => (tr[i] ? { ...s, vi: tr[i] } : s))
    return { ...d, segments }
  } catch {
    return d
  }
}

function loadGoal(): string {
  try { return localStorage.getItem(GOAL_KEY) || '' } catch { return '' }
}

function goalAsked(): boolean {
  try { return !!localStorage.getItem(GOAL_ASKED_KEY) } catch { return true }
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

  uiLang: UiLang
  setUiLang: (l: UiLang) => void
  t: (key: string, params?: Record<string, string | number>) => string
  learnLangName: string

  wizardRequested: boolean
  requestWizard: () => void
  clearWizard: () => void

  goal: string
  setGoal: (g: string) => void
  onboardingOpen: boolean
  openOnboarding: () => void
  askGoalOnce: () => void
  closeOnboarding: () => void

  dailyGoalXp: number
  setDailyGoalXp: (n: number) => void
  todayXp: number
  goalBonusClaimed: boolean
  claimGoalBonus: () => Promise<number>

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
  equipBg: (bg: string | null) => Promise<void>
  setAvatar: (avatar: string | null) => Promise<void>
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
}

const AppContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { account, isAuthed, setAccount, openAuth, setBonusAvailable } = useAuth()

  const [view, setViewState] = useState<AppView>(() => viewForPath(window.location.pathname) || 'home')
  const [theme, setTheme] = useState<ThemeMode>(loadTheme)
  const [learnLang, setLearnLangState] = useState<string>(loadLang)
  const [nativeLang, setNativeLangState] = useState<string>(loadNative)
  const [uiLang, setUiLangState] = useState<UiLang>(() => loadUiLang(loadNative()))
  const [wizardRequested, setWizardRequested] = useState(false)
  const [goal, setGoalState] = useState<string>(loadGoal)
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false)
  const [dailyGoalXp, setDailyGoalXpState] = useState<number>(loadDailyGoal)
  const [todayXp, setTodayXp] = useState<number>(loadTodayXp)
  const [goalBonusClaimed, setGoalBonusClaimed] = useState(false)

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

  const setView = useCallback((v: AppView) => {
    setViewState(v)
    const path = pathForView(v)
    if (window.location.pathname !== path) window.history.pushState({ view: v }, '', path)
  }, [])

  const applyPath = useCallback((pathname: string) => {
    const v = viewForPath(pathname)
    if (!v) {
      setViewState('notfound')
      return
    }
    if (!viewAllowedForLang(v, loadLang())) {
      const langs = langsForView(v)
      if (langs && langs.length) {
        setLearnLangState(langs[0])
        try { localStorage.setItem(LANG_KEY, langs[0]) } catch {  }
      }
    }
    setViewState(v)
  }, [])

  useEffect(() => {
    applyPath(window.location.pathname)
    const onPop = () => applyPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [applyPath])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch {  }
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
        const xp = Math.max(s.todayXp || 0, loadTodayXp())
        setTodayXp(xp)
        saveTodayXp(xp)
        setGoalBonusClaimed(!!s.goalBonusClaimed)
      })
      .catch(() => {  })
  }, [isAuthed, setAccount])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const setLearnLang = useCallback((code: string) => {
    setLearnLangState(code)
    try { localStorage.setItem(LANG_KEY, code) } catch {  }
    if (!viewAllowedForLang(view, code)) setView('home')
  }, [view])

  const setNativeLang = useCallback((code: string) => {
    setNativeLangState(code)
    try {
      localStorage.setItem(NATIVE_KEY, code)
      if (!localStorage.getItem(UI_LANG_KEY)) setUiLangState(code === 'vi' ? 'vi' : 'en')
    } catch {  }
  }, [])

  const setUiLang = useCallback((l: UiLang) => {
    setUiLangState(l)
    try { localStorage.setItem(UI_LANG_KEY, l) } catch {  }
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(uiLang, key, params),
    [uiLang],
  )

  const learnLangName = studyLangName(uiLang, learnLang)
  const firstView = useRef(true)

  useEffect(() => {
    const label = translate(uiLang, titleKeyForView(view))
    const title = view === 'home'
      ? `VyLing — ${translate(uiLang, 'brand.tagline')}`
      : `${label} · VyLing`
    document.title = title
    document.documentElement.lang = uiLang

    const isPublic = PUBLIC_VIEWS.includes(view)
    const desc = META_DESC[view] ?? META_DESC.home ?? ''
    const url = window.location.origin + pathForView(view)
    const setMeta = (sel: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(sel)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    setMeta('meta[name="description"]', 'name', 'description', desc)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc)
    setMeta('meta[name="robots"]', 'name', 'robots', isPublic ? 'index, follow' : 'noindex, follow')

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url

    pageview(pathForView(view), title)

    if (firstView.current) firstView.current = false
    else announce(translate(uiLang, 'a11y.page', { name: label }))
  }, [view, uiLang])

  const requestWizard = useCallback(() => setWizardRequested(true), [])
  const clearWizard = useCallback(() => setWizardRequested(false), [])

  const setGoal = useCallback((g: string) => {
    setGoalState(g)
    try {
      if (g) localStorage.setItem(GOAL_KEY, g)
      else localStorage.removeItem(GOAL_KEY)
      localStorage.setItem(GOAL_ASKED_KEY, '1')
    } catch {  }
    if (isAuthed) {
      setGoalApi(g || null).then((r) => setAccount(r.user)).catch(() => {  })
    }
  }, [isAuthed, setAccount])

  const openOnboarding = useCallback(() => setOnboardingOpen(true), [])
  const askGoalOnce = useCallback(() => {
    if (loadGoal() || goalAsked()) return
    setOnboardingOpen(true)
  }, [])
  const closeOnboarding = useCallback(() => {
    setOnboardingOpen(false)
    try { localStorage.setItem(GOAL_ASKED_KEY, '1') } catch {  }
  }, [])

  useEffect(() => {
    if (!isAuthed || !account) return
    const remote = account.goal || ''
    if (remote && remote !== goal) {
      setGoalState(remote)
      try { localStorage.setItem(GOAL_KEY, remote); localStorage.setItem(GOAL_ASKED_KEY, '1') } catch {  }
    } else if (!remote && goal) {
      setGoalApi(goal).then((r) => setAccount(r.user)).catch(() => {  })
    }
  }, [isAuthed, account?.goal])

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

  const equipBg = useCallback(async (bg: string | null) => {
    if (!guard()) return
    const r = await equipBgApi(bg)
    setAccount(r.user)
  }, [guard, setAccount])

  const setAvatar = useCallback(async (avatar: string | null) => {
    if (!guard()) return
    const r = await setAvatarApi(avatar)
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
    const gain = (EVENT_XP[type] || 0) * Math.max(0, amount)
    if (gain) {
      setTodayXp((x) => {
        const nx = x + gain
        saveTodayXp(nx)
        return nx
      })
    }
    if (!isAuthed) return
    recordEventApi(type, amount, minutes, words)
      .then((r) => setAccount(r.user))
      .catch(() => {  })
  }, [isAuthed, setAccount])

  const setDailyGoalXp = useCallback((n: number) => {
    setDailyGoalXpState(n)
    try { localStorage.setItem(DAILY_GOAL_KEY, String(n)) } catch {  }
  }, [])

  const claimGoalBonus = useCallback(async (): Promise<number> => {
    if (!guard()) throw new Error('Hãy đăng nhập để nhận thưởng.')
    const r = await goalBonusApi(dailyGoalXp)
    setAccount(r.user)
    setGoalBonusClaimed(true)
    return r.reward
  }, [guard, dailyGoalXp, setAccount])

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
    setStatus(translate(uiLang, 'learn.preparing'))
    const slowNotice = setTimeout(() => setStatus(translate(uiLang, 'learn.fetching')), 1500)
    setLesson(null)
    setView('learn')
    track('lesson_start', { lang, from: opts?.video ? 'catalog' : 'paste' })
    try {
      const d = await fetchTranscript(u, lang)
      clearTimeout(slowNotice)
      setLesson(d)
      setStatus('')
      track('lesson_ready', { lang, segments: d.segments?.length || 0 })
      recordEvent('video', 1, 0, 0)
      if (opts?.video) saveVideo(opts.video)
      if (nativeLang !== 'vi' && nativeLang !== lang) {
        const nd = await applyNativeTranslation(d, lang, nativeLang)
        setLesson((prev) => (prev && prev.id === nd.id ? nd : prev))
      }
    } catch (e) {
      clearTimeout(slowNotice)
      setStatusError(true)
      setStatus((e as Error).message)
      track('lesson_failed', { lang, reason: (e as Error).message.slice(0, 60) })
    }
  }, [recordEvent, learnLang, nativeLang, saveVideo, uiLang])

  const value: AppStore = {
    view, setView,
    theme, toggleTheme,
    learnLang, setLearnLang,
    nativeLang, setNativeLang,
    uiLang, setUiLang, t, learnLangName,
    wizardRequested, requestWizard, clearWizard,
    goal, setGoal, onboardingOpen, openOnboarding, askGoalOnce, closeOnboarding,
    dailyGoalXp, setDailyGoalXp, todayXp, goalBonusClaimed, claimGoalBonus,
    user, isAuthed,
    videos,
    owned, savedVideos, paths, garden,
    buyItem, equipFrame, equipPet, equipBg, setAvatar, upgradePlus,
    plantSeed, waterPlant, removePlant,
    saveVideo, removeVideo, addPath,
    claimQuest, dailyBonus, recordEvent,
    lookupOpen, openLookup, closeLookup, lookupSeed,
    lesson, status, statusError, loadLesson,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore phải được dùng bên trong <AppStoreProvider>')
  return ctx
}
