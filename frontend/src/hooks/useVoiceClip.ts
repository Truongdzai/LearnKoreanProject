import { useCallback, useEffect, useRef, useState } from 'react'
import { openMic } from '@/core/mic'

const MAX_MS = 20000
const MAX_CHARS = 400000

function pickMime(): string {
  const list = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  for (const m of list) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

function usable(stream: MediaStream | null | undefined): boolean {
  return !!stream && stream.getAudioTracks().some((t) => t.readyState === 'live')
}

export function useVoiceClip() {
  const [supported] = useState(
    () => typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  )
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(0)
  const recRef = useRef<MediaRecorder | null>(null)
  const ownedRef = useRef(false)
  const chunksRef = useRef<Blob[]>([])
  const doneRef = useRef<((clip: string) => void) | null>(null)
  const timerRef = useRef<number | null>(null)
  const stopperRef = useRef<number | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null }
    if (stopperRef.current) { window.clearTimeout(stopperRef.current); stopperRef.current = null }
    if (ownedRef.current) recRef.current?.stream.getTracks().forEach((t) => t.stop())
    ownedRef.current = false
    recRef.current = null
    setRecording(false)
    setSeconds(0)
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const start = useCallback(
    async (onDone: (clip: string) => void, shared?: MediaStream | null): Promise<boolean> => {
      if (!supported || recRef.current) return false
      setError('')
      let stream: MediaStream
      let owned = false
      if (usable(shared)) {
        stream = shared as MediaStream
      } else {
        try {
          stream = await openMic()
          owned = true
        } catch {
          setError('mic')
          return false
        }
      }
      const mime = pickMime()
      let rec: MediaRecorder
      try {
        rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      } catch {
        if (owned) stream.getTracks().forEach((t) => t.stop())
        setError('mic')
        return false
      }
      recRef.current = rec
      ownedRef.current = owned
      doneRef.current = onDone
      chunksRef.current = []

      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        const finish = doneRef.current
        cleanup()
        if (!finish) return
        if (!blob.size) { finish(''); return }
        const reader = new FileReader()
        reader.onloadend = () => {
          const url = typeof reader.result === 'string' ? reader.result : ''
          finish(url.length > MAX_CHARS ? '' : url)
        }
        reader.readAsDataURL(blob)
      }

      rec.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
      stopperRef.current = window.setTimeout(() => {
        if (recRef.current?.state === 'recording') recRef.current.stop()
      }, MAX_MS)
      return true
    },
    [supported, cleanup],
  )

  const stop = useCallback(() => {
    if (recRef.current?.state === 'recording') recRef.current.stop()
    else cleanup()
  }, [cleanup])

  const cancel = useCallback(() => {
    doneRef.current = null
    stop()
  }, [stop])

  return { supported, recording, seconds, error, start, stop, cancel, maxSeconds: MAX_MS / 1000 }
}
