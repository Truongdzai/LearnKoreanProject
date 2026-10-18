import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import LinkerQuiz from './LinkerQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type LinkerGroup } from './frames'
import { MASTERY, useLinkerProgress, type Result } from './progress'
import './styles.css'

export default function LinkerLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useLinkerProgress()
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
      <div className="eln-lab">
        <LinkerQuiz key={quiz.n} items={quiz.items} title="Liên từ & từ nối" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="eln-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Liên từ & từ nối</b>
          <p>
            Từ nối cho biết hai ý liên quan với nhau thế nào: thêm ý (and), trái ý (but, although, however), lý do
            (because), kết quả (so), mục đích (to, so that) hay thời gian (when, until). Người Việt hay mắc hai lỗi: dịch
            nguyên cặp "tuy… nhưng…", "vì… nên…" thành Although… but…, Because… so…; và đặt danh từ sau although /
            because (although the rain) trong khi phải dùng despite / because of.
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

      <section className="eln-signs" aria-labelledby="eln-rules-h">
        <div className="section-title" id="eln-rules-h"><span className="pin" /> Bốn nhóm từ nối</div>
        <div className="eln-sign-grid">
          {(Object.keys(GROUPS) as LinkerGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="eln-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="eln-form" lang="en">{GROUPS[k].form}</p>
                <p className="eln-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'eln-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="eln-practice" ref={practiceRef} aria-labelledby="eln-practice-h">
        <div className="section-title" id="eln-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'eln-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn từ nối đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn cả bốn nhóm. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="eln-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
