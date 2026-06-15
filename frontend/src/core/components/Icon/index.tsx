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
} satisfies Record<string, ReactElement>

export type IconName = keyof typeof ICONS

const RAW = new Set<IconName>(['flag-kr', 'flag-vn'])

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
