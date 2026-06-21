import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { ackGiftApi } from '@/core/api/me.api'
import { useAuth } from '@/store/auth.store'

export default function GiftModal() {
  const { pendingGift, clearPendingGift } = useAuth()
  const [busy, setBusy] = useState(false)

  if (!pendingGift) return null

  const coins = pendingGift.coins.toLocaleString('vi')
  const message = pendingGift.message?.trim()
    || `Cảm ơn sự cố gắng của bạn, vì vậy admin tặng bạn ${coins} xu — hãy tiếp tục giữ lửa nhé, fighting! 🔥`

  const close = async () => {
    setBusy(true)
    try { await ackGiftApi() } catch { /* ignore */ }
    clearPendingGift()
  }

  return (
    <div className="auth-backdrop" onClick={close}>
      <div className="gift-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gift-burst"><Icon name="gift" size={40} /></div>
        <h2>Quà tặng từ Quản trị viên</h2>
        <div className="gift-amount">
          <Icon name="coin" size={28} /> +{coins} xu
        </div>
        <p className="gift-msg">{message}</p>
        <button className="btn-primary gift-cta" disabled={busy} onClick={close}>
          <Icon name="heart" size={16} /> Cảm ơn admin
        </button>
      </div>
    </div>
  )
}
