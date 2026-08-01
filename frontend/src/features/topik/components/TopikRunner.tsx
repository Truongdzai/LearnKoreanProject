import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { playAudioFiles, speakKO, stopSpeak } from '@/core/tts'
import audioManifest from '@/data/korean/topik/audioManifest.json'
import { track } from '@/core/monitor'
import { TOPIK_SKILLS, estimateTopik, type TopikListening, type TopikReading } from '@/data/topikCore'

export type RunItem =
  | { kind: 'read'; item: TopikReading }
  | { kind: 'listen'; item: TopikListening }

export interface RunResult {
  total: number
  correct: number
  listenTotal: number
  listenCorrect: number
  readTotal: number
  readCorrect: number
  wrongIds: string[]
  bySkill: Record<string, { n: number; ok: number }>
}

interface Props {
  items: RunItem[]
  exam?: boolean
  seconds?: number
  title: string
  onFinish: (r: RunResult) => void
  onQuit: () => void
}

const qid = (it: RunItem) => it.item.id
const qSkill = (it: RunItem) => it.item.skill
const qAnswer = (it: RunItem) => it.item.answer

const MP3_LINES = audioManifest as Record<string, number>

function playScript(id: string, lines: TopikListening['script']) {
  stopSpeak()
  const n = MP3_LINES[id]
  if (n === lines.length && n > 0) {
    playAudioFiles(lines.map((_, k) => `/audio/topik/${id}-${k}.mp3`))
    return
  }
  const speakAt = (k: number) => {
    if (k >= lines.length) return
    speakKO(lines[k].text, 0.88)
    window.setTimeout(() => speakAt(k + 1), Math.max(1800, lines[k].text.length * 220))
  }
  speakAt(0)
}

