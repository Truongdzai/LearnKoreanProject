import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'
import type { NavItem } from '@/types'

const NAV: NavItem[] = [
  { id: 'home', icon: 'home', label: 'Trang chủ' },
  { id: 'library', icon: 'film', label: 'Kho video' },
  { id: 'myvideos', icon: 'tv', label: 'Video của tôi' },
  { id: 'courses', icon: 'book', label: 'Khoá học' },
  { id: 'vocab', icon: 'cards', label: 'Ôn tập' },
  { id: 'dashboard', icon: 'chart', label: 'Trạng thái' },
  { id: 'pricing', icon: 'rocket', label: 'Nâng cấp' },
]

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function Sidebar() {
  const { view, setView } = useAppStore()
  const todayIdx = (new Date().getDay() + 6) % 7

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo"><Icon name="frog" /></div>
        <div className="name">
          Trường Học<br /><b>Ngoại Ngữ</b>
          <small>Học ngoại ngữ qua video</small>
        </div>
      </div>

      <div>
        <div className="s-label">Chuỗi ngày học</div>
        <div className="streak">
          <div className="streak-days">
            {DAYS.map((d, i) => (
              <div key={d} className={'day' + (i === todayIdx ? ' on' : '')}>
                <span className="star"><Icon name="star" size={14} /></span>
                <span className="lbl">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map((n) => (
          <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => setView(n.id)}>
            <span className="ic"><Icon name={n.icon} size={19} /></span> {n.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="tip-card">
        <Icon name="bulb" /> <b>Mẹo:</b> dán link YouTube tiếng Hàn ở trang chủ để tạo bài học có phụ đề Hàn–Việt ngay.
      </div>
    </aside>
  )
}
