import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { CATS, type CatId, type ModeId } from './drills'

export interface EnNumState {
  best: Partial<Record<ModeId, number>>
  // [đúng, tổng] theo từng nhóm số
  stats: Partial<Record<CatId, [number, number]>>
  rounds: number
}

export interface Result {
  cat: CatId
  ok: boolean
}

export const MASTERY = 80
const MODES: ModeId[] = ['read', 'listen', 'type']
const CAT_IDS = new Set<string>(CATS.map((c) => c.id))

function normalize(raw: unknown): EnNumState {
  const r = (raw ?? {}) as Partial<EnNumState>
  const best: EnNumState['best'] = {}
  for (const id of MODES) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  const stats: EnNumState['stats'] = {}
  for (const [k, v] of Object.entries(r.stats ?? {})) {
    if (!CAT_IDS.has(k) || !Array.isArray(v)) continue
    const total = Math.max(0, Math.floor(Number(v[1]) || 0))
    const right = Math.min(total, Math.max(0, Math.floor(Number(v[0]) || 0)))
    if (total) stats[k as CatId] = [right, total]
  }
  return { best, stats, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: EnNumState) => !s.rounds && !Object.keys(s.best).length

export function accuracy(v?: [number, number]): number | null {
  return v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
}

export function useEnNumProgress() {
  const { state, mutate, loaded } = useServerPlan<EnNumState>('ennumbers', 'vyling.en.numbers', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu chế độ này đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((mode: ModeId, pct: number, results: Result[]): boolean => {
    const first = (state.best[mode] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => {
      const stats = { ...p.stats }
      for (const r of results) {
        const [a, b] = stats[r.cat] ?? [0, 0]
        stats[r.cat] = [a + (r.ok ? 1 : 0), b + 1]
      }
      return { best: { ...p.best, [mode]: Math.max(p.best[mode] ?? 0, pct) }, stats, rounds: p.rounds + 1 }
    })
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
