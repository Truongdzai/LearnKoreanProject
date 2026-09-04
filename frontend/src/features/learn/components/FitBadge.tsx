import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { getToken } from '@/core/api/client'
import { fetchFit, type FitScore } from '@/core/api/tutor.api'
import { useAppStore } from '@/store/app.store'

interface Props {
  videoId: string
  lang: string
}

const BANDS = ['fit', 'easy', 'hard']

export default function FitBadge({ videoId, lang }: Props) {
  const { setView, t } = useAppStore()
  const [fit, setFit] = useState<FitScore | null>(null)
  const [known, setKnown] = useState(0)

  useEffect(() => {
    if (!videoId || !getToken()) { setFit(null); return }
    let alive = true
    fetchFit([videoId], lang)
      .then((r) => {
        if (!alive) return
        setKnown(r.known)
        setFit(r.fit[videoId] ?? null)
      })
      .catch(() => {  })
    return () => { alive = false }
  }, [videoId, lang])

  if (!fit || !BANDS.includes(fit.band)) return null

  return (
    <div className="fit-row">
      <span className={'fit-badge ' + fit.band}>
        <Icon name="target" size={13} /> {t('fit.pct', { n: fit.known_pct })} · {t('fit.' + fit.band)}
      </span>
      <span className="fit-note">{t('fit.' + fit.band + 'Note')}</span>
      {!!fit.new_words.length && (
        <span className="fit-new">
          <span className="fit-note">{t('fit.newWords')}</span>
          {fit.new_words.slice(0, 6).map((w) => <b key={w} lang={lang}>{w}</b>)}
        </span>
      )}
      <button className="btn-ghost sm" onClick={() => setView('vocab')} title={t('fit.storeTitle', { n: known })}>
        <Icon name="cards" size={13} /> {t('fit.store', { n: known })}
      </button>
    </div>
  )
}
