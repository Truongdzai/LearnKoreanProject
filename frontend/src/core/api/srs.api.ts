import { apiClient } from './client'
import type { SrsCard, DueResponse, SrsStats, SrsRating } from '@/models/srs.model'

export interface AddCardPayload {
  front: string
  back?: string
  source?: string
}

export const addCard = (payload: AddCardPayload) =>
  apiClient.post<SrsCard>('/api/srs/add', payload)

export const fetchDue = () => apiClient.get<DueResponse>('/api/srs/due')

export const fetchAllCards = () => apiClient.get<{ cards: SrsCard[] }>('/api/srs/all')

export const reviewCard = (card_id: number, rating: SrsRating) =>
  apiClient.post<SrsCard>('/api/srs/review', { card_id, rating })

export const fetchStats = () => apiClient.get<SrsStats>('/api/srs/stats')
