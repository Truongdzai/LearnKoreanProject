import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { useRevealTop } from '../hangul/useRevealTop'
import KoText from './KoText'
import { krNum, type NQuestion } from './drills'
import { romanizeNum } from './numerals'
import { MASTERY } from './progress'

interface Props {
  questions: NQuestion[]
  title: string
  best?: number
  canHear: boolean
  showRom: boolean
  onFinish: (pct: number) => void
  onAgain: () => void
  onBack: () => void
}

interface Miss {
  q: NQuestion
  picked: string
}

const pad2 = (n: number) => String(n).padStart(2, '0')

// Nhãn ngắn của đề để liệt kê lại ở màn kết quả.
function promptLabel(q: NQuestion): string {
  const v = q.visual
  if (v.type === 'price') return `${krNum(v.n)}원`
  if (v.type === 'count') return `${v.emoji} × ${v.n}`
  if (v.type === 'clock') return `${v.h}:${pad2(v.m)}`
  if (v.type === 'date') return `${v.day}/${v.month}`
  if (v.type === 'age') return `${v.n} tuổi`
  if (v.type === 'phone') return v.digits
  return q.shown ?? q.answer
}

function digitWhy(typed: string, answer: string): string {
  if (!typed) return 'Bạn chưa gõ chữ số nào.'
  if (typed.replace(/0+$/, '') === answer.replace(/0+$/, '')) {
    return 'Đúng các chữ số đầu nhưng sai số chữ số 0 — nhớ 만 = 4 số 0, 십만 = 5, 백만 = 6.'
  }
  return `Bạn gõ ${krNum(Number(typed)) || typed}.`
}

