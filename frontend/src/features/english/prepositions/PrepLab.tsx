import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import PrepQuiz from './PrepQuiz'
import { FRAMES, GROUPS, ROUND, buildRound, type Frame, type PrepGroup } from './frames'
import { MASTERY, usePrepProgress, type Result } from './progress'
import './styles.css'

// Ba tầng từ nhỏ tới lớn: at (điểm) → on (ngày, bề mặt) → in (khoảng lớn, bên trong)
const LADDER: { p: string; time: string[]; place: string[]; note: string }[] = [
  { p: 'at', note: 'một điểm', time: ['at 7 o\'clock', 'at noon', 'at night'], place: ['at the door', 'at the bus stop', 'at 25 Le Loi Street'] },
  { p: 'on', note: 'ngày · bề mặt · tầng', time: ['on Monday', 'on 5 May', 'on Christmas Day'], place: ['on the table', 'on the third floor', 'on the bus'] },
  { p: 'in', note: 'khoảng lớn · bên trong', time: ['in July', 'in 1998', 'in the morning'], place: ['in the kitchen', 'in Hanoi', 'in the car'] },
]

const NONE = ['next week', 'last year', 'this morning', 'every day', 'yesterday', 'tomorrow', 'go home']

export default function PrepLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = usePrepProgress()
  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  const [quiz, setQuiz] = useState<{ group: PrepGroup; items: Frame[]; n: number } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])

  const start = (group: PrepGroup) => {
    setQuiz((q) => ({ group, items: buildRound(group, state.weak), n: (q?.n ?? 0) + 1 }))
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((results: Result[], pct: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'en')
    if (finishRound(quiz.group, pct, results)) recordEvent('grammar', 1, 0, 0, 'en')
  }, [quiz, finishRound, recordEvent])

  if (quiz) {
    return (
      <div className="ep-lab">
        <PrepQuiz
          key={quiz.n}
          items={quiz.items}
          title={GROUPS.find((g) => g.id === quiz.group)!.label}
          canHear={canHear}
          onFinish={onFinish}
          onAgain={() => start(quiz.group)}
          onBack={back}
        />
      </div>
    )
  }

  const say = (t: string) => { if (canHear) speakEN(t, 0.85) }

  return (
    <div className="ep-lab">
      <div className="grammar-intro">
        <Icon name="map" size={20} />
        <div>
          <b>Giới từ in / on / at</b>
          <p>
            Tiếng Việt chỉ cần "ở", "vào", "lúc" — tiếng Anh tách ba từ theo độ lớn: at cho một điểm, on cho ngày và bề mặt,
            in cho khoảng lớn và bên trong. Thêm một bẫy: trước next, last, this, every thì không dùng giới từ nào cả.
          </p>
          <div className="hg-stats">
            <span><b>{state.best.time ?? 0}%</b> thời gian tốt nhất</span>
            <span><b>{state.best.place ?? 0}%</b> nơi chốn tốt nhất</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <section className="ep-ladder" aria-labelledby="ep-ladder-h">
        <div className="section-title" id="ep-ladder-h"><span className="pin" /> Từ nhỏ tới lớn: at → on → in</div>
        <div className="ep-ladder-grid">
          {LADDER.map((r) => (
            <article key={r.p} className={'ep-step ep-' + r.p}>
              <h3><span lang="en">{r.p}</span><small>{r.note}</small></h3>
              <div className="ep-cols">
                {(['time', 'place'] as const).map((k) => (
                  <div key={k} className="ep-col">
                    <span className="hg-group-title">{k === 'time' ? 'Thời gian' : 'Nơi chốn'}</span>
                    {r[k].map((ex) => (
                      <button key={ex} type="button" className={'ep-ex' + (canHear ? ' on' : '')} onClick={() => say(ex)} tabIndex={canHear ? 0 : -1} lang="en">
                        {ex}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="ep-none">
          <b>Không dùng giới từ:</b>
          {NONE.map((n) => (
            <button key={n} type="button" className={'ep-ex' + (canHear ? ' on' : '')} onClick={() => say(n)} tabIndex={canHear ? 0 : -1} lang="en">
              {n}
            </button>
          ))}
          <span className="ep-none-note">Nói "I'll see you next week", không nói "in next week".</span>
        </div>
      </section>

      <section className="ep-practice" ref={practiceRef} aria-labelledby="ep-practice-h">
        <div className="section-title" id="ep-practice-h"><span className="pin" /> Luyện tập</div>
        <div className="ep-modes">
          {GROUPS.map((g) => {
            const best = state.best[g.id]
            const n = FRAMES.filter((f) => f.group === g.id).length
            return (
              <div key={g.id} className={'ep-mode' + ((best ?? 0) >= MASTERY ? ' done' : '')}>
                <b><Icon name={g.id === 'time' ? 'clock' : 'map'} size={16} /> {g.label}</b>
                <p>{g.desc}</p>
                <div className="ep-mode-foot">
                  <small>{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · {ROUND} câu trong {n}</small>
                  <button className="btn-primary sm" onClick={() => start(g.id)}><Icon name="play" size={14} /> Bắt đầu</button>
                </div>
              </div>
            )
          })}
        </div>
        {state.weak.length > 0 && <p className="hg-note">Có {state.weak.length} câu từng sai sẽ được hỏi lại nhiều hơn.</p>}
      </section>
    </div>
  )
}
