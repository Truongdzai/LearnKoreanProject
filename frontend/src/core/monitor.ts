import { env } from '@/config/env'
import { sendEvent } from '@/core/analytics'


type Payload = Record<string, unknown>

const ENDPOINT = env.monitorEndpoint || '/api/events'
const DEV = import.meta.env.DEV
const FLUSH_AT = 15
const FLUSH_MS = 30000

let buffer: Payload[] = []
let timer: number | undefined

function post(items: Payload[], beacon: boolean): void {
  const body = JSON.stringify({ events: items })
  try {
    if (beacon && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch(ENDPOINT, {
      method: 'POST', body, keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
  }
}

export function flushEvents(beacon = false): void {
  if (timer) { window.clearTimeout(timer); timer = undefined }
  if (!buffer.length) return
  const items = buffer
  buffer = []
  post(items, beacon)
}

function queue(kind: 'error' | 'event', data: Payload): void {
  const item = { kind, ...data, at: Date.now(), path: location.pathname }
  if (DEV && !env.monitorEndpoint) console.warn('[monitor]', kind, data)
  buffer.push(item)
  if (kind === 'error' || buffer.length >= FLUSH_AT) { flushEvents(); return }
  if (!timer) timer = window.setTimeout(() => flushEvents(), FLUSH_MS)
}

export function reportError(err: unknown, context?: Payload): void {
  const e = err as Error | undefined
  queue('error', { message: e?.message || String(err), stack: e?.stack, ...context })
}

export function track(event: string, props?: Payload): void {
  queue('event', { event, ...props })
  sendEvent(event, props)
}

let started = false
export function initMonitor(): void {
  if (started || typeof window === 'undefined') return
  started = true
  window.addEventListener('error', (e) => reportError(e.error ?? e.message, { type: 'window.error' }))
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, { type: 'unhandledrejection' }))
  window.addEventListener('pagehide', () => flushEvents(true))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEvents(true)
  })
}
