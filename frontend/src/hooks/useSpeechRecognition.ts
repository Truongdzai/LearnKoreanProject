import { useCallback, useEffect, useRef, useState } from 'react'

interface SRResultEvent {
  resultIndex: number
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>
}
interface SRInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SRResultEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function getCtor(): (new () => SRInstance) | null {
  const w = window as unknown as { SpeechRecognition?: new () => SRInstance; webkitSpeechRecognition?: new () => SRInstance }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

const MAX_RETRY = 2

export function useSpeechRecognition(lang = 'ko-KR') {
  const [supported] = useState(() => !!getCtor())
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const recRef = useRef<SRInstance | null>(null)
  const retryRef = useRef(0)
  const gotResultRef = useRef(false)

  useEffect(() => () => { try { recRef.current?.abort() } catch {} }, [])

  const begin = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) {
      setError('Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.')
      return
    }
    try { recRef.current?.abort() } catch {}

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      gotResultRef.current = true
      let fin = ''
      let intr = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) fin += r[0].transcript
        else intr += r[0].transcript
      }
      if (fin) setTranscript((prev) => (prev + ' ' + fin).trim())
      setInterim(intr)
    }
    rec.onerror = (ev) => {
      if (ev.error === 'network' && retryRef.current < MAX_RETRY) {
        retryRef.current += 1
        setError('Mạng chập chờn, đang thử lại…')
        setTimeout(() => begin(), 700)
        return
      }
      const map: Record<string, string> = {
        'no-speech': 'Không nghe thấy giọng nói — hãy thử lại và nói rõ hơn.',
        'not-allowed': 'Bạn cần cho phép truy cập micro để luyện nói.',
        'audio-capture': 'Không tìm thấy micro. Hãy kiểm tra thiết bị.',
        network: 'Lỗi mạng khi nhận diện giọng nói. Bạn có thể bấm “Thử lại” hoặc gõ tay câu mình vừa nói bên dưới.',
        aborted: '',
      }
      const msg = map[ev.error] ?? ('Lỗi nhận diện: ' + ev.error)
      if (msg) setError(msg)
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
    }
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
    }
  }, [lang])

  const start = useCallback(() => {
    setError('')
    setTranscript('')
    setInterim('')
    retryRef.current = 0
    gotResultRef.current = false
    begin()
  }, [begin])

  const stop = useCallback(() => { try { recRef.current?.stop() } catch {} }, [])
  const reset = useCallback(() => {
    setTranscript('')
    setInterim('')
    setError('')
  }, [])

  return { supported, listening, transcript, interim, error, start, stop, reset }
}
