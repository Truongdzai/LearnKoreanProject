import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { FLUSH_EVERY_SEC, STUDY_VIEWS, TICK_MS, takeMinutes, tick, youtubePlaying } from './studyTime'

const KEY = 'vyling.studySec'

// Đếm thời gian học thật để biểu đồ phút học, bản đồ nhiệt và thống kê tuần không còn luôn bằng 0.
// Một giây chỉ được tính khi: tab đang hiện, đang ở trang học, và (vừa có thao tác trong 90 giây
// hoặc đang phát video/âm thanh/giọng đọc).

function mediaPlaying(): boolean {
  if (youtubePlaying()) return true
  try {
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking) return true
  } catch {  }
  const els = document.querySelectorAll<HTMLMediaElement>('video, audio')
  for (const el of els) if (!el.paused && !el.ended) return true
  return false
}

function readCarry(): number {
  try { return Math.max(0, Math.min(59, Number(sessionStorage.getItem(KEY)) || 0)) } catch { return 0 }
}

function writeCarry(sec: number): void {
  try { sessionStorage.setItem(KEY, String(Math.round(sec))) } catch {  }
}

export function useStudyClock(): void {
  const { view, recordEvent, learnLang } = useAppStore()
  const { isAuthed } = useAuth()
  const viewRef = useRef(view)
  viewRef.current = view
  const langRef = useRef(learnLang)
  langRef.current = learnLang
  const sendRef = useRef(recordEvent)
  sendRef.current = recordEvent

  useEffect(() => {
    if (!isAuthed) return undefined
    let sec = readCarry()
    let lastInput = Date.now()
    let last = Date.now()

    const onInput = () => { lastInput = Date.now() }
    const flush = (force: boolean) => {
      if (!force && sec < FLUSH_EVERY_SEC) return
      const [minutes, rest] = takeMinutes(sec)
      if (minutes > 0) sendRef.current('login', 0, minutes, 0, langRef.current)
      sec = rest
      writeCarry(sec)
    }

    const timer = window.setInterval(() => {
      const now = Date.now()
      // Máy ngủ / tab bị treo lâu thì không cộng dồn khoảng thời gian đó
      const dt = Math.min((now - last) / 1000, TICK_MS / 1000 * 2)
      last = now
      sec = tick(sec, now, dt, {
        visible: document.visibilityState === 'visible',
        studyView: STUDY_VIEWS.has(viewRef.current),
        media: mediaPlaying(),
        lastInput,
      })
      writeCarry(sec % 60)
      flush(false)
    }, TICK_MS)

    const onHide = () => { if (document.visibilityState === 'hidden') flush(true) }
    const onPageHide = () => flush(true)
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true, capture: true }))
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.clearInterval(timer)
      flush(true)
      events.forEach((e) => window.removeEventListener(e, onInput, { capture: true }))
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [isAuthed])
}
