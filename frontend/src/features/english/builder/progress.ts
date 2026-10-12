import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { SENTENCES, type LevelId } from './sentences'

export interface EnOrderState {
  best: Partial<Record<LevelId, number>>
  // Câu vừa sai hoặc phải dùng gợi ý, mới nhất đứng đầu
  weak: string[]
  solved: number
  rounds: number
}

export const MASTERY = 80
const WEAK_CAP = 30
const LEVELS: LevelId[] = ['easy', 'hard']
const IDS = new Set(SENTENCES.map((s) => s.id))

function normalize(raw: unknown): EnOrderState {
  const r = (raw ?? {}) as Partial<EnOrderState>
  const best: EnOrderState['best'] = {}
  for (const id of LEVELS) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  const weak = Array.isArray(r.weak) ? [...new Set(r.weak.filter((w): w is string => typeof w === 'string' && IDS.has(w)))].slice(0, WEAK_CAP) : []
  const n = (v: unknown) => Math.max(0, Math.floor(Number(v) || 0))
  return { best, weak, solved: n(r.solved), rounds: n(r.rounds) }
}

const isEmpty = (s: EnOrderState) => !s.rounds && !Object.keys(s.best).length

export function useEnOrderProgress() {
  const { state, mutate, loaded } = useServerPlan<EnOrderState>('enorder', 'vyling.en.order', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu cấp này đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((level: LevelId, pct: number, results: { id: string; ok: boolean }[]): boolean => {
    const first = (state.best[level] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => {
      const wrong = results.filter((r) => !r.ok).map((r) => r.id)
      const right = new Set(results.filter((r) => r.ok).map((r) => r.id))
      const weak = [...new Set([...wrong, ...p.weak.filter((w) => !right.has(w))])].slice(0, WEAK_CAP)
      return {
        best: { ...p.best, [level]: Math.max(p.best[level] ?? 0, pct) },
        weak,
        solved: p.solved + right.size,
        rounds: p.rounds + 1,
      }
    })
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
