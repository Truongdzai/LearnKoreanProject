import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Flag from '@/core/components/Flag'
import { GOALS, INTERESTS, LEVELS, buildSteps, LEARN_GOAL_PRESETS } from '@/data/pathOptions'
import { STUDY_LANGS, NATIVE_LANGS, studyLang } from '@/core/constants/languages'
import { studyLangName } from '@/core/i18n/translations'
import { goalById } from '@/features/onboarding/goals'
import type { LearningPath } from '@/models/path.model'
import { useAppStore } from '@/store/app.store'

const STEPS = ['path.step1', 'path.step2', 'path.step3', 'path.step4']
const STEP_ICON = ['globe', 'star', 'sparkles', 'cards'] as const

export default function PathPage() {
  const {
    paths, addPath, setView,
    learnLang, setLearnLang, nativeLang, setNativeLang,
    wizardRequested, clearWizard, goal: learnGoal, t, uiLang,
  } = useAppStore()
  const learnGoalInfo = goalById(learnGoal)
  const presetGoals = LEARN_GOAL_PRESETS[learnGoal] || []
  const [mode, setMode] = useState<'landing' | 'wizard' | 'result'>('landing')
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState(learnLang)
  const [native, setNative] = useState(nativeLang)
  const [goals, setGoals] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [level, setLevel] = useState('')
  const [created, setCreated] = useState<LearningPath | null>(null)

  // Arriving here from the sidebar flag switch → jump straight into the wizard.
  useEffect(() => {
    if (!wizardRequested) return
    setStep(0); setLang(learnLang); setNative(nativeLang)
    setGoals(LEARN_GOAL_PRESETS[learnGoal] || []); setInterests([]); setLevel(''); setCreated(null)
    setMode('wizard')
    clearWizard()
  }, [wizardRequested, learnLang, nativeLang, clearWizard, learnGoal])

  // Chọn ngôn ngữ trong wizard chỉ đổi lựa chọn cục bộ — chỉ áp dụng cho cả app khi bấm Xác nhận.
  const pickStudy = (code: string) => setLang(code)
  const pickNative = (code: string) => setNative(code)

  const toggle = (arr: string[], set: (v: string[]) => void, v: string, max = 5) => {
    if (arr.includes(v)) set(arr.filter((x) => x !== v))
    else if (arr.length < max) set([...arr, v])
  }

  const reset = () => {
    setStep(0); setLang(learnLang); setNative(nativeLang); setGoals(presetGoals); setInterests([]); setLevel(''); setCreated(null)
  }

  const finish = async () => {
    const l = studyLang(lang)
    const lv = LEVELS.find((x) => x.code === level)
    setLearnLang(lang)
    setNativeLang(native)
    const path: LearningPath = {
      id: 'p' + Date.now(),
      language: l.name,
      languageFlag: l.flag,
      goals,
      interests,
      level: lv ? `${lv.code} · ${lv.name}` : 'A1',
      createdAt: Date.now(),
      steps: buildSteps(goals, interests, lv ? `${lv.code} ${lv.name}` : 'A1', learnGoal),
      progress: 0,
      learnGoal: learnGoal || undefined,
    }
    try { await addPath(path) } catch { /* khách: vẫn xem được, đăng nhập để lưu */ }
    setCreated(path)
    setMode('result')
  }

  const canNext = [lang !== '' && native !== '', goals.length > 0, true, level !== ''][step]

  // ---- Landing ----
  if (mode === 'landing') {
    return (
      <div className="path">
        <div className="path-hero">
          <div className="path-hero-ic"><Icon name="map" size={26} /></div>
          <div className="path-hero-txt">
            <div className="kicker">{t('path.kicker')}</div>
            <h2>{t('path.heroTitle')}</h2>
            <p>{t('path.heroSub')}</p>
            <ul>
              <li><Icon name="check-circle" size={15} /> {t('path.li1')}</li>
              <li><Icon name="check-circle" size={15} /> {t('path.li2')}</li>
              <li><Icon name="check-circle" size={15} /> {t('path.li3')}</li>
            </ul>
          </div>
          <button className="btn-primary lg" onClick={() => { reset(); setMode('wizard') }}>
            <Icon name="sparkles" /> {t('path.create')}
          </button>
        </div>

        {paths.length > 0 && (
          <>
            <div className="section-title"><span className="pin" /> {t('path.yours')}</div>
            <div className="path-list">
              {paths.map((p) => (
                <div key={p.id} className="path-card" onClick={() => { setCreated(p); setMode('result') }}>
                  <div className="path-card-flag"><Flag code={p.languageFlag} size={38} /></div>
                  <div className="path-card-body">
                    <b>{p.language} · {p.level}</b>
                    <span>{t('path.cardMeta', { a: p.steps.length, b: p.goals.length })}</span>
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
            <b>{t('path.readyTitle')}</b>
            <p>{t('path.readySub')}</p>
          </div>
          <button className="btn-primary" onClick={() => setView('home')}>{t('path.startLearn')}</button>
        </div>

        <div className="path-summary">
          <span className="ps-flag"><Flag code={created.languageFlag} size={46} /></span>
          <div>
            <h2>{created.language} · {created.level}</h2>
            <div className="ps-tags">
              {created.learnGoal && goalById(created.learnGoal) && (
                <span className="ps-tag focus">🎯 {goalById(created.learnGoal)!.emoji} {t('goal.' + created.learnGoal + '.label')}</span>
              )}
              {created.goals.slice(0, 4).map((g) => <span key={g} className="ps-tag">{g}</span>)}
              {created.interests.slice(0, 3).map((i) => <span key={i} className="ps-tag soft">{i}</span>)}
            </div>
          </div>
        </div>

        <div className="section-title"><span className="pin" /> {t('path.suggested')}</div>
        <ol className="roadmap">
          {created.steps.map((s, i) => (
            <li key={i} className={i === 0 ? 'active' : ''}>
              <span className="rm-dot">{i + 1}</span>
              <div className="rm-body">
                <div className="rm-head">
                  <b>{s.title}</b>
                  <span className="rm-meta">
                    {i === 0 && <span className="rm-chip now">{t('path.startHere')}</span>}
                    {s.cefr && <span className="rm-chip cefr">{s.cefr}</span>}
                    {s.duration && <span className="rm-chip"><Icon name="clock" size={12} /> {s.duration}</span>}
                  </span>
                </div>
                <p>{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <button className="btn-ghost" onClick={() => setMode('landing')}><Icon name="arrow-left" size={15} /> {t('path.backList')}</button>
      </div>
    )
  }

  // ---- Wizard ----
  return (
    <div className="wizard">
      <div className="wiz-head"><div className="path-hero-ic sm"><Icon name="map" /></div> {t('path.wizTitle')}</div>

      <div className="wiz-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={'wiz-step' + (i < step ? ' done' : i === step ? ' on' : '')}>
            <span className="wiz-dot">{i < step ? <Icon name="check" size={16} /> : <Icon name={STEP_ICON[i]} size={16} />}</span>
            <span className="wiz-lbl">{t(s)}</span>
          </div>
        ))}
      </div>

      <div className="wiz-body">
        {step === 0 && (
          <>
            <h2 className="wiz-title">{t('path.q1')}</h2>
            <p className="wiz-sub">{t('path.q1Sub')}</p>
            <div className="lang-grid">
              {STUDY_LANGS.map((l) => (
                <button key={l.code} className={'lang-card' + (lang === l.code ? ' on' : '')} onClick={() => pickStudy(l.code)}>
                  <span className="lang-flag"><Flag code={l.flag} size={54} /></span>
                  <span>{studyLangName(uiLang, l.code)}</span>
                  <small className="lang-endonym">{l.endonym}</small>
                </button>
              ))}
            </div>

            <h2 className="wiz-title" style={{ marginTop: 30 }}>{t('path.q1b')}</h2>
            <p className="wiz-sub">{t('path.q1bSub')}</p>
            <div className="native-grid">
              {NATIVE_LANGS.map((n) => (
                <button key={n.code} className={'native-card' + (native === n.code ? ' on' : '')} onClick={() => pickNative(n.code)}>
                  <Flag code={n.flag} size={24} />
                  <span>{n.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="wiz-title">{t('path.q2')}</h2>
            <p className="wiz-sub">{t('path.q2Sub', { n: goals.length })}</p>
            {learnGoalInfo && (
              <p className="wiz-preset-hint">
                {t('path.presetHint', { emoji: learnGoalInfo.emoji, label: t('goal.' + learnGoalInfo.id + '.label') })}
              </p>
            )}
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
            <h2 className="wiz-title">{t('path.q3')}</h2>
            <p className="wiz-sub">{t('path.q3Sub', { n: interests.length })}</p>
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
            <h2 className="wiz-title">{t('path.q4')}</h2>
            <p className="wiz-sub">{t('path.q4Sub')}</p>
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
          <button className="btn-ghost" onClick={() => setStep(step - 1)}><Icon name="chevron-left" size={16} /> {t('path.back')}</button>
        ) : (
          <button className="btn-ghost" onClick={() => setMode('landing')}>{t('path.cancel')}</button>
        )}
        {step < 3 ? (
          <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>{t('path.next')} <Icon name="arrow-right" size={16} /></button>
        ) : (
          <button className="btn-primary" disabled={!canNext} onClick={finish}><Icon name="sparkles" size={16} /> {t('path.confirm')}</button>
        )}
      </div>
    </div>
  )
}
