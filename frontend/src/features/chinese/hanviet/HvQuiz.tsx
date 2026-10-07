import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakZH } from '@/core/tts'
import { useRevealTop } from '../../korean/hangul/useRevealTop'
import type { ZItem } from './hanviet'
import { MASTERY } from './progress'

interface Props {
  items: ZItem[]
  title: string
  canHear: boolean
  onFinish: (pct: number) => void
  onAgain: () => void
  onBack: () => void
}

// Đoạn chữ Hán trong lời giải: bọc lang="zh" để đúng phông
function ZhText({ text }: { text: string }) {
  const parts = text.split(/(\p{Script=Han}+)/u)
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} lang="zh">{p}</span> : p))}</>
}

export default function HvQuiz({ items, title, canHear, onFinish, onAgain, onBack }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState<ZItem[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const item = items[i]

  useEffect(() => {
    if (picked != null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  const choose = (opt: string) => {
    if (picked != null || !item) return
    setPicked(opt)
    if (opt === item.answer) setScore((s) => s + 1)
    else setMissed((m) => [...m, item])
    if (canHear) speakZH(item.speak, 0.8)
  }

  const next = () => {
    if (i + 1 >= items.length) {
      setDone(true)
      onFinish(Math.round((score / items.length) * 100))
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
    const pct = Math.round((score / items.length) * 100)
    const good = pct >= MASTERY
    return (
      <div className="hg-result zv-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{score}/{items.length} câu đúng</span>
        </div>
        <h3>{good ? 'Cây cầu đã vững — thử chế độ khác' : 'Xong một lượt — đọc lại các chữ bên dưới'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Những chữ cần xem lại</div>
            {missed.map((m) => (
              <button
                key={m.id}
                className="hg-wrong-row zv-wrong-row"
                onClick={() => speakZH(m.speak, 0.8)}
                aria-label={canHear ? `Nghe lại: ${m.speak}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span><ZhText text={m.reveal} /></span>
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
  const zhOptions = item.mode === 'char'

  return (
    <div className="hg-quiz zv-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{items.length} · đúng {score}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / items.length) * 100}%` }} /></div>

      <div className="hg-q zv-q">
        <p className="hg-ask">
          {item.mode === 'hv' ? 'Âm Hán–Việt của chữ này là gì?' : item.mode === 'char' ? 'Tìm chữ Hán có âm Hán–Việt:' : 'Đọc cả từ theo âm Hán–Việt:'}
        </p>
        {item.mode === 'char' ? (
          <div className="zv-prompt-hv">{item.prompt}</div>
        ) : (
          <div className={'zv-prompt-zh' + (item.mode === 'word' ? ' word' : '')} lang="zh">{item.prompt}</div>
        )}
        <div className="zv-sub"><ZhText text={item.sub} /></div>
      </div>

      <div className="quiz-options zv-options" role="group" aria-label="Đáp án">
        {item.options.map((opt, k) => {
          const cls = picked != null ? (opt === item.answer ? ' correct' : opt === picked ? ' wrong' : '') : ''
          return (
            <button key={opt} className={'quiz-opt zv-opt' + (zhOptions ? ' zh' : '') + cls} disabled={picked != null} onClick={() => choose(opt)}>
              <span className="hg-key">{k + 1}</span>
              <span className="zv-opt-main" lang={zhOptions ? 'zh' : undefined}>{opt}</span>
            </button>
          )
        })}
      </div>

      {picked != null && (
        <div className={'hg-feedback zv-feedback' + (correct ? ' ok' : ' bad')} role="status">
          <div className="zv-fb-body">
            <p><b>{correct ? 'Chính xác!' : 'Chưa đúng.'}</b> <ZhText text={item.reveal} /></p>
          </div>
          {canHear && (
            <button className="zv-icon-btn" onClick={() => speakZH(item.speak, 0.8)} aria-label="Nghe tiếng Trung">
              <Icon name="volume" size={15} />
            </button>
          )}
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= items.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
