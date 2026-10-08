import { useEffect, useState } from 'react'
import { fetchPlanApi } from '@/core/api/me.api'
import { hasUnsaved } from '@/core/hooks/useServerPlan'
import { useAuth } from '@/store/auth.store'

// Điểm tốt nhất của từng phòng luyện (Hangul, Số đếm, Chia đuôi…) để lộ trình 12 tuần tự đánh dấu nhiệm vụ.
// Chỉ đọc: lấy bản local, rồi bản server nếu đã đăng nhập và local không có thay đổi chưa lưu.

export type LabKey = 'kohangul' | 'konumbers' | 'koconj' | 'kopart' | 'koorder' | 'zhpinyin' | 'zhhanviet' | 'zhnumbers' | 'zhorder'
export type LabScores = Partial<Record<LabKey, Record<string, number>>>

type Raw = Record<string, unknown>

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0)

function bestMap(raw: Raw): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries((raw.best ?? {}) as Raw)) out[k] = num(v)
  return out
}

// Độ chính xác của một nhóm mục [đúng, sai] chỉ tính khi đã làm đủ số câu
function accuracy(pairs: [number, number][], min: number): number {
  const right = pairs.reduce((s, p) => s + p[0], 0)
  const all = pairs.reduce((s, p) => s + p[0] + p[1], 0)
  return all >= min ? Math.round((right / all) * 100) : 0
}

const pairsOf = (stats: unknown) =>
  Object.entries((stats ?? {}) as Record<string, unknown>)
    .filter(([, v]) => Array.isArray(v))
    .map(([k, v]) => [k, [num((v as unknown[])[0]), num((v as unknown[])[1])]] as [string, [number, number]])

const SOURCES: Record<LabKey, { local: string; score: (raw: Raw) => Record<string, number> }> = {
  kohangul: {
    local: 'vyling.ko.hangul',
    score: (raw) => {
      const out: Record<string, number> = {}
      for (const [k, v] of Object.entries((raw.done ?? {}) as Raw)) out[k] = num(v)
      return out
    },
  },
  konumbers: { local: 'vyling.ko.numbers', score: bestMap },
  koconj: {
    local: 'vyling.ko.conj',
    // Đuôi đã "vững" giữ 100; còn lại lấy độ chính xác khi đã làm từ 10 câu
    score: (raw) => {
      const out: Record<string, number> = {}
      for (const [k, v] of Object.entries((raw.stats ?? {}) as Raw)) {
        if (Array.isArray(v)) out[k] = num(v[1]) >= 10 ? Math.round((num(v[0]) / num(v[1])) * 100) : 0
      }
      for (const m of (Array.isArray(raw.mastered) ? raw.mastered : []) as string[]) out[m] = 100
      return out
    },
  },
  kopart: { local: 'vyling.ko.particles', score: bestMap },
  koorder: { local: 'vyling.ko.order', score: bestMap },
  zhpinyin: {
    local: 'vyling.zh.pinyin',
    score: (raw) => {
      const pairs = pairsOf(raw.stats)
      const out: Record<string, number> = {}
      for (const [k, v] of pairs) out[k] = accuracy([v], 10)
      out.pairs = accuracy(pairs.filter(([k]) => k.includes('-')).map(([, v]) => v), 20)
      out.tones = accuracy(pairs.filter(([k]) => /^t\d$/.test(k)).map(([, v]) => v), 20)
      return out
    },
  },
  zhhanviet: { local: 'vyling.zh.hanviet', score: bestMap },
  zhnumbers: { local: 'vyling.zh.numbers', score: bestMap },
  zhorder: { local: 'vyling.zh.order', score: bestMap },
}

export const LAB_KEYS: Record<string, LabKey[]> = {
  ko: ['kohangul', 'konumbers', 'koconj', 'kopart', 'koorder'],
  zh: ['zhpinyin', 'zhhanviet', 'zhnumbers', 'zhorder'],
}

function readLocal(key: LabKey): Record<string, number> {
  try {
    const raw = localStorage.getItem(SOURCES[key].local)
    return raw ? SOURCES[key].score(JSON.parse(raw) as Raw) : {}
  } catch {
    return {}
  }
}

export function labDone(scores: LabScores, lab: LabKey, modes: string[], pass: number): boolean {
  const s = scores[lab] ?? {}
  return modes.length > 0 && modes.every((m) => (s[m] ?? 0) >= pass)
}

export function useLabScores(lang: string): LabScores {
  const { isAuthed } = useAuth()
  const keys = LAB_KEYS[lang] ?? []
  const [scores, setScores] = useState<LabScores>(() => Object.fromEntries(keys.map((k) => [k, readLocal(k)])))

  useEffect(() => {
    const list = LAB_KEYS[lang] ?? []
    if (!list.length) return undefined
    setScores(Object.fromEntries(list.map((k) => [k, readLocal(k)])))
    if (!isAuthed) return undefined
    let alive = true
    list.forEach((k) => {
      if (hasUnsaved(k)) return
      fetchPlanApi<Raw>(k)
        .then((r) => {
          if (!alive || r.data == null || hasUnsaved(k)) return
          setScores((prev) => ({ ...prev, [k]: SOURCES[k].score(r.data as Raw) }))
        })
        .catch(() => {  })
    })
    return () => { alive = false }
  }, [lang, isAuthed])

  return scores
}
