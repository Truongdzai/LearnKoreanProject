import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { studyLangName } from '@/core/i18n/translations'
import { levelCode, type SpeakLevel } from './levels'
import {
  createRoom, fetchRoomState, fetchRooms, joinRoom, peekRoom,
  type RoomCard, type RoomMode, type RoomState,
} from '@/core/api/rooms.api'

const LOBBY_MS = 8000
const SIZES = [2, 3, 4, 5]

interface Props {
  level: SpeakLevel
  topicText: string
  onEnter: (s: RoomState) => void
  initialRoom?: string
  initialInvite?: string
  onConsumeInvite?: () => void
}

export default function RoomsColumn({
  level, topicText, onEnter, initialRoom, initialInvite, onConsumeInvite,
}: Props) {
  const { t, learnLang, uiLang } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  const [rooms, setRooms] = useState<RoomCard[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [askPass, setAskPass] = useState<RoomCard | null>(null)
  const [pass, setPass] = useState('')
  const [code, setCode] = useState('')
  const [onlyMyLang, setOnlyMyLang] = useState(true)

  const [name, setName] = useState('')
  const [size, setSize] = useState(5)
  const [mode, setMode] = useState<RoomMode>('public')
  const [password, setPassword] = useState('')

  const load = useCallback(() => {
    fetchRooms(onlyMyLang ? learnLang : '')
      .then((d) => {
        setRooms(d.rooms)
        if (d.mine) return fetchRoomState(d.mine).then(onEnter).catch(() => { })
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [learnLang, onlyMyLang, onEnter])

  useEffect(() => {
    if (!isAuthed) { setLoading(false); return }
    load()
    const timer = window.setInterval(load, LOBBY_MS)
    return () => window.clearInterval(timer)
  }, [isAuthed, load])

  useEffect(() => {
    if (!isAuthed || !initialRoom) return
    peekRoom(initialRoom)
      .then((card) => {
        if (card.member) return fetchRoomState(card.id).then(onEnter)
        if (initialInvite || !card.needPass) {
          return joinRoom(card.id, '', initialInvite || '').then(onEnter)
        }
        setAskPass(card)
      })
      .catch((e) => setErr((e as Error).message))
      .finally(() => onConsumeInvite?.())
  }, [isAuthed, initialRoom])

  const go = async (card: RoomCard, secret = '') => {
    setBusy(true); setErr('')
    try {
      onEnter(await joinRoom(card.id, secret, card.id === initialRoom ? initialInvite || '' : ''))
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
      if (card.member) { onEnter(await fetchRoomState(card.id)); setCode(''); return }
      if (card.needPass) { setAskPass(card); return }
      onEnter(await joinRoom(card.id))
      setCode('')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const create = async () => {
    if (!name.trim()) { setErr(t('room.needName')); return }
    setBusy(true); setErr('')
    try {
      onEnter(await createRoom({
        name,
        topic: topicText,
        lang: learnLang,
        level,
        mode,
        max: size,
        password: mode === 'private' ? password : '',
      }))
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthed) {
    return (
      <div className="sp-col">
        <div className="sp-panel room-gate">
          <span className="room-gate-emoji">🎧</span>
          <b>{t('room.gateTitle')}</b>
          <p>{t('room.gateText')}</p>
          <button className="btn-primary" onClick={openAuth}>{t('top.login')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="sp-col">
      <section className="sp-panel">
        <h2 className="sp-panel-h"><Icon name="user" size={17} /> {t('room.createHead')}</h2>

        <label className="sp-field">
          <span>{t('room.fName')} <i className="sp-req">*</i></span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('room.fNamePh')}
            maxLength={42}
          />
        </label>

        <div className="sp-field">
          <span>{t('room.fMax')}</span>
          <div className="sp-sizes">
            {SIZES.map((n) => (
              <button key={n} className={'sp-size' + (size === n ? ' on' : '')} onClick={() => setSize(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="sp-modes2">
          <button className={'sp-mode2' + (mode === 'public' ? ' on' : '')} onClick={() => setMode('public')}>
            <Icon name="globe" size={15} /> {t('room.public')}
          </button>
          <button className={'sp-mode2' + (mode === 'private' ? ' on' : '')} onClick={() => setMode('private')}>
            <Icon name="lock" size={15} /> {t('room.private')}
          </button>
        </div>

        {mode === 'private' && (
          <label className="sp-field">
            <span>{t('room.fPass')}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('room.fPassPh')}
              maxLength={40}
            />
            <small>{t('room.fPassHint')}</small>
          </label>
        )}

        {topicText && <p className="sp-topichint"><Icon name="bulb" size={13} /> {t('room.topicFromChips', { list: topicText })}</p>}

        <button className="sp-cta green" disabled={busy || !name.trim()} onClick={create}>
          {t('room.createGo')}
        </button>
      </section>

      <section className="sp-panel">
        <div className="sp-panel-top">
          <h2 className="sp-panel-h"><Icon name="user" size={17} /> {t('room.listHead')}</h2>
          <button className="sp-refresh" onClick={load}>
            <Icon name="refresh" size={15} /> {t('room.refresh')}
          </button>
        </div>

        <div className="sp-roomtools">
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
          <label className="sp-onlylang">
            <input type="checkbox" checked={onlyMyLang} onChange={(e) => setOnlyMyLang(e.target.checked)} />
            {t('room.onlyLang', { lang: studyLangName(uiLang, learnLang) })}
          </label>
        </div>

        {askPass && (
          <div className="sp-passask">
            <b><Icon name="lock" size={15} /> {t('room.passTitle', { name: askPass.name })}</b>
            <div className="sp-passrow">
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
          <ul className="sp-roomlist">
            {rooms.map((r) => {
              const full = r.size >= r.max
              return (
                <li key={r.id} className={'sp-roomrow' + (full ? ' full' : '')}>
                  <div className="sp-roomtop">
                    <Icon name={r.mode === 'private' ? 'lock' : 'globe'} size={14} />
                    <b>{r.name}</b>
                    <span className="sp-roomsize">{r.size}/{r.max}</span>
                    <span className="sp-roomlv">{levelCode(r.level)}</span>
                  </div>
                  {r.topic && <p className="sp-roomtopic">{r.topic}</p>}
                  <div className="sp-roomfoot">
                    <span className="sp-roomhost">👑 {r.hostName}</span>
                    <button className="btn-primary sm" disabled={busy || full} onClick={() => go(r)}>
                      {full ? t('room.full') : t('room.join')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
