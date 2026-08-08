import { useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { analyzeClip, type ProsodyReport } from '@/core/utils/prosody'
import { useAppStore } from '@/store/app.store'

type Tone = 'ok' | 'warn' | 'info'

interface Row {
  id: string
  label: string
  value: string
  note: string
  tone: Tone
}

const W = 320
const H = 76
const CLAMP = 9

function num(x: number, digits = 1): string {
  return x.toFixed(digits).replace('.', ',')
}

function contourPaths(r: ProsodyReport): string[] {
  const span = Math.max(0.3, r.speechSec)
  const out: string[] = []
  let cur = ''
  for (const p of r.points) {
    if (p.st == null) { if (cur) { out.push(cur); cur = '' } continue }
    const x = (p.t / span) * W
    const st = Math.max(-CLAMP, Math.min(CLAMP, p.st))
    const y = H / 2 - (st / CLAMP) * (H / 2 - 8)
    cur += (cur ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
  }
  if (cur) out.push(cur)
  return out.filter((p) => p.includes('L'))
}

export default function ProsodyCard({ clip, refSec, text, lang }: {
  clip: string
  refSec: number
  text: string
  lang: string
}) {
  const { t } = useAppStore()
  const [report, setReport] = useState<ProsodyReport | null>(null)
  const [state, setState] = useState<'idle' | 'busy' | 'fail'>('idle')

  useEffect(() => {
    if (!clip) { setReport(null); setState('idle'); return }
    let alive = true
    setState('busy'); setReport(null)
    analyzeClip(clip, refSec)
      .then((r) => {
        if (!alive) return
        if (r) { setReport(r); setState('idle') } else setState('fail')
      })
      .catch(() => { if (alive) setState('fail') })
    return () => { alive = false }
  }, [clip, refSec])

  const rows = useMemo<Row[]>(() => {
    if (!report) return []
    const isQuestion = /[?？]\s*$/.test(text.trim())
    const words = text.trim().split(/\s+/).length
    const longest = report.pauses.reduce((m, p) => Math.max(m, p.len), 0)

    const tempoTone: Tone = report.tempoRatio > 1.15 ? 'warn' : report.tempoRatio < 0.65 ? 'warn' : 'ok'
    const tempo: Row = {
      id: 'tempo',
      label: t('pr.tempo'),
      value: t('pr.tempoVal', { x: num(report.tempoRatio, 2) }),
      note: t(report.tempoRatio > 1.15 ? 'pr.tempo.slow' : report.tempoRatio < 0.65 ? 'pr.tempo.fast' : 'pr.tempo.ok'),
      tone: tempoTone,
    }

    const choppy = report.pauses.length > 0 && words <= 6 && longest >= 0.35
    const pause: Row = {
      id: 'pause',
      label: t('pr.pause'),
      value: report.pauses.length
        ? t('pr.pause.some', { n: report.pauses.length, s: num(longest, 1) })
        : t('pr.pause.none'),
      note: t(choppy ? 'pr.pause.warn' : report.pauses.length ? 'pr.pause.ok' : 'pr.pause.smooth'),
      tone: choppy ? 'warn' : 'ok',
    }

    const flat = report.rangeSt < 2.5
    const range: Row = {
      id: 'range',
      label: t('pr.range'),
      value: t('pr.range.val', { x: num(report.rangeSt, 1) }),
      note: t(flat ? 'pr.range.flat' : report.rangeSt > 9 ? 'pr.range.wide' : 'pr.range.ok'),
      tone: flat ? 'warn' : 'ok',
    }

    const dir = report.endSt > 1.2 ? 'up' : report.endSt < -1.2 ? 'down' : 'flat'
    const tonal = lang === 'zh'
    const endBad = !tonal && (isQuestion ? dir !== 'up' : dir === 'up')
    const end: Row = {
      id: 'end',
      label: t('pr.end'),
      value: t('pr.end.' + dir, { x: num(Math.abs(report.endSt), 1) }),
      note: tonal
        ? t('pr.end.tone')
        : endBad
          ? t(isQuestion ? 'pr.end.wantUp' : 'pr.end.wantDown')
          : t('pr.end.ok'),
      tone: tonal ? 'info' : endBad ? 'warn' : 'ok',
    }

    return [tempo, pause, range, end]
  }, [report, text, lang, t])

  if (state === 'busy') {
    return (
      <div className="pr-card busy">
        <span className="pr-dots"><i /><i /><i /></span> {t('pr.analyzing')}
      </div>
    )
  }
  if (state === 'fail') {
    return <div className="pr-card fail"><Icon name="x-circle" size={14} /> {t('pr.none')}</div>
  }
  if (!report) return null

  const span = Math.max(0.3, report.speechSec)

  return (
    <div className="pr-card">
      <div className="pr-head">
        <Icon name="chart" size={15} /> {t('pr.head')}
        <span className="pr-hz">{Math.round(report.medianHz)} Hz</span>
      </div>

      <div className="pr-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={t('pr.chart')}>
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} className="pr-mid" />
          {report.pauses.map((p, k) => (
            <rect key={k} className="pr-gap"
              x={(p.at / span) * W} y="4" width={Math.max(2, (p.len / span) * W)} height={H - 8} />
          ))}
          {contourPaths(report).map((dPath, k) => <path key={k} d={dPath} className="pr-line" />)}
        </svg>
        <span className="pr-axis top">+{CLAMP}</span>
        <span className="pr-axis bot">−{CLAMP}</span>
      </div>

      <ul className="pr-rows">
        {rows.map((r) => (
          <li key={r.id} className={'pr-row ' + r.tone}>
            <span className="pr-lbl">{r.label}</span>
            <b>{r.value}</b>
            <span className="pr-note">{r.note}</span>
          </li>
        ))}
      </ul>

      <p className="pr-foot"><Icon name="bulb" size={12} /> {t('pr.note')}</p>
    </div>
  )
}
