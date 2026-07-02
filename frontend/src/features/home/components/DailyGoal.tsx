import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'

const GOAL_LEVELS = [
  { xp: 30, label: 'Nhẹ nhàng' },
  { xp: 50, label: 'Vừa sức' },
  { xp: 100, label: 'Chăm chỉ' },
  { xp: 200, label: 'Cày cuốc' },
]

export default function DailyGoal() {
  const { todayXp, dailyGoalXp, setDailyGoalXp, user, setView } = useAppStore()
  const pct = Math.min(100, Math.round((todayXp / dailyGoalXp) * 100))
  const reached = todayXp >= dailyGoalXp

  return (
    <div className={'dgoal' + (reached ? ' done' : '')}>
      <div className="dgoal-head">
        <b><Icon name="target" size={16} /> Mục tiêu hôm nay</b>
        <div className="dgoal-levels">
          {GOAL_LEVELS.map((g) => (
            <button
              key={g.xp}
              className={dailyGoalXp === g.xp ? 'on' : ''}
              onClick={() => setDailyGoalXp(g.xp)}
              title={`${g.label} — ${g.xp} XP/ngày`}
            >{g.xp}</button>
          ))}
        </div>
      </div>

      <div className="dgoal-bar"><span style={{ width: pct + '%' }} /></div>

      <div className="dgoal-foot">
        {reached ? (
          <span className="dgoal-msg">🎉 Tuyệt vời! Bạn đã đạt <b>{todayXp}/{dailyGoalXp} XP</b> hôm nay{user.streak > 0 ? ` — chuỗi ${user.streak} ngày vẫn cháy 🔥` : ''}.</span>
        ) : todayXp === 0 ? (
          <span className="dgoal-msg">
            {user.streak > 0
              ? <>🔥 Chuỗi <b>{user.streak} ngày</b> đang chờ — học vài phút để giữ lửa nhé!</>
              : <>Hôm nay bạn chưa học — chỉ 1 video ngắn là đủ khởi động!</>}
          </span>
        ) : (
          <span className="dgoal-msg"><b>{todayXp}/{dailyGoalXp} XP</b> — cố thêm chút nữa là chạm mục tiêu!</span>
        )}
        {!reached && (
          <div className="dgoal-ctas">
            <button className="btn-primary sm" onClick={() => setView('library')}><Icon name="film" size={14} /> Học video</button>
            <button className="btn-ghost sm" onClick={() => setView('flashcards')}><Icon name="cards" size={14} /> Ôn tập</button>
          </div>
        )}
      </div>
    </div>
  )
}
