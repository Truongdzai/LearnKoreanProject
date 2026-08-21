import { useCallback, useEffect, useRef, useState } from 'react'
import { wakeBackend } from '@/core/quota'
import type { AsrWord } from '@/models/srs.model'

interface SRAlternative {
  transcript: string
  confidence?: number
}
interface SRResult extends ArrayLike<SRAlternative> {
  isFinal: boolean
}
interface SRResultEvent {
  resultIndex: number
  results: ArrayLike<SRResult>
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
const ALTS = 5

export function useSpeechRecognition(lang = 'ko-KR') {
  const [supported] = useState(() => !!getCtor())
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [confidence, setConfidence] = useState(0)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const recRef = useRef<SRInstance | null>(null)
  const retryRef = useRef(0)
  const altRef = useRef<string[]>([])

  useEffect(() => () => { try { recRef.current?.abort() } catch {} }, [])

  const begin = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) {
      setError('Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.')
      return
    }
    try { recRef.current?.abort() } catch {}
    wakeBackend()

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = ALTS
    rec.onresult = (e) => {
      let fin = ''
      let intr = ''
      let conf = 0
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (!r.isFinal) { intr += r[0].transcript; continue }
        fin += r[0].transcript
        conf = Math.max(conf, r[0].confidence ?? 0)
        for (let k = 1; k < ALTS; k++) {
          const alt = r[k] ?? r[0]
          altRef.current[k - 1] = (altRef.current[k - 1] ?? '') + alt.transcript
        }
      }
      if (fin) {
        setTranscript((prev) => (prev + ' ' + fin).trim())
        setAlternatives(altRef.current.filter(Boolean).map((s) => s.trim()))
        if (conf) setConfidence(conf)
      }
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
    setAlternatives([])
    setConfidence(0)
    setInterim('')
    retryRef.current = 0
    altRef.current = []
    begin()
  }, [begin])

  const stop = useCallback(() => { try { recRef.current?.stop() } catch {} }, [])
  const reset = useCallback(() => {
    setTranscript('')
    setAlternatives([])
    setConfidence(0)
    setInterim('')
    setError('')
    altRef.current = []
  }, [])

  return {
    supported, listening, transcript, words: [] as AsrWord[], alternatives,
    confidence, interim, error, level: 0, start, stop, reset,
  }
}
