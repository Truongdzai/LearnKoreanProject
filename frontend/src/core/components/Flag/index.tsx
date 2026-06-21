import { useState } from 'react'

export interface FlagInfo {
  code: string
  cc: string
  name: string
}

export const FLAGS: Record<string, FlagInfo> = {
  ko: { code: 'ko', cc: 'kr', name: 'Tiếng Hàn' },
  en: { code: 'en', cc: 'us', name: 'Tiếng Anh' },
  ja: { code: 'ja', cc: 'jp', name: 'Tiếng Nhật' },
  zh: { code: 'zh', cc: 'cn', name: 'Tiếng Trung' },
  de: { code: 'de', cc: 'de', name: 'Tiếng Đức' },
}

const CC_BY_KEY: Record<string, string> = {
  ko: 'kr', kr: 'kr', en: 'us', us: 'us', ja: 'jp', jp: 'jp',
  zh: 'cn', cn: 'cn', de: 'de',
}

export default function Flag({ code, size = 22, className = '' }: { code: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  const cc = CC_BY_KEY[code] || code
  const h = Math.round((size * 3) / 4)

  if (failed) {
    return <span className={'flag-cc ' + className} style={{ width: size, height: h, fontSize: Math.round(size * 0.42) }}>{cc.toUpperCase()}</span>
  }
  return (
    <img
      className={'flag-img ' + className}
      src={`https://flagcdn.com/${cc}.svg`}
      width={size}
      height={h}
      style={{ width: size, height: h }}
      alt={cc.toUpperCase()}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
