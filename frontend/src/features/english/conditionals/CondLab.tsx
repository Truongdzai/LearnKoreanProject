import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import CondQuiz from './CondQuiz'
import { FRAMES, ROUND, TYPES, buildRound, type CondType } from './frames'
import { MASTERY, useCondProgress, type Result } from './progress'
import './styles.css'

export default function CondLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useCondProgress()
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
      <div className="ecd-lab">
        <CondQuiz key={quiz.n} items={quiz.items} title="Câu điều kiện" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="ecd-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Câu điều kiện loại 1 và loại 2</b>
          <p>
            "Nếu… thì…" trong tiếng Việt không đổi động từ. Tiếng Anh thì có: chuyện có thể xảy ra dùng loại 1 (If it rains, we
            will…), chuyện giả định không có thật dùng loại 2 (If I had…, I would…). Lỗi hay gặp nhất là đặt will / would vào vế if.
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

      <section className="ecd-signs" aria-labelledby="ecd-rules-h">
        <div className="section-title" id="ecd-rules-h"><span className="pin" /> Hai loại câu điều kiện</div>
        <div className="ecd-sign-grid">
          {(Object.keys(TYPES) as CondType[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="ecd-sign">
                <h3>{TYPES[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="ecd-form" lang="en">{TYPES[k].form}</p>
                <p className="ecd-rule-text">{TYPES[k].use}</p>
                <button type="button" className={'ecd-ex' + (canHear ? ' on' : '')} onClick={() => say(TYPES[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {TYPES[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ecd-practice" ref={practiceRef} aria-labelledby="ecd-practice-h">
        <div className="section-title" id="ecd-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'ecd-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn dạng động từ đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn loại 1 và loại 2, cả vế if lẫn vế chính. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="ecd-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
