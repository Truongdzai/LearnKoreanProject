import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { track } from '@/core/monitor'
import { budgetMinutes, stageOf, type FastStage, type SkillId } from '@/data/englishFast'

const FAST_KEY = 'vyling.en.fast'
const FAST_PLAN_ID = 'enfast'

export interface SkillLogEntry {
  day: string
  skill: SkillId
  mins: number
}

export interface ErrorEntry {
  id: string
  kind: string
  wrong: string
  right: string
  note: string
  at: string
  fixed: number
}

export interface FastState {
  stage: FastStage
  weekMins: number
  log: SkillLogEntry[]
  circles: Record<string, 1 | 2 | 3>
  errors: ErrorEntry[]
  read: Record<string, number>
  wrote: string[]
}

const FIXED_TARGET = 3

function normalizeFast(raw: unknown): FastState {
  const p = (raw ?? {}) as Partial<FastState>
  return {
    stage: p.stage === 'a2b1' ? 'a2b1' : 'a1a2',
    weekMins: typeof p.weekMins === 'number' && p.weekMins > 0 ? p.weekMins : 300,
    log: Array.isArray(p.log) ? p.log : [],
    circles: p.circles && typeof p.circles === 'object' ? p.circles : {},
    errors: Array.isArray(p.errors) ? p.errors : [],
    read: p.read && typeof p.read === 'object' ? p.read : {},
    wrote: Array.isArray(p.wrote) ? p.wrote : [],
  }
}

function fastEmpty(s: FastState): boolean {
  return !s.log.length && !s.errors.length && !Object.keys(s.circles).length
    && !Object.keys(s.read).length && !s.wrote.length
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayISO(): string {
  return isoOf(new Date())
}

export function weekStartISO(ref = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())
  const shift = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - shift)
  return isoOf(d)
}

const STREAK_MAX = 400

export function streakFrom(log: SkillLogEntry[], ref = new Date()): number {
  const days = new Set(log.filter((e) => e.mins > 0).map((e) => e.day))
  if (!days.size) return 0

  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())
  if (!days.has(isoOf(d))) d.setDate(d.getDate() - 1)

  let n = 0
  while (n < STREAK_MAX && days.has(isoOf(d))) {
    n += 1
    d.setDate(d.getDate() - 1)
  }
  return n
}

const EMPTY_DONE: Record<SkillId, number> = { read: 0, listen: 0, speak: 0, write: 0 }

export interface WeekBudget {
  target: Record<SkillId, number>
  done: Record<SkillId, number>
  totalTarget: number
  totalDone: number
}

const NO_UNDO: Record<SkillId, number> = { read: 0, listen: 0, speak: 0, write: 0 }

