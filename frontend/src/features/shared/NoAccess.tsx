import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

export default function NoAccess() {
  const { setView, t } = useAppStore()
  const { isAuthed, openAuth } = useAuth()
  return (
    <>
      <h1 className="page-title">{t('noaccess.title')}</h1>
      <div className="soon" style={{ marginTop: 14 }}>
        <div className="big"><Icon name="lock" /></div>
        <h3>{t('noaccess.head')}</h3>
        <p>{isAuthed ? t('noaccess.textAuthed') : t('noaccess.textGuest')}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          {!isAuthed && (
            <button className="btn-primary sm" onClick={openAuth}>
              <Icon name="user" size={15} /> {t('top.login')}
            </button>
          )}
          <button className="btn-new" onClick={() => setView('home')}>
            <Icon name="arrow-left" /> {t('ph.backHome')}
          </button>
        </div>
      </div>
    </>
  )
}
