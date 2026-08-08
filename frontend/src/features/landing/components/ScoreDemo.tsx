import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Icon from '@/core/components/Icon'
import { prefersReducedMotion } from '@/core/hooks/useReveal'
import { useAppStore } from '@/store/app.store'

const WORDS = [
  { w: 'Do', ipa: 'duː', s: 'ok' },
  { w: 'you', ipa: 'juː', s: 'ok' },
  { w: 'really', ipa: 'ˈrɪli', s: 'ok' },
  { w: 'thing', ipa: 'θɪŋ', s: 'near' },
  { w: 'And', ipa: 'ænd', s: 'near' },
  { w: 'it’s', ipa: 'ɪts', s: 'near' },
  { w: 'gonna', ipa: 'ˈɡɑnə', s: 'ok' },
  { w: 'tell', ipa: 'tɛl', s: 'bad' },
]

const ISSUES = [
  { a: 'think', ai: 'θɪŋk', b: 'thing', bi: 'θɪŋ', k: 'consonant' },
  { a: 'Andy', ai: 'ˈændi', b: 'And', bi: 'ænd', k: 'vowel' },
]

const MARK: Record<string, string> = { ok: '✓', near: '~', bad: '✕' }
const SCORE = 78
const R = 30
const C = 2 * Math.PI * R
const START = 620

export default function ScoreDemo() {
  const { t } = useAppStore()
  const [on, setOn] = useState(false)
  const [score, setScore] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOn(true)
      setScore(SCORE)
      return
    }
    const timer = window.setTimeout(() => {
      setOn(true)
      const t0 = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 1200)
        setScore(Math.round(SCORE * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf.current = requestAnimationFrame(step)
      }
      raf.current = requestAnimationFrame(step)
    }, START)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(raf.current) }
  }, [])

  return (
    <div className={'lp-demo' + (on ? ' on' : '')} aria-hidden="true">
      <div className="lp-demo-bar">
        <span className="lp-demo-dot" /><span className="lp-demo-dot" /><span className="lp-demo-dot" />
        <b>{t('lp.demo.head')}</b>
        <span className="lp-demo-eq">
          <i /><i /><i /><i />
        </span>
      </div>
      <div className="lp-demo-line">Do you really think Andy is gonna take you?</div>
      <div className="lp-demo-chips">
        <span className="lp-demo-words">
          {WORDS.map((x, i) => (
            <span key={x.w} className={'lp-dw ' + x.s} style={{ '--d': `${120 + i * 70}ms` } as CSSProperties}>
              <i className="lp-dw-mark">{MARK[x.s]}</i>
              <b>{x.w}</b>
              <em>/{x.ipa}/</em>
            </span>
          ))}
        </span>
        <span className="lp-demo-ring">
          <svg viewBox="0 0 70 70">
            <circle cx="35" cy="35" r={R} className="bg" />
            <circle cx="35" cy="35" r={R} className="fg"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (on ? SCORE : 0) / 100)} />
          </svg>
          <b>{score}</b>
        </span>
      </div>
      <ul className="lp-demo-issues">
        {ISSUES.map((it, i) => (
          <li key={it.a} style={{ '--d': `${880 + i * 140}ms` } as CSSProperties}>
            <span>{it.a} <em>/{it.ai}/</em></span>
            <Icon name="arrow-right" size={12} />
            <span className="miss">{it.b} <em>/{it.bi}/</em></span>
            <b>{t('sh.kind.' + it.k)}</b>
          </li>
        ))}
      </ul>
      <p className="lp-demo-cap">{t('lp.demo.cap')}</p>
    </div>
  )
}
