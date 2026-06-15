import { env } from '@/config/env'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(env.apiBase + path, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = (data as { detail?: string }).detail
    throw new Error(detail || 'Lỗi không rõ')
  }
  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
}
