import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import { track } from '@/core/monitor'
import {
  ALL_CHUNKS, DIM_BY_ID, DIMS, PACKS, chunkById, packOfChunk,
  AUTOMATIC_MS, speedBand,
  type ActiveChunk, type ActivePack, type Dim,
} from '@/data/englishActive'

const PLAN_ID = 'enactive'
const LOCAL_KEY = 'vyling.en.active'

const MAX_MS_KEEP = 5
const INTERVALS = [1, 1, 3, 7, 16, 35]

export interface ChunkRec {
  lv: number
  d: Partial<Record<Dim, number>>
  ms: number[]
  seen: number
  at: string
  due: string
}

export interface DayLog {
  day: string
  drills: number
  outputs: number
  scenes: number
}

export interface ActiveState {
  recs: Record<string, ChunkRec>
  goal: string
  scenes: Record<string, number>
  days: DayLog[]
  started: string
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function today(): string {
  return isoOf(new Date())
}

function plusDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return isoOf(d)
}

function normalize(raw: unknown): ActiveState {
  const p = (raw ?? {}) as Partial<ActiveState>
  const recs: Record<string, ChunkRec> = {}
  if (p.recs && typeof p.recs === 'object') {
    for (const [id, r] of Object.entries(p.recs as Record<string, Partial<ChunkRec>>)) {
      if (!chunkById(id)) continue
      recs[id] = {
        lv: typeof r?.lv === 'number' ? Math.max(0, Math.min(5, r.lv)) : 0,
        d: r?.d && typeof r.d === 'object' ? r.d : {},
        ms: Array.isArray(r?.ms) ? r.ms.filter((x) => typeof x === 'number').slice(-MAX_MS_KEEP) : [],
        seen: typeof r?.seen === 'number' ? r.seen : 0,
        at: typeof r?.at === 'string' ? r.at : '',
        due: typeof r?.due === 'string' ? r.due : '',
      }
    }
  }
  return {
    recs,
    goal: typeof p.goal === 'string' && PACKS.some((x) => x.id === p.goal) ? p.goal : '',
    scenes: p.scenes && typeof p.scenes === 'object' ? p.scenes : {},
    days: Array.isArray(p.days) ? p.days.slice(-70) : [],
    started: typeof p.started === 'string' ? p.started : '',
  }
}

function isEmpty(s: ActiveState): boolean {
  return !Object.keys(s.recs).length && !s.days.length && !Object.keys(s.scenes).length
}

const BLANK: ChunkRec = { lv: 0, d: {}, ms: [], seen: 0, at: '', due: '' }

export function median(xs: number[]): number {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const mid = s.length >> 1
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2)
}

export function levelOf(rec: ChunkRec | undefined): number {
  return rec?.lv ?? 0
}

function promote(rec: ChunkRec): number {
  let lv = 0
  for (const dim of DIMS) {
    const got = rec.d[dim.id] ?? 0
    if (got < dim.hits) break
    if (dim.proves === 5 && median(rec.ms) > AUTOMATIC_MS) break
    lv = dim.proves
  }
  return Math.max(lv, rec.lv >= 1 && lv === 0 ? 1 : lv)
}

export function nextDim(rec: ChunkRec | undefined): Dim {
  const r = rec ?? BLANK
  for (const dim of DIMS) {
    if ((r.d[dim.id] ?? 0) < dim.hits) return dim.id
  }
  return 'respond'
}

export interface MasteryStats {
  byLevel: number[]
  touched: number
  active: number
  automatic: number
  medianMs: number
  fastPct: number
  due: number
  total: number
}

