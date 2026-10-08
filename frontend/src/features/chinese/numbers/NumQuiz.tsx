import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakZH } from '@/core/tts'
import { useRevealTop } from '../../korean/hangul/useRevealTop'
import { fmt, type ZQuestion } from './drills'
import { MASTERY } from './progress'
import { ZhText } from './Rules'
import { pinyinOf, yuanLabel } from './zhnum'

interface Props {
  questions: ZQuestion[]
  title: string
  best?: number
  canHear: boolean
  showPy: boolean
  onFinish: (pct: number) => void
  onAgain: () => void
  onBack: () => void
}

interface Miss {
  q: ZQuestion
  picked: string
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function promptLabel(q: ZQuestion): string {
  const v = q.visual
  if (v.type === 'price') return yuanLabel(v.amount)
  if (v.type === 'count') return `${v.emoji} × ${v.n}`
  if (v.type === 'clock') return `${v.h}:${pad2(v.m)}`
  if (v.type === 'date') return `${v.day}/${v.month}`
  if (v.type === 'weekday') return v.vi
  if (v.type === 'year') return `năm ${v.y}`
  if (v.type === 'age') return `${v.n} tuổi`
  if (v.type === 'phone') return v.digits
  return q.shown ?? q.answer
}

function digitWhy(typed: string, answer: string): string {
  if (!typed) return 'Bạn chưa gõ chữ số nào.'
  if (typed.replace(/0+$/, '') === answer.replace(/0+$/, '')) {
    return 'Đúng các chữ số đầu nhưng sai số chữ số 0 — nhớ 万 = 4 số 0, 十万 = 5, 百万 = 6.'
  }
  return `Bạn gõ ${fmt(Number(typed)) || typed}.`
}

export default function NumQuiz({ questions, title, best, canHear, showPy, onFinish, onAgain, onBack }: Props) {
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
      const t = window.setTimeout(() => speakZH(q.say, 0.8), 300)
      return () => window.clearTimeout(t)
    }
  }, [q?.id, done])

  const settle = (value: string, ok: boolean) => {
    setPicked(value)
    if (ok) setScore((s) => s + 1)
    else setMisses((m) => [...m, { q, picked: value }])
    if (canHear && q.input === 'choice') speakZH(q.say, 0.8)
  }

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
      <div className="hg-result zn-result" ref={rootRef}>
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
                className="hg-wrong-row zn-wrong-row"
                onClick={() => speakZH(m.q.say, 0.8)}
                aria-label={canHear ? `Nghe lại: ${m.q.say}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span className="zn-wrong-q">{promptLabel(m.q)}</span>
                <span className="zn-wrong-a">
                  <span lang="zh">{m.q.say}</span>
                  {showPy && <small>{pinyinOf(m.q.say)}</small>}
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
  const answerShown = isDigits ? q.shown ?? q.answer : q.answer

  return (
    <div className="hg-quiz zn-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{questions.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / questions.length) * 100}%` }} /></div>

      <div className="hg-q zn-q">
        <p className="hg-ask">{q.ask}</p>
        <Prompt q={q} canHear={canHear} showPy={showPy} />
      </div>

      {isDigits ? (
        <form className="zn-type" onSubmit={(e) => { e.preventDefault(); submitTyped() }}>
          <input
            ref={inputRef}
            className="hg-input zn-digits"
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
        <div className="quiz-options zn-options" role="group" aria-label="Đáp án">
          {q.options.map((opt, k) => {
            const cls = picked ? (opt.text === q.answer ? ' correct' : opt.text === picked ? ' wrong' : '') : ''
            return (
              <button
                key={opt.text}
                className={'quiz-opt zn-opt' + (q.zhOptions ? ' zh' : ' num') + cls}
                disabled={!!picked}
                onClick={() => choose(opt.text)}
              >
                <span className="hg-key">{k + 1}</span>
                <span className="zn-opt-body">
                  <span className="zn-opt-main" lang={q.zhOptions ? 'zh' : undefined}>{opt.text}</span>
                  {q.zhOptions && showPy && <small className="zn-opt-rom">{pinyinOf(opt.text)}</small>}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {picked != null && (
        <div className={'hg-feedback zn-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="zn-fb-body">
            <p>
              <b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b>
              {pickedWhy && <> <ZhText text={pickedWhy} /></>}
            </p>
            <p className="zn-fb-answer">
              {(!correct || answerShown !== q.say) && <span className="zn-fb-label">Đáp án:</span>}
              {answerShown !== q.say && <>{answerShown} =</>}
              <span lang="zh" className="zn-fb-zh">{q.say}</span>
              {showPy && <span className="zn-fb-rom">{pinyinOf(q.say)}</span>}
              {canHear && (
                <button className="zn-icon-btn" onClick={() => speakZH(q.say, 0.8)} aria-label="Nghe cách đọc">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
            <p className="zn-fb-note"><ZhText text={q.note} /></p>
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function Prompt({ q, canHear, showPy }: { q: ZQuestion; canHear: boolean; showPy: boolean }) {
  const v = q.visual
  if (v.type === 'listen') {
    return (
      <div className="zn-listen">
        <button className="hg-listen" onClick={() => speakZH(q.say, 0.8)} aria-label="Nghe lại">
          <Icon name="volume" size={34} />
          <span>Bấm để nghe lại</span>
        </button>
        <button className="btn-ghost sm" onClick={() => speakZH(q.say, 0.55)}>Nghe chậm</button>
      </div>
    )
  }
  if (v.type === 'price') {
    return (
      <div className="zn-tag">
        <span className="zn-tag-emoji" aria-hidden="true">{v.emoji}</span>
        <span className="zn-tag-name">{v.label}</span>
        <b className="zn-tag-price">{yuanLabel(v.amount)}</b>
      </div>
    )
  }
  if (v.type === 'reading') {
    return (
      <div className="zn-said">
        <div className="zn-reading" lang="zh">{v.text}</div>
        {showPy && <div className="zn-rom">{pinyinOf(v.text)}</div>}
        {canHear && (
          <button className="btn-ghost sm" onClick={() => speakZH(v.text, 0.8)}><Icon name="volume" size={13} /> Nghe</button>
        )}
      </div>
    )
  }
  if (v.type === 'count') {
    return (
      <div className="zn-count">
        <div className="zn-items" role="img" aria-label={`${v.n} ${v.nounVi}`}>
          {Array.from({ length: v.n }, (_, k) => <span key={k} aria-hidden="true">{v.emoji}</span>)}
        </div>
        <div className="zn-noun"><span lang="zh">{v.noun}</span> · {v.nounVi}</div>
      </div>
    )
  }
  if (v.type === 'clock') {
    return <div className="zn-clock" role="img" aria-label={`${v.h} giờ ${v.m} phút`}>{v.h}:{pad2(v.m)}</div>
  }
  if (v.type === 'date') {
    return (
      <div className="zn-cal" role="img" aria-label={`Ngày ${v.day} tháng ${v.month}`}>
        <span>Tháng {v.month}</span>
        <b>{v.day}</b>
      </div>
    )
  }
  if (v.type === 'weekday') return <div className="zn-week">{v.vi}</div>
  if (v.type === 'year') return <div className="zn-year">{v.y}</div>
  if (v.type === 'age') {
    return (
      <div className="zn-age">
        <span aria-hidden="true">🎂</span> <b>{v.n}</b> tuổi
      </div>
    )
  }
  return (
    <div className="zn-phone">
      <span aria-hidden="true">📱</span> <b>{v.digits}</b>
    </div>
  )
}
