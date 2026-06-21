import { apiClient } from './client'
import type { Account, Session } from '@/models/account.model'

export const registerApi = (name: string, email: string, password: string) =>
  apiClient.post<Session>('/api/auth/register', { name, email, password })

export const loginApi = (email: string, password: string) =>
  apiClient.post<Session>('/api/auth/login', { email, password })

export interface PendingGift {
  coins: number
  message: string
}

export const meApi = () =>
  apiClient.get<{ user: Account; bonusAvailable: boolean; pendingGift: PendingGift | null }>('/api/auth/me')

export const providersApi = () =>
  apiClient.get<{ google: boolean; facebook: boolean }>('/api/auth/providers')
