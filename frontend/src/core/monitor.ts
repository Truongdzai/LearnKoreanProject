import { env } from '@/config/env'

/**
 * Giám sát lỗi & sự kiện nền — nhẹ, không phụ thuộc thư viện ngoài.
 * Sẵn sàng nối Sentry (hoặc bất kỳ collector nào): đặt VITE_MONITOR_ENDPOINT thành
 * URL nhận JSON qua POST. Khi chưa đặt: bỏ qua ở production, in ra ở dev — nên
 * có thể phát hành ngay mà chưa cần tài khoản/DSN.
 */

type Payload = Record<string, unknown>

const ENDPOINT = env.monitorEndpoint
const DEV = import.meta.env.DEV

function send(kind: 'error' | 'event', data: Payload): void {
  try {
    const body = JSON.stringify({ kind, ...data, at: Date.now(), path: location.pathname })
    if (ENDPOINT && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(ENDPOINT, body)
    } else if (ENDPOINT) {
      void fetch(ENDPOINT, {
        method: 'POST', body, keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      })
    } else if (DEV) {
      console.warn('[monitor]', kind, data)
    }
  } catch {
    /* giám sát KHÔNG bao giờ được làm hỏng app */
  }
}

export function reportError(err: unknown, context?: Payload): void {
  const e = err as Error | undefined
  send('error', { message: e?.message || String(err), stack: e?.stack, ...context })
}

export function track(event: string, props?: Payload): void {
  send('event', { event, ...props })
}

let started = false
export function initMonitor(): void {
  if (started || typeof window === 'undefined') return
  started = true
  window.addEventListener('error', (e) => reportError(e.error ?? e.message, { type: 'window.error' }))
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, { type: 'unhandledrejection' }))
}
