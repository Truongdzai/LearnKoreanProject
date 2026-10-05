import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import type { Stats } from './quiz'

export interface HangulState {
  done: Record<string, number>
  stats: Stats
  typing: { best: number; items: number }
}

function normalize(raw: unknown): HangulState {
  const r = (raw ?? {}) as Partial<HangulState>
  const stats: Stats = {}
  for (const [k, v] of Object.entries(r.stats ?? {})) {
    if (Array.isArray(v) && v.length === 2) stats[k] = [Number(v[0]) || 0, Number(v[1]) || 0]
  }
  return {
    done: { ...(r.done ?? {}) },
    stats,
    typing: { best: Number(r.typing?.best) || 0, items: Number(r.typing?.items) || 0 },
  }
}

const isEmpty = (s: HangulState) =>
  !Object.keys(s.done).length && !Object.keys(s.stats).length && !s.typing.items

// Một chữ coi là "đã vững" khi đúng ít nhất 3 lần và tỉ lệ đúng từ 80%.
export function isSolid(stats: Stats, item: string): boolean {
  const [right, wrong] = stats[item] ?? [0, 0]
  return right >= 3 && right / (right + wrong) >= 0.8
}

export function useHangulProgress() {
  const { state, mutate, loaded } = useServerPlan<HangulState>('kohangul', 'vyling.ko.hangul', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu bài đạt chuẩn (để thưởng XP một lần).
  const finishLesson = useCallback((id: string, pct: number, pass: number): boolean => {
    const first = (state.done[id] ?? 0) < pass && pct >= pass
    mutate((p) => ({ ...p, done: { ...p.done, [id]: Math.max(p.done[id] ?? 0, pct) } }))
    return first
  }, [state.done, mutate])

  const recordAnswer = useCallback((item: string, ok: boolean) => {
    mutate((p) => {
      const [right, wrong] = p.stats[item] ?? [0, 0]
      return { ...p, stats: { ...p.stats, [item]: ok ? [right + 1, wrong] : [right, wrong + 1] } }
    })
  }, [mutate])

  const recordTyping = useCallback((items: number, perMinute: number) => {
    mutate((p) => ({ ...p, typing: { best: Math.max(p.typing.best, perMinute), items: p.typing.items + items } }))
  }, [mutate])

  return { state, loaded, finishLesson, recordAnswer, recordTyping }
}
