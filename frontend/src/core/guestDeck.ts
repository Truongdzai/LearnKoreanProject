import type { SrsCard } from '@/models/srs.model'

const KEY = 'vyling.guestDeck'
const MAX = 60

export interface GuestCard {
  front: string
  back: string
  source: string
  lang: string
  at: number
}

const subs = new Set<() => void>()

function emit(): void {
  subs.forEach((fn) => fn())
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

export function clearGuestDeck(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
  }
  emit()
}

export function guestCardsAsSrs(lang?: string): SrsCard[] {
  const today = new Date().toISOString().slice(0, 10)
  return readGuestDeck()
    .filter((c) => !lang || lang === 'all' || c.lang === lang)
    .map((c, i) => ({
      id: -(i + 1),
      front: c.front,
      back: c.back,
      source: c.source,
      lang: c.lang,
      reps: 0,
      ivl: 0,
      ease: 2.5,
      due: today,
    }))
}

export function subscribeGuestDeck(fn: () => void): () => void {
  subs.add(fn)
  return () => { subs.delete(fn) }
}
