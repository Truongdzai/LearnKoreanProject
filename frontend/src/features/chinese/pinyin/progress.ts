import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'

export interface PinyinState {
  // độ chính xác theo từng mục: "t3" (thanh 3), "2-1" (cặp thanh), "mark", "spell", "type"
  stats: Record<string, [number, number]>
  rounds: number
  typed: number
}

function normalize(raw: unknown): PinyinState {
  const r = (raw ?? {}) as Partial<PinyinState>
  const stats: Record<string, [number, number]> = {}
  for (const [k, v] of Object.entries(r.stats ?? {})) {
    if (Array.isArray(v) && v.length === 2) stats[k] = [Number(v[0]) || 0, Number(v[1]) || 0]
  }
  return { stats, rounds: Number(r.rounds) || 0, typed: Number(r.typed) || 0 }
}

const isEmpty = (s: PinyinState) => !Object.keys(s.stats).length && !s.rounds && !s.typed

export function usePinyinProgress() {
  const { state, mutate } = useServerPlan<PinyinState>('zhpinyin', 'vyling.zh.pinyin', normalize, isEmpty)

  const recordAnswer = useCallback((item: string, ok: boolean) => {
    mutate((p) => {
      const [right, wrong] = p.stats[item] ?? [0, 0]
      return { ...p, stats: { ...p.stats, [item]: ok ? [right + 1, wrong] : [right, wrong + 1] } }
    })
  }, [mutate])

  const finishRound = useCallback((typed = 0) => {
    mutate((p) => ({ ...p, rounds: p.rounds + 1, typed: p.typed + typed }))
  }, [mutate])

  return { state, recordAnswer, finishRound }
}

// Trọng số rút câu: cặp thanh hay sai được hỏi lại nhiều hơn
export function pairWeights(stats: PinyinState['stats']): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, [right, wrong]] of Object.entries(stats)) {
    if (k.includes('-')) out[k] = 0.4 + (wrong * 2 + 1) / (right + 1)
  }
  return out
}
