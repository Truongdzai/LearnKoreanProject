import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { useAppStore } from '@/store/app.store'
import { LEVELS, MATCH_TOPICS, MAX_MATCH_TOPICS, loadLevel, saveLevel, type SpeakLevel } from './levels'
import { cancelMatch, pollMatch, startMatch, type RoomState } from '@/core/api/rooms.api'

const POLL_MS = 3000
const WIDE_HINT_AFTER = 30

export default function MatchPanel({ onMatched }: { onMatched: (s: RoomState) => void }) {
  const { t, learnLang, learnLangName } = useAppStore()
  const [level, setLevel] = useState<SpeakLevel>(loadLevel)
  const [topics, setTopics] = useState<string[]>([])
  const [wide, setWide] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [pool, setPool] = useState(0)
  const [secs, setSecs] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const queued = useRef(false)

  const stop = () => { queued.current = false; setWaiting(false); setSecs(0) }

  const apply = (r: { matched: boolean; pool: number; state: RoomState | null }) => {
    if (r.matched && r.state) { stop(); onMatched(r.state); return true }
    setPool(r.pool)
    return false
  }

  const enqueue = async (nextWide = wide) => {
    setBusy(true); setErr('')
    try {
      const r = await startMatch({ lang: learnLang, level, topics, wide: nextWide })
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
    setTopics((list) => (
      list.includes(id)
        ? list.filter((x) => x !== id)
        : list.length >= MAX_MATCH_TOPICS ? list : [...list, id]
    ))
  }

  const pickLevel = (id: SpeakLevel) => { setLevel(id); saveLevel(id) }

  const setWider = (on: boolean) => {
    setWide(on)
    if (waiting) enqueue(on)
  }

  return (
    <div className={'match' + (waiting ? ' on' : '')}>
      <div className="match-head">
        <span className="match-emoji">🤝</span>
        <div>
          <b>{t('match.title')}</b>
          <small>{t('match.sub', { lang: learnLangName })}</small>
        </div>
      </div>

      {waiting ? (
        <div className="match-wait">
          <div className="match-wait-top">
            <Spinner />
            <div>
              <b>{t('match.searching')}</b>
              <small>{t('match.waitInfo', { secs, n: pool })}</small>
            </div>
          </div>
          {!wide && secs >= WIDE_HINT_AFTER && <p className="match-hint">{t('match.slowHint')}</p>}
          <label className="match-wide">
            <input type="checkbox" checked={wide} onChange={(e) => setWider(e.target.checked)} />
            {t('match.wide')}
          </label>
          <button className="btn-ghost sm" onClick={quit}><Icon name="x-circle" size={14} /> {t('match.cancel')}</button>
        </div>
      ) : (
        <>
          <div className="match-field">
            <span>{t('match.levelHead')}</span>
            <div className="sp-chips">
              {LEVELS.map((l) => (
                <button key={l.id} className={'sp-chip' + (level === l.id ? ' on' : '')} onClick={() => pickLevel(l.id)}>
                  <span className="sp-chip-emoji">{l.emoji}</span> {t(l.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="match-field">
            <span>{t('match.topicHead', { max: MAX_MATCH_TOPICS })}</span>
            <div className="sp-chips">
              {MATCH_TOPICS.map((tp) => (
                <button
                  key={tp.id}
                  className={'sp-chip' + (topics.includes(tp.id) ? ' on' : '')}
                  onClick={() => toggleTopic(tp.id)}
                >
                  <span className="sp-chip-emoji">{tp.emoji}</span> {t('match.tp_' + tp.id)}
                </button>
              ))}
            </div>
          </div>

          <label className="match-wide">
            <input type="checkbox" checked={wide} onChange={(e) => setWider(e.target.checked)} />
            {t('match.wide')}
          </label>

          <div className="match-actions">
            <button className="btn-primary" disabled={busy} onClick={() => enqueue()}>
              <Icon name="mic" size={16} /> {t('match.start')}
            </button>
            <span className="match-note">{t('match.note')}</span>
          </div>
        </>
      )}

      {err && <div className="sp-err"><Icon name="x-circle" size={14} /> {err}</div>}
    </div>
  )
}
