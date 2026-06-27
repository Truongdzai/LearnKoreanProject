import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { addCard } from '@/core/api/srs.api'
import { addTopic } from '@/core/utils/topics'
import { parseWordsFromText } from '@/core/utils/parseImport'
import { useAppStore } from '@/store/app.store'

interface Props {
  onClose: () => void
  onCreated: (name: string, addedWords: number) => void
}

export default function CreateTopicModal({ onClose, onCreated }: Props) {
  const { user, recordEvent } = useAppStore()
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  const submit = async () => {
    const clean = name.trim()
    if (!clean) { setErr('Hãy đặt tên cho chủ đề.'); return }
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
      setErr((e as Error).message || 'Không tạo được chủ đề.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="vmodal-backdrop" onClick={onClose}>
      <div className="vmodal" onClick={(e) => e.stopPropagation()}>
        <div className="vmodal-head">
          <h3><Icon name="cards" size={18} /> Tạo chủ đề mới</h3>
          <button className="vmodal-x" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <label className="vmodal-label">Tên chủ đề</label>
        <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="vd: Từ vựng nhà hàng" />

        <label className="vmodal-label">Thêm từ ngay (tuỳ chọn) — mỗi dòng <b>từ - nghĩa</b></label>
        <textarea
          className="vmodal-textarea sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'메뉴 - thực đơn\n계산서 - hoá đơn'}
        />

        {err && <div className="vmodal-err">{err}</div>}

        <div className="vmodal-foot">
          <button className="btn-ghost" onClick={onClose}>Huỷ</button>
          <button className="btn-primary" disabled={busy} onClick={submit}>
            {busy ? 'Đang tạo…' : 'Tạo chủ đề'}
          </button>
        </div>
      </div>
    </div>
  )
}
