import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import QuestionQuiz from './QuestionQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type QuestionGroup } from './frames'
import { MASTERY, useQuestionProgress, type Result } from './progress'
import './styles.css'

export default function QuestionLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useQuestionProgress()
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
      <div className="eqn-lab">
        <QuestionQuiz key={quiz.n} items={quiz.items} title="Câu hỏi đuôi & gián tiếp" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="eqn-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Câu hỏi đuôi & câu hỏi gián tiếp</b>
          <p>
            Tiếng Việt chỉ cần thêm "phải không?", "nhỉ?" vào cuối câu. Tiếng Anh phải lặp lại trợ động từ và đại từ của vế
            trước, đổi khẳng định thành phủ định và ngược lại: You're tired, aren't you? Còn khi hỏi lịch sự "Bạn có biết…
            không", phần câu hỏi bên trong giữ trật tự câu kể: Do you know where he lives? (không nói where does he live).
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

      <section className="eqn-signs" aria-labelledby="eqn-rules-h">
        <div className="section-title" id="eqn-rules-h"><span className="pin" /> Bốn nhóm cần nhớ</div>
        <div className="eqn-sign-grid">
          {(Object.keys(GROUPS) as QuestionGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="eqn-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="eqn-form" lang="en">{GROUPS[k].form}</p>
                <p className="eqn-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'eqn-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="eqn-practice" ref={practiceRef} aria-labelledby="eqn-practice-h">
        <div className="section-title" id="eqn-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'eqn-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn câu hỏi đuôi và vế câu đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="eqn-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
