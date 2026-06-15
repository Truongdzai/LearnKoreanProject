import { apiClient } from './client'
import type { HealthCheck } from '@/models/health.model'

export const fetchHealth = () => apiClient.get<HealthCheck[]>('/api/health')
