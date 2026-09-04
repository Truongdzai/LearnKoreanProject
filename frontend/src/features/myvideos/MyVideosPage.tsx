import { useMemo } from 'react'
import Icon from '@/core/components/Icon'
import { thumbUrl, videoUrl } from '@/data/videos'
import { useAppStore } from '@/store/app.store'

export default function MyVideosPage() {
  const { savedVideos, removeVideo, loadLesson, setView, t, learnLangName, learnLang } = useAppStore()
  const list = useMemo(
    () => savedVideos.filter((v) => (v.lang || 'ko') === learnLang),
    [savedVideos, learnLang],
  )

  return (
    <div className="myvideos">
      <div className="drawer-plate">
        <div className="drawer-label">
          <span className="drawer-label-sub">{t('mv.drawer')}</span>
          <b>{learnLangName}</b>
        </div>
        <div className="drawer-count">
          <b>{list.length}</b>
          <span>{t('mv.cardsUnit')}</span>
        </div>
      </div>
      <p className="drawer-note">{t('mv.sub')}</p>

      {list.length === 0 ? (
        <div className="empty">
          <Icon name="tv" size={30} />
          {t('mv.empty')}
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={() => setView('home')}><Icon name="plus" size={15} /> {t('mv.first')}</button>
          </div>
        </div>
      ) : (
        <div className="vgrid">
          {list.map((v) => (
            <div key={v.id} className="vcard saved" title={v.title}>
              <div className={'thumb ' + v.tone} onClick={() => loadLesson(videoUrl(v.id), { lang: v.lang || 'ko', video: v })}>
                <img src={thumbUrl(v.id)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <span className="ko-tag" lang={v.lang || 'ko'}>{v.topic}</span>
                <span className="play"><Icon name="play" size={17} /></span>
                <span className="dur">{v.dur}</span>
              </div>
              <div className="vcard-body">
                <div className="t">{v.title}</div>
                <div className="vcard-meta">
                  <span className="badge">{v.level}</span>
                  <span className="listens">{v.channel}</span>
                  <button className="vcard-del" title={t('mv.remove')} onClick={() => removeVideo(v.id)}>
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
