import { useEffect, useRef } from 'react'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { useAppStore } from '@/store/app.store'
import type { VoiceCall } from '@/hooks/useVoiceCall'
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
  call: VoiceCall
  members: RoomMember[]
  meId: string
  hostId: string
  slots: number
}

export default function RoomPeople({ call, members, meId, hostId, slots }: Props) {
  const { t } = useAppStore()
  const peerOf = (id: string) => call.peers.find((p) => p.id === id)
  const isMuted = (id: string) => (id === meId ? call.active && call.muted : !!peerOf(id)?.muted)
  const speaking = (id: string) => (
    id === meId ? call.active && !call.muted && call.mySpeaking : !!peerOf(id)?.speaking
  )

  const label = (id: string, phase?: string) => {
    if (isMuted(id)) return t('rm.muted')
    if (phase === 'live') return t('rm.live')
    if (phase === 'lost') return t('call.lost')
    if (phase === 'connecting') return t('call.connecting')
    return t('rm.silent')
  }

  return (
    <div className="rm-people">
      {members.map((m) => {
        const phase = m.id === meId ? (call.active ? 'live' : undefined) : peerOf(m.id)?.phase
        return (
          <div key={m.id} className={'rm-person' + (speaking(m.id) ? ' talking' : '')}>
            <div className="rm-ava">
              <Avatar size={46} frame={m.frame} src={m.avatar} initials={m.name.charAt(0)} />
              {m.id === hostId && <span className="rm-crown" title={t('room.host')}><Icon name="crown" size={11} /></span>}
              {isMuted(m.id) && (
                <span className="rm-mutedot" title={t('call.mute')}><Icon name="mute" size={11} /></span>
              )}
            </div>
            <span className="rm-name">{m.id === meId ? t('call.you') : m.name}</span>
            <span className={'rm-state ' + (isMuted(m.id) ? 'off' : phase || 'off')}>
              {label(m.id, phase)}
            </span>
          </div>
        )
      })}
      {Array.from({ length: Math.max(0, slots - members.length) }).map((_, i) => (
        <div key={'e' + i} className="rm-person empty">
          <div className="rm-ava"><span className="rm-slot">+</span></div>
          <span className="rm-name">{t('rm.free')}</span>
        </div>
      ))}
      {call.peers.map((p) => <RemoteAudio key={p.id} stream={call.streamOf(p.id)} />)}
    </div>
  )
}
