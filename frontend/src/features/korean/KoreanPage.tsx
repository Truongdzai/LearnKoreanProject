import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { KO_UNITS, KO_ALL_WORDS } from '@/data/koreanCore'
import { speakKO } from '@/core/tts'
import IcesLearn from '../english/components/IcesLearn'
import VocabQuiz from '../english/components/VocabQuiz'

type Tab = 'learn' | 'quiz'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'learn', label: 'Học từ vựng', icon: 'cards' },
  { id: 'quiz', label: 'Kiểm tra', icon: 'target' },
]

export default function KoreanPage() {
  const [tab, setTab] = useState<Tab>('learn')

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Hàn · từ vựng lõi</h2>
        <div className="meta">
          Phương pháp ICES (Hình ảnh · Liên tưởng · Ví dụ · Âm thanh) — {KO_ALL_WORDS.length} từ lõi qua {KO_UNITS.length} chủ đề, học tới đâu lưu thẻ ôn tập tới đó.
        </div>
      </div>

      <div className="en-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'learn' && (
        <IcesLearn units={KO_UNITS} speak={speakKO} sourceLabel="Korean Core" lang="ko" />
      )}
      {tab === 'quiz' && (
        <VocabQuiz allUnits={KO_UNITS} allWords={KO_ALL_WORDS} speak={speakKO} lang="ko" />
      )}
    </div>
  )
}
