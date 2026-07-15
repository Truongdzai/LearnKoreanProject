import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { fetchActivities, type Activities } from '@/core/api/me.api'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const EMPTY: Activities = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  minutes: [0, 0, 0, 0, 0, 0, 0],
  words: [0, 0, 0, 0, 0, 0, 0],
  todayIdx: (new Date().getDay() + 6) % 7,
  totalMinutes: 0,
  totalWords: 0,
  srsTotal: 0,
}

export default function ActivitiesPage() {
  const { user, savedVideos, garden, paths, t } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  const [data, setData] = useState<Activities>(EMPTY)

  useEffect(() => {
    if (!isAuthed) { setData(EMPTY); return }
    fetchActivities().then(setData).catch(() => setData(EMPTY))
  }, [isAuthed])

  const maxMin = Math.max(1, ...data.minutes)
  const maxWords = Math.max(1, ...data.words)

  const stats = [
    { ic: 'flame', label: t('act.streak'), val: user.streak, unit: t('act.unitDays'), tone: 'fire' },
    { ic: 'clock', label: t('act.weekTime'), val: data.totalMinutes, unit: t('act.unitMins'), tone: 'blue' },
    { ic: 'cards', label: t('act.weekWords'), val: data.totalWords, unit: t('act.unitWords'), tone: 'violet' },
    { ic: 'star', label: t('act.totalXp'), val: user.xp.toLocaleString('vi'), unit: 'XP', tone: 'gold' },
  ] as const

  return (
    <div className="activities">
      <h1 className="page-title"><Icon name="chart" /> {t('act.title')}</h1>
      <p className="page-sub">{t('act.sub')}</p>

      {!isAuthed && (
        <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>
          {t('act.loginNote')}{' '}
          <button className="link-more" onClick={openAuth}>{t('top.login')}</button>
        </div>
      )}

      <div className="act-stats">
        {stats.map((s) => (
          <div key={s.label} className={'act-stat ' + s.tone}>
            <span className="act-stat-ic"><Icon name={s.ic} size={20} /></span>
            <div>
              <b>{s.val} <small>{s.unit}</small></b>
              <span>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="act-charts">
        <div className="act-card">
          <div className="act-card-head"><b>{t('act.chartTime')}</b><span>{t('act.minsTotal', { n: data.totalMinutes })}</span></div>
          <div className="bars">
            {data.minutes.map((m, i) => (
              <div key={i} className={'bar-col' + (i === data.todayIdx ? ' today' : '')}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: (m / maxMin) * 100 + '%' }}><span>{m}'</span></div>
                </div>
                <span className="bar-lbl">{data.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="act-card">
          <div className="act-card-head"><b>{t('act.chartWords')}</b><span>{t('act.wordsTotal', { n: data.totalWords })}</span></div>
          <div className="bars">
            {data.words.map((w, i) => (
              <div key={i} className={'bar-col' + (i === data.todayIdx ? ' today' : '')}>
                <div className="bar-track">
                  <div className="bar-fill violet" style={{ height: (w / maxWords) * 100 + '%' }}><span>{w}</span></div>
                </div>
                <span className="bar-lbl">{data.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title"><span className="pin" /> {t('act.overview')}</div>
      <div className="act-summary">
        <div className="as-item"><Icon name="rocket" size={18} /><b>{t('act.level', { n: user.level })}</b><span>{t('act.levelSub')}</span></div>
        <div className="as-item"><Icon name="cards" size={18} /><b>{data.srsTotal}</b><span>{t('act.cards')}</span></div>
        <div className="as-item"><Icon name="tv" size={18} /><b>{savedVideos.length}</b><span>{t('act.videos')}</span></div>
        <div className="as-item"><Icon name="map" size={18} /><b>{paths.length}</b><span>{t('act.paths')}</span></div>
        <div className="as-item"><Icon name="sprout" size={18} /><b>{garden.length}</b><span>{t('act.plants')}</span></div>
      </div>
    </div>
  )
}
