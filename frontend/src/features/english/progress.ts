import { useCallback, useEffect, useMemo, useState } from 'react'
import { UNITS, type WeekPlan, type WeekTask } from '@/data/englishCore'
import { fetchAllCards } from '@/core/api/srs.api'

/** Phát âm tiếng Anh bằng Web Speech API (phần "Sound" của ICES). */
export function speakEN(text: string, rate = 0.95): void {
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = rate
    speechSynthesis.speak(u)
  } catch {
    /* trình duyệt không hỗ trợ */
  }
}

const KEY = 'vyling.en.learned'

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function write(list: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/* ------------------- Tiến độ lộ trình 12 tuần ------------------- */

const PLAN_KEY = 'vyling.en.plan'

export interface PlanState {
  /** Ngày bắt đầu hành trình 90 ngày (YYYY-MM-DD); null = chưa bấm bắt đầu. */
  start: string | null
  /** Nhiệm vụ tự tick (video/speak/review/custom) đã hoàn thành. */
  manual: string[]
  /** Điểm cao nhất của bài kiểm tra từng tuần, khóa dạng "w3". */
  quiz: Record<string, number>
  /** Tuần đã trao thưởng XP hoàn thành (chống cộng trùng). */
  rewarded: number[]
}

export function readPlan(): PlanState {
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    const p = raw ? (JSON.parse(raw) as Partial<PlanState>) : {}
    return { start: p.start ?? null, manual: p.manual ?? [], quiz: p.quiz ?? {}, rewarded: p.rewarded ?? [] }
  } catch {
    return { start: null, manual: [], quiz: {}, rewarded: [] }
  }
}

function writePlan(p: PlanState): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Ngày thứ mấy của hành trình (1-based); chưa bắt đầu trả về 0. */
export function planDay(start: string | null): number {
  if (!start) return 0
  const ms = Date.now() - new Date(start + 'T00:00:00').getTime()
  return Math.max(1, Math.floor(ms / 86400000) + 1)
}

/** Tuần gợi ý theo lịch (1..12). */
export function planWeek(start: string | null): number {
  const day = planDay(start)
  if (!day) return 1
  return Math.min(12, Math.floor((day - 1) / 7) + 1)
}

/** Ghi điểm kiểm tra tuần (giữ điểm cao nhất) — gọi được từ ngoài hook. */
export function recordWeekQuiz(week: number, pct: number): void {
  const p = readPlan()
  const key = `w${week}`
  p.quiz[key] = Math.max(p.quiz[key] ?? 0, pct)
  writePlan(p)
}

/** Quản lý trạng thái lộ trình 12 tuần (localStorage, dùng được cho cả khách). */
export function usePlan() {
  const [plan, setPlan] = useState<PlanState>(readPlan)

  const mutate = useCallback((fn: (p: PlanState) => PlanState) => {
    setPlan((prev) => {
      const next = fn(prev)
      writePlan(next)
      return next
    })
  }, [])

  const startPlan = useCallback(() => {
    mutate((p) => (p.start ? p : { ...p, start: todayISO() }))
  }, [mutate])

  const toggleTask = useCallback((id: string) => {
    mutate((p) => ({
      ...p,
      manual: p.manual.includes(id) ? p.manual.filter((x) => x !== id) : [...p.manual, id],
    }))
  }, [mutate])

  const grantReward = useCallback((week: number) => {
    mutate((p) => (p.rewarded.includes(week) ? p : { ...p, rewarded: [...p.rewarded, week] }))
  }, [mutate])

  return { plan, startPlan, toggleTask, grantReward }
}

/** Số từ đã thuộc trong một unit. */
export function learnedInUnit(unitId: string, learned: Set<string>): number {
  const unit = UNITS.find((u) => u.id === unitId)
  return unit ? unit.words.filter((w) => learned.has(w.en)).length : 0
}

/** Đích số từ của nhiệm vụ vocab (ceil theo % kích thước unit). */
export function vocabTarget(t: WeekTask): number {
  const unit = UNITS.find((u) => u.id === t.unitId)
  if (!unit) return 0
  return Math.ceil((unit.words.length * (t.pct ?? 100)) / 100)
}

/** Một nhiệm vụ tuần đã xong chưa (vocab/quiz/total tự tính, còn lại theo tick tay). */
export function taskDone(t: WeekTask, week: number, learned: Set<string>, plan: PlanState, bank = 0): boolean {
  if (t.kind === 'vocab') return learnedInUnit(t.unitId ?? '', learned) >= vocabTarget(t)
  if (t.kind === 'quiz') return (plan.quiz[`w${week}`] ?? -1) >= (t.passPct ?? 70)
  if (t.kind === 'total') return bank >= (t.targetTotal ?? Infinity)
  return plan.manual.includes(t.id)
}

/** Cả tuần đã hoàn thành chưa. */
export function weekDone(w: WeekPlan, learned: Set<string>, plan: PlanState, bank = 0): boolean {
  return w.tasks.every((t) => taskDone(t, w.week, learned, plan, bank))
}

/** Thẻ SRS trông như tiếng Anh: thuần chữ Latin ASCII (loại CJK, tiếng Việt có dấu…). */
const EN_FRONT_RE = /^[a-z][a-z'’ -]*$/i

/**
 * KHO TỪ tiếng Anh tích luỹ = từ lõi đã thuộc + thẻ SRS dạng Latin mọi nguồn,
 * khử trùng lặp không phân biệt hoa thường. Lỗi mạng thì rơi về từ lõi.
 */
export function useWordBank(learned: Set<string>): number {
  const [srsFronts, setSrsFronts] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    fetchAllCards()
      .then((r) => {
        if (!alive) return
        setSrsFronts(r.cards.map((c) => c.front.trim()).filter((f) => EN_FRONT_RE.test(f)))
      })
      .catch(() => { /* khách offline: đếm bằng từ lõi là đủ */ })
    return () => { alive = false }
  }, [])

  return useMemo(() => {
    const bank = new Set<string>()
    learned.forEach((w) => bank.add(w.toLowerCase()))
    srsFronts.forEach((w) => bank.add(w.toLowerCase()))
    return bank.size
  }, [learned, srsFronts])
}

/** Quản lý tập từ đã thuộc, lưu trong localStorage để giữ tiến độ cho cả khách. */
export function useLearnedWords() {
  const [learned, setLearned] = useState<Set<string>>(() => new Set(read()))

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setLearned(new Set(read()))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const mark = useCallback((word: string, on = true) => {
    setLearned((prev) => {
      const next = new Set(prev)
      if (on) next.add(word)
      else next.delete(word)
      write([...next])
      return next
    })
  }, [])

  const has = useCallback((word: string) => learned.has(word), [learned])

  return { learned, mark, has }
}
