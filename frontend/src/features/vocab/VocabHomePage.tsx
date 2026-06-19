import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { TopikLevel } from '@/core/constants/enum'

const LEVELS: TopikLevel[] = ['Toàn bộ', 'TOPIK1', 'TOPIK2', 'TOPIK3', 'TOPIK4', 'TOPIK5', 'TOPIK6']
const CATS = ['Tất cả danh mục', 'Theo video', 'Đồ ăn', 'Nhà hàng', 'Khách sạn', 'Du lịch', 'Công việc']

interface Deck {
  id: string
  name: string
  level: TopikLevel
  cat: string
  count: number
  by: string
  tone: string
}

const DECKS: Deck[] = [
  { id: 'd1', name: 'Chào hỏi & giới thiệu', level: 'TOPIK1', cat: 'Theo video', count: 42, by: 'VyLing', tone: 'tone-a' },
  { id: 'd2', name: 'Gọi món ở nhà hàng', level: 'TOPIK1', cat: 'Nhà hàng', count: 58, by: 'Cộng đồng', tone: 'tone-c' },
  { id: 'd3', name: 'Đặt phòng khách sạn', level: 'TOPIK2', cat: 'Khách sạn', count: 47, by: 'Cộng đồng', tone: 'tone-b' },
  { id: 'd4', name: 'Du lịch & hỏi đường', level: 'TOPIK2', cat: 'Du lịch', count: 64, by: 'VyLing', tone: 'tone-d' },
  { id: 'd5', name: 'Từ vựng công sở', level: 'TOPIK3', cat: 'Công việc', count: 80, by: 'Cộng đồng', tone: 'tone-f' },
  { id: 'd6', name: 'Đồ ăn Hàn Quốc', level: 'TOPIK1', cat: 'Đồ ăn', count: 53, by: 'VyLing', tone: 'tone-e' },
  { id: 'd7', name: 'Thành ngữ trung cấp', level: 'TOPIK4', cat: 'Tất cả danh mục', count: 96, by: 'Cộng đồng', tone: 'tone-a' },
  { id: 'd8', name: 'Luyện thi TOPIK II', level: 'TOPIK5', cat: 'Tất cả danh mục', count: 120, by: 'VyLing', tone: 'tone-b' },
]

export default function VocabHomePage() {
  const { user, setView } = useAppStore()
  const [level, setLevel] = useState<TopikLevel>('Toàn bộ')
  const [cat, setCat] = useState('Tất cả danh mục')
  const [q, setQ] = useState('')

  const decks = DECKS.filter(
    (d) =>
      (level === 'Toàn bộ' || d.level === level) &&
      (cat === 'Tất cả danh mục' || d.cat === cat) &&
      d.name.toLowerCase().includes(q.toLowerCase()),
  )

  const plusGate = (action: () => void) => () => (user.isPlus ? action() : setView('pricing'))

  return (
    <div className="vocab-home">
      <h1 className="page-title"><Icon name="cards" /> Từ vựng</h1>
      <p className="page-sub">Học, ôn tập và quản lý kho từ vựng của bạn theo cấp độ TOPIK.</p>

      <div className="vh-stats">
        <div className="vh-stat">
          <div className="vh-stat-top">Tổng số từ vựng</div>
          <b>248</b>
          <p>Chủ đề: theo video, đồ ăn, nhà hàng, khách sạn, du lịch…</p>
          <button className="btn-ghost sm" onClick={() => setView('flashcards')}>Xem lại từ vựng</button>
        </div>
        <div className="vh-stat warn">
          <div className="vh-stat-top">Từ vựng cần ôn tập</div>
          <b>36</b>
          <p>Ôn đúng lúc giúp nhớ 50–80% lâu hơn so với học dồn.</p>
          <button className="btn-primary sm" onClick={() => setView('flashcards')}>Ôn ngay</button>
        </div>
      </div>

      <div className="vh-actions">
        <button className="vh-big play" onClick={() => setView('flashcards')}>
          <span className="vh-big-ic"><Icon name="play" size={26} /></span>
          <b>Học từ vựng</b>
          <span className="vh-big-go">Bắt đầu</span>
        </button>
        <button className="vh-big quiz" onClick={() => setView('flashcards')}>
          <span className="vh-big-ic"><Icon name="target" size={26} /></span>
          <b>Kiểm tra</b>
          <span className="vh-big-go">Bắt đầu</span>
        </button>
        <div className="vh-side">
          <button onClick={() => setView('flashcards')}><Icon name="plus" size={16} /> Thêm từ vựng mới</button>
          <button onClick={() => setView('flashcards')}><Icon name="cards" size={16} /> Tạo chủ đề</button>
          <button onClick={plusGate(() => {})}><Icon name="upload" size={16} /> Import từ (docx/pdf){!user.isPlus && <Icon name="lock" size={12} />}</button>
          <button onClick={plusGate(() => {})}><Icon name="copy" size={16} /> Export CSV{!user.isPlus && <Icon name="lock" size={12} />}</button>
        </div>
      </div>

      <div className="section-title">
        <span className="pin" /> Flashcard phổ biến
        <div className="vh-search"><Icon name="search" size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập để tìm kiếm" /></div>
      </div>

      <div className="vh-filters">
        <div className="vh-filter-label">Cấp độ</div>
        <div className="chips">
          {LEVELS.map((l) => (
            <button key={l} className={'chip' + (level === l ? ' on' : '')} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
        <div className="vh-filter-label">Nhãn</div>
        <div className="chips">
          {CATS.map((c) => (
            <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="empty"><div className="big">🔍</div>Không tìm thấy bộ flashcard phù hợp.</div>
      ) : (
        <div className="deck-grid">
          {decks.map((d) => (
            <button key={d.id} className="deck-card" onClick={() => setView('flashcards')}>
              <span className={'deck-thumb ' + d.tone}><Icon name="cards" size={22} /></span>
              <span className="deck-body">
                <b>{d.name}</b>
                <span className="deck-meta"><span className="badge">{d.level}</span> {d.count} thẻ · {d.by}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
