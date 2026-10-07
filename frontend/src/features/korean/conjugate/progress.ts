import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { ENDINGS, type EndingId } from './engine'

export interface ConjState {
  // [đúng, tổng] theo từng đuôi
  stats: Partial<Record<EndingId, [number, number]>>
  // Từ vừa sai, mới nhất đứng đầu; trả lời đúng một lần là gỡ ra
  weak: string[]
  mastered: EndingId[]
  rounds: number
}

export interface Answer {
  dict: string
  ending: EndingId
  ok: boolean
}

export const MASTERY = 80
export const MIN_TRIES = 10
const WEAK_CAP = 40
const IDS = new Set<string>(ENDINGS.map((e) => e.id))

function normalize(raw: unknown): ConjState {
  const r = (raw ?? {}) as Partial<ConjState>
  const stats: ConjState['stats'] = {}
  for (const [k, v] of Object.entries(r.stats ?? {})) {
    if (!IDS.has(k) || !Array.isArray(v)) continue
    const total = Math.max(0, Math.floor(Number(v[1]) || 0))
    const right = Math.min(total, Math.max(0, Math.floor(Number(v[0]) || 0)))
    if (total) stats[k as EndingId] = [right, total]
  }
  const weak = Array.isArray(r.weak) ? [...new Set(r.weak.filter((w): w is string => typeof w === 'string' && /^[가-힣]+$/.test(w)))].slice(0, WEAK_CAP) : []
  const mastered = Array.isArray(r.mastered) ? [...new Set(r.mastered.filter((m) => IDS.has(m)))] as EndingId[] : []
  return { stats, weak, mastered, rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)) }
}

const isEmpty = (s: ConjState) => !s.rounds && !Object.keys(s.stats).length

export function accuracy(v?: [number, number]): number | null {
  return v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
}

function reached(v?: [number, number]): boolean {
  return !!v && v[1] >= MIN_TRIES && (v[0] / v[1]) * 100 >= MASTERY
}

export function useConjProgress() {
  const { state, mutate, loaded } = useServerPlan<ConjState>('koconj', 'vyling.ko.conj', normalize, isEmpty)

  // Trả về số đuôi lần đầu đạt chuẩn trong lượt này (để cộng điểm ngữ pháp đúng một lần mỗi đuôi)
  const finishRound = useCallback((answers: Answer[]): number => {
    const stats = { ...state.stats }
    for (const a of answers) {
      const [r, t] = stats[a.ending] ?? [0, 0]
      stats[a.ending] = [r + (a.ok ? 1 : 0), t + 1]
    }
    const fresh = ENDINGS.map((e) => e.id).filter((id) => !state.mastered.includes(id) && reached(stats[id]))
    mutate((p) => {
      const next = { ...p.stats }
      for (const a of answers) {
        const [r, t] = next[a.ending] ?? [0, 0]
        next[a.ending] = [r + (a.ok ? 1 : 0), t + 1]
      }
      const wrong = answers.filter((a) => !a.ok).map((a) => a.dict)
      const right = new Set(answers.filter((a) => a.ok).map((a) => a.dict))
      const weak = [...new Set([...wrong, ...p.weak.filter((w) => !right.has(w) || wrong.includes(w))])].slice(0, WEAK_CAP)
      const mastered = [...new Set([...p.mastered, ...ENDINGS.map((e) => e.id).filter((id) => reached(next[id]))])]
      return { stats: next, weak, mastered, rounds: p.rounds + 1 }
    })
    return fresh.length
  }, [state.stats, state.mastered, mutate])

  return { state, loaded, finishRound }
}
