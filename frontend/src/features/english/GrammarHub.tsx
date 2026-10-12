import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { clearUrlParams, useUrlParam } from '@/core/hooks/useTabParam'
import GrammarLessons from './components/GrammarLessons'
import { VoiceNotice } from './components/PronunciationLab'
import IrregularLab from './irregular/IrregularLab'
import EnNumbersLab from './numbers/EnNumbersLab'
import SentenceBuilder from './builder/SentenceBuilder'

type Pane = 'lessons' | 'order' | 'verbs' | 'numbers'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'lessons', label: '18 bài ngữ pháp', icon: 'book' },
  { id: 'order', label: 'Ghép câu', icon: 'shuffle' },
  { id: 'verbs', label: 'Động từ bất quy tắc', icon: 'refresh' },
  { id: 'numbers', label: 'Số đếm & giờ giấc', icon: 'chart' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]

interface Props {
  initialLesson?: string
}

// Tab Ngữ pháp: bài học theo chủ điểm + phòng luyện riêng (?pane=)
export default function GrammarHub({ initialLesson }: Props) {
  const [paneRaw, setPane] = useUrlParam('pane', null, (v) => PANE_IDS.includes(v))
  const pane = (paneRaw ?? 'lessons') as Pane
  // Bài được mở từ lộ trình chỉ mở một lần; quay lại mục bài học thì về danh sách
  const [seed, setSeed] = useState(initialLesson)
  const [nonce, setNonce] = useState(0)

  const pick = (p: Pane) => {
    clearUrlParams(['lesson'])
    setSeed(undefined)
    setNonce((n) => n + 1)
    setPane(p === 'lessons' ? null : p)
  }

  return (
    <div className="en-grammar-hub">
      <div className="vl-modes hg-panes" role="tablist" aria-label="Ngữ pháp tiếng Anh">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            className={'vl-mode' + (pane === p.id ? ' on' : '')}
            onClick={() => pick(p.id)}
          >
            <Icon name={p.icon} size={14} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'lessons' && <GrammarLessons key={nonce} initialLesson={seed} />}
      {pane !== 'lessons' && <VoiceNotice lang="en" />}
      {pane === 'order' && <SentenceBuilder />}
      {pane === 'verbs' && <IrregularLab />}
      {pane === 'numbers' && <EnNumbersLab />}
    </div>
  )
}
