import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { pronunciationScore, markWords, scoreBand } from '@/core/utils/pronounce'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import type { Lesson } from '@/models/lesson.model'

const REWARD = 2

export default function DictationPractice({ lesson }: { lesson: Lesson }) {
  const { recordEvent, learnLang, t, learnLangName } = useAppStore()
  const cfg = studyLang(learnLang)
  const segs = lesson.segments
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [checked, setChecked] = useState(false)
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())

  const cur = segs[i]

  const speak = (rate = 0.85) => speakLang(cur.ko, cfg.locale, rate)

  const score = checked ? pronunciationScore(cur.ko, val) : 0
  const band = scoreBand(score)
  const marks = checked ? markWords(cur.ko, val) : []

  const check = () => {
    if (!val.trim()) return
    setChecked(true)
    const sc = pronunciationScore(cur.ko, val)
    if (sc >= 70 && !rewarded.has(i)) {
      recordEvent('review', 1)
      setRewarded((r) => new Set(r).add(i))
    }
  }

  const go = (idx: number) => {
    if (idx < 0 || idx >= segs.length) return
    setI(idx); setVal(''); setChecked(false)
  }

  return (
    <div className="dictation">
      <div className="shadow-bar">
        <button className="btn-ghost sm" disabled={i === 0} onClick={() => go(i - 1)}><Icon name="chevron-left" size={15} /> {t('sh.prev')}</button>
        <div className="shadow-prog">
          <span>{t('sh.line', { a: i + 1, b: segs.length })}</span>
          <div className="tp-bar"><span style={{ width: ((i + 1) / segs.length) * 100 + '%' }} /></div>
          <span className="shadow-passed"><Icon name="check-circle" size={14} /> {t('dict.correct', { n: rewarded.size })}</span>
        </div>
        <button className="btn-ghost sm" disabled={i === segs.length - 1} onClick={() => go(i + 1)}>{t('sh.next')} <Icon name="arrow-right" size={15} /></button>
      </div>

      <div className="dict-card">
        <div className="dict-label"><Icon name="headphones" size={15} /> {t('dict.label', { lang: learnLangName })}</div>

        <div className="dict-listen">
          <button className="dict-play" onClick={() => speak(0.85)}><Icon name="volume" size={22} /> {t('dict.listen')}</button>
          <button className="btn-ghost" onClick={() => speak(0.55)}><Icon name="volume" size={16} /> {t('sh.slow')}</button>
        </div>

        {!checked ? (
          <textarea
            lang={learnLang}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check() } }}
            placeholder={t('dict.placeholder')}
            rows={2}
            autoFocus
          />
        ) : (
          <div className="dict-review">
            <div className="dict-yours">
              <span className="dict-mini">{t('dict.yours')}</span>
              <span lang={learnLang}>{val || t('dict.empty')}</span>
            </div>
            <div className="dict-correct">
              <span className="dict-mini">{t('dict.answer')}</span>
              <span lang={learnLang}>
                {marks.map((m, k) => <span key={k} className={'sw ' + (m.ok ? 'ok' : 'miss')}>{m.word} </span>)}
              </span>
            </div>
            {cur.vi && <div className="dict-vi">{cur.vi}</div>}
          </div>
        )}

        {checked && (
          <div className={'dict-score ' + band.tone}>
            <b>{t(band.labelKey)}</b>
            <span className="dict-pct">{score}%</span>
            {score >= 70 && rewarded.has(i) && <span className="sr-coin">+{REWARD} XP <Icon name="star" size={13} /></span>}
          </div>
        )}

        <div className="dict-actions">
          {!checked ? (
            <button className="btn-primary" disabled={!val.trim()} onClick={check}><Icon name="check" size={16} /> {t('dict.check')}</button>
          ) : (
            <>
              <button className="btn-ghost sm" onClick={() => { setChecked(false); setVal('') }}><Icon name="headphones" size={14} /> {t('dict.retype')}</button>
              {i < segs.length - 1 && <button className="btn-primary sm" onClick={() => go(i + 1)}>{t('dict.nextLine')} <Icon name="arrow-right" size={15} /></button>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
