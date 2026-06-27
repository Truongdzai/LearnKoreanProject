import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { addCard } from '@/core/api/srs.api'
import { defineWordRich } from '@/core/api/dict.api'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'

interface Props {
  topics: string[]
  defaultTopic?: string
  onClose: () => void
  onAdded: () => void
}

export default function AddVocabModal({ topics, defaultTopic = '', onClose, onAdded }: Props) {
  const { recordEvent, learnLang, nativeLang } = useAppStore()
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
    } catch { /* tra cứu không bắt buộc */ } finally {
      setTranslating(false)
    }
  }

  const submit = async () => {
    const f = front.trim()
    if (!f) { setErr('Hãy nhập từ cần thêm.'); return }
    setBusy(true)
    setErr('')
    try {
      await addCard({ front: f, back: back.trim(), source: topic.trim() })
      recordEvent('word', 1, 0, 1)
      onAdded()
      onClose()
    } catch (e) {
      setErr((e as Error).message || 'Không thêm được, hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="vmodal-backdrop" onClick={onClose}>
      <div className="vmodal" onClick={(e) => e.stopPropagation()}>
        <div className="vmodal-head">
          <h3><Icon name="plus" size={18} /> Thêm từ vựng mới</h3>
          <button className="vmodal-x" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <label className="vmodal-label">Từ ({cfg.name})</label>
        <div className="vmodal-inline">
          <input
            ref={frontRef}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && autoTranslate()}
            placeholder={`vd: ${cfg.sample[0]}`}
            lang={learnLang}
          />
          <button className="btn-ghost sm" disabled={!front.trim() || translating} onClick={autoTranslate}>
            {translating ? '…' : <><Icon name="sparkles" size={14} /> Tự dịch</>}
          </button>
        </div>

        <label className="vmodal-label">Nghĩa</label>
        <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Nghĩa tiếng Việt…" />

        <label className="vmodal-label">Chủ đề (tuỳ chọn)</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="vd: Đồ ăn, Du lịch…"
          list="vmodal-topics"
        />
        <datalist id="vmodal-topics">
          {topics.map((t) => <option key={t} value={t} />)}
        </datalist>

        {err && <div className="vmodal-err">{err}</div>}

        <div className="vmodal-foot">
          <button className="btn-ghost" onClick={onClose}>Huỷ</button>
          <button className="btn-primary" disabled={busy} onClick={submit}>
            {busy ? 'Đang lưu…' : 'Thêm thẻ'}
          </button>
        </div>
      </div>
    </div>
  )
}
