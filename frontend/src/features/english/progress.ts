import { useCallback, useEffect, useMemo, useState } from 'react'
import { UNITS, wTerm, type WeekPlan, type WeekTask } from '@/data/englishCore'
import { fetchAllCards } from '@/core/api/srs.api'
import { fetchActivityDaysApi, fetchPlanApi, savePlanApi, type ActivityDay } from '@/core/api/me.api'
import { getToken } from '@/core/api/client'

export { speakEN } from '@/core/tts'

const learnedKey = (lang: string) => `vyling.${lang}.learned`

function read(lang: string): string[] {
  try {
    const raw = localStorage.getItem(learnedKey(lang))
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function write(lang: string, list: string[]): void {
  try {
    localStorage.setItem(learnedKey(lang), JSON.stringify(list))
  } catch {
  }
}


const PLAN_KEY = 'vyling.en.plan'
const PLAN_ID = 'en90'

export interface PlanState {
  start: string | null
  manual: string[]
  quiz: Record<string, number>
  rewarded: number[]
}

function normalizePlan(raw: unknown): PlanState {
  const p = (raw ?? {}) as Partial<PlanState>
  return { start: p.start ?? null, manual: p.manual ?? [], quiz: p.quiz ?? {}, rewarded: p.rewarded ?? [] }
}

export function readPlan(): PlanState {
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    return normalizePlan(raw ? JSON.parse(raw) : null)
  } catch {
    return normalizePlan(null)
  }
}

function writePlan(p: PlanState): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(p))
  } catch {
  }
}


let planPushTimer: number | undefined

function pushPlanToServer(p: PlanState): void {
  if (!getToken()) return
  window.clearTimeout(planPushTimer)
  planPushTimer = window.setTimeout(() => {
    savePlanApi(PLAN_ID, p).catch(() => {  })
  }, 1200)
}

