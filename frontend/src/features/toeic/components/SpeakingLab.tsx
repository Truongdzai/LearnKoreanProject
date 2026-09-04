import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN, stopSpeak } from '@/core/tts'
import {
  SPEAK_SECTIONS, SPEAK_SELF_REVIEW, SPEAK_SETS, SPEAK_TASKS,
  speakSection, type SpeakTask,
} from '@/data/toeicSW'
import { useTake, type TakeError } from '../useTake'
import type { SwNote } from '../state'

interface Props {
  sw: Record<string, SwNote>
  jump?: string[] | null
  onJumpDone?: () => void
  onScore: (id: string, pct: number) => void
}

type Phase = 'ready' | 'prep' | 'answer' | 'review'

const MIC_TEXT: Record<Exclude<TakeError, ''>, string> = {
  denied: 'Trình duyệt đang chặn micrô. Bấm biểu tượng 🔒 trên thanh địa chỉ → cho phép Micro → làm lại câu này.',
  nomic: 'Không tìm thấy micrô nào. Cắm tai nghe có mic rồi làm lại câu này.',
  busy: 'Micrô đang bị ứng dụng khác giữ (Zoom, Meet, phần mềm ghi màn hình…). Tắt ứng dụng đó rồi làm lại.',
  other: 'Không mở được micrô trên máy này.',
}

