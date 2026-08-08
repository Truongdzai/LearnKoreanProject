import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import type { SkillKey } from '@/core/skills'
import { todayISO } from '@/core/skills'

export interface LessonEntry {
  s: Record<string, number>
  n: number
  t: string
  ti: string
}

export interface LessonProgress {
  l: Record<string, LessonEntry>
}

const CAP = 80
const TITLE_MAX = 90

export function lessonKey(kind: SkillKey, id: string): string {
  return kind + ':' + id
}

function clampScore(v: unknown): number {
  if (typeof v !== 'number' || !isFinite(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
}

export function normalizeProgress(raw: unknown): LessonProgress {
  const src = (raw as Partial<LessonProgress> | null)?.l
  if (!src || typeof src !== 'object') return { l: {} }
  const rows: [string, LessonEntry][] = []
  for (const [key, val] of Object.entries(src as Record<string, unknown>)) {
    if (!/^(listen|speak):.+/.test(key)) continue
    const e = val as Partial<LessonEntry>
    const s: Record<string, number> = {}
    if (e && typeof e.s === 'object' && e.s) {
      for (const [k, v] of Object.entries(e.s as Record<string, unknown>)) {
        if (!/^\d{1,4}$/.test(k)) continue
        const sc = clampScore(v)
        if (sc > 0) s[k] = sc
      }
    }
    if (!Object.keys(s).length) continue
    rows.push([key, {
      s,
      n: typeof e?.n === 'number' && e.n > 0 ? Math.round(e.n) : Object.keys(s).length,
      t: typeof e?.t === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.t) ? e.t : todayISO(),
      ti: typeof e?.ti === 'string' ? e.ti.slice(0, TITLE_MAX) : '',
    }])
  }
  rows.sort((a, b) => (a[1].t < b[1].t ? 1 : -1))
  return { l: Object.fromEntries(rows.slice(0, CAP)) }
}

export interface LessonStat {
  done: number
  passed: number
  total: number
  avg: number
  pct: number
}

export function lessonStat(scores: Record<string, number>, total: number, pass: number): LessonStat {
  const vals = Object.values(scores)
  const passed = vals.filter((v) => v >= pass).length
  const sum = vals.reduce((a, b) => a + b, 0)
  return {
    done: vals.length,
    passed,
    total,
    avg: vals.length ? Math.round(sum / vals.length) : 0,
    pct: total > 0 ? Math.round((passed / total) * 100) : 0,
  }
}

const EMPTY: Record<string, number> = {}

export function useLessonProgress() {
  const { state, mutate, loaded } = useServerPlan<LessonProgress>(
    'lessonprog', 'vyling.lessonprog', normalizeProgress, (s) => Object.keys(s.l).length === 0,
  )

  const scoresOf = useCallback(
    (kind: SkillKey, id: string): Record<string, number> => state.l[lessonKey(kind, id)]?.s || EMPTY,
    [state],
  )

  const record = useCallback(
    (kind: SkillKey, id: string, idx: number, score: number, total: number, title = '') => {
      const sc = clampScore(score)
      mutate((prev) => {
        const key = lessonKey(kind, id)
        const old = prev.l[key]
        const s = { ...(old?.s || {}) }
        const k = String(idx)
        if ((s[k] ?? 0) >= sc && old) return prev
        s[k] = Math.max(s[k] ?? 0, sc)
        const rows = Object.entries(prev.l).filter(([kk]) => kk !== key)
        const next: LessonEntry = { s, n: total, t: todayISO(), ti: (title || old?.ti || '').slice(0, TITLE_MAX) }
        rows.unshift([key, next])
        rows.sort((a, b) => (a[1].t < b[1].t ? 1 : -1))
        return { l: Object.fromEntries(rows.slice(0, CAP)) }
      })
    },
    [mutate],
  )

  const drop = useCallback((kind: SkillKey, id: string, idx: number) => {
    mutate((prev) => {
      const key = lessonKey(kind, id)
      const old = prev.l[key]
      if (!old || old.s[String(idx)] == null) return prev
      const s = { ...old.s }
      delete s[String(idx)]
      const l = { ...prev.l }
      if (Object.keys(s).length) l[key] = { ...old, s }
      else delete l[key]
      return { l }
    })
  }, [mutate])

  const reset = useCallback((kind: SkillKey, id: string) => {
    mutate((prev) => {
      const key = lessonKey(kind, id)
      if (!prev.l[key]) return prev
      const l = { ...prev.l }
      delete l[key]
      return { l }
    })
  }, [mutate])

  return { prog: state, scoresOf, record, drop, reset, loaded }
}
