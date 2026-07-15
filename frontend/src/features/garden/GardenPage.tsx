import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Flower from '@/core/components/Flower'
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
  const { owned, garden, plantSeed, waterPlant, removePlant, setView, t } = useAppStore()
  const [seeds, setSeeds] = useState<ShopItem[]>([])

  useEffect(() => {
    fetchShop().then((r) => setSeeds(r.shop.filter((i) => i.category === 'seed'))).catch(() => setSeeds([]))
  }, [])

  const ownedSeeds = seeds.filter((i) => owned.includes(i.id))
  const bloomed = garden.filter((p) => p.growth >= 100).length

  return (
    <div className="garden">
      <div className="garden-head">
        <div>
          <h1 className="page-title"><Icon name="sprout" /> {t('gd.title')}</h1>
          <p className="page-sub">{t('gd.sub')}</p>
        </div>
        <div className="garden-stats">
          <div><b>{garden.length}</b><span>{t('gd.planting')}</span></div>
          <div><b>{bloomed}</b><span>{t('gd.bloomed')}</span></div>
        </div>
      </div>

      <div className="garden-seedbar">
        <span className="gs-label"><Icon name="sprout" size={15} /> {t('gd.seedsOwned')}</span>
        {ownedSeeds.length === 0 ? (
          <span className="gs-empty">{t('gd.noSeeds')} <button onClick={() => setView('shop')}>{t('gd.buyShop')}</button></span>
        ) : (
          ownedSeeds.map((s) => (
            <button key={s.id} className="gs-seed" onClick={() => plantSeed(s.id, s.art, s.name)}>
              <Flower art={s.art} size={28} /> {t('gd.plant', { name: s.name })}
            </button>
          ))
        )}
      </div>

      {garden.length === 0 ? (
        <div className="empty">
          <div className="big">🌱</div>
          {t('gd.empty')}
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={() => setView('shop')}><Icon name="store" size={15} /> {t('gd.toShop')}</button>
          </div>
        </div>
      ) : (
        <div className="garden-grid">
          {garden.map((p) => (
            <div key={p.id} className={'plant-card' + (p.growth >= 100 ? ' bloomed' : '')}>
              <button className="plant-del" title={t('gd.remove')} onClick={() => removePlant(p.id)}><Icon name="trash" size={14} /></button>
              <div className="plant-art" style={{ transform: `scale(${0.55 + (p.growth / 100) * 0.45})` }}>
                <Flower art={p.art} size={110} />
              </div>
              <div className="plant-name">{p.name}</div>
              <div className="plant-stage">{t(stageKey(p.growth))}</div>
              <div className="plant-bar"><span style={{ width: p.growth + '%' }} /></div>
              {p.growth >= 100 ? (
                <div className="plant-done"><Icon name="check-circle" size={14} /> {t('gd.done')}</div>
              ) : (
                <button className="plant-water" onClick={() => waterPlant(p.id)}>
                  <Icon name="droplet" size={15} /> {t('gd.water')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="garden-tip">
        <Icon name="bulb" size={16} /> {t('gd.tip')}
      </div>
    </div>
  )
}
