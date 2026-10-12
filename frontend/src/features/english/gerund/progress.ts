import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { FRAMES, GROUPS, type GerundGroup } from './frames'

// mix = lượt trộn (tính cho lộ trình); phòng này chỉ có lượt trộn
export type RoundKind = 'mix' | 'focus'

export interface GerundState {
  best: Partial<Record<RoundKind, number>>
  // [đúng, tổng] theo nhóm quy tắc
  stats: Partial<Record<GerundGroup, [number, number]>>
  weak: string[]
  rounds: number
}

export interface Result {
  id: string
  group: GerundGroup
  ok: boolean
}

export const MASTERY = 80
const WEAK_CAP = 30
const KINDS: RoundKind[] = ['mix', 'focus']
const IDS = new Set(FRAMES.map((f) => f.id))
const TYPE_IDS = new Set(Object.keys(GROUPS))

function normalize(raw: unknown): GerundState {
  const r = (raw ?? {}) as Partial<GerundState>
  const best: GerundState['best'] = {}
  for (const id of KINDS) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  const stats: GerundState['stats'] = {}
  for (const [k, v] of Object.entries(r.stats ?? {})) {
    if (!TYPE_IDS.has(k) || !Array.isArray(v)) continue
    const total = Math.max(0, Math.floor(Number(v[1]) || 0))
    const right = Math.min(total, Math.max(0, Math.floor(Number(v[0]) || 0)))
    if (total) stats[k as GerundGroup] = [right, total]
  }
  const weak = Array.isArray(r.weak) ? [...new Set(r.weak.filter((w): w is string => typeof w === 'string' && IDS.has(w)))].slice(0, WEAK_CAP) : []
  return { best, stats, weak, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: GerundState) => !s.rounds && !Object.keys(s.best).length

export function useGerundProgress() {
  const { state, mutate, loaded } = useServerPlan<GerundState>('engerund', 'vyling.en.gerund', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu lượt trộn đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((kind: RoundKind, pct: number, results: Result[]): boolean => {
    const first = kind === 'mix' && (state.best.mix ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => {
      const stats = { ...p.stats }
      for (const r of results) {
        const [a, b] = stats[r.group] ?? [0, 0]
        stats[r.group] = [a + (r.ok ? 1 : 0), b + 1]
      }
      const wrong = results.filter((r) => !r.ok).map((r) => r.id)
      const right = new Set(results.filter((r) => r.ok).map((r) => r.id))
      const weak = [...new Set([...wrong, ...p.weak.filter((w) => !right.has(w))])].slice(0, WEAK_CAP)
      return { best: { ...p.best, [kind]: Math.max(p.best[kind] ?? 0, pct) }, stats, weak, rounds: p.rounds + 1 }
    })
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