export default function NumberQuiz({ questions, title, best, canHear, showRom, onFinish, onAgain, onBack }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState<Miss[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const q = questions[i]
  const isDigits = q?.input === 'digits'

  useEffect(() => {
    if (!q || done) return
    if (q.input === 'digits') {
      inputRef.current?.focus({ preventScroll: true })
      const t = window.setTimeout(() => speakKO(q.say, 0.85), 300)
      return () => window.clearTimeout(t)
    }
  }, [q?.id, done])

  const settle = (value: string, ok: boolean) => {
    setPicked(value)
    if (ok) setScore((s) => s + 1)
    else setMisses((m) => [...m, { q, picked: value }])
    if (canHear && q.input === 'choice') speakKO(q.say, 0.85)
  }

  // Chuyển focus sau khi nút "Câu tiếp" đã render, để Enter đi tiếp được ngay.
  useEffect(() => {
    if (picked != null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  const choose = (opt: string) => {
    if (picked || !q) return
    settle(opt, opt === q.answer)
  }

  const submitTyped = () => {
    if (picked || !q) return
    const digits = typed.replace(/\D/g, '')
    if (!digits) return
    settle(digits, digits === q.answer)
  }

  const next = () => {
    if (i + 1 >= questions.length) {
      setDone(true)
      onFinish(Math.round((score / questions.length) * 100))
      return
    }
    setPicked(null)
    setTyped('')
    setI((x) => x + 1)
  }

  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const n = Number(e.key)
      if (!picked && q?.input === 'choice' && n >= 1 && n <= q.options.length) {
        e.preventDefault()
        choose(q.options[n - 1].text)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!questions.length) return null

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const good = pct >= MASTERY
    return (
      <div className="hg-result kn-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{questions.length} câu đúng</span>
        </div>
        <h3>{good ? 'Vững rồi — đổi chế độ hoặc làm thêm một lượt' : 'Xong một lượt — xem lại các câu sai bên dưới'}</h3>
        {best != null && <p className="hg-note">Tốt nhất ở chế độ này: {Math.max(best, pct)}%</p>}
        {misses.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những câu cần xem lại</div>
            {misses.map((m) => (
              <button
                key={m.q.id}
                className="hg-wrong-row kn-wrong-row"
                onClick={() => speakKO(m.q.say, 0.8)}
                aria-label={canHear ? `Nghe lại: ${m.q.say}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span className="kn-wrong-q">{promptLabel(m.q)}</span>
                <span className="kn-wrong-a">
                  <span lang="ko">{m.q.say}</span>
                  {showRom && <small>{romanizeNum(m.q.say)}</small>}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="hg-actions">
          <button className="btn-primary" onClick={onAgain}><Icon name="refresh" size={15} /> Làm lượt mới</button>
          <button className="btn-ghost" onClick={onBack}><Icon name="arrow-left" size={15} /> Chọn chế độ khác</button>
        </div>
      </div>
    )
  }

  const correct = picked != null && picked === q.answer
  const pickedWhy = picked && !correct
    ? isDigits ? digitWhy(picked, q.answer) : q.options.find((o) => o.text === picked)?.why
    : undefined
  // Câu hỏi chọn bảng giá hoặc gõ số: đáp án là chữ số, nên ghi thêm cách đọc tiếng Hàn.
  const answerShown = isDigits ? q.shown ?? q.answer : q.answer

  return (
    <div className="hg-quiz kn-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{questions.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / questions.length) * 100}%` }} /></div>

      <div className="hg-q kn-q">
        <p className="hg-ask">{q.ask}</p>
        <Prompt q={q} canHear={canHear} showRom={showRom} />
      </div>

      {isDigits ? (
        <form className="kn-type" onSubmit={(e) => { e.preventDefault(); submitTyped() }}>
          <input
            ref={inputRef}
            className="hg-input kn-digits"
            inputMode="numeric"
            autoComplete="off"
            value={typed}
            disabled={!!picked}
            onChange={(e) => setTyped(e.target.value.replace(/[^\d.,\s-]/g, ''))}
            placeholder="Gõ chữ số, ví dụ 35000"
            aria-label="Các chữ số bạn nghe được"
          />
          <button type="submit" className="btn-primary" disabled={!!picked || !/\d/.test(typed)}>Kiểm tra</button>
        </form>
      ) : (
        <div className="quiz-options kn-options" role="group" aria-label="Đáp án">
          {q.options.map((opt, k) => {
            const cls = picked ? (opt.text === q.answer ? ' correct' : opt.text === picked ? ' wrong' : '') : ''
            return (
              <button
                key={opt.text}
                className={'quiz-opt kn-opt' + (q.koOptions ? ' ko' : ' num') + cls}
                disabled={!!picked}
                onClick={() => choose(opt.text)}
              >
                <span className="hg-key">{k + 1}</span>
                <span className="kn-opt-body">
                  <span className="kn-opt-main" lang={q.koOptions ? 'ko' : undefined}>
                    {q.koOptions ? opt.text : <KoText text={opt.text} />}
                  </span>
                  {q.koOptions && showRom && <small className="kn-opt-rom">{romanizeNum(opt.text)}</small>}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {picked != null && (
        <div className={'hg-feedback kn-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="kn-fb-body">
            <p>
              <b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b>
              {pickedWhy && <> <KoText text={pickedWhy} /></>}
            </p>
            <p className="kn-fb-answer">
              {(!correct || answerShown !== q.say) && <span className="kn-fb-label">Đáp án:</span>}
              {answerShown !== q.say && <><KoText text={answerShown} /> =</>}
              <span lang="ko" className="kn-fb-ko">{q.say}</span>
              {showRom && <span className="kn-fb-rom">{romanizeNum(q.say)}</span>}
              {canHear && (
                <button className="kn-icon-btn" onClick={() => speakKO(q.say, 0.8)} aria-label="Nghe cách đọc">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
            <p className="kn-fb-note"><KoText text={q.note} /></p>
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function Prompt({ q, canHear, showRom }: { q: NQuestion; canHear: boolean; showRom: boolean }) {
  const v = q.visual
  if (v.type === 'listen') {
    return (
      <div className="kn-listen">
        <button className="hg-listen" onClick={() => speakKO(q.say, 0.85)} aria-label="Nghe lại">
          <Icon name="volume" size={34} />
          <span>Bấm để nghe lại</span>
        </button>
        <button className="btn-ghost sm" onClick={() => speakKO(q.say, 0.6)}>Nghe chậm</button>
      </div>
    )
  }
  if (v.type === 'price') {
    return (
      <div className="kn-tag">
        <span className="kn-tag-emoji" aria-hidden="true">{v.emoji}</span>
        <span className="kn-tag-name">{v.label}</span>
        <b className="kn-tag-price">{krNum(v.n)}<span lang="ko">원</span></b>
      </div>
    )
  }
  if (v.type === 'reading') {
    return (
      <div className="kn-said">
        <div className="kn-reading" lang="ko">{v.text}</div>
        {showRom && <div className="kn-rom">{romanizeNum(v.text)}</div>}
        {canHear && (
          <button className="btn-ghost sm" onClick={() => speakKO(v.text, 0.85)}><Icon name="volume" size={13} /> Nghe</button>
        )}
      </div>
    )
  }
  if (v.type === 'count') {
    return (
      <div className="kn-count">
        <div className="kn-items" role="img" aria-label={`${v.n} ${v.nounVi}`}>
          {Array.from({ length: v.n }, (_, k) => <span key={k} aria-hidden="true">{v.emoji}</span>)}
        </div>
        <div className="kn-noun"><span lang="ko">{v.noun}</span> · {v.nounVi}</div>
      </div>
    )
  }
  if (v.type === 'clock') {
    return <div className="kn-clock" role="img" aria-label={`${v.h} giờ ${v.m} phút`}>{v.h}:{pad2(v.m)}</div>
  }
  if (v.type === 'date') {
    return (
      <div className="kn-cal" role="img" aria-label={`Ngày ${v.day} tháng ${v.month}`}>
        <span>Tháng {v.month}</span>
        <b>{v.day}</b>
      </div>
    )
  }
  if (v.type === 'age') {
    return (
      <div className="kn-age">
        <span aria-hidden="true">🎂</span> <b>{v.n}</b> tuổi
      </div>
    )
  }
  return (
    <div className="kn-phone">
      <span aria-hidden="true">📱</span> <b>{v.digits}</b>
    </div>
  )
}
