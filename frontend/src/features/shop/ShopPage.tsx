import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Flower from '@/core/components/Flower'
import Avatar from '@/core/components/Avatar'
import Pet from '@/core/components/Pet'
import { bgVideo } from '@/core/utils/cosmetics'
import { fetchShop } from '@/core/api/content.api'
import type { ShopCategory, ShopItem } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const CATS: { id: ShopCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'shp.catAll' },
  { id: 'pet', label: 'shp.catPet' },
  { id: 'seed', label: 'shp.catSeed' },
  { id: 'frame', label: 'shp.catFrame' },
  { id: 'background', label: 'shp.catBg' },
  { id: 'avatar', label: 'shp.catFx' },
  { id: 'badge', label: 'shp.catBadge' },
]

function ItemArt({ item }: { item: ShopItem }) {
  if (item.category === 'pet') return <Pet art={item.art} size={92} mood="happy" />
  if (item.category === 'seed') return <Flower art={item.art} size={92} />
  if (item.category === 'frame')
    return <span className="frame-tile"><Avatar size={92} frame={item.art} initials="V" /></span>
  if (item.category === 'background')
    return <span className="bg-preview"><video src={bgVideo(item.art) || ''} autoPlay loop muted playsInline /></span>
  if (item.category === 'avatar') return <span className={'fx-preview fx-' + item.art}><Avatar size={72} initials="V" /></span>
  return <span className={'badge-art badge-' + item.art}><Icon name={item.art === 'crown' ? 'crown' : 'star'} size={40} /></span>
}

const MAX_SEED_BUY = 20

