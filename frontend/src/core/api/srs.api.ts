import { apiClient, getToken } from './client'
import { track } from '@/core/monitor'
import { getLearnLang } from '@/core/lang'
import { addGuestCard, clearGuestDeck, guestCardsAsSrs, readGuestDeck, removeGuestCard } from '@/core/guestDeck'
import type { SrsCard, DueResponse, SrsStats, SrsRating, AllCardsResponse } from '@/models/srs.model'

export interface AddCardPayload {
  front: string
  back?: string
  source?: string
  lang?: string
}

const scope = (lang?: string) => (lang === 'all' ? 'all' : lang || getLearnLang())

function guestStats(lang?: string): SrsStats {
  const cards = guestCardsAsSrs(scope(lang))
  return { total: cards.length, due: cards.length, new: cards.length, learned: 0, reviewed_today: 0 }
}

export const addCard = (payload: AddCardPayload): Promise<SrsCard> => {
  const lang = payload.lang || getLearnLang()
  if (!getToken()) {
    const saved = addGuestCard({
      front: payload.front,
      back: payload.back ?? '',
      source: payload.source ?? '',
      lang,
    })
    track('srs_add', { source: payload.source || 'khac', lang, guest: true })
    return Promise.resolve({
      id: -1, front: saved.front, back: saved.back, source: saved.source, lang,
      reps: 0, ivl: 0, ease: 2.5, due: new Date().toISOString().slice(0, 10),
    })
  }
  return apiClient.post<SrsCard>('/api/srs/add', { ...payload, lang }).then((card) => {
    track('srs_add', { source: payload.source || 'khac', lang: card.lang })
    return card
  })
}

export const fetchDue = (lang?: string): Promise<DueResponse> => {
  if (!getToken()) {
    return Promise.resolve({ cards: guestCardsAsSrs(scope(lang)), ...guestStats(lang) })
  }
  return apiClient.get<DueResponse>(`/api/srs/due?lang=${encodeURIComponent(scope(lang))}`)
}

export const fetchAllCards = (lang?: string): Promise<AllCardsResponse> => {
  if (!getToken()) {
    const byLang: Record<string, number> = {}
    readGuestDeck().forEach((c) => { byLang[c.lang] = (byLang[c.lang] ?? 0) + 1 })
    return Promise.resolve({ cards: guestCardsAsSrs(scope(lang)), byLang })
  }
  return apiClient.get<AllCardsResponse>(`/api/srs/all?lang=${encodeURIComponent(scope(lang))}`)
}

export const reviewCard = (card_id: number, rating: SrsRating) =>
  apiClient.post<SrsCard>('/api/srs/review', { card_id, rating }).then((card) => {
    track('srs_review', { rating, lang: card.lang })
    return card
  })

export const deleteCard = (card: SrsCard): Promise<{ ok: boolean; deleted: number }> => {
  if (!getToken() || card.id < 0) {
    removeGuestCard(card.front, card.lang)
    return Promise.resolve({ ok: true, deleted: 1 })
  }
  return apiClient.del<{ ok: boolean; deleted: number }>(`/api/srs/card/${card.id}`)
}

export const updateCard = (id: number, patch: { front: string; back: string; source: string }): Promise<SrsCard> =>
  apiClient.put<SrsCard>(`/api/srs/card/${id}`, patch)

export const deleteDeck = (source: string, lang?: string): Promise<{ ok: boolean; deleted: number }> =>
  apiClient.post<{ ok: boolean; deleted: number }>('/api/srs/deck/delete', { source, lang: scope(lang) })

export const fetchStats = (lang?: string): Promise<SrsStats> => {
  if (!getToken()) return Promise.resolve(guestStats(lang))
  return apiClient.get<SrsStats>(`/api/srs/stats?lang=${encodeURIComponent(scope(lang))}`)
}

export async function pushGuestDeck(): Promise<number> {
  const deck = readGuestDeck()
  if (!deck.length || !getToken()) return 0
  let saved = 0
  for (const c of deck) {
    try {
      await apiClient.post<SrsCard>('/api/srs/add', {
        front: c.front, back: c.back, source: c.source, lang: c.lang,
      })
      saved++
    } catch {
    }
  }
  clearGuestDeck()
  if (saved) track('guest_deck_synced', { count: saved })
  return saved
}
