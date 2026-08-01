import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
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
}

const STARTERS = [1, 2, 3, 4, 5, 6]
const STARTER_ICONS = ['🧭', '✍️', '📐', '🔀', '🗣️', '🏯']

const historyKey = (lang: string) => `vyling.${lang}.tutor`

function readHistory(lang: string): Msg[] {
  try {
    const raw = localStorage.getItem(historyKey(lang))
    return raw ? (JSON.parse(raw) as Msg[]) : []
  } catch {
    return []
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
  const [profile, setProfile] = useState<TutorProfile | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMsgs(readHistory(learnLang))
    setSuggestions([])
  }, [learnLang])

  useEffect(() => {
    let alive = true
    fetchTutorProfile(learnLang)
      .then((p) => { if (alive) { setProfile(p); setQuota(p.quota ?? null) } })
      .catch(() => {  })
    return () => { alive = false }
  }, [learnLang, isAuthed])

  useEffect(() => {
    try { localStorage.setItem(historyKey(learnLang), JSON.stringify(msgs.slice(-40))) } catch {  }
  }, [msgs, learnLang])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  const send = useCallback(async (text: string) => {
    const message = text.trim()
    if (!message || loading) return
    setError('')
    setDraft('')
    setSuggestions([])
    const history: TutorTurn[] = msgs.map((m) => ({ role: m.who, text: m.text }))
    setMsgs((prev) => [...prev, { who: 'me', text: message }])
    setLoading(true)
    try {
      const r = await askTutor({ message, history, lang: learnLang, native: nativeLang })
      setMsgs((prev) => [...prev, { who: 'bot', text: r.reply, examples: r.examples, words: r.words }])
      setSuggestions(r.suggestions ?? [])
      if (r.quota) setQuota(r.quota)
      recordEvent('lesson', 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tt.err'))
    } finally {
      setLoading(false)
    }
  }, [loading, msgs, learnLang, nativeLang, recordEvent])

  const saveWord = async (w: TutorPair) => {
    if (saved.has(w.target)) return
    try {
      await addCard({ front: w.target, back: w.vi, source: t('tt.source') })
      setSaved((prev) => new Set(prev).add(w.target))
    } catch {
      setError(t('tt.errSave'))
    }
  }

  const clearChat = () => {
    setMsgs([])
    setSuggestions([])
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
          <div><b>{profile.known}</b><span>{t('tt.known')}</span></div>
          <div><b>{profile.cards_due ?? 0}</b><span>{t('tt.due')}</span></div>
          {!!profile.plan_day && <div><b>{profile.plan_day}</b><span>{t('tt.planDay')}</span></div>}
          <div><b>{profile.streak ?? 0}</b><span>{t('tt.streak')}</span></div>
          <span className="tutor-profile-note">
            <Icon name="check-circle" size={13} /> {t('tt.profileNote')}
          </span>
          {quota && (
            <span className={'tutor-quota' + (quota.left <= 4 ? ' low' : '')} title={t('tt.quotaTitle', { used: quota.used, limit: quota.limit })}>
              {t('tt.quota', { n: Math.floor(quota.left / 2) })}
            </span>
          )}
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
            <div className="tutor-empty-ava">🧑‍🏫</div>
            <b>{t('tt.hello')}</b>
            <p>{t('tt.helloSub')}</p>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={'sp-msg ' + m.who}>
            {m.who === 'bot' && <div className="sp-ava">🧑‍🏫</div>}
            <div className="sp-bubble">
              {m.who === 'bot' && <div className="sp-name">{t('tt.name')}</div>}
              <div className={m.who === 'bot' ? 'tutor-reply' : 'sp-ko'}>{m.text}</div>

              {!!m.examples?.length && (
                <div className="tutor-examples">
                  {m.examples.map((ex, j) => (
                    <div key={j} className="tutor-ex">
                      <div className="tutor-ex-top">
                        <b lang={learnLang}>{ex.target}</b>
                        <button className="pron-play" title="Nghe" onClick={() => speakLang(ex.target, cfg.locale, 0.92)}>
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
            <div className="sp-ava">🧑‍🏫</div>
            <div className="sp-bubble"><div className="sp-typing"><span /><span /><span /></div></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <div className="tutor-error"><Icon name="x-circle" size={14} /> {error}</div>}

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
              <span>{STARTER_ICONS[s - 1]}</span> {t(`tt.s${s}`)}
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
          placeholder={t('tt.placeholder', { lang: learnLangName })} aria-label={t('tt.placeholder', { lang: learnLangName })}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft) }
          }}
        />
        <button className="btn-primary" disabled={!draft.trim() || loading} onClick={() => send(draft)} aria-label={t('tt.send')}>
          <Icon name="arrow-right" size={16} />
        </button>
      </div>

      <div className="tutor-foot">
        <button className="btn-ghost sm" onClick={clearChat} disabled={empty}>
          <Icon name="trash" size={14} /> {t('tt.clear')}
        </button>
        <button className="btn-ghost sm" onClick={() => setView('flashcards')}>
          <Icon name="letters" size={14} /> {t('tt.review')}
        </button>
        <span className="tutor-hint">{t('tt.hint')}</span>
      </div>
    </div>
  )
}