export default function ShopPage() {
  const { user, owned, seeds, buyItem, equipFrame, equipPet, equipBg, setView, isAuthed, t } = useAppStore()
  const { openAuth } = useAuth()
  const [items, setItems] = useState<ShopItem[]>([])
  const [cat, setCat] = useState<ShopCategory | 'all'>('pet')
  const [tab, setTab] = useState<'shop' | 'inv'>('shop')
  const [flash, setFlash] = useState('')
  const [busy, setBusy] = useState('')
  const [qty, setQty] = useState<Record<string, number>>({})

  const qtyOf = (id: string) => Math.max(1, Math.min(MAX_SEED_BUY, qty[id] ?? 1))
  const bumpQty = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(1, Math.min(MAX_SEED_BUY, (q[id] ?? 1) + d)) }))

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
    const n = item.category === 'seed' ? qtyOf(item.id) : 1
    setBusy(item.id)
    try {
      await buyItem(item.id, n)
      showFlash(n > 1 ? t('shp.boughtN', { name: item.name, n }) : t('shp.bought', { name: item.name }))
    } catch (e) {
      showFlash((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  const onEquip = async (item: ShopItem, equipped: boolean) => {
    try { await equipFrame(equipped ? null : item.art) } catch (e) { showFlash((e as Error).message) }
  }

  const onEquipBg = async (item: ShopItem, equipped: boolean) => {
    try { await equipBg(equipped ? null : item.art) } catch (e) { showFlash((e as Error).message) }
  }

  const onEquipPet = async (item: ShopItem, equipped: boolean) => {
    try {
      await equipPet(equipped ? null : item.art)
      if (!equipped) showFlash(t('shp.petWith', { name: item.name }))
    } catch (e) { showFlash((e as Error).message) }
  }

  return (
    <div className="shop">
      <div className="shop-head">
        <div>
          <h1 className="page-title"><Icon name="store" /> {t('shp.title')}</h1>
          <p className="page-sub">{t('shp.sub')}</p>
        </div>
        <div className="coin-balance"><Icon name="coin" size={20} /> {user.coins.toLocaleString('vi')}</div>
      </div>

      {!isAuthed && (
        <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>
          {t('shp.loginNote')}{' '}
          <button className="link-more" onClick={openAuth}>{t('top.login')}</button>
        </div>
      )}

      <div className="shop-toptabs">
        <button type="button" aria-pressed={tab === 'shop'} className={tab === 'shop' ? 'on' : ''} onClick={() => setTab('shop')}>{t('shp.items')}</button>
        <button type="button" aria-pressed={tab === 'inv'} className={tab === 'inv' ? 'on' : ''} onClick={() => setTab('inv')}>{t('shp.inv', { n: owned.length })}</button>
        {!user.isPlus && <button type="button" className="plus-pill" onClick={() => setView('pricing')}><Icon name="sparkles" size={13} /> {t('side.upgrade')}</button>}
      </div>

      <div className="shop-cats">
        {CATS.map((c) => (
          <button key={c.id} type="button" aria-pressed={cat === c.id} className={'shop-cat' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>{t(c.label)}</button>
        ))}
      </div>

      {flash && <div className="shop-flash">{flash}</div>}

      {view.length === 0 ? (
        <div className="empty"><div className="big"><Icon name="store" /></div>{tab === 'inv' ? t('shp.emptyInv') : t('shp.emptyShop')}</div>
      ) : (
        <div className="shop-grid">
          {view.map((item) => {
            const isSeed = item.category === 'seed'
            const isOwned = owned.includes(item.id)
            const n = qtyOf(item.id)
            const equipped = item.category === 'frame' && user.equippedFrame === item.art
            const bgEquipped = item.category === 'background' && user.equippedBg === item.art
            const isPet = item.category === 'pet'
            const petEquipped = isPet && (user.equippedPet || 'shiba') === item.art
            const canEquipPet = isPet && (isOwned || item.art === 'shiba')
            return (
              <div key={item.id} className={'shop-item' + (item.plus ? ' is-plus' : '')}>
                {item.plus && <span className="item-plus"><Icon name="sparkles" size={11} /> PLUS</span>}
                <div className="item-art">
                  <ItemArt item={item} />
                </div>
                <div className="item-name">
                  {item.name}
                  {isSeed && (seeds[item.id] ?? 0) > 0 && (
                    <em className="item-have">{t('shp.have', { n: seeds[item.id] })}</em>
                  )}
                </div>
                <div className="item-desc">{item.desc}</div>
                {isSeed && (
                  <div className="item-qty">
                    <span>{t('shp.qty')}</span>
                    <button type="button" onClick={() => bumpQty(item.id, -1)} disabled={n <= 1} aria-label={t('shp.qtyLess')}>
                      <Icon name="minus" size={13} />
                    </button>
                    <b>{n}</b>
                    <button type="button" onClick={() => bumpQty(item.id, 1)} disabled={n >= MAX_SEED_BUY} aria-label={t('shp.qtyMore')}>
                      <Icon name="plus" size={13} />
                    </button>
                    <small>{t('shp.onePerPlant')}</small>
                  </div>
                )}
                <div className="item-foot">
                  <span className="item-price">
                    {isPet && item.price === 0
                      ? <span className="item-free">{t('shp.free')}</span>
                      : <><Icon name="coin" size={16} /> {(item.price * (isSeed ? n : 1)).toLocaleString('vi')}</>}
                  </span>
                  {isPet ? (
                    canEquipPet ? (
                      <button className={'item-btn ' + (petEquipped ? 'equipped' : 'equip')} onClick={() => onEquipPet(item, petEquipped)}>
                        {petEquipped ? t('shp.petOn') : t('shp.petPick')}
                      </button>
                    ) : (
                      <button className="item-btn buy" disabled={busy === item.id} onClick={() => onBuy(item)}>
                        {busy === item.id ? '…' : t('shp.buy')}
                      </button>
                    )
                  ) : isSeed ? (
                    <button className="item-btn buy" disabled={busy === item.id} onClick={() => onBuy(item)}>
                      {busy === item.id ? '…' : t('shp.buy')}
                    </button>
                  ) : isOwned ? (
                    item.category === 'frame' ? (
                      <button className={'item-btn ' + (equipped ? 'equipped' : 'equip')} onClick={() => onEquip(item, equipped)}>
                        {equipped ? t('shp.using') : t('shp.equip')}
                      </button>
                    ) : item.category === 'background' ? (
                      <button className={'item-btn ' + (bgEquipped ? 'equipped' : 'equip')} onClick={() => onEquipBg(item, bgEquipped)}>
                        {bgEquipped ? t('shp.using') : t('shp.equip')}
                      </button>
                    ) : (
                      <button className="item-btn owned" disabled>{t('shp.owned')}</button>
                    )
                  ) : (
                    <button className="item-btn buy" disabled={busy === item.id} onClick={() => onBuy(item)}>
                      {busy === item.id ? '…' : t('shp.buy')}
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
