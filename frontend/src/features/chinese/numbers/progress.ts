import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import type { ModeId } from './drills'

export interface ZhNumbersState {
  best: Partial<Record<ModeId, number>>
  rounds: number
}

export const MODE_IDS: ModeId[] = ['price', 'listen', 'count', 'mixed']
export const MASTERY = 80

function normalize(raw: unknown): ZhNumbersState {
  const r = (raw ?? {}) as Partial<ZhNumbersState>
  const best: ZhNumbersState['best'] = {}
  for (const id of MODE_IDS) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  return { best, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: ZhNumbersState) => !s.rounds && !Object.keys(s.best).length

export function useZhNumbersProgress() {
  const { state, mutate, loaded } = useServerPlan<ZhNumbersState>('zhnumbers', 'vyling.zh.numbers', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu chế độ này đạt chuẩn
  const finishRound = useCallback((mode: ModeId, pct: number): boolean => {
    const first = (state.best[mode] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => ({ best: { ...p.best, [mode]: Math.max(p.best[mode] ?? 0, pct) }, rounds: p.rounds + 1 }))
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
