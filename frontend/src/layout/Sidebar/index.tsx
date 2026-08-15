import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import Flag from '@/core/components/Flag'
import { navForLang } from '@/core/constants/nav'
import { pathForView } from '@/core/constants/routes'
import { STUDY_LANGS } from '@/core/constants/languages'
import { studyLangName } from '@/core/i18n/translations'

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const COLLAPSE_KEY = 'vyling.navCollapsed'

export default function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { view, setView, user, learnLang, setLearnLang, requestWizard, askGoalOnce, t, uiLang } = useAppStore()
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1' } catch { return false }
  })
  const todayIdx = (new Date().getDay() + 6) % 7
  const nav = navForLang(learnLang)

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
          <div className="brand-logo"><Logo size={42} /></div>
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
        <div className="s-label"><Icon name="flame" size={12} /> {t('side.streak', { n: user.streak })}</div>
        <div className="streak" role="img" aria-label={t('a11y.streak', { n: user.streak })}>
          <div className="streak-days" aria-hidden="true">
            {DAYS.map((d, i) => (
              <div key={d} className={'day' + (i <= todayIdx && i >= todayIdx - user.streak + 1 ? ' on' : '')}>
                <span className="star"><Icon name="star" size={14} /></span>
                <span className="lbl">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="streak-mini" title={t('side.streak', { n: user.streak })} aria-hidden="true">
          <Icon name="flame" size={14} /><b>{user.streak}</b>
        </div>
      </div>

      <div className="side-block">
        <div className="s-label"><Icon name="globe" size={12} /> {t('side.langs')}</div>
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
              <Flag code={l.code} size={26} />
              {l.soon && <span className="lang-soon-tag">{t('lang.soon')}</span>}
            </button>
          ))}
        </div>
      </div>

      <nav className="nav" aria-label={t('a11y.nav')}>
        {nav.map((n) => (
          <a
            key={n.id}
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
            <span className="ic"><Icon name={n.icon} size={19} /></span>
            <span className="lbl">{t('nav.' + n.id)}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      {!user.isPlus && (
        <button
          className="upgrade-btn"
          onClick={() => { setView('pricing'); onClose?.() }}
          title={t('side.upgrade')}
        >
          <Icon name="sparkles" size={16} /> <span className="lbl">{t('side.upgrade')}</span>
        </button>
      )}
    </aside>
    </>
  )
}
