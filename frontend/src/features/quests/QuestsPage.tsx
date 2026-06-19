import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { QUESTS, DAILY_BONUS } from '@/data/gamification'
import type { QuestPeriod } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'

const PERIOD_LABEL: Record<QuestPeriod, string> = { daily: 'Hằng ngày', weekly: 'Hằng tuần', monthly: 'Hằng tháng' }

export default function QuestsPage() {
  const { user, addCoins, setView } = useAppStore()
  const [claimed, setClaimed] = useState<string[]>([])
  const [bonusTaken, setBonusTaken] = useState(false)

  const claim = (id: string, reward: number) => {
    if (claimed.includes(id)) return
    addCoins(reward)
    setClaimed((c) => [...c, id])
  }

  const takeBonus = () => {
    if (bonusTaken) return
    addCoins(DAILY_BONUS)
    setBonusTaken(true)
  }

  return (
    <div className="quests">
      <div className="quests-head">
        <h1><Icon name="crown" /> Nhiệm Vụ Plus <Icon name="sparkles" /></h1>
        <p>Hoàn thành nhiệm vụ để nhận xu, dùng mua hạt giống & khung viền trong cửa hàng.</p>
      </div>

      <button className={'daily-bonus' + (bonusTaken ? ' taken' : '')} onClick={takeBonus} disabled={bonusTaken}>
        <span className="db-left">
          <Icon name="gift" size={22} /> Phần thưởng đăng nhập hằng ngày
        </span>
        <span className="db-reward">
          {bonusTaken ? 'Đã nhận ✓' : <>+{DAILY_BONUS} <Icon name="coin" size={16} /></>}
        </span>
      </button>

      {(['daily', 'weekly', 'monthly'] as QuestPeriod[]).map((period) => {
        const list = QUESTS.filter((q) => q.period === period)
        if (!list.length) return null
        return (
          <div key={period}>
            <div className="section-title"><span className="pin" /> {PERIOD_LABEL[period]}</div>
            <div className="quest-grid">
              {list.map((q) => {
                const done = q.progress >= q.target
                const isClaimed = claimed.includes(q.id)
                const pct = Math.min(100, Math.round((q.progress / q.target) * 100))
                const locked = q.plus && !user.isPlus
                return (
                  <div key={q.id} className={'quest-card' + (q.plus ? ' is-plus' : '')}>
                    <div className="quest-top">
                      <span className="quest-period">{PERIOD_LABEL[q.period]}</span>
                      {q.plus && <span className="quest-plus"><Icon name="sparkles" size={11} /> PLUS</span>}
                    </div>
                    <div className="quest-title">{q.title}</div>
                    <div className="quest-desc">{q.desc}</div>

                    <div className="quest-prog-row">
                      <span>Tiến trình</span>
                      <b>{q.progress}/{q.target}</b>
                    </div>
                    <div className="quest-bar"><span style={{ width: pct + '%' }} /></div>

                    <div className="quest-foot">
                      <span className="quest-reward"><Icon name="coin" size={16} /> {q.reward}</span>
                      {locked ? (
                        <button className="quest-btn locked" onClick={() => setView('pricing')}><Icon name="lock" size={13} /> Mở bằng Plus</button>
                      ) : isClaimed ? (
                        <button className="quest-btn done" disabled>Đã nhận ✓</button>
                      ) : done ? (
                        <button className="quest-btn claim" onClick={() => claim(q.id, q.reward)}>Nhận thưởng</button>
                      ) : (
                        <button className="quest-btn" disabled>Đang thực hiện</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
