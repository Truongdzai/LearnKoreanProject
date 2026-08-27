import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { GRAMMAR_PASS, type GrammarLesson } from '@/data/englishGrammar'
import { GRAMMAR_LESSONS } from '@/data/englishGrammarData'
import { useAppStore } from '@/store/app.store'
import { speakEN, stopSpeak } from '@/core/tts'
import { useGrammarProgress } from '../progress'

interface Props {
  initialLesson?: string
}

export default function GrammarLessons({ initialLesson }: Props) {
  const { recordEvent } = useAppStore()
  const { grammar, record } = useGrammarProgress()
  const [openId, setOpenId] = useState<string | null>(initialLesson ?? null)

  const passedCount = GRAMMAR_LESSONS.filter((l) => (grammar.best[l.id] ?? 0) >= GRAMMAR_PASS).length

  const onDrillDone = useCallback((lesson: GrammarLesson, pct: number) => {
    if (record(lesson.id, pct)) recordEvent('grammar', 1)
  }, [record, recordEvent])

  const lesson = openId ? GRAMMAR_LESSONS.find((l) => l.id === openId) ?? null : null

  if (lesson) {
    return (
      <LessonView
        lesson={lesson}
        best={grammar.best[lesson.id]}
        onDrillDone={(pct) => onDrillDone(lesson, pct)}
        onBack={() => setOpenId(null)}
      />
    )
  }

  return (
    <div className="grammar-course">
      <div className="grammar-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Ngữ pháp giao tiếp — {passedCount}/{GRAMMAR_LESSONS.length} bài hoàn thành.</b>
          <p>Có vốn từ rồi thì cần khung câu để nói được. Mỗi bài: quy tắc ngắn → ví dụ nghe được → luyện 4 câu, đạt {GRAMMAR_PASS}% là xong (thưởng 10 XP lần đầu).</p>
        </div>
      </div>

      <div className="capsule-grid">
        {GRAMMAR_LESSONS.map((l, i) => {
          const best = grammar.best[l.id]
          const passed = (best ?? 0) >= GRAMMAR_PASS
          return (
            <button key={l.id} className={'capsule-card' + (passed ? ' done' : '')} onClick={() => setOpenId(l.id)}>
              <div className="cap-head">
                <span className="cap-num">{i + 1}</span>
                <span className="cap-tag">{l.tag}</span>
                {passed && <Icon name="check-circle" size={15} />}
              </div>
              <b>{l.title}</b>
              <small>{best != null ? `Luyện tốt nhất: ${best}%` : 'Chưa luyện'}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface ViewProps {
  lesson: GrammarLesson
  best?: number
  onDrillDone: (pct: number) => void
  onBack: () => void
}

function LessonView({ lesson, best, onDrillDone, onBack }: ViewProps) {
  const [i, setI] = useState(-1)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const drill = lesson.drill
  const q = i >= 0 ? drill[i] : null

  useEffect(() => () => stopSpeak(), [])

  const startDrill = () => { setI(0); setPicked(null); setScore(0); setFinished(false) }

  const choose = (oi: number) => {
    if (picked != null || !q) return
    setPicked(oi)
    if (oi === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (i + 1 >= drill.length) {
      setFinished(true)
      onDrillDone(Math.round((score / drill.length) * 100))
    } else {
      setI((x) => x + 1)
      setPicked(null)
    }
  }

  const pct = Math.round((score / drill.length) * 100)

  return (
    <div className="capsule-view">
      <div className="cap-view-head">
        <button className="btn-ghost sm" onClick={() => { stopSpeak(); onBack() }}>
          <Icon name="arrow-left" size={14} /> Danh sách
        </button>
        <div>
          <div className="cap-tag">{lesson.tag}</div>
          <h3>{lesson.title}</h3>
        </div>
        {best != null && <span className={'cap-best' + (best >= GRAMMAR_PASS ? ' ok' : '')}>Tốt nhất: {best}%</span>}
      </div>

      {i < 0 && (
        <>
          <ul className="cap-points">
            {lesson.points.map((p, k) => <li key={k}>{p}</li>)}
          </ul>
          <div className="cap-examples">
            {lesson.examples.map((ex, k) => (
              <div key={k} className="cap-ex">
                <p lang="en">
                  “{ex.en}”
                  <button className="wk-pt-sound" onClick={() => speakEN(ex.en)} title="Nghe câu mẫu">
                    <Icon name="volume" size={13} />
                  </button>
                </p>
                <small>{ex.vi}</small>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={startDrill}>
            <Icon name="target" size={15} /> Luyện {drill.length} câu — đạt {GRAMMAR_PASS}% để hoàn thành
          </button>
        </>
      )}

      {q && !finished && (
        <div className="cap-drill">
          <div className="quiz-top">
            <span>Câu {i + 1} / {drill.length}</span>
            <span className="quiz-score"><Icon name="star" size={13} /> {score} đúng</span>
          </div>
          <p className="tr-q" lang="en">{q.text}</p>
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              let cls = 'quiz-opt'
              if (picked != null) {
                if (oi === q.answer) cls += ' correct'
                else if (oi === picked) cls += ' wrong'
              }
              return (
                <button key={oi} className={cls} onClick={() => choose(oi)} disabled={picked != null}>
                  <span lang="en">{opt}</span>
                </button>
              )
            })}
          </div>
          {picked != null && (
            <div className="quiz-foot">
              <div className="quiz-ex">💡 {q.explain}</div>
              <button className="btn-primary" onClick={next}>
                {i + 1 >= drill.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="quiz-done">
          <div className="qd-ring" style={{ ['--p' as string]: pct }}>
            <b>{pct}%</b>
            <span>{score}/{drill.length}</span>
          </div>
          <h3>{pct >= GRAMMAR_PASS ? '✅ Bài ngữ pháp hoàn thành!' : 'Gần được rồi — đọc lại quy tắc và thử lại nhé'}</h3>
          <div className="quiz-done-actions">
            <button className="btn-ghost" onClick={startDrill}><Icon name="rocket" size={15} /> Luyện lại</button>
            <button className="btn-primary" onClick={onBack}><Icon name="arrow-left" size={15} /> Về danh sách</button>
          </div>
        </div>
      )}
    </div>
  )
}
