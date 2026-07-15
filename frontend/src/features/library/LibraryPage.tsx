import { useMemo, useState } from 'react'
import { videoUrl } from '@/data/videos'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { Video } from '@/models/video.model'

export default function LibraryPage() {
  const { loadLesson, videos, learnLang, t, learnLangName } = useAppStore()
  const [level, setLevel] = useState<string>('all')

  // Only show videos for the language being studied.
  const langVideos = useMemo(
    () => videos.filter((v) => (v.lang || 'ko') === learnLang),
    [videos, learnLang],
  )

  const levels = useMemo(() => {
    const set = new Set<string>()
    langVideos.forEach((v) => v.level && set.add(v.level))
    return ['all', ...Array.from(set)]
  }, [langVideos])

  const list = level === 'all' ? langVideos : langVideos.filter((v) => v.level === level)
  const pick = (v: Video) => {
    loadLesson(videoUrl(v.id), { lang: v.lang || learnLang, video: v })
  }

  return (
    <>
      <h1 className="page-title"><Icon name="film" /> {t('lib.title', { lang: learnLangName })}</h1>
      <p className="page-sub">
        {t('lib.sub', { n: langVideos.length, lang: learnLangName })}
      </p>

      <div className="chips">
        {levels.map((lv) => (
          <button key={lv} className={'chip' + (lv === level ? ' on' : '')} onClick={() => setLevel(lv)}>
            {lv === 'all' ? t('lib.all') : lv}
          </button>
        ))}
      </div>

      {langVideos.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          <div className="big">📺</div>
          {t('lib.empty', { lang: learnLangName })}
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
