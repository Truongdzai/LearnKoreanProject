import type { Lesson } from '@/models/lesson.model'
import type { YouTubePlayer } from '@/hooks/useYouTubePlayer'

export function segEnd(segs: Lesson['segments'], idx: number): number {
  const a = segs[idx].start
  const b = idx + 1 < segs.length ? segs[idx + 1].start : a + 3.5
  return b > a ? b : a + 3.5
}

export function refDuration(segs: Lesson['segments'], idx: number): number {
  return Math.max(1.2, Math.min(8, segEnd(segs, idx) - segs[idx].start))
}

interface RangeOpts {
  times?: number
  rate?: number
  onEnd?: () => void
}

export function playRange(yt: YouTubePlayer, from: number, to: number, opts: RangeOpts = {}): () => void {
  const rate = opts.rate ?? 1
  let left = Math.max(1, opts.times ?? 1)
  let entered = false
  let ticks = 0
  const span = Math.max(0.5, to - from)
  const maxTicks = Math.ceil((((span * left) / Math.max(0.25, rate)) + 12) * 10)

  yt.setRate(rate)
  yt.seek(from)

  const id = window.setInterval(() => {
    ticks += 1
    if (ticks > maxTicks) {
      window.clearInterval(id)
      opts.onEnd?.()
      return
    }
    const now = yt.getTime()
    if (now == null) return
    if (!entered) {
      if (now >= from - 0.3 && now < to) entered = true
      return
    }
    if (now >= to - 0.06 || now < from - 1.5) {
      left -= 1
      if (left <= 0) {
        window.clearInterval(id)
        opts.onEnd?.()
        return
      }
      entered = false
      yt.seek(from)
    }
  }, 100)

  return () => window.clearInterval(id)
}
