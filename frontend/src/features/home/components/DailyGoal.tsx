import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const GOAL_LEVELS = [30, 50, 100, 200]

const LEVEL_XP = 500

export default function DailyGoal() {
  const { todayXp, dailyGoalXp, setDailyGoalXp, user, setView, isAuthed, goalBonusClaimed, claimGoalBonus, t } = useAppStore()
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
        <b><Icon name="target" size={16} /> {t('dgoal.title')}</b>
        <div className="dgoal-levels">
          {GOAL_LEVELS.map((xp) => (
            <button
              key={xp}
              className={dailyGoalXp === xp ? 'on' : ''}
              onClick={() => setDailyGoalXp(xp)}
              title={t('dgoal.levelHint', { label: t('dgoal.lv' + xp), xp, coins: xp / 2 })}
            >{xp}</button>
          ))}
        </div>
      </div>

      <div className="dgoal-bar"><span style={{ width: pct + '%' }} /></div>

      <div className="dgoal-foot">
        {reached ? (
          reward !== null ? (
            <span className="dgoal-msg">{t('dgoal.rewarded', { n: reward })}{user.streak > 0 ? t('dgoal.streakOn', { n: user.streak }) : ''}.</span>
          ) : (
            <span className="dgoal-msg">{t('dgoal.reached', { a: todayXp, b: dailyGoalXp })}{user.streak > 0 ? t('dgoal.streakOn', { n: user.streak }) : ''}.</span>
          )
        ) : todayXp === 0 ? (
          <span className="dgoal-msg">
            {user.streak > 0 ? t('dgoal.zeroStreak', { n: user.streak }) : t('dgoal.zero')}
          </span>
        ) : (
          <span className="dgoal-msg">{t('dgoal.progress', { a: todayXp, b: dailyGoalXp })}</span>
        )}

        {reached && reward === null && (
          isAuthed ? (
            !goalBonusClaimed ? (
              <button className="btn-primary sm dgoal-chest" disabled={claiming} onClick={claim}>
                🎁 {claiming ? t('dgoal.chestOpening') : t('dgoal.chest', { n: dailyGoalXp / 2 })}
              </button>
            ) : (
              <span className="dgoal-claimed">{t('dgoal.claimed')}</span>
            )
          ) : (
            <button className="btn-primary sm dgoal-chest" onClick={openAuth}>🎁 {t('dgoal.chestLogin')}</button>
          )
        )}

        {!reached && (
          <div className="dgoal-ctas">
            <button className="btn-primary sm" onClick={() => setView('library')}><Icon name="film" size={14} /> {t('dgoal.watch')}</button>
            <button className="btn-ghost sm" onClick={() => setView('flashcards')}><Icon name="cards" size={14} /> {t('dgoal.review')}</button>
          </div>
        )}
      </div>

      {isAuthed && (
        <div className="dgoal-level">
          <span>⭐ {t('dgoal.level', { n: user.level })}</span>
          <div className="dgoal-level-bar"><span style={{ width: Math.round((intoLevel / LEVEL_XP) * 100) + '%' }} /></div>
          <span className="dgoal-level-next">{t('dgoal.levelNext', { xp: LEVEL_XP - intoLevel, n: user.level + 1 })}</span>
        </div>
      )}
    </div>
  )
}
