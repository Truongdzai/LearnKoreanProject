import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { ALL_WORDS, type IcesWord } from '@/data/englishCore'
import { useAppStore } from '@/store/app.store'
import { speakEN } from '../progress'

interface Q {
  word: IcesWord
  options: string[]
  answer: string
}

const QUIZ_LEN = 10

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuiz(): Q[] {
  const pool = shuffle(ALL_WORDS).slice(0, QUIZ_LEN)
  return pool.map((word) => {
    const distractors = shuffle(ALL_WORDS.filter((w) => w.vi !== word.vi))
      .slice(0, 3)
      .map((w) => w.vi)
    return { word, options: shuffle([word.vi, ...distractors]), answer: word.vi }
  })
}

export default function VocabQuiz() {
  const { recordEvent } = useAppStore()
  const [quiz, setQuiz] = useState<Q[]>(() => buildQuiz())
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = quiz[i]
  const finished = done || i >= quiz.length

  const restart = useCallback(() => {
    setQuiz(buildQuiz())
    setI(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }, [])

  useEffect(() => {
    if (q) speakEN(q.word.en)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  const choose = (opt: string) => {
    if (picked) return
    setPicked(opt)
    if (opt === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (i + 1 >= quiz.length) {
      setDone(true)
      recordEvent('review', 1, 0, 0)
    } else {
      setI((x) => x + 1)
      setPicked(null)
    }
  }

  const pct = useMemo(() => Math.round((score / quiz.length) * 100), [score, quiz.length])

  if (finished) {
    const band = pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt, ôn thêm nhé' : 'Cần ôn lại'
    return (
      <div className="quiz-done">
        <div className="qd-ring" style={{ ['--p' as string]: pct }}>
          <b>{pct}%</b>
          <span>{score}/{quiz.length}</span>
        </div>
        <h3>{band}</h3>
        <p>Bạn trả lời đúng {score} trên {quiz.length} câu. Ôn lại bằng phương pháp lặp ngắt quãng để nhớ lâu hơn.</p>
        <button className="btn-primary" onClick={restart}><Icon name="rocket" size={16} /> Làm lại đề mới</button>
      </div>
    )
  }

  return (
    <div className="quiz">
      <div className="quiz-top">
        <span>Câu {i + 1} / {quiz.length}</span>
        <span className="quiz-score"><Icon name="star" size={14} /> {score} điểm</span>
      </div>
      <div className="quiz-bar"><div style={{ width: `${(i / quiz.length) * 100}%` }} /></div>

      <div className="quiz-card">
        <div className="quiz-img">{q.word.img}</div>
        <h2 lang="en">{q.word.en} <button className="ices-sound inline" onClick={() => speakEN(q.word.en)}><Icon name="volume" size={16} /></button></h2>
        <p className="quiz-ask">Từ này nghĩa là gì?</p>
      </div>

      <div className="quiz-options">
        {q.options.map((opt) => {
          let cls = 'quiz-opt'
          if (picked) {
            if (opt === q.answer) cls += ' correct'
            else if (opt === picked) cls += ' wrong'
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)} disabled={!!picked}>
              {opt}
              {picked && opt === q.answer && <Icon name="check" size={16} />}
              {picked && opt === picked && opt !== q.answer && <Icon name="x-circle" size={16} />}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="quiz-foot">
          <div className="quiz-ex">
            <b lang="en">{q.word.en}</b> {q.word.ipa} — “{q.word.ex}” <span>({q.word.exVi})</span>
          </div>
          <button className="btn-primary" onClick={next}>
            {i + 1 >= quiz.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
