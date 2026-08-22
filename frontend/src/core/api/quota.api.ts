import { apiClient } from './client'

export interface QuotaStatus {
  used: number
  limit: number
  left: number
  authed: boolean
}

export const fetchQuotaApi = () => apiClient.get<QuotaStatus>('/api/quota')
