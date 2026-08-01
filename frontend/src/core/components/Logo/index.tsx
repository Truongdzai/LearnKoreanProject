import { useId } from 'react'

interface LogoProps {
  size?: number
  tile?: boolean
}

export default function Logo({ size = 40, tile = true }: LogoProps) {
  const id = 'vy' + useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VyLing">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b9dff" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe9ff" />
        </linearGradient>
        <linearGradient id={`${id}-sprout`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {tile && <rect x="1" y="1" width="46" height="46" rx="14" fill={`url(#${id}-bg)`} />}

      <path d="M24 11c0-3 2.4-5 5.4-5 0 3-2.4 5-5.4 5z" fill={`url(#${id}-sprout)`} />
      <path d="M24 12V8.5" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" />

      <path
        d="M11 23.5C11 16.6 16.9 12 24 12s13 4.6 13 11.5c0 5.6-3.9 9.6-9.7 10.7L20 39v-4.9C14.6 32.5 11 28.7 11 23.5z"
        fill={`url(#${id}-body)`}
      />

      <circle cx="19.4" cy="23.2" r="2.5" fill="#1e3a8a" />
      <circle cx="28.6" cy="23.2" r="2.5" fill="#1e3a8a" />
      <circle cx="20.3" cy="22.3" r="0.8" fill="#fff" />
      <circle cx="29.5" cy="22.3" r="0.8" fill="#fff" />

      <circle cx="15.6" cy="27" r="1.7" fill="#ffb3c7" opacity="0.85" />
      <circle cx="32.4" cy="27" r="1.7" fill="#ffb3c7" opacity="0.85" />

      <path d="M20.5 28.4c1.2 1.3 2.3 1.9 3.5 1.9s2.3-.6 3.5-1.9" stroke="#1e3a8a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  )
}
