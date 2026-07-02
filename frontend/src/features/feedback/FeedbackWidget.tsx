import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { sendFeedbackApi, type FeedbackKind } from '@/core/api/feedback.api'
import { useAppStore } from '@/store/app.store'

export default function FeedbackWidget() {
  const { view } = useAppStore()
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
      <button className="feedback-fab" onClick={show} title="Báo lỗi hoặc góp ý cho VyLing">
        <Icon name="bulb" size={17} /> Góp ý
      </button>

      {open && (
        <div className="auth-backdrop" onClick={() => setOpen(false)}>
          <div className="auth-modal feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lookup-close auth-close" onClick={() => setOpen(false)}><Icon name="x" /></button>

            {done ? (
              <div className="feedback-done">
                <span className="goal-emoji">💚</span>
                <h2>Cảm ơn bạn!</h2>
                <p>Phản hồi của bạn đã được gửi — mỗi góp ý đều giúp VyLing tốt hơn.</p>
                <button className="btn-primary" onClick={() => setOpen(false)}>Đóng</button>
              </div>
            ) : (
              <>
                <div className="auth-head">
                  <h2>Góp ý cho VyLing</h2>
                  <p>Gặp lỗi hay có ý tưởng hay? Kể cho tụi mình nghe nhé.</p>
                </div>

                <div className="feedback-kind">
                  <button className={kind === 'bug' ? 'on' : ''} onClick={() => setKind('bug')}>🐞 Báo lỗi</button>
                  <button className={kind === 'idea' ? 'on' : ''} onClick={() => setKind('idea')}>💡 Góp ý / ý tưởng</button>
                </div>

                <textarea
                  className="feedback-text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder={kind === 'bug'
                    ? 'Bạn gặp lỗi gì, ở trang nào, bấm gì thì bị? Càng chi tiết càng dễ sửa…'
                    : 'Bạn muốn VyLing có thêm gì, hay điều gì nên làm khác đi?'}
                />

                {err && <p className="auth-err">{err}</p>}

                <button className="btn-primary feedback-send" disabled={busy || !message.trim()} onClick={submit}>
                  <Icon name="send" size={15} /> {busy ? 'Đang gửi…' : 'Gửi phản hồi'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
