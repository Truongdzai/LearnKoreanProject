import { useMemo } from 'react'
import Icon from '@/core/components/Icon'
import { MASTERY, levelOf, senseRatio, useDeep, type WordProgress } from './deep'
import { RICHEST_WORDS, STATIC_PROFILE_COUNT } from './profiles'
import { findDeepWord } from './wordData'

interface Props {
  onOpen: (term: string) => void
}

interface Row {
  term: string
  prog: WordProgress
  lv: number
}

export default function MasteryRoom({ onOpen }: Props) {
  const { state, studied, mastered } = useDeep()

  const rows = useMemo<Row[]>(
    () => Object.entries(state.words)
      .map(([term, prog]) => ({ term, prog, lv: levelOf(prog) }))
      .sort((a, b) => b.lv - a.lv || b.prog.senses.length - a.prog.senses.length),
    [state.words],
  )

  const spread = useMemo(() => {
    const bag = [0, 0, 0, 0, 0, 0]
    for (const r of rows) bag[r.lv] += 1
    return bag
  }, [rows])

  const doing = rows.filter((r) => r.lv > 0 && r.lv < 4).slice(0, 8)
  const next = RICHEST_WORDS
    .filter((w) => !state.words[w.term] && findDeepWord(w.term))
    .slice(0, 10)

  return (
    <div className="mr">
      <div className="mr-head">
        <div>
          <h3><Icon name="book" size={18} /> Phòng làm chủ từ vựng</h3>
          <p>
            Thuộc nghĩa đầu tiên của một từ mới chỉ là bước một. Một từ phổ thông thường mang 5–12 nghĩa,
            và nghĩa bạn chưa biết mới là nghĩa làm bạn nghe hụt trong phim, trong họp hành.
            Trang học sâu mở ra <b>tất cả các nghĩa</b> của từ, cụm đi kèm, họ từ và những từ dễ nhầm —
            rồi chấm bạn theo 5 mức làm chủ.
          </p>
        </div>
        <div className="mr-nums">
          <div><b>{studied}</b><span>từ đã học sâu</span></div>
          <div><b>{mastered}</b><span>từ đã làm chủ</span></div>
          <div><b>{STATIC_PROFILE_COUNT.toLocaleString('vi-VN')}</b><span>từ có hồ sơ đủ nghĩa</span></div>
        </div>
      </div>

      <div className="mr-levels">
        {MASTERY.slice(1).map((m) => (
          <div key={m.lv} className="mr-lv">
            <span className={'mr-lvbadge ' + m.tone}>{m.lv}</span>
            <div>
              <b>{m.name}</b>
              <small>{m.desc}</small>
            </div>
            <em>{spread[m.lv]}</em>
          </div>
        ))}
      </div>

      {doing.length > 0 && (
        <div className="mr-block">
          <h4>Đang học dở — quay lại cho xong</h4>
          <div className="mr-cards">
            {doing.map((r) => {
              const pct = Math.round(senseRatio(r.prog) * 100)
              return (
                <button key={r.term} className="mr-card" onClick={() => onOpen(r.term)}>
                  <div className="mr-cardtop">
                    <b>{r.term}</b>
                    <span className={'mr-lvbadge sm ' + MASTERY[r.lv].tone}>{r.lv}</span>
                  </div>
                  <div className="mr-bar"><i style={{ width: `${pct}%` }} /></div>
                  <small>
                    {r.prog.total
                      ? `${r.prog.senses.length}/${r.prog.total} nghĩa đã nắm`
                      : `${r.prog.senses.length} nghĩa đã nắm`}
                  </small>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {next.length > 0 && (
        <div className="mr-block">
          <h4>Nên học sâu trước — những từ nhiều nghĩa nhất</h4>
          <p className="mr-note">
            Đây là các từ mà một nghĩa không đủ dùng: mỗi từ dưới đây mang từng ấy nghĩa khác nhau trong đời thường.
          </p>
          <div className="mr-chips">
            {next.map((w) => (
              <button key={w.term} className="mr-chip" onClick={() => onOpen(w.term)}>
                {w.term} <em>{w.n} nghĩa</em>
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="mr-cta" onClick={() => onOpen('')}>
        <Icon name="search" size={16} /> Mở trang học sâu — tra bất kỳ từ nào trong kho
        <Icon name="arrow-right" size={16} />
      </button>
    </div>
  )
}
