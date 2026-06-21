import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { fetchMyQuests } from '@/core/api/me.api'
import { fetchQuestCatalog } from '@/core/api/content.api'
import type { Quest, QuestPeriod } from '@/models/gamification.model'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const PERIOD_LABEL: Record<QuestPeriod, string> = { daily: 'Hằng ngày', weekly: 'Hằng tuần', monthly: 'Hằng tháng' }
const DAILY_BONUS = 50

export default function QuestsPage() {
  const { user, setView, claimQuest, dailyBonus } = useAppStore()
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
      showFlash('Đã nhận thưởng! 🎉')
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
      showFlash(`Đã nhận +${reward} xu thưởng đăng nhập! 🎁`)
    } catch (e) {
      showFlash((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="quests">
      <div className="quests-head">
        <h1><Icon name="crown" /> Nhiệm Vụ Plus <Icon name="sparkles" /></h1>
        <p>Hoàn thành nhiệm vụ để nhận xu, dùng mua hạt giống & khung viền trong cửa hàng.</p>
      </div>

      {flash && <div className="shop-flash">{flash}</div>}

      <button
        className={'daily-bonus' + (isAuthed && !bonusAvailable ? ' taken' : '')}
        onClick={takeBonus}
        disabled={busy === 'bonus' || (isAuthed && !bonusAvailable)}
      >
        <span className="db-left">
          <Icon name="gift" size={22} /> Phần thưởng đăng nhập hằng ngày
        </span>
        <span className="db-reward">
          {isAuthed && !bonusAvailable ? 'Đã nhận ✓' : <>+{DAILY_BONUS} <Icon name="coin" size={16} /></>}
        </span>
      </button>

      {(['daily', 'weekly', 'monthly'] as QuestPeriod[]).map((period) => {
        const list = quests.filter((q) => q.period === period)
        if (!list.length) return null
        return (
          <div key={period}>
            <div className="section-title"><span className="pin" /> {PERIOD_LABEL[period]}</div>
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
                      <span className="quest-period">{PERIOD_LABEL[q.period]}</span>
                      {q.plus && <span className="quest-plus"><Icon name="sparkles" size={11} /> PLUS</span>}
                    </div>
                    <div className="quest-title">{q.title}</div>
                    <div className="quest-desc">{q.desc}</div>

                    <div className="quest-prog-row">
                      <span>Tiến trình</span>
                      <b>{progress}/{q.target}</b>
                    </div>
                    <div className="quest-bar"><span style={{ width: pct + '%' }} /></div>

                    <div className="quest-foot">
                      <span className="quest-reward"><Icon name="coin" size={16} /> {q.reward}</span>
                      {locked ? (
                        <button className="quest-btn locked" onClick={() => setView('pricing')}><Icon name="lock" size={13} /> Mở bằng Plus</button>
                      ) : isClaimed ? (
                        <button className="quest-btn done" disabled>Đã nhận ✓</button>
                      ) : done ? (
                        <button className="quest-btn claim" disabled={busy === q.id} onClick={() => claim(q.id)}>
                          {busy === q.id ? '…' : 'Nhận thưởng'}
                        </button>
                      ) : (
                        <button className="quest-btn" disabled>Đang thực hiện</button>
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
