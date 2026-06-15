import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'

export default function Topbar() {
  const { setView } = useAppStore()
  return (
    <header className="topbar">
      <div className="search">
        <Icon name="search" /> <input placeholder="Tìm video, từ vựng… (sắp có)" />
      </div>

      <div className="topbar-actions">
        <button className="btn-new" onClick={() => setView('home')}>
          <Icon name="plus" /> Bài học mới
        </button>
        <div className="lang-pill">
          <Icon name="flag-kr" /> KO <Icon name="arrow-right" size={14} /> <Icon name="flag-vn" /> VI
        </div>
        <div className="avatar"><Icon name="frog" /></div>
      </div>
    </header>
  )
}
