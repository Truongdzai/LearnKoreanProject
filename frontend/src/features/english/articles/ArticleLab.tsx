import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import ArticleQuiz from './ArticleQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type ArticleGroup } from './frames'
import { MASTERY, useArticleProgress, type Result } from './progress'
import './styles.css'

export default function ArticleLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useArticleProgress()
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
      <div className="ear-lab">
        <ArticleQuiz key={quiz.n} items={quiz.items} title="Mạo từ a / an / the" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="ear-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Mạo từ a / an / the</b>
          <p>
            Tiếng Việt nói "mẹ tôi là y tá", "đóng cửa giúp tôi" mà không cần mạo từ. Tiếng Anh thì danh từ đếm được số ít
            không đứng một mình mà phải có a / an hoặc the (hay my, this…): She's a nurse, close the door. Ngược lại, danh
            từ số nhiều / không đếm được khi nói chung, bữa ăn hay phương tiện lại không dùng mạo từ: I like music, have
            lunch, by bus.
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

      <section className="ear-signs" aria-labelledby="ear-rules-h">
        <div className="section-title" id="ear-rules-h"><span className="pin" /> Bốn quy tắc cần nhớ</div>
        <div className="ear-sign-grid">
          {(Object.keys(GROUPS) as ArticleGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="ear-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="ear-form" lang="en">{GROUPS[k].form}</p>
                <p className="ear-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'ear-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ear-practice" ref={practiceRef} aria-labelledby="ear-practice-h">
        <div className="section-title" id="ear-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'ear-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn a, an, the hay "—"</b>
            <p>
              {ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm; "—" nghĩa là không dùng mạo từ. Câu từng sai được hỏi
              lại nhiều hơn.
            </p>
          </div>
          <div className="ear-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
