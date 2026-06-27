import { useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { addCard } from '@/core/api/srs.api'
import { useAppStore } from '@/store/app.store'
import { parseWordsFromText, readFileText } from '@/core/utils/parseImport'

interface Props {
  title?: string
  topics: string[]
  defaultTopic?: string
  onClose: () => void
  onImported: (count: number) => void
}

const ACCEPT = '.txt,.csv,.md,.docx,.pdf'

export default function ImportVocabModal({ title = 'Import từ', topics, defaultTopic = '', onClose, onImported }: Props) {
  const { recordEvent } = useAppStore()
  const [text, setText] = useState('')
  const [topic, setTopic] = useState(defaultTopic)
  const [fileName, setFileName] = useState('')
  const [reading, setReading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const words = useMemo(() => parseWordsFromText(text), [text])

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setErr('')
    setReading(true)
    setFileName(file.name)
    try {
      const content = await readFileText(file)
      const parsed = parseWordsFromText(content)
      if (!parsed.length) {
        setErr('Không đọc được từ nào từ tệp này. Với PDF dạng ảnh, hãy thử .docx hoặc dán văn bản.')
      }
      setText((prev) => (prev.trim() ? prev + '\n' : '') + content.trim())
    } catch (e) {
      setErr((e as Error).message || 'Không đọc được tệp.')
    } finally {
      setReading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const doImport = async () => {
    if (!words.length || busy) return
    setBusy(true)
    setErr('')
    setProgress(0)
    const src = topic.trim()
    let done = 0
    try {
      const CHUNK = 8
      for (let i = 0; i < words.length; i += CHUNK) {
        const batch = words.slice(i, i + CHUNK)
        await Promise.all(
          batch.map((w) => addCard({ front: w.front, back: w.back, source: src }).catch(() => null)),
        )
        done += batch.length
        setProgress(done)
      }
      recordEvent('word', words.length, 0, words.length)
      onImported(words.length)
      onClose()
    } catch (e) {
      setErr((e as Error).message || 'Có lỗi khi import.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="vmodal-backdrop" onClick={onClose}>
      <div className="vmodal lg" onClick={(e) => e.stopPropagation()}>
        <div className="vmodal-head">
          <h3><Icon name="upload" size={18} /> {title}</h3>
          <button className="vmodal-x" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <p className="vmodal-hint">
          Dán danh sách (mỗi dòng một từ, dạng <b>từ - nghĩa</b>) hoặc tải tệp lên.
          Hỗ trợ <b>.txt, .csv, .docx</b> tốt nhất; <b>.pdf</b> dạng văn bản cũng đọc được.
        </p>

        <div className="vmodal-inline">
          <button className="btn-ghost" disabled={reading} onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={15} /> {reading ? 'Đang đọc…' : 'Chọn tệp'}
          </button>
          {fileName && <span className="vmodal-file">{fileName}</span>}
          <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        <textarea
          className="vmodal-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'안녕하세요 - xin chào\n감사합니다 - cảm ơn\n사랑 - tình yêu'}
        />

        <label className="vmodal-label">Lưu vào chủ đề (tuỳ chọn)</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="vd: Nhập từ sách" list="vimport-topics" />
        <datalist id="vimport-topics">
          {topics.map((t) => <option key={t} value={t} />)}
        </datalist>

        {err && <div className="vmodal-err">{err}</div>}

        <div className="vmodal-foot">
          <span className="vmodal-count">{words.length} từ sẵn sàng</span>
          <div className="vmodal-foot-btns">
            <button className="btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn-primary" disabled={busy || !words.length} onClick={doImport}>
              {busy ? `Đang thêm ${progress}/${words.length}…` : `Import ${words.length} từ`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
