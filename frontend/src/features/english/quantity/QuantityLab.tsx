import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import QuantityQuiz from './QuantityQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type QuantityGroup } from './frames'
import { MASTERY, useQuantityProgress, type Result } from './progress'
import './styles.css'

export default function QuantityLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useQuantityProgress()
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
      <div className="eqt-lab">
        <QuantityQuiz key={quiz.n} items={quiz.items} title="Số nhiều & lượng từ" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="eqt-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Số nhiều & lượng từ — some / any / much / many / a few / a little</b>
          <p>
            Tiếng Việt nói "hai đứa con", "nhiều thông tin", "một lời khuyên" mà danh từ không đổi. Tiếng Anh phải biết danh
            từ đếm được hay không: đếm được thì có số nhiều (two children, many friends), không đếm được thì KHÔNG thêm s,
            không đi với a / an (some information, much time). Lượng từ đi theo: many / a few + đếm được số nhiều,
            much / a little + không đếm được; some trong câu khẳng định, any trong phủ định và câu hỏi.
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

      <section className="eqt-signs" aria-labelledby="eqt-rules-h">
        <div className="section-title" id="eqt-rules-h"><span className="pin" /> Bốn quy tắc cần nhớ</div>
        <div className="eqt-sign-grid">
          {(Object.keys(GROUPS) as QuantityGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="eqt-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="eqt-form" lang="en">{GROUPS[k].form}</p>
                <p className="eqt-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'eqt-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="eqt-practice" ref={practiceRef} aria-labelledby="eqt-practice-h">
        <div className="section-title" id="eqt-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'eqt-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn danh từ, lượng từ đúng</b>
            <p>
              {ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm. Với a few / few, a little / little hãy đọc kỹ câu tiếng
              Việt. Câu từng sai được hỏi lại nhiều hơn.
            </p>
          </div>
          <div className="eqt-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
