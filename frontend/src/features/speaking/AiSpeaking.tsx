import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { romanizeLine } from '@/core/utils/romanize'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { speakLang } from '@/core/tts'
import { LEARN_GOALS } from '@/features/onboarding/goals'
import { scenariosFor, randomScenario, type Scenario } from './scenarios'
import { LEVELS, loadLevel, saveLevel, type SpeakLevel } from './levels'
import { fetchSpeakReply, type SpeakLine } from '@/core/api/speaking.api'

interface ChatMsg { who: 'bot' | 'me'; ko: string; vi: string; feedback?: string }

function speak(text: string, locale: string, rate = 0.95) {
  if (!text) return
  speakLang(text, locale, rate)
}

export default function AiSpeaking() {
  const { recordEvent, learnLang, nativeLang, goal, t, learnLangName } = useAppStore()
  const cfg = studyLang(learnLang)
  const all = scenariosFor(learnLang)
  const [filter, setFilter] = useState<string>('')
  const [level, setLevel] = useState<SpeakLevel>(loadLevel)
  const [topic, setTopic] = useState('')
  const filters = LEARN_GOALS.filter((g) => all.some((s) => s.tags?.includes(g.id)))
  const scenarios = all
    .filter((s) => !filter || s.tags?.includes(filter))
    .sort((a, b) => {
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
  const [showPhrases, setShowPhrases] = useState(true)
  const [viShown, setViShown] = useState<Set<number>>(new Set())
  const [romaShown, setRomaShown] = useState<Set<number>>(new Set())
  const fallbackStep = useRef(0)
  const turns = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)
  const sr = useSpeechRecognition(cfg.locale)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  useEffect(() => { setScenario(null) }, [learnLang])

  useEffect(() => {
    if (!sr.listening && sr.transcript.trim()) setDraft(sr.transcript.trim())
  }, [sr.listening, sr.transcript])

  const pickLevel = (id: SpeakLevel) => { setLevel(id); saveLevel(id) }

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<number>>>, i: number) =>
    set((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const finish = () => {
    setFinished(true)
    setSuggestions([])
    if (sr.listening) sr.stop()
  }

  const endNoAi = () => {
    setMsgs((prev) => [...prev, { who: 'bot', ko: t('sp.aiLost'), vi: '' }])
    finish()
  }

  const start = (s: Scenario) => {
    setScenario(s)
    setDraft(''); setFinished(false); setAiOff(false); setShowSuggest(true); setShowPhrases(true)
    setViShown(new Set()); setRomaShown(new Set())
    fallbackStep.current = 0; turns.current = 0
    sr.reset()

    if (s.opener && level === 'beginner') {
      setMsgs([{ who: 'bot', ...s.opener }])
      setSuggestions(s.fallback?.suggestions[0] || [])
      setLoading(false)
      setTimeout(() => speak(s.opener!.ko, cfg.locale), 250)
      return
    }

    setMsgs([]); setSuggestions([]); setLoading(true)
    fetchSpeakReply({ persona: s.persona, situation: s.situation, user_say: '', history: [], level, lang: learnLang, native: nativeLang })
      .then((r) => {
        setMsgs([{ who: 'bot', ko: r.reply_ko, vi: r.reply_vi }])
        setSuggestions(r.suggestions || [])
        setTimeout(() => speak(r.reply_ko, cfg.locale), 250)
      })
      .catch(() => {
        if (s.opener) {
          setAiOff(true)
          setMsgs([{ who: 'bot', ...s.opener }])
          setSuggestions(s.fallback?.suggestions[0] || [])
          setTimeout(() => speak(s.opener!.ko, cfg.locale), 250)
          return
        }
        setAiOff(true)
        setMsgs([{ who: 'bot', ko: t('sp.aiNeeded'), vi: '' }])
        setFinished(true)
      })
      .finally(() => setLoading(false))
  }

  const startTopic = () => {
    const name = topic.trim()
    if (!name) return
    start({
      id: 'topic-' + Date.now(),
      title: name,
      emoji: '✨',
      character: t('sp.topicChar'),
      role: t('sp.topicRole'),
      avatar: '🗣️',
      situation: t('sp.topicSituation', { topic: name }),
      persona: t('sp.topicPersona', { topic: name }),
    })
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
      setMsgs((prev) => [...prev, { who: 'bot', ko: t('sp.fallbackEnd'), vi: '' }])
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
    setShowPhrases(false)
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
        level,
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
      <div className="sp-pickscreen">
        <section className="sp-setup">
          <div className="sp-setup-row">
            <span className="sp-setup-label"><Icon name="chart" size={14} /> {t('sp.levelLabel')}</span>
            <div className="sp-chips">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  className={'sp-chip' + (level === l.id ? ' on' : '')}
                  onClick={() => pickLevel(l.id)}
                >
                  <span className="sp-chip-emoji">{l.emoji}</span> {t(l.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <p className="sp-setup-hint">{t(LEVELS.find((l) => l.id === level)!.descKey)}</p>

          <div className="sp-topicbar">
            <Icon name="sparkles" size={16} />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('sp.topicPlaceholder')}
              aria-label={t('sp.topicPlaceholder')}
              onKeyDown={(e) => { if (e.key === 'Enter') startTopic() }}
            />
            <button className="btn-primary sm" disabled={!topic.trim()} onClick={startTopic}>
              {t('sp.topicGo')}
            </button>
          </div>
        </section>

        {filters.length > 1 && (
          <div className="sp-filters">
            <button className={'sp-filter' + (filter ? '' : ' on')} onClick={() => setFilter('')}>
              {t('sp.filterAll')}
            </button>
            {filters.map((g) => (
              <button
                key={g.id}
                className={'sp-filter' + (filter === g.id ? ' on' : '')}
                onClick={() => setFilter(filter === g.id ? '' : g.id)}
              >
                {g.emoji} {g.label}
              </button>
            ))}
            <span className="sp-count">{t('sp.count', { n: scenarios.length })}</span>
          </div>
        )}

        <div className="sp-grid">
          <button className="sp-card sp-card-random" onClick={() => start(randomScenario(learnLang))}>
            <span className="sp-card-ava">🎲</span>
            <div className="sp-card-body">
              <b>{t('sp.randomTitle')}</b>
              <span className="sp-card-char">{t('sp.randomChar')}</span>
              <span className="sp-card-sit">{t('sp.randomSit')}</span>
            </div>
            <span className="sp-card-go">{t('sp.roll')} <Icon name="arrow-right" size={14} /></span>
          </button>
          {scenarios.map((s) => (
            <button key={s.id} className="sp-card" onClick={() => start(s)}>
              <span className="sp-card-ava">{s.avatar}</span>
              <div className="sp-card-body">
                <b>{s.emoji} {s.title}</b>
                {goal && s.tags?.includes(goal) && <span className="sp-goal-badge">{t('sp.goalBadge')}</span>}
                <span className="sp-card-char">{s.character} · {s.role}</span>
                <span className="sp-card-sit">{s.situation}</span>
              </div>
              <span className="sp-card-go">{t('sp.start')} <Icon name="arrow-right" size={14} /></span>
            </button>
          ))}
        </div>

        <div className="speaking-note">
          <Icon name="bulb" size={16} /> {t('sp.note')}
        </div>
      </div>
    )
  }

  return (
    <div className="sp-chat">
      <div className="sp-head">
        <button className="btn-ghost sm" onClick={() => setScenario(null)}><Icon name="chevron-left" size={15} /> {t('sp.change')}</button>
        <div className="sp-head-who">
          <span className="sp-head-ava">{scenario.avatar}</span>
          <div>
            <b>{scenario.character}</b>
            <span>{scenario.emoji} {scenario.role}</span>
          </div>
        </div>
        <span className="sp-head-level">{t(LEVELS.find((l) => l.id === level)!.labelKey)}</span>
        {scenario.id.startsWith('random-') && (
          <button className="btn-ghost sm sp-reroll" disabled={loading} onClick={() => start(randomScenario(learnLang))}>
            {t('sp.reroll')}
          </button>
        )}
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
                {viShown.has(i) && <div className="sp-trans"><b>{t('sp.transLabel')}</b> {m.vi}</div>}
                <div className="sp-tools">
                  <button onClick={() => speak(m.ko, cfg.locale)}><Icon name="volume" size={13} /> {t('sp.listen')}</button>
                  <button className={viShown.has(i) ? 'on' : ''} onClick={() => toggle(setViShown, i)}><Icon name="globe" size={13} /> {t('sp.trans')}</button>
                  {cfg.reading === 'romaja' && (
                    <button className={romaShown.has(i) ? 'on' : ''} onClick={() => toggle(setRomaShown, i)}><Icon name="letters" size={13} /> {romaShown.has(i) ? t('sp.hideRoma') : t('sp.showRoma')}</button>
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
          <b>{t('sp.doneTitle')}</b>
          <p>{t('sp.doneText', { n: turns.current, name: scenario.character })}</p>
          <div className="sp-done-actions">
            <button className="btn-primary sm" onClick={() => start(scenario)}><Icon name="mic" size={14} /> {t('sp.again')}</button>
            <button className="btn-ghost sm" onClick={() => setScenario(null)}>{t('sp.change')}</button>
          </div>
        </div>
      ) : (
        <>
          {!!scenario.keyPhrases?.length && (
            <div className="sp-phrases">
              <button className="sp-phrases-head" onClick={() => setShowPhrases((v) => !v)}>
                <Icon name="bulb" size={14} /> {t('sp.phrases', { n: scenario.keyPhrases.length })}
                <Icon name="chevron-down" size={14} style={{ transform: showPhrases ? 'none' : 'rotate(-90deg)' }} />
              </button>
              {showPhrases && (
                <div className="sp-phrase-list">
                  {scenario.keyPhrases.map((p, i) => (
                    <div key={i} className="sp-phrase">
                      <button className="sp-phrase-speak" onClick={() => speak(p.ko, cfg.locale)} title={t('sp.hear')}>
                        <Icon name="volume" size={13} />
                      </button>
                      <div>
                        <b lang={learnLang}>{p.ko}</b>
                        <small>{p.vi}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="sp-suggest">
              <button className="sp-suggest-head" onClick={() => setShowSuggest((v) => !v)}>
                {showSuggest ? t('sp.hideSug') : t('sp.showSug')} <Icon name="chevron-down" size={14} style={{ transform: showSuggest ? 'none' : 'rotate(-90deg)' }} />
              </button>
              {showSuggest && (
                <div className="sp-sug-list">
                  {suggestions.map((s, i) => (
                    <div key={i} className="sp-sug-card">
                      <button className="sp-sug-main" onClick={() => send(s.ko)} disabled={loading}>
                        <span lang={learnLang}>{s.ko}</span>
                        <span className="sp-sug-vi"><b>{t('sp.sugVi')}</b> {s.vi}</span>
                      </button>
                      <button className="sp-sug-speak" onClick={() => speak(s.ko, cfg.locale)} title={t('sp.hear')}><Icon name="volume" size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="sp-foot">
            <div className="sp-draft">
              <input
                value={sr.listening ? (sr.interim || t('sp.listening')) : draft}
                onChange={(e) => setDraft(e.target.value)}
                readOnly={sr.listening}
                lang={learnLang}
                placeholder={t('sp.placeholder', { lang: learnLangName })} aria-label={t('sp.placeholder', { lang: learnLangName })}
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
                <div className="sp-mic-hint">{sr.listening ? t('sp.recOn') : t('sp.recOff')}</div>
              </>
            ) : (
              <div className="sp-mic-hint">{t('sp.noRec')}</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
