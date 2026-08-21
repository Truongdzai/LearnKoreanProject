import { useSyncExternalStore } from 'react'
import { fetchQuotaApi, type QuotaStatus } from '@/core/api/quota.api'

const MIN_GAP_MS = 20000

let state: QuotaStatus | null = null
let inflight: Promise<void> | null = null
let lastAt = 0

const subs = new Set<() => void>()

function emit(): void {
  subs.forEach((fn) => fn())
}

export function refreshQuota(force = false): Promise<void> {
  const now = Date.now()
  if (inflight) return inflight
  if (!force && state && now - lastAt < MIN_GAP_MS) return Promise.resolve()
  lastAt = now
  inflight = fetchQuotaApi()
    .then((r) => {
      state = r
      emit()
    })
    .catch(() => {  })
    .finally(() => { inflight = null })
  return inflight
}

export function wakeBackend(): void {
  void refreshQuota()
}

export function clearQuota(): void {
  state = null
  lastAt = 0
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('vyling:quota-stale', () => { void refreshQuota(true) })
}

function subscribe(fn: () => void): () => void {
  subs.add(fn)
  return () => { subs.delete(fn) }
}

export function useQuota(): QuotaStatus | null {
  return useSyncExternalStore(subscribe, () => state, () => null)
}
