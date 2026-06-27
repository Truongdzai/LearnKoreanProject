import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import ProgramOverview from './components/ProgramOverview'
import IcesLearn from './components/IcesLearn'
import VocabQuiz from './components/VocabQuiz'
import EnglishSummary from './components/EnglishSummary'

type Tab = 'program' | 'learn' | 'quiz' | 'summary'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'program', label: 'Lộ trình', icon: 'map' },
  { id: 'learn', label: 'Học từ vựng', icon: 'cards' },
  { id: 'quiz', label: 'Kiểm tra', icon: 'target' },
  { id: 'summary', label: 'Tóm tắt & xuất', icon: 'note' },
]

export default function EnglishPage() {
  const [tab, setTab] = useState<Tab>('program')

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Anh · 3 tháng</h2>
        <div className="meta">Quy tắc 3C + phương pháp ICES + ôn tập ngắt quãng.</div>
      </div>

      <div className="en-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'program' && <ProgramOverview onStart={() => setTab('learn')} />}
      {tab === 'learn' && <IcesLearn />}
      {tab === 'quiz' && <VocabQuiz />}
      {tab === 'summary' && <EnglishSummary />}
    </div>
  )
}
