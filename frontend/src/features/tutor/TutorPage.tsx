import { useCallback, useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { studyLang } from '@/core/constants/languages'
import { speakLang } from '@/core/tts'
import { addCard } from '@/core/api/srs.api'
import {
  askTutor, fetchTutorProfile,
  type QuotaInfo, type TutorPair, type TutorProfile, type TutorTurn,
} from '@/core/api/tutor.api'

interface Msg {
  who: 'bot' | 'me'
  text: string
  examples?: TutorPair[]
  words?: TutorPair[]
  failed?: boolean
}

const STARTERS = [1, 2, 3, 4, 5, 6]
const STARTER_ICONS: IconName[] = ['map', 'letters', 'tool', 'shuffle', 'mic', 'globe']
const SEND_TURNS = 8
const KEEP_MSGS = 40
const MAX_ASK = 1200
const GROW_MAX = 150

const historyKey = (lang: string) => `vyling.${lang}.tutor`
const savedKey = (lang: string) => `vyling.${lang}.tutor.saved`

function readHistory(lang: string): Msg[] {
  try {
    const raw = localStorage.getItem(historyKey(lang))
    return raw ? (JSON.parse(raw) as Msg[]) : []
  } catch {
    return []
  }
}

function readSaved(lang: string): Set<string> {
  try {
    const raw = localStorage.getItem(savedKey(lang))
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export default function TutorPage() {
  const { learnLang, nativeLang, learnLangName, setView, recordEvent, t } = useAppStore()
  const { isAuthed } = useAuth()
  const cfg = studyLang(learnLang)
  const [msgs, setMsgs] = useState<Msg[]>(() => readHistory(learnLang))
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedAsk, setFailedAsk] = useState('')
  const [profile, setProfile] = useState<TutorProfile | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [saved, setSaved] = useState<Set<string>>(() => readSaved(learnLang))
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    setMsgs(readHistory(learnLang))
    setSaved(readSaved(learnLang))
    setSuggestions([])
    setError('')
    setFailedAsk('')
  }, [learnLang])

  useEffect(() => {
    let alive = true
    fetchTutorProfile(learnLang)
      .then((p) => { if (alive) { setProfile(p); setQuota(p.quota ?? null) } })
      .catch(() => {  })
    return () => { alive = false }
  }, [learnLang, isAuthed])

  useEffect(() => {
    try { localStorage.setItem(historyKey(learnLang), JSON.stringify(msgs.slice(-KEEP_MSGS))) } catch {  }
  }, [msgs, learnLang])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, GROW_MAX) + 'px'
  }, [draft])

  const send = useCallback(async (text: string) => {
    const message = text.trim().slice(0, MAX_ASK)
    if (!message || loading) return
    setError('')
    setFailedAsk('')
    setDraft('')
    setSuggestions([])
    const history: TutorTurn[] = msgs
      .filter((m) => !m.failed)
      .slice(-SEND_TURNS)
      .map((m) => ({ role: m.who, text: m.text }))
    setMsgs((prev) => [...prev, { who: 'me', text: message }])
    setLoading(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const r = await askTutor({ message, history, lang: learnLang, native: nativeLang }, ctrl.signal)
      setMsgs((prev) => [...prev, { who: 'bot', text: r.reply, examples: r.examples, words: r.words }])
      setSuggestions(r.suggestions ?? [])
      if (r.quota) setQuota(r.quota)
      recordEvent('tutor', 1)
    } catch (e) {
      const code = (e as { code?: string }).code
      setMsgs((prev) => {
        const copy = [...prev]
        const last = copy[copy.length - 1]
        if (code === 'ABORTED') return copy.slice(0, -1)
        if (last?.who === 'me') copy[copy.length - 1] = { ...last, failed: true }
        return copy
      })
      if (code === 'ABORTED') { setDraft(message); return }
      setFailedAsk(message)
      setError(e instanceof Error ? e.message : t('tt.err'))
    } finally {
      abortRef.current = null
      setLoading(false)
    }
  }, [loading, msgs, learnLang, nativeLang, recordEvent, t])

  const retry = () => {
    const again = failedAsk
    if (!again) return
    setMsgs((prev) => prev.filter((m) => !m.failed))
    setFailedAsk('')
    setError('')
    window.setTimeout(() => send(again), 0)
  }

  const saveWord = async (w: TutorPair) => {
    if (saved.has(w.target)) return
    try {
      await addCard({ front: w.target, back: w.vi, source: t('tt.source') })
      setSaved((prev) => {
        const next = new Set(prev).add(w.target)
        try { localStorage.setItem(savedKey(learnLang), JSON.stringify([...next])) } catch {  }
        return next
      })
    } catch {
      setError(t('tt.errSave'))
    }
  }

  const clearChat = () => {
    abortRef.current?.abort()
    setMsgs([])
    setSuggestions([])
    setError('')
    setFailedAsk('')
    try { localStorage.removeItem(historyKey(learnLang)) } catch {  }
  }

  const empty = msgs.length === 0

  return (
    <div className="tutor-page">
      <div className="lesson-head">
        <h2><Icon name="bulb" /> {t('tt.title', { lang: learnLangName })}</h2>
        <div className="meta">{t('tt.sub')}</div>
      </div>

      {profile?.authed ? (
        <div className="tutor-profile">
          <dl className="srs-record tutor-record">
            <div><dt>{t('tt.known')}</dt><dd>{profile.known}</dd></div>
            <div><dt>{t('tt.due')}</dt><dd>{profile.cards_due ?? 0}</dd></div>
            {!!profile.plan_day && <div><dt>{t('tt.planDay')}</dt><dd>{profile.plan_day}</dd></div>}
            <div><dt>{t('tt.streak')}</dt><dd>{profile.streak ?? 0}</dd></div>
          </dl>
          <div className="tutor-profile-foot">
            <span className="tutor-profile-note">
              <Icon name="check-circle" size={13} /> {t('tt.profileNote')}
            </span>
            {quota && (
              <span className={'tutor-quota' + (quota.left <= 4 ? ' low' : '')} title={t('tt.quotaTitle', { used: quota.used, limit: quota.limit })}>
                {t('tt.quota', { n: Math.floor(quota.left / 2) })}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="speaking-note">
          <Icon name="bulb" size={18} />
          <span>
            {t('tt.guest').split(/\{b\}|\{\/b\}/).map((part, k) => (k === 1 ? <b key={k}>{part}</b> : <span key={k}>{part}</span>))}
          </span>
        </div>
      )}

      <div className="tutor-box">
        {empty && (
          <div className="tutor-empty">
            <div className="tutor-empty-ava"><Icon name="user" size={22} /></div>
            <b>{t('tt.hello')}</b>
            <p>{t('tt.helloSub')}</p>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={'sp-msg ' + m.who + (m.failed ? ' failed' : '')}>
            {m.who === 'bot' && <div className="sp-ava tutor-ava"><Icon name="user" size={17} /></div>}
            <div className="sp-bubble">
              {m.who === 'bot' && <div className="sp-name">{t('tt.name')}</div>}
              <div className={m.who === 'bot' ? 'tutor-reply' : 'sp-ko'}>{m.text}</div>
              {m.failed && <div className="tutor-failtag"><Icon name="x-circle" size={11} /> {t('tt.notSent')}</div>}

              {!!m.examples?.length && (
                <div className="tutor-examples">
                  {m.examples.map((ex, j) => (
                    <div key={j} className="tutor-ex">
                      <div className="tutor-ex-top">
                        <b lang={learnLang}>{ex.target}</b>
                        <button className="pron-play" title={t('sp.hear')} onClick={() => speakLang(ex.target, cfg.locale, 0.92)}>
                          <Icon name="volume" size={14} />
                        </button>
                      </div>
                      <small>{ex.vi}</small>
                    </div>
                  ))}
                </div>
              )}

              {!!m.words?.length && (
                <div className="tutor-words">
                  <div className="tutor-words-head"><Icon name="cards" size={13} /> {t('tt.saveHead')}</div>
                  {m.words.map((w, j) => (
                    <button
                      key={j}
                      className={'tutor-word' + (saved.has(w.target) ? ' on' : '')}
                      onClick={() => saveWord(w)}
                      title={saved.has(w.target) ? t('tt.saved') : t('tt.save')}
                    >
                      <Icon name={saved.has(w.target) ? 'check' : 'plus'} size={12} />
                      <span lang={learnLang}>{w.target}</span>
                      <small>{w.vi}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="sp-msg bot">
            <div className="sp-ava tutor-ava"><Icon name="user" size={17} /></div>
            <div className="sp-bubble"><div className="sp-typing"><span /><span /><span /></div></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <div className="tutor-error">
          <Icon name="x-circle" size={14} /> <span>{error}</span>
          {!!failedAsk && (
            <button className="tutor-retry" onClick={retry}>
              <Icon name="refresh" size={13} /> {t('tt.retry')}
            </button>
          )}
        </div>
      )}

      {empty && (
        <div className="tutor-starters">
          {STARTERS.map((s) => (
            <button
              key={s}
              className="tutor-starter"
              onClick={() => {
                const q = t(`tt.s${s}q`, { lang: learnLangName })
                if (q.endsWith(': ')) { setDraft(q); inputRef.current?.focus() }
                else send(q)
              }}
            >
              <Icon name={STARTER_ICONS[s - 1]} size={14} /> {t(`tt.s${s}`)}
            </button>
          ))}
        </div>
      )}

      {!!suggestions.length && !loading && (
        <div className="tutor-starters">
          {suggestions.map((s) => (
            <button key={s} className="tutor-starter next" onClick={() => send(s)}>
              <Icon name="arrow-right" size={13} /> {s}
            </button>
          ))}
        </div>
      )}

      <div className="tutor-input">
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          maxLength={MAX_ASK}
          placeholder={t('tt.placeholder', { lang: learnLangName })} aria-label={t('tt.placeholder', { lang: learnLangName })}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft) }
          }}
        />
        {loading ? (
          <button className="btn-ghost tutor-stop" onClick={() => abortRef.current?.abort()} aria-label={t('tt.stop')} title={t('tt.stop')}>
            <Icon name="x-circle" size={16} />
          </button>
        ) : (
          <button className="btn-primary" disabled={!draft.trim()} onClick={() => send(draft)} aria-label={t('tt.send')}>
            <Icon name="arrow-right" size={16} />
          </button>
        )}
      </div>

      <div className="tutor-foot">
        <button className="btn-ghost sm" onClick={clearChat} disabled={empty}>
          <Icon name="trash" size={14} /> {t('tt.clear')}
        </button>
        <button className="btn-ghost sm" onClick={() => setView('flashcards')}>
          <Icon name="letters" size={14} /> {t('tt.review')}
        </button>
        <span className="tutor-hint">{draft.length > MAX_ASK - 200 ? t('tt.left', { n: MAX_ASK - draft.length }) : t('tt.hint')}</span>
      </div>
    </div>
  )
}
