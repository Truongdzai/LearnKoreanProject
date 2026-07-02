import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const GOAL_LEVELS = [
  { xp: 30, label: 'Nhẹ nhàng' },
  { xp: 50, label: 'Vừa sức' },
  { xp: 100, label: 'Chăm chỉ' },
  { xp: 200, label: 'Cày cuốc' },
]

const LEVEL_XP = 500

export default function DailyGoal() {
  const { todayXp, dailyGoalXp, setDailyGoalXp, user, setView, isAuthed, goalBonusClaimed, claimGoalBonus } = useAppStore()
  const { openAuth } = useAuth()
  const [burst, setBurst] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [claiming, setClaiming] = useState(false)

  const pct = Math.min(100, Math.round((todayXp / dailyGoalXp) * 100))
  const reached = todayXp >= dailyGoalXp
  const intoLevel = user.xp % LEVEL_XP

  const claim = async () => {
    setClaiming(true)
    try {
      const r = await claimGoalBonus()
      setReward(r)
      setBurst(true)
      setTimeout(() => setBurst(false), 1800)
    } catch { /* thông báo lỗi đã nằm trong luồng đăng nhập */ } finally {
      setClaiming(false)
    }
  }

  return (
    <div className={'dgoal' + (reached ? ' done' : '')}>
      {burst && (
        <div className="dgoal-burst" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ['--i' as string]: i }} />)}
        </div>
      )}

      <div className="dgoal-head">
        <b><Icon name="target" size={16} /> Mục tiêu hôm nay</b>
        <div className="dgoal-levels">
          {GOAL_LEVELS.map((g) => (
            <button
              key={g.xp}
              className={dailyGoalXp === g.xp ? 'on' : ''}
              onClick={() => setDailyGoalXp(g.xp)}
              title={`${g.label} — ${g.xp} XP/ngày · thưởng ${g.xp / 2} xu`}
            >{g.xp}</button>
          ))}
        </div>
      </div>

      <div className="dgoal-bar"><span style={{ width: pct + '%' }} /></div>

      <div className="dgoal-foot">
        {reached ? (
          reward !== null ? (
            <span className="dgoal-msg">🎉 <b>+{reward} xu</b> vào túi! Hẹn rương mới vào ngày mai — chuỗi {user.streak > 0 ? `${user.streak} ngày` : 'mới'} vẫn cháy 🔥</span>
          ) : (
            <span className="dgoal-msg">🎉 Đã đạt <b>{todayXp}/{dailyGoalXp} XP</b> hôm nay{user.streak > 0 ? ` — chuỗi ${user.streak} ngày vẫn cháy 🔥` : ''}.</span>
          )
        ) : todayXp === 0 ? (
          <span className="dgoal-msg">
            {user.streak > 0
              ? <>🔥 Chuỗi <b>{user.streak} ngày</b> đang chờ — học vài phút để giữ lửa nhé!</>
              : <>Hôm nay bạn chưa học — chỉ 1 video ngắn là đủ khởi động!</>}
          </span>
        ) : (
          <span className="dgoal-msg"><b>{todayXp}/{dailyGoalXp} XP</b> — cố thêm chút nữa là chạm mục tiêu!</span>
        )}

        {reached && reward === null && (
          isAuthed ? (
            !goalBonusClaimed ? (
              <button className="btn-primary sm dgoal-chest" disabled={claiming} onClick={claim}>
                🎁 {claiming ? 'Đang mở…' : `Mở rương +${dailyGoalXp / 2} xu`}
              </button>
            ) : (
              <span className="dgoal-claimed">✅ Đã nhận thưởng hôm nay</span>
            )
          ) : (
            <button className="btn-primary sm dgoal-chest" onClick={openAuth}>🎁 Đăng nhập nhận thưởng xu</button>
          )
        )}

        {!reached && (
          <div className="dgoal-ctas">
            <button className="btn-primary sm" onClick={() => setView('library')}><Icon name="film" size={14} /> Học video</button>
            <button className="btn-ghost sm" onClick={() => setView('flashcards')}><Icon name="cards" size={14} /> Ôn tập</button>
          </div>
        )}
      </div>

      {isAuthed && (
        <div className="dgoal-level">
          <span>⭐ Cấp {user.level}</span>
          <div className="dgoal-level-bar"><span style={{ width: Math.round((intoLevel / LEVEL_XP) * 100) + '%' }} /></div>
          <span className="dgoal-level-next">còn {LEVEL_XP - intoLevel} XP lên cấp {user.level + 1}</span>
        </div>
      )}
    </div>
  )
}
