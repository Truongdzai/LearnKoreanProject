import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { fetchMyQuests } from '@/core/api/me.api'
import { fetchQuestCatalog } from '@/core/api/content.api'
import type { Quest, QuestPeriod } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const PERIOD_KEY: Record<QuestPeriod, string> = { daily: 'q.daily', weekly: 'q.weekly', monthly: 'q.monthly' }
const DAILY_BONUS = 50

type Filter = 'all' | 'ready' | 'doing'

export default function QuestsPage() {
  const { user, setView, claimQuest, dailyBonus, t } = useAppStore()
  const { isAuthed, openAuth, bonusAvailable } = useAuth()

  const [quests, setQuests] = useState<Quest[]>([])
  const [busy, setBusy] = useState('')
  const [flash, setFlash] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const load = useCallback(() => {
    const req = isAuthed ? fetchMyQuests().then((r) => r.quests) : fetchQuestCatalog().then((r) => r.quests)
    req.then(setQuests).catch(() => setQuests([]))
  }, [isAuthed])

  useEffect(() => { load() }, [load])

  const showFlash = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2400) }

  const isReady = useCallback((q: Quest) => (q.progress ?? 0) >= q.target && !q.claimed && !(q.plus && !user.isPlus), [user.isPlus])

  const summary = useMemo(() => {
    const ready = quests.filter(isReady)
    return {
      readyCount: ready.length,
      coinsWaiting: ready.reduce((s, q) => s + q.reward, 0),
      doneCount: quests.filter((q) => q.claimed).length,
    }
  }, [quests, isReady])

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

  const matchFilter = (q: Quest) => {
    if (filter === 'ready') return isReady(q)
    if (filter === 'doing') return !q.claimed && !isReady(q)
    return true
  }

  const FILTERS: { id: Filter; key: string }[] = [
    { id: 'all', key: 'q.fAll' },
    { id: 'ready', key: 'q.fReady' },
    { id: 'doing', key: 'q.fDoing' },
  ]

  return (
    <div className="quests">
      <div className="quests-head">
        <h1><Icon name="crown" /> {t('q.title')} <Icon name="sparkles" /></h1>
        <p>{t('q.sub')}</p>
      </div>

      {flash && <div className="shop-flash">{flash}</div>}

      <div className="quest-summary">
        <div className="qs-item ready">
          <span className="qs-ic"><Icon name="gift" size={18} /></span>
          <div><b>{summary.readyCount}</b><span>{t('q.sumReady')}</span></div>
        </div>
        <div className="qs-item coin">
          <span className="qs-ic"><Icon name="coin" size={18} /></span>
          <div><b>{summary.coinsWaiting}</b><span>{t('q.sumCoins')}</span></div>
        </div>
        <div className="qs-item done">
          <span className="qs-ic"><Icon name="check-circle" size={18} /></span>
          <div><b>{summary.doneCount}</b><span>{t('q.sumDone')}</span></div>
        </div>
      </div>

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

      <div className="chips" style={{ margin: '4px 0 6px' }}>
        {FILTERS.map((f) => (
          <button key={f.id} className={'chip' + (filter === f.id ? ' on' : '')} onClick={() => setFilter(f.id)}>
            {t(f.key)}
          </button>
        ))}
      </div>

      {(['daily', 'weekly', 'monthly'] as QuestPeriod[]).map((period) => {
        const list = quests.filter((q) => q.period === period && matchFilter(q))
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
                  <div key={q.id} className={'quest-card' + (q.plus ? ' is-plus' : '') + (isReady(q) ? ' is-ready' : '')}>
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
