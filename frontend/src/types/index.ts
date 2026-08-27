import type { AppView } from '@/core/constants/enum'
import type { IconName } from '@/core/components/Icon'

export type NavGroup = 'learn' | 'track' | 'cards' | 'record'

export interface NavItem {
  id: AppView
  icon: IconName
  label: string
  langs?: string[]
  group: NavGroup
}

export type { AppView, LearnTab } from '@/core/constants/enum'
export type { Lesson, Segment } from '@/models/lesson.model'
export type { Video } from '@/models/video.model'
export type { HealthCheck } from '@/models/health.model'
