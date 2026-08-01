import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { ackGiftApi } from '@/core/api/me.api'
import { useAuth } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'
import { useDialog } from '@/core/a11y'

export default function GiftModal() {
  const { pendingGift, clearPendingGift } = useAuth()
  const { t } = useAppStore()
  const [busy, setBusy] = useState(false)

  const close = async () => {
    setBusy(true)
    try { await ackGiftApi() } catch {}
    clearPendingGift()
  }

  const boxRef = useDialog<HTMLDivElement>(!!pendingGift, () => { void close() })

  if (!pendingGift) return null

  const coins = pendingGift.coins.toLocaleString('vi')
  const message = pendingGift.message?.trim() || t('gift.defaultMsg', { n: coins })

  return (
    <div className="auth-backdrop" onClick={close}>
      <div className="gift-modal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="gift-title" onClick={(e) => e.stopPropagation()}>
        <div className="gift-burst"><Icon name="gift" size={40} /></div>
        <h2 id="gift-title">{t('gift.title')}</h2>
        <div className="gift-amount">
          <Icon name="coin" size={28} /> {t('gift.amount', { n: coins })}
        </div>
        <p className="gift-msg">{message}</p>
        <button type="button" className="btn-primary gift-cta" disabled={busy} onClick={close}>
          <Icon name="heart" size={16} /> {t('gift.thanks')}
        </button>
      </div>
    </div>
  )
}
