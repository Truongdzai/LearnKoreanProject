import Icon from '@/core/components/Icon'
import Logo from '@/core/components/Logo'
import { useAppStore } from '@/store/app.store'
import { useDialog } from '@/core/a11y'
import { LEARN_GOALS } from './goals'

export default function OnboardingModal() {
  const { onboardingOpen, closeOnboarding, goal, setGoal, t, learnLangName } = useAppStore()
  const boxRef = useDialog<HTMLDivElement>(onboardingOpen, closeOnboarding)

  if (!onboardingOpen) return null

  const pick = (id: string) => {
    setGoal(id)
    closeOnboarding()
  }

  return (
    <div className="auth-backdrop" onClick={closeOnboarding}>
      <div className="auth-modal goal-modal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="onboard-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lookup-close auth-close" onClick={closeOnboarding} aria-label={t('a11y.close')}><Icon name="x" /></button>

        <div className="auth-head">
          <Logo size={48} />
          <h2 id="onboard-title">{t('ob.title', { lang: learnLangName })}</h2>
          <p>{t('ob.sub')}</p>
        </div>

        <div className="goal-grid">
          {LEARN_GOALS.map((g) => (
            <button key={g.id} type="button" className={'goal-card' + (goal === g.id ? ' on' : '')} aria-pressed={goal === g.id} onClick={() => pick(g.id)}>
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
