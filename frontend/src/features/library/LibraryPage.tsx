import { useEffect, useMemo, useState } from 'react'
import { videoUrl } from '@/data/videos'
import { getToken } from '@/core/api/client'
import { fetchFit, type FitScore } from '@/core/api/tutor.api'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { Video } from '@/models/video.model'

function durationMins(dur: string): number {
  const parts = dur.split(':').map((n) => parseInt(n, 10) || 0)
  if (parts.length === 3) return parts[0] * 60 + parts[1]
  if (parts.length === 2) return parts[0]
  return 0
}

export default function LibraryPage() {
  const { loadLesson, videos, learnLang, t, learnLangName, savedVideos, saveVideo, removeVideo } = useAppStore()
  const [level, setLevel] = useState<string>('all')
  const [length, setLength] = useState<'all' | 'short' | 'long'>('all')
  const [query, setQuery] = useState('')

  const langVideos = useMemo(
    () => videos.filter((v) => (v.lang || 'ko') === learnLang),
    [videos, learnLang],
  )

  const levels = useMemo(() => {
    const set = new Set<string>()
    langVideos.forEach((v) => v.level && set.add(v.level))
    return ['all', ...Array.from(set)]
  }, [langVideos])

  const savedIds = useMemo(() => new Set(savedVideos.map((v) => v.id)), [savedVideos])
  const [fits, setFits] = useState<Record<string, FitScore>>({})

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return langVideos.filter((v) => {
      if (level !== 'all' && v.level !== level) return false
      if (length !== 'all') {
        const m = durationMins(v.dur)
        if (length === 'short' && m > 10) return false
        if (length === 'long' && m <= 10) return false
      }
      if (q && !(`${v.title} ${v.channel} ${v.topic}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [langVideos, level, length, query])

  const pick = (v: Video) => {
    loadLesson(videoUrl(v.id), { lang: v.lang || learnLang, video: v })
  }

  const toggleSave = (v: Video) => {
    if (savedIds.has(v.id)) removeVideo(v.id)
    else saveVideo(v)
  }

  const reset = () => { setLevel('all'); setLength('all'); setQuery('') }
  useEffect(() => {
    if (!getToken() || !list.length) { setFits({}); return }
    let alive = true
    fetchFit(list.slice(0, 60).map((v) => v.id), learnLang)
      .then((r) => { if (alive) setFits(r.fit) })
      .catch(() => {  })
    return () => { alive = false }
  }, [list, learnLang])

  const filtered = level !== 'all' || length !== 'all' || query.trim() !== ''

  return (
    <>
      <h1 className="page-title"><Icon name="film" /> {t('lib.title', { lang: learnLangName })}</h1>
      <p className="page-sub">{t('lib.sub', { n: langVideos.length, lang: learnLangName })}</p>

      {langVideos.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          <div className="big">📺</div>
          {t('lib.empty', { lang: learnLangName })}
        </div>
      ) : (
        <>
          <div className="lib-toolbar">
            <div className="lib-search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('lib.searchPh')} aria-label={t('lib.searchPh')}
              />
              {query && <button className="lib-search-x" onClick={() => setQuery('')} aria-label={t('lib.clear')}><Icon name="x" size={14} /></button>}
            </div>
          </div>

          <div className="lib-filter-row">
            <span className="lib-filter-lbl">{t('lib.byLevel')}</span>
            <div className="chips">
              {levels.map((lv) => (
                <button key={lv} className={'chip' + (lv === level ? ' on' : '')} onClick={() => setLevel(lv)}>
                  {lv === 'all' ? t('lib.all') : lv}
                </button>
              ))}
            </div>
          </div>

          <div className="lib-filter-row">
            <span className="lib-filter-lbl">{t('lib.byLength')}</span>
            <div className="chips">
              {(['all', 'short', 'long'] as const).map((lg) => (
                <button key={lg} className={'chip' + (lg === length ? ' on' : '')} onClick={() => setLength(lg)}>
                  {t('lib.len.' + lg)}
                </button>
              ))}
            </div>
          </div>

          <div className="lib-count">
            <span>{t('lib.count', { n: list.length })}</span>
            {filtered && <button className="link-more" onClick={reset}>{t('lib.reset')}</button>}
          </div>

          {list.length === 0 ? (
            <div className="empty" style={{ marginTop: 8 }}>
              <div className="big">🔍</div>
              {t('lib.noMatch')}
            </div>
          ) : (
            <div className="vgrid" style={{ marginTop: 6 }}>
              {list.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onPick={pick}
                  saved={savedIds.has(v.id)}
                  onToggleSave={toggleSave}
                  saveLabel={savedIds.has(v.id) ? t('lib.saved') : t('lib.save')}
                  fit={fits[v.id]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
