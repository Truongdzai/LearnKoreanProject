import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
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
  const { t } = useAppStore()
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
        <button className="wpop-close" onClick={onClose} aria-label={t('wp.close')}><Icon name="x" /></button>

        {loading && <div className="wpop-empty"><Icon name="clock" /> {t('wp.loading')}</div>}
        {error && <div className="wpop-empty"><Icon name="x-circle" /> {error}</div>}

        {!loading && !error && result && result.entries.length === 0 && (
          <div className="wpop-empty">
            {t('wp.notFoundPre')} <b lang="ko">{result.word}</b> {t('wp.notFoundPost')}
            <div className="wpop-hint">{t('wp.hint')}</div>
          </div>
        )}

        {!loading && !error && result && result.entries.length > 0 && (
          <>
            <div className="wpop-head">
              <span className="wpop-term" lang="ko">{result.word}</span>
              {result.entries[0].hanja && (
                <span className="wpop-hanja">〔{result.entries[0].hanja}〕</span>
              )}
              {result.matched === 'base' && <span className="wpop-base">{t('wp.base')}</span>}
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
                  <><Icon name="check" /> {t('wp.saved')}</>
                ) : saveState === 'saving' ? (
                  '…'
                ) : (
                  <><Icon name="plus" /> {t('wp.save')}</>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
