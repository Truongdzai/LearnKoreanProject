import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import { useAuth } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'
import { changeCodeApi, changePasswordApi } from '@/core/api/auth.api'
import { useDialog } from '@/core/a11y'

export default function ChangePasswordModal() {
  const { changePwOpen, closeChangePw, applyToken, account } = useAuth()
  const { t } = useAppStore()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [done, setDone] = useState(false)

  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')

  const boxRef = useDialog<HTMLDivElement>(changePwOpen, closeChangePw)

  useEffect(() => {
    if (changePwOpen) {
      setBusy(false); setErr(''); setInfo(''); setDone(false)
      setCurrent(''); setNewPw(''); setCode(''); setCodeSent(false)
    }
  }, [changePwOpen])

  if (!changePwOpen) return null

  const email = account?.email || ''

  const sendCode = async () => {
    if (!current) { setErr(t('pw.current')); return }
    if (newPw.length < 6) { setErr(t('pw.needNew')); return }
    setBusy(true); setErr('')
    try {
      await changeCodeApi()
      setCodeSent(true)
      setInfo(t('pw.codeSent', { email }))
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const doChange = async () => {
    if (!code.trim()) { setErr(t('pw.needCode')); return }
    setBusy(true); setErr('')
    try {
      const r = await changePasswordApi(current, code.trim(), newPw)
      if (r.token) applyToken(r.token)
      setDone(true); setInfo(t('pw.changeDone'))
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-backdrop" onClick={closeChangePw}>
      <div className="auth-modal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="changepw-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lookup-close auth-close" onClick={closeChangePw} aria-label={t('a11y.close')}><Icon name="x" /></button>

        <div className="auth-head">
          <Logo size={48} />
          <h2 id="changepw-title">{t('pw.changeTitle')}</h2>
          <p>{t('pw.changeSub')}</p>
        </div>

        <div className="auth-form">
          {done ? (
            <>
              <div className="auth-info" role="status"><Icon name="check-circle" size={14} /> {info}</div>
              <button className="btn-primary auth-submit" onClick={closeChangePw}>{t('pw.backLogin')}</button>
            </>
          ) : (
            <>
              <label className="auth-field">
                <Icon name="lock" size={16} />
                <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder={t('pw.current')} aria-label={t('pw.current')} autoComplete="current-password" disabled={codeSent} />
              </label>
              <label className="auth-field">
                <Icon name="lock" size={16} />
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={t('pw.new')} aria-label={t('pw.new')} autoComplete="new-password" disabled={codeSent} />
              </label>

              {codeSent && (
                <label className="auth-field">
                  <Icon name="check-circle" size={16} />
                  <input value={code} onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doChange()} placeholder={t('pw.code')} aria-label={t('pw.code')} inputMode="numeric" maxLength={6} />
                </label>
              )}

              {info && <div className="auth-info" role="status"><Icon name="mail" size={14} /> {info}</div>}
              {err && <div className="auth-err" role="alert"><Icon name="x-circle" size={14} /> {err}</div>}

              {!codeSent ? (
                <button className="btn-primary auth-submit" disabled={busy} onClick={sendCode}>
                  {busy ? t('pw.sending') : t('pw.sendCode')}
                </button>
              ) : (
                <>
                  <button className="btn-primary auth-submit" disabled={busy} onClick={doChange}>
                    {busy ? t('auth.busy') : t('pw.confirmChange')}
                  </button>
                  <button className="auth-linkbtn" disabled={busy} onClick={sendCode}>{t('pw.resend')}</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
