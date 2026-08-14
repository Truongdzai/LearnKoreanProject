import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { track } from '@/core/monitor'

const PLAN_ID = 'endeep'
const LOCAL_KEY = 'vyling.en.deep'

export type DeepPart = 'sense' | 'colloc' | 'example' | 'drill'

export const PARTS: DeepPart[] = ['sense', 'colloc', 'example', 'drill']

export interface WordProgress {
  done: DeepPart[]
  heard: number
  ok: number
  asked: number
  sec: number
  at: string
}

export interface DeepState {
  words: Record<string, WordProgress>
  days: string[]
}

const BLANK: WordProgress = { done: [], heard: 0, ok: 0, asked: 0, sec: 0, at: '' }

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function today(): string {
  return isoOf(new Date())
}

function normalize(raw: unknown): DeepState {
  const p = (raw ?? {}) as Partial<DeepState>
  const words: Record<string, WordProgress> = {}
  if (p.words && typeof p.words === 'object') {
    for (const [k, v] of Object.entries(p.words as Record<string, Partial<WordProgress>>)) {
      words[k] = {
        done: Array.isArray(v?.done) ? v.done.filter((x): x is DeepPart => PARTS.includes(x as DeepPart)) : [],
        heard: typeof v?.heard === 'number' ? v.heard : 0,
        ok: typeof v?.ok === 'number' ? v.ok : 0,
        asked: typeof v?.asked === 'number' ? v.asked : 0,
        sec: typeof v?.sec === 'number' ? v.sec : 0,
        at: typeof v?.at === 'string' ? v.at : '',
      }
    }
  }
  return {
    words,
    days: Array.isArray(p.days) ? p.days.filter((d) => typeof d === 'string').slice(-90) : [],
  }
}

function isEmpty(s: DeepState): boolean {
  return !Object.keys(s.words).length && !s.days.length
}

function useDeepState() {
  const { state, mutate, loaded } = useServerPlan<DeepState>(PLAN_ID, LOCAL_KEY, normalize, isEmpty)

  const touchDay = (p: DeepState): DeepState => {
    const d = today()
    return p.days.includes(d) ? p : { ...p, days: [...p.days, d].slice(-90) }
  }

  const progressOf = useCallback(
    (term: string): WordProgress => state.words[term.toLowerCase()] ?? BLANK,
    [state.words],
  )

  const bump = useCallback((term: string, fn: (w: WordProgress) => WordProgress) => {
    const key = term.toLowerCase()
    mutate((p) => {
      const prev = p.words[key] ?? BLANK
      const next = { ...fn(prev), at: today() }
      return touchDay({ ...p, words: { ...p.words, [key]: next } })
    })
  }, [mutate])

  const markPart = useCallback((term: string, part: DeepPart) => {
    bump(term, (w) => (w.done.includes(part) ? w : { ...w, done: [...w.done, part] }))
    track('en_deep_part', { part })
  }, [bump])

  const addHeard = useCallback((term: string, n = 1) => {
    bump(term, (w) => ({ ...w, heard: w.heard + n }))
  }, [bump])

  const addAnswer = useCallback((term: string, ok: boolean) => {
    bump(term, (w) => ({ ...w, ok: w.ok + (ok ? 1 : 0), asked: w.asked + 1 }))
  }, [bump])

  const addTime = useCallback((term: string, sec: number) => {
    if (sec <= 0) return
    bump(term, (w) => ({ ...w, sec: w.sec + Math.round(sec) }))
  }, [bump])

  const streak = useMemo(() => {
    const set = new Set(state.days)
    const d = new Date()
    if (!set.has(isoOf(d))) d.setDate(d.getDate() - 1)
    let n = 0
    while (n < 400 && set.has(isoOf(d))) {
      n += 1
      d.setDate(d.getDate() - 1)
    }
    return n
  }, [state.days])

  const week = useMemo(() => {
    const set = new Set(state.days)
    const base = new Date()
    const shift = (base.getDay() + 6) % 7
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - shift + i)
      return { label: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i], on: set.has(isoOf(d)) }
    })
  }, [state.days])

  const studied = useMemo(() => Object.keys(state.words).length, [state.words])

  return { state, loaded, progressOf, markPart, addHeard, addAnswer, addTime, streak, week, studied }
}

type DeepApi = ReturnType<typeof useDeepState>

const Ctx = createContext<DeepApi | null>(null)

export function DeepProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useDeepState()}>{children}</Ctx.Provider>
}

export function useDeep(): DeepApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDeep phải nằm trong <DeepProvider>')
  return ctx
}

export function pctOf(w: WordProgress): number {
  return Math.round((w.done.length / PARTS.length) * 100)
}
