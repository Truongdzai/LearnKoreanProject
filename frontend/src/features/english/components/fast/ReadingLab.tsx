import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import {
  PASSAGES, READ_LEVELS, READ_PASS, newWordPct, passagesAt, wordCount,
  type ReadLevel, type ReadPassage,
} from '@/data/englishReading'
import { useFast } from '../../fast'

type Step = 'read' | 'quiz' | 'done'

const PUNCT = /^[^\wÀ-ỹ']+|[^\wÀ-ỹ']+$/g

interface Props {
  onLog: (mins: number) => void
}

function GlossText({ p, onWord }: { p: ReadPassage; onWord: (w: string) => void }) {
  const gloss = useMemo(() => {
    const m = new Map<string, string>()
    for (const g of p.glossary) {
      const w = g.w.toLowerCase()
      if (w.includes(' ')) continue
      m.set(w, g.vi)
      m.set(w + 's', g.vi)
      m.set(w + 'es', g.vi)
    }
    return m
  }, [p])

  return (
    <div className="read-text">
      {p.text.map((para, i) => (
        <p key={i}>
          {para.split(/(\s+)/).map((tok, j) => {
            if (!tok.trim()) return tok
            const bare = tok.replace(PUNCT, '').toLowerCase()
            const known = gloss.has(bare)
            return (
              <span
                key={j}
                className={'read-w' + (known ? ' gloss' : '')}
                onClick={() => onWord(bare)}
                title={known ? gloss.get(bare) : undefined}
              >
                {tok}
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}

export default function ReadingLab({ onLog }: Props) {
  const { fast, recordRead } = useFast()
  const [level, setLevel] = useState<ReadLevel>('a1')
  const [open, setOpen] = useState<ReadPassage | null>(null)
  const [step, setStep] = useState<Step>('read')
  const [picks, setPicks] = useState<number[]>([])
  const [showVi, setShowVi] = useState(false)
  const [tapped, setTapped] = useState('')

  const list = passagesAt(level)

  const start = (p: ReadPassage) => {
    setOpen(p)
    setStep('read')
    setPicks([])
    setShowVi(false)
    setTapped('')
  }

  const closeAll = () => { setOpen(null); setStep('read') }

  const submit = () => {
    if (!open) return
    const right = open.questions.filter((q, i) => picks[i] === q.answer).length
    const pct = Math.round((right / open.questions.length) * 100)
    recordRead(open.id, pct)
    onLog(open.minutes)
    setStep('done')
  }

  if (open) {
    const best = fast.read[open.id] ?? 0
    const right = open.questions.filter((q, i) => picks[i] === q.answer).length
    const pct = Math.round((right / open.questions.length) * 100)
    const glossHit = open.glossary.find((g) => {
      const w = g.w.toLowerCase()
      return w === tapped || w + 's' === tapped || w + 'es' === tapped
    })

    const pop = glossHit && (
      <div className="read-pop">
        <b>{glossHit.w}</b>
        <span className="ipa">{glossHit.ipa}</span>
        <span className="vi">{glossHit.vi}</span>
        <button className="btn-ghost sm" onClick={() => speakEN(glossHit.w)}>
          <Icon name="volume" size={14} />
        </button>
        <button className="read-pop-x" onClick={() => setTapped('')}><Icon name="x" size={13} /></button>
      </div>
    )

    return (
      <div className="read-view">
        <button className="btn-ghost sm read-back" onClick={closeAll}>
          <Icon name="arrow-left" size={14} /> Tất cả bài đọc
        </button>

        <div className="read-head">
          <div className="read-emoji">{open.emoji}</div>
          <div>
            <h3>{open.title}</h3>
            <div className="read-meta">
              <span>{open.titleVi}</span>
              <i>·</i>
              <span>{wordCount(open)} từ</span>
              <i>·</i>
              <span>~{open.minutes} phút</span>
              <i>·</i>
              <span className="read-i1">{open.glossary.length} từ mới ({newWordPct(open)}%)</span>
            </div>
          </div>
          <button className="btn-ghost sm" onClick={() => speakEN(open.text.join(' '), 0.88)}>
            <Icon name="volume" size={15} /> Nghe cả bài
          </button>
        </div>

        {step === 'read' && (
          <>
            <div className="read-tip">
              <Icon name="bulb" size={15} />
              <span>
                Đọc một lượt <b>không tra từ</b> trước — hiểu đại ý là đủ. Từ đơn được gạch chân thì chạm vào
                xem nghĩa được ngay (chỉ nên chạm ở lượt đọc thứ hai). Các <b>cụm từ</b> không gạch chân được,
                bạn xem ở bảng từ mới ngay bên dưới bài.
              </span>
            </div>

            <GlossText p={open} onWord={setTapped} />

            {pop}

            <div className="read-gloss">
              <div className="read-gloss-h">Từ mới trong bài ({open.glossary.length})</div>
              <div className="read-gloss-list">
                {open.glossary.map((g) => (
                  <button key={g.w} className="read-gloss-item" onClick={() => speakEN(g.w)}>
                    <b>{g.w}</b>
                    <span className="ipa">{g.ipa}</span>
                    <span className="vi">{g.vi}</span>
                    <Icon name="volume" size={13} />
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={() => setStep('quiz')}>
              <Icon name="target" size={16} /> Kiểm tra hiểu bài
            </button>
          </>
        )}

        {step === 'quiz' && (
          <div className="read-quiz">
            <p className="read-quiz-note">Trả lời từ trí nhớ trước, sai thì mới cuộn lên đọc lại.</p>
            {open.questions.map((q, i) => (
              <div key={i} className="read-q">
                <b>{i + 1}. {q.q}</b>
                <div className="read-opts">
                  {q.options.map((o, j) => (
                    <button
                      key={j}
                      className={'read-opt' + (picks[i] === j ? ' on' : '')}
                      onClick={() => setPicks((p) => { const n = [...p]; n[i] = j; return n })}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="btn-primary"
              disabled={picks.filter((x) => x != null).length < open.questions.length}
              onClick={submit}
            >
              <Icon name="check" size={16} /> Nộp bài
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="read-done">
            <div className={'read-score' + (pct >= READ_PASS ? ' pass' : '')}>
              <b>{pct}%</b>
              <span>{right}/{open.questions.length} câu đúng</span>
            </div>
            <p className="read-verdict">
              {pct >= READ_PASS
                ? 'Đạt. Bạn hiểu bài ở mức đủ để đọc tiếp cấp cao hơn.'
                : 'Chưa đạt. Đọc lại một lượt nữa rồi thử lại — lần này chú ý các câu có từ được gạch chân.'}
            </p>

            {open.questions.map((q, i) => {
              const ok = picks[i] === q.answer
              return (
                <div key={i} className={'read-review' + (ok ? ' ok' : ' no')}>
                  <b><Icon name={ok ? 'check-circle' : 'x-circle'} size={15} /> {q.q}</b>
                  {!ok && <p className="chose">Bạn chọn: {q.options[picks[i]]}</p>}
                  <p className="right">Đáp án: {q.options[q.answer]}</p>
                  <p className="why">{q.explainVi}</p>
                </div>
              )
            })}

            <div className="read-after">
              <button className="btn-ghost sm" onClick={() => setShowVi((v) => !v)}>
                <Icon name="globe" size={14} /> {showVi ? 'Ẩn' : 'Xem'} bài đọc lần nữa
              </button>
              <button className="btn-ghost sm" onClick={() => start(open)}>
                <Icon name="refresh" size={14} /> Làm lại
              </button>
              <button className="btn-primary sm" onClick={closeAll}>
                <Icon name="arrow-right" size={14} /> Bài khác
              </button>
            </div>
            {showVi && <><GlossText p={open} onWord={setTapped} />{pop}</>}
            {best > 0 && <p className="read-best">Điểm cao nhất của bạn với bài này: {best}%</p>}
          </div>
        )}
      </div>
    )
  }

  const doneCount = PASSAGES.filter((p) => (fast.read[p.id] ?? 0) >= READ_PASS).length

  return (
    <div className="read-lab">
      <div className="read-intro">
        <Icon name="book" size={18} />
        <div>
          <b>Đọc là nơi vốn từ lớn nhanh nhất.</b> Với người mới, đọc chiếm <b>50%</b> tổng thời gian —
          nhiều hơn cả nghe, nói và viết cộng lại. Lý do: mắt đi nhanh hơn tai, và bạn được dừng lại bao lâu tuỳ ý.
          Chuẩn vừa sức là hiểu được <b>~95%</b> bài. Nếu phải tra quá vài từ mỗi đoạn thì bài đang quá khó —
          lùi xuống cấp thấp hơn, đừng cố.
        </div>
      </div>

      <div className="read-progress">
        <b>{doneCount}/{PASSAGES.length}</b> bài đã đạt
        <div className="read-progress-bar"><i style={{ width: `${(doneCount / PASSAGES.length) * 100}%` }} /></div>
      </div>

      <div className="read-levels">
        {READ_LEVELS.map((l) => (
          <button
            key={l.id}
            className={'read-level ' + l.tone + (level === l.id ? ' on' : '')}
            onClick={() => setLevel(l.id)}
          >
            <b>{l.name}</b><small>{l.sub}</small>
          </button>
        ))}
      </div>

      <div className="read-grid">
        {list.map((p) => {
          const best = fast.read[p.id] ?? 0
          const pass = best >= READ_PASS
          return (
            <button key={p.id} className={'read-card' + (pass ? ' done' : '')} onClick={() => start(p)}>
              <div className="read-card-top">
                <span className="read-card-emoji">{p.emoji}</span>
                {pass && <span className="read-card-badge"><Icon name="check" size={12} /> {best}%</span>}
              </div>
              <h4>{p.title}</h4>
              <span className="read-card-vi">{p.titleVi}</span>
              <div className="read-card-meta">
                <span>{p.topic}</span>
                <i>·</i>
                <span>{wordCount(p)} từ</span>
                <i>·</i>
                <span>{p.glossary.length} từ mới</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
