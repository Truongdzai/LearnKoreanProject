import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import PassiveQuiz from './PassiveQuiz'
import { FORMS, FRAMES, ROUND, buildRound, type PassiveTense } from './frames'
import { MASTERY, usePassiveProgress, type Result } from './progress'
import './styles.css'

export default function PassiveLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = usePassiveProgress()
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
      <div className="epv-lab">
        <PassiveQuiz key={quiz.n} items={quiz.items} title="Câu bị động" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="epv-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Câu bị động — be + V3</b>
          <p>
            Tiếng Việt chỉ cần thêm "được" hay "bị". Tiếng Anh phải có be (chia theo thì) và động từ ở dạng V3: was built,
            is spoken, will be sent. Hai lỗi hay gặp: quên be (The house built in 1990) và dùng V2 thay V3 (was wrote).
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

      <section className="epv-signs" aria-labelledby="epv-rules-h">
        <div className="section-title" id="epv-rules-h"><span className="pin" /> be chia theo thì, động từ luôn ở V3</div>
        <div className="epv-sign-grid">
          {(Object.keys(FORMS) as PassiveTense[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="epv-sign">
                <h3>{FORMS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="epv-form" lang="en">{FORMS[k].form}</p>
                <button type="button" className={'epv-ex' + (canHear ? ' on' : '')} onClick={() => say(FORMS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {FORMS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="epv-practice" ref={practiceRef} aria-labelledby="epv-practice-h">
        <div className="section-title" id="epv-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'epv-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn dạng động từ đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn các thì. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="epv-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
