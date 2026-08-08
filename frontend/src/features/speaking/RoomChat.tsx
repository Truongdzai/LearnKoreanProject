import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { studyLang } from '@/core/constants/languages'
import { speakLang } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useVoiceClip } from '@/hooks/useVoiceClip'
import CallBar from './CallBar'
import { levelLabelKey } from './levels'
import {
  askRoomPrompt, fetchRoomClip, fetchRoomState, leaveRoom, sayInRoom,
  type RoomMsg, type RoomState,
} from '@/core/api/rooms.api'

const POLL_MS = 2500

interface Props {
  state: RoomState
  onLeave: () => void
}

interface PromptLine { ko: string; vi: string }

function parsePrompt(text: string): PromptLine[] {
  try {
    const data = JSON.parse(text)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default function RoomChat({ state: initial, onLeave }: Props) {
  const { t, nativeLang, recordEvent } = useAppStore()
  const { account } = useAuth()
  const [room, setRoom] = useState(initial.room)
  const [members, setMembers] = useState(initial.members)
  const [msgs, setMsgs] = useState<RoomMsg[]>(initial.messages)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const [playing, setPlaying] = useState<number | null>(null)
  const [pending, setPending] = useState<{ audio: string; at: number } | null>(null)
  const cfg = studyLang(room.lang)
  const sr = useSpeechRecognition(cfg.locale)
  const clip = useVoiceClip()
  const endRef = useRef<HTMLDivElement>(null)
  const lastId = useRef(initial.messages.length ? initial.messages[initial.messages.length - 1].id : 0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const flushed = useRef(0)
  const srRef = useRef(sr)
  srRef.current = sr
  const meId = account?.id || ''

  const apply = useCallback((s: RoomState) => {
    setRoom(s.room)
    setMembers(s.members)
    if (s.messages.length) {
      lastId.current = s.messages[s.messages.length - 1].id
      setMsgs((prev) => {
        const seen = new Set(prev.map((m) => m.id))
        return [...prev, ...s.messages.filter((m) => !seen.has(m.id))]
      })
    }
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  useEffect(() => {
    let alive = true
    const tick = () => {
      fetchRoomState(room.id, lastId.current)
        .then((s) => { if (alive) apply(s) })
        .catch((e) => {
          if (!alive) return
          const code = (e as { code?: string }).code
          if (code === 'ROOM_NOT_FOUND' || code === 'ROOM_OUTSIDE') onLeave()
        })
    }
    const timer = window.setInterval(tick, POLL_MS)
    return () => { alive = false; window.clearInterval(timer) }
  }, [room.id, apply, onLeave])

  useEffect(() => () => { audioRef.current?.pause() }, [])

  const send = useCallback(
    async (text: string, audio = '') => {
      const body = text.trim()
      if (!body && !audio) return
      setBusy(true); setErr(''); setDraft(''); srRef.current.reset()
      try {
        apply(await sayInRoom(room.id, body, audio, lastId.current))
        recordEvent('pronounce', 1)
      } catch (e) {
        setErr((e as Error).message)
      } finally {
        setBusy(false)
      }
    },
    [room.id, apply, recordEvent],
  )

  const talk = () => {
    if (clip.recording) {
      if (sr.listening) sr.stop()
      clip.stop()
      return
    }
    setErr('')
    if (sr.supported) { sr.reset(); sr.start() }
    clip.start((data) => setPending({ audio: data, at: Date.now() }))
  }

  useEffect(() => {
    if (!pending || pending.at === flushed.current) return
    const flush = () => {
      flushed.current = pending.at
      setPending(null)
      const text = (srRef.current.transcript || srRef.current.interim || '').trim()
      if (!pending.audio && !text) { setErr(t('room.clipEmpty')); return }
      send(text, pending.audio)
    }
    if (!sr.listening) { flush(); return }
    const timer = window.setTimeout(flush, 2500)
    return () => window.clearTimeout(timer)
  }, [pending, sr.listening, sr.transcript, send, t])

  const play = async (m: RoomMsg) => {
    if (!m.audio) return
    try {
      setPlaying(m.id)
      const { audio } = await fetchRoomClip(room.id, m.id)
      audioRef.current?.pause()
      const el = new Audio(audio)
      audioRef.current = el
      el.onended = () => setPlaying(null)
      el.onerror = () => setPlaying(null)
      await el.play()
    } catch {
      setPlaying(null)
      setErr(t('room.clipGone'))
    }
  }

  const askAi = async () => {
    if (busy) return
    setBusy(true); setErr('')
    try {
      apply(await askRoomPrompt(room.id, nativeLang, lastId.current))
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const quit = async () => {
    try { await leaveRoom(room.id) } catch { }
    onLeave()
  }

  const inviteLink = room.invite
    ? `${window.location.origin}/luyen-noi?phong=${room.id}&moi=${room.invite}`
    : `${window.location.origin}/luyen-noi?phong=${room.id}`

  const copyInvite = () => {
    navigator.clipboard?.writeText(inviteLink).then(
      () => { setCopied(true); window.setTimeout(() => setCopied(false), 1800) },
      () => setErr(t('room.copyFail')),
    )
  }

  return (
    <div className="room-view">
      <header className="room-top">
        <button className="btn-ghost sm" onClick={quit}><Icon name="chevron-left" size={15} /> {t('room.leave')}</button>
        <div className="room-top-main">
          <b>{room.name}</b>
          <div className="room-top-meta">
            <span className={'room-tag ' + (room.mode === 'private' ? 'private' : 'public')}>
              <Icon name={room.mode === 'private' ? 'lock' : 'globe'} size={11} />
              {t(room.mode === 'private' ? 'room.private' : 'room.public')}
            </span>
            <span className="room-tag">{t(levelLabelKey(room.level))}</span>
            {room.topic && <span className="room-tag">💬 {room.topic}</span>}
            <span className="room-tag">👥 {room.size}/{room.max}</span>
            <span className="room-code">#{room.id}</span>
          </div>
        </div>
        <button className={'btn-ghost sm' + (copied ? ' ok' : '')} onClick={copyInvite}>
          <Icon name="copy" size={14} /> {copied ? t('room.copied') : t('room.copyLink')}
        </button>
      </header>

      <div className="room-people">
        {members.map((m) => (
          <div key={m.id} className={'room-person' + (m.id === meId ? ' me' : '')}>
            <Avatar size={40} frame={m.frame} src={m.avatar} initials={m.name.charAt(0)} />
            <span className="room-person-name">{m.name}</span>
            {m.id === room.hostId && <span className="room-host" title={t('room.host')}>👑</span>}
          </div>
        ))}
        {Array.from({ length: Math.max(0, room.max - members.length) }).map((_, i) => (
          <div key={'e' + i} className="room-person empty"><span className="room-slot">+</span></div>
        ))}
      </div>

      <CallBar roomId={room.id} meId={meId} members={members} />

      <div className="room-box">
        {msgs.length === 0 && <div className="room-empty">{t('room.emptyChat')}</div>}
        {msgs.map((m) => {
          if (m.kind === 'joined' || m.kind === 'left') {
            return (
              <div key={m.id} className="room-sys">
                {t(m.kind === 'joined' ? 'room.sysJoin' : 'room.sysLeft', { name: m.name })}
              </div>
            )
          }
          if (m.kind === 'prompt') {
            const lines = parsePrompt(m.text)
            return (
              <div key={m.id} className="room-prompt">
                <div className="room-prompt-head"><Icon name="sparkles" size={14} /> {t('room.promptTitle')}</div>
                {lines.map((q, i) => (
                  <div key={i} className="room-prompt-q">
                    <button onClick={() => speakLang(q.ko, cfg.locale)} title={t('sp.hear')}>
                      <Icon name="volume" size={13} />
                    </button>
                    <div>
                      <b lang={room.lang}>{q.ko}</b>
                      <small>{q.vi}</small>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
          const mine = m.userId === meId
          return (
            <div key={m.id} className={'room-msg' + (mine ? ' me' : '')}>
              {!mine && <Avatar size={32} src={m.avatar} initials={m.name.charAt(0)} />}
              <div className="room-bubble">
                {!mine && <div className="room-msg-name">{m.name}</div>}
                {m.audio && (
                  <button
                    className={'room-play' + (playing === m.id ? ' on' : '')}
                    onClick={() => play(m)}
                  >
                    <Icon name={playing === m.id ? 'pause' : 'volume'} size={14} />
                    {playing === m.id ? t('room.playing') : t('room.playVoice')}
                  </button>
                )}
                {m.text && <div className="room-text" lang={room.lang}>{m.text}</div>}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {err && <div className="sp-err"><Icon name="x-circle" size={14} /> {err}</div>}

      <div className="room-foot">
        <button className="room-ai" onClick={askAi} disabled={busy}>
          <Icon name="sparkles" size={15} /> {t('room.askAi')}
        </button>
        <div className="room-compose">
          <input
            value={sr.listening ? (sr.interim || t('sp.listening')) : draft}
            onChange={(e) => setDraft(e.target.value)}
            readOnly={sr.listening}
            lang={room.lang}
            placeholder={t('room.placeholder')}
            aria-label={t('room.placeholder')}
            onKeyDown={(e) => { if (e.key === 'Enter') send(draft) }}
          />
          <button className="sp-send" disabled={!draft.trim() || busy} onClick={() => send(draft)}>
            <Icon name="send" size={18} />
          </button>
        </div>
        {clip.supported ? (
          <>
            <button className={'sp-mic' + (clip.recording ? ' on' : '')} onClick={talk} disabled={busy}>
              <Icon name="mic" size={26} />
            </button>
            <div className="sp-mic-hint">
              {clip.recording
                ? t('room.recOn', { s: clip.seconds, max: clip.maxSeconds })
                : t('room.recOff')}
            </div>
          </>
        ) : (
          <div className="sp-mic-hint">{t('room.noRec')}</div>
        )}
      </div>
    </div>
  )
}
