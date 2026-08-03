const KEY = 'vyling.toeic.run'
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export interface RunProgress {
  gi: number
  answers: Record<string, number>
  played: string[]
  remL: number
  remR: number
}

export interface SavedRun extends RunProgress {
  full: boolean
  fixed?: number
  ids: string[]
  savedAt: number
}

export function saveRun(run: SavedRun): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(run))
  } catch {
  }
}

export function loadRun(): SavedRun | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const r = JSON.parse(raw) as SavedRun
    if (!Array.isArray(r.ids) || !r.ids.length) return null
    if (!r.savedAt || Date.now() - r.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY)
      return null
    }
    if ((r.remL ?? 0) <= 0 && (r.remR ?? 0) <= 0) {
      localStorage.removeItem(KEY)
      return null
    }
    return r
  } catch {
    return null
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
  }
}
