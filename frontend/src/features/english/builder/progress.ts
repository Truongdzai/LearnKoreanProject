import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { SENTENCES, type LevelId } from './sentences'

export interface EnOrderState {
  best: Partial<Record<LevelId, number>>
  // Câu vừa sai hoặc phải dùng gợi ý, mới nhất đứng đầu
  weak: string[]
  // Các câu đã từng tự ghép đúng (không trùng)
  solved: string[]
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
  const ids = (v: unknown, cap: number) => Array.isArray(v) ? [...new Set(v.filter((w): w is string => typeof w === 'string' && IDS.has(w)))].slice(0, cap) : []
  return { best, weak: ids(r.weak, WEAK_CAP), solved: ids(r.solved, IDS.size), rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: EnOrderState) => !s.rounds && !Object.keys(s.best).length && !s.solved.length

export function useEnOrderProgress() {
  const { state, mutate, loaded } = useServerPlan<EnOrderState>('enorder', 'vyling.en.order', normalize, isEmpty)

  // counted = lượt trộn mọi chủ điểm: chỉ lượt này mới ghi điểm cấp (lộ trình đọc điểm này).
  // Trả về true nếu đây là lần đầu cấp này đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((level: LevelId, pct: number, results: { id: string; ok: boolean }[], counted: boolean): boolean => {
    const first = counted && (state.best[level] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => {
      const wrong = results.filter((r) => !r.ok).map((r) => r.id)
      const right = new Set(results.filter((r) => r.ok).map((r) => r.id))
      const weak = [...new Set([...wrong, ...p.weak.filter((w) => !right.has(w))])].slice(0, WEAK_CAP)
      return {
        best: counted ? { ...p.best, [level]: Math.max(p.best[level] ?? 0, pct) } : p.best,
        weak,
        solved: [...new Set([...p.solved, ...right])],
        rounds: p.rounds + 1,
      }
    })
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
