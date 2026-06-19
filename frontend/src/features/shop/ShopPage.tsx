import { useState } from 'react'
import Icon from '@/core/components/Icon'
import Flower from '@/core/components/Flower'
import Avatar from '@/core/components/Avatar'
import { SHOP_ITEMS } from '@/data/gamification'
import type { ShopCategory, ShopItem } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'

const CATS: { id: ShopCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả vật phẩm' },
  { id: 'seed', label: 'Hạt giống' },
  { id: 'frame', label: 'Khung viền' },
  { id: 'avatar', label: 'Hiệu ứng Avatar' },
  { id: 'badge', label: 'Huy hiệu' },
]

function ItemArt({ item }: { item: ShopItem }) {
  if (item.category === 'seed') return <Flower art={item.art} size={92} />
  if (item.category === 'frame') return <Avatar size={92} frame={item.art} initials="V" />
  if (item.category === 'avatar') return <span className={'fx-preview fx-' + item.art}><Avatar size={72} initials="V" /></span>
  return <span className={'badge-art badge-' + item.art}><Icon name={item.art === 'crown' ? 'crown' : 'star'} size={40} /></span>
}

export default function ShopPage() {
  const { user, owned, buyItem, equipFrame, setView } = useAppStore()
  const [cat, setCat] = useState<ShopCategory | 'all'>('all')
  const [tab, setTab] = useState<'shop' | 'inv'>('shop')
  const [flash, setFlash] = useState('')

  let items = SHOP_ITEMS.filter((i) => cat === 'all' || i.category === cat)
  if (tab === 'inv') items = items.filter((i) => owned.includes(i.id))

  const onBuy = (item: ShopItem) => {
    if (item.plus && !user.isPlus) {
      setView('pricing')
      return
    }
    const ok = buyItem(item.id, item.price)
    setFlash(ok ? `Đã mua "${item.name}"!` : 'Không đủ xu — hãy hoàn thành nhiệm vụ để kiếm thêm.')
    setTimeout(() => setFlash(''), 2200)
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

      {items.length === 0 ? (
        <div className="empty"><div className="big">🛍️</div>{tab === 'inv' ? 'Kho đồ trống — hãy mua vật phẩm đầu tiên!' : 'Không có vật phẩm.'}</div>
      ) : (
        <div className="shop-grid">
          {items.map((item) => {
            const isOwned = owned.includes(item.id)
            const equipped = item.category === 'frame' && user.equippedFrame === item.art
            return (
              <div key={item.id} className={'shop-item' + (item.plus ? ' is-plus' : '')}>
                {item.plus && <span className="item-plus"><Icon name="sparkles" size={11} /> PLUS</span>}
                <div className="item-art">
                  <ItemArt item={item} />
                </div>
                <div className="item-name">{item.name}</div>
                <div className="item-desc">{item.desc}</div>
                <div className="item-foot">
                  <span className="item-price"><Icon name="coin" size={16} /> {item.price}</span>
                  {isOwned ? (
                    item.category === 'frame' ? (
                      <button className={'item-btn ' + (equipped ? 'equipped' : 'equip')} onClick={() => equipFrame(equipped ? null : item.art)}>
                        {equipped ? 'Đang dùng ✓' : 'Trang bị'}
                      </button>
                    ) : (
                      <button className="item-btn owned" disabled>Đã sở hữu</button>
                    )
                  ) : (
                    <button className="item-btn buy" onClick={() => onBuy(item)}>Mua</button>
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
