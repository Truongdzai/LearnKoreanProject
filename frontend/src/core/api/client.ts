import { env } from '@/config/env'

export const TOKEN_KEY = 'vyling.token'

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {  }
}

export class ApiError extends Error {
  status: number
  code: string
  constructor(message: string, status: number, code = 'UNKNOWN') {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const token = getToken()
  if (token) headers.set('Authorization', 'Bearer ' + token)

  let res: Response
  try {
    res = await fetch(env.apiBase + path, { ...init, headers })
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Hãy kiểm tra kết nối mạng.', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const { detail, code } = data as { detail?: string; code?: string }
    throw new ApiError(detail || 'Đã có lỗi xảy ra, hãy thử lại.', res.status, code || 'UNKNOWN')
  }
  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    }),
}
