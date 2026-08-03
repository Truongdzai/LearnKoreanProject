import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'

export type SkillKey = 'listen' | 'speak'

export interface SkillDay {
  d: string
  ln: number
  lsum: number
  sn: number
  ssum: number
}

export interface SkillLog {
  days: SkillDay[]
}

const KEEP_DAYS = 120

export function todayISO(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function shiftISO(iso: string, delta: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function normalizeSkills(raw: unknown): SkillLog {
  const days = (raw as Partial<SkillLog> | null)?.days
  if (!Array.isArray(days)) return { days: [] }
  const out: SkillDay[] = []
  for (const it of days) {
    const d = (it as SkillDay)?.d
    if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) continue
    const num = (v: unknown) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0)
    out.push({
      d,
      ln: num((it as SkillDay).ln),
      lsum: num((it as SkillDay).lsum),
      sn: num((it as SkillDay).sn),
      ssum: num((it as SkillDay).ssum),
    })
  }
  out.sort((a, b) => (a.d < b.d ? -1 : 1))
  return { days: out.slice(-KEEP_DAYS) }
}

export function pushScore(log: SkillLog, key: SkillKey, score: number): SkillLog {
  const day = todayISO()
  const pts = Math.max(0, Math.min(100, Math.round(score)))
  const days = log.days.slice()
  let row = days.find((r) => r.d === day)
  if (!row) {
    row = { d: day, ln: 0, lsum: 0, sn: 0, ssum: 0 }
    days.push(row)
    days.sort((a, b) => (a.d < b.d ? -1 : 1))
  }
  if (key === 'listen') { row.ln += 1; row.lsum += pts } else { row.sn += 1; row.ssum += pts }
  return { days: days.slice(-KEEP_DAYS) }
}

export function dropScore(log: SkillLog, key: SkillKey, score: number): SkillLog {
  const day = todayISO()
  const pts = Math.max(0, Math.min(100, Math.round(score)))
  const days = log.days.map((r) => {
    if (r.d !== day) return r
    if (key === 'listen') {
      if (r.ln <= 0) return r
      return { ...r, ln: r.ln - 1, lsum: Math.max(0, r.lsum - pts) }
    }
    if (r.sn <= 0) return r
    return { ...r, sn: r.sn - 1, ssum: Math.max(0, r.ssum - pts) }
  })
  return { days: days.filter((r) => r.ln > 0 || r.sn > 0) }
}

export function dayAvg(row: SkillDay | undefined, key: SkillKey): number | null {
  if (!row) return null
  const n = key === 'listen' ? row.ln : row.sn
  const sum = key === 'listen' ? row.lsum : row.ssum
  return n > 0 ? Math.round(sum / n) : null
}

export interface SkillPoint {
  d: string
  avg: number | null
  n: number
}

export function skillSeries(log: SkillLog, key: SkillKey, span = 14): SkillPoint[] {
  const byDay = new Map(log.days.map((r) => [r.d, r]))
  const out: SkillPoint[] = []
  let iso = shiftISO(todayISO(), -(span - 1))
  for (let i = 0; i < span; i++) {
    const row = byDay.get(iso)
    out.push({ d: iso, avg: dayAvg(row, key), n: row ? (key === 'listen' ? row.ln : row.sn) : 0 })
    iso = shiftISO(iso, 1)
  }
  return out
}

export function skillAvg(log: SkillLog, key: SkillKey, span = 30): { avg: number | null; reps: number } {
  const from = shiftISO(todayISO(), -(span - 1))
  let sum = 0
  let n = 0
  for (const row of log.days) {
    if (row.d < from) continue
    sum += key === 'listen' ? row.lsum : row.ssum
    n += key === 'listen' ? row.ln : row.sn
  }
  return { avg: n > 0 ? Math.round(sum / n) : null, reps: n }
}

export function skillTrend(log: SkillLog, key: SkillKey): number | null {
  const pts = skillSeries(log, key, 14).filter((p) => p.avg !== null)
  if (pts.length < 4) return null
  const half = Math.floor(pts.length / 2)
  const mean = (arr: SkillPoint[]) => Math.round(arr.reduce((s, p) => s + (p.avg as number), 0) / arr.length)
  return mean(pts.slice(half)) - mean(pts.slice(0, half))
}

export function skillBand(avg: number | null): { labelKey: string; tone: 'good' | 'mid' | 'low' } {
  if (avg === null) return { labelKey: 'skill.bandNone', tone: 'mid' }
  if (avg >= 90) return { labelKey: 'skill.band4', tone: 'good' }
  if (avg >= 75) return { labelKey: 'skill.band3', tone: 'good' }
  if (avg >= 55) return { labelKey: 'skill.band2', tone: 'mid' }
  return { labelKey: 'skill.band1', tone: 'low' }
}

export function useSkillLog() {
  const { state, mutate, loaded } = useServerPlan<SkillLog>(
    'skills', 'vyling.skills', normalizeSkills, (s) => s.days.length === 0,
  )
  const record = useCallback((key: SkillKey, score: number) => {
    mutate((prev) => pushScore(prev, key, score))
  }, [mutate])
  const undo = useCallback((key: SkillKey, score: number) => {
    mutate((prev) => dropScore(prev, key, score))
  }, [mutate])
  return { log: state, record, undo, loaded }
}
