import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { studyLangName } from '@/core/i18n/translations'
import { LEVELS, loadLevel, levelLabelKey, type SpeakLevel } from './levels'
import MatchPanel from './MatchPanel'
import RoomChat from './RoomChat'
import {
  createRoom, fetchRoomState, fetchRooms, joinRoom, peekRoom,
  type RoomCard, type RoomMode, type RoomState,
} from '@/core/api/rooms.api'

const LOBBY_MS = 8000

interface Props {
  initialRoom?: string
  initialInvite?: string
  onConsumeInvite?: () => void
}

export default function RoomsPanel({ initialRoom, initialInvite, onConsumeInvite }: Props) {
  const { t, learnLang, uiLang } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  const [rooms, setRooms] = useState<RoomCard[]>([])
  const [loading, setLoading] = useState(true)
  const [inside, setInside] = useState<RoomState | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [askPass, setAskPass] = useState<RoomCard | null>(null)
  const [pass, setPass] = useState('')
  const [code, setCode] = useState('')
  const [onlyMyLang, setOnlyMyLang] = useState(true)

  const [form, setForm] = useState({
    name: '',
    topic: '',
    level: loadLevel() as SpeakLevel,
    mode: 'public' as RoomMode,
    password: '',
  })

  const enter = useCallback((s: RoomState) => { setInside(s); setErr('') }, [])
  const exit = useCallback(() => { setInside(null); setLoading(true) }, [])

  const load = useCallback(() => {
    fetchRooms(onlyMyLang ? learnLang : '')
      .then((d) => {
        setRooms(d.rooms)
        if (d.mine) return fetchRoomState(d.mine).then(enter).catch(() => { })
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [learnLang, onlyMyLang, enter])

  useEffect(() => {
    if (!isAuthed || inside) return
    load()
    const timer = window.setInterval(load, LOBBY_MS)
    return () => window.clearInterval(timer)
  }, [isAuthed, inside, load])

  useEffect(() => {
    if (!isAuthed || !initialRoom || inside) return
    peekRoom(initialRoom)
      .then((card) => {
        if (card.member) return fetchRoomState(card.id).then(enter)
        if (initialInvite || !card.needPass) {
          return joinRoom(card.id, '', initialInvite || '').then(enter)
        }
        setAskPass(card)
      })
      .catch((e) => setErr((e as Error).message))
      .finally(() => onConsumeInvite?.())
  }, [isAuthed, initialRoom])

  const go = async (card: RoomCard, password = '') => {
    setBusy(true); setErr('')
    try {
      enter(await joinRoom(card.id, password, card.id === initialRoom ? initialInvite || '' : ''))
      setAskPass(null); setPass('')
    } catch (e) {
      setErr((e as Error).message)
      if ((e as { code?: string }).code === 'ROOM_PASSWORD') setAskPass(card)
    } finally {
      setBusy(false)
    }
  }

  const joinByCode = async () => {
    const id = code.trim().toUpperCase()
    if (!id) return
    setBusy(true); setErr('')
    try {
      const card = await peekRoom(id)
      if (card.member) { enter(await fetchRoomState(card.id)); setCode(''); return }
      if (card.needPass) { setAskPass(card); return }
      enter(await joinRoom(card.id))
      setCode('')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const submitForm = async () => {
    if (!form.name.trim()) { setErr(t('room.needName')); return }
    setBusy(true); setErr('')
    try {
      enter(await createRoom({
        name: form.name,
        topic: form.topic,
        lang: learnLang,
        level: form.level,
        mode: form.mode,
        password: form.mode === 'private' ? form.password : '',
      }))
      setShowForm(false)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthed) {
    return (
      <div className="room-gate">
        <span className="room-gate-emoji">🎧</span>
        <b>{t('room.gateTitle')}</b>
        <p>{t('room.gateText')}</p>
        <button className="btn-primary" onClick={openAuth}>{t('top.login')}</button>
      </div>
    )
  }

  if (inside) return <RoomChat state={inside} onLeave={exit} />

  return (
    <div className="rooms">
      <MatchPanel onMatched={enter} />

      <div className="rooms-bar">
        <button className="btn-primary sm" onClick={() => setShowForm((v) => !v)}>
          <Icon name="plus" size={15} /> {t('room.create')}
        </button>
        <div className="rooms-join">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('room.codePlaceholder')}
            aria-label={t('room.codePlaceholder')}
            maxLength={6}
            onKeyDown={(e) => { if (e.key === 'Enter') joinByCode() }}
          />
          <button className="btn-ghost sm" disabled={!code.trim() || busy} onClick={joinByCode}>
            {t('room.joinCode')}
          </button>
        </div>
        <label className="rooms-lang">
          <input type="checkbox" checked={onlyMyLang} onChange={(e) => setOnlyMyLang(e.target.checked)} />
          {t('room.onlyLang', { lang: studyLangName(uiLang, learnLang) })}
        </label>
      </div>

      {showForm && (
        <div className="room-form">
          <div className="room-form-row">
            <label>
              <span>{t('room.fName')}</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('room.fNamePh')}
                maxLength={42}
              />
            </label>
            <label>
              <span>{t('room.fTopic')}</span>
              <input
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder={t('room.fTopicPh')}
                maxLength={80}
              />
            </label>
          </div>

          <div className="room-form-row">
            <div className="room-form-field">
              <span>{t('sp.levelLabel')}</span>
              <div className="sp-chips">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    className={'sp-chip' + (form.level === l.id ? ' on' : '')}
                    onClick={() => setForm({ ...form, level: l.id })}
                  >
                    <span className="sp-chip-emoji">{l.emoji}</span> {t(l.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <div className="room-form-field">
              <span>{t('room.fMode')}</span>
              <div className="sp-chips">
                <button
                  className={'sp-chip' + (form.mode === 'public' ? ' on' : '')}
                  onClick={() => setForm({ ...form, mode: 'public' })}
                >
                  <Icon name="globe" size={13} /> {t('room.public')}
                </button>
                <button
                  className={'sp-chip' + (form.mode === 'private' ? ' on' : '')}
                  onClick={() => setForm({ ...form, mode: 'private' })}
                >
                  <Icon name="lock" size={13} /> {t('room.private')}
                </button>
              </div>
            </div>
          </div>

          {form.mode === 'private' && (
            <label className="room-form-pass">
              <span>{t('room.fPass')}</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t('room.fPassPh')}
                maxLength={40}
              />
              <small>{t('room.fPassHint')}</small>
            </label>
          )}

          <div className="room-form-actions">
            <button className="btn-primary sm" disabled={busy} onClick={submitForm}>
              <Icon name="party" size={15} /> {t('room.createGo')}
            </button>
            <button className="btn-ghost sm" onClick={() => setShowForm(false)}>{t('room.cancel')}</button>
          </div>
        </div>
      )}

      {askPass && (
        <div className="room-form room-pass-ask">
          <b><Icon name="lock" size={15} /> {t('room.passTitle', { name: askPass.name })}</b>
          <div className="room-pass-row">
            <input
              type="password"
              value={pass}
              autoFocus
              onChange={(e) => setPass(e.target.value)}
              placeholder={t('room.passPh')}
              onKeyDown={(e) => { if (e.key === 'Enter') go(askPass, pass) }}
            />
            <button className="btn-primary sm" disabled={busy} onClick={() => go(askPass, pass)}>
              {t('room.enter')}
            </button>
            <button className="btn-ghost sm" onClick={() => { setAskPass(null); setPass(''); setErr('') }}>
              {t('room.cancel')}
            </button>
          </div>
        </div>
      )}

      {err && <div className="sp-err"><Icon name="x-circle" size={14} /> {err}</div>}

      {loading ? (
        <div className="rooms-loading"><Spinner /> {t('room.loading')}</div>
      ) : rooms.length === 0 ? (
        <div className="rooms-none">
          <span>🫧</span>
          <b>{t('room.noneTitle')}</b>
          <p>{t('room.noneText')}</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((r) => (
            <div key={r.id} className="room-card">
              <div className="room-card-top">
                <b>{r.name}</b>
                <span className="room-card-size">👥 {r.size}/{r.max}</span>
              </div>
              {r.topic && <p className="room-card-topic">💬 {r.topic}</p>}
              <div className="room-card-tags">
                <span className="room-tag">{studyLangName(uiLang, r.lang)}</span>
                <span className="room-tag">{t(levelLabelKey(r.level))}</span>
                <span className="room-tag public"><Icon name="globe" size={11} /> {t('room.public')}</span>
              </div>
              <div className="room-card-foot">
                <span className="room-card-host">👑 {r.hostName}</span>
                <button className="btn-primary sm" disabled={busy} onClick={() => go(r)}>
                  {t('room.join')} <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="speaking-note">
        <Icon name="bulb" size={16} /> {t('room.note')}
      </div>
    </div>
  )
}
