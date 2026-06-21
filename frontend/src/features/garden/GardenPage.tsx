import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Flower from '@/core/components/Flower'
import { fetchShop } from '@/core/api/content.api'
import type { ShopItem } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'

function stage(g: number) {
  if (g >= 100) return 'Nở rộ 🌸'
  if (g >= 70) return 'Sắp nở'
  if (g >= 40) return 'Đang lớn'
  if (g >= 20) return 'Nảy mầm'
  return 'Hạt giống'
}

export default function GardenPage() {
  const { owned, garden, plantSeed, waterPlant, removePlant, setView } = useAppStore()
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
          <h1 className="page-title"><Icon name="sprout" /> Vườn của tôi</h1>
          <p className="page-sub">Trồng hạt giống đã mua và tưới cây mỗi khi học xong — cây lớn dần theo tiến độ của bạn.</p>
        </div>
        <div className="garden-stats">
          <div><b>{garden.length}</b><span>Cây đang trồng</span></div>
          <div><b>{bloomed}</b><span>Đã nở hoa</span></div>
        </div>
      </div>

      <div className="garden-seedbar">
        <span className="gs-label"><Icon name="sprout" size={15} /> Hạt giống trong kho:</span>
        {ownedSeeds.length === 0 ? (
          <span className="gs-empty">Chưa có hạt giống nào — <button onClick={() => setView('shop')}>mua ở Cửa hàng</button></span>
        ) : (
          ownedSeeds.map((s) => (
            <button key={s.id} className="gs-seed" onClick={() => plantSeed(s.id, s.art, s.name)}>
              <Flower art={s.art} size={28} /> Trồng {s.name}
            </button>
          ))
        )}
      </div>

      {garden.length === 0 ? (
        <div className="empty">
          <div className="big">🌱</div>
          Vườn của bạn đang trống. Mua hạt giống ở cửa hàng rồi trồng để bắt đầu!
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={() => setView('shop')}><Icon name="store" size={15} /> Tới cửa hàng</button>
          </div>
        </div>
      ) : (
        <div className="garden-grid">
          {garden.map((p) => (
            <div key={p.id} className={'plant-card' + (p.growth >= 100 ? ' bloomed' : '')}>
              <button className="plant-del" title="Nhổ cây" onClick={() => removePlant(p.id)}><Icon name="trash" size={14} /></button>
              <div className="plant-art" style={{ transform: `scale(${0.55 + (p.growth / 100) * 0.45})` }}>
                <Flower art={p.art} size={110} />
              </div>
              <div className="plant-name">{p.name}</div>
              <div className="plant-stage">{stage(p.growth)}</div>
              <div className="plant-bar"><span style={{ width: p.growth + '%' }} /></div>
              {p.growth >= 100 ? (
                <div className="plant-done"><Icon name="check-circle" size={14} /> Đã nở hoa rực rỡ!</div>
              ) : (
                <button className="plant-water" onClick={() => waterPlant(p.id)}>
                  <Icon name="droplet" size={15} /> Tưới cây (+14%)
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="garden-tip">
        <Icon name="bulb" size={16} /> Mẹo: hoàn thành nhiệm vụ học mỗi ngày để có thêm xu mua hạt giống đẹp và "giọt nước" tưới cây.
      </div>
    </div>
  )
}
