import { useCallback, useEffect, useState } from 'react'
import { fetchDue, reviewCard } from '@/core/api/srs.api'
import type { SrsCard, SrsStats, SrsRating } from '@/models/srs.model'
import Spinner from '@/core/components/Spinner'
import Icon from '@/core/components/Icon'

const RATES: { r: SrsRating; label: string; cls: string; key: string }[] = [
  { r: 1, label: 'Lại', cls: 'again', key: '1' },
  { r: 2, label: 'Khó', cls: 'hard', key: '2' },
  { r: 3, label: 'Tốt', cls: 'good', key: '3' },
  { r: 4, label: 'Dễ', cls: 'easy', key: '4' },
]

function hint(card: SrsCard, rating: SrsRating): string {
  const { reps, ivl, ease } = card
  let d = 0
  if (rating === 1) d = 0
  else if (rating === 2) d = Math.max(1, Math.round((ivl || 1) * 1.2))
  else if (rating === 4) d = reps === 0 ? 4 : Math.max(1, Math.round(ivl * ease * 1.3))
  else d = reps === 0 ? 1 : reps === 1 ? 6 : Math.max(1, Math.round(ivl * ease))
  if (d === 0) return 'lát nữa'
  if (d === 1) return '1 ngày'
  if (d < 30) return d + ' ngày'
  return Math.round(d / 30) + ' tháng'
}

export default function ReviewPage() {
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<SrsCard[]>([])
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState<SrsStats | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await fetchDue()
      setQueue(d.cards)
      setStats({ total: d.total, due: d.due, new: d.new, learned: d.learned, reviewed_today: d.reviewed_today })
      setI(0)
      setRevealed(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const card = queue[i]

  const rate = useCallback(
    async (rating: SrsRating) => {
      if (!card) return
      try {
        await reviewCard(card.id, rating)
      } catch {}
      setQueue((q) => (rating === 1 ? [...q, card] : q))
      setI((x) => x + 1)
      setRevealed(false)
    },
    [card],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return
      if ((e.key === ' ' || e.key === 'Enter') && !revealed) {
        e.preventDefault()
        setRevealed(true)
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        rate(Number(e.key) as SrsRating)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, revealed, rate])

  if (loading) {
    return (
      <div className="center-state">
        <div><Spinner /><p>Đang tải bộ thẻ…</p></div>
      </div>
    )
  }

  const done = !card
  const reviewedThisSession = i

  return (
    <>
      <div className="lesson-head">
        <h2><Icon name="cards" /> Ôn tập</h2>
        <div className="meta">Lặp lại ngắt quãng — học ngay trong web, không cần Anki.</div>
      </div>

      {stats && (
        <div className="srs-stats">
          <div className="stat"><b>{stats.due}</b><span>đến hạn</span></div>
          <div className="stat"><b>{stats.total}</b><span>tổng thẻ</span></div>
          <div className="stat"><b>{stats.new}</b><span>thẻ mới</span></div>
          <div className="stat"><b>{stats.reviewed_today}</b><span>đã ôn hôm nay</span></div>
        </div>
      )}

      {done ? (
        <div className="soon" style={{ marginTop: 18 }}>
          <div className="big"><Icon name={stats && stats.total === 0 ? 'cards' : 'party'} /></div>
          {stats && stats.total === 0 ? (
            <>
              <h3>Chưa có thẻ nào</h3>
              <p>Khi học video, bấm <b>“+ Lưu”</b> ở mỗi câu hoặc bấm vào từ rồi <b>“+ Lưu từ”</b> để thêm thẻ vào đây.</p>
            </>
          ) : (
            <>
              <h3>Tuyệt vời! Xong thẻ đến hạn hôm nay</h3>
              <p>Bạn đã ôn {reviewedThisSession} thẻ trong phiên này. Quay lại sau để ôn tiếp nhé.</p>
            </>
          )}
        </div>
      ) : (
        <div className="review-wrap">
          <div className="review-progress">Còn lại {queue.length - i} thẻ</div>
          <div className="flashcard">
            <div className="fc-front" lang="ko">{card.front}</div>
            {revealed ? (
              <>
                <div className="fc-divider" />
                <div className="fc-back">{card.back || '—'}</div>
                {card.source && <div className="fc-source">{card.source}</div>}
              </>
            ) : (
              <button className="reveal-btn" onClick={() => setRevealed(true)}>
                Hiện đáp án <span className="kbd">Space</span>
              </button>
            )}
          </div>

          {revealed && (
            <div className="rate-row">
              {RATES.map((x) => (
                <button key={x.r} className={'rate ' + x.cls} onClick={() => rate(x.r)}>
                  <span className="rate-label">{x.label}</span>
                  <span className="rate-hint">{hint(card, x.r)}</span>
                  <span className="kbd">{x.key}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
