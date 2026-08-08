import { useCallback, useEffect, useRef, useState } from 'react'

function pickMime(): string {
  const list = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  for (const m of list) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

export function useTake() {
  const [supported] = useState(
    () => typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  )
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const doneRef = useRef<((url: string) => void) | null>(null)
  const urlsRef = useRef<string[]>([])
  const busyRef = useRef(false)

  const release = useCallback(() => {
    recRef.current?.stream.getTracks().forEach((t) => t.stop())
    recRef.current = null
    busyRef.current = false
    setRecording(false)
  }, [])

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = []
  }, [])

  useEffect(() => () => { release(); revokeAll() }, [release, revokeAll])

  const start = useCallback(async (onDone: (url: string) => void) => {
    if (!supported || busyRef.current) return
    busyRef.current = true
    setError('')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      busyRef.current = false
      setError('mic')
      return
    }
    const mime = pickMime()
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
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
    setRecording(true)
  }, [supported, release])

  const stop = useCallback(() => {
    if (recRef.current?.state === 'recording') recRef.current.stop()
    else release()
  }, [release])

  const cancel = useCallback(() => {
    doneRef.current = null
    stop()
  }, [stop])

  return { supported, recording, error, start, stop, cancel, revokeAll }
}
