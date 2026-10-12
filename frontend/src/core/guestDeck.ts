import type { SrsCard, SrsRating, SrsStats } from '@/models/srs.model'

const KEY = 'vyling.guestDeck'
const MAX = 60
const MIN_EASE = 1.3

export interface GuestCard {
  front: string
  back: string
  source: string
  lang: string
  at: number
  reps?: number
  ivl?: number
  ease?: number
  due?: string
  last_reviewed?: string
  // số lượt ôn trong ngày last_reviewed — để đếm "đã ôn hôm nay" như srs_reviews
  revN?: number
}

const subs = new Set<() => void>()

function emit(): void {
  subs.forEach((fn) => fn())
}

// ngày theo giờ máy, giống date('now','localtime') ở backend
function day(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// round() của Python làm tròn nửa về số chẵn (2.5 → 2), Math.round thì ra 3
function pyRound(x: number): number {
  const r = Math.round(x)
  return r - x === 0.5 && r % 2 !== 0 ? r - 1 : r
}

// Bản sao của schedule() trong backend/services/srs.py — sửa bên này thì sửa cả bên kia
export function schedule(reps: number, ivl: number, ease: number, rating: SrsRating): [number, number, number] {
  if (rating === 1) return [0, 0, Math.max(MIN_EASE, ease - 0.2)]
  if (rating === 2) return [reps + 1, Math.max(1, pyRound((ivl || 1) * 1.2)), Math.max(MIN_EASE, ease - 0.15)]
  if (rating === 4) return [reps + 1, reps === 0 ? 4 : Math.max(1, pyRound(ivl * ease * 1.3)), ease + 0.15]
  const nivl = reps === 0 ? 1 : reps === 1 ? 6 : Math.max(1, pyRound(ivl * ease))
  return [reps + 1, nivl, ease]
}

export function readGuestDeck(): GuestCard[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GuestCard[]) : []
  } catch {
    return []
  }
}

function write(list: GuestCard[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
  }
  emit()
}

export function addGuestCard(card: Omit<GuestCard, 'at'>): GuestCard {
  const list = readGuestDeck()
  const found = list.find((c) => c.front === card.front && c.lang === card.lang)
  if (found) return found
  const next: GuestCard = { ...card, at: Date.now() }
  write([...list, next].slice(-MAX))
  return next
}

export function removeGuestCard(front: string, lang: string): void {
  write(readGuestDeck().filter((c) => !(c.front === front && c.lang === lang)))
}

export function clearGuestDeck(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
  }
  emit()
}

function toSrs(c: GuestCard, i: number, today: string): SrsCard {
  return {
    id: -(i + 1),
    front: c.front,
    back: c.back,
    source: c.source,
    lang: c.lang,
    reps: c.reps ?? 0,
    ivl: c.ivl ?? 0,
    ease: c.ease ?? 2.5,
    due: c.due ?? today,
    last_reviewed: c.last_reviewed,
  }
}

const inLang = (lang?: string) => (c: { lang: string }) => !lang || lang === 'all' || c.lang === lang

export function guestCardsAsSrs(lang?: string, dueOnly = false): SrsCard[] {
  const today = day()
  const cards = readGuestDeck().map((c, i) => toSrs(c, i, today)).filter(inLang(lang))
  if (!dueOnly) return cards
  return cards.filter((s) => s.due <= today).sort((a, b) => a.due.localeCompare(b.due))
}

export function guestStats(lang?: string): SrsStats {
  const today = day()
  const list = readGuestDeck().filter(inLang(lang))
  return {
    total: list.length,
    due: list.filter((c) => (c.due ?? today) <= today).length,
    new: list.filter((c) => !c.reps).length,
    learned: list.filter((c) => (c.reps ?? 0) >= 2).length,
    reviewed_today: list.reduce((n, c) => n + (c.last_reviewed === today ? c.revN ?? 0 : 0), 0),
  }
}

export function reviewGuestCard(front: string, lang: string, rating: SrsRating): SrsCard | null {
  const list = readGuestDeck()
  const i = list.findIndex((c) => c.front === front && c.lang === lang)
  if (i < 0) return null
  const c = list[i]
  const today = day()
  const [reps, ivl, ease] = schedule(c.reps ?? 0, c.ivl ?? 0, c.ease ?? 2.5, rating)
  list[i] = {
    ...c,
    reps,
    ivl,
    ease: Math.round(ease * 100) / 100,
    due: day(ivl),
    last_reviewed: today,
    revN: (c.last_reviewed === today ? c.revN ?? 0 : 0) + 1,
  }
  write(list)
  return toSrs(list[i], i, today)
}

export function subscribeGuestDeck(fn: () => void): () => void {
  subs.add(fn)
  return () => { subs.delete(fn) }
}
