import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import { useRevealTop } from '@/features/korean/hangul/useRevealTop'
import { TENSES, filled, type Frame } from './frames'
import { MASTERY, type Result } from './progress'

type Item = Frame & { shuffled: string[] }

interface Props {
  items: Item[]
  title: string
  canHear: boolean
  onFinish: (results: Result[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

function Sentence({ f, fill, state }: { f: Frame; fill?: string; state?: 'ok' | 'bad' }) {
  const [a, b] = f.en.split('___')
  // Tách gợi ý "(go)" sau chỗ trống: hiện mờ khi chưa trả lời, bỏ đi khi đã điền
  const m = b.match(/^(\s*\([^)]*\))(.*)$/)
  const hint = m ? m[1] : ''
  const rest = m ? m[2] : b
  return (
    <span className="et-sentence" lang="en">
      {a}
      <span className={'et-blank' + (fill ? ' filled' : '') + (state ? ' ' + state : '')}>
        {fill ?? <><span aria-hidden="true">{' '.repeat(6)}</span><span className="sr-only" lang="vi">(chỗ trống)</span></>}
      </span>
      {!fill && hint && <span className="et-hint">{hint}</span>}
      {rest}
    </span>
  )
}

export default function TenseQuiz({ items, title, canHear, onFinish, onAgain, onBack }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const optsRef = useRef<HTMLDivElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const f = items[i]

  useEffect(() => {
    if (picked != null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  // Câu mới: focus vào phương án đầu (nút "Câu tiếp" vừa biến mất)
  useEffect(() => {
    if (!done) optsRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
  }, [i, done])

  const choose = (opt: string) => {
    if (picked != null || !f) return
    setPicked(opt)
    // Ghi kết quả ngay ở câu cuối, để thoát ở màn kết quả vẫn được tính lượt
    const all = [...results, { id: f.id, tense: f.tense, ok: opt === f.answer }]
    setResults(all)
    if (all.length === items.length) onFinish(all, Math.round((all.filter((r) => r.ok).length / items.length) * 100))
    if (canHear) speakEN(filled(f), 0.9)
  }

  const next = () => {
    if (i + 1 >= items.length) {
      setDone(true)
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
      if (picked == null && f && n >= 1 && n <= f.shuffled.length) {
        e.preventDefault()
        choose(f.shuffled[n - 1])
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
      <div className="hg-result et-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{items.length} câu đúng</span>
        </div>
        <h3>{good ? 'Nhìn dấu hiệu là ra thì — giỏi lắm!' : 'Xong một lượt — xem lại dấu hiệu của các câu sai'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những câu cần xem lại</div>
            {missed.map((m) => (
              <button
                key={m.id}
                className="hg-wrong-row et-wrong-row"
                onClick={canHear ? () => speakEN(filled(m), 0.85) : undefined}
                aria-label={canHear ? `Nghe lại: ${filled(m)}` : undefined}
              >
                {canHear ? <Icon name="volume" size={14} /> : <span />}
                <span className="et-wrong-a">
                  <span lang="en">{filled(m)}</span>
                  <small>{TENSES[m.tense].name} · dấu hiệu: {m.signal}</small>
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
  const t = TENSES[f.tense]

  return (
    <div className="hg-quiz et-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{items.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>

      <div className="hg-q et-q">
        <p className="hg-ask">Chọn dạng đúng của động từ trong ngoặc:</p>
        <div className="et-frame">
          <Sentence f={f} fill={picked ?? undefined} state={picked != null ? (correct ? 'ok' : 'bad') : undefined} />
        </div>
        <div className="et-vi">{f.vi}</div>
      </div>

      <div className="quiz-options et-options" role="group" aria-label="Đáp án" ref={optsRef}>
        {f.shuffled.map((opt, k) => {
          const cls = picked != null ? (opt === f.answer ? ' correct' : opt === picked ? ' wrong' : '') : ''
          return (
            <button key={opt} className={'quiz-opt et-opt' + cls} disabled={picked != null} onClick={() => choose(opt)}>
              <span className="hg-key">{k + 1}</span>
              <span className="et-opt-main" lang="en">{opt}</span>
            </button>
          )
        })}
      </div>

      {picked != null && (
        <div className={'hg-feedback et-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="et-fb-body">
            <p>
              <b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b> Dấu hiệu <span className="et-signal" lang="en">{f.signal}</span> → <b className="et-tense">{t.name}</b>.
            </p>
            <p className="et-rule">{t.rule}</p>
            <p className="et-fb-say">
              <span lang="en">{filled(f)}</span>
              {canHear && (
                <button className="et-icon-btn" onClick={() => speakEN(filled(f), 0.85)} aria-label="Nghe cả câu">
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
