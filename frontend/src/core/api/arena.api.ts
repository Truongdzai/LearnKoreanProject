import { apiClient } from './client'
import { track } from '@/core/monitor'

export interface TierInfo {
  id: number
  name: string
  emoji: string
  color: string
}

export interface LeagueEntry {
  rank: number
  id: string
  name: string
  avatar: string | null
  frame: string | null
  streak: number
  isPlus: boolean
  xp: number
  me: boolean
  zone: 'up' | 'down' | ''
}

export interface LeagueResult {
  week: string
  rank: number
  of: number
  xp: number
  result: 'up' | 'stay' | 'down'
  reward: number
  fromTier: TierInfo
  toTier: TierInfo
}

export interface LeagueState {
  week: string
  endsAt: string
  tier: TierInfo
  tiers: TierInfo[]
  promote: number
  relegate: number
  rewards: number[]
  entries: LeagueEntry[]
  lastResult: LeagueResult | null
}

export interface DuelPerson {
  id: string
  name: string
  avatar: string | null
  frame: string | null
  streak: number
}

export interface DuelView {
  id: string
  status: 'open' | 'active' | 'done'
  startDay: string | null
  endDay: string | null
  daysLeft: number
  myXp: number
  theirXp: number
  opponent: DuelPerson | null
  iWin: boolean
  draw: boolean
  reward: number
}

export interface DuelState {
  active: DuelView | null
  inviteCode: string | null
  history: DuelView[]
  days: number
  reward: number
}

export const fetchLeague = () => apiClient.get<LeagueState>('/api/arena/league')

export const fetchDuel = () => apiClient.get<DuelState>('/api/arena/duel')

export const createDuel = () =>
  apiClient.post<{ code: string }>('/api/arena/duel/create').then((r) => {
    track('duel_create')
    return r
  })

export const cancelDuel = () => apiClient.post<{ ok: boolean }>('/api/arena/duel/cancel')

export const joinDuel = (code: string) =>
  apiClient.post<DuelState>('/api/arena/duel/join', { code }).then((r) => {
    track('duel_join')
    return r
  })
