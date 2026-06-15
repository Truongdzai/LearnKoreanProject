import { useState } from 'react'
import Hero from './components/Hero'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { VIDEOS, videoUrl } from '@/data/videos'
import { useAppStore } from '@/store/app.store'
import type { Video } from '@/models/video.model'

const CATS = ['Toàn bộ', 'Mới bắt đầu', 'Podcast', 'Hội thoại', 'Truyện ngắn', 'Vlog', 'Văn hoá', 'Khác']

export default function HomePage() {
  const { loadLesson, status, statusError, setView } = useAppStore()
  const [cat, setCat] = useState('Toàn bộ')

  const pick = (v: Video) => loadLesson(videoUrl(v.id))

  return (
    <>
      <Hero />

      <div className={'status' + (statusError ? ' err' : '')}>
        {status && statusError && <Icon name="x-circle" />} {status}
      </div>

      <div className="chips">
        {CATS.map((c) => (
          <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="section-title"><span className="pin" /> Bắt đầu lộ trình của bạn</div>
      <div className="cta">
        <div className="cta-ic"><Icon name="rocket" /></div>
        <div>
          <h3>Tạo lộ trình học cá nhân hoá</h3>
          <ul>
            <li>Lộ trình theo trình độ &amp; mục tiêu của bạn</li>
            <li>Theo dõi tiến độ từng video</li>
            <li>Tự gom video yêu thích thành khoá học riêng</li>
          </ul>
        </div>
      </div>

      <div className="section-title">
        <span className="pin" /> Kho video tiếng Hàn
        <button className="link-more" onClick={() => setView('library')}>Xem tất cả <Icon name="arrow-right" size={15} /></button>
      </div>
      <div className="vgrid">
        {VIDEOS.slice(0, 8).map((v) => (
          <VideoCard key={v.id} video={v} onPick={pick} />
        ))}
      </div>
    </>
  )
}
