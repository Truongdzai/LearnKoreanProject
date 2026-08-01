const REF_KEY = 'vyling.ref'

export function captureRefCode(): void {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref && /^[A-Za-z0-9_-]{4,40}$/.test(ref)) {
      localStorage.setItem(REF_KEY, ref)
      const url = new URL(window.location.href)
      url.searchParams.delete('ref')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  } catch {
  }
}

export function takeRefCode(): string {
  try {
    const ref = localStorage.getItem(REF_KEY) || ''
    if (ref) localStorage.removeItem(REF_KEY)
    return ref
  } catch {
    return ''
  }
}

export function refLink(userId: string): string {
  return `${window.location.origin}/?ref=${encodeURIComponent(userId)}`
}

const DUEL_KEY = 'vyling.duelCode'

export function captureDuelCode(): void {
  try {
    const code = new URLSearchParams(window.location.search).get('duel')
    if (code && /^[A-Z0-9]{6}$/.test(code.toUpperCase())) {
      localStorage.setItem(DUEL_KEY, code.toUpperCase())
      const url = new URL(window.location.href)
      url.searchParams.delete('duel')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  } catch {
  }
}

export function takeDuelCode(): string {
  try {
    const code = localStorage.getItem(DUEL_KEY) || ''
    if (code) localStorage.removeItem(DUEL_KEY)
    return code
  } catch {
    return ''
  }
}

export function duelLink(code: string): string {
  return `${window.location.origin}/bang-xep-hang?duel=${encodeURIComponent(code)}`
}
