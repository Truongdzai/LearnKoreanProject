import { thumbUrl } from '@/data/videos'
import type { Video } from '@/models/video.model'

interface Props {
  video: Video
  onPick: (v: Video) => void
}

export default function VideoCard({ video, onPick }: Props) {
  return (
    <div className="vcard" onClick={() => onPick(video)} title={video.title}>
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
        <span className="play">▶</span>
        <span className="dur">{video.dur}</span>
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
