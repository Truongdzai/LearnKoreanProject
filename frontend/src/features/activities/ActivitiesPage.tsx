import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MINUTES = [25, 40, 15, 50, 35, 60, 45]
const WORDS = [8, 14, 5, 18, 12, 22, 16]

export default function ActivitiesPage() {
  const { user, savedVideos, garden, paths } = useAppStore()
  const todayIdx = (new Date().getDay() + 6) % 7
  const totalMin = MINUTES.reduce((a, c) => a + c, 0)
  const totalWords = WORDS.reduce((a, c) => a + c, 0)
  const maxMin = Math.max(...MINUTES)

  const stats = [
    { ic: 'flame', label: 'Chuỗi ngày học', val: user.streak, unit: 'ngày', tone: 'fire' },
    { ic: 'clock', label: 'Thời gian học tuần này', val: totalMin, unit: 'phút', tone: 'blue' },
    { ic: 'cards', label: 'Từ mới tuần này', val: totalWords, unit: 'từ', tone: 'violet' },
    { ic: 'star', label: 'Tổng XP', val: user.xp.toLocaleString('vi'), unit: 'XP', tone: 'gold' },
  ] as const

  return (
    <div className="activities">
      <h1 className="page-title"><Icon name="chart" /> Hoạt động của tôi</h1>
      <p className="page-sub">Theo dõi tiến độ học để giữ động lực — bạn đang làm rất tốt!</p>

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
          <div className="act-card-head"><b>Thời gian học 7 ngày</b><span>{totalMin} phút</span></div>
          <div className="bars">
            {MINUTES.map((m, i) => (
              <div key={i} className={'bar-col' + (i === todayIdx ? ' today' : '')}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: (m / maxMin) * 100 + '%' }}><span>{m}'</span></div>
                </div>
                <span className="bar-lbl">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="act-card">
          <div className="act-card-head"><b>Từ mới mỗi ngày</b><span>{totalWords} từ</span></div>
          <div className="bars">
            {WORDS.map((w, i) => (
              <div key={i} className={'bar-col' + (i === todayIdx ? ' today' : '')}>
                <div className="bar-track">
                  <div className="bar-fill violet" style={{ height: (w / Math.max(...WORDS)) * 100 + '%' }}><span>{w}</span></div>
                </div>
                <span className="bar-lbl">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title"><span className="pin" /> Tổng quan tài khoản</div>
      <div className="act-summary">
        <div className="as-item"><Icon name="rocket" size={18} /><b>Cấp {user.level}</b><span>Trình độ hiện tại</span></div>
        <div className="as-item"><Icon name="tv" size={18} /><b>{savedVideos.length}</b><span>Video đã lưu</span></div>
        <div className="as-item"><Icon name="map" size={18} /><b>{paths.length}</b><span>Lộ trình đang học</span></div>
        <div className="as-item"><Icon name="sprout" size={18} /><b>{garden.length}</b><span>Cây trong vườn</span></div>
      </div>
    </div>
  )
}
