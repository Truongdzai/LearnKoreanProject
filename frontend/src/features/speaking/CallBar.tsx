import { useEffect, useRef } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useVoiceCall } from '@/hooks/useVoiceCall'
import type { RoomMember } from '@/core/api/rooms.api'

function RemoteAudio({ stream }: { stream: MediaStream | null }) {
  const ref = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !stream) return
    el.srcObject = stream
    el.play().catch(() => { })
    return () => { el.srcObject = null }
  }, [stream])

  return <audio ref={ref} autoPlay playsInline />
}

interface Props {
  roomId: string
  meId: string
  members: RoomMember[]
}

export default function CallBar({ roomId, meId, members }: Props) {
  const { t } = useAppStore()
  const ids = members.map((m) => m.id)
  const call = useVoiceCall(roomId, meId, ids)
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name || '…'
  const live = call.peers.filter((p) => p.phase === 'live').length

  if (!call.supported) {
    return (
      <div className="call-bar off">
        <Icon name="x-circle" size={15} /> {t(call.secure ? 'call.noSupport' : 'call.needHttps')}
      </div>
    )
  }

  if (!call.active) {
    const err = call.error
    return (
      <div className="call-bar">
        <button className="btn-primary sm" disabled={call.starting} onClick={call.call}>
          <Icon name="phone" size={15} /> {call.starting ? t('call.starting') : t('call.start')}
        </button>
        <span className="call-note">{t('call.hint')}</span>
        {err && (
          <span className="call-err">
            <Icon name="x-circle" size={13} />
            {err.code === 'denied' ? t('call.micDenied') : err.code === 'nomic' ? t('call.micNone') : err.text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="call-bar on">
      <span className="call-live"><span className="call-dot" /> {t('call.live', { n: live + 1 })}</span>

      <div className="call-people">
        <span className={'call-chip me' + (call.mySpeaking ? ' talking' : '') + (call.muted ? ' muted' : '')}>
          <Icon name={call.muted ? 'mute' : 'mic'} size={12} /> {t('call.you')}
        </span>
        {call.peers.map((p) => (
          <span key={p.id} className={'call-chip ' + p.phase + (p.speaking ? ' talking' : '')}>
            {p.phase === 'live' ? <Icon name="volume" size={12} /> : <Icon name="clock" size={12} />}
            {nameOf(p.id)}
            {p.phase !== 'live' && <small>{t(p.phase === 'lost' ? 'call.lost' : 'call.connecting')}</small>}
          </span>
        ))}
        {call.peers.length === 0 && <span className="call-note">{t('call.alone')}</span>}
      </div>

      <button className={'btn-ghost sm' + (call.muted ? ' on' : '')} onClick={call.toggleMute}>
        <Icon name={call.muted ? 'mute' : 'mic'} size={14} /> {t(call.muted ? 'call.unmute' : 'call.mute')}
      </button>
      <button className="btn-ghost sm danger" onClick={call.hangUp}>
        <Icon name="phone" size={14} /> {t('call.end')}
      </button>

      {call.peers.some((p) => p.phase === 'lost') && <p className="call-warn">{t('call.relayWarn')}</p>}

      {call.peers.map((p) => <RemoteAudio key={p.id} stream={call.streamOf(p.id)} />)}
    </div>
  )
}
