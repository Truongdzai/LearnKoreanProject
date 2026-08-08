import { useEffect, useRef, useState } from 'react'
import type { SeriesMetric, SeriesPoint } from '@/core/api/admin.api'
import { METRIC_LABEL, fmtCompact, fmtDay, fmtDayLong, fmtInt } from '../metrics'

const PAD = { l: 52, r: 16, t: 16, b: 30 }
const H = 292
const TICKS = 4

function niceMax(v: number): number {
  const target = Math.max(4, Math.ceil(v))
  const raw = target / TICKS
  const p = Math.pow(10, Math.max(0, Math.floor(Math.log10(raw))))
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    const step = Math.ceil(m * p)
    if (step * TICKS >= target) return step * TICKS
  }
  return target
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.clientWidth)
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

export default function TrendChart({ points, metric }: { points: SeriesPoint[]; metric: SeriesMetric }) {
  const [box, w] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState(-1)

  const n = points.length
  const vals = points.map((p) => p[metric] || 0)
  const max = niceMax(Math.max(0, ...vals))
  const width = Math.max(320, w)
  const plotW = width - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const dx = n > 1 ? plotW / (n - 1) : 0
  const x = (i: number) => PAD.l + (n > 1 ? i * dx : plotW / 2)
  const y = (v: number) => PAD.t + plotH - (v / max) * plotH

  const line = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = n
    ? `${line} L${x(n - 1).toFixed(1)},${(PAD.t + plotH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.t + plotH).toFixed(1)} Z`
    : ''

  const labelStep = Math.max(1, Math.ceil(n / 6))
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => (max / TICKS) * i)

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (n < 2) return setHover(n - 1)
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    setHover(Math.min(n - 1, Math.max(0, Math.round(px / dx))))
  }

  const hp = hover >= 0 ? points[hover] : null
  const tipLeft = hp ? Math.min(Math.max(x(hover), 90), width - 90) : 0

  return (
    <div className="adm-chart" ref={box}>
      <svg width={width} height={H} role="img" aria-label={`Biểu đồ ${METRIC_LABEL[metric]} theo ngày`}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="adm-grid" x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} />
            <text className="adm-axis" x={PAD.l - 10} y={y(t) + 4} textAnchor="end">{fmtCompact(Math.round(t))}</text>
          </g>
        ))}

        {points.map((p, i) =>
          i % labelStep === 0 || i === n - 1 ? (
            <text key={p.d} className="adm-axis" x={x(i)} y={H - 10} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
              {fmtDay(p.d)}
            </text>
          ) : null,
        )}

        {n > 0 && <path className="adm-area" d={area} />}
        {n > 0 && <path className="adm-line" d={line} />}

        {hp && (
          <g>
            <line className="adm-cross" x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + plotH} />
            <circle className="adm-dot" cx={x(hover)} cy={y(hp[metric] || 0)} r={4.5} />
          </g>
        )}

        <rect
          x={PAD.l} y={PAD.t} width={Math.max(0, plotW)} height={plotH} fill="transparent"
          onMouseMove={onMove} onMouseLeave={() => setHover(-1)}
        />
      </svg>

      {hp && (
        <div className="adm-tip" style={{ left: tipLeft }}>
          <b>{fmtInt(hp[metric] || 0)}</b>
          <span>{METRIC_LABEL[metric]}</span>
          <small>{fmtDayLong(hp.d)}</small>
        </div>
      )}
    </div>
  )
}

export function Sparkline({ points, metric }: { points: SeriesPoint[]; metric: SeriesMetric }) {
  const vals = points.map((p) => p[metric] || 0)
  const n = vals.length
  const max = Math.max(1, ...vals)
  const w = 100
  const h = 30
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${((i / Math.max(1, n - 1)) * w).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ')
  return (
    <svg className="adm-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path className="adm-spark-area" d={`${d} L${w},${h} L0,${h} Z`} />
      <path className="adm-spark-line" d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
