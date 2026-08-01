const KEY = 'vyling.topics'

function storeKey(uid: string): string {
  return `${KEY}.${uid || 'guest'}`
}

export function getTopics(uid: string): string[] {
  try {
    const raw = localStorage.getItem(storeKey(uid))
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((s): s is string => typeof s === 'string') : []
  } catch {
    return []
  }
}

function save(uid: string, topics: string[]): void {
  try { localStorage.setItem(storeKey(uid), JSON.stringify(topics)) } catch {}
}

export function addTopic(uid: string, name: string): string[] {
  const clean = name.trim()
  if (!clean) return getTopics(uid)
  const topics = getTopics(uid)
  if (!topics.some((t) => t.toLowerCase() === clean.toLowerCase())) topics.push(clean)
  save(uid, topics)
  return topics
}

export function removeTopic(uid: string, name: string): string[] {
  const topics = getTopics(uid).filter((t) => t.toLowerCase() !== name.toLowerCase())
  save(uid, topics)
  return topics
}
