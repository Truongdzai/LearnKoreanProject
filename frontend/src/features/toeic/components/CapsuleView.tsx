import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { GRAMMAR_CAPSULES, type GrammarCapsule } from '@/data/toeicCore'
import { speakScript, stopSpeak } from '../tts'

interface ListProps {
  scores: Record<string, number>
  onOpen: (id: string) => void
}

export function CapsuleList({ scores, onOpen }: ListProps) {
  return (
    <div className="capsule-grid">
      {GRAMMAR_CAPSULES.map((c, i) => {
        const best = scores[c.id]
        const passed = (best ?? 0) >= 75
        return (
          <button key={c.id} className={'capsule-card' + (passed ? ' done' : '')} onClick={() => onOpen(c.id)}>
            <div className="cap-head">
              <span className="cap-num">{i + 1}</span>
              <span className="cap-tag">{c.tag}</span>
              {passed && <Icon name="check-circle" size={15} />}
            </div>
            <b>{c.title}</b>
            <small>{best != null ? `Luyện tốt nhất: ${best}%` : 'Chưa luyện'}</small>
          </button>
        )
      })}
    </div>
  )
}

interface ViewProps {
  capsule: GrammarCapsule
  best?: number
  onDrillDone: (pct: number) => void
  onBack: () => void
}

export function CapsuleView({ capsule, best, onDrillDone, onBack }: ViewProps) {
  const [i, setI] = useState(-1)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const drill = capsule.drill
  const q = i >= 0 ? drill[i] : null

  const startDrill = () => { setI(0); setPicked(null); setScore(0); setFinished(false) }

  const choose = (oi: number) => {
    if (picked != null || !q) return
    setPicked(oi)
    if (oi === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (i + 1 >= drill.length) {
      const finalScore = score
      const pct = Math.round((finalScore / drill.length) * 100)
      setFinished(true)
      onDrillDone(pct)
    } else {
      setI((x) => x + 1)
      setPicked(null)
    }
  }

  const pct = Math.round((score / drill.length) * 100)

  return (
    <div className="capsule-view">
      <div className="cap-view-head">
        <button className="btn-ghost sm" onClick={() => { stopSpeak(); onBack() }}>
          <Icon name="arrow-left" size={14} /> Danh sách
        </button>
        <div>
          <div className="cap-tag">{capsule.tag}</div>
          <h3>{capsule.title}</h3>
        </div>
        {best != null && <span className={'cap-best' + (best >= 75 ? ' ok' : '')}>Tốt nhất: {best}%</span>}
      </div>

      {i < 0 && (
        <>
          <ul className="cap-points">
            {capsule.points.map((p, k) => <li key={k}>{p}</li>)}
          </ul>
          <div className="cap-examples">
            {capsule.examples.map((ex, k) => (
              <div key={k} className="cap-ex">
                <p lang="en">
                  “{ex.en}”
                  <button className="wk-pt-sound" onClick={() => speakScript([{ s: 'W', text: ex.en }])} title="Nghe câu mẫu">
                    <Icon name="volume" size={13} />
                  </button>
                </p>
                <small>{ex.vi}</small>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={startDrill}>
            <Icon name="target" size={15} /> Luyện 4 câu — đạt từ 3/4 để hoàn thành
          </button>
        </>
      )}

      {q && !finished && (
        <div className="cap-drill">
          <div className="quiz-top">
            <span>Câu {i + 1} / {drill.length}</span>
            <span className="quiz-score"><Icon name="star" size={13} /> {score} đúng</span>
          </div>
          <p className="tr-q" lang="en">{q.text}</p>
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              let cls = 'quiz-opt'
              if (picked != null) {
                if (oi === q.answer) cls += ' correct'
                else if (oi === picked) cls += ' wrong'
              }
              return (
                <button key={oi} className={cls} onClick={() => choose(oi)} disabled={picked != null}>
                  <span lang="en">{opt}</span>
                </button>
              )
            })}
          </div>
          {picked != null && (
            <div className="quiz-foot">
              <div className="quiz-ex">💡 {q.explain}</div>
              <button className="btn-primary" onClick={next}>
                {i + 1 >= drill.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="quiz-done">
          <div className="qd-ring" style={{ ['--p' as string]: pct }}>
            <b>{pct}%</b>
            <span>{score}/{drill.length}</span>
          </div>
          <h3>{pct >= 75 ? '✅ Viên nang hoàn thành!' : 'Gần được rồi — đọc lại quy tắc và thử lại nhé'}</h3>
          <div className="quiz-done-actions">
            <button className="btn-ghost" onClick={startDrill}><Icon name="rocket" size={15} /> Luyện lại</button>
            <button className="btn-primary" onClick={onBack}><Icon name="arrow-left" size={15} /> Về danh sách</button>
          </div>
        </div>
      )}
    </div>
  )
}
