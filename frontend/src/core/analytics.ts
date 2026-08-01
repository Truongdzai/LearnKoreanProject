import { env } from '@/config/env'


type Props = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const CONSENT_KEY = 'vyling.analyticsConsent'

let ready = false
let pendingId = ''
const listeners = new Set<(needsAsk: boolean) => void>()

export function analyticsReady(): boolean {
  return ready
}

function consent(): 'yes' | 'no' | '' {
  try {
    return (localStorage.getItem(CONSENT_KEY) as 'yes' | 'no' | null) || ''
  } catch {
    return ''
  }
}

export function needsConsent(): boolean {
  return !!pendingId && !consent()
}

export function onConsentChange(fn: (needsAsk: boolean) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export function setConsent(agree: boolean): void {
  try { localStorage.setItem(CONSENT_KEY, agree ? 'yes' : 'no') } catch {}
  if (agree && pendingId && !ready) {
    loadGtag(pendingId)
    pageview(location.pathname)
  }
  for (const fn of listeners) fn(false)
}

function loadGtag(id: string): void {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false, anonymize_ip: true })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)
  ready = true
}

export async function initAnalytics(): Promise<void> {
  if (ready || typeof window === 'undefined') return
  try {
    const res = await fetch(env.apiBase + '/api/site')
    const site = (await res.json()) as { ga4?: string }
    const id = (site.ga4 || '').trim()
    if (!id) return
    pendingId = id
    if (consent() === 'yes') {
      loadGtag(id)
      pageview(location.pathname)
    } else if (!consent()) {
      for (const fn of listeners) fn(true)
    }
  } catch {
  }
}

export function pageview(path: string, title?: string): void {
  if (!ready) return
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: location.origin + path,
    page_title: title || document.title,
  })
}

export function sendEvent(event: string, props?: Props): void {
  if (!ready) return
  window.gtag?.('event', event, props || {})
}
