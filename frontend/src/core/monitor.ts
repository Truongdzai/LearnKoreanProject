import { env } from '@/config/env'
import { sendEvent } from '@/core/analytics'


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
  }
}

export function reportError(err: unknown, context?: Payload): void {
  const e = err as Error | undefined
  send('error', { message: e?.message || String(err), stack: e?.stack, ...context })
}

export function track(event: string, props?: Payload): void {
  send('event', { event, ...props })
  sendEvent(event, props)
}

let started = false
export function initMonitor(): void {
  if (started || typeof window === 'undefined') return
  started = true
  window.addEventListener('error', (e) => reportError(e.error ?? e.message, { type: 'window.error' }))
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, { type: 'unhandledrejection' }))
}
