import { formatDate } from '@/core/utils/format'
import type { AdminPlan, AdminUser, CatalogKind } from '@/core/api/admin.api'

export interface Field {
  k: string
  label: string
  type?: 'text' | 'number' | 'bool' | 'select'
  opts?: string[]
  required?: boolean
}

export const PAGE_SIZE = 20
export const CAT_PAGE_SIZE = 10

export const AUDIT_LABEL: Record<string, string> = {
  'admin.login': 'Quản trị đăng nhập',
  'catalog.save': 'Lưu nội dung',
  'catalog.delete': 'Xoá nội dung',
  'user.update': 'Sửa người dùng',
  'user.gift': 'Tặng xu',
  'user.plus': 'Đổi gói Plus',
  'user.delete': 'Xoá người dùng',
  'feedback.status': 'Đổi trạng thái phản hồi',
  'feedback.delete': 'Xoá phản hồi',
}

export const CAT_FILTERS: Record<CatalogKind, { k: string; label: string } | null> = {
  videos: { k: 'level', label: 'cấp độ' },
  quests: { k: 'period', label: 'chu kỳ' },
  shop: { k: 'category', label: 'loại' },
  plans: null,
}

export const FIELDS: Record<CatalogKind, Field[]> = {
  videos: [
    { k: 'id', label: 'Mã video (YouTube ID)', required: true },
    { k: 'title', label: 'Tiêu đề', required: true },
    { k: 'channel', label: 'Kênh' },
    { k: 'level', label: 'Cấp độ' },
    { k: 'dur', label: 'Thời lượng' },
    { k: 'topic', label: 'Chủ đề' },
    { k: 'lang', label: 'Ngôn ngữ', type: 'select', opts: ['ko', 'en', 'zh', 'ja'] },
    { k: 'tone', label: 'Màu (tone-a … tone-f)' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Hiển thị', type: 'bool' },
  ],
  quests: [
    { k: 'id', label: 'Mã', required: true },
    { k: 'title', label: 'Tên nhiệm vụ', required: true },
    { k: 'descr', label: 'Mô tả' },
    { k: 'period', label: 'Chu kỳ', type: 'select', opts: ['daily', 'weekly', 'monthly'] },
    { k: 'metric', label: 'Loại đo', type: 'select', opts: ['lesson', 'pronounce', 'review', 'video', 'word', 'streak', 'login'] },
    { k: 'reward', label: 'Thưởng (xu)', type: 'number' },
    { k: 'target', label: 'Mục tiêu', type: 'number' },
    { k: 'plus', label: 'Chỉ Plus', type: 'bool' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Bật', type: 'bool' },
  ],
  shop: [
    { k: 'id', label: 'Mã', required: true },
    { k: 'name', label: 'Tên vật phẩm', required: true },
    { k: 'descr', label: 'Mô tả' },
    { k: 'price', label: 'Giá (xu)', type: 'number' },
    { k: 'category', label: 'Loại', type: 'select', opts: ['seed', 'frame', 'background', 'avatar', 'badge', 'pet'] },
    { k: 'art', label: 'Art key', required: true },
    { k: 'plus', label: 'Chỉ Plus', type: 'bool' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Bật', type: 'bool' },
  ],
  plans: [
    { k: 'id', label: 'Mã gói', required: true },
    { k: 'name', label: 'Tên gói', required: true },
    { k: 'tagline', label: 'Khẩu hiệu' },
    { k: 'original', label: 'Giá gốc (gạch ngang)' },
    { k: 'price', label: 'Giá hiển thị' },
    { k: 'unit', label: 'Đơn vị (vd /tháng)' },
    { k: 'note', label: 'Ghi chú' },
    { k: 'cta', label: 'Nút (CTA)' },
    { k: 'days', label: 'Số ngày Plus (0 = vĩnh viễn)', type: 'number' },
    { k: 'featured', label: 'Nổi bật', type: 'bool' },
    { k: 'sort', label: 'Thứ tự', type: 'number' },
    { k: 'active', label: 'Hiển thị', type: 'bool' },
  ],
}

export const KIND_LABEL: Record<CatalogKind, string> = {
  videos: 'video',
  quests: 'nhiệm vụ',
  shop: 'vật phẩm',
  plans: 'gói đăng ký',
}

export function initialValues(fields: Field[], item?: Record<string, unknown>): Record<string, unknown> {
  const v: Record<string, unknown> = {}
  for (const f of fields) {
    let raw = item?.[f.k]
    if (raw === undefined && f.k === 'descr') raw = item?.['desc']
    if (f.type === 'bool') v[f.k] = raw === undefined ? true : !!raw
    else if (f.type === 'number') v[f.k] = raw ?? 0
    else if (f.type === 'select') v[f.k] = raw ?? f.opts?.[0] ?? ''
    else v[f.k] = raw ?? ''
  }
  return v
}

export function planLabel(p: AdminPlan): string {
  return `${p.name} · ${p.days > 0 ? p.days + ' ngày' : 'vĩnh viễn'}`
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDaysISO(base: string, n: number): string {
  const d = new Date((base || todayISO()) + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysLeft(until?: string | null): number | null {
  if (!until) return null
  const end = new Date(String(until).slice(0, 10) + 'T00:00:00')
  if (isNaN(end.getTime())) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - now.getTime()) / 86400000)
}

export function planStatus(u: AdminUser): string {
  if (u.isPlus) {
    if (!u.plusUntil) return 'Plus · vĩnh viễn'
    const d = daysLeft(u.plusUntil)
    if (d === null) return 'Plus'
    if (d <= 0) return `Plus · hết hạn hôm nay (${formatDate(u.plusUntil)})`
    return `Plus · còn ${d} ngày — đến ${formatDate(u.plusUntil)}`
  }
  if (u.plusUntil) return `Đã hết hạn ${formatDate(u.plusUntil)}`
  return 'Miễn phí'
}
