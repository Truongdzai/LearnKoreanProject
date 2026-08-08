import { useCallback, useMemo } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'

export type Grade = 'again' | 'hard' | 'good' | 'easy'

export interface CardState {
  box: number
  due: number
  seen: number
}

export interface DeckState {
  cards: Record<string, CardState>
  mastered: string[]
  saved: string[]
}

const MIN = 60000
const DAY = 86400000

const STEPS = [1, 2, 4, 7, 14, 30, 60]

function normalize(raw: unknown): DeckState {
  const p = (raw ?? {}) as Partial<DeckState>
  return {
    cards: p.cards && typeof p.cards === 'object' ? p.cards : {},
    mastered: Array.isArray(p.mastered) ? p.mastered : [],
    saved: Array.isArray(p.saved) ? p.saved : [],
  }
}

const isEmpty = (s: DeckState) => !Object.keys(s.cards).length && !s.mastered.length && !s.saved.length

const nextBox = (box: number, grade: Grade): number =>
  grade === 'again' ? 0 : grade === 'hard' ? box : grade === 'good' ? box + 1 : box + 2

export function gradeDays(box: number, grade: Grade): number {
  if (grade === 'again') return 0
  const idx = grade === 'hard' ? box : grade === 'good' ? box + 1 : box + 2
  return STEPS[Math.min(STEPS.length - 1, idx)] ?? 1
}

export function gradeLabel(box: number, grade: Grade): string {
  if (grade === 'again') return '10 phút'
  const d = gradeDays(box, grade)
  return `${d} ngày`
}

export function useDeck(lang: string) {
  const { state, mutate } = useServerPlan<DeckState>(
    `${lang}deck`, `vyling.${lang}.deck`, normalize, isEmpty,
  )

  const grade = useCallback((term: string, g: Grade) => {
    mutate((p) => {
      const cur = p.cards[term] ?? { box: 0, due: 0, seen: 0 }
      const box = nextBox(cur.box, g)
      const days = gradeDays(cur.box, g)
      const due = Date.now() + (days ? days * DAY : 10 * MIN)
      return {
        ...p,
        cards: { ...p.cards, [term]: { box: Math.min(STEPS.length - 1, box), due, seen: cur.seen + 1 } },
      }
    })
  }, [mutate])

  const toggleMastered = useCallback((term: string) => {
    mutate((p) => ({
      ...p,
      mastered: p.mastered.includes(term) ? p.mastered.filter((x) => x !== term) : [...p.mastered, term],
    }))
  }, [mutate])

  const toggleSaved = useCallback((term: string) => {
    mutate((p) => ({
      ...p,
      saved: p.saved.includes(term) ? p.saved.filter((x) => x !== term) : [...p.saved, term],
    }))
  }, [mutate])

  const mastered = useMemo(() => new Set(state.mastered), [state.mastered])
  const saved = useMemo(() => new Set(state.saved), [state.saved])

  const boxOf = useCallback((term: string) => state.cards[term]?.box ?? 0, [state.cards])

  return { deck: state, grade, toggleMastered, toggleSaved, mastered, saved, boxOf }
}
