import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { romanizeLine } from '@/core/utils/romanize'
import { useRevealTop } from '../hangul/useRevealTop'
import KoText from '../numbers/KoText'
import { ENDING_BY_ID, CLASS_LABEL, checkAnswer, mistakes, type Check } from './engine'
import type { Item } from './drill'
import { MASTERY, type Answer } from './progress'

export type AnswerMode = 'choice' | 'type'

interface Props {
  items: Item[]
  title: string
  mode: AnswerMode
  canHear: boolean
  showRom: boolean
  onFinish: (answers: Answer[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

interface Result {
  value: string
  check: Check
}

const POS_LABEL = { verb: 'động từ', adj: 'tính từ', noun: 'danh từ' } as const

// Lời giải đã có nhãn nhóm đứng trước thì bỏ để không lặp với thẻ nhóm
function ruleText(item: Item): string {
  const label = CLASS_LABEL[item.lex.cls] + ':'
  return item.conj.rule.startsWith(label) ? item.conj.rule.slice(label.length).trim() : item.conj.rule
}

export default function ConjQuiz({ items, title, mode, canHear, showRom, onFinish, onAgain, onBack }: Props) {
  const [i, setI] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [typed, setTyped] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingSubmit = useRef(false)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const item = items[i]
  const typing = mode === 'type'

  useEffect(() => {
    if (!done && typing) inputRef.current?.focus({ preventScroll: true })
  }, [i, done, typing])

  // Chuyển focus sau khi nút "Câu tiếp" đã render, để Enter đi tiếp được ngay
  useEffect(() => {
    if (result) nextRef.current?.focus({ preventScroll: true })
  }, [result])

  const settle = (value: string, check: Check) => {
    setResult({ value, check })
    setAnswers((a) => [...a, { dict: item.lex.dict, ending: item.ending, ok: check.ok }])
    if (canHear) speakKO(item.conj.form, 0.85)
  }

  const choose = (opt: string) => {
    if (result || !item) return
    const ok = opt === item.conj.form
    settle(opt, ok ? { ok } : { ok, mistake: item.wrong.find((m) => m.form === opt) })
  }

  const submitTyped = () => {
    if (result || !item) return
    const value = inputRef.current?.value ?? typed
    if (!value.trim()) return
    settle(value, checkAnswer(item.conj, mistakes(item.lex, item.ending), value))
  }

  const giveUp = () => {
    if (result || !item) return
    settle('', { ok: false })
  }

  const next = () => {
    if (i + 1 >= items.length) {
      setDone(true)
      const ok = answers.filter((a) => a.ok).length
      onFinish(answers, Math.round((ok / items.length) * 100))
      return
    }
    setResult(null)
    setTyped('')
    setI((x) => x + 1)
  }

  useEffect(() => {
    if (done || typing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const n = Number(e.key)
      if (!result && item && n >= 1 && n <= item.options.length) {
        e.preventDefault()
        choose(item.options[n - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!items.length) return null

  if (done) {
    const score = answers.filter((a) => a.ok).length
    const pct = Math.round((score / items.length) * 100)
    const good = pct >= MASTERY
    const missed = items.filter((_, k) => answers[k] && !answers[k].ok)
    return (
      <div className="hg-result kc-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{items.length} câu đúng</span>
        </div>
        <h3>{good ? 'Vững rồi — thêm đuôi mới hoặc thử nhóm bất quy tắc khác' : 'Xong một lượt — xem lại các dạng sai bên dưới'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những dạng cần xem lại</div>
            {missed.map((m) => (
              <button
                key={m.id}
                className="hg-wrong-row kc-wrong-row"
                onClick={() => speakKO(m.conj.form, 0.8)}
                aria-label={canHear ? `Nghe lại: ${m.conj.form}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span className="kc-wrong-q">
                  <span lang="ko">{m.lex.dict}</span>
                  <small>{ENDING_BY_ID[m.ending].label}</small>
                </span>
                <span className="kc-wrong-a">
                  <span lang="ko">{m.conj.form}</span>
                  <small><KoText text={m.conj.rule} /></small>
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="hg-actions">
          <button className="btn-primary" onClick={onAgain}><Icon name="refresh" size={15} /> Làm lượt mới</button>
          <button className="btn-ghost" onClick={onBack}><Icon name="arrow-left" size={15} /> Đổi lựa chọn</button>
        </div>
      </div>
    )
  }

  const meta = ENDING_BY_ID[item.ending]
  const score = answers.filter((a) => a.ok).length
  const check = result?.check
  const form = item.conj.form

  return (
    <div className="hg-quiz kc-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{items.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>

      <div className="hg-q kc-q">
        <p className="hg-ask">
          Chia sang <b>{meta.label}</b> <span className="kc-short" lang="ko">{meta.short}</span>
        </p>
        <div className="kc-dict" lang="ko">{item.lex.dict}</div>
        {showRom && <div className="kc-rom">{romanizeLine(item.lex.dict)}</div>}
        <div className="kc-vi">{item.lex.vi} · {POS_LABEL[item.lex.pos]}</div>
      </div>

      {typing ? (
        <form className="kc-type" onSubmit={(e) => { e.preventDefault(); submitTyped() }}>
          <div className="kc-type-row">
            <input
              ref={inputRef}
              className="hg-input kc-input"
              lang="ko"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={typed}
              disabled={!!result}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                // Đang ghép chữ Hàn mà bấm Enter: chờ bộ gõ ghép xong âm tiết cuối rồi mới chấm
                if (e.key === 'Enter' && e.nativeEvent.isComposing) {
                  e.preventDefault()
                  pendingSubmit.current = true
                }
              }}
              onCompositionEnd={() => {
                if (!pendingSubmit.current) return
                pendingSubmit.current = false
                window.setTimeout(submitTyped, 0)
              }}
              placeholder="Gõ dạng đã chia, ví dụ 먹어요"
              aria-label={`Dạng ${meta.label} của ${item.lex.dict}`}
            />
            <button type="submit" className="btn-primary" disabled={!!result || !typed.trim()}>Kiểm tra</button>
          </div>
          {!result && (
            <div className="kc-type-help">
              <span>Cần bàn phím tiếng Hàn (<span lang="ko">한국어</span>) trên máy hoặc điện thoại.</span>
              <button type="button" className="btn-ghost sm" onClick={giveUp}>Không biết — xem đáp án</button>
            </div>
          )}
        </form>
      ) : (
        <div className="quiz-options kc-options" role="group" aria-label="Đáp án">
          {item.options.map((opt, k) => {
            const cls = result ? (opt === form ? ' correct' : opt === result.value ? ' wrong' : '') : ''
            return (
              <button key={opt} className={'quiz-opt kc-opt' + cls} disabled={!!result} onClick={() => choose(opt)}>
                <span className="hg-key">{k + 1}</span>
                <span className="kc-opt-body">
                  <span className="kc-opt-main" lang="ko">{opt}</span>
                  {showRom && <small className="kc-opt-rom">{romanizeLine(opt)}</small>}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {result && check && (
        <div className={'hg-feedback kc-feedback' + (check.ok ? ' ok' : ' bad')} role="status">
          <div className="kc-fb-body">
            <p>
              <b>{check.ok ? (check.alt ? 'Cũng đúng!' : 'Chính xác!') : result.value ? 'Chưa đúng.' : 'Đáp án đây.'}</b>{' '}
              {check.ok && check.alt && <>Dạng hay gặp hơn là <span lang="ko">{form}</span>. </>}
              {check.ok && check.spacing && <>Để ý cách viết khoảng trắng: <span lang="ko">{form}</span>. </>}
              {!check.ok && check.mistake && <KoText text={check.mistake.why} />}
              {!check.ok && !check.mistake && result.value && typing && (
                <>Bạn gõ <span lang="ko">{result.value}</span>.</>
              )}
            </p>
            <p className="kc-fb-answer">
              {!check.ok && <span className="kc-fb-label">Đáp án:</span>}
              <span lang="ko" className="kc-fb-ko">{form}</span>
              {showRom && <span className="kc-fb-rom">{romanizeLine(form)}</span>}
              {canHear && (
                <button className="kn-icon-btn" onClick={() => speakKO(form, 0.8)} aria-label="Nghe cách đọc">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
            <p className="kc-fb-rule">
              <span className="kc-tag">{CLASS_LABEL[item.lex.cls]}</span> <KoText text={ruleText(item)} />
            </p>
            {item.conj.note && <p className="kc-fb-note"><KoText text={item.conj.note} /></p>}
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= items.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
