import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { phoneLabel } from '@/data/phoneCoach'
import {
  EMPTY_GRADE, gradeSpeech, topFixes, type SpeechGrade, type WordGrade,
} from '@/core/utils/pronGrade'
import { splitWords } from '@/core/utils/speechDiff'
import { useAsr } from '@/hooks/useAsr'
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
  const sr = useAsr(locale)
  const clip = useVoiceClip()
  const [myClip, setMyClip] = useState('')
  const [said, setSaid] = useState('')
  const [grade, setGrade] = useState<SpeechGrade | null>(null)
  const [blank, setBlank] = useState(false)
  const spoke = useRef(false)

  const reset = useCallback(() => {
    setMyClip(''); setSaid(''); setGrade(null); setBlank(false)
    sr.reset()
  }, [sr])

  useEffect(() => {
    setMyClip(''); setSaid(''); setGrade(null); setBlank(false)
  }, [text])

  const run = useCallback(async (heard: string, alts: string[]) => {
    await ph.ensure(splitWords([heard, ...alts].join(' '), lang))
    setSaid(heard)
    setGrade(gradeSpeech(
      { lang, phones: ph.phones, read: ph.read },
      { target: text, heard, alternatives: alts },
    ))
  }, [ph, lang, text])

  useEffect(() => {
    if (sr.listening || grade) return
    const heard = sr.transcript.trim()
    if (heard) void run(heard, sr.alternatives)
  }, [sr.listening, sr.transcript, grade, run])

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

  const fixes = useMemo(() => topFixes(grade ?? EMPTY_GRADE, MAX_FIX), [grade])
  const lab = (tok: string) => phoneLabel(lang, tok)

  const strip = (w: WordGrade, k: number) => (
    <div key={k} className={'vl-sc-word ' + w.state}>
      <b lang={lang}>{w.target || w.heard}</b>
      {w.state === 'extra'
        ? <span className="vl-sc-tag">thừa từ này</span>
        : w.unsure
          ? <span className="vl-sc-tag">máy nghe chưa chắc — không tính là lỗi</span>
          : !w.known
            ? <span className="vl-sc-tag">chưa tra được phiên âm nên chỉ so được mặt chữ</span>
            : (
              <span className="vl-sc-cells">
                {w.cells.map((c, i) => {
                  if (c.state === 'ok') return <i key={i} className="vl-pc ok">{lab(c.want)}</i>
                  if (c.state === 'miss') return <i key={i} className="vl-pc miss">{lab(c.want)}</i>
                  if (c.state === 'extra') return <i key={i} className="vl-pc extra">+{lab(c.got)}</i>
                  return <i key={i} className="vl-pc sub">{lab(c.want)}<b>{lab(c.got)}</b></i>
                })}
              </span>
            )}
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
        {grade && (
          <button className="vl-mini" onClick={reset}>
            <Icon name="refresh" size={14} /> Làm lại
          </button>
        )}
      </div>

      {!sr.supported && (
        <p className="vl-note">Trình duyệt này chưa nhận diện được giọng nói nên chỉ ghi âm để tự nghe lại. Dùng Chrome hoặc Edge để được chấm từng âm.</p>
      )}
      {sr.error && <p className="vl-note">{sr.error}</p>}
      {blank && !grade && <p className="vl-note">Chưa nghe rõ tiếng nào. Hãy nói to hơn, cách micro khoảng một gang tay rồi thử lại.</p>}

      {grade && (
        <div className="vl-sc">
          <div className="vl-sc-top">
            {grade.detailed && <span className={'vl-sc-score ' + tone(grade.score)}>{grade.score}</span>}
            <div className="vl-sc-sum">
              <b>{grade.detailed ? verdict(grade.score) : 'Chưa chấm được lượt này'}</b>
              <small>Máy nghe được: <em lang={lang}>{said}</em></small>
            </div>
          </div>

          {grade.detailed && <div className="vl-sc-strips">{grade.words.map(strip)}</div>}

          {grade.detailed ? (
            fixes.length ? (
              <>
                <div className="vl-sc-h">SAI Ở ÂM NÀO VÀ SỬA THẾ NÀO</div>
                <ul className="vl-sc-fixes">
                  {fixes.map(({ fix, words, count }) => fix && (
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

          {grade.detailed && grade.skipped.length > 0 && (
            <p className="vl-note">Chưa tra được phiên âm của: {grade.skipped.join(', ')} — phần này chấm theo mặt chữ nên kém chính xác hơn.</p>
          )}

          <p className="vl-note">Máy so từng âm của từ mà bộ nhận diện giọng nói nghe được với chuỗi âm chuẩn, nên nó bắt được lỗi làm người nghe hiểu sang từ khác. Khi máy phân vân giữa nhiều cách nghe, từ đó được đánh dấu “chưa chắc” và không bị tính là lỗi.</p>
        </div>
      )}
    </div>
  )
}
