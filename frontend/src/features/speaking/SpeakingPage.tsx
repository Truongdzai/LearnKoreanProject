import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import AiSpeaking from './AiSpeaking'
import RoomChat from './RoomChat'
import RoomsColumn from './RoomsColumn'
import { LEVELS, MAX_TOPICS, loadLevel, saveLevel, topicsFor, type SpeakLevel } from './levels'
import { cancelMatch, pollMatch, startMatch, type RoomState } from '@/core/api/rooms.api'

type Mode = 'ai' | 'human'

const POLL_MS = 3000
const WIDE_HINT_AFTER = 30

function readInvite() {
  const q = new URLSearchParams(window.location.search)
  return { room: (q.get('phong') || '').toUpperCase(), invite: q.get('moi') || '' }
}

export default function SpeakingPage() {
  const { t, learnLang, learnLangName } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  const [link] = useState(readInvite)

  const [mode, setMode] = useState<Mode>('ai')
  const [level, setLevel] = useState<SpeakLevel>(loadLevel)
  const [picked, setPicked] = useState<string[]>([])
  const [aiTopic, setAiTopic] = useState('')

  const [ai, setAi] = useState<{ topic: string } | null>(null)
  const [inside, setInside] = useState<RoomState | null>(null)

  const [wide, setWide] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [pool, setPool] = useState(0)
  const [secs, setSecs] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const queued = useRef(false)

  const chips = topicsFor(learnLang)
  const topicText = picked.map((id) => t('sp.tp.' + id)).join(', ')

  const clearLink = useCallback(() => {
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname)
  }, [])

  useEffect(() => { if (link.room) setMode('human') }, [link.room])

  useEffect(() => {
    setPicked((list) => list.filter((id) => chips.some((c) => c.id === id)))
  }, [learnLang])

  const stop = () => { queued.current = false; setWaiting(false); setSecs(0) }

  const enterRoom = useCallback((s: RoomState) => { stop(); setInside(s); setErr('') }, [])

  const apply = (r: { matched: boolean; pool: number; state: RoomState | null }) => {
    if (r.matched && r.state) { enterRoom(r.state); return true }
    setPool(r.pool)
    return false
  }

  const enqueue = async (nextWide = wide) => {
    if (!isAuthed) { openAuth(); return }
    setBusy(true); setErr('')
    try {
      const r = await startMatch({ lang: learnLang, level, topics: picked, wide: nextWide })
      if (!apply(r)) { queued.current = true; setWaiting(true) }
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const quit = async () => {
    stop()
    try { await cancelMatch() } catch { }
  }

  useEffect(() => {
    if (!waiting) return
    const tick = window.setInterval(() => setSecs((s) => s + 1), 1000)
    const timer = window.setInterval(() => {
      pollMatch()
        .then((r) => {
          if (apply(r)) return
          if (r.queued === false) stop()
        })
        .catch(() => { })
    }, POLL_MS)
    return () => { window.clearInterval(tick); window.clearInterval(timer) }
  }, [waiting])

  useEffect(() => () => { if (queued.current) cancelMatch().catch(() => { }) }, [])

  const toggleTopic = (id: string) => {
    setPicked((list) => (
      list.includes(id)
        ? list.filter((x) => x !== id)
        : list.length >= MAX_TOPICS ? list : [...list, id]
    ))
  }

  const pickLevel = (id: SpeakLevel) => { setLevel(id); saveLevel(id) }

  const setWider = (on: boolean) => {
    setWide(on)
    if (waiting) enqueue(on)
  }

  const startAi = () => setAi({ topic: aiTopic.trim() || topicText })

  if (inside) return <RoomChat state={inside} onLeave={() => { setInside(null); setErr('') }} />

  if (ai) {
    return <AiSpeaking level={level} startTopic={ai.topic} onExit={() => setAi(null)} />
  }

  const levelDesc = LEVELS.find((l) => l.id === level)!.descKey

  return (
    <div className="speaking">
      <header className="sp-top">
        <h1 className="page-title"><Icon name="mic" /> {t('sp.title')}</h1>
        <p className="page-sub">{t('sp.lobbySub', { lang: learnLangName })}</p>
      </header>

      <div className="sp-lobby">
        <div className="sp-col">
          <section className="sp-panel">
            <div className="sp-modepick" role="tablist">
              <button
                role="tab"
                aria-selected={mode === 'ai'}
                className={'sp-modebtn' + (mode === 'ai' ? ' on' : '')}
                onClick={() => setMode('ai')}
              >
                <span className="sp-modebtn-emoji">🤖</span>
                <span><b>{t('sp.modeAi')}</b><small>{t('sp.modeAiDesc')}</small></span>
              </button>
              <button
                role="tab"
                aria-selected={mode === 'human'}
                className={'sp-modebtn' + (mode === 'human' ? ' on' : '')}
                onClick={() => setMode('human')}
              >
                <span className="sp-modebtn-emoji">🎧</span>
                <span><b>{t('sp.modeHuman')}</b><small>{t('sp.modeHumanDesc')}</small></span>
              </button>
            </div>

            <div className="sp-field">
              <span className="sp-fieldh">{t('sp.levelHead')}</span>
              <div className="sp-levels">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    className={'sp-level' + (level === l.id ? ' on' : '')}
                    onClick={() => pickLevel(l.id)}
                    title={t(l.labelKey)}
                  >
                    {l.code}
                  </button>
                ))}
              </div>
              <p className="sp-leveldesc">{t(levelDesc)}</p>
            </div>

            <div className="sp-field">
              <span className="sp-fieldh">
                {t('sp.topicHead')} <i>{t('sp.topicOptional')}</i>
              </span>
              <div className="sp-topics">
                {chips.map((tp) => (
                  <button
                    key={tp.id}
                    className={'sp-topic' + (picked.includes(tp.id) ? ' on' : '')}
                    onClick={() => toggleTopic(tp.id)}
                  >
                    {t('sp.tp.' + tp.id)}
                  </button>
                ))}
              </div>
              <small className="sp-topiccount">{t('sp.topicCount', { n: picked.length, max: MAX_TOPICS })}</small>
            </div>

            {mode === 'ai' ? (
              <>
                <label className="sp-field">
                  <span className="sp-fieldh">{t('sp.aiTopicHead')}</span>
                  <div className="sp-aitopic">
                    <Icon name="sparkles" size={16} />
                    <input
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder={t('sp.topicPlaceholder')}
                      aria-label={t('sp.aiTopicHead')}
                      maxLength={80}
                      onKeyDown={(e) => { if (e.key === 'Enter') startAi() }}
                    />
                  </div>
                  <small>{t('sp.aiTopicHint')}</small>
                </label>

                <button className="sp-cta" onClick={startAi}>
                  <Icon name="mic" size={18} /> {t('sp.startAi')}
                </button>
                <button className="sp-linkbtn" onClick={() => setAi({ topic: '' })}>
                  <Icon name="letters" size={14} /> {t('sp.browseScenarios')}
                </button>
              </>
            ) : waiting ? (
              <div className="sp-wait">
                <div className="sp-wait-top">
                  <Spinner />
                  <div>
                    <b>{t('match.searching')}</b>
                    <small>{t('match.waitInfo', { secs, n: pool })}</small>
                  </div>
                </div>
                {!wide && secs >= WIDE_HINT_AFTER && <p className="sp-hint">{t('match.slowHint')}</p>}
                <label className="sp-wide">
                  <input type="checkbox" checked={wide} onChange={(e) => setWider(e.target.checked)} />
                  {t('match.wide')}
                </label>
                <button className="btn-ghost sm" onClick={quit}>
                  <Icon name="x-circle" size={14} /> {t('match.cancel')}
                </button>
              </div>
            ) : (
              <>
                <label className="sp-wide">
                  <input type="checkbox" checked={wide} onChange={(e) => setWider(e.target.checked)} />
                  {t('match.wide')}
                </label>
                <button className="sp-cta" disabled={busy} onClick={() => enqueue()}>
                  <Icon name="mic" size={18} /> {t('match.start')}
                </button>
                <p className="sp-ctanote">{t('match.note')}</p>
              </>
            )}

            {err && <div className="sp-err"><Icon name="x-circle" size={14} /> {err}</div>}
          </section>
        </div>

        <RoomsColumn
          level={level}
          topicText={topicText}
          onEnter={enterRoom}
          initialRoom={link.room}
          initialInvite={link.invite}
          onConsumeInvite={clearLink}
        />
      </div>

      <div className="speaking-note">
        <Icon name="bulb" size={16} /> {t('room.note')}
      </div>
    </div>
  )
}
