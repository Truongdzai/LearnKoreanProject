import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { buildFix, phoneSym, type PhoneFix } from '@/data/phoneCoach'
import { checkSounds, type SoundReport, type WordCheck } from '@/core/utils/phonemeDiff'
import { splitWords } from '@/core/utils/speechDiff'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useVoiceClip } from '@/hooks/useVoiceClip'
import type { Phonetics } from '@/hooks/usePhonetics'
import AudioBtn from './AudioBtn'

interface Props {
  label: string
  text: string
  lang: string
  locale: string
  accents: boolean
  speak: (text: string) => void
  ph: Phonetics
}

interface FixRow {
  fix: PhoneFix
  words: string[]
  count: number
}

const MAX_FIX = 3

function tone(score: number): string {
  if (score >= 85) return 'good'
  if (score >= 60) return 'mid'
  return 'low'
}

function verdict(score: number): string {
  if (score >= 85) return 'Rất sát bản chuẩn'
  if (score >= 60) return 'Nghe ra được, còn vài âm lệch'
  if (score >= 35) return 'Người nghe phải đoán'
  return 'Khác bản chuẩn khá nhiều'
}

export default function SoundCheck({ label, text, lang, locale, accents, speak, ph }: Props) {
  const sr = useSpeechRecognition(locale)
  const clip = useVoiceClip()
  const [myClip, setMyClip] = useState('')
  const [said, setSaid] = useState('')
  const [report, setReport] = useState<SoundReport | null>(null)
  const [blank, setBlank] = useState(false)
  const spoke = useRef(false)

  const reset = useCallback(() => {
    setMyClip(''); setSaid(''); setReport(null); setBlank(false)
    sr.reset()
  }, [sr])

  useEffect(() => {
    setMyClip(''); setSaid(''); setReport(null); setBlank(false)
  }, [text])

  const run = useCallback(async (heard: string) => {
    await ph.ensure(splitWords(heard, lang))
    setSaid(heard)
    setReport(checkSounds({ lang, phones: ph.phones, read: ph.read }, text, heard))
  }, [ph, lang, text])

  useEffect(() => {
    if (sr.listening || report) return
    const heard = sr.transcript.trim()
    if (heard) void run(heard)
  }, [sr.listening, sr.transcript, report, run])

  useEffect(() => {
    if (sr.listening) { spoke.current = true; return }
    if (spoke.current) {
      spoke.current = false
      if (clip.recording) clip.stop()
      if (!sr.transcript.trim() && !sr.error) setBlank(true)
    }
  }, [sr.listening, sr.transcript, sr.error, clip])

  const record = () => {
    if (sr.listening) { sr.stop(); return }
    reset()
    sr.start()
    if (clip.supported && !clip.recording) void clip.start(setMyClip)
  }

  const fixes = useMemo<FixRow[]>(() => {
    if (!report) return []
    const seen = new Set<string>()
    const out: FixRow[] = []
    for (const issue of report.issues) {
      const fix = buildFix({
        lang, want: issue.want, got: issue.got, state: issue.state, atEnd: issue.atEnd,
      })
      if (!fix || seen.has(fix.key)) continue
      seen.add(fix.key)
      out.push({ fix, words: issue.words, count: issue.count })
      if (out.length >= MAX_FIX) break
    }
    return out
  }, [report, lang])

  const cell = (want: string, got: string, state: string, k: number) => {
    if (state === 'ok') return <i key={k} className="vl-pc ok">{phoneSym(lang, want)}</i>
    if (state === 'miss') return <i key={k} className="vl-pc miss">{phoneSym(lang, want)}</i>
    if (state === 'extra') return <i key={k} className="vl-pc extra">+{phoneSym(lang, got)}</i>
    return (
      <i key={k} className="vl-pc sub">
        {phoneSym(lang, want)}<b>{phoneSym(lang, got)}</b>
      </i>
    )
  }

  const strip = (w: WordCheck, k: number) => (
    <div key={k} className="vl-sc-word">
      <b lang={lang}>{w.target}</b>
      {w.known
        ? <span className="vl-sc-cells">{w.cells.map((c, i) => cell(c.want, c.got, c.state, i))}</span>
        : <span className="vl-sc-tag">chưa tra được phiên âm của từ này</span>}
    </div>
  )

  return (
    <div className="vl-shadow">
      <div className="vl-shadow-head">
        <span className="vl-shadow-label">{label}</span>
        {accents ? (
          <span className="vl-ex-audio">
            <AudioBtn text={text} accent="us" compact />
            <AudioBtn text={text} accent="uk" compact />
          </span>
        ) : (
          <button className="vl-mini" onClick={() => speak(text)}><Icon name="volume" size={13} /> Nghe</button>
        )}
      </div>
      <p className="vl-shadow-text" lang={lang}>{text}</p>

      <div className="vl-shadow-actions">
        {sr.supported ? (
          <button className={'vl-mini' + (sr.listening ? ' rec' : '')} onClick={record}>
            <Icon name="mic" size={14} /> {sr.listening ? 'Đang nghe… (bấm để dừng)' : 'Ghi âm & chấm âm'}
          </button>
        ) : (
          <button className="vl-mini" disabled={!clip.supported} onClick={() => (clip.recording ? clip.stop() : void clip.start(setMyClip))}>
            <Icon name="mic" size={14} /> {clip.recording ? `Dừng (${clip.seconds}s)` : 'Ghi âm'}
          </button>
        )}
        <button className="vl-mini" disabled={!myClip} onClick={() => { new Audio(myClip).play().catch(() => { }) }}>
          <Icon name="volume" size={14} /> Nghe lại giọng bạn
        </button>
        {report && (
          <button className="vl-mini" onClick={reset}>
            <Icon name="refresh" size={14} /> Làm lại
          </button>
        )}
      </div>

      {!sr.supported && (
        <p className="vl-note">Trình duyệt này chưa nhận diện được giọng nói nên chỉ ghi âm để tự nghe lại. Dùng Chrome hoặc Edge để được chấm từng âm.</p>
      )}
      {sr.error && <p className="vl-note">{sr.error}</p>}
      {blank && !report && <p className="vl-note">Chưa nghe rõ tiếng nào. Hãy nói to hơn, cách micro khoảng một gang tay rồi thử lại.</p>}

      {report && (
        <div className="vl-sc">
          <div className="vl-sc-top">
            {report.covered && <span className={'vl-sc-score ' + tone(report.score)}>{report.score}</span>}
            <div className="vl-sc-sum">
              <b>{report.covered ? verdict(report.score) : 'Chưa chấm được lượt này'}</b>
              <small>Máy nghe được: <em lang={lang}>{said}</em></small>
            </div>
          </div>

          {report.covered && <div className="vl-sc-strips">{report.words.map(strip)}</div>}

          {report.covered ? (
            fixes.length ? (
              <>
                <div className="vl-sc-h">SAI Ở ÂM NÀO VÀ SỬA THẾ NÀO</div>
                <ul className="vl-sc-fixes">
                  {fixes.map(({ fix, words, count }) => (
                    <li key={fix.key}>
                      <div className="vl-sc-fixh">
                        <b>{fix.title}</b>
                        {words.length > 0 && <span className="vl-sc-tag" lang={lang}>trong {words.join(', ')}</span>}
                        {count > 1 && <span className="vl-sc-tag">{count} lần</span>}
                      </div>
                      <p className="vl-sc-why">{fix.why}</p>
                      <p className="vl-sc-how"><Icon name="target" size={13} /> {fix.how}</p>
                      {fix.drill.length > 0 && (
                        <div className="vl-sc-drill">
                          <span>Luyện:</span>
                          {fix.drill.map((d) => (
                            <button key={d} className="vl-sc-dw" lang={lang} onClick={() => speak(d)}>
                              <Icon name="volume" size={12} /> {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="vl-sc-clean"><Icon name="check-circle" size={15} /> Không âm nào lệch — cả chuỗi âm khớp với bản chuẩn.</p>
            )
          ) : (
            <p className="vl-note">Máy nghe ra một từ không có trong kho phiên âm nên chưa tách được từng âm để chấm. Hãy nói lại chậm và rõ hơn.</p>
          )}

          {report.covered && report.skipped.length > 0 && (
            <p className="vl-note">Chưa tra được phiên âm của: {report.skipped.join(', ')} — phần này không được tính vào điểm.</p>
          )}

          <p className="vl-note">Máy so chuỗi âm của từ mà bộ nhận diện giọng nói nghe được với chuỗi âm chuẩn, nên nó bắt được lỗi làm người nghe hiểu sang từ khác. Những lỗi nhỏ hơn thế thì tai bạn khi nghe lại bản ghi vẫn là thước đo tốt nhất.</p>
        </div>
      )}
    </div>
  )
}
