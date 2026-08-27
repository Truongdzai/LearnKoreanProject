import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import Flag from '@/core/components/Flag'
import { navGroupsForLang } from '@/core/constants/nav'
import { pathForView } from '@/core/constants/routes'
import { STUDY_LANGS } from '@/core/constants/languages'
import { studyLangName } from '@/core/i18n/translations'
import { refreshQuota, useQuota } from '@/core/quota'
import { track } from '@/core/monitor'

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const COLLAPSE_KEY = 'vyling.navCollapsed'

export default function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { view, setView, user, learnLang, setLearnLang, requestWizard, askGoalOnce, t, uiLang } = useAppStore()
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1' } catch { return false }
  })
  const todayIdx = (new Date().getDay() + 6) % 7
  const groups = navGroupsForLang(learnLang)
  const quota = useQuota()
  const lowMark = quota ? Math.max(5, Math.round(quota.limit * 0.2)) : 0
  const pct = quota && quota.limit > 0 ? Math.max(0, Math.min(100, (quota.left / quota.limit) * 100)) : 0

  useEffect(() => { void refreshQuota() }, [])

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0') } catch {  }
  }, [collapsed])

  const pickLang = (code: string) => {
    if (code === learnLang) return
    setLearnLang(code)
    // Hỏi mục tiêu học ĐÚNG LÚC NÀY, không hỏi ngay khi vào web: người mới
    // truy cập chưa biết VyLing là gì mà đã bị chặn bằng một câu hỏi thì rất
    // dễ thoát. Chọn ngôn ngữ xong mới hỏi thì câu hỏi có ngữ cảnh.
    // askGoalOnce tự bỏ qua nếu người dùng đã chọn hoặc đã từng được hỏi.
    askGoalOnce()
    requestWizard()
    setView('path')
    onClose?.()
  }

  return (
    <>
    {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
    <aside
      id="sidebar"
      className={'sidebar' + (open ? ' open' : '') + (collapsed ? ' collapsed' : '')}
      aria-label={t('a11y.sidebar')}
    >
      <div className="side-head">
        <button type="button" className="brand" onClick={() => { setView('home'); onClose?.() }} aria-label={t('a11y.home')}>
          <div className="brand-logo"><Logo size={38} /></div>
          <div className="name">
            <b>VyLing</b>
            <small>{t('brand.tagline')}</small>
          </div>
        </button>
        <button
          type="button"
          className="side-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={t(collapsed ? 'side.expand' : 'side.collapse')}
          aria-label={t(collapsed ? 'side.expand' : 'side.collapse')}
          aria-expanded={!collapsed}
          aria-controls="sidebar"
        >
          <Icon name="chevron-left" size={16} />
        </button>
      </div>

      <div className="side-block">
        <div className="s-label">{t('side.langs')}</div>
        <div className="lang-row">
          {STUDY_LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={
                'lang-flag-btn'
                + (learnLang === l.code ? ' on' : '')
                + (l.soon ? ' is-soon' : '')
              }
              onClick={() => (l.soon ? undefined : pickLang(l.code))}
              disabled={l.soon}
              title={
                l.soon
                  ? t('lang.soonTip', { lang: studyLangName(uiLang, l.code) })
                  : studyLangName(uiLang, l.code)
              }
              aria-label={
                l.soon
                  ? t('lang.soonTip', { lang: studyLangName(uiLang, l.code) })
                  : t('a11y.pickLang', { lang: studyLangName(uiLang, l.code) })
              }
              aria-pressed={learnLang === l.code}
            >
              <Flag code={l.code} size={24} />
              {l.soon && <span className="lang-soon-tag">{t('lang.soon')}</span>}
            </button>
          ))}
        </div>
      </div>

      <nav className="nav" aria-label={t('a11y.nav')}>
        {groups.map((g) => (
          <div
            key={g.group}
            className={'nav-div nav-div-' + g.group + (g.items.some((n) => n.id === view) ? ' open' : '')}
          >
            <div className="nav-div-tab" aria-hidden="true">
              <span>{t('side.group.' + g.group)}</span>
            </div>
            <ul className="nav-div-list">
              {g.items.map((n) => (
                <li key={n.id}>
                  <a
                    href={pathForView(n.id)}
                    className={view === n.id ? 'active' : ''}
                    aria-current={view === n.id ? 'page' : undefined}
                    title={t('nav.' + n.id)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                      e.preventDefault()
                      setView(n.id)
                      onClose?.()
                    }}
                  >
                    <span className="ic"><Icon name={n.icon} size={17} /></span>
                    <span className="lbl">{t('nav.' + n.id)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="side-foot">
      <div className="side-slip" title={t('side.streak', { n: user.streak })}>
        <div className="side-slip-head">{t('side.streak', { n: user.streak })}</div>
        <div className="side-slip-days" aria-hidden="true">
          {DAYS.map((d, i) => (
            <div key={d} className={'stamp-box' + (i <= todayIdx && i >= todayIdx - user.streak + 1 ? ' on' : '')}>
              <span className="lbl">{d}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="streak-mini" title={t('side.streak', { n: user.streak })} aria-hidden="true">
        <Icon name="flame" size={14} /><b>{user.streak}</b>
      </div>

      {quota && (
        <div
          className={'quota-meter' + (quota.left <= 0 ? ' empty' : quota.left <= lowMark ? ' low' : '')}
          title={t('side.quotaTip', { a: quota.used, b: quota.limit })}
        >
          <div className="quota-head">
            <span className="lbl">{t('side.quotaLeft', { n: quota.left })}</span>
          </div>
          <div className="quota-bar"><span style={{ width: pct + '%' }} /></div>
        </div>
      )}

      {!user.isPlus && (
        <button
          className="upgrade-btn"
          onClick={() => { track('upgrade_click', { from: 'sidebar' }); setView('pricing'); onClose?.() }}
          title={t('side.upgrade')}
        >
          <Icon name="sparkles" size={15} /> <span className="lbl">{t('side.upgrade')}</span>
        </button>
      )}
      </div>
    </aside>
    </>
  )
}
