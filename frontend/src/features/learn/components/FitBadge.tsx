import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { getToken } from '@/core/api/client'
import { fetchFit, type FitScore } from '@/core/api/tutor.api'
import { useAppStore } from '@/store/app.store'

interface Props {
  videoId: string
  lang: string
}

const BAND_TEXT: Record<string, { label: string; note: string }> = {
  fit: {
    label: 'Vừa sức (i+1)',
    note: 'Đúng vùng học hiệu quả nhất: hiểu gần hết, còn vài từ mới để nhặt.',
  },
  easy: {
    label: 'Dễ với bạn',
    note: 'Bạn đã biết gần hết từ trong video — hợp để luyện nghe nhanh và phát âm.',
  },
  hard: {
    label: 'Hơi khó',
    note: 'Nhiều từ chưa biết. Cứ xem nhưng nên bấm lưu từ mới, hoặc chọn video dễ hơn trước.',
  },
}

export default function FitBadge({ videoId, lang }: Props) {
  const { setView } = useAppStore()
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

  if (!fit || fit.band === 'unknown') return null
  const text = BAND_TEXT[fit.band]
  if (!text) return null

  return (
    <div className="fit-row">
      <span className={'fit-badge ' + fit.band}>
        <Icon name="target" size={13} /> {fit.known_pct}% từ bạn đã biết · {text.label}
      </span>
      <span className="fit-note">{text.note}</span>
      {!!fit.new_words.length && (
        <span className="fit-new">
          <span className="fit-note">Từ mới hay gặp:</span>
          {fit.new_words.slice(0, 6).map((w) => <b key={w} lang={lang}>{w}</b>)}
        </span>
      )}
      <button className="btn-ghost sm" onClick={() => setView('vocab')} title={`Kho từ của bạn: ${known} từ`}>
        <Icon name="cards" size={13} /> Kho từ: {known}
      </button>
    </div>
  )
}
