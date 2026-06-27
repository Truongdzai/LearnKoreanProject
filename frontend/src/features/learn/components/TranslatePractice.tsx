import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { nativeLangViName } from '@/core/constants/languages'
import type { Lesson } from '@/models/lesson.model'

const norm = (s: string) =>
  s.toLowerCase().normalize('NFC').replace(/[.,!?;:"'()]/g, '').trim()

/** crude token-overlap similarity 0–100 */
function score(answer: string, ref: string): number {
  const a = norm(answer).split(/\s+/).filter(Boolean)
  const b = norm(ref).split(/\s+/).filter(Boolean)
  if (!a.length || !b.length) return 0
  const setB = new Set(b)
  const hit = a.filter((w) => setB.has(w)).length
  return Math.round((hit / b.length) * 100)
}

function band(n: number) {
  if (n >= 80) return { t: 'Tuyệt vời!', c: 'good' }
  if (n >= 50) return { t: 'Khá tốt', c: 'mid' }
  if (n >= 20) return { t: 'Cần cố gắng', c: 'low' }
  return { t: 'Thử lại nhé', c: 'low' }
}

export default function TranslatePractice({ lesson }: { lesson: Lesson }) {
  const { learnLang, nativeLang } = useAppStore()
  const items = useMemo(() => lesson.segments.filter((s) => s.vi), [lesson])
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [scores, setScores] = useState<number[]>([])

  if (!items.length) return <div className="empty"><div className="big">📝</div>Bài học này chưa có bản dịch để luyện.</div>

  const cur = items[i]
  const sc = revealed ? score(val, cur.vi || '') : 0
  const b = band(sc)

  const check = () => { if (val.trim()) setRevealed(true) }
  const next = () => {
    const ns = [...scores, sc]
    if (i + 1 >= items.length) { setScores(ns); setDone(true); return }
    setScores(ns); setI(i + 1); setVal(''); setRevealed(false)
  }
  const restart = () => { setI(0); setVal(''); setRevealed(false); setDone(false); setScores([]) }

  if (done) {
    const avg = Math.round(scores.reduce((a, c) => a + c, 0) / scores.length)
    return (
      <div className="tp-done">
        <div className="tp-done-ic"><Icon name="trophy" size={34} /></div>
        <h3>Hoàn thành luyện dịch!</h3>
        <p>Điểm trung bình của bạn</p>
        <div className="tp-score-big">{avg}<small>/100</small></div>
        <button className="btn-primary" onClick={restart}><Icon name="arrow-left" size={15} /> Luyện lại</button>
      </div>
    )
  }

  return (
    <div className="tp">
      <div className="tp-progress">
        <span>Câu {i + 1}/{items.length}</span>
        <div className="tp-bar"><span style={{ width: ((i + (revealed ? 1 : 0)) / items.length) * 100 + '%' }} /></div>
      </div>

      <div className="tp-card">
        <div className="tp-label">Dịch câu sau sang {nativeLangViName(nativeLang)}</div>
        <div className="tp-ko" lang={learnLang}>{cur.ko}</div>

        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); revealed ? next() : check() } }}
          placeholder="Nhập bản dịch của bạn…"
          disabled={revealed}
          rows={2}
        />

        {revealed && (
          <div className={'tp-result ' + b.c}>
            <div className="tp-result-head"><b>{b.t}</b><span className="tp-pct">{sc}%</span></div>
            <div className="tp-ref"><span>Đáp án tham khảo:</span> {cur.vi}</div>
          </div>
        )}

        <div className="tp-actions">
          {!revealed ? (
            <button className="btn-primary" disabled={!val.trim()} onClick={check}><Icon name="check" size={16} /> Kiểm tra</button>
          ) : (
            <button className="btn-primary" onClick={next}>{i + 1 >= items.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={16} /></button>
          )}
        </div>
      </div>
    </div>
  )
}
