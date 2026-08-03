import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakZH } from '@/core/tts'
import { CAPSULE_PASS, type HskCapsule } from '@/data/hskCore'
import PinyinText from './PinyinText'

interface Props {
  capsule: HskCapsule
  best?: number
  onDone: (pct: number) => void
  onBack: () => void
}

export default function HskCapsuleView({ capsule, best, onDone, onBack }: Props) {
  const [i, setI] = useState(-1)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [pinyin, setPinyin] = useState(true)

  const drills = capsule.drill
  const q = i >= 0 && i < drills.length ? drills[i] : null
  const finished = i >= drills.length

  const start = () => { setI(0); setPicked(null); setScore(0) }

  const next = () => {
    if (i + 1 >= drills.length) onDone(Math.round((score / drills.length) * 100))
    setI((x) => x + 1)
    setPicked(null)
  }

  const pick = (idx: number) => {
    if (picked != null || !q) return
    setPicked(idx)
    if (idx === q.answer) setScore((s) => s + 1)
  }

  return (
    <div className="capsule-view">
      <div className="cap-view-head">
        <button className="btn-ghost sm" onClick={onBack}>
          <Icon name="arrow-left" size={14} /> Danh sách
        </button>
        <div>
          <div className="cap-tag">HSK {capsule.level} · {capsule.tag}</div>
          <h3>{capsule.title}</h3>
        </div>
        {best != null && <span className={'cap-best' + (best >= CAPSULE_PASS ? ' ok' : '')}>Tốt nhất: {best}%</span>}
      </div>

      <div className="cap-points">
        {capsule.points.map((p, k) => (
          <div key={k} className="cap-point"><span>{k + 1}</span><p>{p}</p></div>
        ))}
      </div>

      <div className="cap-examples">
        {capsule.examples.map((ex, k) => (
          <div key={k} className="cap-ex">
            <div className="cap-ex-top">
              <b lang="zh">{ex.zh}</b>
              <button className="pron-play" title="Nghe" aria-label="Nghe câu ví dụ" onClick={() => speakZH(ex.zh)}>
                <Icon name="volume" size={14} />
              </button>
            </div>
            <em className="zh-py">{ex.py}</em>
            <small>{ex.vi}</small>
          </div>
        ))}
      </div>

      {i < 0 && (
        <div className="pron-test-intro">
          <p>Làm <b>{drills.length} câu</b> luyện tập của viên ngữ pháp này. Đạt <b>{CAPSULE_PASS}%</b> là hoàn thành.</p>
          <button className="btn-primary" onClick={start}><Icon name="target" size={15} /> Luyện tập</button>
        </div>
      )}

      {q && (
        <div className="cap-drill">
          <div className="quiz-top">
            <span>Câu {i + 1} / {drills.length}</span>
            <button className={'sp-filter' + (pinyin ? ' on' : '')} onClick={() => setPinyin((v) => !v)}>
              {pinyin ? 'Ẩn pinyin' : 'Hiện pinyin'}
            </button>
            <span className="quiz-score"><Icon name="star" size={13} /> {score} đúng</span>
          </div>
          <p className="cap-drill-q"><PinyinText text={q.text} show={pinyin} /></p>
          <div className="quiz-options">
            {q.options.map((o, k) => {
              let cls = 'quiz-opt'
              if (picked != null) {
                if (k === q.answer) cls += ' correct'
                else if (k === picked) cls += ' wrong'
              }
              return (
                <button key={k} className={cls} disabled={picked != null} onClick={() => pick(k)}>
                  <PinyinText text={o} show={pinyin} />
                </button>
              )
            })}
          </div>
          {picked != null && (
            <div className="quiz-foot">
              <div className="quiz-ex">{picked === q.answer ? '✅ ' : '❌ '}{q.explain}</div>
              <button className="btn-primary" onClick={next}>
                {i + 1 >= drills.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="quiz-done">
          <div className="qd-ring" style={{ ['--p' as string]: Math.round((score / drills.length) * 100) }}>
            <b>{Math.round((score / drills.length) * 100)}%</b>
            <span>{score}/{drills.length}</span>
          </div>
          <h3>{score / drills.length >= CAPSULE_PASS / 100 ? '🎉 Viên ngữ pháp này đạt rồi!' : 'Chưa đạt — đọc lại phần trên rồi thử lần nữa'}</h3>
          <div className="quiz-done-actions">
            <button className="btn-primary" onClick={start}><Icon name="rocket" size={15} /> Làm lại</button>
            <button className="btn-ghost" onClick={onBack}>Về danh sách</button>
          </div>
        </div>
      )}
    </div>
  )
}
