import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import BuildQuiz from './BuildQuiz'
import { FOCUS, LEVELS, ROUND, SENTENCES, buildRound, levelOf, type FocusId, type LevelId, type Sentence } from './sentences'
import { MASTERY, useEnOrderProgress } from './progress'
import './styles.css'

// Bốn chỗ người Việt hay dịch từng chữ, mỗi chỗ một cặp đối chiếu
const CONTRASTS: { title: string; vi: string; wrong: string; en: string }[] = [
  { title: 'Tính từ đứng trước', vi: 'một chiếc xe màu đỏ', wrong: 'a car red', en: 'a red car' },
  { title: 'Câu hỏi cần trợ động từ', vi: 'Bạn sống ở đâu?', wrong: 'You live where?', en: 'Where do you live?' },
  { title: '\'s đảo lên trước', vi: 'túi của chị tôi', wrong: 'bag of my sister', en: 'my sister\'s bag' },
  { title: 'very well đứng sau tân ngữ', vi: 'Cô ấy nói tiếng Anh rất giỏi.', wrong: 'She speaks very well English.', en: 'She speaks English very well.' },
]

export default function SentenceBuilder() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useEnOrderProgress()
  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  const [focus, setFocus] = useState<FocusId[]>([])
  const [quiz, setQuiz] = useState<{ level: LevelId; items: Sentence[]; n: number } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])

  const start = (level: LevelId) => {
    setQuiz((q) => ({ level, items: buildRound(level, focus, state.weak), n: (q?.n ?? 0) + 1 }))
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((pct: number, results: { id: string; ok: boolean }[]) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'en')
    if (finishRound(quiz.level, pct, results)) recordEvent('grammar', 1, 0, 0, 'en')
  }, [quiz, finishRound, recordEvent])

  if (quiz) {
    return (
      <div className="eb-lab">
        <BuildQuiz
          key={quiz.n}
          items={quiz.items}
          title={LEVELS.find((l) => l.id === quiz.level)!.label}
          canHear={canHear}
          onFinish={onFinish}
          onAgain={() => start(quiz.level)}
          onBack={back}
        />
      </div>
    )
  }

  const toggle = (f: FocusId) => setFocus((l) => (l.includes(f) ? l.filter((x) => x !== f) : [...l, f]))
  const count = (level: LevelId) => SENTENCES.filter((s) => levelOf(s) === level && (!focus.length || focus.includes(s.focus))).length

  return (
    <div className="eb-lab">
      <div className="grammar-intro">
        <Icon name="shuffle" size={20} />
        <div>
          <b>Ghép câu — trật tự từ tiếng Anh</b>
          <p>
            Người Việt hay "dịch từng chữ" nên nói a car red, You live where?, bag of my sister. Ghép lại {SENTENCES.length} câu đời
            thường từ thẻ từ để quen tay trật tự đúng: tính từ trước danh từ, trợ động từ trong câu hỏi, always / never, nơi chốn
            rồi mới tới thời gian.
          </p>
          <div className="hg-stats">
            <span><b>{state.best.easy ?? 0}%</b> câu ngắn tốt nhất</span>
            <span><b>{state.best.hard ?? 0}%</b> câu dài tốt nhất</span>
            <span><b>{state.solved}</b> câu đã tự ghép đúng</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <section className="eb-contrasts" aria-labelledby="eb-contrast-h">
        <div className="section-title" id="eb-contrast-h"><span className="pin" /> Đừng dịch từng chữ</div>
        <div className="eb-contrast-grid">
          {CONTRASTS.map((c) => (
            <article key={c.title} className="eb-contrast">
              <h3>{c.title}</h3>
              <p className="eb-c-vi">{c.vi}</p>
              <p className="eb-c-wrong" lang="en"><Icon name="x" size={13} /> <s>{c.wrong}</s></p>
              <button
                type="button"
                className={'eb-c-right' + (canHear ? ' on' : '')}
                onClick={canHear ? () => speakEN(c.en, 0.85) : undefined}
                tabIndex={canHear ? 0 : -1}
                lang="en"
              >
                <Icon name="check" size={13} /> {c.en}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="eb-practice" ref={practiceRef} aria-labelledby="eb-practice-h">
        <div className="section-title" id="eb-practice-h"><span className="pin" /> Luyện tập</div>
        <span className="hg-group-title">Chủ điểm (để trống = trộn tất cả)</span>
        <div className="eb-chips">
          {FOCUS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={'chip eb-chip' + (focus.includes(f.id) ? ' on' : '')}
              aria-pressed={focus.includes(f.id)}
              title={f.tip}
              onClick={() => toggle(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="eb-modes">
          {LEVELS.map((l) => {
            const best = state.best[l.id]
            const n = count(l.id)
            return (
              <div key={l.id} className={'eb-mode' + ((best ?? 0) >= MASTERY ? ' done' : '')}>
                <b><Icon name={l.id === 'easy' ? 'letters' : 'note'} size={16} /> {l.label}</b>
                <p>{l.desc}</p>
                <div className="eb-mode-foot">
                  <small>{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · {Math.min(ROUND, n || ROUND)} câu/lượt</small>
                  <button className="btn-primary sm" onClick={() => start(l.id)}><Icon name="play" size={14} /> Bắt đầu</button>
                </div>
              </div>
            )
          })}
        </div>
        <p className="hg-note">
          Bấm thẻ để đặt vào câu, bấm lại thẻ đã đặt (hoặc phím Backspace) để gỡ. Dùng gợi ý vẫn được, nhưng câu đó không tính là tự ghép đúng.
          {state.weak.length > 0 && ` Có ${state.weak.length} câu từng sai sẽ được hỏi lại nhiều hơn.`}
        </p>
      </section>
    </div>
  )
}
