import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { addCard } from '@/core/api/srs.api'
import { addTopic } from '@/core/utils/topics'
import { parseWordsFromText } from '@/core/utils/parseImport'
import { useAppStore } from '@/store/app.store'
import { useDialog } from '@/core/a11y'

interface Props {
  onClose: () => void
  onCreated: (name: string, addedWords: number) => void
}

export default function CreateTopicModal({ onClose, onCreated }: Props) {
  const { user, recordEvent, t } = useAppStore()
  const boxRef = useDialog<HTMLDivElement>(true, onClose)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  const submit = async () => {
    const clean = name.trim()
    if (!clean) { setErr(t('ctm.errEmpty')); return }
    setBusy(true)
    setErr('')
    try {
      addTopic(user.id, clean)
      const words = parseWordsFromText(text)
      if (words.length) {
        const CHUNK = 8
        for (let i = 0; i < words.length; i += CHUNK) {
          await Promise.all(
            words.slice(i, i + CHUNK).map((w) => addCard({ front: w.front, back: w.back, source: clean }).catch(() => null)),
          )
        }
        recordEvent('word', words.length, 0, words.length)
      }
      onCreated(clean, words.length)
      onClose()
    } catch (e) {
      setErr((e as Error).message || t('ctm.errFail'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="vmodal-backdrop" onClick={onClose}>
      <div className="vmodal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="ctm-title" onClick={(e) => e.stopPropagation()}>
        <div className="vmodal-head">
          <h3 id="ctm-title"><Icon name="cards" size={18} /> {t('ctm.title')}</h3>
          <button type="button" className="vmodal-x" onClick={onClose} aria-label={t('a11y.close')}><Icon name="x" size={18} /></button>
        </div>

        <label className="vmodal-label">{t('ctm.name')}</label>
        <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('ctm.namePh')} aria-label={t('ctm.name')} />

        <label className="vmodal-label">{t('ctm.words')}</label>
        <textarea
          className="vmodal-textarea sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'메뉴 - thực đơn\n계산서 - hoá đơn'}
          aria-label={t('ctm.words')}
        />

        {err && <div className="vmodal-err">{err}</div>}

        <div className="vmodal-foot">
          <button className="btn-ghost" onClick={onClose}>{t('vm.cancel')}</button>
          <button className="btn-primary" disabled={busy} onClick={submit}>
            {busy ? t('ctm.creating') : t('ctm.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
