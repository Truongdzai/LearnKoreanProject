import { useCallback, useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged, speakEN } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import EnNumQuiz from './EnNumQuiz'
import { CATS, ROUND, TYPE_CATS, buildRound, type CatId, type ModeId, type Question } from './drills'
import { bigNum, cardinal, dateNum, dateWord, digitalTime, ordSuffix, ordinal, priceNum, priceWord, timeNum, timeWord, yearWord } from './ennum'
import { MASTERY, accuracy, useEnNumProgress, type Result } from './progress'
import './styles.css'

const MODES: { id: ModeId; label: string; icon: IconName; desc: string }[] = [
  { id: 'read', label: 'Đọc số', icon: 'book', desc: 'Nhìn con số (giá, năm, giờ, ngày…), chọn cách đọc đúng trong 4 cách.' },
  { id: 'listen', label: 'Nghe số', icon: 'headphones', desc: 'Nghe câu đọc, chọn đúng con số giữa các số dễ nhầm (13 / 30, 7:15 / 7:45).' },
  { id: 'type', label: 'Nghe & gõ số', icon: 'keyboard', desc: 'Nghe rồi tự gõ con số — như chép lại giá tiền, số tiền, giờ hẹn khi nghe điện thoại.' },
]

// Ví dụ cố định cho phần "Cách đọc" (tạo bằng chính bộ đọc số để luôn khớp với bài luyện)
const EXAMPLES: Record<CatId, { v: string; say: string; alt?: string }[]> = {
  teen: [13, 30, 15, 50].map((n) => ({ v: String(n), say: cardinal(n) })),
  big: [
    { v: bigNum(1500), say: cardinal(1500), alt: 'fifteen hundred' },
    { v: bigNum(150000), say: cardinal(150000) },
    { v: bigNum(2300000), say: cardinal(2300000) },
  ],
  price: [
    { v: priceNum(5, 20), say: priceWord(5, 20), alt: 'five twenty' },
    { v: priceNum(0, 75), say: priceWord(0, 75) },
    { v: priceNum(12, 0), say: priceWord(12, 0) },
  ],
  year: [1999, 1905, 2005, 2024].map((y) => ({ v: String(y), say: yearWord(y), alt: y === 2024 ? 'two thousand and twenty-four' : undefined })),
  time: [[7, 15], [7, 30], [7, 45], [7, 5]].map(([h, m]) => ({ v: timeNum(h, m), say: timeWord(h, m), alt: digitalTime(h, m) })),
  date: [[3, 5], [21, 12]].map(([d, m]) => ({ v: dateNum(d, m), say: dateWord(d, m), alt: `${dateWord(d, m).replace(/^the (.*) of (.*)$/, '$2 $1')}` })),
  ord: [1, 2, 3, 5, 12, 21].map((n) => ({ v: ordSuffix(n), say: ordinal(n) })),
}

export default function EnNumbersLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useEnNumProgress()
  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  const [cats, setCats] = useState<CatId[]>([])
  const [quiz, setQuiz] = useState<{ mode: ModeId; questions: Question[]; title: string; n: number } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])

  const start = (mode: ModeId) => {
    const m = MODES.find((x) => x.id === mode)!
    setQuiz((q) => ({ mode, questions: buildRound(mode, cats), title: m.label, n: (q?.n ?? 0) + 1 }))
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((results: Result[], pct: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'en')
    if (finishRound(quiz.mode, pct, results)) recordEvent('grammar', 1, 0, 0, 'en')
  }, [quiz, finishRound, recordEvent])

  if (quiz) {
    return (
      <div className="enn-lab">
        <EnNumQuiz
          key={quiz.n}
          questions={quiz.questions}
          mode={quiz.mode}
          title={quiz.title}
          canHear={canHear}
          onFinish={onFinish}
          onAgain={() => start(quiz.mode)}
          onBack={back}
        />
      </div>
    )
  }

  const toggle = (c: CatId) => setCats((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]))
  const dropped = cats.filter((c) => !TYPE_CATS.includes(c))
  const allDropped = dropped.length > 0 && dropped.length === cats.length

  return (
    <div className="enn-lab">
      <div className="grammar-intro">
        <Icon name="chart" size={20} />
        <div>
          <b>Số đếm, giá tiền, giờ giấc</b>
          <p>
            Đi mua đồ, hẹn giờ, đọc năm sinh, nghe số điện thoại — con số xuất hiện trong gần như mọi cuộc nói chuyện,
            và người học hay vấp ở chỗ nghe nhầm 13 với 30, đọc năm như số đếm, hay nói nhầm giờ "kém" (a quarter to).
          </p>
          <div className="hg-stats">
            {MODES.map((m) => <span key={m.id}><b>{state.best[m.id] ?? 0}%</b> {m.label.toLowerCase()} tốt nhất</span>)}
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <section className="enn-rules" aria-labelledby="enn-rules-h">
        <div className="section-title" id="enn-rules-h"><span className="pin" /> Cách đọc</div>
        <div className="enn-rule-grid">
          {CATS.map((c) => {
            const acc = accuracy(state.stats[c.id])
            return (
              <article key={c.id} className="enn-rule">
                <h3>{c.label}{acc != null && <small>{acc}% đúng</small>}</h3>
                <p>{c.tip}</p>
                <div className="enn-ex">
                  {EXAMPLES[c.id].map((e) => (
                    <button
                      key={e.v}
                      type="button"
                      className={'enn-ex-row' + (canHear ? ' on' : '')}
                      onClick={canHear ? () => speakEN(e.say, 0.85) : undefined}
                      tabIndex={canHear ? 0 : -1}
                    >
                      <b>{e.v}</b>
                      <span lang="en">{e.say}{e.alt && e.alt !== e.say && <small> · {e.alt}</small>}</span>
                    </button>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="enn-practice" ref={practiceRef} aria-labelledby="enn-practice-h">
        <div className="section-title" id="enn-practice-h"><span className="pin" /> Luyện tập</div>
        <span className="hg-group-title">Nhóm số (để trống = trộn tất cả)</span>
        <div className="enn-chips">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={'chip enn-chip' + (cats.includes(c.id) ? ' on' : '')}
              aria-pressed={cats.includes(c.id)}
              onClick={() => toggle(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="enn-modes">
          {MODES.map((m) => {
            const best = state.best[m.id]
            const needVoice = m.id !== 'read' && !canHear
            return (
              <div key={m.id} className={'enn-mode' + ((best ?? 0) >= MASTERY ? ' done' : '')}>
                <b><Icon name={m.icon} size={16} /> {m.label}</b>
                <p>{m.desc}</p>
                {needVoice && <p className="enn-warn">Máy chưa có giọng đọc tiếng Anh — câu sẽ hiện bằng chữ thay cho âm thanh.</p>}
                {m.id === 'type' && dropped.length > 0 && (
                  <p className="enn-warn">
                    {dropped.map((c) => CATS.find((x) => x.id === c)!.label).join(', ')} không có ở chế độ gõ —{' '}
                    {allDropped ? 'lượt này dùng các nhóm số còn lại.' : 'lượt này chỉ dùng các nhóm khác bạn đã chọn.'}
                  </p>
                )}
                <div className="enn-mode-foot">
                  <small>{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · {ROUND} câu</small>
                  <button className="btn-primary sm" onClick={() => start(m.id)}><Icon name="play" size={14} /> Bắt đầu</button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