export default function TopikRunner({ items, exam = false, seconds, title, onFinish, onQuit }: Props) {
  const [i, setI] = useState(0)
  const [picks, setPicks] = useState<Record<string, number>>({})
  const [showScript, setShowScript] = useState(false)
  const [left, setLeft] = useState(seconds ?? 0)
  const doneRef = useRef(false)

  const cur = items[i]
  const picked = cur ? picks[qid(cur)] : undefined

  useEffect(() => () => stopSpeak(), [])

  useEffect(() => {
    setShowScript(false)
    if (cur?.kind === 'listen') {
      const t = window.setTimeout(() => playScript(cur.item.id, cur.item.script), 300)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [i])

  const result = useMemo((): RunResult => {
    const bySkill: Record<string, { n: number; ok: number }> = {}
    let correct = 0, listenTotal = 0, listenCorrect = 0, readTotal = 0, readCorrect = 0
    const wrongIds: string[] = []
    for (const it of items) {
      const ok = picks[qid(it)] === qAnswer(it)
      const sk = qSkill(it)
      bySkill[sk] = bySkill[sk] ?? { n: 0, ok: 0 }
      bySkill[sk].n += 1
      if (ok) { correct += 1; bySkill[sk].ok += 1 } else wrongIds.push(qid(it))
      if (it.kind === 'listen') { listenTotal += 1; if (ok) listenCorrect += 1 }
      else { readTotal += 1; if (ok) readCorrect += 1 }
    }
    return { total: items.length, correct, listenTotal, listenCorrect, readTotal, readCorrect, wrongIds, bySkill }
  }, [items, picks])

  const submit = () => {
    if (doneRef.current) return
    doneRef.current = true
    stopSpeak()
    track('exam_finish', { exam: 'topik', total: result.total, correct: result.correct })
    onFinish(result)
  }

  useEffect(() => {
    if (!exam || !seconds) return undefined
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { window.clearInterval(t); submit(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [exam, seconds])

  if (!cur) return null

  const pick = (k: number) => {
    if (!exam && picked != null) return
    setPicks((p) => ({ ...p, [qid(cur)]: k }))
  }

  const answered = Object.keys(picks).length
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="topik-run">
      <div className="topik-run-head">
        <button className="btn-ghost sm" onClick={() => { stopSpeak(); onQuit() }}>
          <Icon name="arrow-left" size={14} /> Thoát
        </button>
        <b>{title}</b>
        {exam && !!seconds && <span className={'topik-clock' + (left < 120 ? ' warn' : '')}>⏱ {mm}:{ss}</span>}
        <span className="topik-progress">Câu {i + 1}/{items.length} · đã làm {answered}</span>
      </div>

      <div className="topik-card">
        <div className="topik-kind">
          {cur.kind === 'listen' ? <><Icon name="headphones" size={14} /> 듣기 · Nghe</> : <><Icon name="book" size={14} /> 읽기 · Đọc</>}
          <span className="topik-skill">{TOPIK_SKILLS[qSkill(cur)] ?? qSkill(cur)}</span>
        </div>

        {cur.kind === 'listen' ? (
          <div className="topik-listen">
            <button className="btn-primary sm" onClick={() => playScript(cur.item.id, cur.item.script)}>
              <Icon name="volume" size={15} /> Nghe lại
            </button>
            <button className="btn-ghost sm" onClick={() => setShowScript((v) => !v)}>
              {showScript ? 'Ẩn lời thoại' : 'Xem lời thoại'}
            </button>
            {showScript && (
              <div className="topik-script">
                {cur.item.script.map((l, k) => (
                  <div key={k}><b>{l.s === 'W' ? '여자' : '남자'}:</b> <span lang="ko">{l.text}</span></div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="topik-text" lang="ko">{cur.item.text}</div>
        )}

        <p className="topik-q">{cur.item.q}</p>

        <div className="quiz-options">
          {cur.item.options.map((o, k) => {
            let cls = 'quiz-opt'
            if (exam) {
              if (picks[qid(cur)] === k) cls += ' picked'
            } else if (picked != null) {
              if (k === cur.item.answer) cls += ' correct'
              else if (k === picked) cls += ' wrong'
            }
            return (
              <button key={k} className={cls} onClick={() => pick(k)}>
                <span lang="ko">{o}</span>
              </button>
            )
          })}
        </div>

        {!exam && picked != null && (
          <div className="quiz-foot">
            <div className="quiz-ex">{picked === cur.item.answer ? '✅ ' : '❌ '}{cur.item.explain}</div>
          </div>
        )}
      </div>

      <div className="topik-nav">
        <button className="btn-ghost sm" disabled={i === 0} onClick={() => setI((x) => x - 1)}>
          <Icon name="chevron-left" size={15} /> Câu trước
        </button>
        {i + 1 < items.length ? (
          <button className="btn-primary" onClick={() => setI((x) => x + 1)}>
            Câu tiếp <Icon name="arrow-right" size={15} />
          </button>
        ) : (
          <button className="btn-primary" onClick={submit}>
            <Icon name="check" size={15} /> Nộp bài
          </button>
        )}
      </div>
    </div>
  )
}

export function ResultBoard({ res, exam, onClose, onRetry }: {
  res: RunResult
  exam: boolean
  onClose: () => void
  onRetry: () => void
}) {
  const est = estimateTopik(
    res.listenTotal ? res.listenCorrect / res.listenTotal : 0,
    res.readTotal ? res.readCorrect / res.readTotal : 0,
  )
  const pct = Math.round((res.correct / res.total) * 100)
  const weak = Object.entries(res.bySkill)
    .filter(([, v]) => v.ok < v.n)
    .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)
    .slice(0, 4)

  return (
    <div className="quiz-done topik-done">
      <div className="qd-ring" style={{ ['--p' as string]: pct }}>
        <b>{pct}%</b>
        <span>{res.correct}/{res.total}</span>
      </div>
      {exam && (
        <div className="topik-est">
          <div><b>{est.listening}</b><span>듣기 (ước tính /100)</span></div>
          <div><b>{est.reading}</b><span>읽기 (ước tính /100)</span></div>
          <div className="topik-est-total"><b>{est.total}</b><span>tổng /200</span></div>
          <div className="topik-est-grade">{est.label}</div>
        </div>
      )}
      {!!weak.length && (
        <div className="topik-weak">
          <b>Kỹ năng cần luyện thêm</b>
          <div className="topik-weak-list">
            {weak.map(([sk, v]) => (
              <span key={sk} className="topik-weak-item">{TOPIK_SKILLS[sk] ?? sk} <i>{v.ok}/{v.n}</i></span>
            ))}
          </div>
        </div>
      )}
      <div className="quiz-done-actions">
        <button className="btn-primary" onClick={onRetry}><Icon name="rocket" size={15} /> Làm lại</button>
        <button className="btn-ghost" onClick={onClose}>Đóng</button>
      </div>
    </div>
  )
}
