import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import RelativeQuiz from './RelativeQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type RelativeGroup } from './frames'
import { MASTERY, useRelativeProgress, type Result } from './progress'
import './styles.css'

export default function RelativeLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useRelativeProgress()
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
      <div className="erl-lab">
        <RelativeQuiz key={quiz.n} items={quiz.items} title="Mệnh đề quan hệ" canHear={canHear} onFinish={onFinish} onAgain={start} onBack={back} />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="erl-lab">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Mệnh đề quan hệ — who, which, whose, where</b>
          <p>
            Tiếng Việt nối bằng "mà", "người", "nơi" hoặc bỏ luôn: người đàn ông sống cạnh nhà. Tiếng Anh phải chọn từ nối theo
            danh từ đứng trước: who cho người, which cho vật, whose cho sở hữu, where / when cho nơi chốn và thời gian. Lỗi hay
            gặp: bỏ mất đại từ khi nó làm chủ ngữ (The man lives next door is a doctor), dùng which cho người, nhầm whose với
            who's, và dùng that sau dấu phẩy.
          </p>
          <p>
            Trong câu không có dấu phẩy, that thay được cho who / which, nên bài luyện không đưa that vào những câu đó.
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

      <section className="erl-signs" aria-labelledby="erl-rules-h">
        <div className="section-title" id="erl-rules-h"><span className="pin" /> Chọn từ nối theo danh từ đứng trước</div>
        <div className="erl-sign-grid">
          {(Object.keys(GROUPS) as RelativeGroup[]).map((k) => {
            const v = state.stats[k]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={k} className="erl-sign">
                <h3>{GROUPS[k].name}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p className="erl-form">{GROUPS[k].form}</p>
                <p className="erl-rule-text">{GROUPS[k].rule}</p>
                <button type="button" className={'erl-ex' + (canHear ? ' on' : '')} onClick={() => say(GROUPS[k].ex)} tabIndex={canHear ? 0 : -1} lang="en">
                  {GROUPS[k].ex}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="erl-practice" ref={practiceRef} aria-labelledby="erl-practice-h">
        <div className="section-title" id="erl-practice-h"><span className="pin" /> Luyện tập</div>
        <div className={'erl-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> Chọn đại từ quan hệ đúng</b>
            <p>{ROUND} câu trong {FRAMES.length}, trộn cả năm nhóm. Câu từng sai được hỏi lại nhiều hơn.</p>
          </div>
          <div className="erl-mode-foot">
            <small>{state.best.mix != null ? `Tốt nhất: ${state.best.mix}%` : 'Chưa luyện'}</small>
            <button className="btn-primary sm" onClick={start}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
