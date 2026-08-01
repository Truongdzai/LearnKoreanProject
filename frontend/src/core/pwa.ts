import { useEffect, useState } from 'react'
import { track } from '@/core/monitor'


interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: InstallPromptEvent | null = null
const listeners = new Set<(can: boolean) => void>()

function notify(): void {
  for (const fn of listeners) fn(!!deferred)
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
    track('pwa_install')
  })

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
    })
  })
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  await deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  notify()
  track('pwa_prompt', { outcome })
  return outcome === 'accepted'
}

export function useInstallable(): boolean {
  const [can, setCan] = useState(!!deferred)
  useEffect(() => {
    listeners.add(setCan)
    return () => { listeners.delete(setCan) }
  }, [])
  return can && !isStandalone()
}
