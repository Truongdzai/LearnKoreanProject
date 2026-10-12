import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { FRAMES, type PrepGroup } from './frames'

export interface PrepState {
  best: Partial<Record<PrepGroup, number>>
  // Câu vừa làm sai (id), mới nhất đứng đầu
  weak: string[]
  rounds: number
}

export interface Result {
  id: string
  ok: boolean
}

export const MASTERY = 80
const WEAK_CAP = 30
const GROUPS: PrepGroup[] = ['time', 'place']
const IDS = new Set(FRAMES.map((f) => f.id))

function normalize(raw: unknown): PrepState {
  const r = (raw ?? {}) as Partial<PrepState>
  const best: PrepState['best'] = {}
  for (const id of GROUPS) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  const weak = Array.isArray(r.weak) ? [...new Set(r.weak.filter((w): w is string => typeof w === 'string' && IDS.has(w)))].slice(0, WEAK_CAP) : []
  return { best, weak, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: PrepState) => !s.rounds && !Object.keys(s.best).length

export function usePrepProgress() {
  const { state, mutate, loaded } = useServerPlan<PrepState>('enprep', 'vyling.en.prep', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu nhóm này đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((group: PrepGroup, pct: number, results: Result[]): boolean => {
    const first = (state.best[group] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => {
      const wrong = results.filter((r) => !r.ok).map((r) => r.id)
      const right = new Set(results.filter((r) => r.ok).map((r) => r.id))
      const weak = [...new Set([...wrong, ...p.weak.filter((w) => !right.has(w))])].slice(0, WEAK_CAP)
      return { best: { ...p.best, [group]: Math.max(p.best[group] ?? 0, pct) }, weak, rounds: p.rounds + 1 }
    })
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
