import { useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import {
  TOEIC_DAYS, TOEIC_PHASES, TOEIC_TARGET, TOEIC_TASK_TOTAL, TOEIC_TOTAL_DAYS,
  TOEIC_WEEKS, WEEK_RULE, type ToeicDay, type ToeicTask,
} from '@/data/toeicCore'
import {
  dayDone, dueWrong, swDone, taskDone, toeicDay, vocabDone,
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
  onSpeak: (ids: string[]) => void
  onWrite: (ids: string[]) => void
  onGuide: (chapter: string) => void
}

const KIND_ICON: Record<ToeicTask['kind'], IconName> = {
  grammar: 'book', vocab: 'cards', practice: 'target', minitest: 'trophy',
  review: 'letters', video: 'film', custom: 'note', weak: 'tool', wrongbook: 'note',
  speak: 'mic', write: 'note', guide: 'bulb', errorlog: 'tool',
}

const MANUAL = new Set(['custom', 'video', 'review', 'wrongbook', 'guide'])

export default function Roadmap({
  state, ctx, latestEstimate, onStart, onToggleTask, onGrantReward,
  onOpenCapsule, onPractice, onWeak, onMiniTest, onWrongbook,
  onSpeak, onWrite, onGuide,
}: Props) {
  const { setView, recordEvent } = useAppStore()
  const started = !!state.start
  const curDay = toeicDay(state.start)
  const [open, setOpen] = useState<number | null>(started ? curDay : null)
  const [phases, setPhases] = useState<number[]>(
    () => [TOEIC_DAYS[(started ? curDay : 1) - 1]?.phase ?? 1],
  )
  const [scrollTo, setScrollTo] = useState<number | null>(null)
  const chips = useRef<Record<number, HTMLButtonElement | null>>({})

  const isDone = (t: ToeicTask) => taskDone(t, ctx)
  const dDone = (d: ToeicDay) => dayDone(d, ctx)

  const togglePhase = (n: number) =>
    setPhases((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))

  const goToDay = (d: number) => {
    const day = TOEIC_DAYS.find((x) => x.d === d)
    if (!day) return
    setPhases((p) => (p.includes(day.phase) ? p : [...p, day.phase]))
    setOpen(d)
    setScrollTo(d)
  }

  useEffect(() => {
    if (scrollTo == null) return
    const el = chips.current[scrollTo]
    setScrollTo(null)
    if (!el) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' })
    el.focus({ preventScroll: true })
  }, [scrollTo])

  const tasksDone = TOEIC_DAYS.reduce((s, d) => s + d.tasks.filter(isDone).length, 0)
  const daysDone = TOEIC_DAYS.filter(dDone).length

  useEffect(() => {
    if (!started) return
    TOEIC_DAYS.forEach((d) => {
      if (!state.rewarded.includes(d.d) && dDone(d)) {
        onGrantReward(d.d)
        recordEvent('toeic', 1)
      }
    })
  }, [started, state.attempts, state.capsules, state.done, state.sw, ctx.learned, ctx.activity])

  const taskMeta = (t: ToeicTask): string => {
    if (t.kind === 'vocab') {
      const { have, need } = vocabDone(t, ctx.learned)
      return `${have}/${need} từ`
    }
    if (t.kind === 'grammar') {
      const best = state.capsules[t.capsuleId ?? '']
      return best != null ? `tốt nhất ${best}%` : ''
    }
    if (t.kind === 'speak' || t.kind === 'write') {
      const { have, need } = swDone(t, state.sw)
      const again = (t.times ?? 1) > 1 ? ' · cần làm lại' : ''
      return `${have}/${need} câu${again}`
    }
    if (t.kind === 'errorlog') {
      const tagged = state.wrong.filter((w) => w.cause).length
      return `${tagged}/${t.n ?? 5} câu đã gắn mã`
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
      case 'speak': return { label: 'Vào nói', run: () => onSpeak(t.swIds ?? []) }
      case 'write': return { label: 'Vào viết', run: () => onWrite(t.swIds ?? []) }
      case 'guide': return { label: 'Mở cẩm nang', run: () => onGuide(t.chapter ?? 'exam') }
      case 'errorlog': return { label: 'Gắn mã lỗi', run: onWrongbook }
      default: return null
    }
  }

  const sel = open != null ? TOEIC_DAYS.find((d) => d.d === open) : undefined
  const selWeek = sel ? TOEIC_WEEKS.find((w) => w.w === sel.week) : undefined

  return (
    <div className="toeic-road">
      {!started ? (
        <div className="enroad-start">
          <div>
            <b>12 tuần · 84 ngày · TOEIC bốn kỹ năng</b>
            <p>
              Sáu chặng, mỗi chặng hai tuần, đi từ chẩn đoán đến tổng duyệt — và mỗi tuần xoay
              cùng một chủ đề qua cả Nghe, Đọc, Nói, Viết. Ngày 1 bạn thi thử để đo điểm xuất phát;
              điểm thấp là chuyện bình thường. Mục tiêu Nghe – Đọc: {TOEIC_TARGET}+.
            </p>
          </div>
          <button className="btn-primary" onClick={() => { onStart(); goToDay(1) }}>
            <Icon name="rocket" size={16} /> Bắt đầu 12 tuần
          </button>
        </div>
      ) : (
        <div className="enroad-status">
          <div className="enroad-day"><b>Ngày {curDay}</b><span>/ {TOEIC_TOTAL_DAYS}</span></div>
          <div className="enroad-mid">
            <div className="enroad-line1">
              Tuần {TOEIC_DAYS[curDay - 1]?.week ?? 1} · {TOEIC_PHASES[(TOEIC_DAYS[curDay - 1]?.phase ?? 1) - 1].name}
              {latestEstimate && <> · Ước lượng gần nhất: <b>{latestEstimate.total} điểm</b></>}
            </div>
            <div className="ices-bar"><div className="ices-bar-fill" style={{ width: `${(tasksDone / TOEIC_TASK_TOTAL) * 100}%` }} /></div>
            <div className="enroad-line2">{daysDone}/{TOEIC_TOTAL_DAYS} ngày hoàn thành · {tasksDone}/{TOEIC_TASK_TOTAL} nhiệm vụ</div>
          </div>
          <button className="btn-ghost sm" onClick={() => goToDay(curDay)}>Mở ngày {curDay}</button>
        </div>
      )}

      <p className="toeic-hint"><Icon name="bulb" size={14} /> {WEEK_RULE}</p>

      <div className="toeic-road-cols">
        <div className="toeic-road-main">
          {TOEIC_PHASES.map((ph) => {
            const phDays = TOEIC_DAYS.filter((d) => d.phase === ph.phase)
            const phDone = phDays.filter(dDone).length
            const shown = phases.includes(ph.phase)
            const hasNow = started && phDays.some((d) => d.d === curDay)
            return (
            <div key={ph.phase} className={'toeic-phase' + (shown ? '' : ' shut')}>
              <button
                className="toeic-phase-head"
                aria-expanded={shown}
                onClick={() => togglePhase(ph.phase)}
              >
                <Icon name={shown ? 'chevron-up' : 'chevron-down'} size={15} />
                <b>Chặng {ph.phase} — {ph.name}</b>
                {hasNow && <span className="tph-now">đang ở đây</span>}
                <span className="tph-done">{phDone}/{phDays.length} ngày</span>
                <span className="tph-range">{ph.range}</span>
              </button>
              {!shown && (
                <div className="toeic-phase-mini">
                  {TOEIC_WEEKS.filter((w) => w.phase === ph.phase).map((w) => w.theme).join(' · ')}
                </div>
              )}
              {shown && <>
              <p className="toeic-phase-goal">{ph.goal}</p>
              <p className="toeic-phase-out"><b>Sản phẩm đánh giá:</b> {ph.output}</p>
              {TOEIC_WEEKS.filter((w) => w.phase === ph.phase).map((w) => (
                <div key={w.w} className="toeic-week">
                  <div className="toeic-week-head">
                    <span className="tw-num">Tuần {w.w}</span>
                    <span className="tw-theme">{w.theme}</span>
                  </div>
                  <div className="toeic-days">
                    {TOEIC_DAYS.filter((d) => d.week === w.w).map((d) => {
                      const done = dDone(d)
                      const cls = [
                        'toeic-day-chip',
                        done ? 'done' : '',
                        started && d.d === curDay ? 'now' : '',
                        open === d.d ? 'open' : '',
                      ].filter(Boolean).join(' ')
                      return (
                        <button
                          key={d.d}
                          ref={(el) => { chips.current[d.d] = el }}
                          className={cls}
                          onClick={() => setOpen(open === d.d ? null : d.d)}
                          title={`Ngày ${d.d} — ${d.title}`}
                        >
                          {done ? <Icon name="check" size={12} /> : d.d}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              </>}
            </div>
            )
          })}
        </div>

        <aside className="toeic-road-side">
          {sel ? (
            <div className="wk-detail">
              <div className="wk-detail-head">
                <div>
                  <div className="wk-detail-kicker">
                    Ngày {sel.d}/{TOEIC_TOTAL_DAYS} · Tuần {sel.week}
                    {selWeek ? ` — ${selWeek.theme}` : ''}
                  </div>
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
                  Ngày {sel.d} hoàn thành! {sel.d < TOEIC_TOTAL_DAYS ? 'Hẹn mai tiếp tục giữ nhịp nhé.' : 'BẠN ĐÃ ĐI HẾT 12 TUẦN — giờ là lúc đi thi thật!'}
                </div>
              )}
            </div>
          ) : (
            <div className="toeic-side-hint">
              <div className="tsh-kicker">Bảng nhiệm vụ</div>
              <b>Bấm một ô ngày để mở nhiệm vụ</b>
              <p>
                {started
                  ? 'Nhiệm vụ của ngày đó hiện ngay tại đây — không phải cuộn xuống cuối trang.'
                  : 'Bấm “Bắt đầu 12 tuần” để mở Ngày 1, hoặc bấm thử một ô ngày bất kỳ để xem trước nhiệm vụ.'}
              </p>
              <div className="tsh-quick">
                <button className="btn-ghost sm" onClick={onMiniTest}>
                  <Icon name="trophy" size={14} /> Thi thử đo trình độ
                </button>
                <button className="btn-ghost sm" onClick={() => onWeak(10)}>
                  <Icon name="tool" size={14} /> Luyện 10 câu điểm yếu
                </button>
                <button className="btn-ghost sm" onClick={onWrongbook}>
                  <Icon name="note" size={14} /> Sổ tay câu sai
                  {state.wrong.length > 0 && <span className="tsh-badge">{state.wrong.length}</span>}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
