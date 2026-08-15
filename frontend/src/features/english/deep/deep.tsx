import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { track } from '@/core/monitor'

const PLAN_ID = 'endeep'
const LOCAL_KEY = 'vyling.en.deep'

export type DeepPart = 'sense' | 'colloc' | 'compare' | 'example' | 'drill'

export const PARTS: DeepPart[] = ['sense', 'colloc', 'compare', 'example', 'drill']

export interface WordProgress {
  done: DeepPart[]
  senses: number[]
  total: number
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

const BLANK: WordProgress = { done: [], senses: [], total: 0, heard: 0, ok: 0, asked: 0, sec: 0, at: '' }

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
        senses: Array.isArray(v?.senses)
          ? [...new Set(v.senses.filter((n): n is number => typeof n === 'number' && n >= 0))]
          : [],
        total: typeof v?.total === 'number' ? v.total : 0,
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

  const touchWord = useCallback((term: string) => {
    bump(term, (w) => w)
  }, [bump])

  const toggleSense = useCallback((term: string, i: number, total: number) => {
    bump(term, (w) => {
      const on = w.senses.includes(i)
      const senses = on ? w.senses.filter((x) => x !== i) : [...w.senses, i]
      const done = !on && senses.length >= total && total > 0 && !w.done.includes('sense')
        ? [...w.done, 'sense' as DeepPart]
        : w.done
      return { ...w, senses, total: Math.max(total, w.total), done }
    })
    track('en_deep_sense', { i })
  }, [bump])

  const setSenseTotal = useCallback((term: string, total: number) => {
    if (total <= 0) return
    bump(term, (w) => (w.total === total ? w : { ...w, total }))
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

  const mastered = useMemo(
    () => Object.values(state.words).filter((w) => levelOf(w) >= 4).length,
    [state.words],
  )

  const deepFull = useMemo(
    () => Object.values(state.words).filter((w) => levelOf(w) >= 3).length,
    [state.words],
  )

  return {
    state, loaded, progressOf, markPart, touchWord, toggleSense, setSenseTotal,
    addHeard, addAnswer, addTime, streak, week, studied, mastered, deepFull,
  }
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

export interface MasteryLevel {
  lv: number
  name: string
  desc: string
  tone: string
}

export const MASTERY: MasteryLevel[] = [
  { lv: 0, name: 'Chưa mở', desc: 'Bạn chưa học sâu từ này lần nào.', tone: 'tone-a' },
  { lv: 1, name: 'Biết nghĩa chính', desc: 'Nắm được nghĩa hay gặp nhất, nhưng gặp nghĩa khác là khựng.', tone: 'tone-a' },
  { lv: 2, name: 'Nắm quá nửa nghĩa', desc: 'Đã đánh dấu hiểu quá nửa số nghĩa của từ.', tone: 'tone-c' },
  { lv: 3, name: 'Đủ nghĩa', desc: 'Hiểu hết mọi nghĩa của từ — gặp nghĩa nào cũng không khựng.', tone: 'tone-e' },
  { lv: 4, name: 'Dùng được', desc: 'Phân biệt được với từ gần nghĩa và làm đúng phần lớn bài luyện.', tone: 'tone-b' },
  { lv: 5, name: 'Làm chủ', desc: 'Đủ nghĩa, đủ cụm, phân biệt sắc thái và làm bài gần như không sai.', tone: 'tone-f' },
]

export function senseRatio(w: WordProgress): number {
  if (!w.total) return w.senses.length ? 1 : 0
  return Math.min(1, w.senses.length / w.total)
}

export function levelOf(w: WordProgress): number {
  const ratio = senseRatio(w)
  const acc = w.asked >= 4 ? w.ok / w.asked : 0
  if (!w.senses.length && !w.done.length) return 0
  if (ratio >= 1 && w.done.includes('colloc') && w.done.includes('compare') && w.asked >= 8 && acc >= 0.9) return 5
  if (ratio >= 1 && w.done.includes('colloc') && (w.done.includes('compare') || acc >= 0.8) && w.asked >= 4) return 4
  if (ratio >= 1) return 3
  if (ratio >= 0.5) return 2
  return 1
}

export function masteryOf(w: WordProgress): MasteryLevel {
  return MASTERY[levelOf(w)]
}
