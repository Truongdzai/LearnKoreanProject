import { env } from '@/config/env'
import { track } from '@/core/monitor'
import { getToken, setToken } from '@/core/api/token'

export { TOKEN_KEY, getToken, setToken } from '@/core/api/token'

export const AUTH_EXPIRED_EVENT = 'vyling:auth-expired'

const DEFAULT_TIMEOUT_MS = 20000
const SLOW_TIMEOUT_MS = 180000
const SLOW_PATHS = ['/api/transcript', '/api/pronounce', '/api/speaking', '/api/tutor', '/api/lingo', '/api/diarize']

function timeoutFor(path: string): number {
  return SLOW_PATHS.some((p) => path.startsWith(p)) ? SLOW_TIMEOUT_MS : DEFAULT_TIMEOUT_MS
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

const EXPIRED_CODES = new Set(['AUTH_EXPIRED', 'AUTH_REQUIRED', 'ACCOUNT_LOCKED'])

function onUnauthorized(code: string, message: string): void {
  if (!getToken()) return
  setToken(null)
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { code, message } }))
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const token = getToken()
  if (token) headers.set('Authorization', 'Bearer ' + token)

  const controller = new AbortController()
  const limit = timeoutFor(path)
  const timer = window.setTimeout(() => controller.abort(), limit)

  let res: Response
  try {
    res = await fetch(env.apiBase + path, { ...init, headers, signal: controller.signal })
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') {
      throw new ApiError(
        `Máy chủ phản hồi quá lâu (hơn ${Math.round(limit / 1000)} giây). Hãy thử lại.`,
        0,
        'TIMEOUT',
      )
    }
    throw new ApiError('Không kết nối được máy chủ. Hãy kiểm tra kết nối mạng.', 0, 'OFFLINE')
  } finally {
    window.clearTimeout(timer)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const { detail, code } = data as { detail?: string; code?: string }
    const errCode = code || 'UNKNOWN'
    const message = detail || 'Đã có lỗi xảy ra, hãy thử lại.'
    if (res.status === 429) {
      track('quota_blocked', { path, authed: !!token })
      window.dispatchEvent(new CustomEvent('vyling:quota-stale'))
    }
    if ((res.status === 401 || res.status === 403) && EXPIRED_CODES.has(errCode)) {
      onUnauthorized(errCode, message)
    }
    throw new ApiError(message, res.status, errCode)
  }
  return data as T
}

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body ?? {}),
})

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, jsonInit('POST', body)),
  put: <T>(path: string, body?: unknown) => request<T>(path, jsonInit('PUT', body)),
}
