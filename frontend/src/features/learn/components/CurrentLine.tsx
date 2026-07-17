import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { romanizeLine } from '@/core/utils/romanize'
import { explainSentence, type ExplainResult } from '@/core/api/learn.api'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import type { Segment } from '@/models/lesson.model'

// Đã giải thích câu nào thì giữ cho cả phiên — đổi câu qua lại không gọi AI lần nữa.
const explainCache = new Map<string, ExplainResult>()

export default function CurrentLine({ segment }: { segment?: Segment }) {
  const { learnLang, nativeLang, t } = useAppStore()
  const cfg = studyLang(learnLang)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [data, setData] = useState<ExplainResult | null>(null)

  const sentence = segment?.ko || ''

  useEffect(() => {
    setOpen(false)
    setErr('')
    setData(explainCache.get(sentence) || null)
  }, [sentence])

  const explain = async () => {
    if (!sentence) return
    if (explainCache.has(sentence)) {
      setData(explainCache.get(sentence)!)
      setOpen(true)
      return
    }
    setOpen(true)
    setLoading(true)
    setErr('')
    try {
      const r = await explainSentence(sentence, segment?.vi || '', learnLang, nativeLang)
      explainCache.set(sentence, r)
      setData(r)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cur-line">
      {segment && cfg.romanizeChat && <div className="ph">{romanizeLine(segment.ko)}</div>}
      <div className="ko" lang={learnLang}>{segment ? segment.ko : '—'}</div>
      <div className="vi">{segment?.vi || t('learn.clickLine')}</div>

      {segment && (
        <div className="gx-row">
          {!open ? (
            <button className="btn-ghost sm gx-btn" onClick={explain}>
              <Icon name="bulb" size={14} /> {t('gx.button')}
            </button>
          ) : (
            <button className="btn-ghost sm gx-btn" onClick={() => setOpen(false)}>
              <Icon name="x" size={13} /> {t('gx.close')}
            </button>
          )}
        </div>
      )}

      {open && (
        <div className="gx-panel">
          {loading ? (
            <div className="gx-loading"><Spinner /> {t('gx.loading')}</div>
          ) : err ? (
            <div className="gx-err"><Icon name="x-circle" size={14} /> {err}</div>
          ) : data ? (
            <>
              <div className="gx-structure"><Icon name="letters" size={14} /> {data.structure}</div>
              <ul className="gx-points">
                {data.points.map((p, k) => (
                  <li key={k}><b lang={learnLang}>{p.piece}</b><span>{p.explain}</span></li>
                ))}
              </ul>
              {data.tip && <div className="gx-tip">💡 {data.tip}</div>}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
