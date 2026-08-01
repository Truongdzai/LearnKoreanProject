import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { needsConsent, onConsentChange, setConsent } from '@/core/analytics'
import { useAppStore } from '@/store/app.store'

export default function ConsentBar() {
  const { t, setView } = useAppStore()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(needsConsent())
    return onConsentChange((needsAsk) => setShow(needsAsk))
  }, [])

  if (!show) return null

  const answer = (agree: boolean) => {
    setConsent(agree)
    setShow(false)
  }

  return (
    <div className="consent-bar" role="dialog" aria-label={t('consent.title')}>
      <span className="consent-ic"><Icon name="chart" size={18} /></span>
      <div className="consent-text">
        <b>{t('consent.title')}</b>
        <span>
          {t('consent.body')}{' '}
          <button className="link-more" onClick={() => setView('privacy')}>{t('consent.readMore')}</button>
        </span>
      </div>
      <div className="consent-actions">
        <button className="btn-ghost sm" onClick={() => answer(false)}>{t('consent.decline')}</button>
        <button className="btn-primary sm" onClick={() => answer(true)}>{t('consent.accept')}</button>
      </div>
    </div>
  )
}
