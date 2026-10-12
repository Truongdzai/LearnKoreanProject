import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import CompareQuiz from './CompareQuiz'
import { FRAMES, KIND_INFO, ROUND, buildRound, type AdjKind } from './frames'
import { MASTERY, useCompareProgress, type Result } from './progress'
import './styles.css'

const EXAMPLES: Record<AdjKind, string[]> = {
  short: ['cheap → cheaper → the cheapest', 'big → bigger → the biggest'],
  y: ['easy → easier → the easiest', 'happy → happier → the happiest'],
  long: ['expensive → more expensive → the most expensive', 'beautiful → more beautiful → the most beautiful'],
  irr: ['good → better → the best', 'bad → worse → the worst'],
}

export default function CompareLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useCompareProgress()
  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  const [quiz, setQuiz] = useState<{ items: ReturnType<typeof buildRound>; n: number } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])

  const start = () => setQuiz((q) => ({ items: buildRound(state.weak), n: (q?.n ?? 0) + 1 }))

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((results: Result[], pct: number) => {
    recordEvent('review', 1, 0, 0, 'en')
    if (finishRound('mix', pct, results)) recordEvent('grammar', 1, 0, 0, 'en')
  }, [finishRound, recordEvent])

  if (quiz) {
    return (
      <div className="ecp-lab">
        <CompareQuiz key={quiz.n} items={quiz.items} title="So sánh" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t.replace(/→/g, ','), 0.85) }

  return (
    <div className="ecp-lab">
      <div className="grammar-intro">
        <Icon name="chart" size={20} />
        <div>
          <b>So sánh hơn và so sánh nhất</b>
          <p>
            "Rẻ hơn", "đắt nhất" — tiếng Việt chỉ cần thêm "hơn", "nhất". Tiếng Anh đổi theo độ dài của tính từ: từ ngắn thêm
            -er / -est, từ dài dùng more / the most, và vài từ bất quy tắc. Lỗi hay gặp nhất: more cheaper, gooder, expensiver.
          </p>
          <div className="hg-stats">
            <span><b>{state.best.mix ?? 0}%</b> tốt nhất</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <section className="ecp-signs" aria-labelledby="ecp-rules-h">
        <div className="section-title" id="ecp-rules-h"><span className="pin" /> Bốn quy tắc</div>
        <div className="ecp-sign-grid">
          {(Object.keys(KIND_INFO) as AdjKind[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="ecp-sign">
                <h3>{KIND_INFO[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="ecp-rule-text">{KIND_INFO[k].rule}</p>
                {EXAMPLES[k].map((ex) => (
                  <button key={ex} type="button" className={'ecp-ex' + (canHear ? ' on' : '')} onClick={() => say(ex)} tabIndex={canHear ? 0 : -1} lang="en">
                    {ex}
                  </button>
                ))}
              </article>
            )
          })}
        </div>
      </section>

      <section className="ecp-practice" ref={practiceRef} aria-labelledby="ecp-practice-h">
        <div className="section-title" id="ecp-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'ecp-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn dạng so sánh đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn so sánh hơn (than) và so sánh nhất (the …). Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="ecp-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
