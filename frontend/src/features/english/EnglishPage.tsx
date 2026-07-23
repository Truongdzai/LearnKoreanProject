import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import ProgramOverview from './components/ProgramOverview'
import IcesLearn from './components/IcesLearn'
import GrammarLessons from './components/GrammarLessons'
import VocabQuiz from './components/VocabQuiz'
import EnglishSummary from './components/EnglishSummary'
import { recordWeekQuiz } from './progress'

type Tab = 'program' | 'learn' | 'grammar' | 'quiz' | 'summary'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'program', label: 'Lộ trình', icon: 'map' },
  { id: 'learn', label: 'Học từ vựng', icon: 'cards' },
  { id: 'grammar', label: 'Ngữ pháp', icon: 'book' },
  { id: 'quiz', label: 'Kiểm tra', icon: 'target' },
  { id: 'summary', label: 'Tóm tắt & xuất', icon: 'note' },
]

interface WeekQuiz {
  week: number
  units: string[]
  pass: number
}

export default function EnglishPage() {
  const [tab, setTab] = useState<Tab>('program')
  const [learnUnit, setLearnUnit] = useState<string | undefined>(undefined)
  const [weekQuiz, setWeekQuiz] = useState<WeekQuiz | null>(null)

  const openLearn = (unitId?: string) => {
    setLearnUnit(unitId)
    setTab('learn')
  }

  const openQuiz = (week: number, units: string[], pass: number) => {
    setWeekQuiz({ week, units, pass })
    setTab('quiz')
  }

  const pickTab = (t: Tab) => {
    if (t === 'quiz') setWeekQuiz(null)
    if (t === 'learn') setLearnUnit(undefined)
    setTab(t)
  }

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Anh · 3 tháng</h2>
        <div className="meta">Quy tắc 3C + phương pháp ICES + ôn tập ngắt quãng.</div>
      </div>

      <div className="en-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => pickTab(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'program' && (
        <ProgramOverview
          onStart={() => openLearn()}
          onLearn={openLearn}
          onQuiz={openQuiz}
          onSummary={() => setTab('summary')}
        />
      )}
      {tab === 'learn' && <IcesLearn initialUnit={learnUnit} />}
      {tab === 'grammar' && <GrammarLessons />}
      {tab === 'quiz' && (weekQuiz ? (
        <VocabQuiz
          key={`w${weekQuiz.week}`}
          units={weekQuiz.units}
          heading={`Bài kiểm tra Tuần ${weekQuiz.week}`}
          passPct={weekQuiz.pass}
          onFinish={(pct) => recordWeekQuiz(weekQuiz.week, pct)}
          onBack={() => { setWeekQuiz(null); setTab('program') }}
        />
      ) : (
        <VocabQuiz />
      ))}
      {tab === 'summary' && <EnglishSummary />}
    </div>
  )
}