function useFastState() {
  const { state, mutate, loaded } = useServerPlan<FastState>(FAST_PLAN_ID, FAST_KEY, normalizeFast, fastEmpty)
  const lastLog = useRef<Record<SkillId, number>>({ ...NO_UNDO })
  const [undoable, setUndoable] = useState<Record<SkillId, number>>(NO_UNDO)

  const setStage = useCallback((stage: FastStage) => {
    mutate((p) => ({ ...p, stage }))
    track('fast_stage', { stage })
  }, [mutate])

  const setWeekMins = useCallback((weekMins: number) => {
    mutate((p) => ({ ...p, weekMins: Math.max(30, Math.min(3000, Math.round(weekMins))) }))
  }, [mutate])

  const logSkill = useCallback((skill: SkillId, mins: number) => {
    if (mins <= 0) return
    const day = todayISO()
    mutate((p) => {
      const log = [...p.log]
      const at = log.findIndex((e) => e.day === day && e.skill === skill)
      if (at >= 0) log[at] = { ...log[at], mins: log[at].mins + mins }
      else log.push({ day, skill, mins })
      const keep = weekStartISO(new Date(Date.now() - 70 * 86400000))
      return { ...p, log: log.filter((e) => e.day >= keep) }
    })
    lastLog.current[skill] = mins
    setUndoable((u) => (u[skill] === mins ? u : { ...u, [skill]: mins }))
    track('fast_log', { skill, mins })
  }, [mutate])

  const undoSkill = useCallback((skill: SkillId) => {
    const mins = lastLog.current[skill]
    if (!mins) return
    const day = todayISO()
    mutate((p) => {
      const log = [...p.log]
      const at = log.findIndex((e) => e.day === day && e.skill === skill)
      if (at < 0) return p
      const next = log[at].mins - mins
      if (next <= 0) log.splice(at, 1)
      else log[at] = { ...log[at], mins: next }
      return { ...p, log }
    })
    lastLog.current[skill] = 0
    setUndoable((u) => ({ ...u, [skill]: 0 }))
  }, [mutate])

  const setCircle = useCallback((word: string, level: 1 | 2 | 3 | 0) => {
    mutate((p) => {
      const circles = { ...p.circles }
      if (level === 0) delete circles[word]
      else circles[word] = level
      return { ...p, circles }
    })
  }, [mutate])

  const addError = useCallback((kind: string, wrong: string, right: string, note: string) => {
    mutate((p) => ({
      ...p,
      errors: [
        { id: `e${Date.now().toString(36)}`, kind, wrong, right, note, at: todayISO(), fixed: 0 },
        ...p.errors,
      ].slice(0, 200),
    }))
    track('fast_error_add', { kind })
  }, [mutate])

  const hitError = useCallback((id: string) => {
    mutate((p) => ({
      ...p,
      errors: p.errors.map((e) => (e.id === id ? { ...e, fixed: Math.min(FIXED_TARGET, e.fixed + 1) } : e)),
    }))
  }, [mutate])

  const resetError = useCallback((id: string) => {
    mutate((p) => ({ ...p, errors: p.errors.map((e) => (e.id === id ? { ...e, fixed: 0 } : e)) }))
  }, [mutate])

  const dropError = useCallback((id: string) => {
    mutate((p) => ({ ...p, errors: p.errors.filter((e) => e.id !== id) }))
  }, [mutate])

  const recordRead = useCallback((passageId: string, pct: number) => {
    mutate((p) => ({ ...p, read: { ...p.read, [passageId]: Math.max(p.read[passageId] ?? 0, pct) } }))
    track('fast_read', { passageId, pct })
  }, [mutate])

  const markWrote = useCallback((promptId: string) => {
    mutate((p) => (p.wrote.includes(promptId) ? p : { ...p, wrote: [...p.wrote, promptId] }))
    track('fast_write', { promptId })
  }, [mutate])

  const week: WeekBudget = useMemo(() => {
    const from = weekStartISO()
    const done = { ...EMPTY_DONE }
    for (const e of state.log) {
      if (e.day >= from) done[e.skill] += e.mins
    }
    const target = budgetMinutes(state.weekMins, stageOf(state.stage).budget)
    return {
      target,
      done,
      totalTarget: state.weekMins,
      totalDone: done.read + done.listen + done.speak + done.write,
    }
  }, [state.log, state.weekMins, state.stage])

  const streakDays = useMemo(() => streakFrom(state.log), [state.log])

  return {
    fast: state,
    loaded,
    week,
    streakDays,
    undoable,
    setStage,
    setWeekMins,
    logSkill,
    undoSkill,
    setCircle,
    addError,
    hitError,
    resetError,
    dropError,
    recordRead,
    markWrote,
  }
}

type FastApi = ReturnType<typeof useFastState>

const FastCtx = createContext<FastApi | null>(null)

export function FastProvider({ children }: { children: ReactNode }) {
  const api = useFastState()
  return <FastCtx.Provider value={api}>{children}</FastCtx.Provider>
}

export function useFast(): FastApi {
  const ctx = useContext(FastCtx)
  if (!ctx) throw new Error('useFast phải nằm trong <FastProvider>')
  return ctx
}

export const ERROR_FIXED_TARGET = FIXED_TARGET

export function openErrors(errors: ErrorEntry[]): ErrorEntry[] {
  return errors
    .filter((e) => e.fixed < FIXED_TARGET)
    .slice()
    .sort((a, b) => (a.at === b.at ? b.fixed - a.fixed : a.at < b.at ? -1 : 1))
}

export function circleCounts(
  circles: Record<string, number>,
  learned: Set<string>,
): { read: number; listen: number; say: number } {
  const level = new Map<string, number>()
  for (const w of learned) level.set(w, 1)
  for (const [w, lv] of Object.entries(circles)) level.set(w, lv)

  let read = 0
  let listen = 0
  let say = 0
  for (const lv of level.values()) {
    if (lv >= 1) read += 1
    if (lv >= 2) listen += 1
    if (lv >= 3) say += 1
  }
  return { read, listen, say }
}
