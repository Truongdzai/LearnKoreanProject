import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import Spinner from '@/core/components/Spinner'
import Icon, { type IconName } from '@/core/components/Icon'
import CurrentLine from './components/CurrentLine'
import SubtitleList from './components/SubtitleList'
import SummaryView from './components/SummaryView'
import TranslatePractice from './components/TranslatePractice'
import ShadowingPractice from './components/ShadowingPractice'
import DictationPractice from './components/DictationPractice'
import DubbingStudio from './components/DubbingStudio'
import type { LearnTab } from '@/core/constants/enum'

const TABS: { id: LearnTab; ic: IconName; label: string }[] = [
  { id: 'shadowing', ic: 'film', label: 'Shadowing' },
  { id: 'phatam', ic: 'mic', label: 'learn.tab.speak' },
  { id: 'chepchinhta', ic: 'headphones', label: 'learn.tab.dictation' },
  { id: 'dubbing', ic: 'mic', label: 'Dubbing Studio' },
  { id: 'luyendich', ic: 'globe', label: 'learn.tab.translate' },
  { id: 'tomtat', ic: 'note', label: 'learn.tab.summary' },
]

export default function LearnPage() {
  const { lesson, status, statusError, setView, t } = useAppStore()
  const [tab, setTab] = useState<LearnTab>('shadowing')
  const [active, setActive] = useState(-1)
  const yt = useYouTubePlayer()

  useEffect(() => {
    if (lesson) {
      setActive(-1)
      yt.load(lesson.id)
    }
  }, [lesson])

  useEffect(() => {
    if (!lesson) return
    const segs = lesson.segments
    const iv = setInterval(() => {
      const t = yt.getTime()
      if (t == null) return
      let idx = -1
      for (let i = 0; i < segs.length; i++) {
        if (segs[i].start <= t + 0.2) idx = i
        else break
      }
      setActive((prev) => (prev === idx ? prev : idx))
    }, 300)
    return () => clearInterval(iv)
  }, [lesson])

  if (!lesson) {
    return (
      <div className="center-state">
        <div>
          {statusError ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 10, color: 'var(--bad)' }}><Icon name="frown" /></div>
              <p style={{ color: 'var(--bad)', fontWeight: 600 }}>{status}</p>
              <button className="btn-new" onClick={() => setView('home')}><Icon name="arrow-left" /> {t('learn.backHome')}</button>
            </>
          ) : (
            <>
              <Spinner />
              <p>{status || t('learn.preparing')}</p>
            </>
          )}
        </div>
      </div>
    )
  }

  const cur = active >= 0 ? lesson.segments[active] : lesson.segments[0]
  const source = lesson.title + ' (youtube:' + lesson.id + ')'

  return (
    <>
      <div className="lesson-head">
        <h2>{lesson.title}</h2>
        <div className="meta">{t('learn.source', { src: lesson.source, n: lesson.segments.length })}</div>
      </div>

      <div className="learn-tabs">
        {TABS.map((tb) => (
          <button key={tb.id} className={tab === tb.id ? 'on' : ''} onClick={() => setTab(tb.id)}>
            <Icon name={tb.ic} /> {tb.label.includes('.') ? t(tb.label) : tb.label}
          </button>
        ))}
      </div>

      {tab === 'shadowing' ? (
        <div className="learn-grid">
          <div className="player-col">
            <div className="player-wrap"><div id="player" /></div>
            <CurrentLine segment={cur} />
          </div>
          <SubtitleList
            segments={lesson.segments}
            activeIndex={active}
            source={source}
            onSeek={yt.seek}
          />
        </div>
      ) : tab === 'phatam' ? (
        <ShadowingPractice lesson={lesson} />
      ) : tab === 'chepchinhta' ? (
        <DictationPractice lesson={lesson} />
      ) : tab === 'dubbing' ? (
        <DubbingStudio lesson={lesson} />
      ) : tab === 'tomtat' ? (
        <SummaryView lesson={lesson} />
      ) : (
        <TranslatePractice lesson={lesson} />
      )}
    </>
  )
}
