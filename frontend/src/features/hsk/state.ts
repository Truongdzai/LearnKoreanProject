import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'

export interface HskAttempt {
  at: string
  listening: number
  reading: number
  total: number
  grade: number
}

export interface HskState {
  capsules: Record<string, number>
  wrong: string[]
  attempts: HskAttempt[]
}

const KEY = 'vyling.zh.hsk'
const PLAN_ID = 'zhhsk'

function normalize(raw: unknown): HskState {
  const p = (raw ?? {}) as Partial<HskState>
  return {
    capsules: p.capsules && typeof p.capsules === 'object' ? p.capsules : {},
    wrong: Array.isArray(p.wrong) ? p.wrong : [],
    attempts: Array.isArray(p.attempts) ? p.attempts : [],
  }
}

function isEmpty(s: HskState): boolean {
  return !Object.keys(s.capsules).length && !s.wrong.length && !s.attempts.length
}

export function useHskState() {
  const { state, mutate } = useServerPlan<HskState>(PLAN_ID, KEY, normalize, isEmpty)

  const recordCapsule = useCallback((id: string, pct: number): boolean => {
    const first = pct >= 70 && (state.capsules[id] ?? 0) < 70
    mutate((p) => ({ ...p, capsules: { ...p.capsules, [id]: Math.max(p.capsules[id] ?? 0, pct) } }))
    return first
  }, [mutate, state.capsules])

  const markWrong = useCallback((id: string, wrong: boolean) => {
    mutate((p) => ({
      ...p,
      wrong: wrong
        ? (p.wrong.includes(id) ? p.wrong : [...p.wrong, id])
        : p.wrong.filter((x) => x !== id),
    }))
  }, [mutate])

  const recordAttempt = useCallback((a: HskAttempt) => {
    mutate((p) => ({ ...p, attempts: [...p.attempts, a].slice(-20) }))
  }, [mutate])

  return { state, recordCapsule, markWrong, recordAttempt }
}
