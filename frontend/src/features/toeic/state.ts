import { useCallback, useEffect, useMemo, useState } from 'react'
import UNIT_TERMS from '@/data/english/unitTerms.json'
import {
  TOEIC_60_DAYS, type ToeicDay, type ToeicTask,
} from '@/data/toeicCore'
import { fetchActivityDaysApi } from '@/core/api/me.api'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { useAuth } from '@/store/auth.store'

export interface ToeicAttempt {
  t: string
  mode: 'practice' | 'test' | 'weak' | 'review'
  part?: number
  n: number
  correct: number
  skills: Record<string, [number, number]>
  est?: { listening: number; reading: number; total: number }
}

export interface WrongNote {
  key: string
  part: number
  n: number
  t: string
}

export interface TestRecord {
  n: number
  best: number
  last: number
  t: string
}

export interface ToeicState {
  start: string | null
  done: string[]
  capsules: Record<string, number>
  attempts: ToeicAttempt[]
  rewarded: number[]
  wrong: WrongNote[]
  tests: Record<string, TestRecord>
}

const LOCAL_KEY = 'vyling.toeic60'
const PLAN_ID = 'toeic60'
const MAX_ATTEMPTS = 200
const MAX_WRONG = 300

function normalize(raw: unknown): ToeicState {
  const p = (raw ?? {}) as Partial<ToeicState>
  return {
    start: p.start ?? null,
    done: Array.isArray(p.done) ? p.done : [],
    capsules: p.capsules && typeof p.capsules === 'object' ? p.capsules : {},
    attempts: Array.isArray(p.attempts) ? p.attempts : [],
    rewarded: Array.isArray(p.rewarded) ? p.rewarded : [],
    wrong: Array.isArray(p.wrong) ? p.wrong.filter((w) => w && typeof w.key === 'string') : [],
    tests: p.tests && typeof p.tests === 'object' && !Array.isArray(p.tests) ? p.tests : {},
  }
}

