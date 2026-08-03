import { useEffect, useRef } from 'react'

export interface YouTubePlayer {
  load: (id: string) => void
  seek: (sec: number) => void
  getTime: () => number | null
  play: () => void
  pause: () => void
  mute: () => void
  unMute: () => void
  setRate: (rate: number) => void
}

export function useYouTubePlayer(elementId = 'player'): YouTubePlayer {
  const playerRef = useRef<any>(null)

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }
  }, [])

  const alive = (): boolean => {
    try {
      const frame = playerRef.current?.getIframe?.()
      return !!frame && document.contains(frame)
    } catch {
      return false
    }
  }

  const load = (id: string) => {
    const make = () => {
      if (alive() && playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(id)
      } else if (document.getElementById(elementId)) {
        try { playerRef.current?.destroy?.() } catch {}
        playerRef.current = new window.YT.Player(elementId, {
          videoId: id,
          height: '100%',
          width: '100%',
          playerVars: { rel: 0 },
        })
      }
    }
    if (window.YT?.Player) {
      make()
    } else {
      const iv = setInterval(() => {
        if (window.YT?.Player) {
          clearInterval(iv)
          make()
        }
      }, 200)
    }
  }

  const seek = (sec: number) => {
    const p = playerRef.current
    if (p?.seekTo) {
      p.seekTo(sec, true)
      p.playVideo()
    }
  }

  const getTime = (): number | null => {
    const p = playerRef.current
    try {
      return p?.getCurrentTime ? p.getCurrentTime() : null
    } catch {
      return null
    }
  }

  const play = () => { try { playerRef.current?.playVideo?.() } catch {} }
  const pause = () => { try { playerRef.current?.pauseVideo?.() } catch {} }
  const mute = () => { try { playerRef.current?.mute?.() } catch {} }
  const unMute = () => { try { playerRef.current?.unMute?.() } catch {} }
  const setRate = (rate: number) => { try { playerRef.current?.setPlaybackRate?.(rate) } catch {} }

  return { load, seek, getTime, play, pause, mute, unMute, setRate }
}
