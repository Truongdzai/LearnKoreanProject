import { useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { romanizeLine } from '@/core/utils/romanize'
import { pronunciationScore, markWords, scoreBand } from '@/core/utils/pronounce'
import { fetchPronounceFeedback, type PronounceFeedback } from '@/core/api/pronounce.api'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import type { Lesson } from '@/models/lesson.model'

const REWARD = 5

export default function ShadowingPractice({ lesson }: { lesson: Lesson }) {
  const { recordEvent, learnLang, nativeLang } = useAppStore()
  const cfg = studyLang(learnLang)
  const segs = lesson.segments
  const [i, setI] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
  const [ai, setAi] = useState<PronounceFeedback | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())
  const sr = useSpeechRecognition(cfg.locale)

  const cur = segs[i]
  const romaja = useMemo(() => (cfg.romanizeChat ? romanizeLine(cur.ko) : ''), [cur.ko, cfg.romanizeChat])

  const speak = (text: string, rate = 0.9) => {
    try {
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = cfg.locale
      u.rate = rate
      speechSynthesis.speak(u)
    } catch {
      /* unsupported */
    }
  }

  const resetAttempt = () => {
    setScore(null); setHeard(''); setAi(null); setAiError(''); sr.reset()
  }

  const go = (idx: number) => {
    if (idx < 0 || idx >= segs.length) return
    setI(idx); resetAttempt()
  }

  const record = () => {
    if (sr.listening) { sr.stop(); return }
    setScore(null); setAi(null); setAiError('')
    sr.start()
  }

  const applyResult = (said: string) => {
    const sc = pronunciationScore(cur.ko, said)
    setHeard(said)
    setScore(sc)
    if (sc >= 65 && !rewarded.has(i)) {
      recordEvent('pronounce', 1)
      setRewarded((r) => new Set(r).add(i))
    }
  }

  // When recognition finishes and we have a transcript, score it.
  useEffect(() => {
    if (sr.listening || score !== null) return
    const said = sr.transcript.trim()
    if (said) applyResult(said)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sr.listening, sr.transcript])

  const askAI = async () => {
    if (score === null) return
    setAiLoading(true); setAiError(''); setAi(null)
    try {
      const fb = await fetchPronounceFeedback({ target: cur.ko, heard, score, vi: cur.vi || '', lang: learnLang, native: nativeLang })
      setAi(fb)
    } catch (e) {
      setAiError((e as Error).message)
    } finally {
      setAiLoading(false)
    }
  }

  const band = score !== null ? scoreBand(score) : null
  const marks = score !== null ? markWords(cur.ko, heard) : []
  const passed = rewarded.size

  return (
    <div className="shadow">
      <div className="shadow-bar">
        <button className="btn-ghost sm" disabled={i === 0} onClick={() => go(i - 1)}><Icon name="chevron-left" size={15} /> Trước</button>
        <div className="shadow-prog">
          <span>Câu {i + 1}/{segs.length}</span>
          <div className="tp-bar"><span style={{ width: ((i + 1) / segs.length) * 100 + '%' }} /></div>
          <span className="shadow-passed"><Icon name="check-circle" size={14} /> {passed} đạt</span>
        </div>
        <button className="btn-ghost sm" disabled={i === segs.length - 1} onClick={() => go(i + 1)}>Tiếp <Icon name="arrow-right" size={15} /></button>
      </div>

      <div className="shadow-card">
        <div className="shadow-ko" lang={learnLang}>
          {marks.length
            ? marks.map((m, k) => <span key={k} className={'sw ' + (m.ok ? 'ok' : 'miss')}>{m.word} </span>)
            : cur.ko}
        </div>
        {romaja && <div className="shadow-romaja">{romaja}</div>}
        {cur.vi && <div className="shadow-vi">{cur.vi}</div>}

        <div className="shadow-listen">
          <button className="btn-ghost" onClick={() => speak(cur.ko, 0.9)}><Icon name="volume" size={16} /> Nghe mẫu</button>
          <button className="btn-ghost" onClick={() => speak(cur.ko, 0.6)}><Icon name="volume" size={16} /> Nghe chậm</button>
        </div>

        {sr.supported ? (
          <>
            <button className={'mic-btn' + (sr.listening ? ' on' : '')} onClick={record}>
              <Icon name="mic" size={26} />
              <span>{sr.listening ? 'Đang nghe… (bấm để dừng)' : 'Bấm và nói câu trên'}</span>
            </button>
            {(sr.listening || sr.interim) && <div className="shadow-interim" lang={learnLang}>{sr.interim || '…'}</div>}
            {sr.error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {sr.error}</div>}
          </>
        ) : (
          <div className="shadow-err"><Icon name="x-circle" size={15} /> Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy dùng <b>Chrome</b> hoặc <b>Edge</b> để luyện nói.</div>
        )}
      </div>

      {score !== null && band && (
        <div className={'shadow-result ' + band.tone}>
          <div className="sr-score">
            <svg viewBox="0 0 80 80" className="sr-ring">
              <circle cx="40" cy="40" r="34" className="sr-ring-bg" />
              <circle cx="40" cy="40" r="34" className="sr-ring-fg"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)} />
            </svg>
            <b>{score}<small>%</small></b>
          </div>
          <div className="sr-body">
            <div className="sr-band">{band.label}{score >= 65 && rewarded.has(i) && <span className="sr-coin">+{REWARD} XP <Icon name="star" size={13} /></span>}</div>
            <div className="sr-heard"><span>Bạn đã nói:</span> <em lang={learnLang}>{heard || '(không nghe rõ)'}</em></div>
            <div className="sr-actions">
              <button className="btn-ghost sm" onClick={resetAttempt}><Icon name="mic" size={14} /> Thử lại</button>
              <button className="btn-primary sm" onClick={askAI} disabled={aiLoading}>
                <Icon name="sparkles" size={14} /> {aiLoading ? 'AI đang chấm…' : 'Nhận xét từ AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {aiError && (
        <div className="shadow-aierr">
          <Icon name="x-circle" size={15} /> Không lấy được nhận xét AI: {aiError}
          <span>Mẹo: cần chạy <b>start.bat</b> (backend) và đã cấu hình khoá Gemini.</span>
        </div>
      )}

      {ai && (
        <div className="ai-feedback">
          <div className="ai-fb-head"><Icon name="vyling" size={18} /> Nhận xét từ AI {ai.model && <span className="ai-model">{ai.model}</span>}</div>
          <p className="ai-fb-text">{ai.feedback}</p>
          {ai.tips.length > 0 && (
            <ul className="ai-fb-tips">
              {ai.tips.map((t, k) => <li key={k}><Icon name="check" size={14} /> {t}</li>)}
            </ul>
          )}
          {ai.encouragement && <div className="ai-fb-enc">💪 {ai.encouragement}</div>}
        </div>
      )}
    </div>
  )
}
