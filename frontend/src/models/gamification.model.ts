export type { Account as UserProfile } from '@/models/account.model'

export type QuestPeriod = 'daily' | 'weekly' | 'monthly'

export interface Quest {
  id: string
  title: string
  desc: string
  period: QuestPeriod
  reward: number
  water?: number
  target: number
  progress?: number
  claimed?: boolean
  plus?: boolean
  metric?: string
  active?: boolean
}

export type ShopCategory = 'seed' | 'frame' | 'avatar' | 'badge' | 'pet' | 'background'

export interface ShopItem {
  id: string
  name: string
  desc: string
  price: number
  category: ShopCategory
  art: string
  plus?: boolean
  active?: boolean
}

export interface PlantedSeed {
  id: string
  itemId: string
  art: string
  name: string
  growth: number
  plantedAt?: number
}

export interface LeaderEntry {
  rank: number
  id?: string
  name: string
  xp: number
  level: number
  streak: number
  isPlus: boolean
  frame: string | null
  bg: string | null
  avatar: string | null
  me?: boolean
}
