import type { CSSProperties, ReactElement } from 'react'

const ICONS = {
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M3 14.5h18M8 4v16M16 4v16" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 3l4 4 4-4" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  cards: (
    <>
      <rect x="8" y="3" width="13" height="13" rx="2" />
      <path d="M4 7v12a2 2 0 0 0 2 2h12" />
    </>
  ),
  letters: (
    <>
      <path d="M4 7V5h9v2" />
      <path d="M8.5 5v12M6.5 17h4" />
      <path d="M14.5 12.5l2.5-5 2.5 5M15.2 11h3.6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 21V4" />
      <path d="M4 21h17" />
      <rect x="7.5" y="12" width="3" height="6" rx="1" fill="currentColor" stroke="none" />
      <rect x="12.5" y="7" width="3" height="11" rx="1" fill="currentColor" stroke="none" />
      <rect x="17.5" y="14" width="3" height="4" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="8.5" y1="21" x2="15.5" y2="21" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13.5" width="4.5" height="6.5" rx="1.6" />
      <rect x="16.5" y="13.5" width="4.5" height="6.5" rx="1.6" />
    </>
  ),
  note: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5 5.5-5.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  party: (
    <>
      <path d="M3 21l5-12 7 7-12 5z" />
      <path d="M14 7c1-1 2.5-1 3.5 0" />
      <path d="M17 11c1-1 2.5-1 3.5 0" />
      <circle cx="13" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="21" cy="13" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  frown: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 16c1-1.3 2.2-2 3.5-2s2.5.7 3.5 2" />
      <line x1="9" y1="9.5" x2="9.02" y2="9.5" />
      <line x1="15" y1="9.5" x2="15.02" y2="9.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.2 1 2.5h6c0-1.3.2-1.8 1-2.5A6 6 0 0 0 12 3z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" fill="currentColor" stroke="none" />
      <path d="M18.5 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="currentColor" stroke="none" />
    </>
  ),
  play: <path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none" />,
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M20 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </>
  ),
  star: (
    <path
      d="M12 3.3l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z"
      fill="currentColor"
      stroke="none"
    />
  ),
  tool: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
  ),
  frog: (
    <>
      <path d="M4 12.5a8 7 0 0 1 16 0v.5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <circle cx="8.5" cy="8.5" r="2.6" />
      <circle cx="15.5" cy="8.5" r="2.6" />
      <circle cx="8.5" cy="8.7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.7" r="0.9" fill="currentColor" stroke="none" />
      <path d="M8.5 13.5c1.1 1 2.3 1.5 3.5 1.5s2.4-.5 3.5-1.5" />
    </>
  ),
  'flag-kr': (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" fill="#ffffff" stroke="#dfe5ea" strokeWidth="1" />
      <circle cx="12" cy="12" r="4" fill="#0047a0" />
      <path d="M8 12a4 4 0 0 1 8 0 2 2 0 0 1-4 0 2 2 0 0 0-4 0z" fill="#cd2e3a" />
    </>
  ),
  'flag-vn': (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" fill="#da251d" />
      <path
        d="M12 8l1.18 2.39 2.64.38-1.91 1.86.45 2.63L12 14.39l-2.36 1.25.45-2.63-1.91-1.86 2.64-.38z"
        fill="#ffff00"
      />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.3 9.2c0-1.1 1.2-1.7 2.7-1.7s2.7.6 2.7 1.7-1 1.6-2.7 1.9-2.7.8-2.7 1.9 1.2 1.8 2.7 1.8 2.7-.7 2.7-1.8" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3" />
      <path d="M9 14.5h6M10 21h4M12 14.5V18" />
      <path d="M9 21h6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.5L5 4h14l1 5.5" />
      <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 6 0 2.5 2.5 0 0 0 5 0" />
      <path d="M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3-2-5-6-5 0 3 2 5 6 5z" />
      <path d="M12 11c0-3 2-5 6-5 0 3-2 5-6 5z" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
      <path d="M3.5 13h17M12 9v11" />
      <path d="M12 9C12 9 11 4 8.5 4A2.5 2.5 0 0 0 8.5 9zM12 9s1-5 3.5-5A2.5 2.5 0 0 1 15.5 9z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </>
  ),
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'chevron-up': <path d="M18 15l-6-6-6 6" />,
  'chevron-left': <path d="M15 6l-6 6 6 6" />,
  flame: (
    <path d="M12 22c4 0 6.5-2.6 6.5-6 0-3.6-3-5.4-3.5-9-2.2 1.5-3 3.5-3 5.5-1.5-1-1.8-2.8-1.5-4.5C8 5 5.5 8 5.5 12c0 3.4 2.5 6 6.5 6z" />
  ),
  volume: (
    <>
      <path d="M5 9.5v5h3l4 3.5V6L8 9.5z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  crown: <path d="M3 7l4 5 5-7 5 7 4-5v11H3z" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </>
  ),
  heart: <path d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7 3.7c0 5-7 9.3-7 9.3z" />,
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  send: (
    <>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4z" />
    </>
  ),
  google: (
    <>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </>
  ),
  facebook: (
    <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.41c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.23 2.68.23v2.95H15.8c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  pause: (
    <>
      <rect x="7" y="5" width="3.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  mute: (
    <>
      <path d="M5 9.5v5h3l4 3.5V6L8 9.5z" />
      <path d="M16 9l5 5M21 9l-5 5" />
    </>
  ),
  droplet: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  trending: (
    <>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M17 8h4v4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  fire: (
    <path d="M12 22c4 0 6.5-2.6 6.5-6 0-3.6-3-5.4-3.5-9-2.2 1.5-3 3.5-3 5.5-1.5-1-1.8-2.8-1.5-4.5C8 5 5.5 8 5.5 12c0 3.4 2.5 6 6.5 6z" />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 13a1.7 1.7 0 0 0-1.56-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 6.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V1a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V7a1.7 1.7 0 0 0 1.56 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  vyling: (
    <>
      <path d="M4 11.5C4 6.8 7.6 4 12 4s8 2.8 8 7.5c0 3.6-2.4 6.2-6 6.9V21l-3.4-2.4C6.7 17.9 4 15.1 4 11.5z" />
      <circle cx="9.3" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <path d="M9.5 13.6c.8.7 1.6 1 2.5 1s1.7-.3 2.5-1" />
    </>
  ),
} satisfies Record<string, ReactElement>

export type IconName = keyof typeof ICONS

const RAW = new Set<IconName>(['flag-kr', 'flag-vn', 'google', 'facebook'])

interface IconProps {
  name: IconName
  size?: number | string
  color?: string
  strokeWidth?: number
  className?: string
  style?: CSSProperties
  title?: string
}

export default function Icon({
  name,
  size = '1em',
  color,
  strokeWidth = 2,
  className,
  style,
  title,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: 'inline-block', verticalAlign: '-0.125em', flexShrink: 0, ...(color ? { color } : {}), ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {RAW.has(name) ? (
        ICONS[name]
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {ICONS[name]}
        </g>
      )}
    </svg>
  )
}
