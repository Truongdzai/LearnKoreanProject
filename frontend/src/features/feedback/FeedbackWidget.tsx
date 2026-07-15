import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { sendFeedbackApi, type FeedbackKind } from '@/core/api/feedback.api'
import { useAppStore } from '@/store/app.store'

export default function FeedbackWidget() {
  const { view, t } = useAppStore()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<FeedbackKind>('idea')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const show = () => {
    setKind('idea'); setMessage(''); setDone(false); setErr('')
    setOpen(true)
  }

  const submit = async () => {
    setBusy(true); setErr('')
    try {
      await sendFeedbackApi(kind, message, view)
      setDone(true)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className="feedback-fab" onClick={show} title={t('fb.fabHint')}>
        <Icon name="bulb" size={17} /> {t('fb.fab')}
      </button>

      {open && (
        <div className="auth-backdrop" onClick={() => setOpen(false)}>
          <div className="auth-modal feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lookup-close auth-close" onClick={() => setOpen(false)}><Icon name="x" /></button>

            {done ? (
              <div className="feedback-done">
                <span className="goal-emoji">💚</span>
                <h2>{t('fb.thanks')}</h2>
                <p>{t('fb.thanksSub')}</p>
                <button className="btn-primary" onClick={() => setOpen(false)}>{t('fb.close')}</button>
              </div>
            ) : (
              <>
                <div className="auth-head">
                  <h2>{t('fb.title')}</h2>
                  <p>{t('fb.sub')}</p>
                </div>

                <div className="feedback-kind">
                  <button className={kind === 'bug' ? 'on' : ''} onClick={() => setKind('bug')}>{t('fb.bug')}</button>
                  <button className={kind === 'idea' ? 'on' : ''} onClick={() => setKind('idea')}>{t('fb.idea')}</button>
                </div>

                <textarea
                  className="feedback-text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder={kind === 'bug' ? t('fb.phBug') : t('fb.phIdea')}
                />

                {err && <p className="auth-err">{err}</p>}

                <button className="btn-primary feedback-send" disabled={busy || !message.trim()} onClick={submit}>
                  <Icon name="send" size={15} /> {busy ? t('fb.sending') : t('fb.send')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
