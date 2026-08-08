import Icon from '@/core/components/Icon'
import type { KpiDelta } from '@/core/api/admin.api'
import { delta, fmtInt } from '../metrics'

interface Props {
  label: string
  kpi?: KpiDelta
  hint: string
  active?: boolean
  onClick?: () => void
}

export function DeltaChip({ kpi }: { kpi?: KpiDelta }) {
  if (!kpi) return <span className="adm-chip flat">—</span>
  const { dir, pct } = delta(kpi.value, kpi.prev)
  if (dir === 'new') return <span className="adm-chip up"><Icon name="trending" size={13} /> Mới</span>
  if (dir === 'flat') return <span className="adm-chip flat">0%</span>
  return (
    <span className={'adm-chip ' + dir}>
      <Icon name={dir === 'up' ? 'chevron-up' : 'chevron-down'} size={13} />
      {Math.abs(pct).toFixed(Math.abs(pct) >= 10 ? 0 : 1)}%
    </span>
  )
}

export default function KpiCard({ label, kpi, hint, active, onClick }: Props) {
  const body = (
    <>
      <span className="adm-kpi-label">{label}</span>
      <div className="adm-kpi-row">
        <b>{kpi ? fmtInt(kpi.value) : '—'}</b>
        <DeltaChip kpi={kpi} />
      </div>
      <span className="adm-kpi-hint">{hint}</span>
    </>
  )
  if (!onClick) return <div className="adm-kpi">{body}</div>
  return (
    <button type="button" className={'adm-kpi' + (active ? ' on' : '')} onClick={onClick} aria-pressed={active}>
      {body}
    </button>
  )
}
