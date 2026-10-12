import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import { useRevealTop } from '@/features/korean/hangul/useRevealTop'
import { filled, prepLabel, type Frame, type Prep } from './frames'
import { MASTERY, type Result } from './progress'

interface Props {
  items: Frame[]
  title: string
  canHear: boolean
  onFinish: (results: Result[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

function Sentence({ f, fill, state }: { f: Frame; fill?: Prep; state?: 'ok' | 'bad' }) {
  const [a, b] = f.en.split('___')
  const shown = fill === '-' ? '∅' : fill
  return (
    <span className="ep-sentence" lang="en">
      {a}
      <span className={'ep-blank' + (fill ? ' filled' : '') + (state ? ' ' + state : '')}>
        {shown ?? <><span aria-hidden="true">{' '.repeat(5)}</span><span className="sr-only" lang="vi">(chỗ trống)</span></>}
      </span>
      {b}
    </span>
  )
}

export default function PrepQuiz({ items, title, canHear, onFinish, onAgain, onBack }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Prep | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const f = items[i]

  useEffect(() => {
    if (picked != null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  const choose = (p: Prep) => {
    if (picked != null || !f) return
    setPicked(p)
    setResults((r) => [...r, { id: f.id, ok: p === f.answer }])
    if (canHear) speakEN(filled(f), 0.9)
  }

  const next = () => {
    if (i + 1 >= items.length) {
      setDone(true)
      const ok = results.filter((r) => r.ok).length
      onFinish(results, Math.round((ok / items.length) * 100))
      return
    }
    setPicked(null)
    setI((x) => x + 1)
  }

  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const t = e.target as HTMLInputElement | null
      if (t?.tagName === 'TEXTAREA' || (t?.tagName === 'INPUT' && !['checkbox', 'radio', 'button'].includes(t.type))) return
      const n = Number(e.key)
      if (picked == null && f && n >= 1 && n <= f.options.length) {
        e.preventDefault()
        choose(f.options[n - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!items.length) return null

  if (done) {
    const score = results.filter((r) => r.ok).length
    const pct = Math.round((score / items.length) * 100)
    const good = pct >= MASTERY
    const missed = items.filter((_, k) => results[k] && !results[k].ok)
    return (
      <div className="hg-result ep-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{items.length} câu đúng</span>
        </div>
        <h3>{good ? 'Vững rồi — thử nhóm còn lại' : 'Xong một lượt — đọc to lại các câu sai bên dưới'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những câu cần xem lại</div>
            {missed.map((m) => (
              <button
                key={m.id}
                className="hg-wrong-row ep-wrong-row"
                onClick={() => speakEN(filled(m), 0.85)}
                aria-label={canHear ? `Nghe lại: ${filled(m)}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span className="ep-wrong-a">
                  <span lang="en">{filled(m)}</span>
                  <small>{m.why}</small>
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="hg-actions">
          <button className="btn-primary" onClick={onAgain}><Icon name="refresh" size={15} /> Làm lượt mới</button>
          <button className="btn-ghost" onClick={onBack}><Icon name="arrow-left" size={15} /> Chọn nhóm khác</button>
        </div>
      </div>
    )
  }

  const correct = picked != null && picked === f.answer
  const score = results.filter((r) => r.ok).length

  return (
    <div className="hg-quiz ep-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{items.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>

      <div className="hg-q ep-q">
        <p className="hg-ask">Điền giới từ vào chỗ trống (hoặc chọn "không cần"):</p>
        <div className="ep-frame">
          <Sentence f={f} fill={picked ?? undefined} state={picked != null ? (correct ? 'ok' : 'bad') : undefined} />
        </div>
        <div className="ep-vi">{f.vi}</div>
      </div>

      <div className={'quiz-options ep-options' + (f.options.length === 3 ? ' three' : '')} role="group" aria-label="Đáp án">
        {f.options.map((p, k) => {
          const cls = picked != null ? (p === f.answer ? ' correct' : p === picked ? ' wrong' : '') : ''
          return (
            <button key={p} className={'quiz-opt ep-opt' + cls + (p === '-' ? ' none' : '')} disabled={picked != null} onClick={() => choose(p)}>
              <span className="hg-key">{k + 1}</span>
              <span className="ep-opt-main" lang={p === '-' ? undefined : 'en'}>{prepLabel(p)}</span>
            </button>
          )
        })}
      </div>

      {picked != null && (
        <div className={'hg-feedback ep-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="ep-fb-body">
            <p><b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b> {f.why}</p>
            <p className="ep-fb-say">
              <span lang="en">{filled(f)}</span>
              {canHear && (
                <button className="ep-icon-btn" onClick={() => speakEN(filled(f), 0.85)} aria-label="Nghe cả câu">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= items.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
