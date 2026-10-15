import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import ModalQuiz from './ModalQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type ModalGroup } from './frames'
import { MASTERY, useModalProgress, type Result } from './progress'
import './styles.css'

export default function ModalLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useModalProgress()
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
      <div className="emd-lab">
        <ModalQuiz key={quiz.n} items={quiz.items} title="Động từ khuyết thiếu" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="emd-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Động từ khuyết thiếu — can, should, must, might</b>
          <p>
            Tiếng Việt đặt nên, phải, có thể, chắc trước động từ mà động từ không đổi. Tiếng Anh cũng vậy: sau can, should,
            must, might động từ luôn ở nguyên mẫu (She can drive), nên đừng thêm to hay -s (can to drive, can drives). Khó hơn
            là chọn đúng từ theo nghĩa: "không cần" là don't have to chứ không phải mustn't (mustn't là "không được"), "nên"
            là should còn "biết, có thể" là can, và khi đoán thì "không thể nào" là can't chứ không phải mustn't.
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

      <section className="emd-signs" aria-labelledby="emd-rules-h">
        <div className="section-title" id="emd-rules-h"><span className="pin" /> Bốn điểm cần nhớ</div>
        <div className="emd-sign-grid">
          {(Object.keys(GROUPS) as ModalGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="emd-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="emd-form" lang="en">{GROUPS[k].form}</p>
                <p className="emd-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'emd-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="emd-practice" ref={practiceRef} aria-labelledby="emd-practice-h">
        <div className="section-title" id="emd-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'emd-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn động từ khuyết thiếu đúng</b>
            <p>
              {ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm. Đọc kỹ câu tiếng Việt: nó cho biết là phải, không được,
              không cần, nên hay chắc chắn. Câu từng sai được hỏi lại nhiều hơn.
            </p>
          </div>
          <div className="emd-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
