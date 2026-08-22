import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { diffWords, wordSlots } from '@/core/utils/diffWords'
import { scoreBand } from '@/core/utils/pronounce'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { addCard } from '@/core/api/srs.api'
import { useSkillLog } from '@/core/skills'
import { useMissBook } from '@/core/missBook'
import { useLessonProgress, lessonStat } from '@/core/lessonProgress'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { playRange, speakableSegments } from '../segments'
import TranscriptRail from './TranscriptRail'
import type { Lesson } from '@/models/lesson.model'

const REWARD = 2
const RATES = [0.5, 0.75, 1]
const LOOPS = [1, 2, 3]
const PASS = 70
const CHUNK_SIZE = 10
const LEVEL_KEY = 'vyling.dictlevel'

type Level = 'easy' | 'normal' | 'hard'
const LEVELS: Level[] = ['easy', 'normal', 'hard']

function slotMask(bare: string, level: Level): string {
  if (level === 'hard') return '•••'
  if (level === 'easy') return bare[0] + '*'.repeat(Math.max(0, bare.length - 1))
  return '*'.repeat(bare.length)
}

function readLevel(): Level {
  try {
    const v = localStorage.getItem(LEVEL_KEY)
    if (v === 'easy' || v === 'normal' || v === 'hard') return v
  } catch { }
  return 'normal'
}

