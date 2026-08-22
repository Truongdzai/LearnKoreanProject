const KEY = 'vyling.tasted'

export type TasteKey = 'dubbing' | 'weakness' | 'weekly'

function read(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, number>
  } catch {
    return {}
  }
}

export function hasTasted(key: TasteKey): boolean {
  return !!read()[key]
}

export function takeTaste(key: TasteKey): boolean {
  const all = read()
  if (all[key]) return false
  all[key] = Date.now()
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
  }
  return true
}
