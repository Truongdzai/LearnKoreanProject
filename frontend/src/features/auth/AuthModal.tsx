import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import { useAuth } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'
import { forgotPasswordApi, resetPasswordApi } from '@/core/api/auth.api'
import { useDialog } from '@/core/a11y'

type Mode = 'login' | 'signup' | 'forgot'

export default function AuthModal() {
  const { modalOpen, closeAuth, providers, signUpEmail, signInEmail, signInOAuth, authError, clearAuthError } = useAuth()
  const { t } = useAppStore()
  const [mode, setMode] = useState<Mode>('login')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const hasOAuth = providers.google || providers.facebook

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [newPw, setNewPw] = useState('')

  const boxRef = useDialog<HTMLDivElement>(modalOpen, closeAuth)

  useEffect(() => {
    if (modalOpen) { setErr(''); setInfo(''); setBusy(false); setMode('login') }
  }, [modalOpen])

  useEffect(() => {
    if (modalOpen && authError) setErr(authError)
  }, [modalOpen, authError])

  if (!modalOpen) return null

  const signup = mode === 'signup'

  const submit = async () => {
    setBusy(true); setErr('')
    try {
      if (signup) await signUpEmail(name, email, password)
      else await signInEmail(email, password)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const sendCode = async () => {
    if (!email.trim()) { setErr(t('pw.email')); return }
    setBusy(true); setErr('')
    try {
      await forgotPasswordApi(email.trim())
      setCodeSent(true)
      setInfo(t('pw.codeSent', { email: email.trim() }))
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const doReset = async () => {
    if (newPw.length < 6) { setErr(t('pw.needNew')); return }
    if (!code.trim()) { setErr(t('pw.needCode')); return }
    setBusy(true); setErr('')
    try {
      await resetPasswordApi(email.trim(), code.trim(), newPw)
      backToLogin(t('pw.resetDone'))
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const backToLogin = (msg = '') => {
    setMode('login'); setCodeSent(false); setCode(''); setNewPw(''); setPassword('')
    setErr(''); setInfo(msg)
  }

  const close = () => { clearAuthError(); backToLogin(); closeAuth() }

  return (
    <div className="auth-backdrop" onClick={close}>
      <div className="auth-modal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lookup-close auth-close" onClick={close} aria-label={t('a11y.close')}><Icon name="x" /></button>

        <div className="auth-head">
          <Logo size={48} />
          <h2 id="auth-title">{mode === 'forgot' ? t('pw.forgotTitle') : t('auth.welcome')}</h2>
          <p>{mode === 'forgot' ? t('pw.forgotSub') : t('auth.sub')}</p>
        </div>

        {mode === 'forgot' ? (
          <div className="auth-form">
            <label className="auth-field">
              <Icon name="mail" size={16} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('pw.email')} aria-label={t('pw.email')} autoComplete="email" disabled={codeSent} />
            </label>

            {codeSent && (
              <>
                <label className="auth-field">
                  <Icon name="check-circle" size={16} />
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('pw.code')} aria-label={t('pw.code')} inputMode="numeric" maxLength={6} />
                </label>
                <label className="auth-field">
                  <Icon name="lock" size={16} />
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doReset()} placeholder={t('pw.new')} aria-label={t('pw.new')} autoComplete="new-password" />
                </label>
              </>
            )}

            {info && <div className="auth-info" role="status"><Icon name="mail" size={14} /> {info}</div>}
            {err && <div className="auth-err" role="alert"><Icon name="x-circle" size={14} /> {err}</div>}

            {!codeSent ? (
              <button className="btn-primary auth-submit" disabled={busy} onClick={sendCode}>
                {busy ? t('pw.sending') : t('pw.sendCode')}
              </button>
            ) : (
              <>
                <button className="btn-primary auth-submit" disabled={busy} onClick={doReset}>
                  {busy ? t('auth.busy') : t('pw.confirmReset')}
                </button>
                <button className="auth-linkbtn" disabled={busy} onClick={sendCode}>{t('pw.resend')}</button>
              </>
            )}

            <div className="auth-switch">
              <button onClick={() => backToLogin()}><Icon name="arrow-left" size={13} /> {t('pw.backLogin')}</button>
            </div>
          </div>
        ) : (
          <>
            {hasOAuth && (
              <>
                <div className="auth-social">
                  {providers.google && (
                    <button className="auth-oauth" onClick={() => { clearAuthError(); signInOAuth('google') }}>
                      <Icon name="google" size={20} /> {t('auth.google')}
                    </button>
                  )}
                  {providers.facebook && (
                    <button className="auth-oauth" onClick={() => { clearAuthError(); signInOAuth('facebook') }}>
                      <Icon name="facebook" size={20} /> {t('auth.facebook')}
                    </button>
                  )}
                </div>
                <div className="auth-divider"><span>{t('auth.or')}</span></div>
              </>
            )}

            <div className="auth-form">
              {signup && (
                <label className="auth-field">
                  <Icon name="user" size={16} />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.name')} aria-label={t('auth.name')} />
                </label>
              )}
              <label className="auth-field">
                <Icon name="mail" size={16} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" autoComplete="email" />
              </label>
              <label className="auth-field">
                <Icon name="lock" size={16} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder={t('auth.password')} aria-label={t('auth.password')} autoComplete={signup ? 'new-password' : 'current-password'} />
              </label>
              {!signup && (
                <button className="auth-forgot" onClick={() => { setMode('forgot'); setInfo(''); setErr('') }}>{t('auth.forgot')}</button>
              )}
              {info && <div className="auth-info" role="status"><Icon name="check-circle" size={14} /> {info}</div>}
              {err && <div className="auth-err" role="alert"><Icon name="x-circle" size={14} /> {err}</div>}
              <button className="btn-primary auth-submit" disabled={busy} onClick={submit}>
                {busy ? t('auth.busy') : signup ? t('auth.signup') : t('top.login')}
              </button>
              <div className="auth-switch">
                {signup ? t('auth.haveAccount') : t('auth.noAccount')}
                <button onClick={() => { setMode(signup ? 'login' : 'signup'); setErr('') }}>{signup ? t('top.login') : t('auth.signupNow')}</button>
              </div>
            </div>

            <button className="auth-guest" onClick={close}>{t('auth.guest')}</button>
          </>
        )}
      </div>
    </div>
  )
}
