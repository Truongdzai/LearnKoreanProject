import { apiClient } from './client'
import type { Account, Session } from '@/models/account.model'

export const registerApi = (name: string, email: string, password: string, ref = '') =>
  apiClient.post<Session>('/api/auth/register', { name, email, password, ref })

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

export const sendVerifyCodeApi = () =>
  apiClient.post<{ ok: boolean }>('/api/auth/email/verify/send', {})

export const confirmVerifyApi = (code: string) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/auth/email/verify', { code })

export const forgotPasswordApi = (email: string) =>
  apiClient.post<{ ok: boolean }>('/api/auth/password/forgot', { email })

export const resetPasswordApi = (email: string, code: string, password: string) =>
  apiClient.post<{ ok: boolean }>('/api/auth/password/reset', { email, code, password })

export const changeCodeApi = () =>
  apiClient.post<{ ok: boolean }>('/api/auth/password/change/code', {})

export const changePasswordApi = (currentPassword: string, code: string, newPassword: string) =>
  apiClient.post<{ ok: boolean; token: string }>('/api/auth/password/change', {
    current_password: currentPassword,
    code,
    new_password: newPassword,
  })
