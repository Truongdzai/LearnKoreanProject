import { useEffect, useRef, useState, type ReactNode } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import { useRevealTop } from '@/features/korean/hangul/useRevealTop'
import './blank.css'

// Khung trắc nghiệm điền chỗ trống dùng chung cho các phòng tiếng Anh (Chọn thì, Từ dễ nhầm, So sánh,
// Câu điều kiện, Câu bị động): mỗi câu một chỗ ___, có thể kèm gợi ý "(go)" ngay sau, 2–4 phương án đã xáo.

export const MASTERY = 80

export interface BlankItem {
  id: string
  en: string
  vi: string
  answer: string
  shuffled: string[]
}

interface Props<T extends BlankItem> {
  items: T[]
  title: string
  canHear: boolean
  // Câu đã điền đáp án (để đọc to và hiện lại)
  filled: (item: T) => string
  ask: (item: T) => string
  // Nội dung giải thích sau khi chọn (đứng sau "Chính xác!" / "Chưa đúng.") và các dòng thêm bên dưới
  feedback: (item: T) => ReactNode
  extra?: (item: T) => ReactNode
  // Ghi chú dưới mỗi câu sai ở màn kết quả
  missedNote: (item: T) => ReactNode
  doneTitle: (good: boolean) => string
  // Nhãn nút quay lại ở màn kết quả
  backLabel?: string
  onFinish: (oks: boolean[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

function Sentence({ f, fill, state }: { f: BlankItem; fill?: string; state?: 'ok' | 'bad' }) {
  const [a, b] = f.en.split('___')
  // Tách gợi ý "(go)" sau chỗ trống: hiện mờ khi chưa trả lời, bỏ đi khi đã điền
  const m = b.match(/^(\s*\([^)]*\))(.*)$/)
  const hint = m ? m[1] : ''
  const rest = m ? m[2] : b
  return (
    <span className="bq-sentence" lang="en">
      {a}
      <span className={'bq-blank' + (fill ? ' filled' : '') + (state ? ' ' + state : '')}>
        {fill ?? <><span aria-hidden="true">{' '.repeat(6)}</span><span className="sr-only" lang="vi">(chỗ trống)</span></>}
      </span>
      {!fill && hint && <span className="bq-hint">{hint}</span>}
      {rest}
    </span>
  )
}

export default function BlankQuiz<T extends BlankItem>({
  items, title, canHear, filled, ask, feedback, extra, missedNote, doneTitle, backLabel = 'Quay lại', onFinish, onAgain, onBack,
}: Props<T>) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const optsRef = useRef<HTMLDivElement>(null)
  const againRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const f = items[i]

  useEffect(() => {
    if (picked != null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  useEffect(() => {
    if (done) againRef.current?.focus({ preventScroll: true })
  }, [done])

  // Câu mới: focus vào phương án đầu (nút "Câu tiếp" vừa biến mất)
  useEffect(() => {
    if (!done) optsRef.current?.focus({ preventScroll: true })
  }, [i, done])

  const choose = (opt: string) => {
    if (picked != null || !f) return
    setPicked(opt)
    // Ghi kết quả ngay ở câu cuối, để thoát ở màn kết quả vẫn được tính lượt
    const all = [...results, opt === f.answer]
    setResults(all)
    if (all.length === items.length) onFinish(all, Math.round((all.filter(Boolean).length / items.length) * 100))
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
    const score = results.filter(Boolean).length
    const pct = Math.round((score / items.length) * 100)
    const good = pct >= MASTERY
    const missed = items.filter((_, k) => results[k] === false)
    return (
      <div className="hg-result bq-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{items.length} câu đúng</span>
        </div>
        <h3>{doneTitle(good)}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những câu cần xem lại</div>
            {missed.map((m) => (
              <button
                key={m.id}
                className="hg-wrong-row bq-wrong-row"
                onClick={canHear ? () => speakEN(filled(m), 0.85) : undefined}
                aria-label={canHear ? `Nghe lại: ${filled(m)}` : undefined}
              >
                {canHear ? <Icon name="volume" size={14} /> : <span />}
                <span className="bq-wrong-a">
                  <span lang="en">{filled(m)}</span>
                  <small>{missedNote(m)}</small>
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="hg-actions">
          <button ref={againRef} className="btn-primary" onClick={onAgain}><Icon name="refresh" size={15} /> Làm lượt mới</button>
          <button className="btn-ghost" onClick={onBack}><Icon name="arrow-left" size={15} /> {backLabel}</button>
        </div>
      </div>
    )
  }

  const correct = picked != null && picked === f.answer
  const score = results.filter(Boolean).length

  return (
    <div className="hg-quiz bq-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{items.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>

      <div className="hg-q bq-q">
        <p className="hg-ask">{ask(f)}</p>
        <div className="bq-frame">
          <Sentence f={f} fill={picked ?? undefined} state={picked != null ? (correct ? 'ok' : 'bad') : undefined} />
        </div>
        <div className="bq-vi">{f.vi}</div>
      </div>

      <div className="quiz-options bq-options" role="group" aria-label="Đáp án" tabIndex={-1} ref={optsRef}>
        {f.shuffled.map((opt, k) => {
          const cls = picked != null ? (opt === f.answer ? ' correct' : opt === picked ? ' wrong' : '') : ''
          return (
            <button key={opt} className={'quiz-opt bq-opt' + cls} disabled={picked != null} onClick={() => choose(opt)}>
              <span className="hg-key">{k + 1}</span>
              <span className="bq-opt-main" lang="en">{opt}</span>
            </button>
          )
        })}
      </div>

      {picked != null && (
        <div className={'hg-feedback bq-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="bq-fb-body">
            <p>
              <b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b> {feedback(f)}
            </p>
            {extra?.(f)}
            <p className="bq-fb-say">
              <span lang="en">{filled(f)}</span>
              {canHear && (
                <button className="bq-icon-btn" onClick={() => speakEN(filled(f), 0.85)} aria-label="Nghe cả câu">
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
