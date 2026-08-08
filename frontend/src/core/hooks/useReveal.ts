import { useEffect, useRef } from 'react'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const show = (el: Element) => el.classList.add('rv-in')
    const items = () => Array.from(root.querySelectorAll<HTMLElement>('[data-rv]:not(.rv-in)'))

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      items().forEach(show)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          show(e.target)
          io.unobserve(e.target)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    )

    items().forEach((el) => io.observe(el))

    const mo = new MutationObserver(() => items().forEach((el) => io.observe(el)))
    mo.observe(root, { childList: true, subtree: true })

    return () => { io.disconnect(); mo.disconnect() }
  }, [])

  return ref
}
