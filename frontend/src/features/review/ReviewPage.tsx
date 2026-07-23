import { useCallback, useEffect, useState } from 'react'
import { fetchDue, reviewCard } from '@/core/api/srs.api'
import type { SrsCard, SrsStats, SrsRating } from '@/models/srs.model'
import Spinner from '@/core/components/Spinner'
import Icon from '@/core/components/Icon'
import { MatchGame, ListenGame, DailyChallenge, useGameCards, dailyDone } from './MiniGames'
import { useAppStore } from '@/store/app.store'

const RATES: { r: SrsRating; label: string; cls: string; key: string }[] = [
  { r: 1, label: 'rv.again', cls: 'again', key: '1' },
  { r: 2, label: 'rv.hard', cls: 'hard', key: '2' },
  { r: 3, label: 'rv.good', cls: 'good', key: '3' },
  { r: 4, label: 'rv.easy', cls: 'easy', key: '4' },
]

type T = (key: string, params?: Record<string, string | number>) => string

function hint(card: SrsCard, rating: SrsRating, t: T): string {
  const { reps, ivl, ease } = card
  let d = 0
  if (rating === 1) d = 0
  else if (rating === 2) d = Math.max(1, Math.round((ivl || 1) * 1.2))
  else if (rating === 4) d = reps === 0 ? 4 : Math.max(1, Math.round(ivl * ease * 1.3))
  else d = reps === 0 ? 1 : reps === 1 ? 6 : Math.max(1, Math.round(ivl * ease))
  if (d === 0) return t('rv.soon')
  if (d === 1) return t('rv.day1')
  if (d < 30) return t('rv.days', { n: d })
  return t('rv.months', { n: Math.round(d / 30) })
}

type ReviewMode = 'cards' | 'match' | 'listen' | 'daily'

export default function ReviewPage() {
  const { t, learnLang } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<SrsCard[]>([])
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState<SrsStats | null>(null)
  const [mode, setMode] = useState<ReviewMode>('cards')
  const { cards: gameCards } = useGameCards()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await fetchDue()
      setQueue(d.cards)
      setStats({ total: d.total, due: d.due, new: d.new, learned: d.learned, reviewed_today: d.reviewed_today })
      setI(0)
      setRevealed(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const card = queue[i]

  const rate = useCallback(
    async (rating: SrsRating) => {
      if (!card) return
      try {
        await reviewCard(card.id, rating)
      } catch {}
      setQueue((q) => (rating === 1 ? [...q, card] : q))
      setI((x) => x + 1)
      setRevealed(false)
    },
    [card],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return
      if ((e.key === ' ' || e.key === 'Enter') && !revealed) {
        e.preventDefault()
        setRevealed(true)
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        rate(Number(e.key) as SrsRating)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, revealed, rate])

  if (loading) {
    return (
      <div className="center-state">
        <div><Spinner /><p>{t('rv.loading')}</p></div>
      </div>
    )
  }

  const done = !card
  const reviewedThisSession = i

  return (
    <>
      <div className="lesson-head">
        <h2><Icon name="cards" /> {t('rv.title')}</h2>
        <div className="meta">{t('rv.meta')}</div>
      </div>

      {stats && (
        <div className="srs-stats">
          <div className="stat"><b>{stats.due}</b><span>{t('rv.due')}</span></div>
          <div className="stat"><b>{stats.total}</b><span>{t('rv.total')}</span></div>
          <div className="stat"><b>{stats.new}</b><span>{t('rv.new')}</span></div>
          <div className="stat"><b>{stats.reviewed_today}</b><span>{t('rv.today')}</span></div>
        </div>
      )}

      {mode === 'cards' && gameCards.length >= 4 && (
        <div className="mg-row">
          <button className={'mg-launch' + (dailyDone() ? ' done' : '')} onClick={() => setMode('daily')} disabled={dailyDone()}>
            ⚡ {dailyDone() ? t('mg.dailyClaimed') : t('mg.dailyTitle')}
          </button>
          {gameCards.length >= 6 && (
            <button className="mg-launch" onClick={() => setMode('match')}>🧩 {t('mg.matchTitle')}</button>
          )}
          <button className="mg-launch" onClick={() => setMode('listen')}>🎧 {t('mg.listenTitle')}</button>
        </div>
      )}

      {mode === 'match' ? (
        <MatchGame cards={gameCards} onExit={() => setMode('cards')} />
      ) : mode === 'listen' ? (
        <ListenGame cards={gameCards} onExit={() => setMode('cards')} />
      ) : mode === 'daily' ? (
        <DailyChallenge cards={gameCards} onExit={() => setMode('cards')} />
      ) : done ? (
        <div className="soon" style={{ marginTop: 18 }}>
          <div className="big"><Icon name={stats && stats.total === 0 ? 'cards' : 'party'} /></div>
          {stats && stats.total === 0 ? (
            <>
              <h3>{t('rv.emptyTitle')}</h3>
              <p>{t('rv.emptyText')}</p>
            </>
          ) : (
            <>
              <h3>{t('rv.doneTitle')}</h3>
              <p>{t('rv.doneText', { n: reviewedThisSession })}</p>
            </>
          )}
        </div>
      ) : (
        <div className="review-wrap">
          <div className="review-progress">{t('rv.left', { n: queue.length - i })}</div>
          <div className="flashcard">
            <div className="fc-front" lang={learnLang}>{card.front}</div>
            {revealed ? (
              <>
                <div className="fc-divider" />
                <div className="fc-back">{card.back || '—'}</div>
                {card.source && <div className="fc-source">{card.source}</div>}
              </>
            ) : (
              <button className="reveal-btn" onClick={() => setRevealed(true)}>
                {t('rv.reveal')} <span className="kbd">Space</span>
              </button>
            )}
          </div>

          {revealed && (
            <div className="rate-row">
              {RATES.map((x) => (
                <button key={x.r} className={'rate ' + x.cls} onClick={() => rate(x.r)}>
                  <span className="rate-label">{t(x.label)}</span>
                  <span className="rate-hint">{hint(card, x.r, t)}</span>
                  <span className="kbd">{x.key}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
