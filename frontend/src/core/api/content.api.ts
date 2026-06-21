import { apiClient } from './client'
import type { Video } from '@/models/video.model'
import type { Quest, ShopItem, LeaderEntry } from '@/models/gamification.model'

export const fetchVideos = () =>
  apiClient.get<{ videos: Video[] }>('/api/content/videos')

export const fetchShop = () =>
  apiClient.get<{ shop: ShopItem[] }>('/api/content/shop')

export interface PlanCard {
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
}

export const fetchPlans = () =>
  apiClient.get<{ plans: PlanCard[]; perks: string[] }>('/api/content/plans')

export const fetchQuestCatalog = () =>
  apiClient.get<{ quests: Quest[] }>('/api/content/quests')

export const fetchLeaderboard = () =>
  apiClient.get<{ entries: LeaderEntry[] }>('/api/content/leaderboard')
