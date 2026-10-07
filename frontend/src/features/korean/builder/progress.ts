import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import type { LevelId } from './sentences'

export interface OrderState {
  best: Partial<Record<LevelId, number>>
  // Tổng số câu đã ghép đúng không cần gợi ý
  solved: number
  rounds: number
}

export const MASTERY = 80
const LEVEL_IDS: LevelId[] = ['easy', 'mid', 'hard']

function normalize(raw: unknown): OrderState {
  const r = (raw ?? {}) as Partial<OrderState>
  const best: OrderState['best'] = {}
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

const isEmpty = (s: OrderState) => !s.rounds && !s.solved

export function useOrderProgress() {
  const { state, mutate, loaded } = useServerPlan<OrderState>('koorder', 'vyling.ko.order', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu cấp này đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((level: LevelId, pct: number, solved: number): boolean => {
    const first = (state.best[level] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => ({
      best: { ...p.best, [level]: Math.max(p.best[level] ?? 0, pct) },
      solved: p.solved + solved,
      rounds: p.rounds + 1,
    }))
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
