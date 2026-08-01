import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { addCard } from '@/core/api/srs.api'
import { useAppStore } from '@/store/app.store'
import { useDialog } from '@/core/a11y'
import type { ContextPack } from '@/data/contextPacks'

interface Props {
  pack: ContextPack
  lang: string
  onClose: () => void
  onAdded: (n: number) => void
}

export default function ContextPackModal({ pack, lang, onClose, onAdded }: Props) {
  const { recordEvent, t } = useAppStore()
  const boxRef = useDialog<HTMLDivElement>(true, onClose)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const words = pack.words[lang] || []

  const addAll = async () => {
    setBusy(true); setErr('')
    let added = 0
    try {
      for (const w of words) {
        await addCard({ front: w.term, back: w.sub ? `${w.vi} · ${w.sub}` : w.vi, source: pack.name })
        added++
      }
      recordEvent('word', added, 0, added)
      onAdded(added)
      onClose()
    } catch {
      if (added > 0) {
        recordEvent('word', added, 0, added)
        onAdded(added)
        onClose()
      } else {
        setErr(t('cpm.fail'))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal pack-modal" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="pack-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lookup-close auth-close" onClick={onClose} aria-label={t('a11y.close')}><Icon name="x" /></button>

        <div className="auth-head">
          <span className="pack-emoji">{pack.emoji}</span>
          <h2>{pack.name}</h2>
          <p>{pack.desc}</p>
        </div>

        <div className="pack-words">
          {words.map((w) => (
            <div key={w.term} className="pack-word">
              <div className="pack-word-top">
                <b>{w.term}</b>
                {w.sub && <span className="pack-sub">{w.sub}</span>}
                <span className="pack-vi">{w.vi}</span>
              </div>
              <div className="pack-ex">{w.ex} <small>— {w.exVi}</small></div>
            </div>
          ))}
        </div>

        {err && <p className="auth-err">{err}</p>}

        <button className="btn-primary pack-add" disabled={busy} onClick={addAll}>
          <Icon name="plus" size={15} /> {busy ? t('cpm.adding') : t('cpm.addAll', { n: words.length })}
        </button>
      </div>
    </div>
  )
}
