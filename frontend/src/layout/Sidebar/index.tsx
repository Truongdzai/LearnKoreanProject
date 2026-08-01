import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import Flag from '@/core/components/Flag'
import { navForLang } from '@/core/constants/nav'
import { pathForView } from '@/core/constants/routes'
import { STUDY_LANGS } from '@/core/constants/languages'
import { studyLangName } from '@/core/i18n/translations'

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { view, setView, user, learnLang, setLearnLang, requestWizard, t, uiLang } = useAppStore()
  const todayIdx = (new Date().getDay() + 6) % 7
  const nav = navForLang(learnLang)

  const pickLang = (code: string) => {
    if (code === learnLang) return
    setLearnLang(code)
    requestWizard()
    setView('path')
    onClose?.()
  }

  return (
    <>
    {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
    <aside id="sidebar" className={'sidebar' + (open ? ' open' : '')} aria-label={t('a11y.sidebar')}>
      <button type="button" className="brand" onClick={() => { setView('home'); onClose?.() }} aria-label={t('a11y.home')}>
        <div className="brand-logo"><Logo size={42} /></div>
        <div className="name">
          <b>VyLing</b>
          <small>{t('brand.tagline')}</small>
        </div>
      </button>

      <div>
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
      </div>

      <div>
        <div className="s-label"><Icon name="globe" size={12} /> {t('side.langs')}</div>
        <div className="lang-row">
          {STUDY_LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={'lang-flag-btn' + (learnLang === l.code ? ' on' : '')}
              onClick={() => pickLang(l.code)}
              title={studyLangName(uiLang, l.code)}
              aria-label={t('a11y.pickLang', { lang: studyLangName(uiLang, l.code) })}
              aria-pressed={learnLang === l.code}
            >
              <Flag code={l.code} size={26} />
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
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
              e.preventDefault()
              setView(n.id)
              onClose?.()
            }}
          >
            <span className="ic"><Icon name={n.icon} size={19} /></span> {t('nav.' + n.id)}
          </a>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      {!user.isPlus && (
        <button className="upgrade-btn" onClick={() => { setView('pricing'); onClose?.() }}>
          <Icon name="sparkles" size={16} /> {t('side.upgrade')}
        </button>
      )}
    </aside>
    </>
  )
}
