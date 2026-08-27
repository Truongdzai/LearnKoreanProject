import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { videoUrl } from '@/data/videos'
import { getToken } from '@/core/api/client'
import { fetchFit, type FitScore } from '@/core/api/tutor.api'
import VideoCard from '@/features/shared/VideoCard'
import LinkMaker from '@/features/learn/components/LinkMaker'
import FilterMenu, { type FilterOption } from './components/FilterMenu'
import Icon from '@/core/components/Icon'
import { useReveal } from '@/core/hooks/useReveal'
import { useAppStore } from '@/store/app.store'
import { VIDEO_TOPICS } from '@/core/constants/topics'
import type { Video } from '@/models/video.model'

function durationMins(dur: string): number {
  const parts = dur.split(':').map((n) => parseInt(n, 10) || 0)
  if (parts.length === 3) return parts[0] * 60 + parts[1]
  if (parts.length === 2) return parts[0]
  return 0
}

const d = (ms: number) => ({ '--d': `${ms}ms` } as CSSProperties)

export default function LibraryPage() {
  const { loadLesson, videos, learnLang, t, learnLangName, savedVideos, saveVideo, removeVideo } = useAppStore()
  const [level, setLevel] = useState<string>('all')
  const [length, setLength] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('')
  const [grouped, setGrouped] = useState(true)
  const reveal = useReveal<HTMLDivElement>()

  const langVideos = useMemo(
    () => videos.filter((v) => (v.lang || 'ko') === learnLang),
    [videos, learnLang],
  )

  const levels = useMemo(() => {
    const set = new Set<string>()
    langVideos.forEach((v) => v.level && set.add(v.level))
    return ['all', ...Array.from(set).sort()]
  }, [langVideos])

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    langVideos.forEach((v) => (v.tags || []).forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1 }))
    return counts
  }, [langVideos])

  const openTopics = useMemo(
    () => VIDEO_TOPICS.filter((tp) => (topicCounts[tp.id] || 0) > 0),
    [topicCounts],
  )

  const savedIds = useMemo(() => new Set(savedVideos.map((v) => v.id)), [savedVideos])
  const [fits, setFits] = useState<Record<string, FitScore>>({})

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return langVideos.filter((v) => {
      if (topic && !(v.tags || []).includes(topic)) return false
      if (level !== 'all' && v.level !== level) return false
      if (length !== 'all') {
        const m = durationMins(v.dur)
        if (length === 'mini' && m >= 5) return false
        if (length === 'short' && m < 5) return false
      }
      if (q && !(`${v.title} ${v.channel} ${v.topic}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [langVideos, topic, level, length, query])

  const pick = (v: Video) => {
    loadLesson(videoUrl(v.id), { lang: v.lang || learnLang, video: v })
  }

  const toggleSave = (v: Video) => {
    if (savedIds.has(v.id)) removeVideo(v.id)
    else saveVideo(v)
  }

  const reset = () => { setLevel('all'); setLength('all'); setQuery(''); setTopic('') }

  useEffect(() => {
    if (!getToken() || !list.length) { setFits({}); return }
    let alive = true
    fetchFit(list.slice(0, 60).map((v) => v.id), learnLang)
      .then((r) => { if (alive) setFits(r.fit) })
      .catch(() => {  })
    return () => { alive = false }
  }, [list, learnLang])

  const filtered = level !== 'all' || length !== 'all' || query.trim() !== '' || topic !== ''
  const showRows = grouped && !filtered && openTopics.length > 1

  const topicOpts: FilterOption[] = [
    { id: '', label: t('lib.all'), n: langVideos.length },
    ...openTopics.map((tp) => ({ id: tp.id, label: t(tp.labelKey), n: topicCounts[tp.id] })),
  ]
  const levelOpts: FilterOption[] = levels.map((lv) => ({
    id: lv,
    label: lv === 'all' ? t('lib.all') : lv,
    n: lv === 'all' ? langVideos.length : langVideos.filter((v) => v.level === lv).length,
  }))
  const lengthOpts: FilterOption[] = (['all', 'mini', 'short'] as const).map((lg) => ({
    id: lg, label: t('lib.len.' + lg),
  }))

  const card = (v: Video, rv?: CSSProperties) => (
    <VideoCard
      key={v.id}
      video={v}
      onPick={pick}
      saved={savedIds.has(v.id)}
      onToggleSave={toggleSave}
      saveLabel={savedIds.has(v.id) ? t('lib.saved') : t('lib.save')}
      fit={fits[v.id]}
      rv={rv}
    />
  )

  return (
    <div className="lib" ref={reveal}>
      <div className="drawer-plate">
        <div className="drawer-label">
          <span className="drawer-label-sub">{t('lib.drawer')}</span>
          <b>{learnLangName}</b>
        </div>
        <div className="drawer-count">
          <b>{langVideos.length}</b>
          <span>{t('lib.cardsUnit')}</span>
        </div>
      </div>
      <p className="drawer-note">{t('lib.title', { lang: learnLangName })}</p>

      <LinkMaker />

      {langVideos.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          <Icon name="tv" size={30} />
          {t('lib.empty', { lang: learnLangName })}
        </div>
      ) : (
        <>
          <div className="lib-bar">
            <div className="lib-search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('lib.searchPh')} aria-label={t('lib.searchPh')}
              />
              {query && (
                <button className="lib-search-x" onClick={() => setQuery('')} aria-label={t('lib.clear')}>
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
            <FilterMenu label={t('lib.byTopic')} options={topicOpts} value={topic} onPick={setTopic} />
            <FilterMenu label={t('lib.byLevel')} options={levelOpts} value={level} onPick={setLevel} />
            <FilterMenu label={t('lib.byLength')} options={lengthOpts} value={length} onPick={setLength} />
            {filtered && (
              <button className="lib-clear" onClick={reset}>
                <Icon name="x" size={13} /> {t('lib.reset')}
              </button>
            )}
          </div>

          <div className="lib-count">
            <b>{t('lib.count', { n: list.length })}</b>
            {openTopics.length > 1 && !filtered && (
              <div className="lib-seg" role="group">
                <button className={grouped ? 'on' : ''} onClick={() => setGrouped(true)}>{t('lib.viewTopics')}</button>
                <button className={grouped ? '' : 'on'} onClick={() => setGrouped(false)}>{t('lib.viewAll')}</button>
              </div>
            )}
          </div>

          {list.length === 0 ? (
            <div className="empty" style={{ marginTop: 8 }}>
              <Icon name="search" size={28} />
              {t('lib.noMatch')}
            </div>
          ) : showRows ? (
            <div className="lib-rows">
              {openTopics.map((tp) => {
                const items = list.filter((v) => (v.tags || []).includes(tp.id))
                if (!items.length) return null
                return (
                  <section key={tp.id} className="lib-row" data-rv>
                    <div className="lib-row-head">
                      <span className="lib-row-bar" aria-hidden="true" />
                      <h2>{t(tp.labelKey)}</h2>
                      <span className="lib-row-n">{t('lib.rowCount', { n: items.length })}</span>
                      <button className="lib-row-all" onClick={() => setTopic(tp.id)}>
                        {t('lib.seeAllShort')} <Icon name="arrow-right" size={13} />
                      </button>
                    </div>
                    <div className="lib-row-scroll">
                      {items.slice(0, 12).map((v) => card(v))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="vgrid" style={{ marginTop: 6 }}>
              {list.map((v, k) => card(v, d(Math.min(k, 7) * 55)))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
