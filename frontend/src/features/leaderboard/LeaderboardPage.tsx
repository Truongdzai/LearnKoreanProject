import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { bgVideo } from '@/core/utils/cosmetics'
import { fetchLeaderboard } from '@/core/api/content.api'
import type { LeaderEntry } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import LeaguePanel from './components/LeaguePanel'
import DuelCard from './components/DuelCard'
import { useTabs } from '@/core/a11y'

const LB_TABS = ['league', 'weekly', 'all'] as const

function nextWeekReset() {
  const now = new Date()
  const d = new Date(now)
  const day = (now.getDay() + 6) % 7
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
  const { user, setView, t } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  const [scope, setScope] = useState<'league' | 'weekly' | 'all'>(isAuthed ? 'league' : 'weekly')
  const tabs = useTabs('lb', LB_TABS, scope, setScope)
  const [target] = useState(nextWeekReset)
  const cd = useCountdown(target)

  const [entries, setEntries] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const bumpLeague = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (isAuthed) setScope('league')
  }, [isAuthed])

  useEffect(() => {
    if (scope === 'league') return
    setLoading(true)
    fetchLeaderboard(scope === 'weekly' ? 'week' : 'all')
      .then((r) => setEntries(r.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [scope])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as LeaderEntry[]

  return (
    <div className="lb">
      <h1 className="page-title"><Icon name="trophy" /> {t('lb.title')}</h1>
      <p className="page-sub">{t('lb.sub')}</p>

      <div className="lb-tabs" {...tabs.list}>
        <button {...tabs.tab('league')} className={scope === 'league' ? 'on' : ''} onClick={() => setScope('league')}>{t('lg.tab')}</button>
        <button {...tabs.tab('weekly')} className={scope === 'weekly' ? 'on' : ''} onClick={() => setScope('weekly')}>{t('lb.weekly')}</button>
        <button {...tabs.tab('all')} className={scope === 'all' ? 'on' : ''} onClick={() => setScope('all')}>{t('lb.all')}</button>
      </div>

      <div {...tabs.panel(scope)}>
      {scope === 'league' && (
        isAuthed ? (
          <>
            <LeaguePanel reloadKey={reloadKey} />
            <DuelCard onChange={bumpLeague} />
          </>
        ) : (
          <div className="empty">
            <div className="big">🏆</div>
            {t('lg.needLogin')}
            <div style={{ marginTop: 14 }}>
              <button className="btn-primary" onClick={openAuth}>{t('top.login')}</button>
            </div>
          </div>
        )
      )}

      {scope !== 'league' && (
      <>
      {scope === 'weekly' && (
      <div className="lb-countdown">
        <div className="lb-cd-title">{t('lb.endsIn')}</div>
        <div className="lb-cd-grid">
          {[
            { n: cd.d, l: t('lb.days') },
            { n: cd.h, l: t('lb.hours') },
            { n: cd.m, l: t('lb.mins') },
            { n: cd.s, l: t('lb.secs') },
          ].map((x) => (
            <div key={x.l} className="lb-cd-box">
              <b>{pad(x.n)}</b>
              <span>{x.l}</span>
            </div>
          ))}
        </div>
        <div className="lb-cd-foot">{t('lb.top3')}</div>
      </div>
      )}

      {loading ? (
        <div className="empty"><div className="big">🏆</div>{t('lb.loading')}</div>
      ) : entries.length === 0 ? (
        <div className="empty"><div className="big">🏆</div>{t('lb.empty')}</div>
      ) : (
        <>
          <div className="podium">
            {podiumOrder.map((e) => (
              <div key={e.rank} className={'podium-card r' + e.rank + (e.isPlus ? ' plus' : '') + (bgVideo(e.bg) ? ' has-bg' : '')}>
                {bgVideo(e.bg) && <video className="lb-bg-vid" src={bgVideo(e.bg) || ''} autoPlay loop muted playsInline />}
                <div className="podium-rank">#{e.rank}</div>
                <Avatar size={e.rank === 1 ? 84 : 68} frame={e.frame} src={e.avatar} initials={e.name.charAt(0)} />
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
            {rest.map((e) => (
              <div key={e.rank} className={'lb-row' + (e.me ? ' me' : '') + (e.isPlus ? ' plus' : '') + (bgVideo(e.bg) ? ' has-bg' : '')}>
                {bgVideo(e.bg) && <video className="lb-bg-vid" src={bgVideo(e.bg) || ''} autoPlay loop muted playsInline />}
                <span className="lb-rank">{e.rank}</span>
                <Avatar size={48} frame={e.frame} src={e.avatar} initials={e.name.charAt(0)} />
                <span className="lb-name">
                  {e.name}
                  {e.isPlus && <span className="plus-tag sm"><Icon name="sparkles" size={10} /> Plus</span>}
                </span>
                <span className="lb-streak"><Icon name="flame" size={13} /> {e.streak}</span>
                <span className="lb-xp">{e.xp.toLocaleString('vi')} XP</span>
              </div>
            ))}
          </div>
        </>
      )}
      </>
      )}
      </div>

      {!user.isPlus && (
        <div className="lb-upsell">
          <div>
            <b>{t('lb.upsellTitle')}</b>
            <p>{t('lb.upsellText')}</p>
          </div>
          <button className="btn-primary" onClick={() => setView('pricing')}>{t('side.upgrade')}</button>
        </div>
      )}
    </div>
  )
}
