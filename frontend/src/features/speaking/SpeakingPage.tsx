import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { romanizeLine } from '@/core/utils/romanize'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { scenariosFor, type Scenario } from './scenarios'
import { fetchSpeakReply, type SpeakLine } from '@/core/api/speaking.api'

interface ChatMsg { who: 'bot' | 'me'; ko: string; vi: string; feedback?: string }

function speak(text: string, locale: string, rate = 0.95) {
  if (!text) return
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = locale
    u.rate = rate
    const base = locale.split('-')[0]
    const voice = speechSynthesis.getVoices().find((v) => v.lang === locale || v.lang.startsWith(base))
    if (voice) u.voice = voice
    speechSynthesis.speak(u)
  } catch { /* unsupported */ }
}

export default function SpeakingPage() {
  const { recordEvent, learnLang, nativeLang, goal } = useAppStore()
  const cfg = studyLang(learnLang)
  // Tình huống hợp mục tiêu onboarding được xếp lên đầu danh sách.
  const scenarios = [...scenariosFor(learnLang)].sort((a, b) => {
    const am = goal && a.tags?.includes(goal) ? 0 : 1
    const bm = goal && b.tags?.includes(goal) ? 0 : 1
    return am - bm
  })
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [suggestions, setSuggestions] = useState<SpeakLine[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [aiOff, setAiOff] = useState(false)
  const [showSuggest, setShowSuggest] = useState(true)
  const [viShown, setViShown] = useState<Set<number>>(new Set())
  const [romaShown, setRomaShown] = useState<Set<number>>(new Set())
  const fallbackStep = useRef(0)
  const turns = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)
  const sr = useSpeechRecognition(cfg.locale)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  // Leaving a scenario when the user switches study language keeps things consistent.
  useEffect(() => { setScenario(null) }, [learnLang])

  // Khi micro dừng và có kết quả, đưa câu nhận diện vào ô soạn để người học kiểm tra trước khi gửi.
  useEffect(() => {
    if (!sr.listening && sr.transcript.trim()) setDraft(sr.transcript.trim())
  }, [sr.listening, sr.transcript])

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<number>>>, i: number) =>
    set((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const finish = () => {
    setFinished(true)
    setSuggestions([])
    if (sr.listening) sr.stop()
  }

  const endNoAi = () => {
    setMsgs((prev) => [...prev, { who: 'bot', ko: 'Mất kết nối với AI. Hãy thử lại sau giây lát nhé.', vi: '' }])
    finish()
  }

  const start = (s: Scenario) => {
    setScenario(s)
    setDraft(''); setFinished(false); setAiOff(false); setShowSuggest(true)
    setViShown(new Set()); setRomaShown(new Set())
    fallbackStep.current = 0; turns.current = 0
    sr.reset()

    if (s.opener) {
      setMsgs([{ who: 'bot', ...s.opener }])
      setSuggestions(s.fallback?.suggestions[0] || [])
      setLoading(false)
      setTimeout(() => speak(s.opener!.ko, cfg.locale), 250)
      return
    }

    // No hand-written lines for this language → let the AI open the conversation.
    setMsgs([]); setSuggestions([]); setLoading(true)
    fetchSpeakReply({ persona: s.persona, situation: s.situation, user_say: '', history: [], lang: learnLang, native: nativeLang })
      .then((r) => {
        setMsgs([{ who: 'bot', ko: r.reply_ko, vi: r.reply_vi }])
        setSuggestions(r.suggestions || [])
        setTimeout(() => speak(r.reply_ko, cfg.locale), 250)
      })
      .catch(() => {
        setAiOff(true)
        setMsgs([{ who: 'bot', ko: 'Cần kết nối AI để luyện nói tình huống này. Hãy thử lại sau giây lát.', vi: '' }])
        setFinished(true)
      })
      .finally(() => setLoading(false))
  }

  const fallbackReply = (sc: Scenario) => {
    if (!sc.fallback) { endNoAi(); return }
    const step = fallbackStep.current
    fallbackStep.current += 1
    const bot = sc.fallback.bot[step]
    if (bot) {
      setMsgs((prev) => [...prev, { who: 'bot', ...bot }])
      setSuggestions(sc.fallback!.suggestions[step + 1] || [])
      setTimeout(() => speak(bot.ko, cfg.locale), 300)
    } else {
      setMsgs((prev) => [...prev, { who: 'bot', ko: 'Tuyệt lắm! Bạn nói rất tự nhiên. Mình luyện lại nhé?', vi: '' }])
      finish()
    }
  }

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!scenario || !text || loading || finished) return
    if (sr.listening) sr.stop()
    sr.reset(); setDraft('')

    const userMsg: ChatMsg = { who: 'me', ko: text, vi: '' }
    const history = [...msgs, userMsg].map((m) => ({ role: m.who, ko: m.ko }))
    setMsgs((prev) => [...prev, userMsg])
    setSuggestions([])
    turns.current += 1
    recordEvent('pronounce', 1)

    if (aiOff) { fallbackReply(scenario); return }

    setLoading(true)
    try {
      const r = await fetchSpeakReply({
        persona: scenario.persona,
        situation: scenario.situation,
        user_say: text,
        history,
        lang: learnLang,
        native: nativeLang,
      })
      setMsgs((prev) => {
        const copy = [...prev]
        if (r.feedback) copy[copy.length - 1] = { ...copy[copy.length - 1], feedback: r.feedback }
        return [...copy, { who: 'bot', ko: r.reply_ko, vi: r.reply_vi }]
      })
      setSuggestions(r.suggestions || [])
      setTimeout(() => speak(r.reply_ko, cfg.locale), 300)
      if (r.done) finish()
    } catch {
      setAiOff(true)
      fallbackReply(scenario)
    } finally {
      setLoading(false)
    }
  }

  const record = useCallback(() => {
    if (loading || finished) return
    if (sr.listening) sr.stop()
    else { setDraft(''); sr.start() }
  }, [loading, finished, sr])

  // Nhấn Enter để bắt đầu / dừng ghi âm (trừ khi đang gõ trong ô soạn).
  useEffect(() => {
    if (!scenario || finished) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      record()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scenario, finished, record])

  if (!scenario) {
    return (
      <div className="speaking">
        <h1 className="page-title"><Icon name="mic" /> Luyện nói với AI</h1>
        <p className="page-sub">Chọn một tình huống và trò chuyện bằng {cfg.name} — nhân vật AI trả lời, đọc to, gợi ý câu và nhận xét cách bạn nói.</p>
        <div className="scenario-grid">
          {scenarios.map((s) => (
            <button key={s.id} className="scenario-card sp-pick" onClick={() => start(s)}>
              <span className="sp-pick-ava">{s.avatar}</span>
              <div className="sp-pick-body">
                <b>{s.emoji} {s.title}{goal && s.tags?.includes(goal) && <span className="sp-goal-badge">🎯 hợp mục tiêu</span>}</b>
                <span className="sp-pick-char">{s.character} · {s.role}</span>
                <span className="sp-pick-sit">{s.situation}</span>
              </div>
              <span className="scenario-go">Bắt đầu <Icon name="arrow-right" size={14} /></span>
            </button>
          ))}
        </div>
        <div className="speaking-note">
          <Icon name="bulb" size={16} /> Mẹo: dùng <b>Chrome</b> hoặc <b>Edge</b> và cho phép micro để nói. Bạn cũng có thể gõ câu trả lời nếu muốn.
        </div>
      </div>
    )
  }

  return (
    <div className="speaking sp-chat">
      <div className="sp-head">
        <button className="btn-ghost sm" onClick={() => setScenario(null)}><Icon name="chevron-left" size={15} /> Đổi tình huống</button>
        <div className="sp-head-who">
          <span className="sp-head-ava">{scenario.avatar}</span>
          <div>
            <b>{scenario.character}</b>
            <span>{scenario.emoji} {scenario.role}</span>
          </div>
        </div>
      </div>

      <div className="sp-box">
        {msgs.map((m, i) => (
          m.who === 'bot' ? (
            <div key={i} className="sp-msg bot">
              <span className="sp-ava">{scenario.avatar}</span>
              <div className="sp-bubble">
                <div className="sp-name">{scenario.character}</div>
                <div className="sp-ko" lang={learnLang}>{m.ko}</div>
                {romaShown.has(i) && <div className="sp-roma">{romanizeLine(m.ko)}</div>}
                {viShown.has(i) && <div className="sp-trans"><b>BẢN DỊCH</b> {m.vi}</div>}
                <div className="sp-tools">
                  <button onClick={() => speak(m.ko, cfg.locale)}><Icon name="volume" size={13} /> Nghe lại</button>
                  <button className={viShown.has(i) ? 'on' : ''} onClick={() => toggle(setViShown, i)}><Icon name="globe" size={13} /> Dịch</button>
                  {cfg.romanizeChat && (
                    <button className={romaShown.has(i) ? 'on' : ''} onClick={() => toggle(setRomaShown, i)}><Icon name="letters" size={13} /> {romaShown.has(i) ? 'Ẩn cách đọc' : 'Hiện cách đọc'}</button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="sp-msg me">
              <div className="sp-bubble" lang={learnLang}>{m.ko}</div>
              {m.feedback && <div className="sp-fb"><Icon name="sparkles" size={12} /> {m.feedback}</div>}
            </div>
          )
        ))}
        {loading && (
          <div className="sp-msg bot">
            <span className="sp-ava">{scenario.avatar}</span>
            <div className="sp-bubble"><div className="sp-typing"><span /><span /><span /></div></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {finished ? (
        <div className="sp-done">
          <Icon name="party" size={26} />
          <b>Hoàn thành hội thoại!</b>
          <p>Bạn đã luyện {turns.current} lượt nói với {scenario.character}. Tuyệt vời, tiếp tục phát huy nhé!</p>
          <div className="sp-done-actions">
            <button className="btn-primary sm" onClick={() => start(scenario)}><Icon name="mic" size={14} /> Luyện lại</button>
            <button className="btn-ghost sm" onClick={() => setScenario(null)}>Đổi tình huống</button>
          </div>
        </div>
      ) : (
        <>
          {suggestions.length > 0 && (
            <div className="sp-suggest">
              <button className="sp-suggest-head" onClick={() => setShowSuggest((v) => !v)}>
                {showSuggest ? 'Ẩn câu gợi ý' : 'Hiện câu gợi ý'} <Icon name="chevron-down" size={14} style={{ transform: showSuggest ? 'none' : 'rotate(-90deg)' }} />
              </button>
              {showSuggest && (
                <div className="sp-sug-list">
                  {suggestions.map((s, i) => (
                    <div key={i} className="sp-sug-card">
                      <button className="sp-sug-main" onClick={() => send(s.ko)} disabled={loading}>
                        <span lang={learnLang}>{s.ko}</span>
                        <span className="sp-sug-vi"><b>Bản dịch:</b> {s.vi}</span>
                      </button>
                      <button className="sp-sug-speak" onClick={() => speak(s.ko, cfg.locale)} title="Nghe"><Icon name="volume" size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="sp-foot">
            <div className="sp-draft">
              <input
                value={sr.listening ? (sr.interim || 'Đang nghe…') : draft}
                onChange={(e) => setDraft(e.target.value)}
                readOnly={sr.listening}
                lang={learnLang}
                placeholder={`Nói hoặc gõ câu trả lời ${cfg.name}…`}
                onKeyDown={(e) => { if (e.key === 'Enter') send(draft) }}
              />
              <button className="sp-send" disabled={!draft.trim() || loading} onClick={() => send(draft)}><Icon name="send" size={18} /></button>
            </div>
            {sr.error && <div className="sp-err"><Icon name="x-circle" size={14} /> {sr.error}</div>}
            {sr.supported ? (
              <>
                <button className={'sp-mic' + (sr.listening ? ' on' : '')} onClick={record} disabled={loading}>
                  <Icon name="mic" size={28} />
                </button>
                <div className="sp-mic-hint">{sr.listening ? 'Đang ghi âm… nhấn để dừng' : 'Nhấn Enter để bắt đầu / dừng ghi âm'}</div>
              </>
            ) : (
              <div className="sp-mic-hint">Trình duyệt chưa hỗ trợ ghi âm — hãy gõ câu trả lời ở trên (dùng Chrome/Edge để nói).</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