function useMasteryState() {
  const { state, mutate, loaded } = useServerPlan<ActiveState>(PLAN_ID, LOCAL_KEY, normalize, isEmpty)

  const bumpDay = useCallback((field: keyof Omit<DayLog, 'day'>, n = 1) => {
    const day = today()
    return (p: ActiveState): ActiveState => {
      const days = [...p.days]
      const at = days.findIndex((d) => d.day === day)
      if (at >= 0) days[at] = { ...days[at], [field]: days[at][field] + n }
      else days.push({ day, drills: 0, outputs: 0, scenes: 0, [field]: n })
      return { ...p, days: days.slice(-70), started: p.started || day }
    }
  }, [])

  const hit = useCallback((chunkId: string, dim: Dim, ms = 0) => {
    mutate((p) => {
      const prev = p.recs[chunkId] ?? BLANK
      const d = { ...prev.d, [dim]: (prev.d[dim] ?? 0) + 1 }
      const ms2 = ms > 0 && (dim === 'recall' || dim === 'respond')
        ? [...prev.ms, ms].slice(-MAX_MS_KEEP)
        : prev.ms
      const rec: ChunkRec = { ...prev, d, ms: ms2, seen: prev.seen + 1, at: today() }
      rec.lv = promote(rec)
      rec.due = plusDays(INTERVALS[rec.lv] ?? 1)
      const next = bumpDay('drills')({ ...p, recs: { ...p.recs, [chunkId]: rec } })
      return next
    })
    track('en_active_hit', { dim, ms })
  }, [mutate, bumpDay])

  const miss = useCallback((chunkId: string, dim: Dim) => {
    mutate((p) => {
      const prev = p.recs[chunkId] ?? BLANK
      const d = { ...prev.d, [dim]: 0 }
      const rec: ChunkRec = { ...prev, d, seen: prev.seen + 1, at: today(), due: plusDays(1) }
      rec.lv = promote(rec)
      return bumpDay('drills')({ ...p, recs: { ...p.recs, [chunkId]: rec } })
    })
    track('en_active_miss', { dim })
  }, [mutate, bumpDay])

  const logOutput = useCallback(() => {
    mutate(bumpDay('outputs'))
  }, [mutate, bumpDay])

  const watchScene = useCallback((packId: string) => {
    mutate((p) => bumpDay('scenes')({ ...p, scenes: { ...p.scenes, [packId]: (p.scenes[packId] ?? 0) + 1 } }))
    track('en_active_scene', { packId })
  }, [mutate, bumpDay])

  const setGoal = useCallback((goal: string) => {
    mutate((p) => ({ ...p, goal }))
    track('en_active_goal', { goal })
  }, [mutate])

  const recOf = useCallback((id: string): ChunkRec => state.recs[id] ?? BLANK, [state.recs])

  const stats: MasteryStats = useMemo(() => {
    const byLevel = [0, 0, 0, 0, 0, 0]
    const allMs: number[] = []
    let touched = 0
    let due = 0
    const day = today()
    for (const c of ALL_CHUNKS) {
      const r = state.recs[c.id]
      if (!r) { byLevel[0] += 1; continue }
      byLevel[r.lv] += 1
      if (r.seen) touched += 1
      if (r.ms.length) allMs.push(median(r.ms))
      if (r.lv > 0 && r.due && r.due <= day) due += 1
    }
    const fast = allMs.filter((m) => speedBand(m) === 'fast').length
    return {
      byLevel,
      touched,
      active: byLevel[3] + byLevel[4] + byLevel[5],
      automatic: byLevel[5],
      medianMs: median(allMs),
      fastPct: allMs.length ? Math.round((fast / allMs.length) * 100) : 0,
      due,
      total: ALL_CHUNKS.length,
    }
  }, [state.recs])

  const dueList = useCallback((packId?: string): ActiveChunk[] => {
    const day = today()
    const pool = packId ? (PACKS.find((p) => p.id === packId)?.chunks ?? []) : ALL_CHUNKS
    return pool
      .filter((c) => {
        const r = state.recs[c.id]
        return r && r.lv > 0 && r.lv < 5 && (!r.due || r.due <= day)
      })
      .sort((a, b) => (state.recs[a.id]?.lv ?? 0) - (state.recs[b.id]?.lv ?? 0))
  }, [state.recs])

  const queueFor = useCallback((packId: string, size = 8): ActiveChunk[] => {
    const pack = PACKS.find((p) => p.id === packId)
    if (!pack) return []
    const day = today()
    const scored = pack.chunks.map((c) => {
      const r = state.recs[c.id]
      if (!r || !r.seen) return { c, k: 1 }
      if (r.lv >= 5) return { c, k: 4 }
      if (!r.due || r.due <= day) return { c, k: 0 }
      return { c, k: 3 }
    })
    return scored.sort((a, b) => a.k - b.k).slice(0, size).map((x) => x.c)
  }, [state.recs])

  const familyMastery = useCallback((members: ActiveChunk[]) => {
    const n = members.length || 1
    const pct = [1, 2, 3, 4, 5].map((lv) => {
      const at = members.filter((c) => (state.recs[c.id]?.lv ?? 0) >= lv).length
      return Math.round((at / n) * 100)
    })
    const ms = members
      .map((c) => state.recs[c.id]?.ms ?? [])
      .filter((x) => x.length)
      .map(median)
    return {
      pct,
      total: members.length,
      touched: members.filter((c) => (state.recs[c.id]?.seen ?? 0) > 0).length,
      medianMs: median(ms),
    }
  }, [state.recs])

  const packProgress = useCallback((pack: ActivePack) => {
    let sum = 0
    let active = 0
    for (const c of pack.chunks) {
      const lv = state.recs[c.id]?.lv ?? 0
      sum += lv
      if (lv >= 3) active += 1
    }
    return {
      pct: Math.round((sum / (pack.chunks.length * 5)) * 100),
      active,
      total: pack.chunks.length,
      watched: state.scenes[pack.id] ?? 0,
    }
  }, [state.recs, state.scenes])

  const todayLog: DayLog = useMemo(() => {
    const day = today()
    return state.days.find((d) => d.day === day) ?? { day, drills: 0, outputs: 0, scenes: 0 }
  }, [state.days])

  const streak = useMemo(() => {
    const done = new Set(state.days.filter((d) => d.drills + d.outputs > 0).map((d) => d.day))
    if (!done.size) return 0
    const d = new Date()
    if (!done.has(isoOf(d))) d.setDate(d.getDate() - 1)
    let n = 0
    while (n < 400 && done.has(isoOf(d))) {
      n += 1
      d.setDate(d.getDate() - 1)
    }
    return n
  }, [state.days])

  return {
    state, loaded, stats, todayLog, streak,
    recOf, hit, miss, logOutput, watchScene, setGoal,
    dueList, queueFor, packProgress, familyMastery,
  }
}

type MasteryApi = ReturnType<typeof useMasteryState>

const Ctx = createContext<MasteryApi | null>(null)

export function MasteryProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useMasteryState()}>{children}</Ctx.Provider>
}

export function useMastery(): MasteryApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMastery phải nằm trong <MasteryProvider>')
  return ctx
}

export { DIM_BY_ID, packOfChunk }
