import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { confirmVerifyApi, sendVerifyCodeApi } from '@/core/api/auth.api'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

export default function VerifyEmailBanner() {
  const { t } = useAppStore()
  const { account, isAuthed, setAccount } = useAuth()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isAuthed || hidden || !account || account.provider !== 'email' || account.emailVerified !== false) return null

  const send = () => {
    setBusy(true)
    setMsg('')
    sendVerifyCodeApi()
      .then(() => { setOpen(true); setMsg(t('verify.sent', { email: account.email || '' })) })
      .catch((e) => setMsg((e as Error).message))
      .finally(() => setBusy(false))
  }

  const confirm = () => {
    setBusy(true)
    setMsg('')
    confirmVerifyApi(code.trim())
      .then((r) => { setAccount(r.user); setMsg(t('verify.done')) })
      .catch((e) => setMsg((e as Error).message))
      .finally(() => setBusy(false))
  }

  return (
    <div className="verify-bar">
      <span className="verify-ic"><Icon name="mail" size={17} /></span>
      <div className="verify-text">
        <b>{t('verify.title')}</b>
        <span>{msg || t('verify.sub', { reward: 50 })}</span>
      </div>
      {open ? (
        <div className="verify-form">
          <input
            value={code}
            maxLength={6}
            inputMode="numeric"
            placeholder={t('verify.codePlaceholder')} aria-label={t('verify.codePlaceholder')}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <button className="btn-primary sm" disabled={busy || code.length < 6} onClick={confirm}>
            {t('verify.confirm')}
          </button>
          <button className="btn-ghost sm" disabled={busy} onClick={send}>{t('verify.resend')}</button>
        </div>
      ) : (
        <button className="btn-primary sm" disabled={busy} onClick={send}>{t('verify.send')}</button>
      )}
      <button className="verify-close" title={t('verify.later')} onClick={() => setHidden(true)}>
        <Icon name="x" size={15} />
      </button>
    </div>
  )
}
