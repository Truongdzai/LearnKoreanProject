import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN, stopSpeak } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { PRON_PASS, scoreSpoken } from '@/data/englishPronunciation'

export interface PronCtx {
  lang: string
  speak: (text: string, rate?: number) => void
  srLang: string
}

export const CTX: PronCtx = { lang: 'en', speak: speakEN, srLang: 'en-US' }

export const SR_LANG: Record<string, string> = { ko: 'ko-KR', zh: 'zh-CN', en: 'en-US' }

export function useReader() {
  const sr = useSpeechRecognition(CTX.srLang)
  const [active, setActive] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { pct: number; heard: string }>>({})
  const targetRef = useRef<Record<string, string>>({})
  const startedRef = useRef(false)

  useEffect(() => {
    if (sr.listening) { startedRef.current = true; return }
    if (!startedRef.current || !active) return
    startedRef.current = false
    const heard = sr.transcript.trim()
    const pct = heard ? scoreSpoken(targetRef.current[active] ?? '', heard, CTX.lang) : 0
    setResults((prev) => ({ ...prev, [active]: { pct, heard } }))
    setActive(null)
    sr.reset()
  }, [sr.listening, sr.transcript, sr.reset, active])

  const listen = useCallback((id: string, target: string) => {
    if (sr.listening) { sr.stop(); return }
    targetRef.current[id] = target
    setResults((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    stopSpeak()
    setActive(id)
    sr.start()
  }, [sr])

  const clear = useCallback(() => { setResults({}); setActive(null) }, [])

  return { sr, active, results, listen, clear }
}

export type Reader = ReturnType<typeof useReader>

export function verdict(pct: number): { cls: string; text: string } {
  if (pct >= 90) return { cls: 'great', text: 'Rất chuẩn!' }
  if (pct >= PRON_PASS) return { cls: 'ok', text: 'Được rồi — đọc lại cho chắc nhé' }
  return { cls: 'bad', text: 'Chưa rõ — nghe mẫu rồi thử lại' }
}

export function MicButton({ id, target, reader }: { id: string; target: string; reader: Reader }) {
  const { sr, active, listen } = reader
  const on = active === id && sr.listening
  if (!sr.supported) return null
  return (
    <button className={'pron-mic' + (on ? ' on' : '')} onClick={() => listen(id, target)} title="Đọc theo">
      <Icon name="mic" size={15} />
    </button>
  )
}

export function ResultLine({ id, reader }: { id: string; reader: Reader }) {
  const r = reader.results[id]
  if (reader.active === id && reader.sr.listening) return <div className="pron-res listening">Đang nghe… hãy đọc to và rõ</div>
  if (!r) return null
  const v = verdict(r.pct)
  return (
    <div className={'pron-res ' + v.cls}>
      <b>{r.pct}% · {v.text}</b>
      {r.heard ? <span>Máy nghe được: “{r.heard}”</span> : <span>Máy không nghe được gì.</span>}
    </div>
  )
}
