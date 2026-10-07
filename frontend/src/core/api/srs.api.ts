import { apiClient, getToken } from './client'
import { track } from '@/core/monitor'
import { getLearnLang } from '@/core/lang'
import {
  addGuestCard, clearGuestDeck, guestCardsAsSrs, guestStats, readGuestDeck, removeGuestCard, reviewGuestCard,
} from '@/core/guestDeck'
import type { SrsCard, DueResponse, SrsStats, SrsRating, AllCardsResponse } from '@/models/srs.model'

export interface AddCardPayload {
  front: string
  back?: string
  source?: string
  lang?: string
}

const scope = (lang?: string) => (lang === 'all' ? 'all' : lang || getLearnLang())

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
    return Promise.resolve({ cards: guestCardsAsSrs(scope(lang), true), ...guestStats(scope(lang)) })
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

export const reviewCard = (card: SrsCard, rating: SrsRating): Promise<SrsCard> => {
  // thẻ khách (id âm) chỉ nằm trên máy — xếp lịch tại chỗ, máy chủ sẽ trả SIGNUP_REQUIRED
  if (card.id < 0) {
    const saved = reviewGuestCard(card.front, card.lang, rating)
    if (!saved) return Promise.reject(new Error('Không tìm thấy thẻ'))
    track('srs_review', { rating, lang: saved.lang, guest: true })
    return Promise.resolve(saved)
  }
  return apiClient.post<SrsCard>('/api/srs/review', { card_id: card.id, rating }).then((upd) => {
    track('srs_review', { rating, lang: upd.lang })
    return upd
  })
}

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
  if (!getToken()) return Promise.resolve(guestStats(scope(lang)))
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
