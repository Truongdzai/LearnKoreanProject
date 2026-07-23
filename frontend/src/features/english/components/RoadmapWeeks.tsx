import { useEffect, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { PLAN_12_WEEKS, PLAN_TASK_TOTAL, type WeekTask, type WeekPlan } from '@/data/englishCore'
import { useAppStore } from '@/store/app.store'
import {
  speakEN, usePlan, useLearnedWords, useWordBank, readPlan,
  planDay, planWeek, taskDone, weekDone, vocabTarget, learnedInUnit,
  useActivityDays, weekActivity,
} from '../progress'

interface Props {
  onLearn: (unitId: string) => void
  onQuiz: (week: number, units: string[], pass: number) => void
  onSummary: () => void
}

const MONTH_CLASS = ['m1', 'm2', 'm3'] as const

const KIND_ICON: Record<WeekTask['kind'], IconName> = {
  vocab: 'cards', total: 'chart', quiz: 'target', video: 'film', speak: 'mic', review: 'letters', custom: 'note',
}

const MANUAL = new Set(['video', 'speak', 'review', 'custom'])

export default function RoadmapWeeks({ onLearn, onQuiz, onSummary }: Props) {
  const { setView, recordEvent } = useAppStore()
  const { plan, startPlan, toggleTask, grantReward } = usePlan()
  const { learned } = useLearnedWords()
  const bank = useWordBank(learned)
  const actDays = useActivityDays(plan.start)
  const [open, setOpen] = useState<number | null>(() => {
    const p = readPlan()
    return p.start ? planWeek(p.start) : null
  })

  const started = !!plan.start
  const day = Math.min(planDay(plan.start), 90)
  const curWeek = planWeek(plan.start)

  const isDone = (t: WeekTask, week: number) =>
    taskDone(t, week, learned, plan, bank, weekActivity(actDays, plan.start, week))
  const wkDone = (w: WeekPlan) =>
    weekDone(w, learned, plan, bank, weekActivity(actDays, plan.start, w.week))

  const doneWeeks = PLAN_12_WEEKS.filter(wkDone).length
  const tasksDone = PLAN_12_WEEKS.reduce((s, w) => s + w.tasks.filter((t) => isDone(t, w.week)).length, 0)
  const allDone = doneWeeks === 12

  useEffect(() => {
    if (!started) return
    PLAN_12_WEEKS.forEach((w) => {
      if (!plan.rewarded.includes(w.week) && wkDone(w)) {
        grantReward(w.week)
        recordEvent('lesson', 1)
      }
    })
  }, [started, plan.manual, plan.quiz, learned, bank, actDays])

  const taskMeta = (t: WeekTask, week: number): string => {
    if (t.kind === 'vocab') {
      const target = vocabTarget(t)
      return `${Math.min(learnedInUnit(t.unitId ?? '', learned), target)}/${target} từ`
    }
    if (t.kind === 'quiz') {
      const best = plan.quiz[`w${week}`]
      return best != null ? `cao nhất: ${best}%` : ''
    }
    if (t.kind === 'total') {
      const target = t.targetTotal ?? 0
      return `${Math.min(bank, target)}/${target} từ`
    }
    return ''
  }

  const taskAction = (t: WeekTask, w: WeekPlan): { label: string; run: () => void } | null => {
    const go = t.go !== undefined ? t.go : (
      t.kind === 'vocab' ? 'learn'
      : t.kind === 'total' ? 'vocab'
      : t.kind === 'quiz' ? 'quiz'
      : t.kind === 'video' ? 'library'
      : t.kind === 'speak' ? 'speaking'
      : t.kind === 'review' ? 'flashcards'
      : null
    )
    switch (go) {
      case 'learn': return { label: 'Học ngay', run: () => onLearn(t.unitId ?? 'nouns') }
      case 'quiz': return { label: 'Làm kiểm tra', run: () => onQuiz(w.week, w.quizUnits ?? [], t.passPct ?? 70) }
      case 'library': return { label: 'Kho video', run: () => setView('library') }
      case 'speaking': return { label: 'Luyện nói', run: () => setView('speaking') }
      case 'flashcards': return { label: 'Ôn tập', run: () => setView('flashcards') }
      case 'vocab': return { label: 'Kho từ vựng', run: () => setView('vocab') }
      case 'summary': return { label: 'Tóm tắt & xuất', run: onSummary }
      default: return null
    }
  }

  const sel = open != null ? PLAN_12_WEEKS.find((w) => w.week === open) : undefined

  return (
    <div className="enroad">
      {!started ? (
        <div className="enroad-start">
          <div>
            <b>Sẵn sàng cho 90 ngày?</b>
            <p>Bấm bắt đầu để hệ thống tính ngày, gợi ý tuần cần học và theo dõi từng nhiệm vụ giúp bạn.</p>
          </div>
          <button className="btn-primary" onClick={() => { startPlan(); setOpen(1) }}>
            <Icon name="rocket" size={16} /> Bắt đầu hành trình 90 ngày
          </button>
        </div>
      ) : (
        <div className="enroad-status">
          <div className="enroad-day"><b>Ngày {day}</b><span>/ 90</span></div>
          <div className="enroad-mid">
            <div className="enroad-line1">
              Tuần theo lịch: <b>Tuần {curWeek} — {PLAN_12_WEEKS[curWeek - 1].title}</b>
            </div>
            <div className="ices-bar"><div className="ices-bar-fill" style={{ width: `${(tasksDone / PLAN_TASK_TOTAL) * 100}%` }} /></div>
            <div className="enroad-line2">{doneWeeks}/12 tuần hoàn thành · {tasksDone}/{PLAN_TASK_TOTAL} nhiệm vụ</div>
          </div>
          <button className="btn-ghost sm" onClick={() => setOpen(curWeek)}>Mở tuần {curWeek}</button>
        </div>
      )}

      {allDone && (
        <div className="enroad-grad">
          🎓 <b>Chúc mừng — bạn đã hoàn thành lộ trình 3 tháng!</b> Hãy xuất bộ từ của mình ở tab Tóm tắt và duy trì ôn SRS mỗi tuần để không rơi rớt.
        </div>
      )}

      <div className="weeks-grid">
        {PLAN_12_WEEKS.map((w) => {
          const done = wkDone(w)
          const n = w.tasks.filter((t) => isDone(t, w.week)).length
          const cls = [
            'week-card road', MONTH_CLASS[w.month - 1],
            done ? 'done' : '',
            started && w.week === curWeek ? 'now' : '',
            open === w.week ? 'open' : '',
          ].filter(Boolean).join(' ')
          return (
            <button key={w.week} className={cls} onClick={() => setOpen(open === w.week ? null : w.week)}>
              <div className="week-head">
                <span className="week-num">Tuần {w.week}</span>
                {done ? <span className="wk-ok"><Icon name="check-circle" size={15} /></span> : <span className="week-phase">{w.phase}</span>}
              </div>
              <b>{w.title}</b>
              <p>{w.focus}</p>
              <div className="wk-bar"><div style={{ width: `${(n / w.tasks.length) * 100}%` }} /></div>
              <div className="wk-meta">
                {n}/{w.tasks.length} nhiệm vụ
                {started && w.week === curWeek && <span className="wk-now-tag">tuần này</span>}
              </div>
            </button>
          )
        })}
      </div>

      {sel && (
        <div className="wk-detail">
          <div className="wk-detail-head">
            <div>
              <div className="wk-detail-kicker">Tuần {sel.week} · Tháng {sel.month} · {sel.phase}</div>
              <h3>{sel.title}</h3>
              <p>{sel.focus}</p>
            </div>
            <button className="btn-ghost sm" onClick={() => setOpen(null)}>Đóng</button>
          </div>

          <div className="wk-rhythm"><Icon name="calendar" size={14} /> {sel.rhythm}</div>

          <div className="wk-tasks">
            {sel.tasks.map((t) => {
              const done = isDone(t, sel.week)
              const meta = taskMeta(t, sel.week)
              const action = taskAction(t, sel)
              return (
                <div key={t.id} className={'wk-task' + (done ? ' done' : '')}>
                  {MANUAL.has(t.kind) ? (
                    <button
                      className={'wk-check' + (done ? ' on' : '')}
                      onClick={() => toggleTask(t.id)}
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

          {sel.patterns && (
            <>
              <div className="wk-pt-title">📐 Mẫu câu của tuần — ghép từ đã học thành câu nói được ngay</div>
              <div className="wk-patterns">
                {sel.patterns.map((p) => (
                  <div key={p.pattern} className="wk-pattern">
                    <b>{p.pattern}</b>
                    <span className="wk-pt-vi">{p.vi}</span>
                    <p lang="en">
                      “{p.ex}”
                      <button className="wk-pt-sound" onClick={() => speakEN(p.ex)} title="Nghe câu mẫu">
                        <Icon name="volume" size={13} />
                      </button>
                    </p>
                    <small>{p.exVi}</small>
                  </div>
                ))}
              </div>
            </>
          )}

          {wkDone(sel) && (
            <div className="wk-congrats">
              🎉 Tuần {sel.week} hoàn thành!{' '}
              {sel.week < 12 ? 'Mở tuần kế tiếp và giữ nhịp nhé.' : 'Bạn đã đi hết 12 tuần — quá đỉnh!'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
