import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import type { ModeId } from './hanviet'

export interface HvState {
  best: Partial<Record<ModeId, number>>
  rounds: number
}

export const MASTERY = 80
const MODES: ModeId[] = ['hv', 'char', 'word']

function normalize(raw: unknown): HvState {
  const r = (raw ?? {}) as Partial<HvState>
  const best: HvState['best'] = {}
  for (const id of MODES) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  return { best, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: HvState) => !s.rounds && !Object.keys(s.best).length

export function useHanVietProgress() {
  const { state, mutate, loaded } = useServerPlan<HvState>('zhhanviet', 'vyling.zh.hanviet', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu chế độ này đạt chuẩn
  const finishRound = useCallback((mode: ModeId, pct: number): boolean => {
    const first = (state.best[mode] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => ({ best: { ...p.best, [mode]: Math.max(p.best[mode] ?? 0, pct) }, rounds: p.rounds + 1 }))
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
