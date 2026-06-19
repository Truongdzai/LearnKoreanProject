import Logo from '@/core/components/Logo'

interface AvatarProps {
  size?: number
  /** frame art key (e.g. aurora, blossom, flame, ice, forest, galaxy) */
  frame?: string | null
  /** optional initials instead of mascot */
  initials?: string
}

/** Round avatar with an optional animated frame ring (styled in globals.css). */
export default function Avatar({ size = 40, frame, initials }: AvatarProps) {
  return (
    <span className={'avatar-wrap' + (frame ? ' framed frame-' + frame : '')} style={{ width: size, height: size }}>
      <span className="avatar-inner">
        {initials ? <span className="avatar-initials">{initials}</span> : <Logo size={size * 0.72} tile={false} />}
      </span>
    </span>
  )
}
