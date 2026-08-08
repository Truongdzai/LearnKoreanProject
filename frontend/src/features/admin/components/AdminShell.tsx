import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Icon from '@/core/components/Icon'
import type { IconName } from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { STUDY_LANGS } from '@/core/constants/languages'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

export type Section = 'overview' | 'reports' | 'users' | 'settings'
export type SettingsTab = 'videos' | 'quests' | 'shop' | 'plans' | 'feedback' | 'audit'

export const SECTIONS: { id: Section; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Tổng quan', icon: 'home' },
  { id: 'reports', label: 'Báo cáo', icon: 'chart' },
  { id: 'users', label: 'Người dùng', icon: 'user' },
  { id: 'settings', label: 'Cài đặt', icon: 'settings' },
]

export const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'videos', label: 'Video' },
  { id: 'quests', label: 'Nhiệm vụ' },
  { id: 'shop', label: 'Cửa hàng' },
  { id: 'plans', label: 'Gói đăng ký' },
  { id: 'feedback', label: 'Phản hồi' },
  { id: 'audit', label: 'Nhật ký' },
]

export interface SearchHit {
  id: string
  group: string
  label: string
  hint?: string
  run: () => void
}

interface Props {
  section: Section
  onSection: (s: Section) => void
  settingsTab: SettingsTab
  onSettingsTab: (t: SettingsTab) => void
  badges?: Partial<Record<SettingsTab, number>>
  workspace: string
  onWorkspace: (w: string) => void
  query: string
  onQuery: (q: string) => void
  hits: SearchHit[]
  onSubmitQuery: () => void
  children: ReactNode
}

const COLLAPSE_KEY = 'vyling.admin.rail'

export default function AdminShell({
  section, onSection, settingsTab, onSettingsTab, badges = {},
  workspace, onWorkspace, query, onQuery, hits, onSubmitQuery, children,
}: Props) {
  const { setView, theme, toggleTheme } = useAppStore()
  const { account, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1' } catch { return false }
  })
  const [drawer, setDrawer] = useState(false)
  const [menu, setMenu] = useState(false)
  const [openHits, setOpenHits] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0') } catch {  }
  }, [collapsed])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false)
      if (!searchRef.current?.contains(e.target as Node)) setOpenHits(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(false); setOpenHits(false); setDrawer(false) }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const go = (s: Section) => { onSection(s); setDrawer(false) }

  const initials = (account?.name || 'A').trim().charAt(0).toUpperCase()

  return (
    <div className={'adm' + (collapsed ? ' rail-sm' : '') + (drawer ? ' drawer' : '')}>
      <div className="adm-scrim" onClick={() => setDrawer(false)} />

      <aside className="adm-rail" aria-label="Điều hướng quản trị">
        <div className="adm-brand">
          <span className="adm-brand-mark"><Icon name="vyling" size={18} /></span>
          <span className="adm-brand-text">
            <b>VyLing</b>
            <small>Bảng quản trị</small>
          </span>
          <button
            type="button" className="adm-collapse" onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          >
            <Icon name="menu" size={16} />
          </button>
        </div>

        <nav className="adm-nav">
          {SECTIONS.map((s) => (
            <div key={s.id}>
              <button
                type="button"
                className={'adm-nav-btn' + (section === s.id ? ' on' : '')}
                aria-current={section === s.id ? 'page' : undefined}
                onClick={() => go(s.id)}
                title={collapsed ? s.label : undefined}
              >
                <Icon name={s.icon} size={17} />
                <span>{s.label}</span>
              </button>
              {s.id === 'settings' && section === 'settings' && !collapsed && (
                <div className="adm-subnav">
                  {SETTINGS_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={'adm-sub-btn' + (settingsTab === t.id ? ' on' : '')}
                      aria-current={settingsTab === t.id ? 'page' : undefined}
                      onClick={() => { onSettingsTab(t.id); setDrawer(false) }}
                    >
                      {t.label}
                      {!!badges[t.id] && <em>{badges[t.id]}</em>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <button type="button" className="adm-nav-btn adm-back" onClick={() => setView('home')} title={collapsed ? 'Về trang học' : undefined}>
          <Icon name="arrow-left" size={17} />
          <span>Về trang học</span>
        </button>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <button type="button" className="adm-burger" onClick={() => setDrawer(true)} aria-label="Mở điều hướng">
            <Icon name="menu" size={18} />
          </button>

          <label className="adm-ws" title="Không gian nội dung">
            <Icon name="globe" size={15} />
            <span className="sr-only">Không gian làm việc</span>
            <select value={workspace} onChange={(e) => onWorkspace(e.target.value)}>
              <option value="">Toàn hệ thống</option>
              {STUDY_LANGS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <Icon name="chevron-down" size={14} />
          </label>

          <div className="adm-search" ref={searchRef}>
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={(e) => { onQuery(e.target.value); setOpenHits(true) }}
              onFocus={() => setOpenHits(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setOpenHits(false); onSubmitQuery() } }}
              placeholder="Tìm người dùng, video, nhiệm vụ, vật phẩm…"
              aria-label="Tìm kiếm toàn hệ thống"
            />
            {!!query && (
              <button type="button" className="adm-search-x" onClick={() => onQuery('')} aria-label="Xoá tìm kiếm">
                <Icon name="x" size={14} />
              </button>
            )}
            {openHits && query.trim().length > 0 && (
              <div className="adm-hits" role="listbox" aria-label="Kết quả tìm kiếm">
                {hits.length === 0 && <p className="adm-hits-empty">Không có kết quả cho “{query}”.</p>}
                {hits.map((h) => (
                  <button key={h.id} type="button" onClick={() => { setOpenHits(false); h.run() }}>
                    <em>{h.group}</em>
                    <b>{h.label}</b>
                    {h.hint && <small>{h.hint}</small>}
                  </button>
                ))}
                <button type="button" className="adm-hits-all" onClick={() => { setOpenHits(false); onSubmitQuery() }}>
                  Tìm “{query}” trong danh sách người dùng
                </button>
              </div>
            )}
          </div>

          <button type="button" className="adm-icon-btn" onClick={toggleTheme} aria-label="Đổi giao diện sáng/tối" title="Đổi giao diện sáng/tối">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>

          <div className="adm-account" ref={menuRef}>
            <button type="button" className="adm-account-btn" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-haspopup="menu">
              <Avatar size={28} src={account?.avatar} initials={initials} />
              <span>{account?.name}</span>
              <Icon name="chevron-down" size={14} />
            </button>
            {menu && (
              <div className="adm-menu" role="menu">
                <div className="adm-menu-head">
                  <b>{account?.name}</b>
                  <small>{account?.email || account?.phone || 'Quản trị viên'}</small>
                </div>
                <button type="button" role="menuitem" onClick={() => { setMenu(false); setView('home') }}>
                  <Icon name="home" size={15} /> Về trang học
                </button>
                <button type="button" role="menuitem" onClick={() => { setMenu(false); setView('activities') }}>
                  <Icon name="chart" size={15} /> Hoạt động của tôi
                </button>
                <button type="button" role="menuitem" className="danger" onClick={() => { setMenu(false); signOut() }}>
                  <Icon name="logout" size={15} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="adm-body" id="main" tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}
