import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { UNITS, ALL_WORDS, PLAN_12_WEEKS, TARGET_WORDS } from '@/data/englishCore'
import { exportVocabToWord, exportVocabToPdf, type ExportRow } from '@/core/utils/exportVocab'
import { useLearnedWords, useWordBank, readPlan, planDay, planWeek, weekDone } from '../progress'

type Scope = 'learned' | 'all'

export default function EnglishSummary() {
  const { learned } = useLearnedWords()
  const bank = useWordBank(learned)
  const [scope, setScope] = useState<Scope>('learned')

  const plan = readPlan()
  const day = Math.min(planDay(plan.start), 90)
  const week = planWeek(plan.start)
  const doneWeeks = PLAN_12_WEEKS.filter((w) => weekDone(w, learned, plan, bank)).length

  const learnedList = useMemo(() => ALL_WORDS.filter((w) => learned.has(w.en)), [learned])
  const source = scope === 'learned' ? learnedList : ALL_WORDS

  const rows: ExportRow[] = source.map((w) => {
    const unit = UNITS.find((u) => u.words.includes(w))
    return { term: w.en, reading: w.ipa, meaning: w.vi, example: `${w.ex} — ${w.exVi}`, group: unit?.name }
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
              <>Bạn đang ở <b>ngày {day}/90</b> (tuần {week} theo lịch), đã hoàn thành <b>{doneWeeks}/12 tuần</b> của lộ trình. </>
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
          <div className="sm-label"><Icon name="target" size={15} /> Nguyên tắc cốt lõi</div>
          <ul className="sm-info">
            <li><span>Compress</span><b>Học từ cần dùng</b></li>
            <li><span>Compile</span><b>Ghép thành câu</b></li>
            <li><span>Consolidate</span><b>Ôn ngắt quãng</b></li>
            <li><span>Ghi nhớ</span><b>ICES</b></li>
          </ul>
        </div>
      </div>

      <div className="section-title"><span className="pin" /> Tiến độ theo nhóm từ</div>
      <div className="sum-units">
        {UNITS.map((u) => {
          const n = u.words.filter((w) => learned.has(w.en)).length
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
