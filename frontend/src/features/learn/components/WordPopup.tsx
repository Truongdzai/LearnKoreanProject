import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import type { DictResult } from '@/models/dict.model'

interface Props {
  x: number
  y: number
  loading: boolean
  result: DictResult | null
  error?: string
  onClose: () => void
  onSave?: (front: string, back: string) => Promise<unknown> | void
}

export default function WordPopup({ x, y, loading, result, error, onClose, onSave }: Props) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'done'>('idle')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = async () => {
    if (!result || !onSave) return
    setSaveState('saving')
    try {
      const back = result.entries.slice(0, 3).map((e) => e.meaning).join(' / ')
      await onSave(result.word, back)
      setSaveState('done')
    } catch {
      setSaveState('idle')
    }
  }

  const left = Math.min(x, window.innerWidth - 340)
  const top = Math.min(y + 8, window.innerHeight - 240)

  return (
    <>
      <div className="wpop-backdrop" onClick={onClose} />
      <div className="wpop" style={{ left: Math.max(8, left), top: Math.max(8, top) }}>
        <button className="wpop-close" onClick={onClose} aria-label="Đóng"><Icon name="x" /></button>

        {loading && <div className="wpop-empty"><Icon name="clock" /> Đang tra…</div>}
        {error && <div className="wpop-empty"><Icon name="x-circle" /> {error}</div>}

        {!loading && !error && result && result.entries.length === 0 && (
          <div className="wpop-empty">
            Không tìm thấy <b lang="ko">{result.word}</b> trong từ điển.
            <div className="wpop-hint">(Dạng rút gọn/bất quy tắc sẽ được hỗ trợ tốt hơn sau.)</div>
          </div>
        )}

        {!loading && !error && result && result.entries.length > 0 && (
          <>
            <div className="wpop-head">
              <span className="wpop-term" lang="ko">{result.word}</span>
              {result.entries[0].hanja && (
                <span className="wpop-hanja">〔{result.entries[0].hanja}〕</span>
              )}
              {result.matched === 'base' && <span className="wpop-base">dạng gốc</span>}
            </div>
            <div className="wpop-defs">
              {result.entries.map((e, i) => (
                <div className="wpop-def" key={i}>
                  {e.pos && <span className="wpop-pos">{e.pos}</span>}
                  <span className="wpop-meaning">{e.meaning}</span>
                </div>
              ))}
            </div>
            {onSave && (
              <button
                className={'wpop-save' + (saveState === 'done' ? ' done' : '')}
                disabled={saveState !== 'idle'}
                onClick={save}
              >
                {saveState === 'done' ? (
                  <><Icon name="check" /> Đã lưu vào bộ thẻ</>
                ) : saveState === 'saving' ? (
                  '…'
                ) : (
                  <><Icon name="plus" /> Lưu từ này</>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
