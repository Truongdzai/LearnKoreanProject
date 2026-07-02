import { useState } from 'react'
import Hero from './components/Hero'
import DailyGoal from './components/DailyGoal'
import WordOfDay from './components/WordOfDay'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { videoUrl } from '@/data/videos'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { goalById } from '@/features/onboarding/goals'
import type { Video } from '@/models/video.model'

const CATS = ['Toàn bộ', 'Mới bắt đầu', 'Podcast', 'Hội thoại', 'Truyện ngắn', 'Vlog', 'Văn hoá', 'Khác']

export default function HomePage() {
  const { loadLesson, status, statusError, setView, videos, learnLang, goal, openOnboarding } = useAppStore()
  const [cat, setCat] = useState('Toàn bộ')
  const cfg = studyLang(learnLang)
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
        <button className="goal-chip" onClick={openOnboarding} title="Đổi mục tiêu học">
          {g ? <>🎯 Mục tiêu: <b>{g.emoji} {g.label}</b></> : <>🎯 Chọn mục tiêu học</>}
        </button>
        {CATS.map((c) => (
          <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="section-title"><span className="pin" /> Bắt đầu lộ trình của bạn</div>
      <div className="cta" style={{ cursor: 'pointer' }} onClick={() => setView('path')}>
        <div className="cta-ic"><Icon name="map" /></div>
        <div>
          <h3>Tạo lộ trình học cá nhân hoá</h3>
          <ul>
            <li>Lộ trình theo trình độ &amp; mục tiêu của bạn</li>
            <li>Theo dõi tiến độ từng video</li>
            <li>Tự gom video yêu thích thành khoá học riêng</li>
          </ul>
        </div>
        <button className="btn-primary" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <Icon name="sparkles" size={15} /> Tạo lộ trình
        </button>
      </div>

      <div className="section-title">
        <span className="pin" /> Kho video {cfg.name}
        <button className="link-more" onClick={() => setView('library')}>Xem tất cả <Icon name="arrow-right" size={15} /></button>
      </div>
      {langVideos.length > 0 ? (
        <div className="vgrid">
          {langVideos.slice(0, 8).map((v) => (
            <VideoCard key={v.id} video={v} onPick={pick} />
          ))}
        </div>
      ) : (
        <div className="empty"><div className="big">📺</div>Kho video {cfg.name} đang được cập nhật. Bạn có thể dán link YouTube {cfg.name} ở trên để tạo bài học ngay.</div>
      )}
    </>
  )
}