function isEmpty(s: ToeicState): boolean {
  return !s.start && !s.done.length && !s.attempts.length && !Object.keys(s.capsules).length
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DUE_DAYS_REPEAT = 2
const DUE_DAYS_ONCE = 4

export function dueWrong(wrong: WrongNote[], now = Date.now()): WrongNote[] {
  return wrong.filter((w) => {
    const age = (now - new Date(w.t).getTime()) / 86400000
    return age >= (w.n >= 2 ? DUE_DAYS_REPEAT : DUE_DAYS_ONCE)
  })
}

export function toeicDay(start: string | null): number {
  if (!start) return 0
  const ms = Date.now() - new Date(start + 'T00:00:00').getTime()
  return Math.min(60, Math.max(1, Math.floor(ms / 86400000) + 1))
}


export interface ActivitySummary {
  videos: number
  reviewDays: number
}

export function useActivitySince(start: string | null): { activity: ActivitySummary; refresh: () => void } {
  const { isAuthed } = useAuth()
  const [activity, setActivity] = useState<ActivitySummary>({ videos: 0, reviewDays: 0 })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!isAuthed || !start) { setActivity({ videos: 0, reviewDays: 0 }); return }
    let alive = true
    fetchActivityDaysApi(start)
      .then((r) => {
        if (!alive) return
        setActivity({
          videos: r.days.reduce((s, d) => s + d.videos, 0),
          reviewDays: r.days.filter((d) => d.reviews > 0).length,
        })
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [isAuthed, start, tick])

  const refresh = useCallback(() => setTick((x) => x + 1), [])
  return { activity, refresh }
}


function answeredCount(attempts: ToeicAttempt[], mode: 'practice' | 'weak' | 'review', part?: number): number {
  return attempts
    .filter((a) => a.mode === mode && (mode !== 'practice' || a.part === part))
    .reduce((s, a) => s + a.n, 0)
}

function cumulativeBefore(task: ToeicTask, filter: (t: ToeicTask) => boolean): { req: number; index: number } {
  let req = 0
  let index = 0
  for (const day of TOEIC_60_DAYS) {
    for (const t of day.tasks) {
      if (!filter(t)) continue
      index += 1
      req += t.n ?? 1
      if (t.id === task.id) return { req, index }
    }
  }
  return { req, index }
}

export interface TaskCtx {
  state: ToeicState
  learned: Set<string>
  activity: ActivitySummary
}

export function vocabDone(task: ToeicTask, learned: Set<string>): { have: number; need: number } {
  const terms = (UNIT_TERMS as Record<string, string[]>)[task.unitId ?? '']
  if (!terms) return { have: 0, need: 0 }
  const need = Math.ceil((terms.length * (task.pct ?? 100)) / 100)
  const have = terms.filter((w) => learned.has(w)).length
  return { have: Math.min(have, need), need }
}

export function taskDone(task: ToeicTask, ctx: TaskCtx): boolean {
  const { state, learned, activity } = ctx
  switch (task.kind) {
    case 'grammar':
      return (state.capsules[task.capsuleId ?? ''] ?? 0) >= 75
    case 'vocab': {
      const { have, need } = vocabDone(task, learned)
      return need > 0 && have >= need
    }
    case 'practice': {
      const { req } = cumulativeBefore(task, (t) => t.kind === 'practice' && t.part === task.part)
      return answeredCount(state.attempts, 'practice', task.part) >= req
    }
    case 'weak': {
      const { req } = cumulativeBefore(task, (t) => t.kind === 'weak')
      return answeredCount(state.attempts, 'weak') >= req
    }
    case 'wrongbook': {
      const { req } = cumulativeBefore(task, (t) => t.kind === 'wrongbook')
      return answeredCount(state.attempts, 'review') >= req || state.done.includes(task.id)
    }
    case 'minitest': {
      const { index } = cumulativeBefore(task, (t) => t.kind === 'minitest')
      return state.attempts.filter((a) => a.mode === 'test').length >= index
    }
    case 'video': {
      const { index } = cumulativeBefore(task, (t) => t.kind === 'video')
      return activity.videos >= index || state.done.includes(task.id)
    }
    case 'review': {
      const { index } = cumulativeBefore(task, (t) => t.kind === 'review')
      return activity.reviewDays >= index || state.done.includes(task.id)
    }
    default:
      return state.done.includes(task.id)
  }
}

export function dayDone(day: ToeicDay, ctx: TaskCtx): boolean {
  return day.tasks.every((t) => taskDone(t, ctx))
}


export function useToeicState() {
  const { state, mutate, loaded } = useServerPlan<ToeicState>(PLAN_ID, LOCAL_KEY, normalize, isEmpty)

  const startPlan = useCallback(() => {
    mutate((p) => (p.start ? p : { ...p, start: todayISO() }))
  }, [mutate])

  const toggleTask = useCallback((id: string) => {
    mutate((p) => ({
      ...p,
      done: p.done.includes(id) ? p.done.filter((x) => x !== id) : [...p.done, id],
    }))
  }, [mutate])

  const recordCapsule = useCallback((capsuleId: string, pct: number) => {
    mutate((p) => ({
      ...p,
      capsules: { ...p.capsules, [capsuleId]: Math.max(p.capsules[capsuleId] ?? 0, pct) },
    }))
  }, [mutate])

  const recordAttempt = useCallback((a: ToeicAttempt) => {
    mutate((p) => ({ ...p, attempts: [...p.attempts, a].slice(-MAX_ATTEMPTS) }))
  }, [mutate])

  const recordWrong = useCallback((items: { key: string; part: number }[], solved: string[]) => {
    if (!items.length && !solved.length) return
    const now = new Date().toISOString()
    mutate((p) => {
      const done = new Set(solved)
      const byKey = new Map(p.wrong.filter((w) => !done.has(w.key)).map((w) => [w.key, w]))
      for (const it of items) {
        const prev = byKey.get(it.key)
        byKey.set(it.key, { key: it.key, part: it.part, n: (prev?.n ?? 0) + 1, t: now })
      }
      return { ...p, wrong: [...byKey.values()].slice(-MAX_WRONG) }
    })
  }, [mutate])

  const clearWrong = useCallback((keys?: string[]) => {
    mutate((p) => {
      if (!keys) return { ...p, wrong: [] }
      const drop = new Set(keys)
      return { ...p, wrong: p.wrong.filter((w) => !drop.has(w.key)) }
    })
  }, [mutate])

  const recordFixedTest = useCallback((idx: number, score: number) => {
    mutate((p) => {
      const key = String(idx)
      const prev = p.tests[key]
      return {
        ...p,
        tests: {
          ...p.tests,
          [key]: {
            n: (prev?.n ?? 0) + 1,
            best: Math.max(prev?.best ?? 0, score),
            last: score,
            t: todayISO(),
          },
        },
      }
    })
  }, [mutate])

  const grantDayReward = useCallback((d: number) => {
    mutate((p) => (p.rewarded.includes(d) ? p : { ...p, rewarded: [...p.rewarded, d] }))
  }, [mutate])

  const latestEstimate = useMemo(() => {
    for (let i = state.attempts.length - 1; i >= 0; i--) {
      const a = state.attempts[i]
      if (a.mode === 'test' && a.est) return a.est
    }
    return null
  }, [state.attempts])

  return { state, loaded, startPlan, toggleTask, recordCapsule, recordAttempt, recordWrong, clearWrong, recordFixedTest, grantDayReward, latestEstimate }
}
