import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import ConfuseQuiz from './ConfuseQuiz'
import { FRAMES, PAIRS, ROUND, SETS, buildRound, setOf, type SetId } from './frames'
import { MASTERY, useConfuseProgress, type Result, type RoundKind } from './progress'
import './styles.css'

export default function ConfuseLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useConfuseProgress()
  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  const [sets, setSets] = useState<SetId[]>([])
  const [quiz, setQuiz] = useState<{ kind: RoundKind; items: ReturnType<typeof buildRound>; n: number } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])

  // Chọn đủ mọi nhóm cũng tính là lượt trộn
  const kind: RoundKind = sets.length && sets.length < SETS.length ? 'focus' : 'mix'

  const start = (k: RoundKind = kind) => {
    setQuiz((q) => ({ kind: k, items: buildRound(k === 'mix' ? [] : sets, state.weak), n: (q?.n ?? 0) + 1 }))
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((results: Result[], pct: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'en')
    if (finishRound(quiz.kind, pct, results)) recordEvent('grammar', 1, 0, 0, 'en')
  }, [quiz, finishRound, recordEvent])

  if (quiz) {
    return (
      <div className="ec-lab">
        <ConfuseQuiz
          key={quiz.n}
          items={quiz.items}
          title={quiz.kind === 'mix' ? 'Trộn tất cả' : 'Nhóm đã chọn'}
          canHear={canHear}
          onFinish={onFinish}
          onAgain={() => start(quiz.kind)}
          onBack={back}
        />
      </div>
    )
  }

  const toggle = (s: SetId) => setSets((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s]))
  const count = FRAMES.filter((f) => kind === 'mix' || sets.includes(setOf(f))).length

  return (
    <div className="ec-lab">
      <div className="grammar-intro">
        <Icon name="shuffle" size={20} />
        <div>
          <b>Từ dễ nhầm</b>
          <p>
            Tiếng Việt chỉ có một từ "mượn", "nói", "làm", "nghe", "xem" — tiếng Anh lại tách làm hai, ba từ khác nghĩa.
            {' '}{PAIRS.length} cặp người Việt hay dùng nhầm nhất, mỗi cặp một mẹo ngắn để phân biệt.
          </p>
          <div className="hg-stats">
            <span><b>{state.best.mix ?? 0}%</b> lượt trộn tốt nhất</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <section className="ec-pairs" aria-labelledby="ec-pairs-h">
        <div className="section-title" id="ec-pairs-h"><span className="pin" /> Mẹo phân biệt</div>
        <div className="ec-pair-grid">
          {PAIRS.map((p) => {
            const v = state.stats[p.id]
            const acc = v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
            return (
              <article key={p.id} className="ec-pair">
                <h3><span lang="en">{p.words}</span>{acc != null && <small>{acc}% đúng</small>}</h3>
                <p>{p.tip}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ec-practice" ref={practiceRef} aria-labelledby="ec-practice-h">
        <div className="section-title" id="ec-practice-h"><span className="pin" /> Luyện tập</div>
        <span className="hg-group-title">Nhóm (để trống = trộn tất cả)</span>
        <div className="ec-chips">
          {SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={'chip ec-chip' + (sets.includes(s.id) ? ' on' : '')}
              aria-pressed={sets.includes(s.id)}
              onClick={() => toggle(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className={'ec-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> {kind === 'mix' ? 'Lượt trộn tất cả các cặp' : 'Lượt theo nhóm đã chọn'}</b>
            <p>
              {ROUND} câu trong {count}, câu từng sai được hỏi lại nhiều hơn.
              {kind === 'focus' && ' Lượt theo nhóm để ôn riêng; lộ trình chỉ tính lượt trộn.'}
            </p>
          </div>
          <div className="ec-mode-foot">
            <small>{state.best.mix != null ? `Trộn tốt nhất: ${state.best.mix}%` : 'Chưa có lượt trộn'}</small>
            <button className="btn-primary sm" onClick={() => start()}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
