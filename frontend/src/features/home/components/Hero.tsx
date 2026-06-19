import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import Icon from '@/core/components/Icon'

export default function Hero() {
  const { loadLesson, loadSample } = useAppStore()
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState<'youtube' | 'upload'>('youtube')

  return (
    <section className="hero">
      <div className="hero-in">
        <h1>Luyện Shadowing qua bất kỳ video nào bạn thích <Icon name="film" /></h1>
        <p>Dán link YouTube tiếng Hàn có ngay phụ đề Hàn - Việt, học theo từng câu và lưu vào Anki.</p>

        <div className="maker">
          <div className="maker-tabs">
            <button className={tab === 'youtube' ? 'on' : ''} onClick={() => setTab('youtube')}>
              <Icon name="play" /> YouTube
            </button>
            <button disabled title="Sắp có"><Icon name="upload" /> Tải lên (sắp có)</button>
          </div>
          <div className="maker-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadLesson(url)}
              placeholder="Dán link YouTube tiếng Hàn vào đây…"
            />
            <button className="go" onClick={() => loadLesson(url)}>
              <Icon name="sparkles" /> Tạo bài học
            </button>
          </div>
          <p className="maker-hint">
            Mẹo: chọn video có phụ đề tiếng Hàn để chất lượng tốt nhất. Lần đầu tải mất ~10-60 giây.
            {' · '}
            <button type="button" className="link-sample" onClick={loadSample}>
              <Icon name="film" /> Thử ngay bài học mẫu (không cần dán link)
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}
