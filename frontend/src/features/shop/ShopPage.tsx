import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Flower from '@/core/components/Flower'
import Avatar from '@/core/components/Avatar'
import Pet from '@/core/components/Pet'
import { fetchShop } from '@/core/api/content.api'
import type { ShopCategory, ShopItem } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const CATS: { id: ShopCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả vật phẩm' },
  { id: 'pet', label: 'Thú cưng' },
  { id: 'seed', label: 'Hạt giống' },
  { id: 'frame', label: 'Khung viền' },
  { id: 'avatar', label: 'Hiệu ứng Avatar' },
  { id: 'badge', label: 'Huy hiệu' },
]

function ItemArt({ item }: { item: ShopItem }) {
  if (item.category === 'pet') return <Pet art={item.art} size={92} mood="happy" />
  if (item.category === 'seed') return <Flower art={item.art} size={92} />
  if (item.category === 'frame') return <Avatar size={92} frame={item.art} initials="V" />
  if (item.category === 'avatar') return <span className={'fx-preview fx-' + item.art}><Avatar size={72} initials="V" /></span>
  return <span className={'badge-art badge-' + item.art}><Icon name={item.art === 'crown' ? 'crown' : 'star'} size={40} /></span>
}

export default function ShopPage() {
  const { user, owned, buyItem, equipFrame, equipPet, setView, isAuthed } = useAppStore()
  const { openAuth } = useAuth()
  const [items, setItems] = useState<ShopItem[]>([])
  const [cat, setCat] = useState<ShopCategory | 'all'>('pet')
  const [tab, setTab] = useState<'shop' | 'inv'>('shop')
  const [flash, setFlash] = useState('')
  const [busy, setBusy] = useState('')

  useEffect(() => {
    fetchShop().then((r) => setItems(r.shop)).catch(() => setItems([]))
  }, [])

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2400)
  }

  let view = items.filter((i) => cat === 'all' || i.category === cat)
  if (tab === 'inv') view = view.filter((i) => owned.includes(i.id))

  const onBuy = async (item: ShopItem) => {
    if (item.plus && !user.isPlus) {
      setView('pricing')
      return
    }
    setBusy(item.id)
    try {
      await buyItem(item.id)
      showFlash(`Đã mua "${item.name}"!`)
    } catch (e) {
      showFlash((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  const onEquip = async (item: ShopItem, equipped: boolean) => {
    try { await equipFrame(equipped ? null : item.art) } catch (e) { showFlash((e as Error).message) }
  }

  const onEquipPet = async (item: ShopItem, equipped: boolean) => {
    try {
      await equipPet(equipped ? null : item.art)
      if (!equipped) showFlash(`${item.name} đang đồng hành cùng bạn!`)
    } catch (e) { showFlash((e as Error).message) }
  }

  return (
    <div className="shop">
      <div className="shop-head">
        <div>
          <h1 className="page-title"><Icon name="store" /> Cửa hàng</h1>
          <p className="page-sub">Dùng xu kiếm từ nhiệm vụ học để mua hạt giống, khung viền & hiệu ứng.</p>
        </div>
        <div className="coin-balance"><Icon name="coin" size={20} /> {user.coins.toLocaleString('vi')}</div>
      </div>

      {!isAuthed && (
        <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>
          Đăng nhập để mua vật phẩm và lưu kho đồ của bạn.{' '}
          <button className="link-more" onClick={openAuth}>Đăng nhập</button>
        </div>
      )}

      <div className="shop-toptabs">
        <button className={tab === 'shop' ? 'on' : ''} onClick={() => setTab('shop')}>Vật phẩm</button>
        <button className={tab === 'inv' ? 'on' : ''} onClick={() => setTab('inv')}>Kho đồ ({owned.length})</button>
        {!user.isPlus && <button className="plus-pill" onClick={() => setView('pricing')}><Icon name="sparkles" size={13} /> Nâng cấp Plus</button>}
      </div>

      <div className="shop-cats">
        {CATS.map((c) => (
          <button key={c.id} className={'shop-cat' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>{c.label}</button>
        ))}
      </div>

      {flash && <div className="shop-flash">{flash}</div>}

      {view.length === 0 ? (
        <div className="empty"><div className="big">🛍️</div>{tab === 'inv' ? 'Kho đồ trống — hãy mua vật phẩm đầu tiên!' : 'Không có vật phẩm.'}</div>
      ) : (
        <div className="shop-grid">
          {view.map((item) => {
            const isOwned = owned.includes(item.id)
            const equipped = item.category === 'frame' && user.equippedFrame === item.art
            const isPet = item.category === 'pet'
            const petEquipped = isPet && (user.equippedPet || 'shiba') === item.art
            const canEquipPet = isPet && (isOwned || item.art === 'shiba')
            return (
              <div key={item.id} className={'shop-item' + (item.plus ? ' is-plus' : '')}>
                {item.plus && <span className="item-plus"><Icon name="sparkles" size={11} /> PLUS</span>}
                <div className="item-art">
                  <ItemArt item={item} />
                </div>
                <div className="item-name">{item.name}</div>
                <div className="item-desc">{item.desc}</div>
                <div className="item-foot">
                  <span className="item-price">
                    {isPet && item.price === 0 ? <span className="item-free">Miễn phí</span> : <><Icon name="coin" size={16} /> {item.price}</>}
                  </span>
                  {isPet ? (
                    canEquipPet ? (
                      <button className={'item-btn ' + (petEquipped ? 'equipped' : 'equip')} onClick={() => onEquipPet(item, petEquipped)}>
                        {petEquipped ? 'Đang nuôi ✓' : 'Chọn nuôi'}
                      </button>
                    ) : (
                      <button className="item-btn buy" disabled={busy === item.id} onClick={() => onBuy(item)}>
                        {busy === item.id ? '…' : 'Mua'}
                      </button>
                    )
                  ) : isOwned ? (
                    item.category === 'frame' ? (
                      <button className={'item-btn ' + (equipped ? 'equipped' : 'equip')} onClick={() => onEquip(item, equipped)}>
                        {equipped ? 'Đang dùng ✓' : 'Trang bị'}
                      </button>
                    ) : (
                      <button className="item-btn owned" disabled>Đã sở hữu</button>
                    )
                  ) : (
                    <button className="item-btn buy" disabled={busy === item.id} onClick={() => onBuy(item)}>
                      {busy === item.id ? '…' : 'Mua'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
