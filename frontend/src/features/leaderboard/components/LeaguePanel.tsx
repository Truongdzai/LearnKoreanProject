import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Avatar from '@/core/components/Avatar'
import { fetchLeague, type LeagueState } from '@/core/api/arena.api'
import { useAppStore } from '@/store/app.store'

const pad = (n: number) => String(n).padStart(2, '0')
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']
const tierMark = (id: number) => ROMAN[id] || String(id + 1)

function useCountdown(endsAt: string) {
  const target = endsAt ? new Date(endsAt).getTime() : 0
  const [left, setLeft] = useState(() => target - Date.now())
  useEffect(() => {
    setLeft(target - Date.now())
    const t = setInterval(() => setLeft(target - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  const s = Math.max(0, Math.floor(left / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export default function LeaguePanel({ reloadKey = 0 }: { reloadKey?: number }) {
  const { t } = useAppStore()
  const [data, setData] = useState<LeagueState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLeague()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [reloadKey])

  const cd = useCountdown(data?.endsAt || '')

  if (loading) return <div className="empty"><div className="big"><Icon name="trophy" /></div>{t('lb.loading')}</div>
  if (!data) return <div className="empty"><div className="big"><Icon name="trophy" /></div>{t('lb.empty')}</div>

  const last = data.lastResult
  return (
    <div className="lg">
      {last && (
        <div className={'lg-result ' + last.result}>
          <span className="lg-result-ic">
            <Icon name={last.result === 'up' ? 'chevron-up' : last.result === 'down' ? 'chevron-down' : 'minus'} size={18} />
          </span>
          <div>
            <b>
              {last.result === 'up'
                ? t('lg.resultUp', { tier: last.toTier.name })
                : last.result === 'down'
                  ? t('lg.resultDown', { tier: last.toTier.name })
                  : t('lg.resultStay', { tier: last.toTier.name })}
            </b>
            <span>
              {t('lg.resultMeta', { rank: last.rank, of: last.of, xp: last.xp.toLocaleString('vi') })}
              {last.reward > 0 && ` · +${last.reward} ${t('lg.coins')}`}
            </span>
          </div>
        </div>
      )}

      <div className="lg-ladder">
        {data.tiers.map((x) => (
          <div
            key={x.id}
            className={'lg-tier' + (x.id === data.tier.id ? ' on' : '') + (x.id < data.tier.id ? ' passed' : '')}
            style={{ ['--tier' as string]: x.color }}
            title={x.name}
          >
            <span className="lg-tier-ic">{tierMark(x.id)}</span>
            <span className="lg-tier-name">{x.name}</span>
          </div>
        ))}
      </div>

      <div className="lg-head" style={{ ['--tier' as string]: data.tier.color }}>
        <div className="lg-head-main">
          <span className="lg-head-ic">{tierMark(data.tier.id)}</span>
          <div>
            <b>{t('lg.tierTitle', { tier: data.tier.name })}</b>
            <span>{t('lg.rules', { top: data.promote, reward: data.rewards[0] })}</span>
          </div>
        </div>
        <div className="lg-cd">
          <span className="lg-cd-label">{t('lg.endsIn')}</span>
          <b>{cd.d}{t('lg.dShort')} {pad(cd.h)}:{pad(cd.m)}:{pad(cd.s)}</b>
        </div>
      </div>

      {data.entries.length === 0 ? (
        <div className="empty"><div className="big"><Icon name="trophy" /></div>{t('lg.emptyTier')}</div>
      ) : (
        <div className="lg-list">
          {data.entries.map((e, i) => (
            <div key={e.id}>
              {e.zone === 'down' && data.entries[i - 1]?.zone !== 'down' && (
                <div className="lg-divider down"><span>{t('lg.dropZone', { n: data.relegate })}</span></div>
              )}
              <div className={'lb-row lg-row' + (e.me ? ' me' : '') + (e.zone ? ' z-' + e.zone : '')}>
                <span className="lb-rank">{e.rank}</span>
                <Avatar size={44} frame={e.frame} src={e.avatar} initials={e.name.charAt(0)} />
                <span className="lb-name">
                  {e.name}
                  {e.isPlus && <span className="plus-tag sm"><Icon name="sparkles" size={10} /> Plus</span>}
                </span>
                <span className="lb-streak"><Icon name="flame" size={13} /> {e.streak}</span>
                <span className="lb-xp">{e.xp.toLocaleString('vi')} XP</span>
              </div>
              {e.zone === 'up' && data.entries[i + 1]?.zone !== 'up' && (
                <div className="lg-divider up"><span>{t('lg.upZone', { n: data.promote })}</span></div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="lg-note">{t('lg.note')}</p>
    </div>
  )
}
