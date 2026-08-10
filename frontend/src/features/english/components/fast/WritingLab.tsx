import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import { WRITE_LOOP, WRITE_PROMPTS, WRITE_RUBRIC, type WritePrompt } from '@/data/englishWriting'
import { useFast } from '../../fast'

const DRAFT_KEY = 'vyling.en.draft'

function readDrafts(): Record<string, string> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function writeDrafts(d: Record<string, string>): void {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch {  }
}

const LEVEL_NAME: Record<WritePrompt['level'], string> = { a1: 'A1', a1p: 'A1+', a2: 'A2' }

interface Props {
  onLog: (mins: number) => void
}

export default function WritingLab({ onLog }: Props) {
  const { fast, markWrote } = useFast()
  const [open, setOpen] = useState<WritePrompt | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>(readDrafts)
  const [checks, setChecks] = useState<string[]>([])
  const [showModel, setShowModel] = useState(false)

  const start = (p: WritePrompt) => {
    setOpen(p)
    setChecks([])
    setShowModel(false)
  }

  const setDraft = (id: string, v: string) => {
    setDrafts((d) => {
      const next = { ...d, [id]: v }
      writeDrafts(next)
      return next
    })
  }

  const toggleCheck = (id: string) => {
    setChecks((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }

  if (open) {
    const draft = drafts[open.id] ?? ''
    const words = draft.trim() ? draft.trim().split(/\s+/).length : 0
    const enough = words >= open.minWords
    const allChecked = checks.length === WRITE_RUBRIC.length
    const done = fast.wrote.includes(open.id)

    return (
      <div className="write-view">
        <button className="btn-ghost sm read-back" onClick={() => setOpen(null)}>
          <Icon name="arrow-left" size={14} /> Tất cả đề viết
        </button>

        <div className="write-head">
          <div className="read-emoji">{open.emoji}</div>
          <div>
            <h3>{open.title}</h3>
            <span className="write-level">{LEVEL_NAME[open.level]} · tối thiểu {open.minWords} từ</span>
          </div>
        </div>

        <div className="write-task"><Icon name="target" size={16} /> {open.task}</div>

        <div className="write-cols">
          <div className="write-left">
            <div className="write-scaffold">
              <div className="write-h">Dàn ý gợi ý</div>
              <ol>{open.scaffold.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
            <div className="write-useful">
              <div className="write-h">Câu dùng được ngay</div>
              {open.useful.map((u, i) => (
                <button key={i} className="write-useful-row" onClick={() => speakEN(u.en)}>
                  <b>{u.en}</b>
                  <span>{u.vi}</span>
                  <Icon name="volume" size={13} />
                </button>
              ))}
            </div>
          </div>

          <div className="write-right">
            <div className="write-h">Bài của bạn</div>
            <textarea
              className="write-area"
              value={draft}
              onChange={(e) => setDraft(open.id, e.target.value)}
              placeholder="Viết bằng tiếng Anh ở đây. Sai cũng cứ viết — viết xong mới sửa được."
              rows={12}
            />
            <div className={'write-count' + (enough ? ' ok' : '')}>
              {words} / {open.minWords} từ {enough && <Icon name="check-circle" size={14} />}
            </div>

            <div className="write-rubric">
              <div className="write-h">Tự soi trước khi xem mẫu</div>
              {WRITE_RUBRIC.map((r) => (
                <label key={r.id} className={'write-check' + (checks.includes(r.id) ? ' on' : '')}>
                  <input type="checkbox" checked={checks.includes(r.id)} onChange={() => toggleCheck(r.id)} />
                  <span><b>{r.label}</b> — {r.ask}</span>
                </label>
              ))}
            </div>

            <div className="write-loop"><Icon name="bulb" size={15} /> {WRITE_LOOP}</div>

            <div className="write-acts">
              <button
                className="btn-ghost sm"
                disabled={!allChecked}
                onClick={() => setShowModel((v) => !v)}
                title={allChecked ? '' : 'Tự soi đủ 5 tiêu chí đã'}
              >
                <Icon name={showModel ? 'eye-off' : 'eye'} size={14} /> {showModel ? 'Ẩn' : 'Xem'} bài mẫu
              </button>
              <button
                className="btn-primary sm"
                disabled={!enough || done}
                onClick={() => { markWrote(open.id); onLog(15) }}
              >
                <Icon name="check" size={14} /> {done ? 'Đã hoàn thành' : 'Đánh dấu xong (+15′)'}
              </button>
            </div>
          </div>
        </div>

        {showModel && (
          <div className="write-model">
            <div className="write-h"><Icon name="star" size={15} /> Bài mẫu</div>
            <div className="write-model-text">
              {open.model.split('\n').map((line, i) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
            </div>
            <div className="write-model-note"><Icon name="bulb" size={15} /> {open.modelNote}</div>
            <button className="btn-ghost sm" onClick={() => speakEN(open.model.replace(/\n+/g, '. '), 0.9)}>
              <Icon name="volume" size={14} /> Nghe bài mẫu
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="write-lab">
      <div className="read-intro">
        <Icon name="note" size={18} />
        <div>
          <b>Viết là nói chậm.</b> Khi nói bạn không kịp nghĩ nên lỗi trôi qua; khi viết bạn có thời gian
          nhìn thấy lỗi của chính mình — đó là lý do viết chữa được lỗi tận gốc mà nói thì không.
          Viết xong hãy <b>đọc to lên</b>: câu nào nghe gượng là câu bạn đang dịch từ tiếng Việt.
        </div>
      </div>

      <div className="write-grid">
        {WRITE_PROMPTS.map((p) => {
          const done = fast.wrote.includes(p.id)
          const started = (drafts[p.id] ?? '').trim().length > 0
          return (
            <button key={p.id} className={'write-card' + (done ? ' done' : '')} onClick={() => start(p)}>
              <div className="read-card-top">
                <span className="read-card-emoji">{p.emoji}</span>
                {done
                  ? <span className="read-card-badge"><Icon name="check" size={12} /> Xong</span>
                  : started && <span className="write-card-draft">Đang viết</span>}
              </div>
              <h4>{p.title}</h4>
              <p>{p.task}</p>
              <div className="read-card-meta">
                <span>{LEVEL_NAME[p.level]}</span>
                <i>·</i>
                <span>{p.minWords}+ từ</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
