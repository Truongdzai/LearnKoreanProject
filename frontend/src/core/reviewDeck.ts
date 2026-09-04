const KEY = 'vyling.review.deck'

export function askReviewDeck(name: string): void {
  try { sessionStorage.setItem(KEY, name) } catch {  }
}

export function takeReviewDeck(): string {
  try {
    const v = sessionStorage.getItem(KEY) || ''
    if (v) sessionStorage.removeItem(KEY)
    return v
  } catch {
    return ''
  }
}
