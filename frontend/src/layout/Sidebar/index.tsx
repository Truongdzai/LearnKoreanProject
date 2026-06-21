import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import Flag from '@/core/components/Flag'
import type { NavItem } from '@/types'

const NAV: NavItem[] = [
  { id: 'home', icon: 'home', label: 'Trang chủ' },
  { id: 'library', icon: 'film', label: 'Kho video' },
  { id: 'myvideos', icon: 'tv', label: 'Video của tôi' },
  { id: 'path', icon: 'map', label: 'Lộ trình' },
  { id: 'speaking', icon: 'mic', label: 'Luyện nói' },
  { id: 'lingo', icon: 'trending', label: 'Hot Lingo' },
  { id: 'vocab', icon: 'cards', label: 'Từ vựng' },
  { id: 'flashcards', icon: 'letters', label: 'Ôn tập' },
  { id: 'activities', icon: 'chart', label: 'Hoạt động' },
  { id: 'leaderboard', icon: 'trophy', label: 'Bảng xếp hạng' },
  { id: 'quests', icon: 'target', label: 'Nhiệm vụ' },
  { id: 'shop', icon: 'store', label: 'Cửa hàng' },
  { id: 'garden', icon: 'sprout', label: 'Vườn của tôi' },
]

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const LANGS = ['ja', 'en', 'zh', 'ko', 'de']

export default function Sidebar() {
  const { view, setView, user } = useAppStore()
  const todayIdx = (new Date().getDay() + 6) % 7
  const [lang, setLang] = useState('ko')

  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => setView('home')} role="button">
        <div className="brand-logo"><Logo size={42} /></div>
        <div className="name">
          <b>VyLing</b>
          <small>Học ngoại ngữ qua video</small>
        </div>
      </div>

      <div>
        <div className="s-label"><Icon name="flame" size={12} /> Chuỗi {user.streak} ngày</div>
        <div className="streak">
          <div className="streak-days">
            {DAYS.map((d, i) => (
              <div key={d} className={'day' + (i <= todayIdx && i >= todayIdx - user.streak + 1 ? ' on' : '')}>
                <span className="star"><Icon name="star" size={14} /></span>
                <span className="lbl">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="s-label"><Icon name="globe" size={12} /> Ngôn ngữ</div>
        <div className="lang-row">
          {LANGS.map((f) => (
            <button key={f} className={'lang-flag-btn' + (lang === f ? ' on' : '')} onClick={() => setLang(f)}>
              <Flag code={f} size={26} />
            </button>
          ))}
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

      {!user.isPlus && (
        <button className="upgrade-btn" onClick={() => setView('pricing')}>
          <Icon name="sparkles" size={16} /> Nâng cấp Plus
        </button>
      )}
    </aside>
  )
}
