import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { track } from '@/core/monitor'
import { scoreRun, type RunGroup, type RunResult } from '../engine'
import { SKILLS } from '@/data/toeicCore'
import { englishVoiceStatus, onVoicesChanged, playAudioFiles, speakScript, stopSpeak, VOICE_HELP } from '../tts'
import type { RunProgress } from '../testSave'

interface Props {
  groups: RunGroup[]
  mode: 'practice' | 'test'
  title: string
  timerSec?: number
  sectionSec?: { listening: number; reading: number }
  playOnce?: boolean
  initial?: RunProgress
  onPersist?: (p: RunProgress) => void
  onFinish: (result: RunResult) => void
  onExit: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

const SPEAKER_ICON: Record<string, string> = { M: 'M', W: 'W', M2: 'M2', W2: 'W2' }

const DIRECTION: Record<number, string> = {
  1: 'Select the one statement that best describes what you see in the picture.',
  2: 'Select the best response to each question.',
  3: 'Select the best response to each question.',
  4: 'Select the best response to each question.',
  5: 'Select the best answer to complete the sentence.',
  6: 'Select the best answer to complete the text.',
  7: 'Select the best answer for each question.',
}

export default function Runner({
  groups, mode, title, timerSec, sectionSec, playOnce, initial, onPersist, onFinish, onExit,
}: Props) {
  const [gi, setGi] = useState(initial?.gi ?? 0)
  const [answers, setAnswers] = useState<Record<string, number>>(initial?.answers ?? {})
  const [checkedGroups, setCheckedGroups] = useState<Set<string>>(new Set())
  const [played, setPlayed] = useState<Set<string>>(new Set(initial?.played ?? []))
  const [remL, setRemL] = useState(initial?.remL ?? sectionSec?.listening ?? timerSec ?? 0)
  const [remR, setRemR] = useState(initial?.remR ?? sectionSec?.reading ?? 0)
  const [voiceStatus, setVoiceStatus] = useState(englishVoiceStatus)
  const [autoJumped, setAutoJumped] = useState(false)
  const [marked, setMarked] = useState<Set<string>>(new Set(initial?.marked ?? []))
  const [askSubmit, setAskSubmit] = useState(false)
  const finishedRef = useRef(false)

  useEffect(() => onVoicesChanged(() => setVoiceStatus(englishVoiceStatus())), [])

  const g = groups[gi]
  const totalQ = useMemo(() => groups.reduce((s, x) => s + x.questions.length, 0), [groups])
  const answeredQ = Object.keys(answers).length
  const firstReading = useMemo(() => groups.findIndex((x) => x.part >= 5), [groups])
  const lastNum = useMemo(() => groups.reduce((best, x) => {
    const end = x.questions.reduce(
      (m, q, i) => Math.max(m, q.num ?? (x.qStart != null ? x.qStart + i : 0)), 0)
    return Math.max(best, end)
  }, 0), [groups])
  const inReading = !!sectionSec && !!g && g.part >= 5
  const remaining = sectionSec ? (inReading ? remR : remL) : remL

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    stopSpeak()
    const res = scoreRun(groups, answers)
    track('exam_finish', { exam: 'toeic', total: res.total, correct: res.correct })
    onFinish(res)
  }, [groups, answers, onFinish])

  const finishRef = useRef(finish)
  finishRef.current = finish

  useEffect(() => {
    if (!timerSec && !sectionSec) return
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const elapsed = Math.max(1, Math.round((now - last) / 1000))
      last = now
      const tick = (r: number, onZero: () => void) => {
        if (r <= elapsed) { onZero(); return 0 }
        return r - elapsed
      }
      if (inReading || !sectionSec) {
        const setter = inReading ? setRemR : setRemL
        setter((r) => tick(r, () => { window.clearInterval(id); finishRef.current() }))
      } else {
        setRemL((r) => tick(r, () => {
          window.clearInterval(id)
          stopSpeak()
          if (firstReading >= 0) { setAutoJumped(true); setGi(firstReading) }
          else finishRef.current()
        }))
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [timerSec, sectionSec, inReading, firstReading])

  const progressRef = useRef<RunProgress>({ gi, answers, played: [], marked: [], remL, remR })
  progressRef.current = { gi, answers, played: [...played], marked: [...marked], remL, remR }

  useEffect(() => {
    if (!onPersist) return
    onPersist(progressRef.current)
  }, [gi, answers, played, marked, onPersist])

  useEffect(() => {
    if (!onPersist) return
    const id = window.setInterval(() => onPersist(progressRef.current), 10000)
    return () => window.clearInterval(id)
  }, [onPersist])

  useEffect(() => () => stopSpeak(), [gi])

  if (!g) return null

  const isListening = !!g.audio
  const checked = mode === 'practice' && (checkedGroups.has(g.id) || false)
  const single = g.questions.length === 1
  const allAnswered = g.questions.every((q) => answers[q.key] != null)
  const isLast = gi === groups.length - 1

  const pick = (key: string, idx: number) => {
    if (checked) return
    if (mode === 'practice' && single && answers[key] != null) return
    setAnswers((a) => ({ ...a, [key]: idx }))
    if (mode === 'practice' && single) {
      stopSpeak()
      setCheckedGroups((s) => new Set(s).add(g.id))
    }
  }

  const sameSection = (i: number) => (
    !sectionSec ? true : (groups[i].part >= 5) === inReading
  )
  const navIdx = groups.map((_, i) => i).filter(sameSection)
  const unanswered = groups.reduce(
    (s, x) => s + x.questions.filter((q) => answers[q.key] == null).length, 0)

  const submit = () => {
    if (unanswered > 0) { setAskSubmit(true); return }
    finish()
  }

  const next = () => {
    stopSpeak()
    if (isLast) submit()
    else setGi((x) => x + 1)
  }

  const jump = (i: number) => { stopSpeak(); setAskSubmit(false); setGi(i) }
  const canGoBack = gi > 0 && sameSection(gi - 1)
  const prev = () => { stopSpeak(); setGi((x) => Math.max(0, x - 1)) }

  const checkGroup = () => setCheckedGroups((s) => new Set(s).add(g.id))

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = String(s % 60).padStart(2, '0')
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
  }

  const qEnd = g.qStart != null ? g.qStart + g.questions.length - 1 : null
  const qLabel = g.qStart != null
    ? (qEnd === g.qStart ? `Câu ${g.qStart}` : `Câu ${g.qStart}–${qEnd}`)
    : null
  const hasContext = !!(g.img || g.imgs?.length || g.graphic || g.passage || g.part <= 4)
  const hasMp3 = !!g.mp3?.length
  const noAudio = !hasMp3 && voiceStatus === 'none'
  const audioSpent = playOnce && played.has(g.id)

  const readingLeft = sectionSec
    ? groups.filter((x) => x.part >= 5).reduce((s, x) => s + x.questions.filter((q) => answers[q.key] == null).length, 0)
    : 0
  const secPerQ = inReading && readingLeft > 0 ? Math.floor(remR / readingLeft) : null

  const playAudio = () => {
    if (audioSpent || noAudio) return
    if (hasMp3) {
      playAudioFiles(g.mp3!)
      setPlayed((s) => new Set(s).add(g.id))
    } else if (g.audio && speakScript(g.audio)) {
      setPlayed((s) => new Set(s).add(g.id))
    }
  }

  return (
    <div className="toeic-runner">
      <div className="tr-top">
        <button className="btn-ghost sm" onClick={() => { stopSpeak(); onExit() }}>
          <Icon name="arrow-left" size={14} /> {onPersist ? 'Tạm dừng' : 'Thoát'}
        </button>
        <div className="tr-title">
          {sectionSec ? (inReading ? 'Reading' : 'Listening') : title}
          {qLabel ? <b> · {qLabel}{lastNum ? ` / ${lastNum}` : ''}</b> : null}
        </div>
        <div className="tr-meta">
          <span className="tr-pill">{answeredQ}/{totalQ}</span>
          {(timerSec || sectionSec) ? (
            <span className={'tr-pill tr-clock' + (remaining < 120 ? ' low' : '')}>
              <Icon name="clock" size={14} /> {fmtTime(remaining)}
            </span>
          ) : null}
          {mode === 'test' && (
            <button className="tr-submit" onClick={submit}>Nộp bài</button>
          )}
        </div>
      </div>
      {autoJumped && (
        <div className="tr-pace low">
          ⏱Hết giờ phần Nghe — như đề thật, băng ghi âm dừng và bài chuyển sang phần Đọc.
          Các câu Nghe chưa trả lời sẽ tính là bỏ trống.
          <button className="btn-ghost sm" onClick={() => setAutoJumped(false)}>Đã hiểu</button>
        </div>
      )}
      {secPerQ != null && (
        <div className={'tr-pace' + (secPerQ < 30 ? ' low' : '')}>
          Còn {readingLeft} câu Đọc · nhịp cho phép ~{secPerQ} giây/câu
          {secPerQ < 30 ? ' — nhanh lên, ưu tiên văn bản đơn trước!' : ''}
        </div>
      )}
      <div className="quiz-bar"><div style={{ width: `${(answeredQ / totalQ) * 100}%` }} /></div>

      {askSubmit && (
        <div className="tr-pace low tr-confirm">
          Còn <b>{unanswered}</b> câu chưa trả lời — nộp bây giờ thì những câu đó tính là bỏ trống.
          <button className="btn-primary sm" onClick={finish}>Nộp luôn</button>
          <button className="btn-ghost sm" onClick={() => setAskSubmit(false)}>Quay lại làm tiếp</button>
        </div>
      )}

      {mode === 'test' && navIdx.length > 1 && (
        <div className="tr-nav">
          {navIdx.map((i) => {
            const grp = groups[i]
            const full = grp.questions.every((q) => answers[q.key] != null)
            const some = !full && grp.questions.some((q) => answers[q.key] != null)
            const from = grp.qStart ?? i + 1
            const to = grp.qStart != null ? grp.qStart + grp.questions.length - 1 : from
            return (
              <button
                key={grp.id}
                className={'tr-navi' + (i === gi ? ' at' : '') + (full ? ' full' : some ? ' part' : '')
                  + (marked.has(grp.id) ? ' flag' : '')}
                onClick={() => jump(i)}
                title={marked.has(grp.id) ? 'Đã đánh dấu xem lại' : undefined}
              >
                {from === to ? from : `${from}-${to}`}
              </button>
            )
          })}
        </div>
      )}

      <div className={'tr-body' + (hasContext ? '' : ' lean')}>
       <div className="tr-pane left">
        <div className="tr-pane-head" lang="en">{DIRECTION[g.part]}</div>
        <div className="tr-part-tag">
          Part {g.part}{qLabel ? ` · ${qLabel}` : ''}
          {g.intro && g.part <= 2 ? '' : g.intro ? ` · ${g.intro}` : ''}
          {g.passageTitle ? ` · ${g.passageTitle}` : ''}
        </div>

        {g.img && (
          <div className={g.part >= 3 ? 'tr-photo chart' : 'tr-photo'}>
            <img
              src={g.img}
              alt={g.part >= 3 ? 'Bảng/biểu đồ của nhóm câu hỏi' : 'Ảnh đề Part 1'}
              loading="lazy"
            />
          </div>
        )}

        {isListening && noAudio && (
          <div className="tr-voice-warn">
            <b>Thiết bị chưa có giọng đọc tiếng Anh</b>
            <p>
              Nếu phát, trình duyệt sẽ đọc tiếng Anh bằng giọng Việt (sai hoàn toàn), nên hệ thống
              đã tắt audio và <b>hiển thị lời thoại bên dưới</b> — bạn vẫn luyện được như dạng đọc hiểu.
            </p>
            <details>
              <summary>Cách bật giọng đọc tiếng Anh</summary>
              <ul>
                {VOICE_HELP.map((h) => <li key={h.os}><b>{h.os}:</b> {h.how}</li>)}
              </ul>
            </details>
          </div>
        )}

        {isListening && !noAudio && (
          <div className="tr-audio">
            <button className="btn-primary sm" onClick={playAudio} disabled={!!audioSpent}>
              <Icon name="volume" size={15} /> {audioSpent ? 'Đã phát 1 lần' : played.has(g.id) ? 'Nghe lại' : 'Nghe'}
            </button>
            <button className="btn-ghost sm" onClick={stopSpeak}><Icon name="stop" size={13} /> Dừng</button>
            {playOnce
              ? <small>Lưu ý: Khi thi audio chỉ phát đúng 1 lần</small>
              : mode === 'test' && <small>Đề thật chỉ phát 1 lần — hạn chế nghe lại nhé.</small>}
            {!hasMp3 && <small>(giọng đọc của thiết bị)</small>}
          </div>
        )}

        {((checked || noAudio) && isListening && g.audio) ? (
          <div className="tr-script">
            {g.audio.map((l, i) => (
              <p key={i}><b>{SPEAKER_ICON[l.s] ?? 'M'}</b> <span lang="en">{l.text}</span></p>
            ))}
          </div>
        ) : null}

        {g.imgs?.map((src, i) => (
          <div key={src} className="tr-photo passage">
            <img src={src} alt={`Đoạn văn ${i + 1} của nhóm câu hỏi`} loading="lazy" />
          </div>
        ))}

        {!!g.shortPassage && (
          <div className="tr-pace low">
            Bộ này thiếu {g.shortPassage} đoạn văn (sách gốc không nhúng ảnh đoạn đó) — vài câu
            có thể phải đoán, các câu còn lại vẫn tính bình thường.
          </div>
        )}

        {g.needsGraphic && (
          <div className="tr-pace low">
            Nhóm này có câu “Look at the graphic” nhưng hình của đề gốc chưa được nhập —
            câu đó bạn tạm đoán, các câu còn lại vẫn tính bình thường.
          </div>
        )}

        {g.graphic && (
          <div className="tr-graphic" lang="en">
            <b>{g.graphic.title}</b>
            <table>
              <thead>
                <tr>{g.graphic.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {g.graphic.rows.map((row, ri) => (
                  <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
            {g.graphic.note && <small>{g.graphic.note}</small>}
          </div>
        )}

        {g.passage && (
          <pre className="tr-passage" lang="en">{g.passage}</pre>
        )}
       </div>

       <div className="tr-pane right">
        <div className="tr-pane-head">Question</div>
        {g.questions.map((q, qi) => {
          const picked = answers[q.key]
          return (
            <div key={q.key} className="tr-question">
              {q.text && (
                <p className="tr-q" lang={g.part >= 5 ? 'en' : undefined}>
                  {g.questions.length > 1
                    ? `${q.num ?? (g.qStart != null ? g.qStart + qi : qi + 1)}. `
                    : ''}{q.text}
                </p>
              )}
              {!q.text && (
                <p className="tr-q">
                  {g.part >= 5
                    ? `${q.num ?? qi + 1}. Chọn phương án điền vào chỗ trống tương ứng trong bài.`
                    : 'Chọn câu trả lời đúng nhất (nghe audio):'}
                </p>
              )}
              <div className="quiz-options tr-opts">
                {q.options.map((opt, oi) => {
                  let cls = 'quiz-opt tr-opt'
                  if (checked) {
                    if (oi === q.answer) cls += ' correct'
                    else if (oi === picked) cls += ' wrong'
                  } else if (picked === oi) cls += ' picked'
                  const showText = !q.hideOptionText || checked || noAudio
                  return (
                    <button key={oi} className={cls} onClick={() => pick(q.key, oi)} disabled={checked}>
                      <span className="tr-letter">{LETTERS[oi]}</span>
                      {showText && <span lang="en">{opt}</span>}
                      {checked && oi === q.answer && <Icon name="check" size={15} />}
                      {checked && oi === picked && oi !== q.answer && <Icon name="x-circle" size={15} />}
                    </button>
                  )
                })}
              </div>
              {checked && (q.explain || q.vi || q.trap) && (
                <div className="tr-explain">
                  {q.vi && <p>🇻🇳 {q.vi}</p>}
                  {q.explain && <p><Icon name="bulb" size={14} /> {q.explain}</p>}
                  {q.trap && <p><Icon name="bell" size={14} /> {q.trap}</p>}
                </div>
              )}
              {checked && SKILLS[q.skill] && (
                <div className="tr-tip">
                  <b>Mẹo dạng "{SKILLS[q.skill].vi}":</b> {SKILLS[q.skill].advice}
                </div>
              )}
            </div>
          )
        })}
       </div>
      </div>

      <div className="tr-foot">
        <label className="tr-mark">
          <input
            type="checkbox"
            checked={marked.has(g.id)}
            onChange={(e) => setMarked((s) => {
              const next = new Set(s)
              if (e.target.checked) next.add(g.id)
              else next.delete(g.id)
              return next
            })}
          />
          Đánh dấu xem lại{marked.size ? ` (${marked.size})` : ''}
        </label>
        <span className="tr-count">Nhóm {gi + 1}/{groups.length}</span>
        {canGoBack && (
          <button className="btn-ghost sm" onClick={prev}>
            <Icon name="arrow-left" size={15} /> Câu trước
          </button>
        )}
        {mode === 'practice' && !single && !checked && (
          <button className="btn-primary" onClick={checkGroup} disabled={!allAnswered}>
            Kiểm tra đáp án
          </button>
        )}
        {(mode === 'test' || checked || (mode === 'practice' && single && checked)) && (
          <button className="btn-primary" onClick={next}>
            {isLast ? 'Nộp bài & xem kết quả' : allAnswered ? 'Tiếp tục' : 'Bỏ qua, câu sau'}
            <Icon name="arrow-right" size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
