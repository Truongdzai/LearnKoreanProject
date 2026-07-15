import { apiClient } from './client'

export type FeedbackKind = 'bug' | 'idea'

export const sendFeedbackApi = (kind: FeedbackKind, message: string, page = '') =>
  apiClient.post<{ ok: boolean }>('/api/feedback', { kind, message, page })
