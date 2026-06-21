import { useMemo, useState } from 'react'
import { videoUrl } from '@/data/videos'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { Video } from '@/models/video.model'

export default function LibraryPage() {
  const { loadLesson, saveVideo, videos } = useAppStore()
  const [level, setLevel] = useState<string>('Tất cả')

  const levels = useMemo(() => {
    const set = new Set<string>()
    videos.forEach((v) => v.level && set.add(v.level))
    return ['Tất cả', ...Array.from(set)]
  }, [videos])

  const list = level === 'Tất cả' ? videos : videos.filter((v) => v.level === level)
  const pick = (v: Video) => {
    saveVideo(v)
    loadLesson(videoUrl(v.id))
  }

  return (
    <>
      <h1 className="page-title"><Icon name="film" /> Kho video tiếng Hàn</h1>
      <p className="page-sub">
        {videos.length} video đã chọn lọc, đều có phụ đề tiếng Hàn — bấm vào để tạo bài học song ngữ.
      </p>

      <div className="chips">
        {levels.map((lv) => (
          <button key={lv} className={'chip' + (lv === level ? ' on' : '')} onClick={() => setLevel(lv)}>
            {lv}
          </button>
        ))}
      </div>

      {videos.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}><div className="big">📺</div>Chưa có video nào trong kho.</div>
      ) : (
        <div className="vgrid" style={{ marginTop: 18 }}>
          {list.map((v) => (
            <VideoCard key={v.id} video={v} onPick={pick} />
          ))}
        </div>
      )}
    </>
  )
}
