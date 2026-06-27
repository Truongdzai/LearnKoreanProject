import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import Flag from '@/core/components/Flag'
import { navForLang } from '@/core/constants/nav'
import { STUDY_LANGS } from '@/core/constants/languages'

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function Sidebar() {
  const { view, setView, user, learnLang, setLearnLang, requestWizard } = useAppStore()
  const todayIdx = (new Date().getDay() + 6) % 7
  const nav = navForLang(learnLang)

  // Picking a different flag opens the learning-path wizard (pick native + target language).
  const pickLang = (code: string) => {
    if (code === learnLang) return
    setLearnLang(code)
    requestWizard()
    setView('path')
  }

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
          {STUDY_LANGS.map((l) => (
            <button key={l.code} className={'lang-flag-btn' + (learnLang === l.code ? ' on' : '')} onClick={() => pickLang(l.code)} title={l.name}>
              <Flag code={l.code} size={26} />
            </button>
          ))}
        </div>
      </div>

      <nav className="nav">
        {nav.map((n) => (
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
