import { useState } from 'react'
import Hero from './components/Hero'
import DailyGoal from './components/DailyGoal'
import WordOfDay from './components/WordOfDay'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { videoUrl } from '@/data/videos'
import { useAppStore } from '@/store/app.store'
import { goalById } from '@/features/onboarding/goals'
import type { Video } from '@/models/video.model'

const CAT_KEYS = ['all', 'beginner', 'podcast', 'conversation', 'story', 'vlog', 'culture', 'other']

export default function HomePage() {
  const { loadLesson, status, statusError, setView, videos, learnLang, goal, openOnboarding, t, learnLangName } = useAppStore()
  const [cat, setCat] = useState('all')
  const langVideos = videos.filter((v) => (v.lang || 'ko') === learnLang)
  const g = goalById(goal)

  const pick = (v: Video) => {
    loadLesson(videoUrl(v.id), { lang: v.lang || learnLang, video: v })
  }

  return (
    <>
      <Hero />

      <div className={'status' + (statusError ? ' err' : '')}>
        {status && statusError && <Icon name="x-circle" />} {status}
      </div>

      <div className="home-duo">
        <DailyGoal />
        <WordOfDay />
      </div>

      <div className="chips">
        <button className="goal-chip" onClick={openOnboarding} title={t('home.goalChip.hint')}>
          {g ? <>{t('home.goalChip.set')} <b>{g.emoji} {t(`goal.${g.id}.label`)}</b></> : <>{t('home.goalChip.none')}</>}
        </button>
        {CAT_KEYS.map((c) => (
          <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>
            {t('home.cat.' + c)}
          </button>
        ))}
      </div>

      <div className="section-title"><span className="pin" /> {t('home.pathTitle')}</div>
      <div className="cta" style={{ cursor: 'pointer' }} onClick={() => setView('path')}>
        <div className="cta-ic"><Icon name="map" /></div>
        <div>
          <h3>{t('home.cta.title')}</h3>
          <ul>
            <li>{t('home.cta.li1')}</li>
            <li>{t('home.cta.li2')}</li>
            <li>{t('home.cta.li3')}</li>
          </ul>
        </div>
        <button className="btn-primary" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <Icon name="sparkles" size={15} /> {t('home.cta.btn')}
        </button>
      </div>

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
    </>
  )
}
