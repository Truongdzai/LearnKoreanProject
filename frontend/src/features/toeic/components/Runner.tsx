import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
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

const SPEAKER_ICON: Record<string, string> = { M: '👨', W: '👩', M2: '🧔', W2: '👩‍🦰' }

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
  const finishedRef = useRef(false)

  useEffect(() => onVoicesChanged(() => setVoiceStatus(englishVoiceStatus())), [])

  const g = groups[gi]
  const totalQ = useMemo(() => groups.reduce((s, x) => s + x.questions.length, 0), [groups])
  const answeredQ = Object.keys(answers).length
  const firstReading = useMemo(() => groups.findIndex((x) => x.part >= 5), [groups])
  const inReading = !!sectionSec && !!g && g.part >= 5
  const remaining = sectionSec ? (inReading ? remR : remL) : remL

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    stopSpeak()
    onFinish(scoreRun(groups, answers))
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

  const progressRef = useRef<RunProgress>({ gi, answers, played: [], remL, remR })
  progressRef.current = { gi, answers, played: [...played], remL, remR }

  useEffect(() => {
    if (!onPersist) return
    onPersist(progressRef.current)
  }, [gi, answers, played, onPersist])

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

  const next = () => {
    stopSpeak()
    if (isLast) finish()
    else setGi((x) => x + 1)
  }

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
        <div className="tr-title">{title}</div>
        <div className="tr-meta">
          {sectionSec && <span className="tr-section">{inReading ? '📖 Đọc' : '🎧 Nghe'}</span>}
          {(timerSec || sectionSec) ? (
            <span className={'tr-clock' + (remaining < 120 ? ' low' : '')}>
              <Icon name="clock" size={14} /> {fmtTime(remaining)}
            </span>
          ) : null}
          <span>{answeredQ}/{totalQ} câu</span>
        </div>
      </div>
      {autoJumped && (
        <div className="tr-pace low">
          ⏱️ Hết giờ phần Nghe — như đề thật, băng ghi âm dừng và bài chuyển sang phần Đọc.
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

      <div className="tr-body">
        <div className="tr-part-tag">
          Part {g.part}{qLabel ? ` · ${qLabel}` : ''}
          {g.intro && g.part <= 2 ? '' : g.intro ? ` · ${g.intro}` : ''}
          {g.passageTitle ? ` · ${g.passageTitle}` : ''}
        </div>

        {g.img && (
          <div className="tr-photo">
            <img src={g.img} alt="Ảnh đề Part 1" loading="lazy" />
          </div>
        )}

        {isListening && noAudio && (
          <div className="tr-voice-warn">
            <b>⚠️ Thiết bị chưa có giọng đọc tiếng Anh</b>
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
              ? <small>Chuẩn đề thật: audio chỉ phát MỘT lần.</small>
              : mode === 'test' && <small>Đề thật chỉ phát 1 lần — hạn chế nghe lại nhé.</small>}
            {!hasMp3 && <small>(giọng đọc của thiết bị)</small>}
          </div>
        )}

        {((checked || noAudio) && isListening && g.audio) ? (
          <div className="tr-script">
            {g.audio.map((l, i) => (
              <p key={i}><b>{SPEAKER_ICON[l.s] ?? '👨'}</b> <span lang="en">{l.text}</span></p>
            ))}
          </div>
        ) : null}

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

        {g.questions.map((q, qi) => {
          const picked = answers[q.key]
          return (
            <div key={q.key} className="tr-question">
              {q.text && (
                <p className="tr-q" lang={g.part >= 5 ? 'en' : undefined}>
                  {g.questions.length > 1 ? `${g.qStart != null ? g.qStart + qi : qi + 1}. ` : ''}{q.text}
                </p>
              )}
              {!q.text && <p className="tr-q">Chọn câu trả lời đúng nhất (nghe audio):</p>}
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
                  {q.explain && <p>💡 {q.explain}</p>}
                  {q.trap && <p>⚠️ {q.trap}</p>}
                </div>
              )}
              {checked && SKILLS[q.skill] && (
                <div className="tr-tip">
                  <b>🎯 Mẹo dạng "{SKILLS[q.skill].vi}":</b> {SKILLS[q.skill].advice}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="tr-foot">
        {mode === 'practice' && !single && !checked && (
          <button className="btn-primary" onClick={checkGroup} disabled={!allAnswered}>
            Kiểm tra đáp án
          </button>
        )}
        {(mode === 'test' || checked || (mode === 'practice' && single && checked)) && (
          <button className="btn-primary" onClick={next} disabled={mode === 'test' && !allAnswered}>
            {isLast ? 'Nộp bài & xem kết quả' : 'Tiếp tục'} <Icon name="arrow-right" size={15} />
          </button>
        )}
        <span className="tr-count">Nhóm {gi + 1}/{groups.length}</span>
      </div>
    </div>
  )
}
