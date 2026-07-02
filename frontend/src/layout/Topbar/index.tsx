import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'

export default function Topbar() {
  const { setView, openLookup, theme, toggleTheme, user, t, learnLangName, uiLang, setUiLang } = useAppStore()
  const { account, isAuthed, isAdmin, openAuth, signOut } = useAuth()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)

  return (
    <header className="topbar">
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
              <Avatar size={36} frame={user.equippedFrame} initials={account?.name?.charAt(0).toUpperCase()} />
            </button>
            {menu && (
              <div className="account-menu">
                <div className="account-info">
                  <b>{account?.name}</b>
                  <span>{account?.email || account?.phone || 'Tài khoản VyLing'}</span>
                </div>
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
