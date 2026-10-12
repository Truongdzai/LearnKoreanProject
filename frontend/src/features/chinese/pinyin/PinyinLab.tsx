import { useCallback, useEffect, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { chineseVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useUrlParam } from '@/core/hooks/useTabParam'
import { useAppStore } from '@/store/app.store'
import { VoiceNotice } from '../../english/components/PronunciationLab'
import { PinyinChart, SpellingRules, ToneCards } from './PinyinLearn'
import { EarPractice, TypingPractice, WritePractice } from './PinyinPractice'
import { usePinyinProgress } from './progress'

type Pane = 'tone' | 'chart' | 'rule' | 'ear' | 'type'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'tone', label: 'Thanh điệu', icon: 'chart' },
  { id: 'chart', label: 'Bảng âm', icon: 'letters' },
  { id: 'rule', label: 'Quy tắc viết', icon: 'note' },
  { id: 'ear', label: 'Luyện nghe', icon: 'headphones' },
  { id: 'type', label: 'Gõ pinyin', icon: 'keyboard' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]

export default function PinyinLab() {
  const { recordEvent } = useAppStore()
  const { state, recordAnswer, finishRound } = usePinyinProgress()
  const [paneRaw, setPane] = useUrlParam('pane', null, (v) => PANE_IDS.includes(v))
  const pane = (paneRaw ?? 'tone') as Pane
  // Chỉ mở bài nghe khi máy chắc chắn có giọng tiếng Trung
  const [canHear, setCanHear] = useState(() => chineseVoiceStatus() === 'ready')
  useEffect(() => onVoicesChanged(() => setCanHear(chineseVoiceStatus() === 'ready')), [])

  const onRound = useCallback((typed = 0) => {
    finishRound(typed)
    recordEvent('review', 1, 0, 0, 'zh')
  }, [finishRound, recordEvent])

  const pairs = Object.entries(state.stats).filter(([k]) => k.includes('-'))
  const pairRight = pairs.reduce((s, [, v]) => s + v[0], 0)
  const pairAll = pairs.reduce((s, [, v]) => s + v[0] + v[1], 0)

  return (
    <div className="hg-lab">
      <div className="grammar-intro">
        <Icon name="letters" size={20} />
        <div>
          <b>Phòng Pinyin — đọc đúng mọi âm tiết, nghe ra thanh điệu</b>
          <p>
            Pinyin là chữ La-tinh ghi âm tiếng Trung: 21 thanh mẫu, khoảng 36 vận mẫu và 4 thanh điệu ghép thành hơn 400 âm tiết.
            Nắm vững nó trong tuần đầu thì mọi từ mới về sau bạn tự đọc được. Phần khó nhất với người Việt là nghe phân biệt
            thanh điệu trong từ hai âm tiết — hãy luyện "Cặp thanh" mỗi ngày vài phút.
          </p>
          <div className="hg-stats">
            <span><b>{state.rounds}</b> lượt luyện</span>
            {pairAll > 0 && <span><b>{Math.round((pairRight / pairAll) * 100)}%</b> nghe đúng cặp thanh</span>}
            {state.typed > 0 && <span><b>{state.typed}</b> từ đã gõ</span>}
          </div>
        </div>
      </div>

      <VoiceNotice lang="zh" />

      <div className="vl-modes hg-panes" role="tablist" aria-label="Phòng Pinyin">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            className={'vl-mode' + (pane === p.id ? ' on' : '')}
            onClick={() => setPane(p.id === 'tone' ? null : p.id)}
          >
            <Icon name={p.icon} size={14} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'tone' && <ToneCards />}
      {pane === 'chart' && <PinyinChart />}
      {pane === 'rule' && (
        <>
          <SpellingRules />
          <WritePractice stats={state.stats} onAnswer={recordAnswer} onRound={onRound} />
        </>
      )}
      {pane === 'ear' && <EarPractice stats={state.stats} onAnswer={recordAnswer} onRound={onRound} canHear={canHear} />}
      {pane === 'type' && <TypingPractice stats={state.stats} onAnswer={recordAnswer} onRound={onRound} canHear={canHear} />}
    </div>
  )
}
