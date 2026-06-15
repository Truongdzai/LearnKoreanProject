import { useState } from 'react'
import { VIDEOS, LEVELS, videoUrl } from '@/data/videos'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { Video } from '@/models/video.model'

export default function LibraryPage() {
  const { loadLesson } = useAppStore()
  const [level, setLevel] = useState<string>('Tất cả')
  const list = level === 'Tất cả' ? VIDEOS : VIDEOS.filter((v) => v.level === level)
  const pick = (v: Video) => loadLesson(videoUrl(v.id))

  return (
    <>
      <h1 className="page-title"><Icon name="film" /> Kho video tiếng Hàn</h1>
      <p className="page-sub">
        {VIDEOS.length} video đã chọn lọc, đều có phụ đề tiếng Hàn — bấm vào để tạo bài học song ngữ.
      </p>

      <div className="chips">
        {LEVELS.map((lv) => (
          <button key={lv} className={'chip' + (lv === level ? ' on' : '')} onClick={() => setLevel(lv)}>
            {lv}
          </button>
        ))}
      </div>

      <div className="vgrid" style={{ marginTop: 18 }}>
        {list.map((v) => (
          <VideoCard key={v.id} video={v} onPick={pick} />
        ))}
      </div>
    </>
  )
}
