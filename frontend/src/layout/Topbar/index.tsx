import { useRef, useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'

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

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { setView, openLookup, theme, toggleTheme, user, setAvatar, t, learnLangName, uiLang, setUiLang } = useAppStore()
  const { account, isAuthed, isAdmin, openAuth, signOut } = useAuth()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await setAvatar(await fileToAvatar(file))
    } catch { /* giữ ảnh cũ nếu đọc/lưu lỗi */ }
  }

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} title={t('top.navMenu')}>
        <Icon name="menu" size={20} />
      </button>

      <button className="lookup-trigger" onClick={() => openLookup()} title={t('top.lookup')}>
        <Icon name="vyling" size={20} />
      </button>

      <div className="search">
        <Icon name="search" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && q.trim() && openLookup(q.trim())}
          placeholder={t('top.search', { lang: learnLangName })}
        />
      </div>

      <div className="topbar-actions">
        <button className="coin-pill" onClick={() => setView('shop')} title={t('top.coins')}>
          <Icon name="coin" size={17} /> {user.coins.toLocaleString('vi')}
        </button>

        <button className="btn-myvideos" onClick={() => setView('myvideos')}>
          <Icon name="tv" size={16} /> {t('top.myvideos')}
        </button>

        <button
          className="icon-btn ui-lang-btn"
          onClick={() => setUiLang(uiLang === 'vi' ? 'en' : 'vi')}
          title={t('top.uiLang')}
        >
          {uiLang === 'vi' ? 'VI' : 'EN'}
        </button>

        <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? t('top.light') : t('top.dark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        {isAuthed ? (
          <div className="account" onMouseLeave={() => setMenu(false)}>
            <button className="account-btn" onClick={() => setMenu((m) => !m)}>
              <Avatar size={36} frame={user.equippedFrame} src={account?.avatar} initials={account?.name?.charAt(0).toUpperCase()} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />
            {menu && (
              <div className="account-menu">
                <div className="account-info">
                  <b>{account?.name}</b>
                  <span>{account?.email || account?.phone || t('top.account')}</span>
                </div>
                <button onClick={() => { setMenu(false); fileRef.current?.click() }}><Icon name="user" size={15} /> {t('top.menu.avatar')}</button>
                <button onClick={() => { setMenu(false); setView('activities') }}><Icon name="chart" size={15} /> {t('top.menu.activities')}</button>
                <button onClick={() => { setMenu(false); setView('pricing') }}><Icon name="sparkles" size={15} /> {t('top.menu.upgrade')}</button>
                {isAdmin && (
                  <button onClick={() => { setMenu(false); setView('admin') }}><Icon name="settings" size={15} /> {t('top.menu.admin')}</button>
                )}
                <button className="account-signout" onClick={() => { setMenu(false); signOut() }}><Icon name="logout" size={15} /> {t('top.menu.logout')}</button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={openAuth}>
            <Icon name="user" size={16} /> {t('top.login')}
          </button>
        )}
      </div>
    </header>
  )
}
