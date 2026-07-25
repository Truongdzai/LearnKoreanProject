import type { ReactNode } from 'react'

interface FlowerProps {
  art: string
  size?: number
  growth?: number
}

const PALETTE: Record<string, { petal: string; petal2: string; center: string }> = {
  sunflower: { petal: '#ffd23f', petal2: '#f7b500', center: '#7a4a1e' },
  tulip: { petal: '#ff7a8a', petal2: '#ef4060', center: '#ffd23f' },
  lotus: { petal: '#ff9ed2', petal2: '#e85aa8', center: '#ffe27a' },
  rose: { petal: '#ff5d73', petal2: '#d61f43', center: '#b3163a' },
  sakura: { petal: '#ffc7dd', petal2: '#ff8fb6', center: '#fff0a6' },
  bamboo: { petal: '#4ade80', petal2: '#15803d', center: '#22c55e' },
}

function stageOf(growth?: number): number {
  if (growth === undefined || growth >= 100) return 4
  if (growth >= 70) return 3
  if (growth >= 40) return 2
  if (growth >= 20) return 1
  return 0
}

export default function Flower({ art, size = 96, growth }: FlowerProps) {
  const c = PALETTE[art] || PALETTE.sunflower
  const stage = stageOf(growth)

  const pot = (
    <>
      <path d="M36 84h28l-3 11a3 3 0 0 1-3 2.5H42a3 3 0 0 1-3-2.5z" fill="#8a5a3b" />
      <rect x="33" y="80" width="34" height="6" rx="2" fill="#a06a45" />
      <ellipse cx="50" cy="80.5" rx="15" ry="2.4" fill="#6b4a2e" />
    </>
  )

  const stem = (top: number) => (
    <path d={`M50 84V${top}`} stroke="#2f9e44" strokeWidth="4.5" strokeLinecap="round" />
  )

  const leafPair = (y: number, s: number) => (
    <g transform={`translate(50 ${y}) scale(${s})`}>
      <path d="M0 0C6 -2 12 -7 15 -15 7 -13 2 -7 0 -3Z" fill="#2f9e44" />
      <path d="M0 0C-6 -2 -12 -7 -15 -15 -7 -13 -2 -7 0 -3Z" fill="#40c057" />
    </g>
  )

  const head = (cy: number, s: number) => {
    const n = art === 'sakura' ? 5 : art === 'sunflower' ? 13 : 10
    const pry = 12
    const prx = art === 'sunflower' ? 3.4 : art === 'lotus' ? 4.2 : 5.4
    const step = 360 / n
    const idx = Array.from({ length: n })
    return (
      <g transform={`translate(50 ${cy}) scale(${s})`}>
        {idx.map((_, i) => (
          <ellipse key={`b${i}`} cx="0" cy={-(pry - 2)} rx={prx} ry={pry} fill={c.petal2} transform={`rotate(${step * i + step / 2})`} />
        ))}
        {idx.map((_, i) => (
          <ellipse key={`f${i}`} cx="0" cy={-(pry - 2)} rx={prx} ry={pry} fill={c.petal} transform={`rotate(${step * i})`} />
        ))}
        <circle r={art === 'sunflower' ? 7.5 : 5.6} fill={c.center} />
        {art === 'sunflower'
          ? <circle r="7.5" fill="#5c3a17" opacity="0.22" />
          : <circle r="2.3" fill="#ffffff" opacity="0.4" />}
      </g>
    )
  }

  const svg = (inner: ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {inner}
    </svg>
  )

  if (stage === 0) {
    return svg(
      <>
        {pot}
        <path d="M50 80V76" stroke="#2f9e44" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="47" cy="75" rx="3.4" ry="2" fill="#40c057" transform="rotate(-30 47 75)" />
        <ellipse cx="53" cy="75" rx="3.4" ry="2" fill="#37b24d" transform="rotate(30 53 75)" />
      </>,
    )
  }

  const bambooLeaves = (top: number) => (
    <g transform={`translate(0 ${top - 16})`}>
      <path d="M52 18c-7-1-11-6-11-11 6 0 10 4 11 8z" fill="#2f9e44" />
      <path d="M58 12c7-1 11-6 11-11-6 0-10 4-11 8z" fill="#37b24d" />
    </g>
  )
  if (art === 'bamboo') {
    const bh = [0, 0.42, 0.64, 0.83, 1][stage]
    const h1 = 58 * bh
    const h2 = 64 * bh
    return svg(
      <>
        {pot}
        <rect x="44" y={80 - h1} width="6" height={h1} rx="3" fill={c.petal2} />
        <rect x="52" y={80 - h2} width="6" height={h2} rx="3" fill={c.petal} />
        <rect x="43.5" y={80 - h2 * 0.62} width="15" height="2.4" rx="1" fill="#0f5c2e" opacity="0.4" />
        {stage >= 2 && bambooLeaves(80 - h2)}
      </>,
    )
  }

  if (stage === 1) {
    return svg(
      <>
        {stem(66)}
        {pot}
        <ellipse cx="45" cy="64" rx="6" ry="3.3" fill="#40c057" transform="rotate(-28 45 64)" />
        <ellipse cx="55" cy="64" rx="6" ry="3.3" fill="#37b24d" transform="rotate(28 55 64)" />
      </>,
    )
  }

  if (stage === 2) {
    return svg(
      <>
        {stem(52)}
        {pot}
        {leafPair(66, 0.82)}
        <path d="M50 43C45.5 45 45.5 52 50 55 54.5 52 54.5 45 50 43Z" fill="#2f9e44" />
        <path d="M50 46C47.4 47.3 47.4 51 50 52.6 52.6 51 52.6 47.3 50 46Z" fill={c.petal} opacity="0.6" />
        <path d="M50 55c-3-1-5-3-5-6 3 0 5 2 5 4z" fill="#37b24d" />
        <path d="M50 55c3-1 5-3 5-6-3 0-5 2-5 4z" fill="#40c057" />
      </>,
    )
  }

  if (stage === 3) {
    return svg(
      <>
        {stem(52)}
        {pot}
        {leafPair(64, 0.9)}
        <path d="M44 51q6 5 12 0-2-6-6-6t-6 6z" fill="#2f9e44" />
        {head(43, 0.66)}
      </>,
    )
  }
  return svg(
    <>
      {stem(50)}
      {pot}
      {leafPair(64, 1)}
      {head(36, 1)}
    </>,
  )
}
