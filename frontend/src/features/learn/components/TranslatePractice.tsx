import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { nativeLangViName } from '@/core/constants/languages'
import { nativeLangName } from '@/core/i18n/translations'
import type { Lesson } from '@/models/lesson.model'

const norm = (s: string) =>
  s.toLowerCase().normalize('NFC').replace(/[.,!?;:"'()]/g, '').trim()

function score(answer: string, ref: string): number {
  const a = norm(answer).split(/\s+/).filter(Boolean)
  const b = norm(ref).split(/\s+/).filter(Boolean)
  if (!a.length || !b.length) return 0
  const setB = new Set(b)
  const hit = a.filter((w) => setB.has(w)).length
  return Math.round((hit / b.length) * 100)
}

function band(n: number) {
  if (n >= 80) return { key: 'tp.b80', c: 'good' }
  if (n >= 50) return { key: 'tp.b50', c: 'mid' }
  if (n >= 20) return { key: 'tp.b20', c: 'low' }
  return { key: 'tp.b0', c: 'low' }
}

export default function TranslatePractice({ lesson }: { lesson: Lesson }) {
  const { learnLang, nativeLang, t, uiLang } = useAppStore()
  const items = useMemo(() => lesson.segments.filter((s) => s.vi), [lesson])
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [scores, setScores] = useState<number[]>([])

  if (!items.length) return <div className="empty"><div className="big">📝</div>{t('tp.empty')}</div>

  const cur = items[i]
  const sc = revealed ? score(val, cur.vi || '') : 0
  const b = band(sc)

  const check = () => { if (val.trim()) setRevealed(true) }
  const next = () => {
    const ns = [...scores, sc]
    if (i + 1 >= items.length) { setScores(ns); setDone(true); return }
    setScores(ns); setI(i + 1); setVal(''); setRevealed(false)
  }
  const restart = () => { setI(0); setVal(''); setRevealed(false); setDone(false); setScores([]) }

  if (done) {
    const avg = Math.round(scores.reduce((a, c) => a + c, 0) / scores.length)
    return (
      <div className="tp-done">
        <div className="tp-done-ic"><Icon name="trophy" size={34} /></div>
        <h3>{t('tp.doneTitle')}</h3>
        <p>{t('tp.doneAvg')}</p>
        <div className="tp-score-big">{avg}<small>/100</small></div>
        <button className="btn-primary" onClick={restart}><Icon name="arrow-left" size={15} /> {t('tp.again')}</button>
      </div>
    )
  }

  return (
    <div className="tp">
      <div className="tp-progress">
        <span>{t('sh.line', { a: i + 1, b: items.length })}</span>
        <div className="tp-bar"><span style={{ width: ((i + (revealed ? 1 : 0)) / items.length) * 100 + '%' }} /></div>
      </div>

      <div className="tp-card">
        <div className="tp-label">{t('tp.label', { lang: nativeLangName(uiLang, nativeLang, nativeLangViName(nativeLang)) })}</div>
        <div className="tp-ko" lang={learnLang}>{cur.ko}</div>

        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); revealed ? next() : check() } }}
          placeholder={t('tp.placeholder')} aria-label={t('tp.placeholder')}
          disabled={revealed}
          rows={2}
        />

        {revealed && (
          <div className={'tp-result ' + b.c}>
            <div className="tp-result-head"><b>{t(b.key)}</b><span className="tp-pct">{sc}%</span></div>
            <div className="tp-ref"><span>{t('tp.ref')}</span> {cur.vi}</div>
          </div>
        )}

        <div className="tp-actions">
          {!revealed ? (
            <button className="btn-primary" disabled={!val.trim()} onClick={check}><Icon name="check" size={16} /> {t('dict.check')}</button>
          ) : (
            <button className="btn-primary" onClick={next}>{i + 1 >= items.length ? t('tp.result') : t('dict.nextLine')} <Icon name="arrow-right" size={16} /></button>
          )}
        </div>
      </div>
    </div>
  )
}
