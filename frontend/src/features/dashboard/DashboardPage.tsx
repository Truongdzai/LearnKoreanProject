import { useEffect, useState } from 'react'
import { fetchHealth } from '@/core/api/health.api'
import Icon from '@/core/components/Icon'
import type { HealthCheck } from '@/models/health.model'

export default function DashboardPage() {
  const [checks, setChecks] = useState<HealthCheck[] | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetchHealth()
      .then(setChecks)
      .catch((e: Error) => setErr(e.message))
  }, [])

  if (err) return <p className="status err"><Icon name="x-circle" /> {err}</p>
  if (!checks) return <p className="muted">Đang kiểm tra…</p>

  const ready = checks.every((c) => c.ok || c.optional)

  return (
    <>
      <h1 className="page-title">Trạng thái hệ thống</h1>
      <p className="page-sub">Kiểm tra các thành phần chạy nền của Trường Học Ngoại Ngữ.</p>

      <section className={'dash-banner ' + (ready ? 'ok' : 'warn')}>
        <h1>{ready ? <>Mọi thứ đã sẵn sàng <Icon name="party" /></> : 'Đang hoàn tất thiết lập…'}</h1>
        <p>
          {ready ? (
            'Nền tảng chạy ổn. Sang “Trang chủ” để bắt đầu học.'
          ) : (
            <>Hãy xử lý các mục còn <Icon name="x-circle" size={15} /> bên dưới.</>
          )}
        </p>
      </section>

      <div className="section-title"><span className="pin" /> Chi tiết</div>
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
