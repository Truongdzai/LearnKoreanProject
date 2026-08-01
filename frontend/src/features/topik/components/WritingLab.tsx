import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { gradeWriting, type TopikGrade } from '@/core/api/topik.api'
import { TOPIK_WRITING, type TopikWriting } from '@/data/topikCore'
import { useAppStore } from '@/store/app.store'

const TASK_LABEL: Record<string, string> = {
  '51': '51 · Điền câu vào văn bản thực dụng (10đ)',
  '52': '52 · Điền câu vào đoạn giải thích (10đ)',
  '53': '53 · Viết đoạn 200–300 chữ (30đ)',
  '54': '54 · Viết luận 600–700 chữ (50đ)',
}

export default function WritingLab() {
  const { recordEvent } = useAppStore()
  const [topic, setTopic] = useState<TopikWriting | null>(null)
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [grade, setGrade] = useState<TopikGrade | null>(null)

  const submit = async () => {
    if (!topic || busy) return
    setBusy(true)
    setError('')
    setGrade(null)
    try {
      const r = await gradeWriting({ task: topic.task, prompt: topic.prompt, answer })
      setGrade(r)
      recordEvent('lesson', 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa chấm được bài, hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  if (!topic) {
    return (
      <div className="topik-write">
        <div className="grammar-intro">
          <Icon name="note" size={20} />
          <div>
            <b>Viết 쓰기 & chấm bằng AI</b>
            <p>
              Chọn một đề, viết bằng tiếng Hàn rồi bấm chấm. AI chấm theo đúng tiêu chí TOPIK
              (nội dung · bố cục · từ vựng &amp; ngữ pháp · văn phong), chỉ ra từng lỗi và viết lại bài chuẩn để bạn đối chiếu.
            </p>
          </div>
        </div>
        <div className="capsule-grid">
          {TOPIK_WRITING.map((w) => (
            <button key={w.id} className="capsule-card" onClick={() => { setTopic(w); setAnswer(''); setGrade(null); setError('') }}>
              <div className="cap-head">
                <span className="cap-num">{w.task}</span>
                <span className="cap-tag">{TASK_LABEL[w.task]?.split('·')[1]?.trim()}</span>
              </div>
              <b>{w.title}</b>
              <small>Cấp {w.level} trở lên</small>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const need = topic.task === '53' ? 200 : topic.task === '54' ? 600 : 10
  const len = answer.trim().length

  return (
    <div className="topik-write">
      <div className="cap-view-head">
        <button className="btn-ghost sm" onClick={() => setTopic(null)}>
          <Icon name="arrow-left" size={14} /> Danh sách đề
        </button>
        <div>
          <div className="cap-tag">{TASK_LABEL[topic.task]}</div>
          <h3>{topic.title}</h3>
        </div>
      </div>

      <div className="topik-prompt" lang="ko">{topic.prompt}</div>
      <div className="topik-hint"><Icon name="bulb" size={14} /> {topic.hint}</div>

      <textarea
        className="topik-answer"
        lang="ko"
        rows={topic.task === '54' ? 14 : 8}
        value={answer}
        placeholder="한국어로 답을 쓰세요…" aria-label="한국어로 답을 쓰세요…"
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div className="topik-write-foot">
        <span className={'topik-count' + (len >= need ? ' ok' : '')}>{len} / {need}+ ký tự</span>
        <button className="btn-primary" disabled={busy || len < 4} onClick={submit}>
          {busy ? 'Đang chấm…' : <><Icon name="check" size={15} /> Chấm bài</>}
        </button>
        {!!topic.sample && (
          <details className="topik-sample">
            <summary>Xem gợi ý đáp án</summary>
            <span lang="ko">{topic.sample}</span>
          </details>
        )}
      </div>

      {error && <div className="tutor-error"><Icon name="x-circle" size={14} /> {error}</div>}

      {grade && (
        <div className="topik-grade">
          <div className="topik-grade-head">
            <div className="qd-ring" style={{ ['--p' as string]: Math.round((grade.score / grade.max) * 100) }}>
              <b>{grade.score}</b>
              <span>/ {grade.max}</span>
            </div>
            <div>
              {grade.level_hint && <div className="topik-level-hint">{grade.level_hint}</div>}
              <p>{grade.summary}</p>
            </div>
          </div>

          {!!grade.criteria?.length && (
            <div className="topik-criteria">
              {grade.criteria.map((c, k) => (
                <div key={k} className="topik-crit">
                  <div className="topik-crit-top"><b>{c.name}</b><span>{c.score}/{c.max}</span></div>
                  <div className="wk-bar"><div style={{ width: `${(c.score / (c.max || 1)) * 100}%` }} /></div>
                  <small>{c.comment}</small>
                </div>
              ))}
            </div>
          )}

          {!!grade.errors?.length && (
            <div className="topik-errors">
              <b><Icon name="x-circle" size={14} /> Lỗi cần sửa</b>
              {grade.errors.map((e, k) => (
                <div key={k} className="topik-err">
                  <div><span className="topik-err-wrong" lang="ko">{e.wrong}</span> → <span className="topik-err-fix" lang="ko">{e.fix}</span></div>
                  <small>{e.why}</small>
                </div>
              ))}
            </div>
          )}

          {grade.improved && (
            <div className="topik-improved">
              <b><Icon name="sparkles" size={14} /> Bài viết đã sửa lại</b>
              <p lang="ko">{grade.improved}</p>
            </div>
          )}

          {!!grade.next_steps?.length && (
            <div className="topik-next">
              <b>Việc nên làm tiếp</b>
              <ul>{grade.next_steps.map((s, k) => <li key={k}>{s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
