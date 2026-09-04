import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Flower from '@/core/components/Flower'
import Confirm from '@/core/components/Confirm'
import { fetchShop } from '@/core/api/content.api'
import type { ShopItem } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'

function stageKey(g: number) {
  if (g >= 100) return 'gd.stBloom'
  if (g >= 70) return 'gd.stAlmost'
  if (g >= 40) return 'gd.stGrowing'
  if (g >= 20) return 'gd.stSprout'
  return 'gd.stSeed'
}

export default function GardenPage() {
  const { seeds, garden, water, plantSeed, waterPlant, removePlant, setView, t } = useAppStore()
  const [shop, setShop] = useState<ShopItem[]>([])
  const [pendingDel, setPendingDel] = useState<{ id: string; name: string } | null>(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchShop().then((r) => setShop(r.shop.filter((i) => i.category === 'seed'))).catch(() => setShop([]))
  }, [])

  const flash = (msg: string) => {
    setNote(msg)
    window.setTimeout(() => setNote(''), 3200)
  }

  const ownedSeeds = shop.filter((i) => (seeds[i.id] ?? 0) > 0)
  const bloomed = garden.filter((p) => p.growth >= 100).length
  const dry = water.left <= 0

  const onPlant = (s: ShopItem) => {
    plantSeed(s.id, s.art, s.name).catch((e: Error) => flash(e.message))
  }

  const onWater = (id: string) => {
    waterPlant(id).catch((e: Error) => flash(e.message))
  }

  const confirmDelete = () => {
    if (!pendingDel) return
    const { id } = pendingDel
    setPendingDel(null)
    removePlant(id).catch((e: Error) => flash(e.message))
  }

  return (
    <div className="garden">
      <div className="garden-head">
        <div>
          <h1 className="page-title"><Icon name="sprout" /> {t('gd.title')}</h1>
          <p className="page-sub">{t('gd.sub')}</p>
        </div>
        <dl className="srs-record garden-record">
          <div><dt>{t('gd.planting')}</dt><dd>{garden.length}</dd></div>
          <div><dt>{t('gd.bloomed')}</dt><dd>{bloomed}</dd></div>
          <div><dt>{t('gd.waterLeft')}</dt><dd>{water.left}/{water.max}</dd></div>
        </dl>
      </div>

      {note && <div className="garden-note"><Icon name="bell" size={15} /> {note}</div>}

      <div className={'garden-can' + (dry ? ' dry' : '')}>
        <Icon name="droplet" size={16} />
        <div className="gc-bar">
          <span style={{ width: `${water.max ? (water.left / water.max) * 100 : 0}%` }} />
        </div>
        <b>{t('gd.canLeft', { n: water.left, max: water.max })}</b>
        <span className="gc-hint">{dry ? t('gd.canEmpty') : t('gd.canHint')}</span>
        {dry && (
          <button className="btn-ghost sm" onClick={() => setView('quests')}>
            <Icon name="target" size={14} /> {t('gd.goQuests')}
          </button>
        )}
      </div>

      <div className="garden-seedbar">
        <span className="gs-label"><Icon name="sprout" size={15} /> {t('gd.seedsOwned')}</span>
        {ownedSeeds.length === 0 ? (
          <span className="gs-empty">{t('gd.noSeeds')} <button onClick={() => setView('shop')}>{t('gd.buyShop')}</button></span>
        ) : (
          <>
            {ownedSeeds.map((s) => (
              <button key={s.id} className="gs-seed" onClick={() => onPlant(s)}>
                <Flower art={s.art} size={28} /> {t('gd.plant', { name: s.name })}
                <em className="gs-qty">×{seeds[s.id]}</em>
              </button>
            ))}
            <button className="gs-more" onClick={() => setView('shop')}>
              <Icon name="plus" size={13} /> {t('gd.buyMore')}
            </button>
          </>
        )}
      </div>

      {garden.length === 0 ? (
        <div className="empty">
          <div className="big"><Icon name="sprout" /></div>
          {t('gd.empty')}
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={() => setView('shop')}><Icon name="store" size={15} /> {t('gd.toShop')}</button>
          </div>
        </div>
      ) : (
        <div className="garden-grid">
          {garden.map((p) => (
            <div key={p.id} className={'plant-card' + (p.growth >= 100 ? ' bloomed' : '')}>
              <button
                className="plant-del"
                title={t('gd.remove')}
                onClick={() => setPendingDel({ id: p.id, name: p.name })}
              >
                <Icon name="trash" size={14} />
              </button>
              <div className="plant-art" style={{ transform: `scale(${0.7 + (p.growth / 100) * 0.3})` }}>
                <Flower art={p.art} size={110} growth={p.growth} />
              </div>
              <div className="plant-name">{p.name}</div>
              <div className="plant-stage">{t(stageKey(p.growth))}</div>
              <div className="plant-bar"><span style={{ width: p.growth + '%' }} /></div>
              {p.growth >= 100 ? (
                <div className="plant-done"><Icon name="check-circle" size={14} /> {t('gd.done')}</div>
              ) : (
                <button className="plant-water" disabled={dry} onClick={() => onWater(p.id)}>
                  <Icon name="droplet" size={15} /> {dry ? t('gd.noWater') : t('gd.water')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="garden-tip">
        <Icon name="bulb" size={16} /> {t('gd.tip')}
      </div>

      {pendingDel && (
        <Confirm
          icon="trash"
          danger
          title={t('gd.delTitle')}
          body={t('gd.delBody', { name: pendingDel.name })}
          confirmLabel={t('gd.delYes')}
          cancelLabel={t('gd.delNo')}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDel(null)}
        />
      )}
    </div>
  )
}
