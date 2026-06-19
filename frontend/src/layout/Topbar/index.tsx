import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'

export default function Topbar() {
  const { setView, openLookup, theme, toggleTheme, user } = useAppStore()
  const [q, setQ] = useState('')

  return (
    <header className="topbar">
      <button className="lookup-trigger" onClick={() => openLookup()} title="Tra cứu từ vựng với AI">
        <Icon name="vyling" size={20} />
      </button>

      <div className="search">
        <Icon name="search" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && q.trim() && openLookup(q.trim())}
          placeholder="Tra cứu từ vựng tiếng Hàn…"
        />
      </div>

      <div className="topbar-actions">
        <button className="coin-pill" onClick={() => setView('shop')} title="Xu của bạn">
          <Icon name="coin" size={17} /> {user.coins.toLocaleString('vi')}
        </button>

        <button className="btn-myvideos" onClick={() => setView('myvideos')}>
          <Icon name="tv" size={16} /> Video của tôi
        </button>

        <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        <div className="lang-pill">
          <Icon name="flag-kr" /> KO <Icon name="arrow-right" size={14} /> <Icon name="flag-vn" /> VI
        </div>

        <Avatar size={38} frame={user.equippedFrame} />
      </div>
    </header>
  )
}
