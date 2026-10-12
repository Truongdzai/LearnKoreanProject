import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import GerundQuiz from './GerundQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type GerundGroup } from './frames'
import { MASTERY, useGerundProgress, type Result } from './progress'
import './styles.css'

export default function GerundLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useGerundProgress()
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
      <div className="egr-lab">
        <GerundQuiz key={quiz.n} items={quiz.items} title="V-ing hay to V" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }


  return (
    <div className="egr-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>V-ing hay to V?</b>
          <p>
            "Tôi thích bơi", "tôi quyết định đi" — tiếng Việt ghép thẳng hai động từ. Tiếng Anh thì động từ sau phải đổi dạng:
            enjoy swimming nhưng decide to go, interested in learning, let me stay. Không có mẹo đoán — phải nhớ theo từng nhóm.
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

      <section className="egr-signs" aria-labelledby="egr-rules-h">
        <div className="section-title" id="egr-rules-h"><span className="pin" /> Bốn nhóm cần nhớ</div>
        <div className="egr-sign-grid">
          {(Object.keys(GROUPS) as GerundGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="egr-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="egr-form" lang="en">{GROUPS[k].words}</p>
                <p className="egr-rule-text">{GROUPS[k].rule}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="egr-practice" ref={practiceRef} aria-labelledby="egr-practice-h">
        <div className="section-title" id="egr-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'egr-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn dạng động từ đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="egr-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
