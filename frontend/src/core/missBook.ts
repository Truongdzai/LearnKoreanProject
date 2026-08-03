import { useCallback } from 'react'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import type { SkillKey } from '@/core/skills'
import { todayISO } from '@/core/skills'

export interface MissItem {
  w: string
  ctx: string
  vi: string
  lang: string
  k: SkillKey
  n: number
  t: string
}

export interface MissBook {
  items: MissItem[]
}

const CAP = 150
const TEXT_MAX = 120

function cut(v: unknown): string {
  if (typeof v !== 'string') return ''
  const s = v.trim()
  return s.length > TEXT_MAX ? s.slice(0, TEXT_MAX - 1) + '…' : s
}

export function normalizeMiss(raw: unknown): MissBook {
  const items = (raw as Partial<MissBook> | null)?.items
  if (!Array.isArray(items)) return { items: [] }
  const out: MissItem[] = []
  for (const it of items) {
    const w = (it as MissItem)?.w
    if (typeof w !== 'string' || !w.trim()) continue
    const str = (v: unknown) => (typeof v === 'string' ? v : '')
    out.push({
      w: w.trim().slice(0, 48),
      ctx: cut((it as MissItem).ctx),
      vi: cut((it as MissItem).vi),
      lang: str((it as MissItem).lang) || 'en',
      k: (it as MissItem).k === 'speak' ? 'speak' : 'listen',
      n: typeof (it as MissItem).n === 'number' && (it as MissItem).n > 0 ? Math.round((it as MissItem).n) : 1,
      t: str((it as MissItem).t) || todayISO(),
    })
  }
  return { items: out.slice(-CAP) }
}

export interface MissInput {
  w: string
  ctx?: string
  vi?: string
  lang: string
  k: SkillKey
}

export function addMisses(book: MissBook, list: MissInput[]): MissBook {
  const items = book.items.slice()
  const day = todayISO()
  for (const inp of list) {
    const w = inp.w.trim().slice(0, 48)
    if (!w) continue
    const key = w.toLowerCase()
    const found = items.find((it) => it.lang === inp.lang && it.w.toLowerCase() === key)
    if (found) {
      found.n += 1
      found.t = day
      if (!found.ctx) found.ctx = cut(inp.ctx)
      if (!found.vi) found.vi = cut(inp.vi)
    } else {
      items.push({ w, ctx: cut(inp.ctx), vi: cut(inp.vi), lang: inp.lang, k: inp.k, n: 1, t: day })
    }
  }
  return { items: items.slice(-CAP) }
}

export function undoMisses(book: MissBook, list: MissInput[]): MissBook {
  const items = book.items.slice()
  for (const inp of list) {
    const key = inp.w.trim().toLowerCase()
    if (!key) continue
    const at = items.findIndex((it) => it.lang === inp.lang && it.w.toLowerCase() === key)
    if (at < 0) continue
    if (items[at].n > 1) items[at] = { ...items[at], n: items[at].n - 1 }
    else items.splice(at, 1)
  }
  return { items }
}

export function sortMisses(items: MissItem[]): MissItem[] {
  return items.slice().sort((a, b) => (b.n - a.n) || (a.t < b.t ? 1 : -1))
}

export function useMissBook() {
  const { state, mutate, loaded } = useServerPlan<MissBook>(
    'missbook', 'vyling.missbook', normalizeMiss, (s) => s.items.length === 0,
  )
  const add = useCallback((list: MissInput[]) => {
    if (!list.length) return
    mutate((prev) => addMisses(prev, list))
  }, [mutate])
  const undo = useCallback((list: MissInput[]) => {
    if (!list.length) return
    mutate((prev) => undoMisses(prev, list))
  }, [mutate])
  const drop = useCallback((word: string, lang: string) => {
    mutate((prev) => ({ items: prev.items.filter((it) => !(it.lang === lang && it.w === word)) }))
  }, [mutate])
  const clear = useCallback(() => mutate(() => ({ items: [] })), [mutate])
  return { book: state, add, undo, drop, clear, loaded }
}
