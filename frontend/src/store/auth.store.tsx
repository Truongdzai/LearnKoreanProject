import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { env } from '@/config/env'
import { getToken, setToken } from '@/core/api/client'
import { syncUserScope, forgetUserScope } from '@/core/utils/userScope'
import { loginApi, meApi, registerApi, providersApi, type PendingGift } from '@/core/api/auth.api'
import type { Account } from '@/models/account.model'

interface Providers { google: boolean; facebook: boolean }

interface AuthStore {
  account: Account | null
  isAuthed: boolean
  isAdmin: boolean
  ready: boolean
  providers: Providers
  modalOpen: boolean
  bonusAvailable: boolean
  pendingGift: PendingGift | null
  clearPendingGift: () => void
  authError: string
  clearAuthError: () => void
  openAuth: () => void
  closeAuth: () => void
  setAccount: (a: Account) => void
  setBonusAvailable: (v: boolean) => void
  signUpEmail: (name: string, email: string, password: string) => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signInOAuth: (provider: 'google' | 'facebook') => void
  signOut: () => void
}

const AuthContext = createContext<AuthStore | null>(null)

const OAUTH_ERRORS: Record<string, string> = {
  cancelled: 'Bạn đã huỷ đăng nhập.',
  access_denied: 'Bạn đã từ chối cấp quyền.',
  '403': 'Tài khoản đã bị khoá.',
  '502': 'Không kết nối được nhà cung cấp đăng nhập. Hãy thử lại.',
}

/** Read a #token / #auth_error returned by the OAuth redirect, before anything else. */
function consumeAuthHash(): { token?: string; error?: string } {
  const hash = window.location.hash
  if (!hash || (!hash.includes('token=') && !hash.includes('auth_error='))) return {}
  const params = new URLSearchParams(hash.slice(1))
  const token = params.get('token') || undefined
  const error = params.get('auth_error') || undefined
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
  return { token, error }
}

export function AuthProviderStore({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<Account | null>(null)
  const [ready, setReady] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [bonusAvailable, setBonusAvailable] = useState(false)
  const [pendingGift, setPendingGift] = useState<PendingGift | null>(null)
  const [providers, setProviders] = useState<Providers>({ google: false, facebook: false })
  const [authError, setAuthError] = useState('')

  const setAccount = useCallback((a: Account) => setAccountState(a), [])

  useEffect(() => {
    const { token, error } = consumeAuthHash()
    if (token) setToken(token)
    if (error) setAuthError(OAUTH_ERRORS[error] || 'Đăng nhập không thành công, hãy thử lại.')

    if (!getToken()) { setReady(true); if (error) setModalOpen(true); return }
    meApi()
      .then((res) => {
        syncUserScope(res.user.id)
        setAccountState(res.user); setBonusAvailable(res.bonusAvailable); setPendingGift(res.pendingGift)
      })
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    providersApi().then(setProviders).catch(() => {})
  }, [])

  const openAuth = useCallback(() => setModalOpen(true), [])
  const closeAuth = useCallback(() => setModalOpen(false), [])
  const clearAuthError = useCallback(() => setAuthError(''), [])

  const signUpEmail = useCallback(async (name: string, email: string, password: string) => {
    const res = await registerApi(name, email, password)
    setToken(res.token)
    syncUserScope(res.user.id)
    setAccountState(res.user)
    setBonusAvailable(true)
    setModalOpen(false)
  }, [])

  const signInEmail = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password)
    setToken(res.token)
    syncUserScope(res.user.id)
    setAccountState(res.user)
    const me = await meApi().catch(() => null)
    if (me) { setBonusAvailable(me.bonusAvailable); setPendingGift(me.pendingGift); setAccountState(me.user) }
    setModalOpen(false)
  }, [])

  const clearPendingGift = useCallback(() => setPendingGift(null), [])

  const signInOAuth = useCallback((provider: 'google' | 'facebook') => {
    const returnTo = encodeURIComponent(window.location.origin)
    window.location.href = `${env.apiBase}/api/auth/${provider}/start?return_to=${returnTo}`
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    forgetUserScope()
    setAccountState(null)
    window.location.reload()
  }, [])

  const value: AuthStore = {
    account,
    isAuthed: !!account,
    isAdmin: account?.role === 'admin',
    ready,
    providers,
    modalOpen,
    bonusAvailable,
    pendingGift,
    clearPendingGift,
    authError,
    clearAuthError,
    openAuth,
    closeAuth,
    setAccount,
    setBonusAvailable,
    signUpEmail,
    signInEmail,
    signInOAuth,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải nằm trong <AuthProviderStore>')
  return ctx
}
