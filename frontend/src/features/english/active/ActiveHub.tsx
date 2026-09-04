import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { CHUNK_COUNT, PACKS, PACK_COUNT } from '@/data/englishActive'
import { useMastery } from './mastery'
import Method from './Method'
import Today from './Today'
import Gym from './Gym'
import Output from './Output'
import ChunkLibrary from './ChunkLibrary'
import MasteryBoard from './MasteryBoard'
import { useTabParam } from '@/core/hooks/useTabParam'

type Pane = 'method' | 'today' | 'gym' | 'output' | 'library' | 'board'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Buổi hôm nay', icon: 'play' },
  { id: 'gym', label: 'Phòng tập phản xạ', icon: 'flame' },
  { id: 'output', label: 'Nói & viết ra', icon: 'mic' },
  { id: 'library', label: 'Kho cụm', icon: 'cards' },
  { id: 'board', label: 'Bảng làm chủ', icon: 'chart' },
  { id: 'method', label: 'Vì sao học kiểu này', icon: 'bulb' },
]
const PANE_IDS = PANES.map((p) => p.id)

interface Props {
  onErrors?: () => void
  onDeep?: (term: string) => void
}

export default function ActiveHub({ onErrors, onDeep }: Props) {
  const { state, stats } = useMastery()
  const [pane, setPane] = useTabParam<Pane>(PANE_IDS, 'today', 'pane')
  const [packId, setPackId] = useState(state.goal || PACKS[0].id)

  return (
    <div className="ac-hub">
      <div className="ac-hub-intro">
        <Icon name="sparkles" size={18} />
        <div>
          <b>Tiếng Anh chủ động — biến từ đã học thành câu bật ra được</b>
          <span>
            {CHUNK_COUNT} cụm nói thật trong {PACK_COUNT} gói tình huống, mỗi cụm được kiểm ở năm chiều
            khác nhau và bấm giờ phản xạ. Đây là chỗ vốn từ ở tab Học từ vựng chuyển thành lời nói.
          </span>
        </div>
        <div className="ac-hub-stat">
          <div><b>{stats.active}</b><span>cụm chủ động</span></div>
          <div><b>{stats.automatic}</b><span>bật ra tự động</span></div>
          <div><b>{stats.due}</b><span>tới hạn ôn</span></div>
        </div>
      </div>

      <div className="ac-hub-tabs" role="tablist">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            className={'ac-hub-tab' + (pane === p.id ? ' on' : '')}
            onClick={() => setPane(p.id)}
          >
            <Icon name={p.icon} size={15} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'today' && (
        <Today
          onGoBoard={() => setPane('board')}
          onGoErrors={onErrors}
          onGoPacks={() => setPane('library')}
        />
      )}
      {pane === 'gym' && <Gym />}
      {pane === 'output' && <Output />}
      {pane === 'library' && (
        <ChunkLibrary
          packId={packId}
          onPack={setPackId}
          onScene={() => setPane('today')}
          onDrill={() => setPane('gym')}
          onDeepWord={onDeep}
        />
      )}
      {pane === 'board' && (
        <MasteryBoard
          onOpenPack={(id) => { setPackId(id); setPane('library') }}
          onDrillDue={() => setPane('gym')}
        />
      )}
      {pane === 'method' && <Method onStart={() => setPane('today')} />}
    </div>
  )
}
