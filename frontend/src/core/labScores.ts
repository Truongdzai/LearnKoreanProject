import { useEffect, useState } from 'react'
import { fetchPlanApi } from '@/core/api/me.api'
import { hasUnsaved } from '@/core/hooks/useServerPlan'
import { useAuth } from '@/store/auth.store'

// Điểm tốt nhất của từng phòng luyện (Hangul, Số đếm, Chia đuôi…) để lộ trình 12 tuần tự đánh dấu nhiệm vụ.
// Chỉ đọc: lấy bản local, rồi bản server nếu đã đăng nhập và local không có thay đổi chưa lưu.

export type LabKey = 'kohangul' | 'konumbers' | 'koconj' | 'kopart' | 'koorder' | 'zhpinyin' | 'zhhanviet' | 'zhnumbers' | 'zhorder'
  | 'enirregular' | 'ennumbers' | 'enorder' | 'enprep' | 'entense' | 'enconfuse' | 'encompare' | 'encond' | 'enpassive' | 'engerund'
  | 'enarticle' | 'enrelative' | 'enquestion' | 'enphrasal' | 'enquantity' | 'enmodal'
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
  enirregular: { local: 'vyling.en.irregular', score: bestMap },
  ennumbers: { local: 'vyling.en.numbers', score: bestMap },
  enorder: { local: 'vyling.en.order', score: bestMap },
  enprep: { local: 'vyling.en.prep', score: bestMap },
  entense: { local: 'vyling.en.tense', score: bestMap },
  enconfuse: { local: 'vyling.en.confuse', score: bestMap },
  encompare: { local: 'vyling.en.compare', score: bestMap },
  encond: { local: 'vyling.en.cond', score: bestMap },
  enpassive: { local: 'vyling.en.passive', score: bestMap },
  engerund: { local: 'vyling.en.gerund', score: bestMap },
  enarticle: { local: 'vyling.en.article', score: bestMap },
  enrelative: { local: 'vyling.en.relative', score: bestMap },
  enquestion: { local: 'vyling.en.question', score: bestMap },
  enphrasal: { local: 'vyling.en.phrasal', score: bestMap },
  enquantity: { local: 'vyling.en.quantity', score: bestMap },
  enmodal: { local: 'vyling.en.modal', score: bestMap },
}

export const LAB_KEYS: Record<string, LabKey[]> = {
  ko: ['kohangul', 'konumbers', 'koconj', 'kopart', 'koorder'],
  zh: ['zhpinyin', 'zhhanviet', 'zhnumbers', 'zhorder'],
  en: ['enirregular', 'ennumbers', 'enorder', 'enprep', 'entense', 'enconfuse', 'encompare', 'encond', 'enpassive', 'engerund',
    'enarticle', 'enrelative', 'enquestion', 'enphrasal', 'enquantity', 'enmodal'],
}

// Các phòng tiếng Anh điền chỗ trống mà mục "Ôn câu sai" gom câu về (tab Ngữ pháp → Ôn câu sai)
export const EN_REVIEW_KEYS: LabKey[] = [
  'entense', 'enarticle', 'encompare', 'encond', 'enpassive', 'engerund', 'enrelative', 'enquestion', 'enphrasal', 'enconfuse',
  'enquantity', 'enmodal',
]

// Phòng luyện nằm ở trang nào, tab nào, mục con nào
export const LAB_TARGET: Record<LabKey, { view: 'korean' | 'chinese' | 'english'; tab: string; pane: string | null }> = {
  kohangul: { view: 'korean', tab: 'hangul', pane: null },
  konumbers: { view: 'korean', tab: 'grammar', pane: 'number' },
  koconj: { view: 'korean', tab: 'grammar', pane: null },
  kopart: { view: 'korean', tab: 'grammar', pane: 'part' },
  koorder: { view: 'korean', tab: 'grammar', pane: 'order' },
  zhpinyin: { view: 'chinese', tab: 'pinyin', pane: null },
  zhhanviet: { view: 'chinese', tab: 'hanviet', pane: 'drill' },
  zhnumbers: { view: 'chinese', tab: 'numbers', pane: null },
  zhorder: { view: 'chinese', tab: 'order', pane: null },
  enirregular: { view: 'english', tab: 'grammar', pane: 'verbs' },
  ennumbers: { view: 'english', tab: 'grammar', pane: 'numbers' },
  enorder: { view: 'english', tab: 'grammar', pane: 'order' },
  enprep: { view: 'english', tab: 'grammar', pane: 'prep' },
  entense: { view: 'english', tab: 'grammar', pane: 'tense' },
  enconfuse: { view: 'english', tab: 'grammar', pane: 'confuse' },
  encompare: { view: 'english', tab: 'grammar', pane: 'compare' },
  encond: { view: 'english', tab: 'grammar', pane: 'cond' },
  enpassive: { view: 'english', tab: 'grammar', pane: 'passive' },
  engerund: { view: 'english', tab: 'grammar', pane: 'gerund' },
  enarticle: { view: 'english', tab: 'grammar', pane: 'article' },
  enrelative: { view: 'english', tab: 'grammar', pane: 'relative' },
  enquestion: { view: 'english', tab: 'grammar', pane: 'question' },
  enphrasal: { view: 'english', tab: 'grammar', pane: 'phrasal' },
  enquantity: { view: 'english', tab: 'grammar', pane: 'quantity' },
  enmodal: { view: 'english', tab: 'grammar', pane: 'modal' },
}

