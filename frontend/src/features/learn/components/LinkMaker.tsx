import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'

export default function LinkMaker() {
  const { loadLesson, status, statusError, t, learnLangName } = useAppStore()
  const [url, setUrl] = useState('')

  return (
    <div className="maker">
      <div className="maker-head">
        <Icon name="play" size={15} /> {t('maker.head')}
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
      <p className="maker-hint">{t('hero.tip', { lang: learnLangName })}</p>
      {status && (
        <div className={'maker-status' + (statusError ? ' err' : '')}>
          {statusError && <Icon name="x-circle" size={15} />} {status}
        </div>
      )}
    </div>
  )
}
