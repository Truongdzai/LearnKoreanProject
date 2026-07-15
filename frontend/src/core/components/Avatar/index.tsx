import { useState } from 'react'
import Logo from '@/core/components/Logo'
import { frameVideoSources } from '@/core/utils/cosmetics'

interface AvatarProps {
  size?: number
  /** frame art key (e.g. aurora, blossom, flame, ice, forest, galaxy, v-khung1) */
  frame?: string | null
  /** avatar image (data URL or http URL) — takes priority over initials */
  src?: string | null
  /** optional initials instead of mascot */
  initials?: string
}

/** Round avatar with an optional animated frame ring (CSS styles or a video overlay). */
export default function Avatar({ size = 40, frame, src, initials }: AvatarProps) {
  const [errSrc, setErrSrc] = useState<string | null>(null)
  const vid = frameVideoSources(frame)
  const showImg = !!src && errSrc !== src
  const cls =
    'avatar-wrap' + (frame ? ' framed' : '') + (frame ? (vid ? ' frame-vid' : ' frame-' + frame) : '')
  return (
    <span className={cls} style={{ width: size, height: size }}>
      <span className="avatar-inner">
        {showImg ? (
          <img className="avatar-img" src={src!} alt="" referrerPolicy="no-referrer" onError={() => setErrSrc(src!)} />
        ) : initials ? (
          <span className="avatar-initials">{initials}</span>
        ) : (
          <Logo size={size * 0.72} tile={false} />
        )}
      </span>
      {vid && (
        <video
          className="frame-video"
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={(e) => {
            const v = e.currentTarget
            v.classList.toggle('mp4-fallback', v.currentSrc.includes('.mp4'))
          }}
        >
          <source src={vid.webm} type="video/webm" />
          <source src={vid.mp4} type="video/mp4" />
        </video>
      )}
    </span>
  )
}
