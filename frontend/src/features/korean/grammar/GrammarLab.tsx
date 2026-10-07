import Icon, { type IconName } from '@/core/components/Icon'
import { useUrlParam } from '@/core/hooks/useTabParam'
import { useAppStore } from '@/store/app.store'
import { VoiceNotice } from '../../english/components/PronunciationLab'
import ConjugationLab from '../conjugate/ConjugationLab'
import NumbersLab from '../numbers/NumbersLab'
import ParticleLab from '../particles/ParticleLab'

// Ghép câu sẽ thêm vào đây khi xong và đã kiểm thử
type Pane = 'conj' | 'part' | 'number'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'conj', label: 'Chia đuôi', icon: 'tool' },
  { id: 'part', label: 'Trợ từ', icon: 'note' },
  { id: 'number', label: 'Số đếm', icon: 'chart' },
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
          <b>Ngữ pháp tiếng Hàn</b>
          <p>
            Ba chỗ người Việt vấp nhiều nhất khi bắt đầu nói: chia đuôi động từ (nhất là các nhóm bất quy tắc), trợ từ
            (에 hay 에서, 은/는 hay 이/가) và số đếm (tách theo hàng vạn, hai hệ số, hàng chục lượng từ). Muốn học quy tắc
            ngữ pháp theo dạng đề thi thì xem 20 viên ngữ pháp ở trang Luyện thi TOPIK.
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
      {pane === 'part' && <ParticleLab />}
      {pane === 'number' && <NumbersLab />}
    </div>
  )
}
