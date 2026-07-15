import { apiClient } from './client'
import type { Account } from '@/models/account.model'
import type { Video } from '@/models/video.model'
import type { Quest, ShopItem } from '@/models/gamification.model'

export interface AdminStats {
  users: number
  plus: number
  activeToday: number
  newWeek: number
  videos: number
  quests: number
  shop: number
  plans: number
  srsCards: number
  dictEntries: number
  feedbackNew: number
}

export interface AdminUser extends Account {
  status: string
  createdAt: string
  lastActive: string | null
}

export interface AdminPlan {
  id: string
  name: string
  tagline: string
  original: string
  price: string
  unit: string
  note: string
  cta: string
  days: number
  featured: boolean
  active: boolean
}

export type CatalogKind = 'videos' | 'quests' | 'shop' | 'plans'

export interface AdminCatalog {
  videos: (Video & { active: boolean })[]
  quests: (Quest & { active: boolean; metric?: string })[]
  shop: (ShopItem & { active: boolean })[]
  plans: AdminPlan[]
}

export interface UserFilters {
  q?: string
  role?: string
  status?: string
  plus?: string
  sort?: string
  page?: number
  pageSize?: number
}

export interface AdminUsersPage {
  users: AdminUser[]
  total: number
  page: number
  pageSize: number
}

export const fetchAdminStats = () => apiClient.get<AdminStats>('/api/admin/stats')

export const fetchAdminCatalog = () => apiClient.get<AdminCatalog>('/api/admin/catalog')

export const saveCatalogItem = (kind: CatalogKind, data: Record<string, unknown>) =>
  apiClient.post<{ ok: boolean; id: string }>('/api/admin/catalog/save', { kind, data })

export const deleteCatalogItem = (kind: CatalogKind, id: string) =>
  apiClient.post<{ ok: boolean }>('/api/admin/catalog/delete', { kind, id })

export const fetchAdminUsers = (f: UserFilters = {}) => {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.role) p.set('role', f.role)
  if (f.status) p.set('status', f.status)
  if (f.plus) p.set('plus', f.plus)
  if (f.sort) p.set('sort', f.sort)
  p.set('page', String(f.page ?? 1))
  p.set('page_size', String(f.pageSize ?? 20))
  return apiClient.get<AdminUsersPage>('/api/admin/users?' + p.toString())
}

export const updateAdminUser = (payload: Partial<AdminUser> & { id: string }) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/admin/users/update', payload)

export const giftCoins = (id: string, coins: number, message = '') =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/admin/users/gift', { id, coins, message })

export interface PlusUpdate {
  action: 'free' | 'lifetime' | 'until' | 'plan'
  until?: string
  plan_id?: string
}

export const setUserPlus = (id: string, payload: PlusUpdate) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/admin/users/plus', { id, ...payload })

export const deleteAdminUser = (id: string) =>
  apiClient.post<{ ok: boolean }>('/api/admin/users/delete', { id })

export interface AdminFeedback {
  id: number
  userId: string | null
  name: string
  kind: string
  message: string
  page: string
  status: string
  createdAt: string
}

export const fetchAdminFeedback = (status = '', page = 1, pageSize = 20) =>
  apiClient.get<{ total: number; items: AdminFeedback[] }>(
    `/api/admin/feedback?status=${status}&page=${page}&page_size=${pageSize}`)

export const setFeedbackStatus = (id: number, status: string) =>
  apiClient.post<{ ok: boolean }>('/api/admin/feedback/status', { id, status })

export const deleteFeedback = (id: number) =>
  apiClient.post<{ ok: boolean }>('/api/admin/feedback/delete', { id })
