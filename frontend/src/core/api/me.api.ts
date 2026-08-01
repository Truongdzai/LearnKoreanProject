import { apiClient } from './client'
import type { Account } from '@/models/account.model'
import type { PlantedSeed, Quest } from '@/models/gamification.model'
import type { Video } from '@/models/video.model'
import type { LearningPath } from '@/models/path.model'

export interface MeState {
  user: Account
  owned: string[]
  garden: PlantedSeed[]
  paths: LearningPath[]
  savedVideos: Video[]
  todayXp: number
  goalBonusClaimed: boolean
}

export interface Activities {
  labels: string[]
  minutes: number[]
  words: number[]
  todayIdx: number
  totalMinutes: number
  totalWords: number
  srsTotal: number
}

export type EventType = 'lesson' | 'pronounce' | 'review' | 'video' | 'word' | 'login' | 'toeic' | 'grammar'

export interface ActivityDay {
  day: string
  minutes: number
  words: number
  lessons: number
  videos: number
  reviews: number
}

export const fetchState = () => apiClient.get<MeState>('/api/me/state')

export const fetchMyQuests = () =>
  apiClient.get<{ quests: Quest[]; bonusAvailable: boolean }>('/api/me/quests')

export const fetchActivities = () => apiClient.get<Activities>('/api/me/activities')

export const buyItemApi = (item_id: string) =>
  apiClient.post<{ ok: boolean; owned: string[]; user: Account }>('/api/me/buy', { item_id })

export const equipFrameApi = (frame: string | null) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/equip', { frame })

export const equipPetApi = (pet: string | null) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/equip-pet', { pet })

export const equipBgApi = (bg: string | null) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/equip-bg', { bg })

export const setAvatarApi = (avatar: string | null) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/avatar', { avatar })

export const upgradePlusApi = (plan_id = '') =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/plus', { plan_id })

export const plantSeedApi = (item_id: string, art: string, name: string) =>
  apiClient.post<{ ok: boolean; garden: PlantedSeed[] }>('/api/me/garden/plant', { item_id, art, name })

export const waterPlantApi = (plant_id: string) =>
  apiClient.post<{ ok: boolean; garden: PlantedSeed[] }>('/api/me/garden/water', { plant_id })

export const removePlantApi = (plant_id: string) =>
  apiClient.post<{ ok: boolean; garden: PlantedSeed[] }>('/api/me/garden/remove', { plant_id })

export const addPathApi = (title: string, data: Record<string, unknown>) =>
  apiClient.post<{ ok: boolean; paths: LearningPath[] }>('/api/me/paths', { title, data })

export const saveVideoApi = (v: Video) =>
  apiClient.post<{ ok: boolean; savedVideos: Video[] }>('/api/me/videos/save', v)

export const removeVideoApi = (id: string) =>
  apiClient.post<{ ok: boolean; savedVideos: Video[] }>('/api/me/videos/remove', { id })

export const claimQuestApi = (quest_id: string) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/quests/claim', { quest_id })

export const dailyBonusApi = () =>
  apiClient.post<{ ok: boolean; reward: number; user: Account }>('/api/me/daily-bonus')

export const ackGiftApi = () =>
  apiClient.post<{ ok: boolean }>('/api/me/gift/ack')

export const recordEventApi = (type: EventType, amount = 1, minutes = 0, words = 0) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/event', { type, amount, minutes, words })

export const setGoalApi = (goal: string | null) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/goal', { goal })

export const setEmailPrefsApi = (optout: boolean) =>
  apiClient.post<{ ok: boolean; user: Account }>('/api/me/email-prefs', { optout })

export const deleteAccountApi = (password = '', confirm = '') =>
  apiClient.post<{ ok: boolean }>('/api/me/delete', { password, confirm })

export const goalBonusApi = (goal: number) =>
  apiClient.post<{ ok: boolean; reward: number; user: Account }>('/api/me/goal-bonus', { goal })

export const fetchPlanApi = <T,>(planId: string) =>
  apiClient.get<{ ok: boolean; data: T | null; updatedAt: string | null }>(`/api/me/plans/${planId}`)

export const savePlanApi = (planId: string, data: unknown) =>
  apiClient.put<{ ok: boolean }>(`/api/me/plans/${planId}`, { data })

export const fetchActivityDaysApi = (since: string) =>
  apiClient.get<{ days: ActivityDay[] }>(`/api/me/activity-days?since=${encodeURIComponent(since)}`)
