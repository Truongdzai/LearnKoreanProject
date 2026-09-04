import { useCallback, useEffect, useState } from 'react'

function readRaw(key: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(key)
  } catch {
    return null
  }
}

function writeRaw(key: string, value: string | null): void {
  try {
    const url = new URL(window.location.href)
    if (value === null) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  } catch {
  }
}

export function clearUrlParams(keys: string[]): void {
  try {
    const url = new URL(window.location.href)
    let touched = false
    for (const k of keys) {
      if (url.searchParams.has(k)) { url.searchParams.delete(k); touched = true }
    }
    if (touched) {
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  } catch {
  }
}

export function useUrlParam(
  key: string,
  initial: string | null,
  isValid?: (v: string) => boolean,
): [string | null, (v: string | null) => void] {
  const pick = useCallback(() => {
    if (initial !== null) return initial
    const raw = readRaw(key)
    if (raw === null) return null
    return !isValid || isValid(raw) ? raw : null
  }, [key])

  const [value, setValue] = useState<string | null>(pick)

  useEffect(() => {
    if (value !== null && readRaw(key) !== value) writeRaw(key, value)
  }, [])

  useEffect(() => {
    const onPop = () => {
      const raw = readRaw(key)
      setValue(raw === null || (isValid && !isValid(raw)) ? null : raw)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [key])

  const set = useCallback((v: string | null) => {
    setValue(v)
    writeRaw(key, v)
  }, [key])

  return [value, set]
}

export function useTabParam<T extends string>(
  ids: readonly T[],
  fallback: T,
  key = 'tab',
): [T, (v: T) => void] {
  const [tab, setTabState] = useState<T>(() => {
    const raw = readRaw(key)
    return raw && (ids as readonly string[]).includes(raw) ? (raw as T) : fallback
  })

  useEffect(() => {
    const onPop = () => {
      const raw = readRaw(key)
      setTabState(raw && (ids as readonly string[]).includes(raw) ? (raw as T) : fallback)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [key, fallback])

  const setTab = useCallback((v: T) => {
    setTabState(v)
    writeRaw(key, v === fallback ? null : v)
  }, [key, fallback])

  return [tab, setTab]
}
