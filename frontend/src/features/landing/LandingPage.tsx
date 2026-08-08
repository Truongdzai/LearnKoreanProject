import { useEffect, useState, type CSSProperties } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { track } from '@/core/monitor'
import { useReveal } from '@/core/hooks/useReveal'
import Marquee from './components/Marquee'
import ScoreDemo from './components/ScoreDemo'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const WHY: { id: string; icon: IconName }[] = [
  { id: 'why1', icon: 'letters' },
  { id: 'why2', icon: 'chart' },
  { id: 'why3', icon: 'clock' },
]

const FEATS: { n: number; icon: IconName }[] = [
  { n: 1, icon: 'map' },
  { n: 2, icon: 'bulb' },
  { n: 3, icon: 'target' },
  { n: 4, icon: 'mic' },
  { n: 5, icon: 'trophy' },
  { n: 6, icon: 'flame' },
]

const GREETS = [
  { txt: '안녕하세요!', cls: 'g1' },
  { txt: 'Hello there!', cls: 'g2' },
  { txt: 'こんにちは！', cls: 'g3' },
  { txt: '你好！', cls: 'g4' },
]

const MQ1 = ['YouTube', '@news', 'Podcast', '@movie', 'K-pop', '@vlog', 'TED Talk', '@travel']
const MQ2 = ['Anime', '@interview', '@kdrama', '@cook', '@business', '@study', 'Talkshow', '@sport']

const STEPS = ['1', '2', '3']
const FAQ = [1, 2, 3, 4, 5, 6]

const d = (ms: number) => ({ '--d': `${ms}ms` } as CSSProperties)

export default function LandingPage() {
  const { setView, t } = useAppStore()
  const { openAuth } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const reveal = useReveal<HTMLDivElement>()
  const mq = (x: string) => (x.startsWith('@') ? t('lp.mq.' + x.slice(1)) : x)

  useEffect(() => { track('landing_view') }, [])

  return (
    <div className="lp" ref={reveal}>
      <section className="lp-hero">
        <div className="lp-blobs" aria-hidden="true">
          <span className="lp-blob b1" /><span className="lp-blob b2" /><span className="lp-blob b3" />
        </div>

        <div className="lp-hero-txt">
          <span className="lp-badge" data-rv style={d(0)}>
            <Icon name="sparkles" size={13} /> {t('lp.badge')}
          </span>
          <h1 data-rv style={d(90)}>{t('lp.h1a')} <span className="lp-grad">{t('lp.h1b')}</span></h1>
          <p className="lp-lead" data-rv style={d(180)}>{t('lp.heroSub')}</p>
          <div className="lp-hero-cta" data-rv style={d(270)}>
            <button className="btn-primary lg lp-shine" onClick={openAuth}>
              <Icon name="rocket" size={16} /> {t('lp.startFree')}
            </button>
            <button className="btn-ghost lg" onClick={() => setView('library')}>
              <Icon name="play" size={16} /> {t('lp.tryNow')}
            </button>
          </div>
          <ul className="lp-trust" data-rv style={d(360)}>
            <li><Icon name="check-circle" size={14} /> {t('lp.trust1')}</li>
            <li><Icon name="check-circle" size={14} /> {t('lp.trust2')}</li>
            <li><Icon name="check-circle" size={14} /> {t('lp.trust3')}</li>
          </ul>
        </div>

        <div className="lp-hero-art" data-rv="left" style={d(240)}>
          <ScoreDemo />
          <span className="lp-greets" aria-hidden="true">
            {GREETS.map((g) => <b key={g.cls} className={'lp-greet ' + g.cls}>{g.txt}</b>)}
          </span>
        </div>
      </section>

      <section className="lp-mq" data-rv>
        <span className="lp-kicker">{t('lp.mq.title')}</span>
        <Marquee items={MQ1.map(mq)} speed={38} />
        <Marquee items={MQ2.map(mq)} speed={46} reverse />
      </section>

      <section className="lp-sec" id="lp-how">
        <span className="lp-kicker" data-rv>{t('lp.how.kicker')}</span>
        <h2 data-rv style={d(60)}>{t('lp.how.title')}</h2>
        <p className="lp-seclead" data-rv style={d(120)}>{t('lp.how.lead')}</p>
        <ol className="lp-steps">
          {STEPS.map((n, i) => (
            <li key={n} data-rv style={d(140 * i)}>
              <span className="lp-step-n">{n}</span>
              <b>{t(`lp.step${n}.title`)}</b>
              <p>{t(`lp.step${n}.desc`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="lp-sec" id="lp-why">
        <span className="lp-kicker" data-rv>{t('lp.why.kicker')}</span>
        <h2 data-rv style={d(60)}>{t('lp.why.title')}</h2>
        <div className="lp-why">
          {WHY.map((w, i) => (
            <article key={w.id} data-rv style={d(120 * i)}>
              <span className="lp-why-ic"><Icon name={w.icon} size={20} /></span>
              <span className="lp-why-tag">{t(`lp.${w.id}.tag`)}</span>
              <h3>{t(`lp.${w.id}.title`)}</h3>
              <p>{t(`lp.${w.id}.desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-sec">
        <span className="lp-kicker" data-rv>{t('lp.feat.kicker')}</span>
        <h2 data-rv style={d(60)}>{t('lp.feat.title')}</h2>
        <div className="lp-feats">
          {FEATS.map((f, i) => (
            <article key={f.n} data-rv style={d(70 * i)}>
              <span className="lp-feat-ic"><Icon name={f.icon} size={19} /></span>
              <div>
                <b>{t(`lp.feat${f.n}.title`)}</b>
                <p>{t(`lp.feat${f.n}.desc`)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-final" data-rv="scale">
        <span className="lp-final-glow" aria-hidden="true" />
        <h2>{t('lp.cta.title')}</h2>
        <p>{t('lp.cta.text')}</p>
        <div className="lp-final-row">
          <button className="btn-primary lg lp-shine" onClick={() => setView('library')}>
            <Icon name="play" size={16} /> {t('lp.cta.library')}
          </button>
          <button className="btn-ghost lg" onClick={openAuth}>
            <Icon name="user" size={16} /> {t('lp.cta.signup')}
          </button>
        </div>
      </section>

      <section className="lp-sec" id="lp-faq">
        <span className="lp-kicker" data-rv>{t('lp.faq.kicker')}</span>
        <h2 data-rv style={d(60)}>{t('lp.faq.title')}</h2>
        <div className="lp-faq">
          {FAQ.map((n, i) => (
            <div key={n} className={'lp-faq-item' + (openFaq === i ? ' open' : '')} data-rv style={d(50 * i)}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{t(`lp.faq${n}.q`)}</span>
                <Icon name="chevron-down" size={16} />
              </button>
              <div className="lp-faq-a"><p>{t(`lp.faq${n}.a`)}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
