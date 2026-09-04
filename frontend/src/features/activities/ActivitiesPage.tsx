import { useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { fetchActivities, fetchActivityDaysApi, setEmailPrefsApi, type Activities, type ActivityDay } from '@/core/api/me.api'
import { computeBadges, nextBadge, BADGE_TONE, TIER_MARK } from '@/data/badges'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import ShareCard from '@/features/share/ShareCard'
import MyDataCard from './MyDataCard'
import SkillProgress from './SkillProgress'
import MissBookCard from './MissBookCard'
import { useSkillLog } from '@/core/skills'
import { useMissBook } from '@/core/missBook'
import { localDay } from '@/core/utils/day'

const EMPTY: Activities = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  minutes: [0, 0, 0, 0, 0, 0, 0],
  words: [0, 0, 0, 0, 0, 0, 0],
  todayIdx: (new Date().getDay() + 6) % 7,
  totalMinutes: 0,
  totalWords: 0,
  srsTotal: 0,
}

const HEAT_WEEKS = 12

function heatLevel(mins: number): number {
  if (mins <= 0) return 0
  if (mins < 10) return 1
  if (mins < 25) return 2
  if (mins < 50) return 3
  return 4
}

const toISO = localDay

export default function ActivitiesPage() {
  const [shareOpen, setShareOpen] = useState(false)
  const [mailBusy, setMailBusy] = useState(false)
  const { user, savedVideos, garden, paths, t } = useAppStore()
  const { isAuthed, openAuth, account, setAccount } = useAuth()
  const [data, setData] = useState<Activities>(EMPTY)
  const [days, setDays] = useState<ActivityDay[]>([])
  const { log } = useSkillLog()
  const { book, drop, clear } = useMissBook()

  const start = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const todayW = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - todayW - (HEAT_WEEKS - 1) * 7)
    return d
  }, [])

  useEffect(() => {
    if (!isAuthed) { setData(EMPTY); setDays([]); return }
    fetchActivities().then(setData).catch(() => setData(EMPTY))
    fetchActivityDaysApi(toISO(start)).then((r) => setDays(r.days)).catch(() => setDays([]))
  }, [isAuthed, start])

  const maxMin = Math.max(1, ...data.minutes)
  const maxWords = Math.max(1, ...data.words)

  const minutesByDay = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of days) m.set(d.day, d.minutes)
    return m
  }, [days])

  const heat = useMemo(() => {
    const todayISO = toISO(new Date())
    const cols: { iso: string; mins: number; future: boolean }[][] = []
    const cursor = new Date(start)
    for (let w = 0; w < HEAT_WEEKS; w++) {
      const col: { iso: string; mins: number; future: boolean }[] = []
      for (let dow = 0; dow < 7; dow++) {
        const iso = toISO(cursor)
        col.push({ iso, mins: minutesByDay.get(iso) || 0, future: iso > todayISO })
        cursor.setDate(cursor.getDate() + 1)
      }
      cols.push(col)
    }
    return cols
  }, [start, minutesByDay])

  const activeDays = useMemo(() => days.filter((d) => d.minutes > 0 || d.words > 0 || d.lessons > 0).length, [days])

  const badges = computeBadges({
    xp: user.xp,
    streak: user.streak,
    cards: data.srsTotal,
    videos: savedVideos.length,
    plants: garden.length,
  })
  const earnedCount = badges.filter((b) => b.earned).length
  const upNext = nextBadge(badges)

  const stats = [
    { ic: 'flame', label: t('act.streak'), val: user.streak, unit: t('act.unitDays'), tone: 'fire' },
    { ic: 'clock', label: t('act.weekTime'), val: data.totalMinutes, unit: t('act.unitMins'), tone: 'blue' },
    { ic: 'cards', label: t('act.weekWords'), val: data.totalWords, unit: t('act.unitWords'), tone: 'violet' },
    { ic: 'star', label: t('act.totalXp'), val: user.xp.toLocaleString('vi'), unit: 'XP', tone: 'gold' },
  ] as const

  const DOW = ['act.d.mon', 'act.d.tue', 'act.d.wed', 'act.d.thu', 'act.d.fri', 'act.d.sat', 'act.d.sun']

  return (
    <div className="activities">
      <h1 className="page-title"><Icon name="chart" /> {t('act.title')}</h1>
      <p className="page-sub">{t('act.sub')}</p>

      {isAuthed && (
        <div className="act-share">
          <div>
            <b>{t('act.shareTitle')}</b>
            <span>{t('act.shareText')}</span>
          </div>
          <button className="btn-primary sm" onClick={() => setShareOpen(true)}>
            <Icon name="share" size={15} /> {t('act.shareCta')}
          </button>
        </div>
      )}
      {shareOpen && <ShareCard onClose={() => setShareOpen(false)} />}

      {isAuthed && account && (
        <div className="act-share">
          <div>
            <b>{t('mail.title')}</b>
            <span>
              {account.emailVerified === false ? t('mail.needVerify') : t('mail.sub')}
            </span>
          </div>
          <button
            className={account.emailOptout ? 'btn-primary sm' : 'btn-ghost sm'}
            disabled={mailBusy || account.emailVerified === false}
            onClick={() => {
              setMailBusy(true)
              setEmailPrefsApi(!account.emailOptout)
                .then((r) => setAccount(r.user))
                .catch(() => {})
                .finally(() => setMailBusy(false))
            }}
          >
            <Icon name={account.emailOptout ? 'bell' : 'mute'} size={15} />
            {' '}{account.emailOptout ? t('mail.turnOn') : t('mail.turnOff')}
          </button>
        </div>
      )}

      {!isAuthed && (
        <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>
          {t('act.loginNote')}{' '}
          <button className="link-more" onClick={openAuth}>{t('top.login')}</button>
        </div>
      )}

      <dl className="srs-record act-record">
        {stats.map((s) => (
          <div key={s.label} className={'act-stat ' + s.tone}>
            <dt><Icon name={s.ic} size={13} /> {s.label}</dt>
            <dd>{s.val} <small>{s.unit}</small></dd>
          </div>
        ))}
      </dl>

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

      <div className="act-card act-heat">
        <div className="act-card-head">
          <b>{t('act.heatTitle')}</b>
          <span>{t('act.heatActive', { n: activeDays })}</span>
        </div>
        <div className="act-heat-body">
          <div className="heat-dow">
            {DOW.map((d, i) => (
              <span key={d}>{i % 2 === 1 ? t(d) : ''}</span>
            ))}
          </div>
          <div className="heat-grid">
            {heat.map((col, ci) => (
              <div key={ci} className="heat-col">
                {col.map((cell) => (
                  <span
                    key={cell.iso}
                    className={'heat-cell' + (cell.future ? ' future' : ' lvl' + heatLevel(cell.mins))}
                    title={cell.future ? '' : t('act.heatCell', { date: cell.iso, n: cell.mins })}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="act-heat-legend">
          <span>{t('act.heatLess')}</span>
          {[0, 1, 2, 3, 4].map((l) => <span key={l} className={'heat-cell lvl' + l} />)}
          <span>{t('act.heatMore')}</span>
        </div>
      </div>

      <SkillProgress log={log} />
      <MissBookCard book={book} onDrop={drop} onClear={clear} />

      <div className="section-title"><span className="pin" /> {t('bd.title')} ({earnedCount}/{badges.length})</div>
      <div className="badge-case">
        <div className="badge-case-head">
          <div className="bch-count">
            <b>{earnedCount}</b>
            <span>/ {badges.length}</span>
          </div>
          <div className="bch-mid">
            <div className="bch-rail">
              {badges.map((b) => (
                <i key={b.id} className={b.earned ? 'on' : ''} />
              ))}
            </div>
            <p>
              {upNext
                ? t('bd.next', { name: t(upNext.nameKey), n: upNext.remain })
                : t('bd.allDone')}
            </p>
          </div>
        </div>

        <div className="badge-grid">
          {badges.map((b) => (
            <div
              key={b.id}
              className={['badge-card', BADGE_TONE[b.metric], 'sh-' + b.shape, b.earned ? 'earned' : 'locked'].join(' ')}
              style={{ ['--p' as string]: b.pct }}
            >
              <span className="badge-tier" aria-hidden="true">{TIER_MARK[b.tier - 1]}</span>

              <span className="badge-medal">
                <i className="badge-ring" aria-hidden="true" />
                <i className="badge-disc" aria-hidden="true" />
                <Icon name={b.icon} size={20} />
              </span>

              <b className="badge-name">{t(b.nameKey)}</b>
              <span className="badge-desc">{t(b.descKey)}</span>

              {b.earned ? (
                <span className="badge-ok"><Icon name="check-circle" size={12} /> {t('bd.earned')}</span>
              ) : (
                <span className="badge-progress">
                  <em>{b.value.toLocaleString('vi-VN')}</em> / {b.target.toLocaleString('vi-VN')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="section-title"><span className="pin" /> {t('act.overview')}</div>
      <dl className="srs-record act-record">
        <div><dt><Icon name="rocket" size={13} /> {t('act.levelSub')}</dt><dd>{t('act.level', { n: user.level })}</dd></div>
        <div><dt><Icon name="cards" size={13} /> {t('act.cards')}</dt><dd>{data.srsTotal}</dd></div>
        <div><dt><Icon name="tv" size={13} /> {t('act.videos')}</dt><dd>{savedVideos.length}</dd></div>
        <div><dt><Icon name="map" size={13} /> {t('act.paths')}</dt><dd>{paths.length}</dd></div>
        <div><dt><Icon name="sprout" size={13} /> {t('act.plants')}</dt><dd>{garden.length}</dd></div>
      </dl>

      {isAuthed && <MyDataCard />}
    </div>
  )
}
