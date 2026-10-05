import Icon, { type IconName } from '@/core/components/Icon'
import { useUrlParam } from '@/core/hooks/useTabParam'
import { useAppStore } from '@/store/app.store'
import { VoiceNotice } from '../../english/components/PronunciationLab'
import ConjugationLab from '../conjugate/ConjugationLab'
import ParticleLab from '../particles/ParticleLab'
import NumbersLab from '../numbers/NumbersLab'
import SentenceBuilder from '../builder/SentenceBuilder'

type Pane = 'conj' | 'particle' | 'number' | 'order'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'conj', label: 'Chia đuôi', icon: 'refresh' },
  { id: 'particle', label: 'Trợ từ', icon: 'plus' },
  { id: 'number', label: 'Số đếm', icon: 'chart' },
  { id: 'order', label: 'Ghép câu', icon: 'shuffle' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]

export default function GrammarLab() {
  const { setView } = useAppStore()
  const [paneRaw, setPane] = useUrlParam('pane', null, (v) => PANE_IDS.includes(v))
  const pane = (paneRaw ?? 'conj') as Pane

  return (
    <div className="hg-lab">
      <div className="grammar-intro">
        <Icon name="book" size={20} />
        <div>
          <b>Ngữ pháp tiếng Hàn — luyện tới khi tay tự ra đúng đuôi</b>
          <p>
            Tiếng Việt không chia động từ, không có trợ từ và đếm theo hàng nghìn, nên đây là bốn chỗ người Việt vấp
            nhiều nhất. Mỗi phần sinh câu hỏi không giới hạn từ chính kho từ của lộ trình. Muốn học quy tắc theo dạng
            đề thi thì xem 20 viên ngữ pháp ở trang Luyện thi TOPIK.
          </p>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => setView('topik')}>
              <Icon name="book" size={14} /> Mở 20 viên ngữ pháp TOPIK
            </button>
          </div>
        </div>
      </div>

      <VoiceNotice lang="ko" />

      <div className="vl-modes hg-panes" role="tablist" aria-label="Ngữ pháp tiếng Hàn">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            className={'vl-mode' + (pane === p.id ? ' on' : '')}
            onClick={() => setPane(p.id === 'conj' ? null : p.id)}
          >
            <Icon name={p.icon} size={14} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'conj' && <ConjugationLab />}
      {pane === 'particle' && <ParticleLab />}
      {pane === 'number' && <NumbersLab />}
      {pane === 'order' && <SentenceBuilder />}
    </div>
  )
}
