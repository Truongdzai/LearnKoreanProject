import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import { useAuth } from '@/store/auth.store'

export default function AuthModal() {
  const { modalOpen, closeAuth, providers, signUpEmail, signInEmail, signInOAuth, authError, clearAuthError } = useAuth()
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
          <h2>Chào mừng đến VyLing</h2>
          <p>Đăng nhập để lưu tiến độ, xu, lộ trình và bảng xếp hạng của bạn.</p>
        </div>

        {hasOAuth && (
          <>
            <div className="auth-social">
              {providers.google && (
                <button className="auth-oauth" onClick={() => { clearAuthError(); signInOAuth('google') }}>
                  <Icon name="google" size={20} /> Tiếp tục với Google
                </button>
              )}
              {providers.facebook && (
                <button className="auth-oauth" onClick={() => { clearAuthError(); signInOAuth('facebook') }}>
                  <Icon name="facebook" size={20} /> Tiếp tục với Facebook
                </button>
              )}
            </div>
            <div className="auth-divider"><span>hoặc</span></div>
          </>
        )}

        <div className="auth-form">
          {signup && (
            <label className="auth-field">
              <Icon name="user" size={16} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" />
            </label>
          )}
          <label className="auth-field">
            <Icon name="mail" size={16} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" />
          </label>
          <label className="auth-field">
            <Icon name="lock" size={16} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Mật khẩu (tối thiểu 6 ký tự)" autoComplete={signup ? 'new-password' : 'current-password'} />
          </label>
          {err && <div className="auth-err"><Icon name="x-circle" size={14} /> {err}</div>}
          <button className="btn-primary auth-submit" disabled={busy} onClick={submit}>
            {busy ? 'Đang xử lý…' : signup ? 'Đăng ký' : 'Đăng nhập'}
          </button>
          <div className="auth-switch">
            {signup ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button onClick={() => { setSignup(!signup); setErr('') }}>{signup ? 'Đăng nhập' : 'Đăng ký ngay'}</button>
          </div>
        </div>

        <button className="auth-guest" onClick={close}>Tiếp tục với tư cách khách</button>
      </div>
    </div>
  )
}
