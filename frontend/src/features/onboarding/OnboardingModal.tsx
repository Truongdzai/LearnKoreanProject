import { useEffect } from 'react'
import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import { useAppStore } from '@/store/app.store'
import { LEARN_GOALS } from './goals'

export default function OnboardingModal() {
  const { onboardingOpen, closeOnboarding, goal, setGoal, t, learnLangName } = useAppStore()

  useEffect(() => {
    if (!onboardingOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeOnboarding()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onboardingOpen, closeOnboarding])

  if (!onboardingOpen) return null

  const pick = (id: string) => {
    setGoal(id)
    closeOnboarding()
  }

  return (
    <div className="auth-backdrop" onClick={closeOnboarding}>
      <div className="auth-modal goal-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lookup-close auth-close" onClick={closeOnboarding}><Icon name="x" /></button>

        <div className="auth-head">
          <Logo size={48} />
          <h2>{t('ob.title', { lang: learnLangName })}</h2>
          <p>{t('ob.sub')}</p>
        </div>

        <div className="goal-grid">
          {LEARN_GOALS.map((g) => (
            <button key={g.id} className={'goal-card' + (goal === g.id ? ' on' : '')} onClick={() => pick(g.id)}>
              <span className="goal-emoji">{g.emoji}</span>
              <b>{t(`goal.${g.id}.label`)}</b>
              <small>{t(`goal.${g.id}.desc`)}</small>
            </button>
          ))}
        </div>

        <button className="goal-skip" onClick={closeOnboarding}>{t('ob.skip')}</button>
      </div>
    </div>
  )
}
