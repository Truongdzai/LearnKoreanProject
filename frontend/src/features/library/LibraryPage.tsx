import { useMemo, useState } from 'react'
import { videoUrl } from '@/data/videos'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import type { Video } from '@/models/video.model'

export default function LibraryPage() {
  const { loadLesson, saveVideo, videos, learnLang } = useAppStore()
  const [level, setLevel] = useState<string>('Tất cả')
  const cfg = studyLang(learnLang)

  // Only show videos for the language being studied.
  const langVideos = useMemo(
    () => videos.filter((v) => (v.lang || 'ko') === learnLang),
    [videos, learnLang],
  )

  const levels = useMemo(() => {
    const set = new Set<string>()
    langVideos.forEach((v) => v.level && set.add(v.level))
    return ['Tất cả', ...Array.from(set)]
  }, [langVideos])

  const list = level === 'Tất cả' ? langVideos : langVideos.filter((v) => v.level === level)
  const pick = (v: Video) => {
    saveVideo(v)
    loadLesson(videoUrl(v.id))
  }

  return (
    <>
      <h1 className="page-title"><Icon name="film" /> Kho video {cfg.name}</h1>
      <p className="page-sub">
        {langVideos.length} video {cfg.name} đã chọn lọc, đều có phụ đề — bấm vào để tạo bài học song ngữ.
      </p>

      <div className="chips">
        {levels.map((lv) => (
          <button key={lv} className={'chip' + (lv === level ? ' on' : '')} onClick={() => setLevel(lv)}>
            {lv}
          </button>
        ))}
      </div>

      {langVideos.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          <div className="big">📺</div>
          Kho video {cfg.name} đang được cập nhật. Bạn có thể dán link YouTube {cfg.name} ở Trang chủ để tạo bài học ngay.
        </div>
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
