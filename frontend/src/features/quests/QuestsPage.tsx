import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { fetchMyQuests } from '@/core/api/me.api'
import { fetchQuestCatalog } from '@/core/api/content.api'
import type { Quest, QuestPeriod } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const PERIOD_KEY: Record<QuestPeriod, string> = { daily: 'q.daily', weekly: 'q.weekly', monthly: 'q.monthly' }
const DAILY_BONUS = 50

export default function QuestsPage() {
  const { user, setView, claimQuest, dailyBonus, t } = useAppStore()
  const { isAuthed, openAuth, bonusAvailable } = useAuth()

  const [quests, setQuests] = useState<Quest[]>([])
  const [busy, setBusy] = useState('')
  const [flash, setFlash] = useState('')

  const load = useCallback(() => {
    const req = isAuthed ? fetchMyQuests().then((r) => r.quests) : fetchQuestCatalog().then((r) => r.quests)
    req.then(setQuests).catch(() => setQuests([]))
  }, [isAuthed])

  useEffect(() => { load() }, [load])

  const showFlash = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2400) }

  const claim = async (id: string) => {
    if (!isAuthed) { openAuth(); return }
    setBusy(id)
    try {
      await claimQuest(id)
      showFlash(t('q.claimed'))
      load()
    } catch (e) {
      showFlash((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  const takeBonus = async () => {
    if (!isAuthed) { openAuth(); return }
    setBusy('bonus')
    try {
      const reward = await dailyBonus()
      showFlash(t('q.bonusGot', { n: reward }))
    } catch (e) {
      showFlash((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="quests">
      <div className="quests-head">
        <h1><Icon name="crown" /> {t('q.title')} <Icon name="sparkles" /></h1>
        <p>{t('q.sub')}</p>
      </div>

      {flash && <div className="shop-flash">{flash}</div>}

      <button
        className={'daily-bonus' + (isAuthed && !bonusAvailable ? ' taken' : '')}
        onClick={takeBonus}
        disabled={busy === 'bonus' || (isAuthed && !bonusAvailable)}
      >
        <span className="db-left">
          <Icon name="gift" size={22} /> {t('q.dailyBonus')}
        </span>
        <span className="db-reward">
          {isAuthed && !bonusAvailable ? t('q.taken') : <>+{DAILY_BONUS} <Icon name="coin" size={16} /></>}
        </span>
      </button>

      {(['daily', 'weekly', 'monthly'] as QuestPeriod[]).map((period) => {
        const list = quests.filter((q) => q.period === period)
        if (!list.length) return null
        return (
          <div key={period}>
            <div className="section-title"><span className="pin" /> {t(PERIOD_KEY[period])}</div>
            <div className="quest-grid">
              {list.map((q) => {
                const progress = q.progress ?? 0
                const done = progress >= q.target
                const isClaimed = !!q.claimed
                const pct = Math.min(100, Math.round((progress / q.target) * 100))
                const locked = q.plus && !user.isPlus
                return (
                  <div key={q.id} className={'quest-card' + (q.plus ? ' is-plus' : '')}>
                    <div className="quest-top">
                      <span className="quest-period">{t(PERIOD_KEY[q.period])}</span>
                      {q.plus && <span className="quest-plus"><Icon name="sparkles" size={11} /> PLUS</span>}
                    </div>
                    <div className="quest-title">{q.title}</div>
                    <div className="quest-desc">{q.desc}</div>

                    <div className="quest-prog-row">
                      <span>{t('q.progress')}</span>
                      <b>{progress}/{q.target}</b>
                    </div>
                    <div className="quest-bar"><span style={{ width: pct + '%' }} /></div>

                    <div className="quest-foot">
                      <span className="quest-reward"><Icon name="coin" size={16} /> {q.reward}</span>
                      {locked ? (
                        <button className="quest-btn locked" onClick={() => setView('pricing')}><Icon name="lock" size={13} /> {t('q.unlockPlus')}</button>
                      ) : isClaimed ? (
                        <button className="quest-btn done" disabled>{t('q.taken')}</button>
                      ) : done ? (
                        <button className="quest-btn claim" disabled={busy === q.id} onClick={() => claim(q.id)}>
                          {busy === q.id ? '…' : t('q.claim')}
                        </button>
                      ) : (
                        <button className="quest-btn" disabled>{t('q.doing')}</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
