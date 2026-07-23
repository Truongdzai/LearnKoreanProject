import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPlanApi, savePlanApi } from '@/core/api/me.api'
import { useAuth } from '@/store/auth.store'

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
  const pushTimer = useRef<number | undefined>(undefined)

  const writeLocal = useCallback((next: T) => {
    try { localStorage.setItem(localKey, JSON.stringify(next)) } catch {  }
  }, [localKey])

  useEffect(() => {
    if (!isAuthed) { setLoaded(true); return }
    let alive = true
    fetchPlanApi<unknown>(planId)
      .then((r) => {
        if (!alive) return
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
      if (isAuthed) {
        window.clearTimeout(pushTimer.current)
        pushTimer.current = window.setTimeout(() => {
          savePlanApi(planId, next).catch(() => {  })
        }, 1200)
      }
      return next
    })
  }, [isAuthed, planId, writeLocal])

  return { state, mutate, loaded }
}
