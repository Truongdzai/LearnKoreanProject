import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { fetchActivities, type Activities } from '@/core/api/me.api'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const EMPTY: Activities = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  minutes: [0, 0, 0, 0, 0, 0, 0],
  words: [0, 0, 0, 0, 0, 0, 0],
  todayIdx: (new Date().getDay() + 6) % 7,
  totalMinutes: 0,
  totalWords: 0,
  srsTotal: 0,
}

export default function ActivitiesPage() {
  const { user, savedVideos, garden, paths } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  const [data, setData] = useState<Activities>(EMPTY)

  useEffect(() => {
    if (!isAuthed) { setData(EMPTY); return }
    fetchActivities().then(setData).catch(() => setData(EMPTY))
  }, [isAuthed])

  const maxMin = Math.max(1, ...data.minutes)
  const maxWords = Math.max(1, ...data.words)

  const stats = [
    { ic: 'flame', label: 'Chuỗi ngày học', val: user.streak, unit: 'ngày', tone: 'fire' },
    { ic: 'clock', label: 'Thời gian học tuần này', val: data.totalMinutes, unit: 'phút', tone: 'blue' },
    { ic: 'cards', label: 'Từ mới tuần này', val: data.totalWords, unit: 'từ', tone: 'violet' },
    { ic: 'star', label: 'Tổng XP', val: user.xp.toLocaleString('vi'), unit: 'XP', tone: 'gold' },
  ] as const

  return (
    <div className="activities">
      <h1 className="page-title"><Icon name="chart" /> Hoạt động của tôi</h1>
      <p className="page-sub">Theo dõi tiến độ học để giữ động lực — bạn đang làm rất tốt!</p>

      {!isAuthed && (
        <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>
          Đăng nhập để xem thống kê học tập thật của bạn.{' '}
          <button className="link-more" onClick={openAuth}>Đăng nhập</button>
        </div>
      )}

      <div className="act-stats">
        {stats.map((s) => (
          <div key={s.label} className={'act-stat ' + s.tone}>
            <span className="act-stat-ic"><Icon name={s.ic} size={20} /></span>
            <div>
              <b>{s.val} <small>{s.unit}</small></b>
              <span>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="act-charts">
        <div className="act-card">
          <div className="act-card-head"><b>Thời gian học 7 ngày</b><span>{data.totalMinutes} phút</span></div>
          <div className="bars">
            {data.minutes.map((m, i) => (
              <div key={i} className={'bar-col' + (i === data.todayIdx ? ' today' : '')}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: (m / maxMin) * 100 + '%' }}><span>{m}'</span></div>
                </div>
                <span className="bar-lbl">{data.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="act-card">
          <div className="act-card-head"><b>Từ mới mỗi ngày</b><span>{data.totalWords} từ</span></div>
          <div className="bars">
            {data.words.map((w, i) => (
              <div key={i} className={'bar-col' + (i === data.todayIdx ? ' today' : '')}>
                <div className="bar-track">
                  <div className="bar-fill violet" style={{ height: (w / maxWords) * 100 + '%' }}><span>{w}</span></div>
                </div>
                <span className="bar-lbl">{data.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title"><span className="pin" /> Tổng quan tài khoản</div>
      <div className="act-summary">
        <div className="as-item"><Icon name="rocket" size={18} /><b>Cấp {user.level}</b><span>Trình độ hiện tại</span></div>
        <div className="as-item"><Icon name="cards" size={18} /><b>{data.srsTotal}</b><span>Thẻ từ vựng</span></div>
        <div className="as-item"><Icon name="tv" size={18} /><b>{savedVideos.length}</b><span>Video đã lưu</span></div>
        <div className="as-item"><Icon name="map" size={18} /><b>{paths.length}</b><span>Lộ trình đang học</span></div>
        <div className="as-item"><Icon name="sprout" size={18} /><b>{garden.length}</b><span>Cây trong vườn</span></div>
      </div>
    </div>
  )
}
