import { useCallback, useEffect, useState } from 'react'
import { fetchPlanApi, savePlanApi } from '@/core/api/me.api'
import { getToken } from '@/core/api/client'
import { env } from '@/config/env'
import { useAuth } from '@/store/auth.store'

// Cờ "dirty" theo plan: bật từ lúc đổi tới khi server xác nhận đã lưu (chờ debounce, lưu lỗi, đóng tab giữa chừng).
// Còn cờ thì bản local mới hơn: đẩy lên thay vì để bản server cũ đè. Tiền tố "vyling." để bị xoá khi đổi tài khoản.
const dirtyKey = (planId: string) => `vyling.dirty.${planId}`

function isDirty(planId: string): boolean {
  try { return localStorage.getItem(dirtyKey(planId)) != null } catch { return false }
}

function setDirty(planId: string, on: boolean): void {
  try {
    if (on) localStorage.setItem(dirtyKey(planId), '1')
    else localStorage.removeItem(dirtyKey(planId))
  } catch {  }
}

const revs = new Map<string, number>()
const queued = new Map<string, { timer: number; data: unknown }>()

// keepalive cho phép request sống sót khi trang đóng, nhưng giới hạn ~64KB thân request
const KEEPALIVE_MAX = 60000

function putKeepalive(planId: string, data: unknown): Promise<unknown> {
  const body = JSON.stringify({ data })
  if (new TextEncoder().encode(body).length > KEEPALIVE_MAX) return savePlanApi(planId, data)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token
  return fetch(`${env.apiBase}/api/me/plans/${planId}`, { method: 'PUT', keepalive: true, headers, body })
    .then((r) => { if (!r.ok) throw new Error(String(r.status)) })
}

function push(planId: string, data: unknown, keepalive = false): void {
  const rev = revs.get(planId) ?? 0
  const req = keepalive ? putKeepalive(planId, data) : savePlanApi(planId, data)
  // Chỉ hạ cờ khi không có thay đổi nào mới hơn bản vừa lưu; lỗi thì giữ cờ để lần sau đẩy lại
  req.then(() => { if ((revs.get(planId) ?? 0) === rev) setDirty(planId, false) }, () => {  })
}

// queued phòng khi localStorage không ghi được cờ
export const hasUnsaved = (planId: string) => isDirty(planId) || queued.has(planId)

function flushAll(): void {
  queued.forEach(({ timer, data }, planId) => {
    window.clearTimeout(timer)
    push(planId, data, true)
  })
  queued.clear()
}

let listening = false

function listenFlush(): void {
  if (listening) return
  listening = true
  window.addEventListener('pagehide', flushAll)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushAll() })
}

function schedule(planId: string, data: unknown): void {
  revs.set(planId, (revs.get(planId) ?? 0) + 1)
  setDirty(planId, true)
  const prev = queued.get(planId)
  if (prev) window.clearTimeout(prev.timer)
  const timer = window.setTimeout(() => {
    queued.delete(planId)
    push(planId, data)
  }, 1200)
  queued.set(planId, { timer, data })
  listenFlush()
}

export function useServerPlan<T>(
  planId: string,
  localKey: string,
  normalize: (raw: unknown) => T,
  isEmpty: (state: T) => boolean,
): { state: T; mutate: (fn: (prev: T) => T) => void; loaded: boolean } {
  const { isAuthed } = useAuth()

  const readLocal = useCallback((): T => {
    try {
      const raw = localStorage.getItem(localKey)
      return normalize(raw ? JSON.parse(raw) : null)
    } catch {
      return normalize(null)
    }
  }, [localKey])

  const [state, setState] = useState<T>(readLocal)
  const [loaded, setLoaded] = useState(!isAuthed)

  const writeLocal = useCallback((next: T) => {
    try { localStorage.setItem(localKey, JSON.stringify(next)) } catch {  }
  }, [localKey])

  useEffect(() => {
    if (!isAuthed) { setLoaded(true); return }
    if (hasUnsaved(planId)) {
      const local = readLocal()
      setState(local)
      if (!queued.has(planId)) push(planId, local)
      setLoaded(true)
      return
    }
    let alive = true
    fetchPlanApi<unknown>(planId)
      .then((r) => {
        if (!alive) return
        // mutate xảy ra trong lúc chờ fetch: bản local mới hơn, lượt lưu đang chờ sẽ đẩy lên
        if (hasUnsaved(planId)) return
        if (r.data != null) {
          const next = normalize(r.data)
          setState(next)
          writeLocal(next)
        } else {
          const local = readLocal()
          if (!isEmpty(local)) savePlanApi(planId, local).catch(() => {  })
        }
      })
      .catch(() => {  })
      .finally(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [isAuthed, planId])

  const mutate = useCallback((fn: (prev: T) => T) => {
    setState((prev) => {
      const next = fn(prev)
      writeLocal(next)
      if (isAuthed) schedule(planId, next)
      return next
    })
  }, [isAuthed, planId, writeLocal])

  return { state, mutate, loaded }
}
