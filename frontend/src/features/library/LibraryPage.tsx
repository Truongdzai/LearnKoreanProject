import { useEffect, useMemo, useState } from 'react'
import { videoUrl } from '@/data/videos'
import { getToken } from '@/core/api/client'
import { fetchFit, type FitScore } from '@/core/api/tutor.api'
import VideoCard from '@/features/shared/VideoCard'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { VIDEO_TOPICS } from '@/core/constants/topics'
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
  const [topic, setTopic] = useState('')
  const [grouped, setGrouped] = useState(true)

  const langVideos = useMemo(
    () => videos.filter((v) => (v.lang || 'ko') === learnLang),
    [videos, learnLang],
  )

  const levels = useMemo(() => {
    const set = new Set<string>()
    langVideos.forEach((v) => v.level && set.add(v.level))
    return ['all', ...Array.from(set)]
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
        if (length === 'short' && m > 10) return false
        if (length === 'long' && m <= 10) return false
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

  const card = (v: Video) => (
    <VideoCard
      key={v.id}
      video={v}
      onPick={pick}
      saved={savedIds.has(v.id)}
      onToggleSave={toggleSave}
      saveLabel={savedIds.has(v.id) ? t('lib.saved') : t('lib.save')}
      fit={fits[v.id]}
    />
  )

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

          {openTopics.length > 1 && (
            <div className="lib-filter-row lib-topics">
              <span className="lib-filter-lbl">{t('lib.byTopic')}</span>
              <div className="chips">
                <button className={'chip' + (topic ? '' : ' on')} onClick={() => setTopic('')}>
                  {t('lib.all')}
                </button>
                {openTopics.map((tp) => (
                  <button
                    key={tp.id}
                    className={'chip' + (topic === tp.id ? ' on' : '')}
                    onClick={() => setTopic(topic === tp.id ? '' : tp.id)}
                  >
                    {t(tp.labelKey)} <span className="chip-n">{topicCounts[tp.id]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
            {openTopics.length > 1 && !filtered && (
              <div className="lib-viewtoggle">
                <button className={'chip' + (grouped ? ' on' : '')} onClick={() => setGrouped(true)}>
                  {t('lib.viewTopics')}
                </button>
                <button className={'chip' + (grouped ? '' : ' on')} onClick={() => setGrouped(false)}>
                  {t('lib.viewAll')}
                </button>
              </div>
            )}
            {filtered && <button className="link-more" onClick={reset}>{t('lib.reset')}</button>}
          </div>

          {list.length === 0 ? (
            <div className="empty" style={{ marginTop: 8 }}>
              <div className="big">🔍</div>
              {t('lib.noMatch')}
            </div>
          ) : showRows ? (
            <div className="lib-rows">
              {openTopics.map((tp) => {
                const items = list.filter((v) => (v.tags || []).includes(tp.id))
                if (!items.length) return null
                return (
                  <section key={tp.id} className="lib-row">
                    <div className="lib-row-head">
                      <span className="lib-row-bar" aria-hidden="true" />
                      <h2>{t(tp.labelKey)}</h2>
                      <span className="lib-row-n">{t('lib.rowCount', { n: items.length })}</span>
                      <button className="lib-row-all" onClick={() => setTopic(tp.id)}>
                        {t('lib.seeAllShort')} <Icon name="arrow-right" size={13} />
                      </button>
                    </div>
                    <div className="lib-row-scroll">
                      {items.slice(0, 12).map(card)}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="vgrid" style={{ marginTop: 6 }}>
              {list.map(card)}
            </div>
          )}
        </>
      )}
    </>
  )
}
