import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { LANGUAGES, GOALS, INTERESTS, LEVELS, buildSteps } from '@/data/pathOptions'
import type { LearningPath } from '@/models/path.model'
import { useAppStore } from '@/store/app.store'

const STEPS = ['Ngôn ngữ', 'Mục tiêu', 'Sở thích', 'Trình độ']
const STEP_ICON = ['globe', 'star', 'sparkles', 'cards'] as const

export default function PathPage() {
  const { paths, addPath, setView } = useAppStore()
  const [mode, setMode] = useState<'landing' | 'wizard' | 'result'>(paths.length ? 'landing' : 'landing')
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [level, setLevel] = useState('')
  const [created, setCreated] = useState<LearningPath | null>(null)

  const toggle = (arr: string[], set: (v: string[]) => void, v: string, max = 5) => {
    if (arr.includes(v)) set(arr.filter((x) => x !== v))
    else if (arr.length < max) set([...arr, v])
  }

  const reset = () => {
    setStep(0); setLang(''); setGoals([]); setInterests([]); setLevel(''); setCreated(null)
  }

  const finish = () => {
    const l = LANGUAGES.find((x) => x.code === lang)
    const lv = LEVELS.find((x) => x.code === level)
    const path: LearningPath = {
      id: 'p' + Date.now(),
      language: l?.name || 'Tiếng Hàn',
      languageFlag: l?.flag || '🇰🇷',
      goals,
      interests,
      level: lv ? `${lv.code} · ${lv.name}` : 'A1',
      createdAt: Date.now(),
      steps: buildSteps(goals, interests, lv ? `${lv.code} ${lv.name}` : 'A1'),
      progress: 0,
    }
    addPath(path)
    setCreated(path)
    setMode('result')
  }

  const canNext = [lang !== '', goals.length > 0, true, level !== ''][step]

  // ---- Landing ----
  if (mode === 'landing') {
    return (
      <div className="path">
        <div className="path-hero">
          <div className="path-hero-ic"><Icon name="map" size={26} /></div>
          <div className="path-hero-txt">
            <div className="kicker">KHOÁ HỌC</div>
            <h2>Bắt đầu lộ trình học của bạn</h2>
            <p>Tạo lộ trình học cá nhân hoá hoặc tham gia khoá học từ cộng đồng.</p>
            <ul>
              <li><Icon name="check-circle" size={15} /> Lộ trình phù hợp trình độ &amp; mục tiêu của bạn</li>
              <li><Icon name="check-circle" size={15} /> Theo dõi tiến độ từng giai đoạn</li>
              <li><Icon name="check-circle" size={15} /> AI gợi ý nội dung nên học tiếp theo</li>
            </ul>
          </div>
          <button className="btn-primary lg" onClick={() => { reset(); setMode('wizard') }}>
            <Icon name="sparkles" /> Tạo lộ trình
          </button>
        </div>

        {paths.length > 0 && (
          <>
            <div className="section-title"><span className="pin" /> Lộ trình của bạn</div>
            <div className="path-list">
              {paths.map((p) => (
                <div key={p.id} className="path-card" onClick={() => { setCreated(p); setMode('result') }}>
                  <div className="path-card-flag">{p.languageFlag}</div>
                  <div className="path-card-body">
                    <b>{p.language} · {p.level}</b>
                    <span>{p.steps.length} giai đoạn · {p.goals.length} mục tiêu</span>
                    <div className="path-mini-bar"><span style={{ width: p.progress + '%' }} /></div>
                  </div>
                  <Icon name="arrow-right" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // ---- Result ----
  if (mode === 'result' && created) {
    return (
      <div className="path">
        <div className="path-suggest">
          <Icon name="sparkles" size={20} />
          <div>
            <b>Lộ trình đã sẵn sàng! 🎉</b>
            <p>Gợi ý: bắt đầu ngay từ giai đoạn đầu tiên bên dưới để giữ chuỗi học mỗi ngày.</p>
          </div>
          <button className="btn-primary" onClick={() => setView('home')}>Bắt đầu học</button>
        </div>

        <div className="path-summary">
          <span className="ps-flag">{created.languageFlag}</span>
          <div>
            <h2>{created.language} · {created.level}</h2>
            <div className="ps-tags">
              {created.goals.slice(0, 4).map((g) => <span key={g} className="ps-tag">{g}</span>)}
              {created.interests.slice(0, 3).map((i) => <span key={i} className="ps-tag soft">{i}</span>)}
            </div>
          </div>
        </div>

        <div className="section-title"><span className="pin" /> Lộ trình gợi ý</div>
        <ol className="roadmap">
          {created.steps.map((s, i) => (
            <li key={i} className={i === 0 ? 'active' : ''}>
              <span className="rm-dot">{i + 1}</span>
              <div className="rm-body">
                <b>{s.title}</b>
                <p>{s.detail}</p>
              </div>
              {i === 0 && <span className="rm-now">Bắt đầu tại đây</span>}
            </li>
          ))}
        </ol>

        <button className="btn-ghost" onClick={() => setMode('landing')}><Icon name="arrow-left" size={15} /> Về danh sách lộ trình</button>
      </div>
    )
  }

  // ---- Wizard ----
  return (
    <div className="wizard">
      <div className="wiz-head"><div className="path-hero-ic sm"><Icon name="map" /></div> Tạo lộ trình học</div>

      <div className="wiz-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={'wiz-step' + (i < step ? ' done' : i === step ? ' on' : '')}>
            <span className="wiz-dot">{i < step ? <Icon name="check" size={16} /> : <Icon name={STEP_ICON[i]} size={16} />}</span>
            <span className="wiz-lbl">{s}</span>
          </div>
        ))}
      </div>

      <div className="wiz-body">
        {step === 0 && (
          <>
            <h2 className="wiz-title">Chọn ngôn ngữ</h2>
            <p className="wiz-sub">Chọn ngôn ngữ bạn muốn học</p>
            <div className="lang-grid">
              {LANGUAGES.map((l) => (
                <button key={l.code} className={'lang-card' + (lang === l.code ? ' on' : '')} onClick={() => setLang(l.code)}>
                  <span className="lang-flag">{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="wiz-title">Mục tiêu học tập</h2>
            <p className="wiz-sub">Chọn tối đa 5 mục tiêu ({goals.length}/5 đã chọn)</p>
            <div className="goal-list">
              {GOALS.map((g) => (
                <button key={g.title} className={'goal-row' + (goals.includes(g.title) ? ' on' : '')} onClick={() => toggle(goals, setGoals, g.title)}>
                  <span className="goal-check">{goals.includes(g.title) && <Icon name="check" size={14} />}</span>
                  <span><b>{g.title}</b><small>{g.detail}</small></span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="wiz-title">Sở thích học tập</h2>
            <p className="wiz-sub">Chọn tối đa 5 sở thích ({interests.length}/5 đã chọn)</p>
            <div className="interest-grid">
              {INTERESTS.map((it) => (
                <button key={it.name} className={'interest-card' + (interests.includes(it.name) ? ' on' : '')} onClick={() => toggle(interests, setInterests, it.name)}>
                  <span className="interest-emoji">{it.emoji}</span>
                  <span>{it.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="wiz-title">Trình độ hiện tại</h2>
            <p className="wiz-sub">Chọn trình độ hiện tại của bạn</p>
            <div className="level-grid">
              {LEVELS.map((l) => (
                <button key={l.code} className={'level-card ' + l.tone + (level === l.code ? ' on' : '')} onClick={() => setLevel(l.code)}>
                  <span className="level-badge">{l.code}</span>
                  <span><b>{l.name}</b><small>{l.tag}</small></span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="wiz-foot">
        {step > 0 ? (
          <button className="btn-ghost" onClick={() => setStep(step - 1)}><Icon name="chevron-left" size={16} /> Trở về</button>
        ) : (
          <button className="btn-ghost" onClick={() => setMode('landing')}>Huỷ</button>
        )}
        {step < 3 ? (
          <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Tiếp <Icon name="arrow-right" size={16} /></button>
        ) : (
          <button className="btn-primary" disabled={!canNext} onClick={finish}><Icon name="sparkles" size={16} /> Xác nhận</button>
        )}
      </div>
    </div>
  )
}
