import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { starLine } from '@/core/utils/diffWords'
import { useAppStore } from '@/store/app.store'
import type { Lesson } from '@/models/lesson.model'

interface Props {
  segs: Lesson['segments']
  current: number
  scores: Record<string, number>
  pass: number
  masked: boolean
  onJump: (idx: number) => void
  onReset: () => void
  phonetic?: (text: string) => string
  side?: boolean
}

export default function TranscriptRail({
  segs, current, scores, pass, masked, onJump, onReset, phonetic, side,
}: Props) {
  const { learnLang, t } = useAppStore()
  const [confirm, setConfirm] = useState(false)
  const [open, setOpen] = useState(true)
  const [showPh, setShowPh] = useState(true)
  const [showVi, setShowVi] = useState(true)
  const listRef = useRef<HTMLOListElement | null>(null)

  const vals = Object.values(scores)
  const passed = vals.filter((v) => v >= pass).length
  const pct = segs.length ? Math.round((passed / segs.length) * 100) : 0

  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>('.rail-row.on')
    row?.scrollIntoView({ block: 'nearest' })
  }, [current, open])

  useEffect(() => { setConfirm(false) }, [segs.length])

  return (
    <div className={'rail' + (open ? '' : ' folded') + (masked ? ' masked' : '') + (side ? ' side' : '')}>
      <div className="rail-head">
        <button className="rail-fold" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />
          <Icon name="letters" size={15} /> {t('rail.title')}
        </button>
        {phonetic && (
          <button className={'rail-tog' + (showPh ? ' on' : '')} onClick={() => setShowPh((v) => !v)}>
            <Icon name={showPh ? 'eye' : 'eye-off'} size={13} /> {t('rail.ipa')}
          </button>
        )}
        <button className={'rail-tog' + (showVi ? ' on' : '')} onClick={() => setShowVi((v) => !v)}>
          <Icon name={showVi ? 'eye' : 'eye-off'} size={13} /> {t('rail.trans')}
        </button>
        <div className="rail-prog">
          <div className="tp-bar"><span style={{ width: pct + '%' }} /></div>
          <span>{t('rail.done', { n: passed, total: segs.length, pct })}</span>
        </div>
        {vals.length > 0 && (
          confirm ? (
            <span className="rail-confirm">
              <button className="btn-ghost sm danger" onClick={() => { onReset(); setConfirm(false) }}>
                <Icon name="trash" size={13} /> {t('rail.resetYes')}
              </button>
              <button className="btn-ghost sm" onClick={() => setConfirm(false)}>{t('rail.resetNo')}</button>
            </span>
          ) : (
            <button className="btn-ghost sm" onClick={() => setConfirm(true)} title={t('rail.resetTip')}>
              <Icon name="trash" size={13} /> {t('rail.reset')}
            </button>
          )
        )}
      </div>

      {open && (
        <ol className="rail-list" ref={listRef}>
          {segs.map((s, k) => {
            const sc = scores[String(k)]
            const ok = sc != null && sc >= pass
            const show = !masked || ok
            const ipa = phonetic && showPh && show ? phonetic(s.ko) : ''
            return (
              <li key={k}>
                <button
                  className={'rail-row' + (k === current ? ' on' : '') + (ok ? ' passed' : sc != null ? ' tried' : '')}
                  onClick={() => onJump(k)}
                >
                  <span className="rail-top">
                    <span className="rail-n">#{k + 1}</span>
                    {sc != null && (
                      <span className="rail-score">
                        {ok && <Icon name="check-circle" size={13} />} {sc}%
                      </span>
                    )}
                  </span>
                  <span className="rail-text" lang={learnLang}>
                    {show ? s.ko : starLine(s.ko, learnLang)}
                  </span>
                  {ipa && <span className="rail-ipa">{ipa}</span>}
                  {showVi && s.vi && <span className="rail-vi">{s.vi}</span>}
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
