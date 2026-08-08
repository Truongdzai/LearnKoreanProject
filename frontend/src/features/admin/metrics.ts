import type { SeriesMetric } from '@/core/api/admin.api'

export const RANGES = [7, 30, 90] as const

export type RangeDays = (typeof RANGES)[number]

export const RANGE_LABEL: Record<number, string> = { 7: '7 ngày', 30: '30 ngày', 90: '90 ngày' }

export const RANGE_SHORT: Record<number, string> = { 7: '7d', 30: '30d', 90: '90d' }

export const METRIC_LABEL: Record<SeriesMetric, string> = {
  active: 'Người dùng hoạt động',
  signups: 'Đăng ký mới',
  lessons: 'Bài học hoàn thành',
  reviews: 'Lượt ôn thẻ',
  xp: 'XP kiếm được',
  minutes: 'Phút học',
}

export const METRIC_SHORT: Record<SeriesMetric, string> = {
  active: 'Hoạt động',
  signups: 'Đăng ký',
  lessons: 'Bài học',
  reviews: 'Ôn thẻ',
  xp: 'XP',
  minutes: 'Phút',
}

export const KPI_METRICS: SeriesMetric[] = ['active', 'signups', 'lessons', 'reviews']

export const ALL_METRICS: SeriesMetric[] = ['active', 'signups', 'lessons', 'reviews', 'xp', 'minutes']

export type DeltaDir = 'up' | 'down' | 'flat' | 'new'

export function delta(value: number, prev: number): { dir: DeltaDir; pct: number } {
  if (!prev) return value > 0 ? { dir: 'new', pct: 0 } : { dir: 'flat', pct: 0 }
  const pct = ((value - prev) / prev) * 100
  if (Math.abs(pct) < 0.05) return { dir: 'flat', pct: 0 }
  return { dir: pct > 0 ? 'up' : 'down', pct }
}

export function fmtInt(n: number): string {
  return (n || 0).toLocaleString('vi')
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'tr'
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
  return String(n)
}

export function fmtDay(iso: string): string {
  const p = String(iso).split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}` : iso
}

export function fmtDayLong(iso: string): string {
  const p = String(iso).split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso
}
