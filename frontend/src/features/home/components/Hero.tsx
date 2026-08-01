import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'

export default function Hero() {
  const { loadLesson, loadSample, t, learnLangName } = useAppStore()
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState<'youtube' | 'upload'>('youtube')

  return (
    <section className="hero">
      <div className="hero-in">
        <h1>{t('hero.title')} <Icon name="film" /></h1>
        <p>{t('hero.sub', { lang: learnLangName })}</p>

        <div className="maker">
          <div className="maker-tabs">
            <button type="button" aria-pressed={tab === 'youtube'} className={tab === 'youtube' ? 'on' : ''} onClick={() => setTab('youtube')}>
              <Icon name="play" /> YouTube
            </button>
            <button type="button" disabled title={t('hero.soon')}><Icon name="upload" /> {t('hero.upload')}</button>
          </div>
          <div className="maker-row">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadLesson(url)}
              placeholder={t('hero.placeholder', { lang: learnLangName })}
              aria-label={t('hero.placeholder', { lang: learnLangName })}
            />
            <button type="button" className="go" onClick={() => loadLesson(url)}>
              <Icon name="sparkles" /> {t('hero.create')}
            </button>
          </div>
          <p className="maker-hint">
            {t('hero.tip', { lang: learnLangName })}
            {' · '}
            <button type="button" className="link-sample" onClick={loadSample}>
              <Icon name="film" /> {t('hero.sample')}
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}
