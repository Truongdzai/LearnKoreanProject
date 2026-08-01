import { useEffect, useRef } from 'react'
import type React from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function focusables(box: HTMLElement): HTMLElement[] {
  return [...box.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.hasAttribute('hidden') && (el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement),
  )
}

export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const box = ref.current
    if (box) {
      const items = focusables(box)
      const auto = box.querySelector<HTMLElement>('[data-autofocus]')
      ;(auto || items.find((el) => !el.hasAttribute('data-skip-focus')) || box).focus()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !box) return
      const items = focusables(box)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && (active === first || !box.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey, true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prevOverflow
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [open])

  return ref
}

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

export function useTabs<T extends string>(group: string, ids: readonly T[], current: T, setCurrent: (v: T) => void, label?: string) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: T | undefined
    if (e.key in STEP) {
      const i = ids.indexOf(current)
      next = ids[(i + STEP[e.key] + ids.length) % ids.length]
    } else if (e.key === 'Home') next = ids[0]
    else if (e.key === 'End') next = ids[ids.length - 1]
    if (next === undefined) return
    e.preventDefault()
    const id = `${group}-tab-${next}`
    setCurrent(next)
    setTimeout(() => document.getElementById(id)?.focus(), 0)
  }

  return {
    list: { role: 'tablist' as const, 'aria-label': label, onKeyDown },
    tab: (id: T) => ({
      id: `${group}-tab-${id}`,
      role: 'tab' as const,
      type: 'button' as const,
      'aria-selected': current === id,
      'aria-controls': current === id ? `${group}-panel-${id}` : undefined,
      tabIndex: current === id ? 0 : -1,
    }),
    panel: (id: T) => ({
      id: `${group}-panel-${id}`,
      role: 'tabpanel' as const,
      'aria-labelledby': `${group}-tab-${id}`,
    }),
  }
}

let liveNode: HTMLElement | null = null

export function announce(message: string) {
  if (typeof document === 'undefined' || !message) return
  if (!liveNode) {
    liveNode = document.createElement('div')
    liveNode.className = 'sr-only'
    liveNode.setAttribute('role', 'status')
    liveNode.setAttribute('aria-live', 'polite')
    document.body.appendChild(liveNode)
  }
  liveNode.textContent = ''
  const node = liveNode
  setTimeout(() => {
    node.textContent = message
  }, 0)
}
