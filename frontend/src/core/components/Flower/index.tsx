interface FlowerProps {
  art: string
  size?: number
}

const PALETTE: Record<string, { petal: string; petal2: string; center: string }> = {
  sunflower: { petal: '#ffd23f', petal2: '#f7b500', center: '#7a4a1e' },
  tulip: { petal: '#ff7a8a', petal2: '#ef4060', center: '#ffd23f' },
  lotus: { petal: '#ff9ed2', petal2: '#e85aa8', center: '#ffe27a' },
  rose: { petal: '#ff5d73', petal2: '#d61f43', center: '#b3163a' },
  sakura: { petal: '#ffc7dd', petal2: '#ff8fb6', center: '#fff0a6' },
  bamboo: { petal: '#4ade80', petal2: '#15803d', center: '#22c55e' },
}

/** Cute potted-plant illustration; look varies by `art`. */
export default function Flower({ art, size = 96 }: FlowerProps) {
  const c = PALETTE[art] || PALETTE.sunflower
  const petals = Array.from({ length: 10 })

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* stem */}
      <path d="M50 86V52" stroke="#2f9e44" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 66c-7-2-12-7-13-13 7 0 12 4 13 9z" fill="#37b24d" />
      <path d="M50 60c7-2 12-7 13-13-7 0-12 4-13 9z" fill="#40c057" />

      {/* pot */}
      <path d="M36 84h28l-3 11a3 3 0 0 1-3 2.5H42a3 3 0 0 1-3-2.5z" fill="#8a5a3b" />
      <rect x="33" y="80" width="34" height="6" rx="2" fill="#a06a45" />

      {art === 'bamboo' ? (
        <g>
          <rect x="44" y="20" width="6" height="40" rx="3" fill={c.petal2} />
          <rect x="52" y="14" width="6" height="46" rx="3" fill={c.petal} />
          <path d="M44 30c-6-1-9-5-9-9 5 0 8 3 9 7z" fill="#2f9e44" />
          <path d="M58 24c6-1 9-5 9-9-5 0-8 3-9 7z" fill="#37b24d" />
        </g>
      ) : (
        <g transform="translate(50 36)">
          {(art === 'sakura' ? petals.slice(0, 5) : petals).map((_, i, arr) => {
            const ang = (360 / arr.length) * i
            return (
              <ellipse
                key={i}
                cx="0"
                cy="-16"
                rx={art === 'lotus' ? 7 : 6.5}
                ry={art === 'rose' ? 11 : 14}
                fill={i % 2 ? c.petal2 : c.petal}
                transform={`rotate(${ang})`}
              />
            )
          })}
          <circle r="9" fill={c.center} />
          {art === 'sunflower' && <circle r="9" fill="#7a4a1e" opacity="0.18" />}
        </g>
      )}
    </svg>
  )
}
