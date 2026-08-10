import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN, stopSpeak } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { usePhonetics } from '@/hooks/usePhonetics'
import { phoneLabel } from '@/data/phoneCoach'
import { splitWords } from '@/core/utils/speechDiff'
import { gradeSpeech, topFixes, type SpeechGrade } from '@/core/utils/pronGrade'
import { PRON_PASS } from '@/data/englishPronunciation'

export interface PronCtx {
  lang: string
  speak: (text: string, rate?: number) => void
  srLang: string
}

export const CTX: PronCtx = { lang: 'en', speak: speakEN, srLang: 'en-US' }

export const SR_LANG: Record<string, string> = { ko: 'ko-KR', zh: 'zh-CN', en: 'en-US' }

interface Shot {
  pct: number
  heard: string
  grade: SpeechGrade | null
}

const NO_SOURCE: string[] = []

export function useReader() {
  const sr = useSpeechRecognition(CTX.srLang)
  const ph = usePhonetics(CTX.lang, NO_SOURCE)
  const [active, setActive] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, Shot>>({})
  const targetRef = useRef<Record<string, string>>({})
  const startedRef = useRef(false)

  useEffect(() => {
    if (sr.listening) { startedRef.current = true; return }
    if (!startedRef.current || !active) return
    startedRef.current = false
    const id = active
    const target = targetRef.current[id] ?? ''
    const heard = sr.transcript.trim()
    const alts = sr.alternatives
    setActive(null)
    if (!heard) {
      setResults((prev) => ({ ...prev, [id]: { pct: 0, heard: '', grade: null } }))
      sr.reset()
      return
    }
    void (async () => {
      await ph.ensure(splitWords([target, heard, ...alts].join(' '), CTX.lang))
      const grade = gradeSpeech(
        { lang: CTX.lang, phones: ph.phones, read: ph.read },
        { target, heard, alternatives: alts },
      )
      setResults((prev) => ({ ...prev, [id]: { pct: grade.score, heard, grade } }))
      sr.reset()
    })()
  }, [sr.listening, sr.transcript, sr.alternatives, sr.reset, active, ph])

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
  const lab = (tok: string) => phoneLabel(CTX.lang, tok)
  const off = r.grade
    ? r.grade.words.filter((w) => w.state !== 'ok' && !w.unsure && w.devs.length > 0).slice(0, 3)
    : []
  const fix = r.grade ? topFixes(r.grade, 1)[0]?.fix : null

  return (
    <div className={'pron-res ' + v.cls}>
      <b>{r.pct}% · {v.text}</b>
      {r.heard ? <span>Máy nghe được: “{r.heard}”</span> : <span>Máy không nghe được gì.</span>}
      {off.length > 0 && (
        <div className="pron-res-off">
          {off.map((w, k) => (
            <span key={k} className="pron-res-w">
              <b lang={CTX.lang}>{w.target}</b>
              {w.cells.filter((c) => c.state !== 'ok').slice(0, 3).map((c, i) => (
                c.state === 'miss'
                  ? <i key={i} className="vl-pc miss">{lab(c.want)}</i>
                  : c.state === 'extra'
                    ? <i key={i} className="vl-pc extra">+{lab(c.got)}</i>
                    : <i key={i} className="vl-pc sub">{lab(c.want)}<b>{lab(c.got)}</b></i>
              ))}
            </span>
          ))}
        </div>
      )}
      {fix && <span className="pron-res-fix"><b>{fix.title}.</b> {fix.how}</span>}
    </div>
  )
}
