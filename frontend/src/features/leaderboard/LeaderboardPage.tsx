import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { LEADERBOARD } from '@/data/gamification'
import { useAppStore } from '@/store/app.store'

function nextWeekReset() {
  const now = new Date()
  const d = new Date(now)
  const day = (now.getDay() + 6) % 7 // Mon=0
  d.setDate(now.getDate() + (7 - day))
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function useCountdown(target: number) {
  const [left, setLeft] = useState(target - Date.now())
  useEffect(() => {
    const t = setInterval(() => setLeft(target - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  const s = Math.max(0, Math.floor(left / 1000))
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function LeaderboardPage() {
  const { user, setView } = useAppStore()
  const [scope, setScope] = useState<'weekly' | 'all'>('weekly')
  const [target] = useState(nextWeekReset)
  const cd = useCountdown(target)

  const top3 = LEADERBOARD.slice(0, 3)
  const rest = LEADERBOARD.slice(3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className="lb">
      <h1 className="page-title"><Icon name="trophy" /> Bảng xếp hạng</h1>
      <p className="page-sub">Học mỗi ngày để leo hạng và toả sáng cùng cộng đồng VyLing.</p>

      <div className="lb-tabs">
        <button className={scope === 'weekly' ? 'on' : ''} onClick={() => setScope('weekly')}>Tuần này</button>
        <button className={scope === 'all' ? 'on' : ''} onClick={() => setScope('all')}>Tất cả</button>
      </div>

      <div className="lb-countdown">
        <div className="lb-cd-title">Bảng xếp hạng sẽ kết thúc trong</div>
        <div className="lb-cd-grid">
          {[
            { n: cd.d, l: 'Ngày' },
            { n: cd.h, l: 'Giờ' },
            { n: cd.m, l: 'Phút' },
            { n: cd.s, l: 'Giây' },
          ].map((x) => (
            <div key={x.l} className="lb-cd-box">
              <b>{pad(x.n)}</b>
              <span>{x.l}</span>
            </div>
          ))}
        </div>
        <div className="lb-cd-foot">Top 3 nhận thưởng xu lớn & khung viền giới hạn mỗi tuần</div>
      </div>

      <div className="podium">
        {podiumOrder.map((e) => (
          <div key={e.rank} className={'podium-card r' + e.rank + (e.isPlus ? ' plus' : '')}>
            <div className="podium-rank">#{e.rank}</div>
            <Avatar size={e.rank === 1 ? 84 : 68} frame={e.frame} initials={e.name.charAt(0)} />
            <div className="podium-name">
              {e.name}
              {e.isPlus && <span className="plus-tag"><Icon name="sparkles" size={11} /> Plus</span>}
            </div>
            <div className="podium-xp"><Icon name="star" size={13} /> {e.xp.toLocaleString('vi')} XP</div>
            <div className="podium-meta">Lv {e.level} · <Icon name="flame" size={12} /> {e.streak}</div>
          </div>
        ))}
      </div>

      <div className="lb-list">
        {rest.map((e) => {
          const me = e.name === 'Bạn'
          return (
            <div key={e.rank} className={'lb-row' + (me ? ' me' : '') + (e.isPlus ? ' plus' : '')}>
              <span className="lb-rank">{e.rank}</span>
              <Avatar size={40} frame={e.frame} initials={e.name.charAt(0)} />
              <span className="lb-name">
                {e.name}
                {e.isPlus && <span className="plus-tag sm"><Icon name="sparkles" size={10} /> Plus</span>}
              </span>
              <span className="lb-streak"><Icon name="flame" size={13} /> {e.streak}</span>
              <span className="lb-xp">{e.xp.toLocaleString('vi')} XP</span>
            </div>
          )
        })}
      </div>

      {!user.isPlus && (
        <div className="lb-upsell">
          <div>
            <b>Toả sáng trên bảng xếp hạng ✨</b>
            <p>Thành viên Plus có khung viền animation lộng lẫy & danh hiệu rực rỡ. Nâng cấp để được chú ý!</p>
          </div>
          <button className="btn-primary" onClick={() => setView('pricing')}>Nâng cấp Plus</button>
        </div>
      )}
    </div>
  )
}
