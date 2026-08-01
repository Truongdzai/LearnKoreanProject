import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { env } from '@/config/env'
import { getToken } from '@/core/api/client'
import { deleteAccountApi } from '@/core/api/me.api'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

export default function MyDataCard() {
  const { t } = useAppStore()
  const { account, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (!account) return null
  const byEmail = account.provider === 'email'

  const download = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(env.apiBase + '/api/me/export', {
        headers: { Authorization: 'Bearer ' + (getToken() || '') },
      })
      if (!res.ok) throw new Error(t('data.exportFail'))
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vyling-du-lieu-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = () => {
    setBusy(true)
    setErr('')
    deleteAccountApi(password, confirm)
      .then(() => signOut())
      .catch((e) => setErr((e as Error).message))
      .finally(() => setBusy(false))
  }

  return (
    <div className="mydata">
      <div className="mydata-head">
        <b><Icon name="lock" size={16} /> {t('data.title')}</b>
        <span>{t('data.sub')}</span>
      </div>

      <div className="mydata-row">
        <div>
          <b>{t('data.exportTitle')}</b>
          <span>{t('data.exportSub')}</span>
        </div>
        <button className="btn-ghost sm" disabled={busy} onClick={download}>
          <Icon name="download" size={15} /> {t('data.exportBtn')}
        </button>
      </div>

      <div className="mydata-row danger">
        <div>
          <b>{t('data.deleteTitle')}</b>
          <span>{t('data.deleteSub')}</span>
        </div>
        {!open && (
          <button className="btn-ghost sm danger" onClick={() => setOpen(true)}>
            <Icon name="trash" size={15} /> {t('data.deleteBtn')}
          </button>
        )}
      </div>

      {open && (
        <div className="mydata-confirm">
          <p>{t('data.deleteWarn')}</p>
          {byEmail ? (
            <input
              type="password"
              value={password}
              placeholder={t('data.passwordPlaceholder')} aria-label={t('data.passwordPlaceholder')}
              onChange={(e) => setPassword(e.target.value)}
            />
          ) : (
            <input
              value={confirm}
              placeholder={t('data.confirmPlaceholder')} aria-label={t('data.confirmPlaceholder')}
              onChange={(e) => setConfirm(e.target.value.toUpperCase())}
            />
          )}
          <div className="mydata-actions">
            <button
              className="btn-danger sm"
              disabled={busy || (byEmail ? !password : confirm !== 'XOA')}
              onClick={remove}
            >
              {t('data.deleteFinal')}
            </button>
            <button className="btn-ghost sm" disabled={busy} onClick={() => { setOpen(false); setErr('') }}>
              {t('data.cancel')}
            </button>
          </div>
        </div>
      )}

      {err && <div className="mydata-err">{err}</div>}
    </div>
  )
}
