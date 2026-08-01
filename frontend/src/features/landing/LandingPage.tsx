import { useEffect, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { track } from '@/core/monitor'
import Hero from '@/features/home/components/Hero'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { COUNTS } from '@/data/counts'

const STEPS: { n: string; icon: IconName }[] = [
  { n: '1', icon: 'play' },
  { n: '2', icon: 'cards' },
  { n: '3', icon: 'letters' },
]

const FEATURES: IconName[] = ['map', 'bulb', 'target', 'mic', 'trophy', 'sprout']

const FAQ = [1, 2, 3, 4, 5, 6]

export default function LandingPage() {
  const { setView, t } = useAppStore()
  const { openAuth } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => { track('landing_view') }, [])

  return (
    <div className="landing">
      <Hero />

      <div className="landing-stats">
        <div><b>{COUNTS.enWords.toLocaleString('vi-VN')}</b><span>{t('lp.stat.enWords')}</span></div>
        <div><b>{COUNTS.koWords}</b><span>{t('lp.stat.koWords')}</span></div>
        <div><b>{COUNTS.videos}</b><span>{t('lp.stat.videos')}</span></div>
        <div><b>{COUNTS.topikCapsules + COUNTS.enGrammar}</b><span>{t('lp.stat.grammar')}</span></div>
        <div><b>{t('lp.stat.free')}</b><span>{t('lp.stat.freeLabel')}</span></div>
      </div>

      <section className="landing-sec">
        <h2>{t('lp.how.title')}</h2>
        <p className="landing-lead">{t('lp.how.lead')}</p>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card">
              <span className="step-n">{s.n}</span>
              <div className="step-ic"><Icon name={s.icon} size={22} /></div>
              <h3>{t(`lp.step${s.n}.title`)}</h3>
              <p>{t(`lp.step${s.n}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-sec">
        <h2>{t('lp.feat.title')}</h2>
        <div className="feat-grid">
          {FEATURES.map((icon, i) => (
            <div key={icon} className="feat-card">
              <div className="feat-ic"><Icon name={icon} size={20} /></div>
              <h3>{t(`lp.feat${i + 1}.title`)}</h3>
              <p>{t(`lp.feat${i + 1}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-sec">
        <h2>{t('lp.lang.title')}</h2>
        <div className="lang-grid">
          <button className="lang-card ready" onClick={() => setView('korean')}>
            <span className="lang-flag">🇰🇷</span>
            <div>
              <b>{t('lp.lang.ko')} <span className="lang-badge">{t('lp.lang.full')}</span></b>
              <p>{t('lp.lang.koDesc', { words: COUNTS.koWords, videos: COUNTS.koVideos })}</p>
            </div>
            <Icon name="arrow-right" size={16} />
          </button>
          <button className="lang-card ready" onClick={() => setView('english')}>
            <span className="lang-flag">🇬🇧</span>
            <div>
              <b>{t('lp.lang.en')} <span className="lang-badge">{t('lp.lang.full')}</span></b>
              <p>{t('lp.lang.enDesc', { words: COUNTS.enWords, grammar: COUNTS.enGrammar, videos: COUNTS.enVideos })}</p>
            </div>
            <Icon name="arrow-right" size={16} />
          </button>
          <button className="lang-card" onClick={() => setView('library')}>
            <span className="lang-flag">🇯🇵🇨🇳🇩🇪🇻🇳</span>
            <div>
              <b>{t('lp.lang.more')} <span className="lang-badge soft">{t('lp.lang.basic')}</span></b>
              <p>{t('lp.lang.moreDesc')}</p>
            </div>
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </section>

      <section className="landing-sec">
        <h2>{t('lp.faq.title')}</h2>
        <div className="faq-list">
          {FAQ.map((n, i) => (
            <div key={n} className={'faq-item' + (openFaq === i ? ' open' : '')}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{t(`lp.faq${n}.q`)}</span>
                <Icon name={openFaq === i ? 'chevron-up' : 'chevron-down'} size={16} />
              </button>
              {openFaq === i && <p className="faq-a">{t(`lp.faq${n}.a`)}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>{t('lp.cta.title')}</h2>
        <p>{t('lp.cta.text')}</p>
        <div className="landing-cta-row">
          <button className="btn-primary lg" onClick={() => setView('library')}>
            <Icon name="film" size={16} /> {t('lp.cta.library')}
          </button>
          <button className="btn-ghost lg" onClick={openAuth}>
            <Icon name="user" size={16} /> {t('lp.cta.signup')}
          </button>
        </div>
      </section>
    </div>
  )
}
