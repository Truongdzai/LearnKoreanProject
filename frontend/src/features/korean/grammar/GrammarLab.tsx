import Icon, { type IconName } from '@/core/components/Icon'
import { useUrlParam } from '@/core/hooks/useTabParam'
import { useAppStore } from '@/store/app.store'
import { VoiceNotice } from '../../english/components/PronunciationLab'
import NumbersLab from '../numbers/NumbersLab'

// Chia đuôi, Trợ từ, Ghép câu sẽ thêm vào đây khi xong và đã kiểm thử
type Pane = 'number'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'number', label: 'Số đếm', icon: 'chart' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]

export default function GrammarLab() {
  const { setView } = useAppStore()
  const [paneRaw, setPane] = useUrlParam('pane', null, (v) => PANE_IDS.includes(v))
  const pane = (paneRaw ?? 'number') as Pane

  return (
    <div className="hg-lab">
      <div className="grammar-intro">
        <Icon name="book" size={20} />
        <div>
          <b>Ngữ pháp & số đếm tiếng Hàn</b>
          <p>
            Người Việt tách số theo hàng nghìn còn người Hàn tách theo hàng vạn, lại có hai hệ số đếm và hàng chục lượng
            từ — đây là chỗ vấp nhiều nhất khi đi chợ, hỏi giờ, nói tuổi. Muốn học quy tắc ngữ pháp theo dạng đề thi thì
            xem 20 viên ngữ pháp ở trang Luyện thi TOPIK.
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
            onClick={() => setPane(p.id === 'number' ? null : p.id)}
          >
            <Icon name={p.icon} size={14} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'number' && <NumbersLab />}
    </div>
  )
}
