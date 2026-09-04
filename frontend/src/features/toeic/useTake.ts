import { useCallback, useEffect, useRef, useState } from 'react'
import { openMic } from '@/core/mic'

export type TakeError = '' | 'denied' | 'nomic' | 'busy' | 'other'

function takeError(e: unknown): TakeError {
  const name = (e as DOMException)?.name || ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'nomic'
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy'
  return 'other'
}

function pickMime(): string {
  const list = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  for (const m of list) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

function live(stream: MediaStream | null): boolean {
  return !!stream && stream.getAudioTracks().some((t) => t.readyState === 'live')
}

export function useTake() {
  const [supported] = useState(
    () => typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  )
  const [recording, setRecording] = useState(false)
  const [armed, setArmed] = useState(false)
  const [error, setError] = useState<TakeError>('')
  const recRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const doneRef = useRef<((url: string) => void) | null>(null)
  const urlsRef = useRef<string[]>([])
  const busyRef = useRef(false)

  const drop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setArmed(false)
  }, [])

  const release = useCallback(() => {
    recRef.current = null
    busyRef.current = false
    setRecording(false)
    drop()
  }, [drop])

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = []
  }, [])

  useEffect(() => () => { release(); revokeAll() }, [release, revokeAll])

  const arm = useCallback(async (): Promise<boolean> => {
    if (!supported) return false
    if (live(streamRef.current)) { setArmed(true); return true }
    setError('')
    try {
      streamRef.current = await openMic()
      setArmed(true)
      return true
    } catch (e) {
      setError(takeError(e))
      setArmed(false)
      return false
    }
  }, [supported])

  const start = useCallback(async (onDone: (url: string) => void): Promise<boolean> => {
    if (!supported || busyRef.current) return false
    busyRef.current = true
    if (!live(streamRef.current) && !(await arm())) { busyRef.current = false; return false }
    const stream = streamRef.current as MediaStream
    const mime = pickMime()
    let rec: MediaRecorder
    try {
      rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    } catch {
      setError('other')
      release()
      return false
    }
    recRef.current = rec
    doneRef.current = onDone
    chunksRef.current = []

    rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
      const finish = doneRef.current
      release()
      if (!finish || !blob.size) return
      const url = URL.createObjectURL(blob)
      urlsRef.current.push(url)
      finish(url)
    }
    rec.start()
    setError('')
    setRecording(true)
    return true
  }, [supported, arm, release])

  const stop = useCallback(() => {
    if (recRef.current?.state === 'recording') recRef.current.stop()
    else release()
  }, [release])

  const cancel = useCallback(() => {
    doneRef.current = null
    stop()
  }, [stop])

  return { supported, armed, recording, error, arm, start, stop, cancel, drop, revokeAll }
}
