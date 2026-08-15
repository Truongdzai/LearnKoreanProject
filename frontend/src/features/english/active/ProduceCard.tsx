import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Icon from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import { useAsr } from '@/hooks/useAsr'
import { coachEnglish, type CoachResult, type CoachTask } from '@/core/api/english.api'
import { ERROR_KINDS } from '@/data/englishFast'
import { usesChunk, type ActiveChunk } from '@/data/englishActive'
import { useFast } from '../fast'

interface Props {
  task: CoachTask
  brief: ReactNode
  target?: ActiveChunk
  prompt?: string
  speakPrompt?: string
  placeholder?: string
  level?: string
  rows?: number
  autoTimer?: boolean
  onResult?: (r: CoachResult, seconds: number) => void
  onNext?: () => void
  nextLabel?: string
}

const KIND_LABEL: Record<string, string> = ERROR_KINDS.reduce((acc, k) => {
  acc[k.id] = k.label
  return acc
}, {} as Record<string, string>)

function scoreTone(score: number): string {
  if (score >= 85) return 'good'
  if (score >= 60) return 'mid'
  return 'bad'
}

export default function ProduceCard({
  task, brief, target, prompt, speakPrompt, placeholder,
  level = 'a2b1', rows = 3, autoTimer = true,
  onResult, onNext, nextLabel = 'Câu tiếp theo',
}: Props) {
  const { addError } = useFast()
  const sr = useAsr('en-US')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState<CoachResult | null>(null)
  const [secs, setSecs] = useState(0)
  const [tries, setTries] = useState(0)
  const [offline, setOffline] = useState(false)
  const startRef = useRef(Date.now())
  const firstRef = useRef(0)
  const loggedRef = useRef(false)

  const markFirst = useCallback(() => {
    if (!firstRef.current) firstRef.current = Date.now()
  }, [])

  useEffect(() => {
    startRef.current = Date.now()
    firstRef.current = 0
    loggedRef.current = false
    setText('')
    setRes(null)
    setErr('')
    setOffline(false)
    setTries(0)
    sr.reset()
  }, [target?.id, prompt])

  useEffect(() => {
    if (sr.transcript) setText((t) => (t ? `${t} ${sr.transcript}`.trim() : sr.transcript))
  }, [sr.transcript])

  const playPrompt = useCallback(() => {
    if (speakPrompt) speakAccent(speakPrompt, 'us')
    if (autoTimer) {
      startRef.current = Date.now()
      firstRef.current = 0
    }
  }, [speakPrompt, autoTimer])

  const selfCheck = useCallback(() => {
    const say = text.trim()
    const words = say.split(/\s+/).filter(Boolean).length
    const seconds = Math.round(((firstRef.current || Date.now()) - startRef.current) / 100) / 10
    const hit = target ? usesChunk(say, target) : true
    const ok = hit && words >= (target ? 4 : 12)
    const local: CoachResult = {
      ok,
      score: ok ? 70 : 40,
      used_target: hit,
      fixed: '',
      natural: '',
      praise: ok
        ? 'Bạn đã tự tạo ra một câu mới — đó mới là phần khó, và bạn đã làm được.'
        : '',
      tip: ok
        ? 'Đây là bản tự chấm máy — nó chỉ soi được là bạn có dùng đúng cụm và đủ dài, chưa soi được ngữ pháp.'
        : target
          ? `Câu chưa dùng tới "${target.en}" hoặc còn quá ngắn. Thử viết lại thành một câu trọn vẹn.`
          : 'Đoạn còn ngắn quá — hãy nói ít nhất 12 chữ.',
      followup: '',
      errors: [],
    }
    setRes(local)
    setSecs(seconds)
    setTries((n) => n + 1)
    onResult?.(local, seconds)
  }, [text, target, onResult])

  const submit = useCallback(async () => {
    const say = text.trim()
    if (!say || busy) return
    const seconds = Math.round(((firstRef.current || Date.now()) - startRef.current) / 100) / 10
    setBusy(true)
    setErr('')
    try {
      const r = await coachEnglish({
        task,
        target: target?.en,
        pattern: target?.pattern,
        meaning: target?.vi,
        cue: target?.cue,
        prompt,
        say,
        level,
        seconds,
      })
      setRes(r)
      setSecs(seconds)
      setTries((n) => n + 1)
      if (!loggedRef.current) {
        for (const e of r.errors) addError(e.kind, e.wrong, e.right, e.note)
        loggedRef.current = true
      }
      onResult?.(r, seconds)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không chấm được lúc này.')
      setOffline(true)
    } finally {
      setBusy(false)
    }
  }, [text, busy, task, target, prompt, level, addError, onResult])

  const retry = useCallback(() => {
    setRes(null)
    setErr('')
    setOffline(false)
    setText('')
    sr.reset()
    startRef.current = Date.now()
    firstRef.current = 0
  }, [sr])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
  }

  return (
    <div className="ac-produce">
      <div className="ac-brief">{brief}</div>

      {speakPrompt && (
        <div className="ac-prompt">
          <button className="ac-play" onClick={playPrompt} title="Nghe lại">
            <Icon name="volume" size={17} />
          </button>
          <div>
            <b>{prompt || speakPrompt}</b>
            <small>Nghe rồi trả lời ngay — đừng dịch trong đầu.</small>
          </div>
        </div>
      )}

      {!res && (
        <>
          <textarea
            className="ac-input"
            rows={rows}
            value={text}
            placeholder={placeholder || 'Viết câu tiếng Anh của bạn…'}
            onChange={(e) => { markFirst(); setText(e.target.value) }}
            onKeyDown={onKey}
          />
          <div className="ac-tools">
            {sr.supported && (
              <button
                className={'ac-mic' + (sr.listening ? ' on' : '')}
                onClick={() => { markFirst(); sr.listening ? sr.stop() : sr.start() }}
              >
                <Icon name={sr.listening ? 'stop' : 'mic'} size={15} />
                {sr.listening ? 'Đang nghe…' : 'Nói thay vì gõ'}
              </button>
            )}
            <button className="ac-send" disabled={!text.trim() || busy} onClick={submit}>
              {busy ? <><Icon name="refresh" size={15} /> Đang chấm…</> : <><Icon name="send" size={15} /> Nhờ chấm</>}
            </button>
            <span className="ac-hint">Ctrl + Enter để gửi nhanh</span>
          </div>
          {sr.interim && <div className="ac-interim">{sr.interim}</div>}
          {sr.error && <div className="ac-err">{sr.error}</div>}
          {err && <div className="ac-err">{err}</div>}
          {offline && (
            <div className="ac-fallback">
              <b><Icon name="tool" size={14} /> AI không chấm được lúc này</b>
              <span>
                Bạn vẫn đi tiếp được: máy sẽ tự kiểm ở mức tối thiểu — có dùng đúng cụm không và câu có đủ dài không.
                Nó không soi được ngữ pháp, nên hôm nào AI chấm lại được thì bạn nên làm lại câu này.
              </span>
              <button className="ac-ghost" onClick={selfCheck}>
                <Icon name="check" size={15} /> Tự kiểm không cần AI
              </button>
            </div>
          )}
        </>
      )}

      {res && (
        <div className="ac-result">
          <div className="ac-score-row">
            <span className={'ac-score ' + scoreTone(res.score)}>{res.score}</span>
            <div className="ac-score-txt">
              <b>{res.score >= 85 ? 'Dùng được ngoài đời' : res.score >= 60 ? 'Hiểu được, còn gợn' : 'Người nghe sẽ khó hiểu'}</b>
              <small>{secs}s để bật ra{tries > 1 ? ` · lần thử ${tries}` : ''}</small>
            </div>
          </div>

          {res.praise && <p className="ac-praise"><Icon name="check-circle" size={15} /> {res.praise}</p>}

          <div className="ac-said">
            <span>Bạn nói</span>
            <p>{text}</p>
          </div>

          {res.fixed && res.fixed.trim() !== text.trim() && (
            <div className="ac-fixed">
              <span>Bản đã sửa</span>
              <p>{res.fixed}</p>
              <button className="ac-say-btn" onClick={() => speakAccent(res.fixed, 'us')}>
                <Icon name="volume" size={14} /> Nghe
              </button>
            </div>
          )}

          {res.natural && (
            <div className="ac-natural">
              <span>Người bản xứ hay nói</span>
              <p>{res.natural}</p>
              <button className="ac-say-btn" onClick={() => speakAccent(res.natural, 'us')}>
                <Icon name="volume" size={14} /> Nghe
              </button>
            </div>
          )}

          {res.errors.length > 0 && (
            <div className="ac-errors">
              <b><Icon name="bell" size={14} /> Đã ghi {res.errors.length} lỗi vào Sổ lỗi</b>
              {res.errors.map((e, i) => (
                <div key={i} className="ac-error">
                  <span className={'ac-kind k-' + e.kind}>{KIND_LABEL[e.kind] ?? e.kind}</span>
                  <s>{e.wrong}</s>
                  <Icon name="arrow-right" size={13} />
                  <b>{e.right}</b>
                  {e.note && <small>{e.note}</small>}
                </div>
              ))}
            </div>
          )}

          {res.tip && <p className="ac-tip"><Icon name="bulb" size={15} /> {res.tip}</p>}

          <div className="ac-after">
            <button className="ac-retry" onClick={retry}>
              <Icon name="refresh" size={15} /> Nói lại cho đúng
            </button>
            {onNext && (
              <button className="ac-next" onClick={onNext}>
                {nextLabel} <Icon name="arrow-right" size={15} />
              </button>
            )}
          </div>

          {res.followup && (
            <div className="ac-followup">
              <Icon name="sparkles" size={14} />
              <span>Nói tiếp đi: <b>{res.followup}</b></span>
              <button className="ac-say-btn" onClick={() => speakAccent(res.followup, 'us')}>
                <Icon name="volume" size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
