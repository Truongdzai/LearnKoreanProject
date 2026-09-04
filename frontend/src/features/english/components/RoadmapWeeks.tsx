import { useEffect, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import type { VocabUnit, WeekTask, WeekPlan } from '@/data/englishCore'
import { GRAMMAR_PASS, type GrammarLesson } from '@/data/englishGrammar'
import { PRON_PASS, type PronGroup } from '@/data/englishPronunciation'
import { useAppStore } from '@/store/app.store'
import {
  speakEN, usePlan, useLearnedWords, useWordBank, readPlan,
  planDay, planWeek, taskDone, weekDone, vocabTarget, learnedInUnit,
  useActivityDays, weekActivity, useGrammarProgress, usePronProgress, useToeicBridge,
  weekSchedule, type TaskExtra,
} from '../progress'
import { useUrlParam } from '@/core/hooks/useTabParam'

interface Props {
  onLearn: (unitId: string) => void
  onQuiz: (week: number, units: string[], pass: number) => void
  onSummary?: () => void
  onGrammar?: (lessonId?: string) => void
  onPron?: (groupId?: string) => void
  onDeep?: (term: string) => void
  onActive?: () => void
  deepFull?: number
  activeAuto?: number
  lang?: string
  weeks: WeekPlan[]
  taskTotal: number
  vocabUnits?: VocabUnit[]
  speak?: (text: string) => void
  firstUnitId?: string
  pronGroups?: PronGroup[]
  grammarLessons?: GrammarLesson[]
}

const NO_LESSONS: GrammarLesson[] = []
const NO_GROUPS: PronGroup[] = []

const MONTH_CLASS = ['m1', 'm2', 'm3'] as const

const KIND_ICON: Record<WeekTask['kind'], IconName> = {
  vocab: 'cards', total: 'chart', quiz: 'target', video: 'film', speak: 'mic', review: 'letters', custom: 'note',
  grammar: 'book', toeic: 'trophy', pron: 'volume', deep: 'bulb', active: 'sparkles',
}

const MANUAL = new Set(['video', 'speak', 'review', 'custom'])

const CLOSED = '0'
const isWeekParam = (v: string) => v === CLOSED || (/^\d+$/.test(v) && +v >= 1 && +v <= 12)

export default function RoadmapWeeks({
  onLearn, onQuiz, onSummary, onGrammar, onPron, onDeep, onActive,
  deepFull = 0,
  activeAuto = 0,
  lang = 'en',
  weeks,
  taskTotal,
  vocabUnits,
  speak = speakEN,
  firstUnitId = 'nouns',
  pronGroups = NO_GROUPS,
  grammarLessons = NO_LESSONS,
}: Props) {
  const { setView, recordEvent } = useAppStore()
  const { plan, startPlan, toggleTask, grantReward } = usePlan(lang)
  const { learned } = useLearnedWords(lang)
  const bank = useWordBank(learned, lang)
  const actDays = useActivityDays(plan.start)
  const { grammar } = useGrammarProgress()
  const { pron } = usePronProgress(lang)
  const toeic = useToeicBridge()
  const ext: TaskExtra = { grammar: grammar.best, pron: pron.best, toeic, units: vocabUnits, pronGroups, grammarLessons, deepFull, activeAuto }
  const [weekParam, setWeekParam] = useUrlParam('week', null, isWeekParam)

  const started = !!plan.start
  const day = Math.min(planDay(plan.start), 90)
  const curWeek = planWeek(plan.start)

  const open = weekParam === null
    ? (readPlan(lang).start ? curWeek : null)
    : (weekParam === CLOSED ? null : Number(weekParam))
  const setOpen = (w: number | null) => setWeekParam(w === null ? CLOSED : String(w))

  const isDone = (t: WeekTask, week: number) =>
    taskDone(t, week, learned, plan, bank, weekActivity(actDays, plan.start, week), ext)
  const wkDone = (w: WeekPlan) =>
    weekDone(w, learned, plan, bank, weekActivity(actDays, plan.start, w.week), ext)

  const doneWeeks = weeks.filter(wkDone).length
  const tasksDone = weeks.reduce((s, w) => s + w.tasks.filter((t) => isDone(t, w.week)).length, 0)
  const allDone = doneWeeks === 12

  useEffect(() => {
    if (!started) return
    weeks.forEach((w) => {
      if (!plan.rewarded.includes(w.week) && wkDone(w)) {
        grantReward(w.week)
        recordEvent('lesson', 1)
      }
    })
  }, [started, plan.manual, plan.quiz, learned, bank, actDays, grammar.best, pron.best, toeic, deepFull, activeAuto])

  const taskMeta = (t: WeekTask, week: number): string => {
    if (t.kind === 'vocab') {
      const target = vocabTarget(t, vocabUnits)
      return `${Math.min(learnedInUnit(t.unitId ?? '', learned, vocabUnits), target)}/${target} từ`
    }
    if (t.kind === 'quiz') {
      const best = plan.quiz[`w${week}`]
      return best != null ? `cao nhất: ${best}%` : ''
    }
    if (t.kind === 'total') {
      const target = t.targetTotal ?? 0
      return `${Math.min(bank, target)}/${target} từ`
    }
    if (t.kind === 'grammar') {
      if (!t.lessonId) {
        const passed = grammarLessons.filter((l) => (grammar.best[l.id] ?? 0) >= GRAMMAR_PASS).length
        return `${passed}/${grammarLessons.length} bài đạt`
      }
      const best = grammar.best[t.lessonId]
      return best != null ? `tốt nhất: ${best}%` : ''
    }
    if (t.kind === 'pron') {
      if (!t.groupId) {
        const ok = pronGroups.filter((g) => (pron.best[g.id] ?? 0) >= PRON_PASS).length
        return `${ok}/${pronGroups.length} nhóm âm đạt`
      }
      const best = pron.best[t.groupId]
      return best != null ? `tốt nhất: ${best}%` : ''
    }
    if (t.kind === 'toeic') {
      if (!toeic.started) return 'chưa bắt đầu'
      return t.n ? `${Math.min(toeic.days, t.n)}/${t.n} ngày hoàn thành` : 'đã bắt đầu'
    }
    if (t.kind === 'deep') {
      const target = t.n ?? 1
      return `${Math.min(deepFull, target)}/${target} từ nắm đủ nghĩa`
    }
    if (t.kind === 'active') {
      const target = t.n ?? 1
      return `${Math.min(activeAuto, target)}/${target} cụm bật ra tự động`
    }
    return ''
  }

  const taskAction = (t: WeekTask, w: WeekPlan): { label: string; run: () => void } | null => {
    if (t.kind === 'grammar') return onGrammar ? { label: 'Học ngay', run: () => onGrammar(t.lessonId) } : null
    if (t.kind === 'pron') return onPron ? { label: 'Luyện ngay', run: () => onPron(t.groupId) } : null
    if (t.kind === 'toeic') return { label: 'Mở TOEIC', run: () => setView('toeic') }
    if (t.kind === 'deep') return onDeep ? { label: 'Học sâu', run: () => onDeep('') } : null
    if (t.kind === 'active') return onActive ? { label: 'Vào phòng tập', run: onActive } : null
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
      case 'learn': return { label: 'Học ngay', run: () => onLearn(t.unitId ?? firstUnitId) }
      case 'quiz': return { label: 'Làm kiểm tra', run: () => onQuiz(w.week, w.quizUnits ?? [], t.passPct ?? 70) }
      case 'library': return { label: 'Kho video', run: () => setView('library') }
      case 'speaking': return { label: 'Luyện nói', run: () => setView('speaking') }
      case 'flashcards': return { label: 'Ôn tập', run: () => setView('flashcards') }
      case 'vocab': return { label: 'Kho từ vựng', run: () => setView('vocab') }
      case 'hsk': return { label: 'Mở HSK', run: () => setView('hsk') }
      case 'deep': return onDeep ? { label: 'Học sâu', run: () => onDeep('') } : null
      case 'active': return onActive ? { label: 'Vào phòng tập', run: onActive } : null
      case 'summary': return onSummary ? { label: 'Tóm tắt & xuất', run: onSummary } : null
      default: return null
    }
  }

  const renderTask = (t: WeekTask, week: number) => {
    const done = isDone(t, week)
    const meta = taskMeta(t, week)
    const action = taskAction(t, weeks[week - 1])
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
  }

  const sel = open != null ? weeks.find((w) => w.week === open) : undefined

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
              Tuần theo lịch: <b>Tuần {curWeek} — {weeks[curWeek - 1].title}</b>
            </div>
            <div className="ices-bar"><div className="ices-bar-fill" style={{ width: `${(tasksDone / taskTotal) * 100}%` }} /></div>
            <div className="enroad-line2">{doneWeeks}/12 tuần hoàn thành · {tasksDone}/{taskTotal} nhiệm vụ</div>
          </div>
          <button className="btn-ghost sm" onClick={() => setOpen(curWeek)}>Mở tuần {curWeek}</button>
        </div>
      )}

      {allDone && (
        <div className="enroad-grad">
          <b>Chúc mừng — bạn đã hoàn thành lộ trình 3 tháng!</b> Hãy xuất bộ từ của mình ở tab Tóm tắt và duy trì ôn SRS mỗi tuần để không rơi rớt.
        </div>
      )}

      <div className="weeks-grid">
        {weeks.map((w) => {
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

          {(() => {
            const sch = weekSchedule(sel)
            const byId = new Map(sel.tasks.map((t) => [t.id, t]))
            const weekLongTasks = sch.weekLong.map((id) => byId.get(id)).filter(Boolean) as WeekTask[]
            return (
              <>
                {weekLongTasks.length > 0 && (
                  <div className="wk-weeklong">
                    <div className="wk-weeklong-head"><Icon name="target" size={13} /> Mục tiêu xuyên suốt tuần</div>
                    <div className="wk-tasks">{weekLongTasks.map((t) => renderTask(t, sel.week))}</div>
                  </div>
                )}

                <div className="wk-days">
                  {sch.days.map((d) => {
                    const items = d.taskIds.map((id) => byId.get(id)).filter(Boolean) as WeekTask[]
                    const allDone = items.length > 0 && items.every((t) => isDone(t, sel.week))
                    return (
                      <div key={d.day} className={'wk-day' + (allDone ? ' done' : '')}>
                        <div className="wk-day-head">
                          <span className="wk-day-num">Ngày {d.day}</span>
                          <span className="wk-day-theme">{d.theme}</span>
                          {allDone && <Icon name="check-circle" size={14} />}
                        </div>
                        {items.length > 0 && <div className="wk-tasks">{items.map((t) => renderTask(t, sel.week))}</div>}
                        {d.note && <div className="wk-day-note">{d.note}</div>}
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}

          {sel.patterns && (
            <>
              <div className="wk-pt-title">Mẫu câu của tuần — ghép từ đã học thành câu nói được ngay</div>
              <div className="wk-patterns">
                {sel.patterns.map((p) => (
                  <div key={p.pattern} className="wk-pattern">
                    <b>{p.pattern}</b>
                    <span className="wk-pt-vi">{p.vi}</span>
                    <p lang={lang}>
                      “{p.ex}”
                      <button className="wk-pt-sound" onClick={() => speak(p.ex)} title="Nghe câu mẫu">
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
              Tuần {sel.week} hoàn thành!{' '}
              {sel.week < 12 ? 'Mở tuần kế tiếp và giữ nhịp nhé.' : 'Bạn đã đi hết 12 tuần — quá đỉnh!'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
