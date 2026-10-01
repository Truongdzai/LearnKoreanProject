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
  // Bản chưa kịp đẩy lên server. Phải đẩy nốt khi rời trang: nếu không, lần mở
  // sau server trả bản cũ và ghi đè lên kết quả vừa học trong localStorage.
  const pending = useRef<{ data: T } | null>(null)

  const flush = useCallback((leaving = false) => {
    window.clearTimeout(pushTimer.current)
    const p = pending.current
    if (!p) return
    pending.current = null
    savePlanApi(planId, p.data, leaving).catch(() => {  })
  }, [planId])

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(true) }
    const onPageHide = () => flush(true)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
      flush()
    }
  }, [flush])

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
        pending.current = { data: next }
        window.clearTimeout(pushTimer.current)
        pushTimer.current = window.setTimeout(() => flush(), 1200)
      }
      return next
    })
  }, [isAuthed, writeLocal, flush])

  return { state, mutate, loaded }
}
