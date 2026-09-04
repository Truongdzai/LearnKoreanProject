import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { studyLang } from '@/core/constants/languages'
import { speakLang } from '@/core/tts'
import { useAsr } from '@/hooks/useAsr'
import { useVoiceClip } from '@/hooks/useVoiceClip'
import { useVoiceCall } from '@/hooks/useVoiceCall'
import RoomPeople from './RoomPeople'
import { levelCode } from './levels'
import {
  askRoomPrompt, fetchRoomClip, fetchRoomState, joinRoom, leaveRoom, leaveRoomBeacon, sayInRoom,
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
  const [topicOpen, setTopicOpen] = useState(true)
  const cfg = studyLang(room.lang)
  const sr = useAsr(cfg.locale)
  const clip = useVoiceClip()
  const endRef = useRef<HTMLDivElement>(null)
  const lastId = useRef(initial.messages.length ? initial.messages[initial.messages.length - 1].id : 0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const flushed = useRef(0)
  const dialed = useRef(false)
  const rejoined = useRef(false)
  const inviteRef = useRef(initial.room.invite || '')
  const srRef = useRef(sr)
  srRef.current = sr
  const meId = account?.id || ''

  const memberIds = useMemo(() => members.map((m) => m.id), [members])
  const call = useVoiceCall(room.id, meId, memberIds)

  useEffect(() => {
    if (dialed.current || !call.supported) return
    dialed.current = true
    void call.call()
  }, [call.supported])

  const apply = useCallback((s: RoomState) => {
    inviteRef.current = s.room.invite || inviteRef.current
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

  const chat = useMemo(() => msgs.filter((m) => m.kind !== 'prompt'), [msgs])
  const questions = useMemo(() => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].kind === 'prompt') return parsePrompt(msgs[i].text)
    }
    return []
  }, [msgs])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  useEffect(() => {
    let alive = true
    const tick = () => {
      fetchRoomState(room.id, lastId.current)
        .then((s) => { if (alive) apply(s) })
        .catch((e) => {
          if (!alive) return
          const code = (e as { code?: string }).code
          if (code === 'ROOM_NOT_FOUND') { onLeave(); return }
          if (code !== 'ROOM_OUTSIDE') return
          if (rejoined.current) { onLeave(); return }
          rejoined.current = true
          joinRoom(room.id, '', inviteRef.current)
            .then((s) => { if (alive) { apply(s); rejoined.current = false } })
            .catch(() => { if (alive) onLeave() })
        })
    }
    const timer = window.setInterval(tick, POLL_MS)
    return () => { alive = false; window.clearInterval(timer) }
  }, [room.id, apply, onLeave])

  useEffect(() => () => { audioRef.current?.pause() }, [])

  useEffect(() => {
    const bye = () => leaveRoomBeacon(room.id)
    window.addEventListener('pagehide', bye)
    return () => window.removeEventListener('pagehide', bye)
  }, [room.id])

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

  const talk = async () => {
    if (clip.recording) {
      if (sr.listening) sr.stop()
      clip.stop()
      return
    }
    if (call.muted) { setErr(t('rm.mutedRec')); return }
    setErr('')
    if (sr.supported) { sr.reset(); sr.start() }
    const ok = await clip.start((data) => setPending({ audio: data, at: Date.now() }), call.localStream())
    if (!ok) {
      if (srRef.current.listening) srRef.current.stop()
      srRef.current.reset()
      setErr(t('room.micFail'))
    }
  }

  useEffect(() => {
    if (!call.muted) return
    if (sr.listening) sr.stop()
    if (clip.recording) clip.cancel()
  }, [call.muted, sr.listening, clip.recording])

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
      setTopicOpen(true)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const quit = async () => {
    call.hangUp()
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

  const micErr = call.error
  const MIC_TEXT: Record<string, string> = {
    denied: 'call.micDenied',
    nomic: 'call.micNone',
    busy: 'call.micBusy',
  }
  const micNote = !call.supported
    ? t(call.secure ? 'call.noSupport' : 'call.needHttps')
    : micErr
      ? MIC_TEXT[micErr.code] ? t(MIC_TEXT[micErr.code]) : micErr.text || t('call.micOther')
      : ''

  return (
    <div className="room2">
      <header className="room2-top">
        <Icon name={room.mode === 'private' ? 'lock' : 'globe'} size={17} />
        <b>{room.name}</b>
        <span className="rm-count"><Icon name="user" size={13} /> {room.size}/{room.max}</span>
        <span className="rm-badge">{levelCode(room.level)}</span>
        <span className="rm-code">#{room.id}</span>
        <button className={'rm-copy' + (copied ? ' ok' : '')} onClick={copyInvite}>
          <Icon name="copy" size={15} /> {copied ? t('room.copied') : t('room.copyLink')}
        </button>
      </header>

      <div className="room2-grid">
        <div className="room2-side">
          <section className="room2-card">
            <RoomPeople call={call} members={members} meId={meId} hostId={room.hostId} slots={room.max} />
            {call.active && (
              <div className="rm-miccheck">
                <div className={'rm-level' + (call.muted ? ' off' : '')}>
                  <i style={{ width: Math.min(100, Math.round(call.myLevel * 320)) + '%' }} />
                </div>
                <small>{call.muted ? t('rm.micStopped') : call.device || t('rm.micLevel')}</small>
              </div>
            )}
            {call.active && call.silent && (
              <p className="rm-note bad"><Icon name="x-circle" size={13} /> {t('rm.micSilent')}</p>
            )}
            {call.active && call.peers.length === 0 && <p className="rm-note">{t('call.alone')}</p>}
            {call.starting && <p className="rm-note">{t(call.slow ? 'call.startingSlow' : 'call.starting')}</p>}
            {micNote && <p className="rm-note bad"><Icon name="x-circle" size={13} /> {micNote}</p>}
            {micErr && call.supported && (
              <button className="rm-retry" onClick={() => void call.call()}>
                <Icon name="refresh" size={13} /> {t('rm.retryMic')}
              </button>
            )}
            {call.peers.some((p) => p.phase === 'lost') && <p className="rm-note bad">{t('call.relayWarn')}</p>}
          </section>

          <section className="room2-card">
            <button className="rm-fold" onClick={() => setTopicOpen((v) => !v)} aria-expanded={topicOpen}>
              <Icon name="book" size={16} />
              <b>{t('rm.topicHead')}</b>
              <Icon name={topicOpen ? 'chevron-up' : 'chevron-down'} size={16} />
            </button>
            {topicOpen && (
              <div className="rm-topic">
                <p className="rm-topictext">{room.topic || t('rm.noTopic')}</p>
                {questions.length > 0 && <div className="rm-qhead">{t('rm.qHead')}</div>}
                {questions.map((q, i) => (
                  <div key={i} className="rm-q">
                    <div className="rm-qtext">
                      <b lang={room.lang}>{q.ko}</b>
                      <small>{q.vi}</small>
                    </div>
                    <div className="rm-qacts">
                      <button onClick={() => speakLang(q.ko, cfg.locale)} title={t('sp.hear')}>
                        <Icon name="volume" size={14} />
                      </button>
                      <button onClick={() => send(q.ko)} disabled={busy} title={t('rm.sendQ')}>
                        <Icon name="send" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="rm-ask" onClick={askAi} disabled={busy}>
                  <Icon name="sparkles" size={15} /> {t(questions.length ? 'rm.askMore' : 'room.askAi')}
                </button>
              </div>
            )}
          </section>

          <div className="room2-ctrl">
            <button
              className={'rm-ctrl' + (call.muted ? ' on' : '')}
              disabled={!call.active}
              onClick={call.toggleMute}
            >
              <Icon name={call.muted ? 'mute' : 'mic'} size={16} /> {t(call.muted ? 'rm.micOn' : 'rm.micOff')}
            </button>
            <button className="rm-ctrl danger" onClick={quit}>
              <Icon name="logout" size={16} /> {t('room.leave')}
            </button>
          </div>
        </div>

        <section className="room2-card room2-chat">
          <div className="rm-chathead"><Icon name="note" size={16} /> {t('rm.chatHead')}</div>

          <div className="rm-box">
            {chat.length === 0 && <div className="rm-empty">{t('room.emptyChat')}</div>}
            {chat.map((m) => {
              if (m.kind === 'joined' || m.kind === 'left') {
                return (
                  <div key={m.id} className="rm-sys">
                    {t(m.kind === 'joined' ? 'room.sysJoin' : 'room.sysLeft', { name: m.name })}
                  </div>
                )
              }
              const mine = m.userId === meId
              return (
                <div key={m.id} className={'rm-msg' + (mine ? ' me' : '')}>
                  {!mine && <Avatar size={30} src={m.avatar} initials={m.name.charAt(0)} />}
                  <div className="rm-bubble">
                    {!mine && <div className="rm-msgname">{m.name}</div>}
                    {m.audio && (
                      <button
                        className={'rm-play' + (playing === m.id ? ' on' : '')}
                        onClick={() => play(m)}
                      >
                        <Icon name={playing === m.id ? 'pause' : 'volume'} size={13} />
                        {playing === m.id ? t('room.playing') : t('room.playVoice')}
                      </button>
                    )}
                    {m.text && <div className="rm-text" lang={room.lang}>{m.text}</div>}
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>

          {err && <div className="sp-err"><Icon name="x-circle" size={14} /> {err}</div>}
          {!err && clip.error && <div className="sp-err"><Icon name="x-circle" size={14} /> {t('room.micFail')}</div>}
          {!err && !clip.error && sr.error && <div className="sp-err"><Icon name="x-circle" size={14} /> {sr.error}</div>}

          <div className="rm-compose">
            <input
              value={sr.listening ? (sr.interim || t('sp.listening')) : draft}
              onChange={(e) => setDraft(e.target.value)}
              readOnly={sr.listening}
              lang={room.lang}
              placeholder={t('room.placeholder')}
              aria-label={t('room.placeholder')}
              onKeyDown={(e) => { if (e.key === 'Enter') send(draft) }}
            />
            {clip.supported && (
              <button
                className={'rm-rec' + (clip.recording ? ' on' : '')}
                onClick={() => void talk()}
                disabled={busy || call.muted}
                title={call.muted
                  ? t('rm.mutedRec')
                  : clip.recording ? t('room.recOn', { s: clip.seconds, max: clip.maxSeconds }) : t('room.recOff')}
              >
                <Icon name={call.muted ? 'mute' : 'mic'} size={18} />
              </button>
            )}
            <button className="rm-send" disabled={!draft.trim() || busy} onClick={() => send(draft)}>
              <Icon name="send" size={18} />
            </button>
          </div>
          <p className={'rm-hint' + (call.muted ? ' muted' : '')}>
            {!clip.supported
              ? t('room.noRec')
              : call.muted
                ? t('rm.mutedHint')
                : clip.recording ? t('room.recOn', { s: clip.seconds, max: clip.maxSeconds }) : t('rm.hint')}
          </p>
        </section>
      </div>
    </div>
  )
}
