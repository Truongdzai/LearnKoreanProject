import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import PhrasalQuiz from './PhrasalQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type PhrasalGroup } from './frames'
import { MASTERY, usePhrasalProgress, type Result } from './progress'
import './styles.css'

export default function PhrasalLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = usePhrasalProgress()
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
      <div className="eph-lab">
        <PhrasalQuiz key={quiz.n} items={quiz.items} title="Cụm động từ" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="eph-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Cụm động từ — look after, get on, turn it off</b>
          <p>
            Phrasal verb là động từ ghép với một tiểu từ (after, up, on, off…), và nghĩa của cả cụm thường khác hẳn động từ
            gốc: look after là chăm sóc, look for là tìm, give up là bỏ. Tiếng Việt cũng có mặc vào, cởi ra, nhưng tiểu từ tiếng
            Anh thường không đoán được nghĩa (look after không phải "nhìn sau"), nên người học hay chọn nhầm tiểu từ, quên
            with / to / of ở cuối cụm (get along my friends, run out milk) và đặt đại từ sai chỗ (turn off it, pick up me).
          </p>
          <p>
            Mỗi câu luyện có gợi ý nghĩa trong ngoặc — chọn cụm mang đúng nghĩa đó, hoặc cách đặt tân ngữ đúng.
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

      <section className="eph-signs" aria-labelledby="eph-rules-h">
        <div className="section-title" id="eph-rules-h"><span className="pin" /> Học nghĩa theo cả cụm</div>
        <div className="eph-sign-grid">
          {(Object.keys(GROUPS) as PhrasalGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="eph-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="eph-form" lang="en">{GROUPS[k].words}</p>
                <p className="eph-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'eph-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="eph-practice" ref={practiceRef} aria-labelledby="eph-practice-h">
        <div className="section-title" id="eph-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'eph-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn cụm động từ đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="eph-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
