import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { fetchPlans, type PlanCard } from '@/core/api/content.api'
import { formatDate } from '@/core/utils/format'
import { useAppStore } from '@/store/app.store'
import { track } from '@/core/monitor'
import { useAuth } from '@/store/auth.store'

const DEFAULT_PLANS: PlanCard[] = [
  { id: 'monthly', name: 'Hằng tháng', tagline: 'Dùng thử linh hoạt', original: '180.000đ', price: '100.000đ', unit: '/tháng', note: 'Ưu đãi chỉ áp dụng cho lần đầu tiên', cta: 'Chọn gói tháng', days: 30, featured: false },
  { id: 'yearly', name: 'Hằng năm', tagline: 'Tiết kiệm nhất • phổ biến', original: '180.000đ/tháng', price: '59.000đ', unit: '/tháng', note: 'Tính theo năm • ưu đãi lần đầu tiên', cta: 'Chọn gói năm', days: 365, featured: true },
  { id: 'lifetime', name: 'Vĩnh viễn', tagline: 'Trả một lần, học trọn đời', original: '50.999.000đ', price: '20.299.000đ', unit: 'một lần', note: 'Ưu đãi chỉ áp dụng cho lần đầu tiên', cta: 'Sở hữu vĩnh viễn', days: 0, featured: false },
]

const DEFAULT_PERKS = [
  'Toàn bộ tính năng trong gói Miễn phí',
  'Thêm bất kỳ video yêu thích nào',
  'Truy cập toàn bộ video trong kho',
  'Hỗ trợ video dài đến 2 giờ',
  'Phiên âm 30 giờ/tháng (tải video & luyện phát âm)',
  'Luyện phát âm với AI thông minh',
  'Mở khoá các tính năng kết hợp AI',
  'Không quảng cáo',
  'Học được tất cả ngôn ngữ',
  'Hỗ trợ 4 thiết bị: web, app mobile, iPad & hơn thế nữa',
]

export default function PricingPage() {
  const { user, upgradePlus, t } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')
  const [plans, setPlans] = useState<PlanCard[]>(DEFAULT_PLANS)
  const [perks, setPerks] = useState<string[]>(DEFAULT_PERKS)

  useEffect(() => {
    fetchPlans()
      .then((r) => {
        if (r.plans?.length) setPlans(r.plans)
        if (r.perks?.length) setPerks(r.perks)
      })
      .catch(() => {})
  }, [])

  const isLifetime = user.isPlus && !user.plusUntil

  const choose = async (planId: string) => {
    track('upgrade_click', { planId, authed: isAuthed, from: 'pricing' })
    if (!isAuthed) { openAuth(); return }
    if (isLifetime) { setFlash(t('pr.alreadyLifetime')); return }
    setBusy(true)
    try {
      await upgradePlus(planId)
      track('purchase', { planId, renew: user.isPlus })
      setFlash(user.isPlus ? t('pr.renewed') : t('pr.upgraded'))
    } catch (e) {
      setFlash((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pricing">
      <div className="pricing-head">
        <span className="promo-pill"><Icon name="sparkles" size={15} /> {t('pr.promo')}</span>
        <h1>{t('pr.title')}</h1>
        <p>{t('pr.sub')}</p>
        {user.isPlus && (
          <div className="plus-active">
            <Icon name="check-circle" size={16} />
            {' '}{isLifetime ? t('pr.lifetimeActive') : t('pr.activeUntil', { date: formatDate(user.plusUntil) })}
          </div>
        )}
      </div>

      {flash && <div className="shop-flash">{flash}</div>}

      <div className="plan-grid">
        {plans.map((p) => (
          <div key={p.id} className={'plan' + (p.featured ? ' featured' : '')}>
            {p.featured && <div className="plan-flag">{t('pr.best')}</div>}
            <div className="plan-name">{p.name}</div>
            <div className="plan-tag">{p.tagline}</div>
            <div className="plan-price">
              <span className="orig">{p.original}</span>
              <div className="now">
                <b>{p.price}</b>
                <span className="unit">{p.unit}</span>
              </div>
            </div>
            <div className="plan-note">{p.note}</div>
            <button className={'plan-cta' + (p.featured ? ' primary' : '')} disabled={busy || isLifetime} onClick={() => choose(p.id)}>
              {isLifetime ? t('pr.usingPlus') : busy ? t('pr.processing') : user.isPlus ? t('pr.renew') : p.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="perks">
        <div className="perks-title"><Icon name="rocket" size={18} /> {t('pr.perksTitle')}</div>
        <ul className="perks-list">
          {perks.map((perk) => (
            <li key={perk}><Icon name="check-circle" size={17} /> {perk}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
