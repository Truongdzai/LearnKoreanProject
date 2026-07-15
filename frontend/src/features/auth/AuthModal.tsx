import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import { useAuth } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'

export default function AuthModal() {
  const { modalOpen, closeAuth, providers, signUpEmail, signInEmail, signInOAuth, authError, clearAuthError } = useAuth()
  const { t } = useAppStore()
  const [signup, setSignup] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const hasOAuth = providers.google || providers.facebook

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuth()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, closeAuth])

  useEffect(() => {
    if (modalOpen) { setErr(''); setBusy(false) }
  }, [modalOpen, signup])

  useEffect(() => {
    if (modalOpen && authError) setErr(authError)
  }, [modalOpen, authError])

  if (!modalOpen) return null

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

  const close = () => { clearAuthError(); closeAuth() }

  return (
    <div className="auth-backdrop" onClick={close}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lookup-close auth-close" onClick={close}><Icon name="x" /></button>

        <div className="auth-head">
          <Logo size={48} />
          <h2>{t('auth.welcome')}</h2>
          <p>{t('auth.sub')}</p>
        </div>

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
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.name')} />
            </label>
          )}
          <label className="auth-field">
            <Icon name="mail" size={16} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" />
          </label>
          <label className="auth-field">
            <Icon name="lock" size={16} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder={t('auth.password')} autoComplete={signup ? 'new-password' : 'current-password'} />
          </label>
          {err && <div className="auth-err"><Icon name="x-circle" size={14} /> {err}</div>}
          <button className="btn-primary auth-submit" disabled={busy} onClick={submit}>
            {busy ? t('auth.busy') : signup ? t('auth.signup') : t('top.login')}
          </button>
          <div className="auth-switch">
            {signup ? t('auth.haveAccount') : t('auth.noAccount')}
            <button onClick={() => { setSignup(!signup); setErr('') }}>{signup ? t('top.login') : t('auth.signupNow')}</button>
          </div>
        </div>

        <button className="auth-guest" onClick={close}>{t('auth.guest')}</button>
      </div>
    </div>
  )
}
