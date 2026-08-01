import { useCallback, useEffect, useMemo, useState } from 'react'
import { wTerm } from '@/data/vocabCore'
import type { VocabUnit, WeekPlan, WeekTask } from '@/data/englishCore'
import EN_UNIT_TERMS from '@/data/english/unitTerms.json'
import { GRAMMAR_LESSONS, GRAMMAR_PASS } from '@/data/englishGrammar'
import { PRON_GROUPS, PRON_PASS, type PronGroup } from '@/data/englishPronunciation'
import { fetchAllCards } from '@/core/api/srs.api'
import { fetchActivityDaysApi, fetchPlanApi, savePlanApi, type ActivityDay } from '@/core/api/me.api'
import { getToken } from '@/core/api/client'
import { track } from '@/core/monitor'
import { useServerPlan } from '@/core/hooks/useServerPlan'

export { speakEN } from '@/core/tts'
export { useLearnedWords, readLearned, writeLearned } from './learned'



const planKey = (lang: string) => `vyling.${lang}.plan`
const planId = (lang: string) => `${lang}90`

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

export function readPlan(lang = 'en'): PlanState {
  try {
    const raw = localStorage.getItem(planKey(lang))
    return normalizePlan(raw ? JSON.parse(raw) : null)
  } catch {
    return normalizePlan(null)
  }
}

function writePlan(p: PlanState, lang: string): void {
  try {
    localStorage.setItem(planKey(lang), JSON.stringify(p))
  } catch {
  }
}


const planPushTimers: Record<string, number | undefined> = {}

