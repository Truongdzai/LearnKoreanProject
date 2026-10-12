import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import { useRevealTop } from '@/features/korean/hangul/useRevealTop'
import { catOf, whyWrong, type ModeId, type Question } from './drills'
import { MASTERY, type Result } from './progress'

interface Props {
  questions: Question[]
  mode: ModeId
  title: string
  canHear: boolean
  onFinish: (results: Result[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

const PLACEHOLDER: Record<string, string> = {
  teen: 'vd: 14', big: 'vd: 15000', price: 'vd: 5.20', year: 'vd: 1999', time: 'vd: 7:45 hoặc 745',
}

// Giá tiền cần dấu thập phân; còn lại chỉ cần chữ số (giờ gõ liền 745 được)
const KEYPAD: Record<string, 'decimal' | 'numeric'> = { price: 'decimal' }

export default function EnNumQuiz({ questions, mode, title, canHear, onFinish, onAgain, onBack }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [showText, setShowText] = useState(false)
  // Có giọng đọc lúc câu bắt đầu hay không — giữ nguyên trong suốt câu đó (giọng tải xong giữa chừng không làm mất chữ đang hiện)
  const [qHear, setQHear] = useState(canHear)
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optsRef = useRef<HTMLDivElement>(null)
  const againRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const q = questions[i]
  const item = q?.item
  const audio = mode !== 'read'

  useEffect(() => {
    if (picked != null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  useEffect(() => {
    if (done) againRef.current?.focus({ preventScroll: true })
  }, [done])

  // Câu mới ở chế độ nghe: tự đọc một lần, đưa con trỏ vào ô gõ
  useEffect(() => {
    if (done || !item) return
    setShowText(false)
    setQHear(canHear)
    if (audio && canHear) speakEN(item.say, 0.9)
    if (mode === 'type') inputRef.current?.focus({ preventScroll: true })
    else optsRef.current?.focus({ preventScroll: true })
  }, [i, done])

  const ok = (v: string) => (mode === 'type' ? item.accept(v) : v === q.answer)

  const choose = (v: string) => {
    if (picked != null || !item) return
    setPicked(v)
    // Ghi kết quả ngay ở câu cuối, để thoát ở màn kết quả vẫn được tính lượt
    const all = [...results, { cat: item.cat, ok: ok(v) }]
    setResults(all)
    if (all.length === questions.length) onFinish(all, Math.round((all.filter((r) => r.ok).length / questions.length) * 100))
    if (mode === 'read' && canHear) speakEN(item.say, 0.9)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!typed.trim()) return
    choose(typed.trim())
  }

  const next = () => {
    if (i + 1 >= questions.length) {
      setDone(true)
      return
    }
    setPicked(null)
    setTyped('')
    setI((x) => x + 1)
  }

  useEffect(() => {
    if (done || mode === 'type') return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const t = e.target as HTMLInputElement | null
      if (t?.tagName === 'TEXTAREA' || (t?.tagName === 'INPUT' && !['checkbox', 'radio', 'button'].includes(t.type))) return
      const n = Number(e.key)
      if (picked == null && q && n >= 1 && n <= q.options.length) {
        e.preventDefault()
        choose(q.options[n - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!questions.length) return null

  if (done) {
    const score = results.filter((r) => r.ok).length
    const pct = Math.round((score / questions.length) * 100)
    const good = pct >= MASTERY
    const missed = questions.filter((_, k) => results[k] && !results[k].ok)
    return (
      <div className="hg-result enn-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{questions.length} câu đúng</span>
        </div>
        <h3>{good ? 'Vững rồi — thử chế độ khác hoặc thêm nhóm số' : 'Xong một lượt — nghe và đọc to lại các số bên dưới'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những số cần xem lại</div>
            {missed.map((m, k) => (
              <button
                key={k}
                className="hg-wrong-row enn-wrong-row"
                onClick={canHear ? () => speakEN(m.item.say, 0.85) : undefined}
                aria-label={canHear ? `Nghe lại: ${m.item.say}` : undefined}
              >
                {canHear ? <Icon name="volume" size={14} /> : <span />}
                <span className="enn-wrong-q">{m.item.value}</span>
                <span className="enn-wrong-a" lang="en">{m.item.say}</span>
              </button>
            ))}
          </div>
        )}
        <div className="hg-actions">
          <button ref={againRef} className="btn-primary" onClick={onAgain}><Icon name="refresh" size={15} /> Làm lượt mới</button>
          <button className="btn-ghost" onClick={onBack}><Icon name="arrow-left" size={15} /> Chọn chế độ khác</button>
        </div>
      </div>
    )
  }

  const score = results.filter((r) => r.ok).length
  const answered = picked != null
  const correct = answered && ok(picked)
  const reveal = !audio || !qHear || showText || answered
  const why = answered && !correct && mode !== 'type' ? whyWrong(item, picked, mode) : ''

  return (
    <div className="hg-quiz enn-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{questions.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / questions.length) * 100}%` }} /></div>

      <div className="hg-q enn-q">
        <p className="hg-ask">
          <span className="enn-cat">{catOf(item.cat).label}</span>
          {mode === 'read' ? 'Chọn cách đọc đúng:' : mode === 'listen' ? (canHear ? 'Nghe rồi chọn con số:' : 'Đọc rồi chọn con số:') : (canHear ? 'Nghe rồi gõ con số:' : 'Đọc rồi gõ con số:')}
        </p>
        {mode === 'read' ? (
          <div className="enn-value">{item.value}</div>
        ) : (
          <>
            {canHear && (
              <div className="enn-listen">
                <button type="button" className="btn-ghost" onClick={() => speakEN(item.say, 0.9)}>
                  <Icon name="volume" size={16} /> Nghe lại
                </button>
                <button type="button" className="btn-ghost" onClick={() => speakEN(item.say, 0.6)}>Nghe chậm</button>
                {!reveal && (
                  <button type="button" className="btn-ghost sm" onClick={() => setShowText(true)}>
                    <Icon name="eye" size={14} /> Hiện chữ
                  </button>
                )}
              </div>
            )}
            {reveal && <div className="enn-say" lang="en">{item.say}</div>}
          </>
        )}
      </div>

      {mode === 'type' ? (
        <form className="enn-type" onSubmit={submit}>
          <input
            ref={inputRef}
            className={'enn-input' + (answered ? (correct ? ' ok' : ' bad') : '')}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={answered}
            inputMode={KEYPAD[item.cat] ?? 'numeric'}
            autoComplete="off"
            spellCheck={false}
            placeholder={PLACEHOLDER[item.cat] ?? ''}
            aria-label="Con số bạn nghe được"
          />
          {!answered && <button type="submit" className="btn-primary sm" disabled={!typed.trim()}>Kiểm tra</button>}
        </form>
      ) : (
        <div className={'quiz-options enn-options' + (mode === 'read' ? ' words' : '')} role="group" aria-label="Đáp án" tabIndex={-1} ref={optsRef}>
          {q.options.map((opt, k) => {
            const cls = answered ? (opt === q.answer ? ' correct' : opt === picked ? ' wrong' : '') : ''
            return (
              <button key={opt} className={'quiz-opt enn-opt' + cls} disabled={answered} onClick={() => choose(opt)}>
                <span className="hg-key">{k + 1}</span>
                <span className="enn-opt-main" lang={mode === 'read' ? 'en' : undefined}>{opt}</span>
              </button>
            )
          })}
        </div>
      )}

      {answered && (
        <div className={'hg-feedback enn-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="enn-fb-body">
            <p>
              <b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b>{' '}
              {why}
              {mode === 'type' && !correct && <>Bạn gõ <b className="enn-yours">{picked}</b>, đáp án là <b>{item.value}</b>.</>}
            </p>
            <p className="enn-fb-say">
              <span className="enn-fb-val">{item.value}</span>
              <span lang="en">= {item.say}</span>
              {canHear && (
                <button className="enn-icon-btn" onClick={() => speakEN(item.say, 0.85)} aria-label="Nghe lại">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
            {item.alt && <p className="enn-note">Cũng nói: <span lang="en">{item.alt}</span></p>}
            {!correct && <p className="enn-note">{catOf(item.cat).tip}</p>}
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