// Tên ngắn của từng phòng (hiện ở trang chủ), theo ngôn ngữ giao diện
export const LAB_NAME: Record<LabKey, { vi: string; en: string }> = {
  kohangul: { vi: 'Hangul', en: 'Hangul' }, konumbers: { vi: 'Số đếm', en: 'Numbers' },
  koconj: { vi: 'Chia đuôi', en: 'Verb endings' }, kopart: { vi: 'Trợ từ', en: 'Particles' }, koorder: { vi: 'Ghép câu', en: 'Word order' },
  zhpinyin: { vi: 'Pinyin', en: 'Pinyin' }, zhhanviet: { vi: 'Hán–Việt', en: 'Sino-Vietnamese' },
  zhnumbers: { vi: 'Số đếm', en: 'Numbers' }, zhorder: { vi: 'Ghép câu', en: 'Word order' },
  enirregular: { vi: 'Động từ bất quy tắc', en: 'Irregular verbs' }, ennumbers: { vi: 'Số đếm', en: 'Numbers' },
  enorder: { vi: 'Ghép câu', en: 'Word order' }, enprep: { vi: 'in / on / at', en: 'in / on / at' },
  entense: { vi: 'Chọn thì', en: 'Tenses' }, enconfuse: { vi: 'Từ dễ nhầm', en: 'Confusing words' },
  encompare: { vi: 'So sánh', en: 'Comparisons' }, encond: { vi: 'Câu điều kiện', en: 'Conditionals' },
  enpassive: { vi: 'Câu bị động', en: 'Passive voice' },
  engerund: { vi: 'V-ing hay to V', en: 'Gerunds & infinitives' },
  enarticle: { vi: 'Mạo từ', en: 'Articles' }, enrelative: { vi: 'Mệnh đề quan hệ', en: 'Relative clauses' },
  enquestion: { vi: 'Câu hỏi đuôi', en: 'Question tags' }, enphrasal: { vi: 'Cụm động từ', en: 'Phrasal verbs' },
  enquantity: { vi: 'Lượng từ', en: 'Quantifiers' }, enmodal: { vi: 'Động từ khuyết thiếu', en: 'Modal verbs' },
}

// Số mục từng làm sai còn chờ ôn ở mỗi phòng (đọc bản local). Phòng Động từ bất quy tắc ghi "chế độ:động từ"
// nên đếm theo động từ, không đếm trùng.
export function readLabWeak(lang: string): { key: LabKey; n: number }[] {
  return (LAB_KEYS[lang] ?? []).map((key) => {
    try {
      const raw = JSON.parse(localStorage.getItem(SOURCES[key].local) ?? 'null') as Raw | null
      const list = Array.isArray(raw?.weak) ? (raw!.weak as unknown[]).filter((w): w is string => typeof w === 'string') : []
      const items = key === 'enirregular' ? list.map((w) => w.slice(w.indexOf(':') + 1)) : list
      return { key, n: new Set(items).size }
    } catch {
      return { key, n: 0 }
    }
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n)
}

// Mục con của Phòng Pinyin theo phần cần luyện
export function labPane(lab: LabKey, mode?: string): string | null {
  if (lab === 'zhpinyin') return mode === 'type' ? 'type' : mode === 'mark' || mode === 'spell' ? 'rule' : null
  return LAB_TARGET[lab].pane
}

function readLocal(key: LabKey): Record<string, number> {
  try {
    const raw = localStorage.getItem(SOURCES[key].local)
    return raw ? SOURCES[key].score(JSON.parse(raw) as Raw) : {}
  } catch {
    return {}
  }
}

// Chỉ đọc bản local (dùng ở trang chủ, không gọi mạng)
export function readLabScores(lang: string): LabScores {
  return Object.fromEntries((LAB_KEYS[lang] ?? []).map((k) => [k, readLocal(k)]))
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
