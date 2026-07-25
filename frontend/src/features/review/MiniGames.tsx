import { useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { fetchAllCards } from '@/core/api/srs.api'
import type { SrsCard } from '@/models/srs.model'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'

const DAILY_KEY = 'vyling.daily.challenge'

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const dailyDone = (): boolean => {
  try { return localStorage.getItem(DAILY_KEY) === todayISO() } catch { return false }
}

const markDaily = () => {
  try { localStorage.setItem(DAILY_KEY, todayISO()) } catch { /* ignore */ }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Thẻ có đủ mặt sau để chơi (front + back). */
export function useGameCards(): { cards: SrsCard[]; loading: boolean } {
  const [cards, setCards] = useState<SrsCard[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchAllCards()
      .then((r) => setCards(r.cards.filter((c) => c.front.trim() && (c.back || '').trim())))
      .catch(() => setCards([]))
      .finally(() => setLoading(false))
  }, [])
  return { cards, loading }
}

/* ------------------------------ GHÉP CẶP ------------------------------ */

interface Tile {
  key: string
  cardId: number
  text: string
  side: 'front' | 'back'
}

export function MatchGame({ cards, onExit }: { cards: SrsCard[]; onExit: () => void }) {
  const { recordEvent, learnLang, t } = useAppStore()
  const [seed, setSeed] = useState(0)
  const picked = useMemo(() => shuffle(cards).slice(0, 6), [cards, seed])
  const tiles = useMemo<Tile[]>(
    () =>
      shuffle(
        picked.flatMap((c) => [
          { key: `f${c.id}`, cardId: c.id, text: c.front, side: 'front' as const },
          { key: `b${c.id}`, cardId: c.id, text: c.back || '', side: 'back' as const },
        ]),
      ),
    [picked],
  )
  const [sel, setSel] = useState<Tile | null>(null)
  const [wrong, setWrong] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [rewarded, setRewarded] = useState(false)

  const done = matched.size === picked.length && picked.length > 0

  useEffect(() => {
    if (done && !rewarded) {
      recordEvent('review', 3)
      setRewarded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const pick = (tile: Tile) => {
    if (matched.has(tile.cardId) || wrong) return
    if (!sel) { setSel(tile); return }
    if (sel.key === tile.key) { setSel(null); return }
    setMoves((m) => m + 1)
    if (sel.cardId === tile.cardId && sel.side !== tile.side) {
      setMatched((s) => new Set(s).add(tile.cardId))
      setSel(null)
    } else {
      setWrong(tile.key)
      const prev = sel
      setSel(prev)
      setTimeout(() => { setWrong(null); setSel(null) }, 550)
    }
  }

  const replay = () => {
    setMatched(new Set()); setSel(null); setMoves(0); setRewarded(false); setSeed((s) => s + 1)
  }

  return (
    <div className="mg-wrap">
      <div className="mg-head">
        <button className="btn-ghost sm" onClick={onExit}><Icon name="arrow-left" size={14} /> {t('mg.back')}</button>
        <b>🧩 {t('mg.matchTitle')}</b>
        <span className="mg-moves">{t('mg.moves', { n: moves })}</span>
      </div>
      <div className="mg-grid">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId)
          const isSel = sel?.key === tile.key
          const isWrong = wrong === tile.key
          return (
            <button
              key={tile.key}
              className={'mg-tile' + (isMatched ? ' ok' : '') + (isSel ? ' sel' : '') + (isWrong ? ' bad' : '')}
              disabled={isMatched}
              lang={tile.side === 'front' ? learnLang : undefined}
              onClick={() => pick(tile)}
            >
              {tile.text}
            </button>
          )
        })}
      </div>
      {done && (
        <div className="mg-done">
          🎉 {t('mg.matchDone', { n: moves })} <span className="sr-coin">+6 XP <Icon name="star" size={13} /></span>
          <button className="btn-primary sm" onClick={replay}>{t('mg.replay')}</button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ NGHE-CHỌN ------------------------------ */

interface Round {
  card: SrsCard
  options: string[]
}

function buildRounds(cards: SrsCard[], n: number): Round[] {
  const pool = shuffle(cards)
  return pool.slice(0, n).map((card) => {
    const others = shuffle(pool.filter((c) => c.id !== card.id)).slice(0, 3).map((c) => c.back || '')
    return { card, options: shuffle([card.back || '', ...others]) }
  })
}

export function ListenGame({ cards, onExit }: { cards: SrsCard[]; onExit: () => void }) {
  const { recordEvent, learnLang, t } = useAppStore()
  const cfg = studyLang(learnLang)
  const [seed, setSeed] = useState(0)
  const rounds = useMemo(() => buildRounds(cards, Math.min(5, cards.length)), [cards, seed])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [rewarded, setRewarded] = useState(false)

  const cur = rounds[i]
  const finished = i >= rounds.length

  useEffect(() => {
    if (finished && correct >= 4 && !rewarded) {
      recordEvent('review', 2)
      setRewarded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const speak = () => speakLang(cur.card.front, cfg.locale, 0.85)

  useEffect(() => {
    if (!finished) speak()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, seed])

  const pick = (opt: string) => {
    if (picked !== null) return
    setPicked(opt)
    if (opt === (cur.card.back || '')) setCorrect((n) => n + 1)
  }

  const replay = () => { setI(0); setPicked(null); setCorrect(0); setRewarded(false); setSeed((s) => s + 1) }

  return (
    <div className="mg-wrap">
      <div className="mg-head">
        <button className="btn-ghost sm" onClick={onExit}><Icon name="arrow-left" size={14} /> {t('mg.back')}</button>
        <b>🎧 {t('mg.listenTitle')}</b>
        <span className="mg-moves">{finished ? '' : `${i + 1}/${rounds.length}`}</span>
      </div>

      {finished ? (
        <div className="mg-done">
          {correct >= 4 ? '🎉' : '💪'} {t('mg.listenDone', { a: correct, b: rounds.length })}
          {rewarded && <span className="sr-coin">+4 XP <Icon name="star" size={13} /></span>}
          <button className="btn-primary sm" onClick={replay}>{t('mg.replay')}</button>
        </div>
      ) : (
        <>
          <div className="dict-listen" style={{ marginTop: 6 }}>
            <button className="dict-play" onClick={speak}><Icon name="volume" size={22} /> {t('dict.listen')}</button>
          </div>
          <div className="cz-options">
            {cur.options.map((opt, k) => {
              const cls =
                'cz-opt' +
                (picked !== null && opt === (cur.card.back || '') ? ' right' : '') +
                (picked === opt && opt !== (cur.card.back || '') ? ' wrong' : '')
              return (
                <button key={k} className={cls} disabled={picked !== null} onClick={() => pick(opt)}>
                  {opt}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className="dict-actions">
              <button className="btn-primary sm" onClick={() => { setPicked(null); setI((x) => x + 1) }} autoFocus>
                {i + 1 < rounds.length ? t('dict.nextLine') : t('mg.seeResult')} <Icon name="arrow-right" size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* --------------------------- THỬ THÁCH NGÀY --------------------------- */

export function DailyChallenge({ cards, onExit }: { cards: SrsCard[]; onExit: () => void }) {
  const { recordEvent, learnLang, t } = useAppStore()
  const rounds = useMemo(() => buildRounds(cards, Math.min(5, cards.length)), [cards])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [claimed, setClaimed] = useState(dailyDone())

  const cur = rounds[i]
  const finished = i >= rounds.length

  useEffect(() => {
    if (finished && !claimed) {
      recordEvent('review', 5)
      markDaily()
      setClaimed(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const pick = (opt: string) => {
    if (picked !== null) return
    setPicked(opt)
    if (opt === (cur.card.back || '')) setCorrect((n) => n + 1)
  }

  return (
    <div className="mg-wrap">
      <div className="mg-head">
        <button className="btn-ghost sm" onClick={onExit}><Icon name="arrow-left" size={14} /> {t('mg.back')}</button>
        <b>⚡ {t('mg.dailyTitle')}</b>
        <span className="mg-moves">{finished ? '' : `${i + 1}/${rounds.length}`}</span>
      </div>

      {finished ? (
        <div className="mg-done">
          🎉 {t('mg.dailyDone', { a: correct, b: rounds.length })}
          <span className="sr-coin">+10 XP <Icon name="star" size={13} /></span>
          <button className="btn-ghost sm" onClick={onExit}>{t('mg.back')}</button>
        </div>
      ) : (
        <>
          <p className="mg-question" lang={learnLang}>{cur.card.front}</p>
          <div className="cz-options">
            {cur.options.map((opt, k) => {
              const cls =
                'cz-opt' +
                (picked !== null && opt === (cur.card.back || '') ? ' right' : '') +
                (picked === opt && opt !== (cur.card.back || '') ? ' wrong' : '')
              return (
                <button key={k} className={cls} disabled={picked !== null} onClick={() => pick(opt)}>
                  {opt}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className="dict-actions">
              <button className="btn-primary sm" onClick={() => { setPicked(null); setI((x) => x + 1) }} autoFocus>
                {i + 1 < rounds.length ? t('dict.nextLine') : t('mg.seeResult')} <Icon name="arrow-right" size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
