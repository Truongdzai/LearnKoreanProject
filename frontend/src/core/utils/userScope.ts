const UID_KEY = 'vyling.uid'

const KEEP_EXACT = new Set<string>([
  'vyling.theme',
  'vyling.learnLang',
  'vyling.nativeLang',
  'vyling.uiLang',
  'vyling.dailyGoal',
  'vyling.token',
  UID_KEY,
])
const KEEP_PREFIX = ['vyling.pet.']

export function clearUserScopedStorage(): void {
  try {
    const drop: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith('vyling.')) continue
      if (KEEP_EXACT.has(k)) continue
      if (KEEP_PREFIX.some((p) => k.startsWith(p))) continue
      drop.push(k)
    }
    drop.forEach((k) => localStorage.removeItem(k))
  } catch {  }
}

export function syncUserScope(uid: string): void {
  if (!uid) return
  let prev: string | null = null
  try { prev = localStorage.getItem(UID_KEY) } catch {  }
  if (prev && prev !== uid) {
    clearUserScopedStorage()
    try { localStorage.setItem(UID_KEY, uid) } catch {  }
    window.location.reload()
    return
  }
  try { localStorage.setItem(UID_KEY, uid) } catch {  }
}

export function forgetUserScope(): void {
  clearUserScopedStorage()
  try { localStorage.removeItem(UID_KEY) } catch {  }
}
