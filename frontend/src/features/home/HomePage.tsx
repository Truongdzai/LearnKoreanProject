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

export default function HomePage() {
  const {
    loadLesson, setView, videos, learnLang, goal, openOnboarding,
    t, learnLangName, user, savedVideos,
  } = useAppStore()

  const langVideos = useMemo(
    () => videos.filter((v) => (v.lang || 'ko') === learnLang),
    [videos, learnLang],
  )
  const g = goalById(goal)
  const resume = savedVideos.filter((v) => (v.lang || 'ko') === learnLang)[0]

  const pick = (v: Video) => {
    loadLesson(videoUrl(v.id), { lang: v.lang || learnLang, video: v })
  }

  return (
    <div className="hm">
      <section className="hm-top">
        <div className="hm-hi">
          <span className="hm-kicker">{t('home.kicker')}</span>
          <h1>{t('home.hi', { name: user.name })}</h1>
          <p>{t('home.hiSub', { lang: learnLangName })}</p>
          <div className="hm-hi-row">
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
            <button className="hm-goal" onClick={openOnboarding} title={t('home.goalChip.hint')}>
              {g ? <>{t('home.goalChip.set')} <b>{g.emoji} {t(`goal.${g.id}.label`)}</b></> : t('home.goalChip.none')}
            </button>
          </div>
        </div>
        <div className="hm-streak">
          <div className="hm-stat"><b>{user.streak}</b><span>{t('home.stat.streak')}</span></div>
          <div className="hm-stat"><b>{user.xp.toLocaleString('vi')}</b><span>{t('home.stat.xp')}</span></div>
          <div className="hm-stat"><b>{user.level}</b><span>{t('home.stat.level')}</span></div>
        </div>
      </section>

      <div className="hm-quick">
        {QUICK.map((q) => (
          <button key={q.id} onClick={() => setView(q.to)}>
            <span className="hm-quick-ic"><Icon name={q.icon} size={18} /></span>
            <b>{t(`home.quick.${q.id}`)}</b>
            <small>{t(`home.quick.${q.id}Sub`)}</small>
          </button>
        ))}
      </div>

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
        <div className="empty"><div className="big">📺</div>{t('home.empty', { lang: learnLangName })}</div>
      )}
    </div>
  )
}