function mmss(s: number): string {
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`
}

export default function SpeakingLab({ sw, jump, onJumpDone, onScore }: Props) {
  const [set, setSet] = useState(SPEAK_SETS[0])
  const [run, setRun] = useState<SpeakTask[] | null>(null)
  const [at, setAt] = useState(0)

  const tasks = useMemo(() => SPEAK_TASKS.filter((t) => t.set === set), [set])

  useEffect(() => {
    if (!jump?.length) return
    const picked = jump.map((id) => SPEAK_TASKS.find((t) => t.id === id)).filter((t): t is SpeakTask => !!t)
    onJumpDone?.()
    if (!picked.length) return
    setSet(picked[0].set)
    setAt(0)
    setRun(picked)
  }, [jump])

  const done = tasks.filter((t) => sw[t.id]).length
  const avg = (() => {
    const vals = tasks.map((t) => sw[t.id]?.pct).filter((x): x is number => typeof x === 'number')
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  })()

  if (run) {
    return (
      <SpeakRunner
        run={run}
        at={at}
        best={sw[run[at].id]?.pct}
        onScore={onScore}
        onNext={() => (at + 1 < run.length ? setAt(at + 1) : setRun(null))}
        onExit={() => setRun(null)}
      />
    )
  }

  const start = (list: SpeakTask[]) => { setAt(0); setRun(list) }

  return (
    <div className="toeic-sw">
      <p className="toeic-hint">
        TOEIC Speaking gồm <b>11 câu, khoảng 20 phút, thang 0–200</b>. Mỗi câu ở đây chạy đúng thời
        gian chuẩn bị và thời gian trả lời của bài thi thật: hết giờ chuẩn bị là micrô tự bật, hết
        giờ trả lời là tự dừng. Bản ghi chỉ nằm trong phiên làm việc này, không được tải lên đâu cả.
      </p>

      <div className="sw-bar">
        <div className="sw-sets">
          {SPEAK_SETS.map((s) => (
            <button key={s} className={'tw-chip' + (set === s ? ' on' : '')} onClick={() => setSet(s)}>
              Bộ đề {s}
            </button>
          ))}
        </div>
        <div className="sw-stat">
          <b>{done}/{tasks.length}</b><span>câu đã luyện</span>
        </div>
        {avg != null && <div className="sw-stat"><b>{avg}%</b><span>tự chấm trung bình</span></div>}
        <button className="btn-primary sm" onClick={() => start(tasks)}>
          <Icon name="rocket" size={14} /> Làm cả bộ 11 câu
        </button>
      </div>

      {SPEAK_SECTIONS.map((sec) => {
        const list = tasks.filter((t) => t.section === sec.id)
        if (!list.length) return null
        return (
          <div key={sec.id} className="sw-group">
            <div className="swg-head">
              <div>
                <b>{sec.range} · {sec.name}</b>
                <small>{sec.vi} — {sec.timing}</small>
              </div>
              <button className="btn-ghost sm" onClick={() => start(list)}>
                Làm nhóm này ({list.length} câu)
              </button>
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
                return (
                  <button key={t.id} className="swg-item" onClick={() => start([t])}>
                    <span className="swi-n">Câu {t.n}</span>
                    <span className="swi-txt">
                      {t.prompt ?? (t.text ? t.text.slice(0, 90) + '…' : 'Mô tả bức tranh')}
                    </span>
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
        <h4><Icon name="bulb" size={16} /> Nghe lại bản ghi theo ba lượt</h4>
        <div className="swr-grid">
          {SPEAK_SELF_REVIEW.map((r) => (
            <div key={r.title}><b>{r.title}</b><p>{r.body}</p></div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface RunnerProps {
  run: SpeakTask[]
  at: number
  best?: number
  onScore: (id: string, pct: number) => void
  onNext: () => void
  onExit: () => void
}

function SpeakRunner({ run, at, best, onScore, onNext, onExit }: RunnerProps) {
  const task = run[at]
  const sec = speakSection(task.section)
  const take = useTake()

  const [phase, setPhase] = useState<Phase>('ready')
  const [left, setLeft] = useState(0)
  const [clip, setClip] = useState('')
  const [marks, setMarks] = useState<Record<number, boolean>>({})
  const [showSample, setShowSample] = useState(false)
  const [saved, setSaved] = useState(false)
  const [micLost, setMicLost] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const { arm: armTake, start: startTake, stop: stopTake, cancel: cancelTake, drop: dropTake } = take

  useEffect(() => {
    setPhase('ready'); setLeft(0); setClip(''); setMarks({}); setShowSample(false); setSaved(false)
    setMicLost(false)
  }, [task.id])

  useEffect(() => () => { stopSpeak(); audio.current?.pause() }, [])

  const toAnswer = useCallback(() => {
    stopSpeak()
    setPhase('answer')
    setLeft(task.answerSec)
    void startTake((url) => setClip(url)).then((ok) => setMicLost(!ok))
  }, [task.answerSec, startTake])

  const finish = useCallback(() => {
    stopTake()
    setPhase('review')
  }, [stopTake])

  useEffect(() => {
    if (phase !== 'prep' && phase !== 'answer') return
    const id = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (left > 0) return
    if (phase === 'prep') toAnswer()
    else if (phase === 'answer') finish()
  }, [left, phase, toAnswer, finish])

  const begin = () => {
    stopSpeak()
    setMicLost(false)
    setPhase('prep')
    setLeft(task.prepSec)
    void armTake().then((ok) => setMicLost(!ok && take.supported))
  }

  const play = (url: string) => {
    audio.current?.pause()
    stopSpeak()
    const el = new Audio(url)
    audio.current = el
    el.play().catch(() => { })
  }

  const pct = Math.round((Object.values(marks).filter(Boolean).length / sec.check.length) * 100)

  const save = () => {
    onScore(task.id, pct)
    setSaved(true)
  }

  const material = (canListen: boolean) => (
    <>
      {task.intro && <div className="sr-intro"><small>Phần dẫn</small><p lang="en">{task.intro}</p></div>}
      {task.text && <div className="sr-text" lang="en">{task.text}</div>}
      {task.img && <img className="sr-img" src={task.img} alt={task.imgAlt ?? 'Ảnh mô tả'} />}
      {task.table && (
        <div className="sr-table">
          <b>{task.table.title}</b>
          <table>
            <thead><tr>{task.table.headers.map((h) => <th key={h} lang="en">{h}</th>)}</tr></thead>
            <tbody>
              {task.table.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} lang="en">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {task.prompt && (
        <div className="sr-prompt">
          <p lang="en">{task.prompt}</p>
          {canListen && (
            <button className="btn-ghost sm" onClick={() => speakEN(task.prompt as string)}>
              <Icon name="volume" size={13} /> Nghe câu hỏi{task.twice ? ' (thi thật đọc 2 lần)' : ''}
            </button>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className="toeic-sw-run">
      <div className="lesson-head">
        <h2><Icon name="mic" /> Speaking · Câu {task.n} — {sec.name}</h2>
        <div className="meta">
          Bộ đề {task.set} · {sec.timing}
          {run.length > 1 ? ` · câu ${at + 1}/${run.length}` : ''}
          {best != null ? ` · lần tốt nhất: ${best}%` : ''}
        </div>
      </div>

      {phase === 'ready' && (
        <div className="sr-stage">
          <div className="sr-plan">
            <b>Sắp bắt đầu</b>
            <p>
              {task.prepSec} giây chuẩn bị, sau đó micrô tự bật và bạn có {task.answerSec} giây để nói.
              {task.prepNote ? ` ${task.prepNote}` : ''}
            </p>
            {!take.supported && (
              <p className="sr-warn">Trình duyệt này không ghi âm được. Bạn vẫn làm được bài — cứ nói thành tiếng và tự chấm theo tiêu chí bên dưới.</p>
            )}
            {take.supported && take.error && (
              <p className="sr-warn">{MIC_TEXT[take.error]} Không có bản ghi thì bạn vẫn nói và tự chấm được như thường.</p>
            )}
          </div>
          {material(true)}
          <div className="sr-actions">
            <button className="btn-primary" onClick={begin}>
              <Icon name="play" size={15} /> Bắt đầu tính giờ
            </button>
            <button className="btn-ghost" onClick={onExit}>
              <Icon name="arrow-left" size={14} /> Thoát
            </button>
          </div>
        </div>
      )}

      {(phase === 'prep' || phase === 'answer') && (
        <div className="sr-stage">
          <div className={'sr-timer ' + phase + (left <= 5 ? ' hot' : '')}>
            <b>{mmss(left)}</b>
            <span>{phase === 'prep' ? 'Chuẩn bị' : take.recording ? 'Đang ghi âm — nói đi!' : 'Đang trả lời'}</span>
          </div>
          {micLost && take.error && (
            <p className="sr-warn">
              <b>Không ghi âm được lượt này.</b> {MIC_TEXT[take.error]} Cứ nói tiếp cho đủ giờ — hết giờ bạn vẫn tự chấm được.
            </p>
          )}
          {phase === 'prep' && take.armed && (
            <p className="sr-armed">Micrô đã sẵn sàng — hết giờ chuẩn bị là tự ghi âm.</p>
          )}
          {phase === 'prep' && task.section === 'read' && task.chunks && (
            <div className="sr-chunks">
              <small>Gợi ý chia nhóm ý (dấu / là ngắt nhẹ, // là ngắt lớn)</small>
              <p lang="en">{task.chunks}</p>
            </div>
          )}
          {material(phase === 'prep')}
          <div className="sr-actions">
            {phase === 'prep'
              ? <button className="btn-primary" onClick={toAnswer}>Sẵn sàng rồi, trả lời luôn</button>
              : <button className="btn-primary" onClick={finish}>Nói xong</button>}
            <button className="btn-ghost" onClick={() => { cancelTake(); dropTake(); onExit() }}>Thoát</button>
          </div>
        </div>
      )}

      {phase === 'review' && (
        <div className="sr-stage">
          <div className="sr-clip">
            {clip ? (
              <button className="btn-primary sm" onClick={() => play(clip)}>
                <Icon name="play" size={14} /> Nghe lại bản ghi của bạn
              </button>
            ) : (
              <p className="sr-warn">
                {take.error
                  ? `${MIC_TEXT[take.error]} Bạn vẫn tự chấm được theo tiêu chí bên dưới.`
                  : 'Không có bản ghi cho lượt này — cứ tự chấm theo tiêu chí bên dưới.'}
              </p>
            )}
          </div>

          <div className="sr-check">
            <h4>Tự chấm: {sec.range}</h4>
            <p className="toeic-hint">
              Nghe theo ba lượt — lượt 1 chỉ hỏi “đúng nhiệm vụ và đủ thông tin chưa”, lượt 2 xét
              tính dễ hiểu, lượt 3 mới soát ngữ pháp và từ vựng.
            </p>
            {sec.check.map((c, i) => (
              <label key={i} className={'sr-item' + (marks[i] ? ' on' : '')}>
                <input type="checkbox" checked={!!marks[i]} onChange={() => setMarks({ ...marks, [i]: !marks[i] })} />
                <span>{c}</span>
              </label>
            ))}
            <div className="sr-score">
              Bạn đạt <b>{pct}%</b> tiêu chí của nhóm câu này
            </div>
          </div>

          <button className="btn-ghost sm" onClick={() => setShowSample(!showSample)}>
            <Icon name={showSample ? 'chevron-up' : 'chevron-down'} size={14} />
            {showSample ? ' Ẩn bài mẫu' : ' Xem bài mẫu và lời giải thích'}
          </button>
          {showSample && (
            <div className="sr-sample">
              <h5>Bài mẫu</h5>
              <p lang="en">{task.sample}</p>
              {task.stress && (
                <p className="srs-stress">
                  <b>Từ nội dung cần nhấn:</b> <span lang="en">{task.stress.join(' · ')}</span>
                </p>
              )}
              <h5>Vì sao mẫu này đạt</h5>
              <p>{task.why}</p>
            </div>
          )}

          <div className="sr-actions">
            <button className="btn-primary" onClick={save} disabled={saved}>
              <Icon name="check" size={15} /> {saved ? 'Đã lưu kết quả' : 'Lưu kết quả tự chấm'}
            </button>
            <button className="btn-ghost" onClick={() => { setPhase('ready'); setClip(''); setMarks({}); setSaved(false); setMicLost(false) }}>
              <Icon name="rocket" size={14} /> Làm lại câu này
            </button>
            <button className="btn-ghost" onClick={onNext}>
              {at + 1 < run.length ? 'Câu tiếp theo' : 'Xong'} <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
