import { useEffect, useState, type MouseEvent } from 'react'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import { prefersReducedMotion } from '@/core/hooks/useReveal'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const LINKS = [
  { id: 'lp-how', key: 'lp.how.kicker' },
  { id: 'lp-why', key: 'lp.why.kicker' },
  { id: 'lp-faq', key: 'lp.faq.kicker' },
]

export default function LandingTopbar() {
  const { t, theme, toggleTheme, uiLang, setUiLang } = useAppStore()
  const { openAuth } = useAuth()
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const jump = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <header className={'lp-top' + (stuck ? ' stuck' : '')}>
      <button
        type="button"
        className="lp-top-brand"
        onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
        aria-label={t('a11y.home')}
      >
        <span className="lp-top-logo"><Logo size={38} /></span>
        <span className="lp-top-name">
          <b>VyLing</b>
          <small>{t('brand.tagline')}</small>
        </span>
      </button>

      <nav className="lp-top-nav" aria-label={t('a11y.nav')}>
        {LINKS.map((l) => (
          <a key={l.id} href={'#' + l.id} onClick={(e) => jump(e, l.id)}>{t(l.key)}</a>
        ))}
      </nav>

      <div className="lp-top-act">
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
          className="icon-btn lp-top-theme"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('top.light') : t('top.dark')}
          aria-label={theme === 'dark' ? t('top.light') : t('top.dark')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <button type="button" className="lp-top-login" onClick={openAuth}>{t('top.login')}</button>
        <button type="button" className="btn-primary lp-shine lp-top-cta" onClick={openAuth}>
          <Icon name="rocket" size={16} /> {t('lp.startFree')}
        </button>
      </div>
    </header>
  )
}