function pushPlanToServer(p: PlanState, lang: string): void {
  if (!getToken()) return
  window.clearTimeout(planPushTimers[lang])
  planPushTimers[lang] = window.setTimeout(() => {
    savePlanApi(planId(lang), p).catch(() => {  })
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

export function recordWeekQuiz(week: number, pct: number, lang = 'en'): void {
  const p = readPlan(lang)
  const key = `w${week}`
  p.quiz[key] = Math.max(p.quiz[key] ?? 0, pct)
  writePlan(p, lang)
  pushPlanToServer(p, lang)
  track('week_quiz', { lang, week, pct })
}

export function usePlan(lang = 'en') {
  const [plan, setPlan] = useState<PlanState>(() => readPlan(lang))

  useEffect(() => {
    if (!getToken()) return
    let alive = true
    fetchPlanApi<PlanState>(planId(lang))
      .then((r) => {
        if (!alive) return
        const local = readPlan(lang)
        if (r.data != null) {
          const merged = mergePlan(normalizePlan(r.data), local)
          writePlan(merged, lang)
          setPlan(merged)
          pushPlanToServer(merged, lang)
        } else if (local.start || local.manual.length || Object.keys(local.quiz).length) {
          savePlanApi(planId(lang), local).catch(() => {  })
        }
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [lang])

  const mutate = useCallback((fn: (p: PlanState) => PlanState) => {
    setPlan((prev) => {
      const next = fn(prev)
      writePlan(next, lang)
      pushPlanToServer(next, lang)
      return next
    })
  }, [lang])

  const startPlan = useCallback(() => {
    mutate((p) => {
      if (p.start) return p
      track('roadmap_start', { lang })
      return { ...p, start: todayISO() }
    })
  }, [mutate, lang])

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

export interface GrammarProgress {
  best: Record<string, number>
  rewarded: string[]
}

const GRAMMAR_KEY = 'vyling.en.grammar'
const GRAMMAR_PLAN_ID = 'engrammar'

function normalizeGrammar(raw: unknown): GrammarProgress {
  const p = (raw ?? {}) as Partial<GrammarProgress>
  return {
    best: p.best && typeof p.best === 'object' ? p.best : {},
    rewarded: Array.isArray(p.rewarded) ? p.rewarded : [],
  }
}

function grammarEmpty(g: GrammarProgress): boolean {
  return !Object.keys(g.best).length && !g.rewarded.length
}

export function readGrammarBest(): Record<string, number> {
  try {
    const raw = localStorage.getItem(GRAMMAR_KEY)
    return normalizeGrammar(raw ? JSON.parse(raw) : null).best
  } catch {
    return {}
  }
}

export function useGrammarProgress() {
  const { state, mutate } = useServerPlan<GrammarProgress>(GRAMMAR_PLAN_ID, GRAMMAR_KEY, normalizeGrammar, grammarEmpty)

  const record = useCallback((lessonId: string, pct: number): boolean => {
    const firstPass = pct >= GRAMMAR_PASS && !state.rewarded.includes(lessonId)
    mutate((p) => ({
      best: { ...p.best, [lessonId]: Math.max(p.best[lessonId] ?? 0, pct) },
      rewarded: pct >= GRAMMAR_PASS && !p.rewarded.includes(lessonId) ? [...p.rewarded, lessonId] : p.rewarded,
    }))
    return firstPass
  }, [mutate, state.rewarded])

  return { grammar: state, record }
}

export interface PronProgress {
  best: Record<string, number>
  rewarded: string[]
}

const pronKey = (lang: string) => `vyling.${lang}.pron`
const pronPlanId = (lang: string) => `${lang}pron`

function normalizePron(raw: unknown): PronProgress {
  const p = (raw ?? {}) as Partial<PronProgress>
  return {
    best: p.best && typeof p.best === 'object' ? p.best : {},
    rewarded: Array.isArray(p.rewarded) ? p.rewarded : [],
  }
}

function pronEmpty(p: PronProgress): boolean {
  return !Object.keys(p.best).length && !p.rewarded.length
}

export function readPronBest(lang = 'en'): Record<string, number> {
  try {
    const raw = localStorage.getItem(pronKey(lang))
    return normalizePron(raw ? JSON.parse(raw) : null).best
  } catch {
    return {}
  }
}

export function usePronProgress(lang = 'en') {
  const { state, mutate } = useServerPlan<PronProgress>(pronPlanId(lang), pronKey(lang), normalizePron, pronEmpty)

  const record = useCallback((groupId: string, pct: number): boolean => {
    const firstPass = pct >= PRON_PASS && !state.rewarded.includes(groupId)
    mutate((p) => ({
      best: { ...p.best, [groupId]: Math.max(p.best[groupId] ?? 0, pct) },
      rewarded: pct >= PRON_PASS && !p.rewarded.includes(groupId) ? [...p.rewarded, groupId] : p.rewarded,
    }))
    return firstPass
  }, [mutate, state.rewarded])

  return { pron: state, record }
}

export function grammarTaskDone(t: WeekTask, best: Record<string, number>): boolean {
  if (t.lessonId) return (best[t.lessonId] ?? 0) >= GRAMMAR_PASS
  return GRAMMAR_LESSONS.every((l) => (best[l.id] ?? 0) >= GRAMMAR_PASS)
}


export interface DayPlan {
  day: number
  theme: string
  taskIds: string[]
  note?: string
}

export interface WeekSchedule {
  days: DayPlan[]
  weekLong: string[]
}

const LEARN_KINDS: WeekTask['kind'][] = ['vocab', 'grammar', 'pron', 'video', 'speak', 'custom']
const WEEKLONG_KINDS: WeekTask['kind'][] = ['review', 'total', 'toeic']

const DAY_THEME: Partial<Record<WeekTask['kind'], string>> = {
  vocab: 'Học từ vựng',
  grammar: 'Ngữ pháp',
  pron: 'Luyện phát âm',
  video: 'Nghe qua video',
  speak: 'Luyện nói',
  custom: 'Thực hành',
}

export function weekSchedule(w: WeekPlan): WeekSchedule {
  const learn = w.tasks.filter((t) => LEARN_KINDS.includes(t.kind))
  const quiz = w.tasks.filter((t) => t.kind === 'quiz')
  const weekLong = w.tasks.filter((t) => WEEKLONG_KINDS.includes(t.kind)).map((t) => t.id)

  const LEARN_DAYS = 5
  const buckets: WeekTask[][] = Array.from({ length: LEARN_DAYS }, () => [])
  const base = Math.floor(learn.length / LEARN_DAYS)
  const extra = learn.length % LEARN_DAYS
  let idx = 0
  for (let d = 0; d < LEARN_DAYS; d++) {
    const take = base + (d < extra ? 1 : 0)
    for (let k = 0; k < take; k++) buckets[d].push(learn[idx++])
  }

  const days: DayPlan[] = buckets.map((items, d) => {
    if (!items.length) {
      return { day: d + 1, theme: 'Ôn lại', taskIds: [], note: 'Ôn lại từ đã học tuần này + xem 1 video ngắn tuỳ thích để gom từ.' }
    }
    return {
      day: d + 1,
      theme: DAY_THEME[items[0].kind] ?? 'Học tập',
      taskIds: items.map((t) => t.id),
    }
  })

  days.push({
    day: 6,
    theme: 'Kiểm tra tuần',
    taskIds: quiz.map((t) => t.id),
    note: quiz.length ? undefined : 'Tự kiểm tra lại vốn từ trong tuần bằng tab Kiểm tra.',
  })
  days.push({
    day: 7,
    theme: 'Ôn tập & củng cố',
    taskIds: [],
    note: 'Vào Ôn tập (SRS) ôn hết thẻ đến hạn, nghe lại các từ khó. Xong sớm thì nghỉ ngơi để giữ nhịp.',
  })

  return { days, weekLong }
}

export interface ToeicBridge {
  started: boolean
  days: number
}

function readToeicLocal(): ToeicBridge {
  try {
    const raw = localStorage.getItem('vyling.toeic60')
    const p = raw ? (JSON.parse(raw) as { start?: string | null; rewarded?: number[] }) : {}
    return { started: !!p.start, days: Array.isArray(p.rewarded) ? p.rewarded.length : 0 }
  } catch {
    return { started: false, days: 0 }
  }
}

export function useToeicBridge(): ToeicBridge {
  const [bridge, setBridge] = useState<ToeicBridge>(readToeicLocal)

  useEffect(() => {
    if (!getToken()) return
    let alive = true
    fetchPlanApi<{ start?: string | null; rewarded?: number[] }>('toeic60')
      .then((r) => {
        if (!alive || r.data == null) return
        const days = Array.isArray(r.data.rewarded) ? r.data.rewarded.length : 0
        setBridge((prev) => ({ started: prev.started || !!r.data?.start, days: Math.max(prev.days, days) }))
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [])

  return bridge
}

function unitTerms(unitId: string, units?: VocabUnit[]): string[] {
  if (units) return units.find((u) => u.id === unitId)?.words.map(wTerm) ?? []
  return (EN_UNIT_TERMS as Record<string, string[]>)[unitId] ?? []
}

export function learnedInUnit(unitId: string, learned: Set<string>, units?: VocabUnit[]): number {
  return unitTerms(unitId, units).filter((w) => learned.has(w)).length
}

export function vocabTarget(t: WeekTask, units?: VocabUnit[]): number {
  const n = unitTerms(t.unitId ?? '', units).length
  return n ? Math.ceil((n * (t.pct ?? 100)) / 100) : 0
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

export function pronTaskDone(t: WeekTask, best: Record<string, number>, groups = PRON_GROUPS): boolean {
  if (t.groupId) return (best[t.groupId] ?? 0) >= PRON_PASS
  return groups.every((g) => (best[g.id] ?? 0) >= PRON_PASS)
}

export interface TaskExtra {
  grammar: Record<string, number>
  pron: Record<string, number>
  toeic: ToeicBridge
  units?: VocabUnit[]
  pronGroups?: PronGroup[]
}

export function taskDone(
  t: WeekTask, week: number, learned: Set<string>, plan: PlanState, bank = 0, act?: WeekActivity, ext?: TaskExtra,
): boolean {
  const units = ext?.units
  if (t.kind === 'vocab') return learnedInUnit(t.unitId ?? '', learned, units) >= vocabTarget(t, units)
  if (t.kind === 'quiz') return (plan.quiz[`w${week}`] ?? -1) >= (t.passPct ?? 70)
  if (t.kind === 'total') return bank >= (t.targetTotal ?? Infinity)
  if (t.kind === 'grammar') return grammarTaskDone(t, ext?.grammar ?? readGrammarBest())
  if (t.kind === 'pron') return pronTaskDone(t, ext?.pron ?? readPronBest(), ext?.pronGroups)
  if (t.kind === 'toeic') {
    const b = ext?.toeic ?? readToeicLocal()
    return t.n ? b.days >= t.n : b.started
  }
  if (t.kind === 'video' && act && t.n && act.videos >= t.n) return true
  if (t.kind === 'review' && act && t.n && act.reviewDays >= t.n) return true
  return plan.manual.includes(t.id)
}

export function weekDone(w: WeekPlan, learned: Set<string>, plan: PlanState, bank = 0, act?: WeekActivity, ext?: TaskExtra): boolean {
  return w.tasks.every((t) => taskDone(t, w.week, learned, plan, bank, act, ext))
}

const EN_FRONT_RE = /^[a-z][a-z'’ -]*$/i
const KO_FRONT_RE = /^[가-힣][가-힣 ]*$/

const frontRe = (lang: string) => (lang === 'ko' ? KO_FRONT_RE : EN_FRONT_RE)

export function useWordBank(learned: Set<string>, lang = 'en'): number {
  const [srsFronts, setSrsFronts] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    const re = frontRe(lang)
    fetchAllCards()
      .then((r) => {
        if (!alive) return
        setSrsFronts(r.cards.map((c) => c.front.trim()).filter((f) => re.test(f)))
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [lang])

  return useMemo(() => {
    const bank = new Set<string>()
    learned.forEach((w) => bank.add(w.toLowerCase()))
    srsFronts.forEach((w) => bank.add(w.toLowerCase()))
    return bank.size
  }, [learned, srsFronts])
}


