import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { FRAMES, FORMS, type PassiveTense } from './frames'

// mix = lượt trộn (tính cho lộ trình); phòng này chỉ có lượt trộn
export type RoundKind = 'mix' | 'focus'

export interface PassiveState {
  best: Partial<Record<RoundKind, number>>
  // [đúng, tổng] theo thì của câu bị động
  stats: Partial<Record<PassiveTense, [number, number]>>
  weak: string[]
  rounds: number
}

export interface Result {
  id: string
  tense: PassiveTense
  ok: boolean
}

export const MASTERY = 80
const WEAK_CAP = 30
const KINDS: RoundKind[] = ['mix', 'focus']
const IDS = new Set(FRAMES.map((f) => f.id))
const TYPE_IDS = new Set(Object.keys(FORMS))

function normalize(raw: unknown): PassiveState {
  const r = (raw ?? {}) as Partial<PassiveState>
  const best: PassiveState['best'] = {}
  for (const id of KINDS) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  const stats: PassiveState['stats'] = {}
  for (const [k, v] of Object.entries(r.stats ?? {})) {
    if (!TYPE_IDS.has(k) || !Array.isArray(v)) continue
    const total = Math.max(0, Math.floor(Number(v[1]) || 0))
    const right = Math.min(total, Math.max(0, Math.floor(Number(v[0]) || 0)))
    if (total) stats[k as PassiveTense] = [right, total]
  }
  const weak = Array.isArray(r.weak) ? [...new Set(r.weak.filter((w): w is string => typeof w === 'string' && IDS.has(w)))].slice(0, WEAK_CAP) : []
  return { best, stats, weak, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: PassiveState) => !s.rounds && !Object.keys(s.best).length

// Cộng kết quả một lượt vào thống kê; câu sai vào danh sách ôn, câu đã làm đúng thì rời danh sách
function applyResults(p: PassiveState, results: Result[]): Pick<PassiveState, 'stats' | 'weak'> {
  const stats = { ...p.stats }
  for (const r of results) {
    const [a, b] = stats[r.tense] ?? [0, 0]
    stats[r.tense] = [a + (r.ok ? 1 : 0), b + 1]
  }
  const wrong = results.filter((r) => !r.ok).map((r) => r.id)
  const right = new Set(results.filter((r) => r.ok).map((r) => r.id))
  const weak = [...new Set([...wrong, ...p.weak.filter((w) => !right.has(w))])].slice(0, WEAK_CAP)
  return { stats, weak }
}

export function usePassiveProgress() {
  const { state, mutate, loaded } = useServerPlan<PassiveState>('enpassive', 'vyling.en.passive', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu lượt trộn đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((kind: RoundKind, pct: number, results: Result[]): boolean => {
    const first = kind === 'mix' && (state.best.mix ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => ({
      ...applyResults(p, results),
      best: { ...p.best, [kind]: Math.max(p.best[kind] ?? 0, pct) },
      rounds: p.rounds + 1,
    }))
    return first
  }, [state.best, mutate])

  // Lượt "Ôn câu sai" trộn nhiều phòng: chỉ cộng thống kê và cập nhật danh sách câu sai, không đổi điểm tốt nhất
  const reviewDone = useCallback((results: Result[]) => {
    mutate((p) => ({ ...p, ...applyResults(p, results) }))
  }, [mutate])

  return { state, loaded, finishRound, reviewDone }
}
