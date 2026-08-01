import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { promptInstall, useInstallable } from '@/core/pwa'

function fileToAvatar(file: File, size = 144): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      const s = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh.')) }
    img.src = url
  })
}

export default function Topbar({ onMenu, navOpen = false }: { onMenu?: () => void; navOpen?: boolean }) {
  const { setView, openLookup, theme, toggleTheme, user, setAvatar, t, learnLangName, uiLang, setUiLang } = useAppStore()
  const { account, isAuthed, isAdmin, openAuth, signOut, openChangePw } = useAuth()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const installable = useInstallable()

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenu(false)
      accountRef.current?.querySelector<HTMLElement>('.account-btn')?.focus()
    }
    const onDown = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [menu])

  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await setAvatar(await fileToAvatar(file))
    } catch {}
  }

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn menu-btn"
        onClick={onMenu}
        title={t('top.navMenu')}
        aria-label={t('top.navMenu')}
        aria-expanded={navOpen}
        aria-controls="sidebar"
      >
        <Icon name="menu" size={20} />
      </button>

      <button type="button" className="lookup-trigger" onClick={() => openLookup()} title={t('top.lookup')} aria-label={t('top.lookup')}>
        <Icon name="vyling" size={20} />
      </button>

      <div className="search" role="search">
        <Icon name="search" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && q.trim() && openLookup(q.trim())}
          placeholder={t('top.search', { lang: learnLangName })}
          aria-label={t('top.search', { lang: learnLangName })}
        />
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="coin-pill"
          onClick={() => setView('shop')}
          title={t('top.coins')}
          aria-label={`${t('top.coins')}: ${user.coins}`}
        >
          <Icon name="coin" size={17} /> {user.coins.toLocaleString('vi')}
        </button>

        <button type="button" className="btn-myvideos" onClick={() => setView('myvideos')}>
          <Icon name="tv" size={16} /> {t('top.myvideos')}
        </button>

        {installable && (
          <button type="button" className="btn-install" onClick={() => { void promptInstall() }} title={t('top.install.hint')}>
            <Icon name="download" size={16} /> <span>{t('top.install')}</span>
          </button>
        )}

        <button
          type="button"
          className="icon-btn ui-lang-btn"
          onClick={() => setUiLang(uiLang === 'vi' ? 'en' : 'vi')}
          title={t('top.uiLang')}
          aria-label={t('top.uiLang')}
        >
          {uiLang === 'vi' ? 'VI' : 'EN'}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('top.light') : t('top.dark')}
          aria-label={theme === 'dark' ? t('top.light') : t('top.dark')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        {isAuthed ? (
          <div className="account" ref={accountRef} onMouseLeave={() => setMenu(false)}>
            <button
              type="button"
              className="account-btn"
              onClick={() => setMenu((m) => !m)}
              aria-label={t('a11y.account')}
              aria-haspopup="menu"
              aria-expanded={menu}
            >
              <Avatar size={36} frame={user.equippedFrame} src={account?.avatar} initials={account?.name?.charAt(0).toUpperCase()} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarFile} aria-hidden="true" tabIndex={-1} />
            {menu && (
              <div className="account-menu" role="menu" aria-label={t('a11y.accountMenu')}>
                <div className="account-info" role="presentation">
                  <b>{account?.name}</b>
                  <span>{account?.email || account?.phone || t('top.account')}</span>
                </div>
                <button type="button" role="menuitem" onClick={() => { setMenu(false); fileRef.current?.click() }}><Icon name="user" size={15} /> {t('top.menu.avatar')}</button>
                <button type="button" role="menuitem" onClick={() => { setMenu(false); setView('activities') }}><Icon name="chart" size={15} /> {t('top.menu.activities')}</button>
                {account?.provider === 'email' && (
                  <button type="button" role="menuitem" onClick={() => { setMenu(false); openChangePw() }}><Icon name="lock" size={15} /> {t('top.menu.password')}</button>
                )}
                <button type="button" role="menuitem" onClick={() => { setMenu(false); setView('pricing') }}><Icon name="sparkles" size={15} /> {t('top.menu.upgrade')}</button>
                {isAdmin && (
                  <button type="button" role="menuitem" onClick={() => { setMenu(false); setView('admin') }}><Icon name="settings" size={15} /> {t('top.menu.admin')}</button>
                )}
                <button type="button" role="menuitem" className="account-signout" onClick={() => { setMenu(false); signOut() }}><Icon name="logout" size={15} /> {t('top.menu.logout')}</button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" className="login-btn" onClick={openAuth}>
            <Icon name="user" size={16} /> {t('top.login')}
          </button>
        )}
      </div>
    </header>
  )
}
