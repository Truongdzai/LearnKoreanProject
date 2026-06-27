import Icon from '@/core/components/Icon'
import { thumbUrl, videoUrl } from '@/data/videos'
import { useAppStore } from '@/store/app.store'

export default function MyVideosPage() {
  const { savedVideos, removeVideo, loadLesson, setView } = useAppStore()

  return (
    <div className="myvideos">
      <h1 className="page-title"><Icon name="tv" /> Video của tôi</h1>
      <p className="page-sub">Mọi video bạn đã dán link để dịch được lưu lại đây — không cần dán lại lần sau.</p>

      {savedVideos.length === 0 ? (
        <div className="empty">
          <div className="big">📺</div>
          Chưa có video nào được lưu.
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={() => setView('home')}><Icon name="plus" size={15} /> Dịch video đầu tiên</button>
          </div>
        </div>
      ) : (
        <div className="vgrid">
          {savedVideos.map((v) => (
            <div key={v.id} className="vcard saved" title={v.title}>
              <div className={'thumb ' + v.tone} onClick={() => loadLesson(videoUrl(v.id), { lang: v.lang || 'ko' })}>
                <img src={thumbUrl(v.id)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <span className="ko-tag" lang="ko">{v.topic}</span>
                <span className="play">▶</span>
                <span className="dur">{v.dur}</span>
              </div>
              <div className="vcard-body">
                <div className="t">{v.title}</div>
                <div className="vcard-meta">
                  <span className="badge">{v.level}</span>
                  <span className="listens">{v.channel}</span>
                  <button className="vcard-del" title="Xoá khỏi danh sách" onClick={() => removeVideo(v.id)}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