function mergePlan(a: PlanState, b: PlanState): PlanState {
  const quiz: Record<string, number> = { ...a.quiz }
  for (const [k, v] of Object.entries(b.quiz)) quiz[k] = Math.max(quiz[k] ?? 0, v)
  return {
    start: a.start && b.start ? (a.start < b.start ? a.start : b.start) : (a.start ?? b.start),
    manual: [...new Set([...a.manual, ...b.manual])],
    quiz,
    rewarded: [...new Set([...a.rewarded, ...b.rewarded])],
  }
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function planDay(start: string | null): number {
  if (!start) return 0
  const ms = Date.now() - new Date(start + 'T00:00:00').getTime()
  return Math.max(1, Math.floor(ms / 86400000) + 1)
}

export function planWeek(start: string | null): number {
  const day = planDay(start)
  if (!day) return 1
  return Math.min(12, Math.floor((day - 1) / 7) + 1)
}

export function recordWeekQuiz(week: number, pct: number): void {
  const p = readPlan()
  const key = `w${week}`
  p.quiz[key] = Math.max(p.quiz[key] ?? 0, pct)
  writePlan(p)
  pushPlanToServer(p)
}

export function usePlan() {
  const [plan, setPlan] = useState<PlanState>(readPlan)

  useEffect(() => {
    if (!getToken()) return
    let alive = true
    fetchPlanApi<PlanState>(PLAN_ID)
      .then((r) => {
        if (!alive) return
        const local = readPlan()
        if (r.data != null) {
          const merged = mergePlan(normalizePlan(r.data), local)
          writePlan(merged)
          setPlan(merged)
          pushPlanToServer(merged)
        } else if (local.start || local.manual.length || Object.keys(local.quiz).length) {
          savePlanApi(PLAN_ID, local).catch(() => {  })
        }
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [])

  const mutate = useCallback((fn: (p: PlanState) => PlanState) => {
    setPlan((prev) => {
      const next = fn(prev)
      writePlan(next)
      pushPlanToServer(next)
      return next
    })
  }, [])

  const startPlan = useCallback(() => {
    mutate((p) => (p.start ? p : { ...p, start: todayISO() }))
  }, [mutate])

  const toggleTask = useCallback((id: string) => {
    mutate((p) => ({
      ...p,
      manual: p.manual.includes(id) ? p.manual.filter((x) => x !== id) : [...p.manual, id],
    }))
  }, [mutate])

  const grantReward = useCallback((week: number) => {
    mutate((p) => (p.rewarded.includes(week) ? p : { ...p, rewarded: [...p.rewarded, week] }))
  }, [mutate])

  return { plan, startPlan, toggleTask, grantReward }
}

export function learnedInUnit(unitId: string, learned: Set<string>): number {
  const unit = UNITS.find((u) => u.id === unitId)
  return unit ? unit.words.filter((w) => learned.has(wTerm(w))).length : 0
}

export function vocabTarget(t: WeekTask): number {
  const unit = UNITS.find((u) => u.id === t.unitId)
  if (!unit) return 0
  return Math.ceil((unit.words.length * (t.pct ?? 100)) / 100)
}

export interface WeekActivity {
  videos: number
  reviewDays: number
}

export function useActivityDays(start: string | null): ActivityDay[] {
  const [days, setDays] = useState<ActivityDay[]>([])
  useEffect(() => {
    if (!start || !getToken()) { setDays([]); return }
    let alive = true
    fetchActivityDaysApi(start)
      .then((r) => { if (alive) setDays(r.days) })
      .catch(() => {  })
    return () => { alive = false }
  }, [start])
  return days
}

export function weekActivity(days: ActivityDay[], start: string | null, week: number): WeekActivity {
  if (!start || !days.length) return { videos: 0, reviewDays: 0 }
  const from = new Date(start + 'T00:00:00').getTime() + (week - 1) * 7 * 86400000
  const to = from + 7 * 86400000
  let videos = 0
  let reviewDays = 0
  for (const d of days) {
    const ts = new Date(d.day + 'T00:00:00').getTime()
    if (ts < from || ts >= to) continue
    videos += d.videos
    if (d.reviews > 0) reviewDays += 1
  }
  return { videos, reviewDays }
}

export function taskDone(
  t: WeekTask, week: number, learned: Set<string>, plan: PlanState, bank = 0, act?: WeekActivity,
): boolean {
  if (t.kind === 'vocab') return learnedInUnit(t.unitId ?? '', learned) >= vocabTarget(t)
  if (t.kind === 'quiz') return (plan.quiz[`w${week}`] ?? -1) >= (t.passPct ?? 70)
  if (t.kind === 'total') return bank >= (t.targetTotal ?? Infinity)
  if (t.kind === 'video' && act && t.n && act.videos >= t.n) return true
  if (t.kind === 'review' && act && t.n && act.reviewDays >= t.n) return true
  return plan.manual.includes(t.id)
}

export function weekDone(w: WeekPlan, learned: Set<string>, plan: PlanState, bank = 0, act?: WeekActivity): boolean {
  return w.tasks.every((t) => taskDone(t, w.week, learned, plan, bank, act))
}

const EN_FRONT_RE = /^[a-z][a-z'’ -]*$/i

export function useWordBank(learned: Set<string>): number {
  const [srsFronts, setSrsFronts] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    fetchAllCards()
      .then((r) => {
        if (!alive) return
        setSrsFronts(r.cards.map((c) => c.front.trim()).filter((f) => EN_FRONT_RE.test(f)))
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [])

  return useMemo(() => {
    const bank = new Set<string>()
    learned.forEach((w) => bank.add(w.toLowerCase()))
    srsFronts.forEach((w) => bank.add(w.toLowerCase()))
    return bank.size
  }, [learned, srsFronts])
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
  const [learned, setLearned] = useState<Set<string>>(() => new Set(read(lang)))

  useEffect(() => {
    setLearned(new Set(read(lang)))
  }, [lang])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === learnedKey(lang)) setLearned(new Set(read(lang)))
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
        const local = read(lang)
        const merged = [...new Set([...local, ...remote])]
        if (merged.length !== local.length) {
          write(lang, merged)
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
      write(lang, list)
      pushWordsToServer(lang, list)
      return next
    })
  }, [lang])

  const has = useCallback((word: string) => learned.has(word), [learned])

  return { learned, mark, has }
}
