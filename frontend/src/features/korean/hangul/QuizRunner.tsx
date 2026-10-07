import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import type { HQuestion } from './quiz'
import { useRevealTop } from './useRevealTop'

interface Props {
  questions: HQuestion[]
  title: string
  pass?: number
  onAnswer: (item: string, ok: boolean) => void
  onFinish: (pct: number) => void
  onAgain: () => void
  onBack: () => void
  // Mặc định là tiếng Hàn; Phòng Pinyin truyền speakZH và 'zh'
  speak?: (text: string, rate?: number) => void
  lang?: string
}

export default function QuizRunner({ questions, title, pass, onAnswer, onFinish, onAgain, onBack, speak = speakKO, lang = 'ko' }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState<HQuestion[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const q = questions[i]

  useEffect(() => {
    if (q?.audio && (q.kind === 'hear' || q.kind === 'tailHear' || q.kind === 'wordHear')) {
      const t = window.setTimeout(() => speak(q.audio!, 0.8), 250)
      return () => window.clearTimeout(t)
    }
  }, [q?.id])

  const choose = (opt: string) => {
    if (picked || !q) return
    const ok = opt === q.answer
    setPicked(opt)
    if (ok) setScore((s) => s + 1)
    else setWrong((w) => [...w, q])
    onAnswer(q.item, ok)
    if (q.audio) speak(q.audio, 0.85)
    window.setTimeout(() => nextRef.current?.focus(), 0)
  }

  const next = () => {
    if (i + 1 >= questions.length) {
      setDone(true)
      onFinish(Math.round((score / questions.length) * 100))
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
      if (!picked && n >= 1 && n <= (q?.options.length ?? 0)) {
        e.preventDefault()
        choose(q.options[n - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!questions.length) return null

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const ok = pass == null || pct >= pass
    return (
      <div className="hg-result" ref={rootRef}>
        <div className={'hg-score' + (ok ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{questions.length} câu đúng</span>
        </div>
        <h3>{pass == null ? 'Xong một lượt luyện' : ok ? 'Đạt rồi — sang bài tiếp được!' : `Chưa đạt ${pass}% — làm lại một lượt nhé`}</h3>
        {wrong.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những câu cần xem lại</div>
            {wrong.map((w) => (
              <button key={w.id} className="hg-wrong-row" onClick={() => w.audio && speak(w.audio, 0.8)}>
                <Icon name="volume" size={14} /> {w.explain}
              </button>
            ))}
          </div>
        )}
        <div className="hg-actions">
          <button className="btn-primary" onClick={onAgain}><Icon name="refresh" size={15} /> Làm lượt mới</button>
          <button className="btn-ghost" onClick={onBack}><Icon name="arrow-left" size={15} /> Quay lại</button>
        </div>
      </div>
    )
  }

  const hear = q.kind === 'hear' || q.kind === 'tailHear' || q.kind === 'wordHear'

  return (
    <div className="hg-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{questions.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / questions.length) * 100}%` }} /></div>

      <div className="hg-q">
        <p className="hg-ask">{q.ask}</p>
        {hear ? (
          <button className="hg-listen" onClick={() => speak(q.audio!, 0.8)} aria-label="Nghe lại">
            <Icon name="volume" size={34} />
            <span>Bấm để nghe lại</span>
          </button>
        ) : (
          <div className={'hg-prompt' + (q.kind === 'write' ? ' latin' : '')} lang={q.kind === 'write' ? undefined : lang}>
            {q.prompt}
          </div>
        )}
      </div>

      <div className="quiz-options hg-options" role="group" aria-label="Đáp án">
        {q.options.map((opt, k) => {
          const cls = picked ? (opt === q.answer ? ' correct' : opt === picked ? ' wrong' : '') : ''
          return (
            <button
              key={opt}
              className={'quiz-opt' + (q.hangulOptions ? ' hg-ko' : ' hg-rom') + cls}
              disabled={!!picked}
              onClick={() => choose(opt)}
              lang={q.hangulOptions ? lang : undefined}
            >
              <span className="hg-key">{k + 1}</span>{opt}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className={'hg-feedback' + (picked === q.answer ? ' ok' : ' bad')} role="status">
          <b>{picked === q.answer ? 'Chính xác!' : 'Chưa đúng.'}</b> {q.explain}
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
