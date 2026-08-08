import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { PART_META, SKILLS } from '@/data/toeicCore'
import type { ReviewGroup, RunResult } from '../engine'

interface Props {
  res: RunResult
  onBack: () => void
  saveToWrongBook?: boolean
}

const LETTERS = ['A', 'B', 'C', 'D']
const SPEAKER_ICON: Record<string, string> = { M: '👨', W: '👩', M2: '🧔', W2: '👩‍🦰' }
const partName = (p: number) => PART_META.find((m) => m.part === p)?.name ?? `Part ${p}`

export default function TestReview({ res, onBack, saveToWrongBook = true }: Props) {
  const [wrongOnly, setWrongOnly] = useState(true)

  const groups = useMemo<ReviewGroup[]>(() => {
    if (!wrongOnly) return res.review
    return res.review
      .map((g) => ({ ...g, questions: g.questions.filter((q) => q.picked !== q.answer) }))
      .filter((g) => g.questions.length > 0)
  }, [res.review, wrongOnly])

  const wrongCount = res.total - res.correct

  return (
    <div className="toeic-review">
      <div className="tv-parts">
        <div className="tr-sec-title">Điểm theo từng Part</div>
        <div className="tv-part-grid">
          {PART_META.map((p) => {
            const st = res.partStats[p.part]
            if (!st) return null
            const [c, t] = st
            const pct = t ? Math.round((c / t) * 100) : 0
            return (
              <div key={p.part} className={'tv-part ' + p.section}>
                <span className="tv-part-num">Part {p.part}</span>
                <b className={pct >= 80 ? 'good' : pct < 55 ? 'bad' : ''}>{c}/{t}</b>
                <small>{partName(p.part)}</small>
              </div>
            )
          })}
        </div>
      </div>

      <div className="tv-toolbar">
        <div className="tv-filter">
          <button className={'tw-chip' + (wrongOnly ? ' on' : '')} onClick={() => setWrongOnly(true)}>
            Chỉ câu sai ({wrongCount})
          </button>
          <button className={'tw-chip' + (!wrongOnly ? ' on' : '')} onClick={() => setWrongOnly(false)}>
            Tất cả ({res.total})
          </button>
        </div>
        <div className="tv-actions">
          {wrongCount > 0 && saveToWrongBook && (
            <span className="tv-saved"><Icon name="note" size={14} /> {wrongCount} câu sai đã tự lưu vào Sổ tay</span>
          )}
          <button className="btn-ghost sm" onClick={onBack}>Đóng ôn bài</button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="toeic-hint">Tuyệt vời — không có câu nào sai để xem lại! Bấm "Tất cả" nếu muốn xem toàn bộ.</p>
      ) : (
        <div className="tv-list">
          {groups.map((g) => (
            <div key={g.id} className="tv-group">
              <div className="tv-group-head">
                <span className="tv-part-num">{partName(g.part)}</span>
                {g.intro && <span className="tv-intro">{g.intro}</span>}
                {g.passageTitle && <span className="tv-intro">{g.passageTitle}</span>}
              </div>

              {g.audio && (
                <details className="tv-context">
                  <summary>Xem lời thoại</summary>
                  <div className="tr-script">
                    {g.audio.map((l, i) => (
                      <p key={i}><b>{SPEAKER_ICON[l.s] ?? '👨'}</b> <span lang="en">{l.text}</span></p>
                    ))}
                  </div>
                </details>
              )}
              {g.img && (
                <div className={g.part >= 3 ? 'tr-photo chart' : 'tr-photo'}>
                  <img
                    src={g.img}
                    alt={g.part >= 3 ? 'Bảng/biểu đồ của nhóm câu hỏi' : 'Ảnh đề Part 1'}
                    loading="lazy"
                  />
                </div>
              )}
              {g.imgs?.map((src, i) => (
                <div key={src} className="tr-photo passage">
                  <img src={src} alt={`Đoạn văn ${i + 1} của nhóm câu hỏi`} loading="lazy" />
                </div>
              ))}
              {g.graphic && (
                <div className="tr-graphic" lang="en">
                  <b>{g.graphic.title}</b>
                  <table>
                    <thead><tr>{g.graphic.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                    <tbody>
                      {g.graphic.rows.map((row, ri) => (
                        <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                  {g.graphic.note && <small>{g.graphic.note}</small>}
                </div>
              )}
              {g.passage && (
                <details className="tv-context">
                  <summary>Xem văn bản</summary>
                  <pre className="tr-passage" lang="en">{g.passage}</pre>
                </details>
              )}

              {g.questions.map((q) => {
                const skipped = q.picked == null
                const wrong = !skipped && q.picked !== q.answer
                return (
                  <div key={q.key} className={'tv-q' + (wrong || skipped ? ' bad' : ' ok')}>
                    <p className="tv-q-text">
                      {q.num != null && <b>{q.num}. </b>}
                      {q.text ? <span lang={g.part >= 5 ? 'en' : undefined}>{q.text}</span> : <span>(câu nghe)</span>}
                    </p>
                    <div className="tv-opts">
                      {q.options.map((opt, oi) => {
                        let cls = 'tv-opt'
                        if (oi === q.answer) cls += ' correct'
                        else if (oi === q.picked) cls += ' picked-wrong'
                        return (
                          <div key={oi} className={cls}>
                            <span className="tr-letter">{LETTERS[oi]}</span>
                            <span lang="en">{opt}</span>
                            {oi === q.answer && <Icon name="check" size={14} />}
                            {oi === q.picked && oi !== q.answer && <Icon name="x-circle" size={14} />}
                          </div>
                        )
                      })}
                    </div>
                    <p className="tv-verdict">
                      {skipped ? '⚠️ Bạn bỏ trống câu này.' : wrong ? '❌ Bạn chọn sai.' : '✅ Bạn chọn đúng.'}
                    </p>
                    {(q.vi || q.explain || q.trap) && (
                      <div className="tr-explain">
                        {q.vi && <p>🇻🇳 {q.vi}</p>}
                        {q.explain && <p>💡 {q.explain}</p>}
                        {q.trap && <p>⚠️ {q.trap}</p>}
                      </div>
                    )}
                    {SKILLS[q.skill] && (
                      <div className="tr-tip">
                        <b>🎯 Mẹo dạng "{SKILLS[q.skill].vi}":</b> {SKILLS[q.skill].advice}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
