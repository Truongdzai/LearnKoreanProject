import { useMemo } from 'react'
import DailyGoal from './components/DailyGoal'
import WordOfDay from './components/WordOfDay'
import MasterWord from './components/MasterWord'
import VideoCard from '@/features/shared/VideoCard'
import Icon, { type IconName } from '@/core/components/Icon'
import { videoUrl } from '@/data/videos'
import { useAppStore } from '@/store/app.store'
import { goalById } from '@/features/onboarding/goals'
import type { AppView } from '@/core/constants/enum'
import type { Video } from '@/models/video.model'

const QUICK: { id: string; icon: IconName; to: AppView }[] = [
  { id: 'shadow', icon: 'mic', to: 'library' },
  { id: 'review', icon: 'cards', to: 'flashcards' },
  { id: 'path', icon: 'map', to: 'path' },
  { id: 'tutor', icon: 'bulb', to: 'tutor' },
]

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function HomePage() {
  const {
    loadLesson, setView, videos, learnLang, goal, openOnboarding,
    t, learnLangName, user, savedVideos, todayXp,
  } = useAppStore()

  const langVideos = useMemo(
    () => videos.filter((v) => (v.lang || 'ko') === learnLang),
    [videos, learnLang],
  )
  const g = goalById(goal)
  const resume = savedVideos.filter((v) => (v.lang || 'ko') === learnLang)[0]
  const todayIdx = (new Date().getDay() + 6) % 7

  const pick = (v: Video) => {
    loadLesson(videoUrl(v.id), { lang: v.lang || learnLang, video: v })
  }

  return (
    <div className="hm">
      <div className="drawer-plate">
        <div className="drawer-label">
          <span className="drawer-label-sub">{t('home.drawer')}</span>
          <b>{learnLangName}</b>
        </div>
        <div className="drawer-count">
          <b>{langVideos.length}</b>
          <span>{t('home.drawerCount')}</span>
        </div>
        <div className="drawer-tabs">
          {QUICK.map((q) => (
            <button key={q.id} onClick={() => setView(q.to)} title={t(`home.quick.${q.id}Sub`)}>
              <Icon name={q.icon} size={14} /> {t(`home.quick.${q.id}`)}
            </button>
          ))}
        </div>
      </div>

      <section className="hm-open">
        <article className="standing-card">
          <div className="standing-hole" aria-hidden="true" />
          <div className="standing-rod" aria-hidden="true" />
          <header className="standing-head">
            <h1><span className="callno">{t('home.callno', { lang: learnLang.toUpperCase() })}</span>{t('home.hi', { name: user.name })}</h1>
          </header>
          <p className="standing-body">{t('home.hiSub', { lang: learnLangName })}</p>
          <div className="standing-rule" aria-hidden="true" />
          <div className="standing-actions">
            <button className="btn-primary" onClick={() => setView('library')}>
              <Icon name="mic" size={15} /> {t('home.startShadow')}
            </button>
            {resume ? (
              <button className="btn-ghost" onClick={() => pick(resume)}>
                <Icon name="play" size={15} /> {t('home.resume')}
              </button>
            ) : (
              <button className="btn-ghost" onClick={() => setView('myvideos')}>
                <Icon name="tv" size={15} /> {t('home.myVideos')}
              </button>
            )}
          </div>
          <button className="hm-goal" onClick={openOnboarding} title={t('home.goalChip.hint')}>
            <Icon name="target" size={13} />
            {g ? <>{t('home.goalChip.set')} <b>{t(`goal.${g.id}.label`)}</b></> : t('home.goalChip.none')}
          </button>
        </article>

        <aside className="slip">
          <div className="slip-head">
            <span>{t('home.slip.title')}</span>
            <b>{user.name}</b>
          </div>
          <div className="slip-week">
            {DAYS.map((d, i) => {
              const last = todayXp > 0 ? todayIdx : todayIdx - 1
              const on = i <= last && i >= last - user.streak + 1
              return (
                <div key={d} className={'stamp-box' + (on ? ' on' : '')}>
                  <span className="lbl">{d}</span>
                  {on && <span className="stamp-mark" aria-hidden="true" />}
                </div>
              )
            })}
          </div>
          <dl className="slip-rows">
            <div>
              <dt>{t('home.stat.streak')}</dt>
              <dd>{user.streak}</dd>
            </div>
            <div>
              <dt>{t('home.stat.xp')}</dt>
              <dd>{user.xp.toLocaleString('vi')}</dd>
            </div>
            <div>
              <dt>{t('home.stat.level')}</dt>
              <dd>{user.level}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <div className="home-duo">
        <DailyGoal />
        <WordOfDay />
      </div>

      <MasterWord />

      <div className="section-title">
        <span className="pin" /> {t('home.libTitle', { lang: learnLangName })}
        <button className="link-more" onClick={() => setView('library')}>{t('home.viewAll')} <Icon name="arrow-right" size={15} /></button>
      </div>
      {langVideos.length > 0 ? (
        <div className="vgrid">
          {langVideos.slice(0, 8).map((v) => (
            <VideoCard key={v.id} video={v} onPick={pick} />
          ))}
        </div>
      ) : (
        <div className="empty"><Icon name="tv" size={30} />{t('home.empty', { lang: learnLangName })}</div>
      )}
    </div>
  )
}