export default function DictationPractice({ lesson }: { lesson: Lesson }) {
  const { recordEvent, learnLang, t, learnLangName } = useAppStore()
  const cfg = studyLang(learnLang)
  const segs = useMemo(() => speakableSegments(lesson.segments), [lesson.segments])
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [checked, setChecked] = useState(false)
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())

  const [rate, setRate] = useState(1)
  const [loops, setLoops] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [blur, setBlur] = useState(true)
  const [level, setLevel] = useState<Level>(readLevel)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [saved, setSaved] = useState(0)
  const [saveErr, setSaveErr] = useState('')

  const started = useRef(false)
  const cancelPlay = useRef<(() => void) | null>(null)
  const yt = useYouTubePlayer('dict-player')
  const skills = useSkillLog()
  const misses = useMissBook()
  const prog = useLessonProgress()

  const cur = segs[i]
  const scores = prog.scoresOf('listen', lesson.id)
  const stat = lessonStat(scores, segs.length, PASS)

  const slots = useMemo(() => wordSlots(cur.ko, learnLang), [cur.ko, learnLang])
  const chunks = useMemo(() => {
    if (slots.length <= CHUNK_SIZE + 4) return [slots.map((_, k) => k)]
    const count = Math.ceil(slots.length / CHUNK_SIZE)
    const per = Math.ceil(slots.length / count)
    const out: number[][] = []
    for (let c = 0; c < count; c++) out.push(slots.map((_, k) => k).slice(c * per, (c + 1) * per))
    return out.filter((g) => g.length)
  }, [slots])

  useEffect(() => { yt.load(lesson.id) }, [lesson.id])

  const stopSegment = () => {
    cancelPlay.current?.()
    cancelPlay.current = null
    yt.pause()
    setPlaying(false)
  }

  const playAt = (idx: number, times = loops) => {
    cancelPlay.current?.()
    started.current = true
    setPlaying(true)
    cancelPlay.current = playRange(yt, segs[idx].start, segs[idx].end, { times, rate, onEnd: stopSegment })
  }

  const playChunk = (c: number) => {
    cancelPlay.current?.()
    started.current = true
    setPlaying(true)
    const from = cur.start
    const to = cur.end
    const span = to - from
    const a = from + (span * c) / chunks.length
    const b = from + (span * (c + 1)) / chunks.length
    cancelPlay.current = playRange(yt, Math.max(0, a - 0.15), b + 0.1, { times: 1, rate, onEnd: stopSegment })
  }

  const togglePlay = () => {
    if (playing) stopSegment()
    else playAt(i)
  }

  useEffect(() => () => stopSegment(), [])

  const typedCount = useMemo(() => wordSlots(val, learnLang).length, [val, learnLang])
  const result = useMemo(
    () => (checked ? diffWords(cur.ko, val, learnLang) : null),
    [checked, cur.ko, val, learnLang],
  )
  const hintOk = result ? [...revealed].filter((k) => result.marks[k]?.kind === 'ok').length : 0
  const accuracy = result
    ? Math.max(0, Math.round((Math.max(0, result.correct - hintOk) / Math.max(1, result.total, typedCount)) * 100))
    : 0
  const band = result ? scoreBand(accuracy) : null
  const wrongWords = result
    ? result.marks.filter((m, k) => m.kind !== 'ok' || revealed.has(k)).map((m) => m.word)
    : []

  const check = () => {
    if (!val.trim()) return
    const r = diffWords(cur.ko, val, learnLang)
    const hinted = [...revealed].filter((k) => r.marks[k]?.kind === 'ok').length
    const acc = Math.max(0, Math.round((Math.max(0, r.correct - hinted) / Math.max(1, r.total, typedCount)) * 100))
    setChecked(true)
    skills.record('listen', acc)
    prog.record('listen', lesson.id, i, acc, segs.length, lesson.title)
    const bad = r.marks.filter((m, k) => m.kind !== 'ok' || revealed.has(k)).map((m) => m.word)
    if (bad.length) {
      misses.add(bad.map((w) => ({ w, ctx: cur.ko, vi: cur.vi || '', lang: learnLang, k: 'listen' as const })))
    }
    if (acc >= PASS && !rewarded.has(i)) {
      recordEvent('review', 1)
      setRewarded((s) => new Set(s).add(i))
    }
  }

  const go = (idx: number) => {
    if (idx < 0 || idx >= segs.length) return
    stopSegment()
    setI(idx); setVal(''); setChecked(false); setRevealed(new Set()); setSaved(0); setSaveErr('')
    if (started.current) window.setTimeout(() => playAt(idx), 250)
  }

  const pickLevel = (lv: Level) => {
    setLevel(lv)
    try { localStorage.setItem(LEVEL_KEY, lv) } catch { }
  }

  const reveal = (k: number) => {
    if (checked) return
    setRevealed((s) => new Set(s).add(k))
  }

  const saveMissed = async () => {
    if (!wrongWords.length) return
    setSaveErr('')
    try {
      const back = cur.vi ? `${cur.ko} — ${cur.vi}` : cur.ko
      for (const word of wrongWords) await addCard({ front: word, back, source: 'dictation' })
      setSaved(wrongWords.length)
    } catch (e) {
      setSaveErr((e as Error).message)
    }
  }

  return (
    <div className="dictation">
      <div className="shadow-bar">
        <button className="btn-ghost sm" disabled={i === 0} onClick={() => go(i - 1)}><Icon name="chevron-left" size={15} /> {t('sh.prev')}</button>
        <div className="shadow-prog">
          <span>{t('sh.line', { a: i + 1, b: segs.length })}</span>
          <div className="tp-bar"><span style={{ width: ((i + 1) / segs.length) * 100 + '%' }} /></div>
          <span className="shadow-passed"><Icon name="check-circle" size={14} /> {t('dict.correct', { n: stat.passed })}</span>
        </div>
        <button className="btn-ghost sm" disabled={i === segs.length - 1} onClick={() => go(i + 1)}>{t('sh.next')} <Icon name="arrow-right" size={15} /></button>
      </div>

      <div className="dict-stage">
        <div className="shadow-source">
          <div className="shadow-src-head">
            <span><Icon name="headphones" size={15} /> {t('dict.origHead')}</span>
            <button className="shadow-chip" onClick={() => setBlur((b) => !b)}>
              <Icon name={blur ? 'eye' : 'eye-off'} size={13} /> {t(blur ? 'dict.showPic' : 'dict.hidePic')}
            </button>
          </div>
          <div className={'player-wrap dict-player' + (blur ? ' veiled' : '')}><div id="dict-player" /></div>
          {blur && <p className="dict-blurnote">{t('dict.blurNote')}</p>}

          <div className="shadow-ctrls">
            <button className={'btn-primary sm' + (playing ? ' on' : '')} onClick={togglePlay}>
              <Icon name={playing ? 'pause' : 'volume'} size={15} /> {playing ? t('dict.stopSeg') : t('dict.playSeg')}
            </button>
            <div className="shadow-chipgroup">
              <span>{t('sh.speed')}</span>
              {RATES.map((r) => (
                <button key={r} className={'shadow-chip' + (rate === r ? ' on' : '')} onClick={() => { setRate(r); yt.setRate(r) }}>{r}×</button>
              ))}
            </div>
            <div className="shadow-chipgroup">
              <span>{t('sh.loops')}</span>
              {LOOPS.map((n) => (
                <button key={n} className={'shadow-chip' + (loops === n ? ' on' : '')} onClick={() => setLoops(n)}>{t('sh.loopN', { n })}</button>
              ))}
            </div>
          </div>

          {chunks.length > 1 && (
            <div className="dict-chunks">
              <span>{t('dict.chunkHead')}</span>
              {chunks.map((_, c) => (
                <button key={c} className="shadow-chip" onClick={() => playChunk(c)}>
                  <Icon name="play" size={12} /> {t('dict.chunk', { n: c + 1 })}
                </button>
              ))}
            </div>
          )}

          <div className="shadow-tts">
            <span>{t('dict.ttsGroup')}</span>
            <button className="btn-ghost sm" onClick={() => speakLang(cur.ko, cfg.locale, 0.85)}><Icon name="volume" size={14} /> {t('dict.listen')}</button>
            <button className="btn-ghost sm" onClick={() => speakLang(cur.ko, cfg.locale, 0.55)}><Icon name="volume" size={14} /> {t('sh.slow')}</button>
          </div>
        </div>

        <div className="dict-card">
          <div className="dict-label"><Icon name="headphones" size={15} /> {t('dict.label', { lang: learnLangName })}</div>

          <div className="dict-levels">
            <span className="dict-mini">{t('dict.levelHead')}</span>
            {LEVELS.map((lv) => (
              <button key={lv} className={'shadow-chip' + (level === lv ? ' on' : '')} onClick={() => pickLevel(lv)}>
                {t('dict.lv_' + lv)}
              </button>
            ))}
          </div>
          <p className="dict-levelhint">{t('dict.lvHint_' + level)}</p>

          {!checked ? (
            <>
              <div className="dict-slots">
                {chunks.map((group, c) => (
                  <span key={c} className="dict-slotgroup">
                    {chunks.length > 1 && (
                      <button className="dict-slotplay" onClick={() => playChunk(c)} title={t('dict.chunk', { n: c + 1 })}>
                        <Icon name="play" size={11} /> {c + 1}
                      </button>
                    )}
                    {group.map((k) => (
                      <button
                        key={k}
                        className={'dict-slot' + (revealed.has(k) ? ' shown' : '')}
                        onClick={() => reveal(k)}
                        lang={learnLang}
                      >
                        {revealed.has(k) ? slots[k].raw : slotMask(slots[k].bare, level)}
                      </button>
                    ))}
                  </span>
                ))}
              </div>
              <p className="dict-slotnote">
                {t('dict.slotNote')}
                {revealed.size > 0 && <b> {t('dict.hintUsed', { n: revealed.size })}</b>}
              </p>

              <textarea
                lang={learnLang}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check() } }}
                placeholder={t('dict.placeholder')} aria-label={t('dict.placeholder')}
                rows={3}
                autoFocus
              />
            </>
          ) : result && (
            <div className="dict-review">
              <div className="dict-yours">
                <span className="dict-mini">{t('dict.yours')}</span>
                <span lang={learnLang}>{val.trim() || t('dict.empty')}</span>
              </div>
              <div className="dict-correct">
                <span className="dict-mini">{t('dict.answer')}</span>
                <span lang={learnLang}>
                  {result.marks.map((m, k) => (
                    <span key={k} className={'sw ' + (revealed.has(k) ? 'hinted' : m.kind === 'ok' ? 'ok' : m.kind === 'wrong' ? 'wrong' : 'miss')}
                      title={m.typed ? t('dict.wrongAs', { w: m.typed }) : revealed.has(k) ? t('dict.wasHint') : ''}>
                      {m.word}{' '}
                    </span>
                  ))}
                </span>
              </div>
              {result.extra.length > 0 && (
                <div className="dict-extra"><span className="dict-mini">{t('dict.extra')}</span> <span lang={learnLang}>{result.extra.join(', ')}</span></div>
              )}
              {cur.vi && <div className="dict-vi">{cur.vi}</div>}
            </div>
          )}

          {result && band && (
            <div className={'dict-score ' + band.tone}>
              <b>{t(band.labelKey)}</b>
              <span className="dict-pct">{accuracy}%</span>
              <span className="dict-words">{t('dict.wordsOf', { a: result.correct, b: result.total })}</span>
              {hintOk > 0 && <span className="dict-words">{t('dict.hintPenalty', { n: hintOk })}</span>}
              {accuracy >= PASS && rewarded.has(i) && <span className="sr-coin">+{REWARD} XP <Icon name="star" size={13} /></span>}
            </div>
          )}

          <div className="dict-actions">
            {!checked ? (
              <button className="btn-primary" disabled={!val.trim()} onClick={check}><Icon name="check" size={16} /> {t('dict.check')}</button>
            ) : (
              <>
                <button className="btn-ghost sm" onClick={() => { setChecked(false); setVal(''); setRevealed(new Set()); setSaved(0) }}><Icon name="headphones" size={14} /> {t('dict.retype')}</button>
                {wrongWords.length > 0 && (
                  saved ? (
                    <span className="shadow-savedok"><Icon name="check-circle" size={14} /> {t('dict.saved', { n: saved })}</span>
                  ) : (
                    <button className="btn-ghost sm" onClick={saveMissed}><Icon name="cards" size={14} /> {t('dict.saveMiss', { n: wrongWords.length })}</button>
                  )
                )}
                {i < segs.length - 1 && <button className="btn-primary sm" onClick={() => go(i + 1)}>{t('dict.nextLine')} <Icon name="arrow-right" size={15} /></button>}
              </>
            )}
          </div>
          {saveErr && <div className="shadow-err"><Icon name="x-circle" size={14} /> {t('sh.saveFail', { msg: saveErr })}</div>}

          {stat.done > 0 && (
            <div className="dict-avg">
              <Icon name="chart" size={14} /> {t('dict.avg', { n: stat.avg, done: stat.done, total: segs.length })}
            </div>
          )}
        </div>
      </div>

      <TranscriptRail
        segs={segs}
        current={i}
        scores={scores}
        pass={PASS}
        masked
        onJump={go}
        onReset={() => prog.reset('listen', lesson.id)}
      />
    </div>
  )
}
