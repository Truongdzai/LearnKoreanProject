import { useEffect, useMemo, useRef, useState } from 'react'

import Icon from '@/core/components/Icon'
import {
  WRITE_REVISION, WRITE_SECTIONS, WRITE_SETS, WRITE_TASKS,
  countWords, usesWord, writeSection, type WriteTask,
} from '@/data/toeicSW'
import type { SwNote } from '../state'

interface Props {
  sw: Record<string, SwNote>
  jump?: string[] | null
  onJumpDone?: () => void
  onScore: (id: string, pct: number) => void
}

function mmss(s: number): string {
  const m = Math.floor(Math.max(0, s) / 60)
  const r = Math.max(0, s) % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function budget(list: WriteTask[]): number {
  return list[0]?.section === 'sentence' ? 8 * 60 : list.reduce((s, t) => s + t.minutes * 60, 0)
}

export default function WritingLab({ sw, jump, onJumpDone, onScore }: Props) {
  const [set, setSet] = useState(WRITE_SETS[0])
  const [run, setRun] = useState<WriteTask[] | null>(null)
  const [timed, setTimed] = useState(true)

  const tasks = useMemo(() => WRITE_TASKS.filter((t) => t.set === set), [set])

  useEffect(() => {
    if (!jump?.length) return
    const picked = jump.map((id) => WRITE_TASKS.find((t) => t.id === id)).filter((t): t is WriteTask => !!t)
    onJumpDone?.()
    if (!picked.length) return
    setSet(picked[0].set)
    setRun(picked)
  }, [jump])
  const done = tasks.filter((t) => sw[t.id]).length
  const avg = (() => {
    const vals = tasks.map((t) => sw[t.id]?.pct).filter((x): x is number => typeof x === 'number')
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  })()

  if (run) {
    return <WriteRunner run={run} timed={timed} sw={sw} onScore={onScore} onExit={() => setRun(null)} />
  }

  return (
    <div className="toeic-sw">
      <p className="toeic-hint">
        TOEIC Writing gồm <b>8 câu, khoảng 60 phút, thang 0–200</b>. Ở đây bạn gõ trực tiếp như thi
        thật, có đồng hồ đúng thời lượng từng nhóm câu, máy tự đếm từ và tự kiểm tra bạn đã dùng đủ
        hai từ bắt buộc chưa. Bài viết được giữ trong phiên làm việc này để bạn đối chiếu với bài mẫu.
      </p>

      <div className="sw-bar">
        <div className="sw-sets">
          {WRITE_SETS.map((s) => (
            <button key={s} className={'tw-chip' + (set === s ? ' on' : '')} onClick={() => setSet(s)}>
              Bộ đề {s}
            </button>
          ))}
        </div>
        <div className="sw-stat"><b>{done}/{tasks.length}</b><span>câu đã luyện</span></div>
        {avg != null && <div className="sw-stat"><b>{avg}%</b><span>tự chấm trung bình</span></div>}
        <label className="sw-toggle">
          <input type="checkbox" checked={timed} onChange={() => setTimed(!timed)} />
          <span>Bấm giờ như thi thật</span>
        </label>
      </div>

      {WRITE_SECTIONS.map((sec) => {
        const list = tasks.filter((t) => t.section === sec.id)
        if (!list.length) return null
        return (
          <div key={sec.id} className="sw-group">
            <div className="swg-head">
              <div>
                <b>{sec.range} · {sec.name}</b>
                <small>{sec.vi} — {sec.timing}</small>
              </div>
              {sec.id === 'sentence' && (
                <button className="btn-ghost sm" onClick={() => setRun(list)}>
                  Làm cả 5 câu trong 8 phút
                </button>
              )}
            </div>

            <div className="swg-crit">
              <span>Chấm theo:</span>
              {sec.criteria.map((c) => <i key={c}>{c}</i>)}
            </div>

            <div className="swg-cols">
              <div>
                <h5>Quy trình</h5>
                <ul>{sec.how.map((h, i) => <li key={i}>{h}</li>)}</ul>
              </div>
              <div>
                <h5>Lỗi thường gặp</h5>
                <ul className="bad">{sec.traps.map((h, i) => <li key={i}>{h}</li>)}</ul>
              </div>
            </div>

            <div className="swg-list">
              {list.map((t) => {
                const note = sw[t.id]
                const label = t.section === 'sentence'
                  ? `Ảnh + từ bắt buộc: ${t.words?.join(' / ')}`
                  : t.section === 'email'
                    ? `Email: ${t.mail?.subject}`
                    : t.brief.slice(0, 100) + '…'
                return (
                  <button key={t.id} className="swg-item" onClick={() => setRun([t])}>
                    <span className="swi-n">Câu {t.n}</span>
                    <span className="swi-txt">{label}</span>
                    {note ? <span className={'swi-pct' + (note.pct >= 80 ? ' good' : note.pct < 60 ? ' bad' : '')}>{note.pct}%</span>
                      : <span className="swi-pct new">chưa làm</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="sw-review">
        <h4><Icon name="bulb" size={16} /> Quy trình sửa bài ba lượt</h4>
        <div className="swr-grid">
          {WRITE_REVISION.map((r) => (
            <div key={r.title}><b>{r.title}</b><p>{r.body}</p></div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface RunnerProps {
  run: WriteTask[]
  timed: boolean
  sw: Record<string, SwNote>
  onScore: (id: string, pct: number) => void
  onExit: () => void
}

function WriteRunner({ run, timed, sw, onScore, onExit }: RunnerProps) {
  const sec = writeSection(run[0].section)
  const total = budget(run)

  const [phase, setPhase] = useState<'write' | 'review'>('write')
  const [left, setLeft] = useState(total)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [marks, setMarks] = useState<Record<string, Record<number, boolean>>>({})
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)
  const endRef = useRef(false)

  useEffect(() => {
    if (phase !== 'write' || !timed) return
    const id = window.setInterval(() => {
      setLeft((v) => {
        if (v > 1) return v - 1
        if (!endRef.current) { endRef.current = true; window.setTimeout(() => setPhase('review'), 0) }
        return 0
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase, timed])

  const setText = (id: string, v: string) => setTexts((p) => ({ ...p, [id]: v }))
  const toggle = (id: string, i: number) =>
    setMarks((p) => ({ ...p, [id]: { ...(p[id] ?? {}), [i]: !(p[id]?.[i]) } }))

  const pctOf = (t: WriteTask) =>
    Math.round((Object.values(marks[t.id] ?? {}).filter(Boolean).length / t.check.length) * 100)

  const saveAll = () => {
    for (const t of run) onScore(t.id, pctOf(t))
    setSaved(true)
  }

  const title = run.length > 1
    ? `Câu ${run[0].n}–${run[run.length - 1].n} · ${sec.name}`
    : `Câu ${run[0].n} · ${sec.name}`

  return (
    <div className="toeic-sw-run">
      <div className="lesson-head">
        <h2><Icon name="note" /> Writing · {title}</h2>
        <div className="meta">
          Bộ đề {run[0].set} · {sec.timing}
          {run.length === 1 && sw[run[0].id] ? ` · lần tốt nhất: ${sw[run[0].id].pct}%` : ''}
        </div>
      </div>

      {phase === 'write' && (
        <>
          <div className={'wr-bar' + (timed && left <= 60 ? ' hot' : '')}>
            <b>{timed ? mmss(left) : 'Không bấm giờ'}</b>
            <span>{timed ? `còn lại cho ${run.length > 1 ? 'cả nhóm' : 'câu này'}` : 'luyện thoải mái, bấm Nộp bài khi xong'}</span>
            <button className="btn-primary sm" onClick={() => setPhase('review')}>Nộp bài</button>
            <button className="btn-ghost sm" onClick={onExit}>Thoát</button>
          </div>

          {run.map((t) => (
            <WriteEditor key={t.id} task={t} value={texts[t.id] ?? ''} onChange={(v) => setText(t.id, v)} />
          ))}
        </>
      )}

      {phase === 'review' && (
        <>
          <p className="toeic-hint">
            Khi kiểm tra, <b>đọc lại đề trước rồi mới đọc bài của mình</b> — đó là cách nhanh nhất để
            phát hiện một yêu cầu bị bỏ sót. Sửa theo thứ tự nhiệm vụ → tổ chức → ngôn ngữ.
          </p>

          {run.map((t) => (
            <div key={t.id} className="wr-result">
              <div className="wrr-head">
                <b>Câu {t.n}</b>
                <span className="wrr-pct">{pctOf(t)}% tiêu chí</span>
              </div>

              {t.words && (
                <div className="wrr-words">
                  {t.words.map((w) => (
                    <span key={w} className={usesWord(texts[t.id] ?? '', w) ? 'ok' : 'miss'}>
                      <Icon name={usesWord(texts[t.id] ?? '', w) ? 'check' : 'x'} size={12} /> {w}
                    </span>
                  ))}
                  <span className="wrr-count">{countWords(texts[t.id] ?? '')} từ</span>
                </div>
              )}
              {!t.words && (
                <div className="wrr-words">
                  <span className="wrr-count">
                    {countWords(texts[t.id] ?? '')} từ
                    {t.minWords ? ` · bài hiệu quả thường từ khoảng ${t.minWords} từ trở lên` : ''}
                  </span>
                </div>
              )}

              <div className="wrr-mine">
                <small>Bài của bạn</small>
                <pre lang="en">{texts[t.id]?.trim() || '(chưa viết gì)'}</pre>
              </div>

              <div className="sr-check">
                {t.check.map((c, i) => (
                  <label key={i} className={'sr-item' + (marks[t.id]?.[i] ? ' on' : '')}>
                    <input type="checkbox" checked={!!marks[t.id]?.[i]} onChange={() => toggle(t.id, i)} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>

              <button className="btn-ghost sm" onClick={() => setOpen((p) => ({ ...p, [t.id]: !p[t.id] }))}>
                <Icon name={open[t.id] ? 'chevron-up' : 'chevron-down'} size={14} />
                {open[t.id] ? ' Ẩn bài mẫu' : ' Xem bài mẫu và lời giải thích'}
              </button>
              {open[t.id] && (
                <div className="sr-sample">
                  <h5>Bài mẫu</h5>
                  <pre lang="en">{t.sample}</pre>
                  <h5>Vì sao mẫu này đạt</h5>
                  <p>{t.why}</p>
                </div>
              )}
            </div>
          ))}

          <div className="sr-actions">
            <button className="btn-primary" onClick={saveAll} disabled={saved}>
              <Icon name="check" size={15} /> {saved ? 'Đã lưu kết quả' : 'Lưu kết quả tự chấm'}
            </button>
            <button className="btn-ghost" onClick={onExit}>
              <Icon name="arrow-left" size={14} /> Quay lại danh sách
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function WriteEditor({ task, value, onChange }: { task: WriteTask; value: string; onChange: (v: string) => void }) {
  const words = countWords(value)
  return (
    <div className="wr-task">
      <div className="wrt-head">
        <b>Câu {task.n}</b>
        <span>{words} từ{task.minWords ? ` / khoảng ${task.minWords}+` : ''}</span>
      </div>

      {task.img && <img className="sr-img" src={task.img} alt={task.imgAlt ?? 'Ảnh mô tả'} />}

      {task.words && (
        <div className="wrt-words">
          <span>Từ bắt buộc:</span>
          {task.words.map((w) => (
            <i key={w} className={usesWord(value, w) ? 'ok' : ''} lang="en">{w}</i>
          ))}
        </div>
      )}

      {task.mail && (
        <div className="wrt-mail">
          <div className="wrtm-head">
            <span><b>From:</b> <span lang="en">{task.mail.from}</span></span>
            <span><b>To:</b> <span lang="en">{task.mail.to}</span></span>
            <span><b>Subject:</b> <span lang="en">{task.mail.subject}</span></span>
          </div>
          <p lang="en">{task.mail.body}</p>
        </div>
      )}

      <p className="wrt-brief" lang={task.section === 'essay' ? 'en' : undefined}>{task.brief}</p>

      <textarea
        className="wrt-input"
        lang="en"
        spellCheck={false}
        rows={task.section === 'sentence' ? 2 : task.section === 'email' ? 10 : 16}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={task.section === 'sentence' ? 'Viết đúng MỘT câu…' : 'Viết bài của bạn ở đây…'}
      />
    </div>
  )
}
