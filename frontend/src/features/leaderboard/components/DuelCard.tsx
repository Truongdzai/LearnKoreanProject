import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { cancelDuel, createDuel, fetchDuel, joinDuel, type DuelState } from '@/core/api/arena.api'
import { duelLink, takeDuelCode } from '@/core/utils/referral'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

export default function DuelCard({ onChange }: { onChange?: () => void }) {
  const { t, user } = useAppStore()
  const { account } = useAuth()
  const [data, setData] = useState<DuelState | null>(null)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    fetchDuel().then(setData).catch(() => setData(null))
  }, [])

  useEffect(() => {
    const pending = takeDuelCode()
    if (pending) {
      joinDuel(pending)
        .then((r) => { setData(r); setMsg(t('duel.joined')); onChange?.() })
        .catch((e) => { setMsg((e as Error).message); load() })
    } else {
      load()
    }
  }, [load, onChange, t])

  const act = (p: Promise<unknown>, done?: string) => {
    setBusy(true)
    setMsg('')
    p.then(() => { load(); if (done) setMsg(done); onChange?.() })
      .catch((e) => setMsg((e as Error).message))
      .finally(() => setBusy(false))
  }

  if (!data) return null
  const a = data.active
  const link = data.inviteCode ? duelLink(data.inviteCode) : ''

  return (
    <div className="duel">
      <div className="duel-head">
        <b><Icon name="target" size={16} /> {t('duel.title')}</b>
        <span>{t('duel.sub', { days: data.days, reward: data.reward })}</span>
      </div>

      {a ? (
        <div className={'duel-board' + (a.status === 'done' ? ' done' : '')}>
          <div className="duel-side">
            <Avatar size={54} frame={user.equippedFrame} src={account?.avatar ?? null} initials={account?.name?.charAt(0) || '?'} />
            <b>{t('duel.you')}</b>
            <span className="duel-xp">{a.myXp.toLocaleString('vi')} XP</span>
          </div>
          <div className="duel-mid">
            {a.status === 'active' ? (
              <>
                <span className="duel-vs">VS</span>
                <span className="duel-left">{t('duel.daysLeft', { n: a.daysLeft })}</span>
                <span className={'duel-state ' + (a.myXp > a.theirXp ? 'win' : a.myXp < a.theirXp ? 'lose' : '')}>
                  {a.myXp > a.theirXp ? t('duel.leading') : a.myXp < a.theirXp ? t('duel.behind') : t('duel.tied')}
                </span>
              </>
            ) : (
              <span className="duel-vs">{a.draw ? '🤝' : a.iWin ? '🏆' : '💪'}</span>
            )}
          </div>
          <div className="duel-side">
            <Avatar size={54} frame={a.opponent?.frame ?? null} src={a.opponent?.avatar ?? null} initials={a.opponent?.name?.charAt(0) || '?'} />
            <b>{a.opponent?.name || '—'}</b>
            <span className="duel-xp">{a.theirXp.toLocaleString('vi')} XP</span>
          </div>
        </div>
      ) : data.inviteCode ? (
        <div className="duel-invite">
          <p>{t('duel.waiting')}</p>
          <div className="duel-code">{data.inviteCode}</div>
          <div className="duel-actions">
            <button className="btn-primary sm" onClick={() => {
              navigator.clipboard?.writeText(link).then(() => setMsg(t('duel.copied'))).catch(() => setMsg(link))
            }}>
              <Icon name="copy" size={15} /> {t('duel.copyLink')}
            </button>
            <button className="btn-ghost sm" disabled={busy} onClick={() => act(cancelDuel(), t('duel.cancelled'))}>
              {t('duel.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="duel-start">
          <button className="btn-primary" disabled={busy} onClick={() => act(createDuel())}>
            <Icon name="target" size={16} /> {t('duel.create')}
          </button>
          <div className="duel-join">
            <input
              value={code}
              maxLength={6}
              placeholder={t('duel.codePlaceholder')} aria-label={t('duel.codePlaceholder')}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button className="btn-ghost" disabled={busy || code.length < 6} onClick={() => act(joinDuel(code), t('duel.joined'))}>
              {t('duel.join')}
            </button>
          </div>
        </div>
      )}

      {msg && <div className="duel-msg">{msg}</div>}

      {data.history.length > 0 && (
        <div className="duel-history">
          <span className="duel-history-title">{t('duel.history')}</span>
          {data.history.map((h) => (
            <div key={h.id} className="duel-hrow">
              <span className={'duel-badge ' + (h.draw ? 'draw' : h.iWin ? 'win' : 'lose')}>
                {h.draw ? t('duel.draw') : h.iWin ? t('duel.win') : t('duel.lose')}
              </span>
              <span className="duel-hname">{h.opponent?.name || '—'}</span>
              <span className="duel-hxp">{h.myXp.toLocaleString('vi')} – {h.theirXp.toLocaleString('vi')} XP</span>
              <span className="duel-hdate">{h.endDay}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
