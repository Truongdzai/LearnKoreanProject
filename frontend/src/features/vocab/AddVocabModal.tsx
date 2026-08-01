import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { addCard } from '@/core/api/srs.api'
import { defineWordRich } from '@/core/api/dict.api'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { useDialog } from '@/core/a11y'

interface Props {
  topics: string[]
  defaultTopic?: string
  onClose: () => void
  onAdded: () => void
}

export default function AddVocabModal({ topics, defaultTopic = '', onClose, onAdded }: Props) {
  const { recordEvent, learnLang, nativeLang, t, learnLangName } = useAppStore()
  const boxRef = useDialog<HTMLDivElement>(true, onClose)
  const cfg = studyLang(learnLang)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [topic, setTopic] = useState(defaultTopic)
  const [busy, setBusy] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [err, setErr] = useState('')
  const frontRef = useRef<HTMLInputElement>(null)

  useEffect(() => { frontRef.current?.focus() }, [])

  const autoTranslate = async () => {
    const w = front.trim()
    if (!w || translating) return
    setTranslating(true)
    try {
      const r = await defineWordRich(w, learnLang, nativeLang)
      const meaning = r.rich?.meaning || r.entries?.[0]?.meaning
      if (meaning) setBack(meaning)
    } catch {} finally {
      setTranslating(false)
    }
  }

  const submit = async () => {
    const f = front.trim()
    if (!f) { setErr(t('vam.errEmpty')); return }
    setBusy(true)
    setErr('')
    try {
      await addCard({ front: f, back: back.trim(), source: topic.trim() })
      recordEvent('word', 1, 0, 1)
      onAdded()
      onClose()
    } catch (e) {
      setErr((e as Error).message || t('vam.errFail'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="vmodal-backdrop" onClick={onClose}>
      <div className="vmodal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="vam-title" onClick={(e) => e.stopPropagation()}>
        <div className="vmodal-head">
          <h3 id="vam-title"><Icon name="plus" size={18} /> {t('vam.title')}</h3>
          <button type="button" className="vmodal-x" onClick={onClose} aria-label={t('a11y.close')}><Icon name="x" size={18} /></button>
        </div>

        <label className="vmodal-label">{t('vam.word', { lang: learnLangName })}</label>
        <div className="vmodal-inline">
          <input
            ref={frontRef}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && autoTranslate()}
            placeholder={t('vam.sample', { s: cfg.sample[0] })}
            aria-label={t('vam.word', { lang: learnLangName })}
            lang={learnLang}
          />
          <button className="btn-ghost sm" disabled={!front.trim() || translating} onClick={autoTranslate}>
            {translating ? '…' : <><Icon name="sparkles" size={14} /> {t('vam.auto')}</>}
          </button>
        </div>

        <label className="vmodal-label">{t('vam.meaning')}</label>
        <input value={back} onChange={(e) => setBack(e.target.value)} placeholder={t('vam.meaningPh')} aria-label={t('vam.meaning')} />

        <label className="vmodal-label">{t('vam.topic')}</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('vam.topicPh')}
          aria-label={t('vam.topic')}
          list="vmodal-topics"
        />
        <datalist id="vmodal-topics">
          {topics.map((t) => <option key={t} value={t} />)}
        </datalist>

        {err && <div className="vmodal-err">{err}</div>}

        <div className="vmodal-foot">
          <button className="btn-ghost" onClick={onClose}>{t('vm.cancel')}</button>
          <button className="btn-primary" disabled={busy} onClick={submit}>
            {busy ? t('vam.saving') : t('vam.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
