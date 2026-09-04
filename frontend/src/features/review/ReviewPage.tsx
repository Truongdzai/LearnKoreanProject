import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchDue, reviewCard } from '@/core/api/srs.api'
import type { SrsCard, SrsStats, SrsRating } from '@/models/srs.model'
import Spinner from '@/core/components/Spinner'
import Icon from '@/core/components/Icon'
import { MatchGame, ListenGame, DailyChallenge, useGameCards, dailyDone } from './MiniGames'
import { useAppStore } from '@/store/app.store'
import { takeReviewDeck } from '@/core/reviewDeck'

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

function deckLabel(source: string): string {
  const clean = source.replace(/\s*\((youtube|url|file):[^)]*\)\s*$/i, '').trim()
  return clean.length > 30 ? clean.slice(0, 29) + '…' : clean
}

export default function ReviewPage() {
  const { t, learnLang, learnLangName, recordEvent } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<SrsCard[]>([])
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState<SrsStats | null>(null)
  const [mode, setMode] = useState<ReviewMode>('cards')
  const [deck, setDeck] = useState(takeReviewDeck)
  const [saveErr, setSaveErr] = useState('')
  const { cards: gameCards } = useGameCards()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await fetchDue()
      setQueue(d.cards)
      setStats({ total: d.total, due: d.due, new: d.new, learned: d.learned, reviewed_today: d.reviewed_today })
      setI(0)
      setRevealed(false)
      setSaveErr('')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (deck && !loading && !queue.some((c) => (c.source || '').trim() === deck)) setDeck('')
  }, [deck, loading, queue])

  const decks = useMemo(() => {
    const by = new Map<string, number>()
    for (const c of queue) {
      const key = (c.source || '').trim()
      by.set(key, (by.get(key) || 0) + 1)
    }
    return [...by.entries()].sort((a, b) => b[1] - a[1])
  }, [queue])

  const view = useMemo(
    () => (deck ? queue.filter((c) => (c.source || '').trim() === deck) : queue),
    [queue, deck],
  )

  const pickDeck = (key: string) => {
    setDeck(key)
    setI(0)
    setRevealed(false)
  }

  const card = view[i]

  const rate = useCallback(
    async (rating: SrsRating) => {
      if (!card) return
      setI((x) => x + 1)
      setRevealed(false)
      setQueue((q) => (rating === 1 ? [...q, card] : q))
      try {
        await reviewCard(card.id, rating)
        setSaveErr('')
        recordEvent('review', 1)
        setStats((st) => (st
          ? { ...st, reviewed_today: st.reviewed_today + 1, due: Math.max(0, st.due - (rating === 1 ? 0 : 1)) }
          : st))
      } catch (e) {
        setSaveErr((e as Error).message || t('rv.saveFail'))
      }
    },
    [card, recordEvent, t],
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
      <div className="drawer-plate">
        <div className="drawer-label">
          <span className="drawer-label-sub">{t('rv.drawer')}</span>
          <b>{learnLangName}</b>
        </div>
        <div className="drawer-count">
          <b>{view.length - i}</b>
          <span>{t('rv.cardsUnit')}</span>
        </div>
        {mode === 'cards' && gameCards.length >= 4 && (
          <div className="drawer-tabs">
            <button onClick={() => setMode('daily')} disabled={dailyDone()} title={t('mg.dailyTitle')}>
              <Icon name="flame" size={14} /> {dailyDone() ? t('mg.dailyClaimed') : t('mg.dailyTitle')}
            </button>
            {gameCards.length >= 6 && (
              <button onClick={() => setMode('match')} title={t('mg.matchTitle')}>
                <Icon name="cards" size={14} /> {t('mg.matchTitle')}
              </button>
            )}
            <button onClick={() => setMode('listen')} title={t('mg.listenTitle')}>
              <Icon name="headphones" size={14} /> {t('mg.listenTitle')}
            </button>
          </div>
        )}
      </div>

      {stats && (
        <dl className="srs-record">
          <div><dt>{t('rv.due')}</dt><dd>{stats.due}</dd></div>
          <div><dt>{t('rv.total')}</dt><dd>{stats.total}</dd></div>
          <div><dt>{t('rv.new')}</dt><dd>{stats.new}</dd></div>
          <div><dt>{t('rv.today')}</dt><dd>{stats.reviewed_today}</dd></div>
        </dl>
      )}

      {saveErr && (
        <div className="rv-saveerr">
          <Icon name="x-circle" size={14} /> {saveErr}
          <button className="btn-ghost sm" onClick={load}><Icon name="refresh" size={13} /> {t('rv.reload')}</button>
        </div>
      )}

      {mode === 'cards' && decks.length > 1 && (
        <div className="rv-decks">
          <span className="rv-deck-head">{t('rv.deckHead')}</span>
          <button className={'rv-deck' + (deck === '' ? ' on' : '')} onClick={() => pickDeck('')}>
            {t('rv.deckAll')} <b>{queue.length}</b>
          </button>
          {decks.map(([key, n]) => (
            <button key={key || 'other'} className={'rv-deck' + (deck === key ? ' on' : '')} onClick={() => pickDeck(key)} title={key}>
              {key ? deckLabel(key) : t('rv.deckOther')} <b>{n}</b>
            </button>
          ))}
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
              {deck && (
                <button className="btn-ghost sm" onClick={() => pickDeck('')}>
                  <Icon name="cards" size={14} /> {t('rv.deckBack')}
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="review-wrap">
          <div className="review-drawer">
            <div className="flashcard">
              <div className="fc-hole" aria-hidden="true" />
              <div className="fc-rod" aria-hidden="true" />
              <div className="fc-body">
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
            </div>
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
