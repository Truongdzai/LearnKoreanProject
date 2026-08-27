import { useEffect, useState } from 'react'
import FitBadge from './components/FitBadge'
import { useAppStore } from '@/store/app.store'
import { estimateLevel, type LevelResult } from '@/core/api/learn.api'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import Spinner from '@/core/components/Spinner'
import Icon, { type IconName } from '@/core/components/Icon'
import CurrentLine from './components/CurrentLine'
import SubtitleList from './components/SubtitleList'
import SummaryView from './components/SummaryView'
import TranslatePractice from './components/TranslatePractice'
import ShadowingPractice from './components/ShadowingPractice'
import DictationPractice from './components/DictationPractice'
import ClozePractice from './components/ClozePractice'
import DubbingStudio from './components/DubbingStudio'
import type { LearnTab } from '@/core/constants/enum'
import { useTabs } from '@/core/a11y'

const TABS: { id: LearnTab; ic: IconName; label: string }[] = [
  { id: 'shadowing', ic: 'film', label: 'learn.tab.watch' },
  { id: 'phatam', ic: 'mic', label: 'learn.tab.speak' },
  { id: 'chepchinhta', ic: 'headphones', label: 'learn.tab.dictation' },
  { id: 'dienkhuyet', ic: 'target', label: 'learn.tab.cloze' },
  { id: 'dubbing', ic: 'mic', label: 'learn.tab.dubbing' },
  { id: 'luyendich', ic: 'globe', label: 'learn.tab.translate' },
  { id: 'tomtat', ic: 'note', label: 'learn.tab.summary' },
]
const TAB_IDS = TABS.map((t) => t.id)

export default function LearnPage() {
  const { lesson, status, statusError, setView, t, learnLang, learnLangName } = useAppStore()
  const [tab, setTab] = useState<LearnTab>('shadowing')
  const [active, setActive] = useState(-1)
  const [level, setLevel] = useState<LevelResult | null>(null)
  const [levelBusy, setLevelBusy] = useState(false)
  const yt = useYouTubePlayer()
  const tabs = useTabs('learn', TAB_IDS, tab, setTab)

  useEffect(() => {
    if (lesson) {
      setActive(-1)
      setLevel(null)
      yt.load(lesson.id)
    }
  }, [lesson])

  useEffect(() => {
    if (lesson && tab === 'shadowing') yt.load(lesson.id)
  }, [tab, lesson])

  const askLevel = async () => {
    if (!lesson || levelBusy || level) return
    setLevelBusy(true)
    try {
      const text = lesson.segments.map((s) => s.ko).join(' ')
      setLevel(await estimateLevel(lesson.id, learnLang, text))
    } catch {} finally {
      setLevelBusy(false)
    }
  }

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
      <div className="drawer-plate lesson-plate">
        <div className="drawer-label">
          <span className="drawer-label-sub">{t('learn.drawer')}</span>
          <b>{learnLangName}</b>
        </div>
        <div className="drawer-count">
          <b>{lesson.segments.length}</b>
          <span>{t('learn.linesUnit')}</span>
        </div>
        <div className="lesson-plate-lvl">
          {level ? (
            <span className="cefr-chip on" title={level.reason}><Icon name="chart" size={13} /> CEFR {level.level}</span>
          ) : (
            <button className="cefr-chip" disabled={levelBusy} onClick={askLevel}>
              <Icon name="chart" size={13} /> {levelBusy ? t('gx.levelBusy') : t('gx.levelBtn')}
            </button>
          )}
        </div>
      </div>
      <div className="lesson-head">
        <h2>{lesson.title}</h2>
        <div className="meta">{t('learn.source', { src: lesson.source, n: lesson.segments.length })}</div>
        {level?.reason && <div className="cefr-reason">{level.reason}</div>}
        <FitBadge videoId={lesson.id} lang={learnLang} />
      </div>

      <div className="learn-tabs" {...tabs.list}>
        {TABS.map((tb) => (
          <button key={tb.id} {...tabs.tab(tb.id)} className={tab === tb.id ? 'on' : ''} onClick={() => setTab(tb.id)}>
            <Icon name={tb.ic} /> {t(tb.label)}
          </button>
        ))}
      </div>

      <div {...tabs.panel(tab)}>
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
      ) : tab === 'dienkhuyet' ? (
        <ClozePractice lesson={lesson} />
      ) : tab === 'dubbing' ? (
        <DubbingStudio lesson={lesson} />
      ) : tab === 'tomtat' ? (
        <SummaryView lesson={lesson} />
      ) : (
        <TranslatePractice lesson={lesson} />
      )}
      </div>
    </>
  )
}
