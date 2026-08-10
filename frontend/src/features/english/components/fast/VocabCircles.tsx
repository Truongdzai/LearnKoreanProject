import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import { VOCAB_CIRCLES, VOCAB_CIRCLE_NOTE } from '@/data/englishFast'
import { circleCounts, useFast } from '../../fast'
import { useLearnedWords } from '../../learned'

export default function VocabCircles() {
  const { fast, setCircle } = useFast()
  const { learned } = useLearnedWords('en')
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const words = useMemo(() => [...learned].sort((a, b) => a.localeCompare(b)), [learned])
  const counts = circleCounts(fast.circles, learned)

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = needle ? words.filter((w) => w.toLowerCase().includes(needle)) : words
    return list.slice(0, 120)
  }, [words, q])

  const level = (w: string) => fast.circles[w] ?? (learned.has(w) ? 1 : 0)

  const bump = (w: string) => {
    const cur = level(w)
    setCircle(w, cur >= 3 ? 1 : ((cur + 1) as 1 | 2 | 3))
  }

  const total = words.length

  return (
    <div className="vcircles">
      <div className="vcircles-head">
        <div>
          <b><Icon name="target" size={16} /> Ba vòng tròn từ vựng</b>
          <p>{VOCAB_CIRCLE_NOTE}</p>
        </div>
        <button className="btn-ghost sm" onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} /> {open ? 'Thu gọn' : 'Xếp từ vào vòng'}
        </button>
      </div>

      <div className="vcircles-row">
        {VOCAB_CIRCLES.map((c) => {
          const have = counts[c.id]
          const pct = c.target ? Math.min(100, Math.round((have / c.target) * 100)) : 0
          return (
            <div key={c.id} className={'vcircle ' + c.tone}>
              <div className="vcircle-top">
                <b>{c.name}</b>
                <small>{c.sub}</small>
              </div>
              <div className="vcircle-num">
                <b>{have}</b>
                <span>/ {c.target.toLocaleString('vi-VN')}</span>
              </div>
              <div className="vcircle-bar"><i style={{ width: `${pct}%` }} /></div>
              <p>{c.desc}</p>
            </div>
          )
        })}
      </div>

      {open && (
        <div className="vcircles-sort">
          <div className="vcircles-sort-head">
            <span>
              Bấm vào một từ để đẩy nó lên vòng trong: <b>Đọc → Nghe → Nói</b>. Bấm tiếp ở vòng Nói thì quay lại vòng Đọc.
              Chỉ đẩy khi bạn thật sự nghe ra / tự bật ra được — nói dối ở đây chỉ hại bạn.
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm từ…"
              className="vcircles-search"
              aria-label="Tìm từ"
            />
          </div>

          {!total ? (
            <p className="vcircles-empty">
              Chưa có từ nào được đánh dấu đã thuộc. Học vài từ ở phần bên dưới trước, chúng sẽ tự hiện ra đây.
            </p>
          ) : (
            <>
              <div className="vcircles-words">
                {shown.map((w) => {
                  const lv = level(w)
                  return (
                    <span key={w} className={'vcw lv' + lv}>
                      <button className="vcw-main" onClick={() => bump(w)} title="Đẩy lên vòng trong">
                        {w}
                        <i>{lv === 3 ? 'Nói' : lv === 2 ? 'Nghe' : 'Đọc'}</i>
                      </button>
                      <button className="vcw-say" onClick={() => speakEN(w)} aria-label={`Nghe ${w}`}>
                        <Icon name="volume" size={12} />
                      </button>
                    </span>
                  )
                })}
              </div>
              {shown.length < (q.trim() ? words.length : total) && (
                <p className="vcircles-more">
                  Đang hiện {shown.length} từ đầu tiên. Dùng ô tìm kiếm để tới từ bạn cần.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
