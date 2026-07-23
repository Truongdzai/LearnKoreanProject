import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { PART_META } from '@/data/toeicCore'
import type { ToeicAttempt } from '../state'

interface Props {
  attempts: ToeicAttempt[]
  onStart: (part: number, n: number) => void
}

const SIZES: Record<number, [number, number]> = {
  1: [3, 6], 2: [5, 10], 3: [3, 6], 4: [3, 6], 5: [8, 15], 6: [4, 8], 7: [4, 7],
}

export default function PartPractice({ attempts, onStart }: Props) {
  const [openTips, setOpenTips] = useState<number | null>(null)

  const stats = useMemo(() => {
    const m: Record<number, { n: number; correct: number }> = {}
    for (const a of attempts) {
      if (a.mode !== 'practice' || !a.part) continue
      const s = m[a.part] ?? { n: 0, correct: 0 }
      s.n += a.n
      s.correct += a.correct
      m[a.part] = s
    }
    return m
  }, [attempts])

  return (
    <div className="toeic-parts">
      <p className="toeic-hint">
        Chọn Part để luyện theo dạng đề thật. Câu nghe dùng <b>giọng thu sẵn chất lượng cao</b> (2 giọng nam/nữ,
        xen giọng Anh – Úc như đề 2026) — chạy được trên mọi máy, không cần cài gì.
        Kết quả từng câu được ghi vào <b>Phân tích</b> để tìm điểm yếu của bạn.
      </p>
      <div className="toeic-part-grid">
        {PART_META.map((p) => {
          const s = stats[p.part]
          const acc = s && s.n > 0 ? Math.round((s.correct / s.n) * 100) : null
          const [small, big] = SIZES[p.part]
          return (
            <div key={p.part} className={'toeic-part-card ' + p.section}>
              <div className="tp-head">
                <span className="tp-num">Part {p.part}</span>
                <span className="tp-sec">{p.section === 'listening' ? '🎧 Nghe' : '📖 Đọc'}</span>
                {acc != null && <span className={'tp-acc' + (acc >= 80 ? ' good' : acc < 55 ? ' bad' : '')}>{acc}%</span>}
              </div>
              <b>{p.name}</b>
              <p>{p.desc}</p>
              <small className="tp-real">Đề thật: {p.realCount} câu{s ? ` · bạn đã luyện ${s.n} câu` : ''}</small>
              <div className="tp-actions">
                <button className="btn-primary sm" onClick={() => onStart(p.part, small)}>Luyện {small} câu</button>
                <button className="btn-ghost sm" onClick={() => onStart(p.part, big)}>{big} câu</button>
                <button className="btn-ghost sm" onClick={() => setOpenTips(openTips === p.part ? null : p.part)}>
                  <Icon name="bulb" size={13} /> Chiến thuật
                </button>
              </div>
              {openTips === p.part && (
                <ul className="tp-tips">
                  {p.strategy.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
