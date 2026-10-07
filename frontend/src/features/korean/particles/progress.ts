import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'

export type ModeId = 'form' | 'frame'

export interface PartState {
  best: Partial<Record<ModeId, number>>
  // Câu điền trợ từ vừa làm sai (id), mới nhất đứng đầu
  weak: string[]
  rounds: number
}

export interface Result {
  tag: string
  ok: boolean
}

export const MASTERY = 80
const WEAK_CAP = 30
const MODES: ModeId[] = ['form', 'frame']

function normalize(raw: unknown): PartState {
  const r = (raw ?? {}) as Partial<PartState>
  const best: PartState['best'] = {}
  for (const id of MODES) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  const weak = Array.isArray(r.weak) ? [...new Set(r.weak.filter((w): w is string => typeof w === 'string' && /^[a-z]\d{2}$/.test(w)))].slice(0, WEAK_CAP) : []
  return { best, weak, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: PartState) => !s.rounds && !Object.keys(s.best).length

export function usePartProgress() {
  const { state, mutate, loaded } = useServerPlan<PartState>('kopart', 'vyling.ko.particles', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu chế độ này đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((mode: ModeId, pct: number, results: Result[]): boolean => {
    const first = (state.best[mode] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => {
      let weak = p.weak
      if (mode === 'frame') {
        const wrong = results.filter((r) => !r.ok).map((r) => r.tag)
        const right = new Set(results.filter((r) => r.ok).map((r) => r.tag))
        weak = [...new Set([...wrong, ...p.weak.filter((w) => !right.has(w))])].slice(0, WEAK_CAP)
      }
      return { best: { ...p.best, [mode]: Math.max(p.best[mode] ?? 0, pct) }, weak, rounds: p.rounds + 1 }
    })
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
