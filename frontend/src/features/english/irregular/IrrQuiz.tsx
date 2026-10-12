import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import type { IrregularVerb } from '@/data/english/irregularVerbs'
import { useRevealTop } from '@/features/korean/hangul/useRevealTop'
import { explain, formsLine, judgeTyped, makeQuestion, sayForms, type ModeId } from './verbs'
import { MASTERY, type Answer } from './progress'

interface Props {
  verbs: IrregularVerb[]
  mode: ModeId
  title: string
  canHear: boolean
  onFinish: (answers: Answer[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

interface Typed {
  v2: string
  v3: string
  ok2: boolean
  ok3: boolean
}

export default function IrrQuiz({ verbs, mode, title, canHear, onFinish, onAgain, onBack }: Props) {
  const questions = useMemo(() => (mode === 'type' ? [] : verbs.map((v) => makeQuestion(v, mode))), [verbs, mode])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState<Typed | null>(null)
  const [in2, setIn2] = useState('')
  const [in3, setIn3] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [done, setDone] = useState(false)
  const [imeWarn, setImeWarn] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const firstInput = useRef<HTMLInputElement>(null)
  const secondInput = useRef<HTMLInputElement>(null)
  const optsRef = useRef<HTMLDivElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const verb = verbs[i]
  const q = questions[i]
  const checked = mode === 'type' ? typed != null : picked != null

  useEffect(() => {
    if (checked) nextRef.current?.focus({ preventScroll: true })
  }, [checked])

  // Câu mới: con trỏ vào ô gõ V2, hoặc phương án đầu (nút "Câu tiếp" vừa biến mất)
  useEffect(() => {
    if (done) return
    if (mode === 'type') firstInput.current?.focus({ preventScroll: true })
    else optsRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
  }, [i, mode, done])

  const say = () => { if (canHear && verb) speakEN(sayForms(verb), 0.85) }

  // Ghi kết quả ngay khi trả lời xong câu cuối, để thoát giữa chừng ở màn kết quả vẫn được tính lượt
  const record = (a: Answer) => {
    const all = [...answers, a]
    setAnswers(all)
    if (all.length === verbs.length) onFinish(all, Math.round((all.filter((x) => x.ok).length / verbs.length) * 100))
  }

  const choose = (opt: string) => {
    if (picked != null || !q) return
    setPicked(opt)
    record({ v1: q.verb.v1, ok: opt === q.answer })
    say()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (typed || !verb || !in2.trim() || !in3.trim()) return
    // Bộ gõ tiếng Việt đang bật (took → tôk): nhắc tắt, không tính lượt này
    if (/[^\x00-\x7F’]/.test(in2 + in3)) {
      setImeWarn(true)
      return
    }
    setImeWarn(false)
    const ok2 = judgeTyped(verb, 'v2', in2)
    const ok3 = judgeTyped(verb, 'v3', in3)
    setTyped({ v2: in2.trim(), v3: in3.trim(), ok2, ok3 })
    record({ v1: verb.v1, ok: ok2 && ok3 })
    say()
  }

  const next = () => {
    if (i + 1 >= verbs.length) {
      setDone(true)
      return
    }
    setPicked(null)
    setTyped(null)
    setImeWarn(false)
    setIn2('')
    setIn3('')
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

  if (!verbs.length) return null

  if (done) {
    const score = answers.filter((a) => a.ok).length
    const pct = Math.round((score / verbs.length) * 100)
    const good = pct >= MASTERY
    const missed = verbs.filter((_, k) => answers[k] && !answers[k].ok)
    return (
      <div className="hg-result ei-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{verbs.length} {mode === 'type' ? 'từ gõ đúng cả hai dạng' : 'câu đúng'}</span>
        </div>
        <h3>{good ? 'Vững rồi — thử chế độ khác hoặc bộ từ lớn hơn' : 'Xong một lượt — đọc to ba dạng của các từ sai'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những từ cần xem lại</div>
            {missed.map((m) => (
              <button
                key={m.v1}
                className="hg-wrong-row ei-wrong-row"
                onClick={canHear ? () => speakEN(sayForms(m), 0.8) : undefined}
                aria-label={canHear ? `Nghe lại: ${formsLine(m)}` : undefined}
              >
                {canHear ? <Icon name="volume" size={14} /> : <span />}
                <span className="ei-wrong-a">
                  <span lang="en">{formsLine(m)}</span>
                  <small>{m.vi}</small>
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

  const score = answers.filter((a) => a.ok).length
  const correct = mode === 'type' ? !!typed && typed.ok2 && typed.ok3 : picked != null && picked === q?.answer
  const kindLabel = mode === 'v3' ? 'quá khứ phân từ (V3)' : 'quá khứ đơn (V2)'

  return (
    <div className="hg-quiz ei-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{verbs.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / verbs.length) * 100}%` }} /></div>

      <div className="hg-q ei-q">
        <p className="hg-ask">
          {mode === 'type' ? 'Gõ dạng quá khứ (V2) và quá khứ phân từ (V3) của:' : `Chọn ${kindLabel} của:`}
        </p>
        <div className="ei-verb" lang="en">{verb.v1}</div>
        <div className="ei-vi">{verb.vi}</div>
        {mode !== 'type' && (
          <div className="ei-frame" lang="en">
            {mode === 'v2' ? 'Yesterday I ' : 'I have '}
            <span className={'ei-blank' + (picked != null ? (correct ? ' ok' : ' bad') : '')}>
              {picked != null ? picked : <><span aria-hidden="true">{' '.repeat(6)}</span><span className="sr-only" lang="vi">(chỗ trống)</span></>}
            </span>
            {' …'}
          </div>
        )}
      </div>

      {mode === 'type' ? (
        <form className="ei-type" onSubmit={submit}>
          <label className={'ei-field' + (typed ? (typed.ok2 ? ' ok' : ' bad') : '')}>
            <span>V2 · quá khứ đơn</span>
            <input
              ref={firstInput}
              value={in2}
              onChange={(e) => setIn2(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !in3.trim()) {
                  e.preventDefault()
                  secondInput.current?.focus()
                }
              }}
              enterKeyHint="next"
              disabled={!!typed}
              lang="en"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              placeholder="vd: went"
            />
          </label>
          <label className={'ei-field' + (typed ? (typed.ok3 ? ' ok' : ' bad') : '')}>
            <span>V3 · quá khứ phân từ</span>
            <input
              ref={secondInput}
              value={in3}
              onChange={(e) => setIn3(e.target.value)}
              disabled={!!typed}
              lang="en"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              placeholder="vd: gone"
            />
          </label>
          {imeWarn && !typed && (
            <p className="ei-ime" role="alert">
              Có dấu tiếng Việt trong ô gõ (vd: took thành tôk) — hãy tắt bộ gõ Telex / VNI rồi gõ lại. Lượt này chưa tính.
            </p>
          )}
          {!typed && (
            <button type="submit" className="btn-primary sm ei-submit" disabled={!in2.trim() || !in3.trim()}>
              Kiểm tra
            </button>
          )}
        </form>
      ) : (
        <div className="quiz-options ei-options" role="group" aria-label="Đáp án" ref={optsRef}>
          {q.options.map((opt, k) => {
            const cls = picked != null ? (opt === q.answer ? ' correct' : opt === picked ? ' wrong' : '') : ''
            return (
              <button key={opt} className={'quiz-opt ei-opt' + cls} disabled={picked != null} onClick={() => choose(opt)}>
                <span className="hg-key">{k + 1}</span>
                <span className="ei-opt-main" lang="en">{opt}</span>
              </button>
            )
          })}
        </div>
      )}

      {checked && (
        <div className={'hg-feedback ei-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="ei-fb-body">
            <p>
              <b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b>{' '}
              {typed && !correct && (
                <>Bạn gõ: <span lang="en" className="ei-yours">{typed.v2} – {typed.v3}</span></>
              )}
              {picked != null && !correct && explain(verb, q.kind, picked)}
            </p>
            {typed && !typed.ok2 && <p className="ei-why">V2: {explain(verb, 'v2', typed.v2)}</p>}
            {typed && !typed.ok3 && <p className="ei-why">V3: {explain(verb, 'v3', typed.v3)}</p>}
            <p className="ei-fb-say">
              <span lang="en">{formsLine(verb)}</span>
              {canHear && (
                <button className="ei-icon-btn" onClick={() => speakEN(sayForms(verb), 0.8)} aria-label="Nghe ba dạng">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
            {verb.note && <p className="ei-note">{verb.note}</p>}
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= verbs.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
