import { useEffect, useRef } from 'react'

export interface YouTubePlayer {
  load: (id: string) => void
  seek: (sec: number) => void
  getTime: () => number | null
}

export function useYouTubePlayer(): YouTubePlayer {
  const playerRef = useRef<any>(null)

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }
  }, [])

  const load = (id: string) => {
    const make = () => {
      if (playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(id)
      } else if (document.getElementById('player')) {
        playerRef.current = new window.YT.Player('player', {
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

  return { load, seek, getTime }
}
