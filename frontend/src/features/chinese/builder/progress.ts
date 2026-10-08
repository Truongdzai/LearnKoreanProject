import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import type { LevelId } from './sentences'

export interface ZhOrderState {
  best: Partial<Record<LevelId, number>>
  solved: number
  rounds: number
}

export const MASTERY = 80
const LEVEL_IDS: LevelId[] = ['easy', 'hard']

function normalize(raw: unknown): ZhOrderState {
  const r = (raw ?? {}) as Partial<ZhOrderState>
  const best: ZhOrderState['best'] = {}
  for (const id of LEVEL_IDS) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  return {
    best,
    solved: Math.max(0, Math.floor(Number(r.solved) || 0)),
    rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)),
  }
}

const isEmpty = (s: ZhOrderState) => !s.rounds && !s.solved

export function useZhOrderProgress() {
  const { state, mutate, loaded } = useServerPlan<ZhOrderState>('zhorder', 'vyling.zh.order', normalize, isEmpty)

  const finishRound = useCallback((level: LevelId, pct: number, solved: number) => {
    mutate((p) => ({
      best: { ...p.best, [level]: Math.max(p.best[level] ?? 0, pct) },
      solved: p.solved + solved,
      rounds: p.rounds + 1,
    }))
  }, [mutate])

  return { state, loaded, finishRound }
}
