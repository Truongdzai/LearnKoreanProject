import type { CSSProperties } from 'react'
import { thumbUrl } from '@/data/videos'
import Icon from '@/core/components/Icon'
import type { Video } from '@/models/video.model'
import type { FitScore } from '@/core/api/tutor.api'

interface Props {
  video: Video
  onPick: (v: Video) => void
  saved?: boolean
  onToggleSave?: (v: Video) => void
  saveLabel?: string
  fit?: FitScore
  rv?: CSSProperties
}

const FIT_LABEL: Record<string, string> = { fit: 'Vừa sức', easy: 'Dễ', hard: 'Hơi khó' }

export default function VideoCard({ video, onPick, saved, onToggleSave, saveLabel, fit, rv }: Props) {
  return (
    <div className="vcard" data-rv={rv ? '' : undefined} style={rv} onClick={() => onPick(video)} title={video.title}>
      <div className={'thumb ' + video.tone}>
        <img
          src={thumbUrl(video.id)}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="ko-tag" lang="ko">{video.topic}</span>
        {fit && FIT_LABEL[fit.band] && (
          <span className={'fit-badge lib-fit ' + fit.band} title={`${fit.known_pct}% từ trong video này bạn đã biết`}>
            {FIT_LABEL[fit.band]} · {fit.known_pct}%
          </span>
        )}
        <span className="play">▶</span>
        <span className="dur">{video.dur}</span>
        {onToggleSave && (
          <button
            className={'vcard-save' + (saved ? ' on' : '')}
            title={saveLabel}
            aria-label={saveLabel}
            onClick={(e) => { e.stopPropagation(); onToggleSave(video) }}
          >
            <Icon name={saved ? 'check' : 'plus'} size={15} />
          </button>
        )}
      </div>
      <div className="vcard-body">
        <div className="t">{video.title}</div>
        <div className="vcard-meta">
          <span className="badge">{video.level}</span>
          <span className="listens">{video.channel}</span>
        </div>
      </div>
    </div>
  )
}
