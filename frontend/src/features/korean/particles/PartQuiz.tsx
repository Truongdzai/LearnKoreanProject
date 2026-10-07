import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { romanizeLine } from '@/core/utils/romanize'
import { useRevealTop } from '../hangul/useRevealTop'
import KoText from '../numbers/KoText'
import type { PItem } from './particles'
import { MASTERY, type Result } from './progress'

interface Props {
  items: PItem[]
  title: string
  canHear: boolean
  showRom: boolean
  onFinish: (results: Result[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

function Sentence({ ko, fill, state }: { ko: string; fill?: string; state?: 'ok' | 'bad' }) {
  const [a, b] = ko.split('___')
  return (
    <span className="kp-sentence" lang="ko">
      {a}
      <span className={'kp-blank' + (fill ? ' filled' : '') + (state ? ' ' + state : '')}>{fill ?? '   '}</span>
      {b}
    </span>
  )
}

export default function PartQuiz({ items, title, canHear, showRom, onFinish, onAgain, onBack }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const item = items[i]

  useEffect(() => {
    if (picked != null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  const choose = (opt: string) => {
    if (picked != null || !item) return
    const ok = opt === item.answer
    setPicked(opt)
    setResults((r) => [...r, { tag: item.tag, ok }])
    if (canHear) speakKO(item.say, 0.85)
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
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const n = Number(e.key)
      if (picked == null && item && n >= 1 && n <= item.options.length) {
        e.preventDefault()
        choose(item.options[n - 1])
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
      <div className="hg-result kp-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{items.length} câu đúng</span>
        </div>
        <h3>{good ? 'Vững rồi — thử chế độ còn lại hoặc nhóm khác' : 'Xong một lượt — đọc lại các câu sai bên dưới'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những câu cần xem lại</div>
            {missed.map((m) => (
              <button
                key={m.id}
                className="hg-wrong-row kp-wrong-row"
                onClick={() => speakKO(m.say, 0.8)}
                aria-label={canHear ? `Nghe lại: ${m.say}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span className="kp-wrong-a">
                  <span lang="ko">{m.say}</span>
                  <small><KoText text={m.why} /></small>
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

  const correct = picked != null && picked === item.answer
  const score = results.filter((r) => r.ok).length
  const isForm = item.type === 'form'

  return (
    <div className="hg-quiz kp-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{items.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>

      <div className="hg-q kp-q">
        <p className="hg-ask"><KoText text={item.ask} /></p>
        {isForm ? (
          <>
            <div className="kp-noun" lang="ko">{item.ko}</div>
            {showRom && <div className="kp-rom">{romanizeLine(item.ko)}</div>}
          </>
        ) : (
          <>
            <div className="kp-frame">
              <Sentence ko={item.ko} fill={picked != null ? item.answer : undefined} state={picked != null ? (correct ? 'ok' : 'bad') : undefined} />
            </div>
            {showRom && picked != null && <div className="kp-rom">{romanizeLine(item.say)}</div>}
          </>
        )}
        <div className="kp-vi">{item.vi}</div>
      </div>

      <div className={'quiz-options kp-options' + (item.options.length === 3 ? ' three' : '')} role="group" aria-label="Đáp án">
        {item.options.map((opt, k) => {
          const cls = picked != null ? (opt === item.answer ? ' correct' : opt === picked ? ' wrong' : '') : ''
          return (
            <button key={opt} className={'quiz-opt kp-opt' + cls} disabled={picked != null} onClick={() => choose(opt)}>
              <span className="hg-key">{k + 1}</span>
              <span className="kp-opt-main" lang="ko">{opt}</span>
            </button>
          )
        })}
      </div>

      {picked != null && (
        <div className={'hg-feedback kp-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="kp-fb-body">
            <p><b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b> <KoText text={item.why} /></p>
            <p className="kp-fb-say">
              <span lang="ko">{item.say}</span>
              {canHear && (
                <button className="kn-icon-btn" onClick={() => speakKO(item.say, 0.8)} aria-label="Nghe cả câu">
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
