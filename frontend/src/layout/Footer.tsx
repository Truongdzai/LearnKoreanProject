import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { AppView } from '@/core/constants/enum'

const COLUMNS: { title: string; links: AppView[] }[] = [
  { title: 'foot.col.learn', links: ['library', 'korean', 'english', 'speaking'] },
  { title: 'foot.col.exam', links: ['topik', 'toeic', 'tutor', 'flashcards'] },
  { title: 'foot.col.brand', links: ['about', 'blog', 'help', 'contact'] },
  { title: 'foot.col.legal', links: ['terms', 'privacy'] },
]

export default function Footer() {
  const { setView, t } = useAppStore()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="foot-in">
        <div className="foot-brand">
          <b>VyLing</b>
          <p>{t('foot.tagline')}</p>
          <button className="btn-ghost sm" onClick={() => setView('pricing')}>
            <Icon name="sparkles" size={14} /> {t('page.pricing')}
          </button>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title} className="foot-col">
            <b>{t(c.title)}</b>
            {c.links.map((v) => (
              <button key={v} onClick={() => setView(v)}>{t('nav.' + v)}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="foot-bottom">
        <span>{t('foot.copyright', { year })}</span>
        <span className="foot-note">{t('foot.videoNote')}</span>
      </div>
    </footer>
  )
}
