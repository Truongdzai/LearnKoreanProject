import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { ALL_WORDS, UNITS, type IcesWord } from '@/data/englishCore'
import { useAppStore } from '@/store/app.store'
import { speakEN } from '../progress'

interface Q {
  word: IcesWord
  options: string[]
  answer: string
}

interface Props {
  /** Giới hạn đề trong các unit này (bài kiểm tra tuần); bỏ trống = toàn kho. */
  units?: string[]
  /** Nhãn hiển thị, vd "Bài kiểm tra Tuần 3". */
  heading?: string
  /** Điểm % cần đạt (bài kiểm tra tuần). */
  passPct?: number
  /** Gọi khi nộp bài, nhận điểm %. */
  onFinish?: (pct: number) => void
  /** Quay về lộ trình. */
  onBack?: () => void
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

function buildQuiz(pool: IcesWord[]): Q[] {
  const picked = shuffle(pool).slice(0, Math.min(QUIZ_LEN, pool.length))
  return picked.map((word) => {
    const distractors = shuffle(ALL_WORDS.filter((w) => w.vi !== word.vi))
      .slice(0, 3)
      .map((w) => w.vi)
    return { word, options: shuffle([word.vi, ...distractors]), answer: word.vi }
  })
}

export default function VocabQuiz({ units, heading, passPct, onFinish, onBack }: Props) {
  const { recordEvent } = useAppStore()
  const pool = useMemo(
    () => (units?.length ? UNITS.filter((u) => units.includes(u.id)).flatMap((u) => u.words) : ALL_WORDS),
    [units],
  )
  const [quiz, setQuiz] = useState<Q[]>(() => buildQuiz(pool))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = quiz[i]
  const finished = done || i >= quiz.length

  const restart = useCallback(() => {
    setQuiz(buildQuiz(pool))
    setI(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }, [pool])

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
      onFinish?.(Math.round((score / quiz.length) * 100))
    } else {
      setI((x) => x + 1)
      setPicked(null)
    }
  }

  const pct = useMemo(() => Math.round((score / quiz.length) * 100), [score, quiz.length])

  if (finished) {
    const band = pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt, ôn thêm nhé' : 'Cần ôn lại'
    const passed = passPct != null && pct >= passPct
    return (
      <div className="quiz-done">
        <div className="qd-ring" style={{ ['--p' as string]: pct }}>
          <b>{pct}%</b>
          <span>{score}/{quiz.length}</span>
        </div>
        <h3>{band}</h3>
        {passPct != null && (
          <div className={'quiz-pass' + (passed ? ' ok' : '')}>
            {passed ? <>✅ Đạt yêu cầu ({passPct}%) — nhiệm vụ kiểm tra của tuần đã hoàn thành!</> : <>Chưa chạm mốc {passPct}% — ôn lại từ rồi làm lại nhé.</>}
          </div>
        )}
        <p>Bạn trả lời đúng {score} trên {quiz.length} câu. Ôn lại bằng phương pháp lặp ngắt quãng để nhớ lâu hơn.</p>
        <div className="quiz-done-actions">
          <button className="btn-primary" onClick={restart}><Icon name="rocket" size={16} /> Làm lại đề mới</button>
          {onBack && <button className="btn-ghost" onClick={onBack}><Icon name="map" size={15} /> Về lộ trình</button>}
        </div>
      </div>
    )
  }

  return (
    <div className="quiz">
      {heading && (
        <div className="quiz-week-tag">
          <Icon name="target" size={14} /> {heading}{passPct != null && <> · cần đạt {passPct}%</>}
        </div>
      )}
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
