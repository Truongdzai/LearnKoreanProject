import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { PART_META, SKILLS } from '@/data/toeicCore'
import { lookupQuestion } from '../engine'
import { dueWrong, type WrongNote } from '../state'

interface Props {
  wrong: WrongNote[]
  onReview: (keys: string[]) => void
  onClear: () => void
}

interface Row extends WrongNote {
  label: string
  skill: string
}

const SIZES = [10, 20, 40]

export default function WrongBook({ wrong, onReview, onClear }: Props) {
  const [part, setPart] = useState<number | null>(null)

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = []
    for (const w of wrong) {
      const q = lookupQuestion(w.key)
      if (!q) continue
      out.push({ ...w, part: q.part, label: q.label, skill: q.skill })
    }
    return out.sort((a, b) => b.n - a.n || (a.t < b.t ? 1 : -1))
  }, [wrong])

  const byPart = useMemo(() => {
    const m: Record<number, number> = {}
    for (const r of rows) m[r.part] = (m[r.part] ?? 0) + 1
    return m
  }, [rows])

  const shown = part ? rows.filter((r) => r.part === part) : rows
  const repeated = rows.filter((r) => r.n >= 2).length
  const dueKeys = useMemo(() => new Set(dueWrong(wrong).map((w) => w.key)), [wrong])
  const due = rows.filter((r) => dueKeys.has(r.key))

  if (!rows.length) {
    return (
      <div className="toeic-wrongbook empty">
        <div className="tw-empty">
          <b>📓 Sổ tay câu sai đang trống</b>
          <p>
            Mỗi câu bạn làm sai ở bất kỳ chế độ nào (luyện theo Part, thi thử, luyện điểm yếu) sẽ tự
            được ghi vào đây để luyện lại đúng những câu đó. Làm đúng lại một câu thì câu đó được
            gạch khỏi sổ.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="toeic-wrongbook">
      <div className="tw-summary">
        <div className="tw-stat"><b>{rows.length}</b><span>câu đang nợ</span></div>
        <div className="tw-stat"><b>{repeated}</b><span>câu sai từ 2 lần</span></div>
        <div className="tw-stat"><b>{due.length}</b><span>đến hạn ôn hôm nay</span></div>
        <div className="tw-actions">
          {due.length > 0 && (
            <button className="btn-primary sm" onClick={() => onReview(due.map((r) => r.key))}>
              <Icon name="clock" size={14} /> Ôn {due.length} câu đến hạn
            </button>
          )}
          <button
            className={(due.length ? 'btn-ghost' : 'btn-primary') + ' sm'}
            disabled={shown.length === 0}
            onClick={() => onReview(shown.map((r) => r.key))}
          >
            <Icon name="rocket" size={14} /> Luyện tất cả {shown.length} câu
          </button>
          {SIZES.filter((n) => n < shown.length).map((n) => (
            <button key={n} className="btn-ghost sm" onClick={() => onReview(shown.slice(0, n).map((r) => r.key))}>
              Chỉ {n} câu nặng nhất
            </button>
          ))}
          <button className="btn-ghost sm" onClick={onClear}>Xoá sổ</button>
        </div>
      </div>

      <p className="toeic-hint">
        Câu sai nhiều lần được xếp lên đầu. Bài luyện chỉ hiện đúng câu bạn nợ — với Part 3/4 vẫn
        nghe trọn hội thoại, với Part 6/7 vẫn đọc trọn văn bản, nên bạn ôn lại đúng chỗ hổng mà
        không mất ngữ cảnh. Câu sai từ 2 lần <b>đến hạn ôn lại sau 2 ngày</b>, câu sai 1 lần sau 4
        ngày — đúng nhịp lặp lại ngắt quãng để nhớ lâu.
      </p>

      <div className="tw-filters">
        <button className={'tw-chip' + (part === null ? ' on' : '')} onClick={() => setPart(null)}>
          Tất cả ({rows.length})
        </button>
        {PART_META.filter((p) => byPart[p.part]).map((p) => (
          <button
            key={p.part}
            className={'tw-chip' + (part === p.part ? ' on' : '')}
            onClick={() => setPart(p.part)}
          >
            Part {p.part} ({byPart[p.part]})
          </button>
        ))}
      </div>

      <ol className="tw-list">
        {shown.slice(0, 60).map((r) => (
          <li key={r.key}>
            <div className="twl-head">
              <span className="twl-part">Part {r.part}</span>
              {SKILLS[r.skill] && <span className="twl-skill">{SKILLS[r.skill].vi}</span>}
              {r.n >= 2 && <span className="twl-n">sai {r.n} lần</span>}
            </div>
            <p lang={r.part >= 5 ? 'en' : undefined}>{r.label}</p>
          </li>
        ))}
      </ol>
      {shown.length > 60 && <p className="toeic-hint">…và {shown.length - 60} câu nữa.</p>}
    </div>
  )
}
