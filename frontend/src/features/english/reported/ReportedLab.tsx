import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import ReportedQuiz from './ReportedQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type ReportedGroup } from './frames'
import { MASTERY, useReportedProgress, type Result } from './progress'
import './styles.css'

export default function ReportedLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useReportedProgress()
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
      <div className="erp-lab">
        <ReportedQuiz key={quiz.n} items={quiz.items} title="Câu tường thuật" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="erp-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Câu tường thuật — kể lại lời người khác</b>
          <p>
            Tiếng Việt kể lại chỉ cần "anh ấy nói là…", "cô ấy hỏi…", động từ giữ nguyên. Tiếng Anh thì phải chọn đúng
            said / told / asked (told luôn có người nghe: told me), đưa câu hỏi về trật tự câu kể (She asked me where I
            lived), dùng to V cho lời bảo (He told me to wait), và khi chuyện đã qua thì lùi thì, đổi từ chỉ thời gian:
            will → would, tomorrow → the next day.
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

      <section className="erp-signs" aria-labelledby="erp-rules-h">
        <div className="section-title" id="erp-rules-h"><span className="pin" /> Bốn điều cần nhớ khi kể lại lời nói</div>
        <div className="erp-sign-grid">
          {(Object.keys(GROUPS) as ReportedGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="erp-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="erp-form" lang="en">{GROUPS[k].form}</p>
                <p className="erp-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'erp-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="erp-practice" ref={practiceRef} aria-labelledby="erp-practice-h">
        <div className="section-title" id="erp-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'erp-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn cách tường thuật đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="erp-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
