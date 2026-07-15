import { useEffect, useState } from 'react'
import { fetchHealth } from '@/core/api/health.api'
import Icon from '@/core/components/Icon'
import type { HealthCheck } from '@/models/health.model'
import { useAppStore } from '@/store/app.store'

export default function DashboardPage() {
  const { t } = useAppStore()
  const [checks, setChecks] = useState<HealthCheck[] | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetchHealth()
      .then(setChecks)
      .catch((e: Error) => setErr(e.message))
  }, [])

  if (err) return <p className="status err"><Icon name="x-circle" /> {err}</p>
  if (!checks) return <p className="muted">{t('dash.checking')}</p>

  const ready = checks.every((c) => c.ok || c.optional)

  return (
    <>
      <h1 className="page-title">{t('dash.title')}</h1>
      <p className="page-sub">{t('dash.sub')}</p>

      <section className={'dash-banner ' + (ready ? 'ok' : 'warn')}>
        <h1>{ready ? <>{t('dash.ready')} <Icon name="party" /></> : t('dash.notReady')}</h1>
        <p>
          {ready ? (
            t('dash.readyText')
          ) : (
            <>{t('dash.fixBelow')} <Icon name="x-circle" size={15} /></>
          )}
        </p>
      </section>

      <div className="section-title"><span className="pin" /> {t('dash.detail')}</div>
      <div className="grid">
        {checks.map((c, i) => (
          <div key={i} className={'card ' + (c.ok ? 'good' : c.optional ? 'pending' : 'bad')}>
            <div className="card-head">
              <Icon
                name={c.ok ? 'check-circle' : c.optional ? 'clock' : 'x-circle'}
                color={c.ok ? 'var(--good)' : c.optional ? 'var(--pending)' : 'var(--bad)'}
              />{' '}
              <b>{c.name}</b>
            </div>
            <div className="card-detail">{c.detail}</div>
            {!c.ok && c.hint && (
              <div className="card-hint"><Icon name="arrow-right" size={14} /> {c.hint}</div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
