import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { englishVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import TenseQuiz from './TenseQuiz'
import { FRAMES, GROUPS, ROUND, TENSES, buildRound, groupOf, type GroupId, type TenseId } from './frames'
import { MASTERY, useTenseProgress, type Result, type RoundKind } from './progress'
import './styles.css'

// Bảng dấu hiệu: thì nào đi với từ nào
const SIGNS: { tense: TenseId; words: string; form: string; ex: string }[] = [
  { tense: 'ps', words: 'every day, usually, always, often, sometimes', form: 'V / V-s', ex: 'She goes to work by bus.' },
  { tense: 'pc', words: 'now, at the moment, Look!, Listen!', form: 'am / is / are + V-ing', ex: 'Look! It\'s raining.' },
  { tense: 'past', words: 'yesterday, last week, … ago, in 2010', form: 'V2 · didn\'t + V', ex: 'I saw him yesterday.' },
  { tense: 'pastc', words: 'at 8 p.m. yesterday, while …', form: 'was / were + V-ing', ex: 'I was cooking when you called.' },
  { tense: 'pp', words: 'since, for (đến nay), ever, never, just, yet', form: 'have / has + V3', ex: 'I have lived here since 2018.' },
  { tense: 'will', words: 'tomorrow, next year, I think, maybe', form: 'will + V', ex: 'Maybe it will rain tomorrow.' },
]

export default function TenseLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useTenseProgress()
  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  const [groups, setGroups] = useState<GroupId[]>([])
  const [quiz, setQuiz] = useState<{ kind: RoundKind; items: ReturnType<typeof buildRound>; n: number } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])

  // Chọn đủ 4 nhóm cũng tính là lượt trộn
  const kind: RoundKind = groups.length && groups.length < GROUPS.length ? 'focus' : 'mix'

  const start = (k: RoundKind = kind, g: GroupId[] = groups) => {
    setQuiz((q) => ({ kind: k, items: buildRound(k === 'mix' ? [] : g, state.weak), n: (q?.n ?? 0) + 1 }))
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
      <div className="et-lab">
        <TenseQuiz
          key={quiz.n}
          items={quiz.items}
          title={quiz.kind === 'mix' ? 'Trộn các thì' : 'Nhóm đã chọn'}
          canHear={canHear}
          onFinish={onFinish}
          onAgain={() => start(quiz.kind)}
          onBack={back}
        />
      </div>
    )
  }

  const toggle = (g: GroupId) => setGroups((l) => (l.includes(g) ? l.filter((x) => x !== g) : [...l, g]))
  const acc = (t: TenseId) => {
    const v = state.stats[t]
    return v && v[1] ? Math.round((v[0] / v[1]) * 100) : null
  }
  const count = FRAMES.filter((f) => kind === 'mix' || groups.includes(groupOf(f))).length

  return (
    <div className="et-lab">
      <div className="grammar-intro">
        <Icon name="clock" size={20} />
        <div>
          <b>Chọn thì theo dấu hiệu</b>
          <p>
            Tiếng Việt không chia động từ — "tôi đi" dùng cho hôm qua, hôm nay hay ngày mai đều được. Tiếng Anh thì phải đổi
            dạng theo thời gian, và câu thường có sẵn "dấu hiệu" để nhận ra: yesterday, since, now, every day… Tập nhìn dấu hiệu
            rồi chọn đúng dạng.
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

      <section className="et-signs" aria-labelledby="et-signs-h">
        <div className="section-title" id="et-signs-h"><span className="pin" /> Dấu hiệu nhận biết</div>
        <div className="et-sign-grid">
          {SIGNS.map((s) => {
            const a = acc(s.tense)
            return (
              <article key={s.tense} className="et-sign">
                <h3>{TENSES[s.tense].name}{a != null && <small>{a}% đúng</small>}</h3>
                <p className="et-words" lang="en">{s.words}</p>
                <p className="et-form" lang="en">{s.form}</p>
                <p className="et-ex" lang="en">{s.ex}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="et-practice" ref={practiceRef} aria-labelledby="et-practice-h">
        <div className="section-title" id="et-practice-h"><span className="pin" /> Luyện tập</div>
        <span className="hg-group-title">Nhóm thì (để trống = trộn tất cả)</span>
        <div className="et-chips">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={'chip et-chip' + (groups.includes(g.id) ? ' on' : '')}
              aria-pressed={groups.includes(g.id)}
              onClick={() => toggle(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className={'et-mode' + ((state.best.mix ?? 0) >= MASTERY ? ' done' : '')}>
          <div>
            <b><Icon name="target" size={16} /> {kind === 'mix' ? 'Lượt trộn đủ các thì' : 'Lượt theo nhóm đã chọn'}</b>
            <p>
              {ROUND} câu trong {count}, câu từng sai được hỏi lại nhiều hơn.
              {kind === 'focus' && ' Lượt theo nhóm để ôn riêng; lộ trình chỉ tính lượt trộn.'}
            </p>
          </div>
          <div className="et-mode-foot">
            <small>{state.best.mix != null ? `Trộn tốt nhất: ${state.best.mix}%` : 'Chưa có lượt trộn'}</small>
            <button className="btn-primary sm" onClick={() => start()}><Icon name="play" size={14} /> Bắt đầu</button>
          </div>
        </div>
      </section>
    </div>
  )
}
