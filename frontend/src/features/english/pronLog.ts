import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'

export interface PronLogEntry {
  ts: number
  group: string
  target: string
  fix: string
  miss: string
  act: string
  score: number
}

export interface PronLog {
  entries: PronLogEntry[]
}

const MAX_ENTRIES = 40

const logKey = (lang: string) => `vyling.${lang}.pronlog`
const logPlanId = (lang: string) => `${lang}pronlog`

function normalizeLog(raw: unknown): PronLog {
  const p = (raw ?? {}) as Partial<PronLog>
  const list = Array.isArray(p.entries) ? p.entries : []
  return {
    entries: list
      .filter((e): e is PronLogEntry => !!e && typeof e === 'object')
      .map((e) => ({
        ts: Number(e.ts) || Date.now(),
        group: String(e.group ?? ''),
        target: String(e.target ?? ''),
        fix: String(e.fix ?? ''),
        miss: String(e.miss ?? ''),
        act: String(e.act ?? ''),
        score: Number(e.score) || 0,
      }))
      .slice(0, MAX_ENTRIES),
  }
}

function logEmpty(p: PronLog): boolean {
  return !p.entries.length
}

export function usePronLog(lang = 'en') {
  const { state, mutate } = useServerPlan<PronLog>(logPlanId(lang), logKey(lang), normalizeLog, logEmpty)

  const add = useCallback((entry: Omit<PronLogEntry, 'ts'>) => {
    mutate((p) => ({ entries: [{ ...entry, ts: Date.now() }, ...p.entries].slice(0, MAX_ENTRIES) }))
  }, [mutate])

  const remove = useCallback((ts: number) => {
    mutate((p) => ({ entries: p.entries.filter((e) => e.ts !== ts) }))
  }, [mutate])

  return { log: state, add, remove }
}
