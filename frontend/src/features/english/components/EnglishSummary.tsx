import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import {
  UNITS, ALL_WORDS, PLAN_12_WEEKS, PLAN_12_WEEKS_BOOT, TARGET_WORDS, wTerm, wRead,
  type RoadmapMode,
} from '@/data/englishCore'
import { GRAMMAR_LESSONS } from '@/data/englishGrammarData'
import { GRAMMAR_PASS } from '@/data/englishGrammar'
import { PRON_GROUPS } from '@/data/englishPronunciationData'
import { PRON_PASS } from '@/data/englishPronunciation'
import { exportVocabToWord, exportVocabToPdf, type ExportRow } from '@/core/utils/exportVocab'
import {
  useLearnedWords, useWordBank, usePlan, planDay, planWeek, weekDone,
  useGrammarProgress, usePronProgress, useToeicBridge, useActivityDays, weekActivity,
  type TaskExtra,
} from '../progress'
import { useDeep } from '../deep/deep'

type Scope = 'learned' | 'all'

interface Props {
  mode?: RoadmapMode
}

export default function EnglishSummary({ mode = 'lite' }: Props) {
  const { learned } = useLearnedWords()
  const bank = useWordBank(learned)
  const [scope, setScope] = useState<Scope>('learned')

  const { plan } = usePlan()
  const { grammar } = useGrammarProgress()
  const { pron } = usePronProgress()
  const { deepFull, mastered } = useDeep()
  const toeic = useToeicBridge()
  const actDays = useActivityDays(plan.start)

  const day = Math.min(planDay(plan.start), 90)
  const week = planWeek(plan.start)
  const weeks = mode === 'boot' ? PLAN_12_WEEKS_BOOT : PLAN_12_WEEKS
  const ext: TaskExtra = {
    units: UNITS, pronGroups: PRON_GROUPS, grammarLessons: GRAMMAR_LESSONS,
    grammar: grammar.best, pron: pron.best, toeic, deepFull,
  }
  const doneWeeks = weeks.filter(
    (w) => weekDone(w, learned, plan, bank, weekActivity(actDays, plan.start, w.week), ext),
  ).length
  const grammarDone = GRAMMAR_LESSONS.filter((l) => (grammar.best[l.id] ?? 0) >= GRAMMAR_PASS).length
  const pronDone = PRON_GROUPS.filter((g) => (pron.best[g.id] ?? 0) >= PRON_PASS).length

  const learnedList = useMemo(() => ALL_WORDS.filter((w) => learned.has(wTerm(w))), [learned])
  const source = scope === 'learned' ? learnedList : ALL_WORDS

  const rows: ExportRow[] = source.map((w) => {
    const unit = UNITS.find((u) => u.words.includes(w))
    return { term: wTerm(w), reading: wRead(w), meaning: w.vi, example: `${w.ex} — ${w.exVi}`, group: unit?.name }
  })

  const title = scope === 'learned' ? 'Từ vựng tiếng Anh đã thuộc' : 'Từ vựng tiếng Anh — toàn bộ kho lõi'
  const empty = scope === 'learned' && learnedList.length === 0

  return (
    <div className="en-summary">
      <div className="sm-ai-tag"><Icon name="bulb" size={14} /> Tóm tắt chi tiết lộ trình &amp; tiến độ của bạn</div>

      <div className="sm-grid">
        <div className="sm-card span2">
          <div className="sm-label"><Icon name="bulb" size={15} /> Bạn đang ở đâu</div>
          <p>
            {plan.start ? (
              <>
                Bạn đang ở <b>ngày {day}/90</b> (tuần {week} theo lịch), đã hoàn thành <b>{doneWeeks}/12 tuần</b> của
                lộ trình {mode === 'boot' ? 'Bootcamp' : 'Cơ bản'}.{' '}
              </>
            ) : (
              <>Bạn chưa bấm bắt đầu hành trình 90 ngày — vào tab <b>Lộ trình</b> để khởi động. </>
            )}
            Bạn đã thuộc <b>{learnedList.length}</b> / {ALL_WORDS.length} từ lõi
            ({Math.round((learnedList.length / ALL_WORDS.length) * 100)}%), kho từ tích luỹ mọi nguồn đạt <b>{bank}</b> / {TARGET_WORDS} —
            mục tiêu {TARGET_WORDS} từ tần suất cao để hiểu ~90% hội thoại.
            Hãy duy trì học mỗi ngày và để hệ thống <b>ôn tập ngắt quãng</b> nhắc bạn đúng lúc.
          </p>
        </div>
        <div className="sm-card">
          <div className="sm-label"><Icon name="target" size={15} /> Các mảng của lộ trình</div>
          <ul className="sm-info">
            <li><span>Ngữ pháp</span><b>{grammarDone}/{GRAMMAR_LESSONS.length} bài đạt</b></li>
            <li><span>Phát âm</span><b>{pronDone}/{PRON_GROUPS.length} nhóm âm đạt</b></li>
            <li><span>Học sâu</span><b>{deepFull} từ đủ nghĩa · {mastered} làm chủ</b></li>
            <li><span>TOEIC</span><b>{toeic.started ? `${toeic.days}/60 ngày` : 'chưa bắt đầu'}</b></li>
          </ul>
        </div>
      </div>

      <div className="section-title"><span className="pin" /> Tiến độ theo nhóm từ</div>
      <div className="sum-units">
        {UNITS.map((u) => {
          const n = u.words.filter((w) => learned.has(wTerm(w))).length
          const pct = Math.round((n / u.words.length) * 100)
          return (
            <div key={u.id} className="sum-unit">
              <div className="su-top"><span>{u.emoji} {u.name}</span><b>{n}/{u.words.length}</b></div>
              <div className="su-bar"><div className={u.tone} style={{ width: `${pct}%` }} /></div>
            </div>
          )
        })}
      </div>

      <div className="section-title"><span className="pin" /> Xuất từ vựng (Word / PDF)</div>
      <div className="export-box">
        <div className="export-scope">
          <button className={'chip' + (scope === 'learned' ? ' on' : '')} onClick={() => setScope('learned')}>
            Từ đã thuộc ({learnedList.length})
          </button>
          <button className={'chip' + (scope === 'all' ? ' on' : '')} onClick={() => setScope('all')}>
            Toàn bộ kho ({ALL_WORDS.length})
          </button>
        </div>
        <p className="export-hint">
          Tải danh sách từ kèm phiên âm, nghĩa và ví dụ ra file <b>Word (.doc)</b> để in hoặc ôn offline,
          hoặc xuất <b>PDF</b> để chia sẻ.
        </p>
        <div className="export-actions">
          <button className="btn-primary" disabled={empty} onClick={() => exportVocabToWord(title, rows)}>
            <Icon name="download" size={16} /> Xuất Word (.doc)
          </button>
          <button className="btn-ghost" disabled={empty} onClick={() => exportVocabToPdf(title, rows)}>
            <Icon name="copy" size={16} /> Xuất PDF
          </button>
        </div>
        {empty && <div className="export-empty">Bạn chưa đánh dấu từ nào đã thuộc. Hãy học vài từ ở tab “Học từ vựng”, hoặc chọn “Toàn bộ kho”.</div>}
      </div>
    </div>
  )
}
