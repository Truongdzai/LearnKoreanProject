import { useEffect, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import {
  TOEIC_60_DAYS, TOEIC_PHASES, TOEIC_TASK_TOTAL, TOEIC_TARGET,
  type ToeicDay, type ToeicTask,
} from '@/data/toeicCore'
import {
  dayDone, dueWrong, taskDone, toeicDay, vocabDone,
  type TaskCtx, type ToeicState,
} from '../state'

interface Props {
  state: ToeicState
  ctx: TaskCtx
  latestEstimate: { total: number } | null
  onStart: () => void
  onToggleTask: (id: string) => void
  onGrantReward: (d: number) => void
  onOpenCapsule: (id: string) => void
  onPractice: (part: number, n: number) => void
  onWeak: (n: number) => void
  onMiniTest: () => void
  onWrongbook: () => void
}

const KIND_ICON: Record<ToeicTask['kind'], IconName> = {
  grammar: 'book', vocab: 'cards', practice: 'target', minitest: 'trophy',
  review: 'letters', video: 'film', custom: 'note', weak: 'tool', wrongbook: 'note',
}

const MANUAL = new Set(['custom', 'video', 'review', 'wrongbook'])

export default function Roadmap60({
  state, ctx, latestEstimate, onStart, onToggleTask, onGrantReward,
  onOpenCapsule, onPractice, onWeak, onMiniTest, onWrongbook,
}: Props) {
  const { setView, recordEvent } = useAppStore()
  const started = !!state.start
  const curDay = toeicDay(state.start)
  const [open, setOpen] = useState<number | null>(started ? curDay : null)

  const isDone = (t: ToeicTask) => taskDone(t, ctx)
  const dDone = (d: ToeicDay) => dayDone(d, ctx)

  const tasksDone = TOEIC_60_DAYS.reduce((s, d) => s + d.tasks.filter(isDone).length, 0)
  const daysDone = TOEIC_60_DAYS.filter(dDone).length

  useEffect(() => {
    if (!started) return
    TOEIC_60_DAYS.forEach((d) => {
      if (!state.rewarded.includes(d.d) && dDone(d)) {
        onGrantReward(d.d)
        recordEvent('toeic', 1)
      }
    })
  }, [started, state.attempts, state.capsules, state.done, ctx.learned, ctx.activity])

  const taskMeta = (t: ToeicTask): string => {
    if (t.kind === 'vocab') {
      const { have, need } = vocabDone(t, ctx.learned)
      return `${have}/${need} từ`
    }
    if (t.kind === 'grammar') {
      const best = state.capsules[t.capsuleId ?? '']
      return best != null ? `tốt nhất ${best}%` : ''
    }
    if (t.kind === 'wrongbook') {
      if (!state.wrong.length) return 'sổ đang trống'
      const due = dueWrong(state.wrong).length
      return `${state.wrong.length} câu trong sổ` + (due ? ` · ${due} đến hạn` : '')
    }
    return ''
  }

  const jumpToUnit = (unitId?: string) => {
    try {
      sessionStorage.setItem('vyling.en.jump', JSON.stringify({ tab: 'learn', unit: unitId }))
    } catch {
    }
    setView('english')
  }

  const taskAction = (t: ToeicTask): { label: string; run: () => void } | null => {
    switch (t.kind) {
      case 'grammar': return { label: 'Học ngay', run: () => onOpenCapsule(t.capsuleId ?? 'g01') }
      case 'vocab': return { label: 'Học từ', run: () => jumpToUnit(t.unitId) }
      case 'practice': return { label: 'Luyện ngay', run: () => onPractice(t.part ?? 5, t.n ?? 8) }
      case 'weak': return { label: 'Luyện ngay', run: () => onWeak(t.n ?? 10) }
      case 'minitest': return { label: 'Vào thi', run: onMiniTest }
      case 'video': return { label: 'Kho video', run: () => setView('library') }
      case 'review': return { label: 'Ôn tập', run: () => setView('flashcards') }
      case 'wrongbook': return { label: 'Mở sổ tay', run: onWrongbook }
      default: return null
    }
  }

  const sel = open != null ? TOEIC_60_DAYS.find((d) => d.d === open) : undefined

  return (
    <div className="toeic-road">
      {!started ? (
        <div className="enroad-start">
          <div>
            <b>60 ngày · 0 → {TOEIC_TARGET}+ TOEIC</b>
            <p>4 chặng: lấy gốc → làm quen dạng đề → vá điểm yếu → tổng luyện. Ngày 1 bạn sẽ thi thử để đo điểm xuất phát — cứ yên tâm, điểm thấp là chuyện bình thường.</p>
          </div>
          <button className="btn-primary" onClick={() => { onStart(); setOpen(1) }}>
            <Icon name="rocket" size={16} /> Bắt đầu 60 ngày
          </button>
        </div>
      ) : (
        <div className="enroad-status">
          <div className="enroad-day"><b>Ngày {curDay}</b><span>/ 60</span></div>
          <div className="enroad-mid">
            <div className="enroad-line1">
              {TOEIC_PHASES[(TOEIC_60_DAYS[curDay - 1]?.phase ?? 1) - 1].name}
              {latestEstimate && <> · Ước lượng gần nhất: <b>{latestEstimate.total} điểm</b></>}
            </div>
            <div className="ices-bar"><div className="ices-bar-fill" style={{ width: `${(tasksDone / TOEIC_TASK_TOTAL) * 100}%` }} /></div>
            <div className="enroad-line2">{daysDone}/60 ngày hoàn thành · {tasksDone}/{TOEIC_TASK_TOTAL} nhiệm vụ</div>
          </div>
          <button className="btn-ghost sm" onClick={() => setOpen(curDay)}>Mở ngày {curDay}</button>
        </div>
      )}

      {TOEIC_PHASES.map((ph) => (
        <div key={ph.phase} className="toeic-phase">
          <div className="toeic-phase-head">
            <b>Chặng {ph.phase} — {ph.name}</b>
            <span>{ph.range}</span>
          </div>
          <p className="toeic-phase-goal">{ph.goal}</p>
          <div className="toeic-days">
            {TOEIC_60_DAYS.filter((d) => d.phase === ph.phase).map((d) => {
              const done = dDone(d)
              const cls = [
                'toeic-day-chip',
                done ? 'done' : '',
                started && d.d === curDay ? 'now' : '',
                open === d.d ? 'open' : '',
              ].filter(Boolean).join(' ')
              return (
                <button key={d.d} className={cls} onClick={() => setOpen(open === d.d ? null : d.d)} title={d.title}>
                  {done ? <Icon name="check" size={12} /> : d.d}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {sel && (
        <div className="wk-detail">
          <div className="wk-detail-head">
            <div>
              <div className="wk-detail-kicker">Ngày {sel.d}/60 · Chặng {sel.phase} — {TOEIC_PHASES[sel.phase - 1].name}</div>
              <h3>{sel.title}</h3>
            </div>
            <button className="btn-ghost sm" onClick={() => setOpen(null)}>Đóng</button>
          </div>

          <div className="wk-tasks">
            {sel.tasks.map((t) => {
              const done = isDone(t)
              const meta = taskMeta(t)
              const action = taskAction(t)
              const manual = MANUAL.has(t.kind)
              return (
                <div key={t.id} className={'wk-task' + (done ? ' done' : '')}>
                  {manual ? (
                    <button
                      className={'wk-check' + (done ? ' on' : '')}
                      onClick={() => onToggleTask(t.id)}
                      title={done ? 'Bỏ đánh dấu' : 'Đánh dấu đã xong'}
                    >
                      {done && <Icon name="check" size={13} />}
                    </button>
                  ) : (
                    <span className={'wk-check auto' + (done ? ' on' : '')}>
                      <Icon name={done ? 'check' : KIND_ICON[t.kind]} size={12} />
                    </span>
                  )}
                  <div className="wk-task-body">
                    <span className="wk-task-label">{t.label}</span>
                    {meta && <span className="wk-task-meta">{meta}</span>}
                  </div>
                  {action && (
                    <button className="btn-ghost sm wk-go" onClick={action.run}>
                      {action.label} <Icon name="arrow-right" size={13} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {dDone(sel) && (
            <div className="wk-congrats">
              🎉 Ngày {sel.d} hoàn thành! {sel.d < 60 ? 'Hẹn mai tiếp tục giữ nhịp nhé.' : 'BẠN ĐÃ ĐI HẾT 60 NGÀY — giờ là lúc đi thi thật!'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
