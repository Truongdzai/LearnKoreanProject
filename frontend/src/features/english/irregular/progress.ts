import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { IRREGULAR_VERBS } from '@/data/english/irregularVerbs'
import type { ModeId } from './verbs'

export interface IrrState {
  best: Partial<Record<ModeId, number>>
  // Động từ vừa sai, dạng "chế độ:V1" (vd v3:go), mới nhất đứng đầu. Làm đúng ở chính chế độ đó
  // hoặc tự gõ đúng cả hai dạng thì gỡ ra.
  weak: string[]
  // Động từ đã tự gõ đúng cả V2 lẫn V3
  known: string[]
  rounds: number
}

export interface Answer {
  v1: string
  ok: boolean
}

export const MASTERY = 80
const WEAK_CAP = 40
const MODES: ModeId[] = ['v2', 'v3', 'type']
const V1 = new Set(IRREGULAR_VERBS.map((v) => v.v1))

const verbList = (raw: unknown, cap: number) =>
  Array.isArray(raw) ? [...new Set(raw.filter((w): w is string => typeof w === 'string' && V1.has(w)))].slice(0, cap) : []

// "v3:go" → go; dữ liệu cũ chỉ có "go"
export const weakVerb = (w: string) => w.slice(w.indexOf(':') + 1)
const weakList = (raw: unknown, cap: number) =>
  Array.isArray(raw)
    ? [...new Set(raw.filter((w): w is string => typeof w === 'string' && V1.has(weakVerb(w)) && /^((v2|v3|type):)?[a-z]+$/.test(w)))].slice(0, cap)
    : []

function normalize(raw: unknown): IrrState {
  const r = (raw ?? {}) as Partial<IrrState>
  const best: IrrState['best'] = {}
  for (const id of MODES) {
    const v = Number(r.best?.[id])
    if (Number.isFinite(v) && v > 0) best[id] = Math.min(100, Math.round(v))
  }
  return {
    best,
    weak: weakList(r.weak, WEAK_CAP),
    known: verbList(r.known, V1.size),
    rounds: Math.max(0, Math.floor(Number(r.rounds) || 0)),
  }
}

const isEmpty = (s: IrrState) => !s.rounds && !Object.keys(s.best).length && !s.known.length

export function useIrrProgress() {
  const { state, mutate, loaded } = useServerPlan<IrrState>('enirregular', 'vyling.en.irregular', normalize, isEmpty)

  // Trả về true nếu đây là lần đầu chế độ này đạt chuẩn (để cộng điểm ngữ pháp đúng một lần)
  const finishRound = useCallback((mode: ModeId, pct: number, answers: Answer[]): boolean => {
    const first = (state.best[mode] ?? 0) < MASTERY && pct >= MASTERY
    mutate((p) => {
      const wrong = answers.filter((a) => !a.ok).map((a) => a.v1)
      const right = new Set(answers.filter((a) => a.ok).map((a) => a.v1))
      const cleared = (w: string) => {
        const v = weakVerb(w)
        if (!right.has(v)) return false
        // Tự gõ đúng xoá mọi cờ; chọn đúng chỉ xoá cờ của chính chế độ đó (và cờ cũ không ghi chế độ)
        return mode === 'type' || !w.includes(':') || w.startsWith(mode + ':')
      }
      const weak = [...new Set([...wrong.map((v) => `${mode}:${v}`), ...p.weak.filter((w) => !cleared(w))])].slice(0, WEAK_CAP)
      // Chỉ chế độ tự gõ mới xác nhận "thuộc"; sai ở bất kỳ chế độ nào thì bỏ khỏi danh sách thuộc
      const known = [...new Set([...p.known.filter((k) => !wrong.includes(k)), ...(mode === 'type' ? [...right] : [])])]
      return { best: { ...p.best, [mode]: Math.max(p.best[mode] ?? 0, pct) }, weak, known, rounds: p.rounds + 1 }
    })
    return first
  }, [state.best, mutate])

  return { state, loaded, finishRound }
}
