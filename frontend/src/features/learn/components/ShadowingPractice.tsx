import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useVoiceClip } from '@/hooks/useVoiceClip'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { usePhonetics } from '@/hooks/usePhonetics'
import { scoreBand } from '@/core/utils/pronounce'
import { splitWords } from '@/core/utils/speechDiff'
import {
  EMPTY_GRADE, devLabel, gradeSpeech, issueNotes, missedWords, topFixes,
  type SpeechGrade, type WordGrade,
} from '@/core/utils/pronGrade'
import { fetchPronounceFeedback, type PronounceFeedback } from '@/core/api/pronounce.api'
import { addCard } from '@/core/api/srs.api'
import { useSkillLog } from '@/core/skills'
import { useMissBook } from '@/core/missBook'
import { useLessonProgress, lessonStat } from '@/core/lessonProgress'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { playRange, refDuration, segEnd } from '../segments'
import ProsodyCard from './ProsodyCard'
import TranscriptRail from './TranscriptRail'
import type { Lesson } from '@/models/lesson.model'

const REWARD = 5
const RATES = [0.5, 0.75, 1, 1.25]
const PASS = 65
const AUTOPAUSE_KEY = 'vyling.sh.autoPause'
const RATE_KEY = 'vyling.sh.rate'

type Mode = 'repeat' | 'overlay'

function loadFlag(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === '1'
  } catch { return fallback }
}

function loadRate(): number {
  try { return Number(localStorage.getItem(RATE_KEY)) || 1 } catch { return 1 }
}

export default function ShadowingPractice({ lesson }: { lesson: Lesson }) {
  const { recordEvent, learnLang, nativeLang, t } = useAppStore()
  const cfg = studyLang(learnLang)
  const segs = lesson.segments
  const [i, setI] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
  const [alts, setAlts] = useState<string[]>([])
  const [openWord, setOpenWord] = useState(-1)
  const [ai, setAi] = useState<PronounceFeedback | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())
  const [dropped, setDropped] = useState(false)
  const sr = useSpeechRecognition(cfg.locale)
  const skills = useSkillLog()
  const missBook = useMissBook()
  const prog = useLessonProgress()

  const [mode, setMode] = useState<Mode>('repeat')
  const [rate, setRate] = useState(loadRate)
  const [autoPause, setAutoPause] = useState(() => loadFlag(AUTOPAUSE_KEY, true))
  const [playing, setPlaying] = useState(false)
  const [panel, setPanel] = useState<'' | 'gear' | 'keys'>('')
  const [myClip, setMyClip] = useState('')
  const [saved, setSaved] = useState(0)
  const [saveErr, setSaveErr] = useState('')
  const clip = useVoiceClip()
  const yt = useYouTubePlayer('shadow-player')
  const cancelPlay = useRef<(() => void) | null>(null)
  const myAudio = useRef<HTMLAudioElement | null>(null)
  const tick = useRef<number | null>(null)
  const spoke = useRef(false)

  const cur = segs[i]
  const lines = useMemo(() => segs.map((s) => s.ko), [segs])
  const ph = usePhonetics(learnLang, lines)

  const targetWords = useMemo(() => splitWords(cur.ko, learnLang), [cur.ko, learnLang])

  const grade = useMemo<SpeechGrade>(() => {
    if (score === null || !heard.trim()) return EMPTY_GRADE
    void ph.version
    return gradeSpeech(
      { lang: learnLang, phones: ph.phones, read: ph.read },
      { target: cur.ko, heard, alternatives: alts },
    )
  }, [score, heard, alts, cur.ko, learnLang, ph.phones, ph.read, ph.version])

  const fixes = useMemo(() => topFixes(grade), [grade])

  const speak = (text: string, r = 0.9) => speakLang(text, cfg.locale, r)

  useEffect(() => { yt.load(lesson.id) }, [lesson.id])

  const stopTick = () => {
    if (tick.current) { window.clearInterval(tick.current); tick.current = null }
  }

  const stopOriginal = useCallback(() => {
    cancelPlay.current?.()
    cancelPlay.current = null
    stopTick()
    yt.pause()
    setPlaying(false)
  }, [yt])

  const indexAt = useCallback((time: number) => {
    for (let k = segs.length - 1; k >= 0; k--) if (time >= segs[k].start) return k
    return 0
  }, [segs])

  const startTick = useCallback((from: number) => {
    stopTick()
    let entered = false
    let cursor = from
    tick.current = window.setInterval(() => {
      const now = yt.getTime()
      if (now == null) return
      if (!entered) {
        if (now >= segs[from].start - 0.4) entered = true
        return
      }
      if (autoPause) {
        if (now >= segEnd(segs, from) - 0.06) stopOriginal()
        return
      }
      const at = indexAt(now)
      if (at !== cursor) {
        cursor = at
        setI(at)
        resetAttempt()
      }
    }, 120)
  }, [yt, segs, autoPause, indexAt, stopOriginal])

  const playFrom = useCallback((idx: number) => {
    stopOriginal()
    setPlaying(true)
    yt.setRate(rate)
    yt.seek(segs[idx].start)
    startTick(idx)
  }, [yt, rate, segs, startTick, stopOriginal])

  const togglePlay = () => {
    if (playing) stopOriginal()
    else playFrom(i)
  }

  const stopMine = () => { myAudio.current?.pause(); myAudio.current = null }

  const playMine = () => {
    if (!myClip) return
    stopMine()
    const el = new Audio(myClip)
    myAudio.current = el
    el.play().catch(() => { })
  }

  const resetAttempt = () => {
    setScore(null); setHeard(''); setAlts([]); setOpenWord(-1)
    setAi(null); setAiError(''); sr.reset()
    setMyClip(''); setSaved(0); setSaveErr(''); setDropped(false)
  }

  const go = useCallback((idx: number) => {
    if (idx < 0 || idx >= segs.length) return
    stopOriginal(); stopMine()
    if (clip.recording) clip.cancel()
    setI(idx); resetAttempt()
  }, [segs.length, stopOriginal, clip])

  useEffect(() => () => { stopOriginal(); stopMine() }, [])

  useEffect(() => {
    try { localStorage.setItem(AUTOPAUSE_KEY, autoPause ? '1' : '0') } catch {  }
  }, [autoPause])

  useEffect(() => {
    try { localStorage.setItem(RATE_KEY, String(rate)) } catch {  }
  }, [rate])

  const record = () => {
    if (sr.listening) { sr.stop(); return }
    stopOriginal()
    setScore(null); setAlts([]); setOpenWord(-1)
    setAi(null); setAiError(''); setMyClip('')
    sr.start()
    if (clip.supported && !clip.recording) clip.start((data) => setMyClip(data))
  }

  const shadowOver = () => {
    if (clip.recording) { clip.stop(); stopOriginal(); return }
    setMyClip(''); setSaveErr('')
    clip.start((data) => { setMyClip(data); stopOriginal() })
    setPlaying(true)
    cancelPlay.current = playRange(yt, cur.start, segEnd(segs, i), { times: 1, rate, onEnd: stopOriginal })
  }

  const applyResult = useCallback(async (said: string, heardAlts: string[]) => {
    await ph.ensure(splitWords([said, ...heardAlts].join(' '), learnLang))
    const g = gradeSpeech(
      { lang: learnLang, phones: ph.phones, read: ph.read },
      { target: cur.ko, heard: said, alternatives: heardAlts },
    )
    setHeard(said)
    setAlts(heardAlts)
    setScore(g.score)
    skills.record('speak', g.score)
    prog.record('speak', lesson.id, i, g.score, segs.length, lesson.title)
    const bad = missedWords(g)
    if (bad.length) {
      missBook.add(bad.map((w) => ({ w, ctx: cur.ko, vi: cur.vi || '', lang: learnLang, k: 'speak' as const })))
    }
    if (g.score >= PASS && !rewarded.has(i)) {
      recordEvent('pronounce', 1)
      setRewarded((r) => new Set(r).add(i))
    }
  }, [learnLang, ph, skills, prog, lesson.id, lesson.title, i, segs.length, missBook, cur.ko, cur.vi, rewarded, recordEvent])

  const discardAttempt = () => {
    if (score === null) return
    skills.undo('speak', score)
    prog.drop('speak', lesson.id, i)
    missBook.undo(
      missedWords(grade).map((w) => ({ w, lang: learnLang, k: 'speak' as const })),
    )
    setDropped(true)
    setScore(null); setHeard(''); setAlts([]); setOpenWord(-1)
    setAi(null); setAiError(''); sr.reset()
  }

  useEffect(() => {
    if (sr.listening || score !== null) return
    const said = sr.transcript.trim()
    if (said) void applyResult(said, sr.alternatives)
  }, [sr.listening, sr.transcript])

  useEffect(() => {
    if (mode === 'repeat' || !sr.listening) return
    sr.stop()
  }, [mode, sr.listening])

  useEffect(() => {
    if (mode !== 'repeat') return
    if (sr.listening) { spoke.current = true; return }
    if (spoke.current && clip.recording) {
      spoke.current = false
      clip.stop()
    }
  }, [mode, sr.listening, clip.recording, clip.stop])

  const askAI = async () => {
    if (score === null) return
    setAiLoading(true); setAiError(''); setAi(null)
    try {
      const fb = await fetchPronounceFeedback({
        target: cur.ko,
        heard,
        score: grade.score,
        vi: cur.vi || '',
        lang: learnLang,
        native: nativeLang,
        issues: issueNotes(learnLang, grade),
        weakWords: missedWords(grade),
      })
      setAi(fb)
    } catch (e) {
      setAiError((e as Error).message)
    } finally {
      setAiLoading(false)
    }
  }

  const shown = score === null ? null : grade.score
  const hardErrors = grade.words.filter(
    (w) => (w.state === 'wrong' || w.state === 'missing') && !w.unsure,
  ).length
  const band = shown === null
    ? null
    : scoreBand(hardErrors >= 2 ? Math.min(shown, 60) : hardErrors === 1 ? Math.min(shown, 80) : shown)
  const missed = useMemo(() => missedWords(grade), [grade])
  const scores = prog.scoresOf('speak', lesson.id)
  const stat = lessonStat(scores, segs.length, PASS)

  const saveMissed = async () => {
    if (!missed.length) return
    setSaveErr('')
    try {
      const back = cur.vi ? `${cur.ko} — ${cur.vi}` : cur.ko
      for (const word of missed) await addCard({ front: word, back, source: 'shadowing' })
      setSaved(missed.length)
    } catch (e) {
      setSaveErr((e as Error).message)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (el?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === ' ') { e.preventDefault(); togglePlay() }
      else if (k === 'r') { e.preventDefault(); record() }
      else if (k === 'arrowleft') { e.preventDefault(); go(i - 1) }
      else if (k === 'arrowright') { e.preventDefault(); go(i + 1) }
      else if (k === 'l') { e.preventDefault(); playFrom(i) }
      else if (k === 'escape') setPanel('')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const chipTone = (s: WordGrade['state']) =>
    s === 'ok' ? 'ok' : s === 'near' ? 'near' : s === 'missing' ? 'gone' : 'bad'

  const chipMark = (s: WordGrade['state']) =>
    s === 'ok' ? '✓' : s === 'near' ? '~' : s === 'missing' ? '–' : '✕'

  const lab = (tok: string) => devLabel(learnLang, tok)

  const devText = (w: WordGrade) => w.devs
    .map((d) => d.state === 'miss'
      ? t('sh.dev.miss', { a: lab(d.want) })
      : d.state === 'extra'
        ? t('sh.dev.extra', { a: lab(d.got) })
        : t('sh.dev.sub', { a: lab(d.want), b: lab(d.got) }))
    .join(' · ')

  const cellsOf = (w: WordGrade) => (
    <span className="sh2-cells">
      {w.cells.map((c, k) => {
        if (c.state === 'ok') return <i key={k} className="vl-pc ok">{lab(c.want)}</i>
        if (c.state === 'miss') return <i key={k} className="vl-pc miss">{lab(c.want)}</i>
        if (c.state === 'extra') return <i key={k} className="vl-pc extra">+{lab(c.got)}</i>
        return <i key={k} className="vl-pc sub">{lab(c.want)}<b>{lab(c.got)}</b></i>
      })}
    </span>
  )

  return (
    <div className="shadow2">
      <div className="sh2-main">
        <div className="sh2-stage">
          <div className="player-wrap"><div id="shadow-player" /></div>
          <div className="sh2-cap" aria-hidden="true">
            {cur.vi && <div className="sh2-cap-vi">{cur.vi}</div>}
            <div className="sh2-cap-ko" lang={learnLang}>{cur.ko}</div>
          </div>
        </div>

        <div className="sh2-optrow">
          <button
            type="button"
            className={'sh2-switch' + (autoPause ? ' on' : '')}
            role="switch"
            aria-checked={autoPause}
            onClick={() => setAutoPause((v) => !v)}
            title={t('sh.autoPauseTip')}
          >
            <span className="sh2-knob" />
            <span>{t('sh.autoPause')}</span>
          </button>
          <span className="sh2-linecount">{t('sh.line', { a: i + 1, b: segs.length })}</span>
          <span className="sh2-passed"><Icon name="check-circle" size={14} /> {t('sh.passed', { n: stat.passed })}</span>
        </div>

        <div className="sh2-transport">
          <button className="sh2-tbtn" disabled={i === 0} onClick={() => go(i - 1)} title={t('sh.prevLine')} aria-label={t('sh.prevLine')}>
            <Icon name="chevron-left" size={18} />
          </button>
          <button className="sh2-tbtn" onClick={() => playFrom(i)} title={t('sh.replayLine')} aria-label={t('sh.replayLine')}>
            <Icon name="refresh" size={18} />
          </button>
          <button className={'sh2-tbtn play' + (playing ? ' on' : '')} onClick={togglePlay} title={playing ? t('sh.pauseLine') : t('sh.playLine')} aria-label={playing ? t('sh.pauseLine') : t('sh.playLine')}>
            <Icon name={playing ? 'pause' : 'play'} size={18} />
          </button>
          <button className="sh2-tbtn" disabled={i === segs.length - 1} onClick={() => go(i + 1)} title={t('sh.nextLine')} aria-label={t('sh.nextLine')}>
            <Icon name="arrow-right" size={18} />
          </button>

          <div className="sh2-tools">
            <div className="sh2-pop-wrap">
              <button className="sh2-tool" onClick={() => setPanel(panel === 'gear' ? '' : 'gear')} aria-expanded={panel === 'gear'}>
                <Icon name="flame" size={14} /> {rate}×
              </button>
              {panel === 'gear' && (
                <div className="sh2-pop">
                  <div className="sh2-pop-h">{t('sh.speed')}</div>
                  <div className="sh2-pop-chips">
                    {RATES.map((r) => (
                      <button key={r} className={'sh2-chip' + (rate === r ? ' on' : '')} onClick={() => { setRate(r); yt.setRate(r) }}>{r}×</button>
                    ))}
                  </div>
                  <div className="sh2-pop-h">{t('sh.modeHead')}</div>
                  <div className="sh2-pop-chips">
                    <button className={'sh2-chip' + (mode === 'repeat' ? ' on' : '')} onClick={() => setMode('repeat')}>{t('sh.modeRepeat')}</button>
                    <button className={'sh2-chip' + (mode === 'overlay' ? ' on' : '')} onClick={() => setMode('overlay')}>{t('sh.modeOverlay')}</button>
                  </div>
                  <p className="sh2-pop-hint">{t(mode === 'repeat' ? 'sh.modeRepeatHint' : 'sh.modeOverlayHint')}</p>
                  <div className="sh2-pop-h">{t('sh.ttsGroup')}</div>
                  <div className="sh2-pop-chips">
                    <button className="sh2-chip" onClick={() => speak(cur.ko, 0.9)}><Icon name="volume" size={13} /> {t('sh.listen')}</button>
                    <button className="sh2-chip" onClick={() => speak(cur.ko, 0.6)}><Icon name="volume" size={13} /> {t('sh.slow')}</button>
                  </div>
                </div>
              )}
            </div>
            <div className="sh2-pop-wrap">
              <button className="sh2-tool" onClick={() => setPanel(panel === 'keys' ? '' : 'keys')} aria-expanded={panel === 'keys'} title={t('sh.keys')}>
                <Icon name="bulb" size={14} />
              </button>
              {panel === 'keys' && (
                <div className="sh2-pop wide">
                  <div className="sh2-pop-h">{t('sh.keys')}</div>
                  <ul className="sh2-keys">
                    <li><kbd>Space</kbd> {t('sh.keyPlay')}</li>
                    <li><kbd>R</kbd> {t('sh.keyRec')}</li>
                    <li><kbd>L</kbd> {t('sh.keyReplay')}</li>
                    <li><kbd>←</kbd> <kbd>→</kbd> {t('sh.keyMove')}</li>
                  </ul>
                  <div className="sh2-pop-h">{t('sh.howHead')}</div>
                  <ol className="sh2-how">
                    {[1, 2, 3, 4].map((n) => <li key={n}><b>{t(`sh.step${n}`)}</b> — {t(`sh.step${n}d`)}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sh2-words" lang={learnLang}>
          {targetWords.map((w, k) => (
            <span key={k} className="sh2-word">
              <b>{w}</b>
              {ph.read(w) && <i>/{ph.read(w)}/</i>}
            </span>
          ))}
        </div>

        {mode === 'repeat' ? (
          sr.supported ? (
            <>
              <div className="sh2-actions">
                <button className="sh2-act ghost" disabled={!myClip} onClick={playMine}>
                  <Icon name="play" size={15} /> {t('sh.replayMine')}
                </button>
                <button className={'sh2-act rec' + (sr.listening ? ' on' : '')} onClick={record}>
                  <Icon name="mic" size={17} /> {sr.listening ? t('sh.recording') : t('sh.recordBtn')}
                </button>
                <button className="sh2-act skip" disabled={i === segs.length - 1} onClick={() => go(i + 1)}>
                  <Icon name="arrow-right" size={15} /> {t('sh.skipLine')}
                </button>
              </div>
              {(sr.listening || sr.interim) && <div className="sh2-interim" lang={learnLang}>{sr.interim || '…'}</div>}
              {sr.error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {sr.error}</div>}
              {dropped && <div className="shadow-dropped"><Icon name="check-circle" size={14} /> {t('sh.misheardOk')}</div>}
            </>
          ) : (
            <div className="shadow-err"><Icon name="x-circle" size={15} /> {t('sh.noSR')}</div>
          )
        ) : clip.supported ? (
          <div className="sh2-actions">
            <button className="sh2-act ghost" disabled={!myClip} onClick={playMine}>
              <Icon name="play" size={15} /> {t('sh.replayMine')}
            </button>
            <button className={'sh2-act rec' + (clip.recording ? ' on' : '')} onClick={shadowOver}>
              <Icon name="mic" size={17} /> {clip.recording ? t('sh.shadowStop', { s: clip.seconds }) : t('sh.shadowNow')}
            </button>
            <button className="sh2-act skip" disabled={i === segs.length - 1} onClick={() => go(i + 1)}>
              <Icon name="arrow-right" size={15} /> {t('sh.skipLine')}
            </button>
          </div>
        ) : (
          <div className="shadow-err"><Icon name="x-circle" size={15} /> {t('sh.noRec')}</div>
        )}

        {shown !== null && band && (
          <div className="sh2-result">
            <div className="sh2-chips">
              {grade.words.map((w, k) => {
                const face = w.heard || w.target
                return (
                  <span key={k} className={'sh2-chip-w ' + chipTone(w.state) + (w.unsure ? ' unsure' : '')}>
                    <span className="sh2-cw-mark">{chipMark(w.state)}</span>
                    <b>{face}</b>
                    {ph.read(face) && <i>/{ph.read(face)}/</i>}
                  </span>
                )
              })}
              <div className={'sh2-ring ' + band.tone}>
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" className="sh2-ring-bg" />
                  <circle cx="40" cy="40" r="34" className="sh2-ring-fg"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - shown / 100)} />
                </svg>
                <b>{shown}</b>
              </div>
            </div>

            {grade.words.some((w) => w.state !== 'ok') && (
              <ul className="sh2-issues">
                {grade.words.map((w, k) => {
                  if (w.state === 'ok') return null
                  const open = openWord === k
                  const detail = w.devs.length > 0
                  return (
                    <li key={k} className={'sh2-issue ' + chipTone(w.state)}>
                      <div className="sh2-ihead">
                        <span className="sh2-iw">
                          {w.target || '—'} {w.target && ph.read(w.target) && <em>/{ph.read(w.target)}/</em>}
                        </span>
                        <Icon name="arrow-right" size={13} />
                        <span className="sh2-iw bad">
                          {w.heard || '—'} {w.heard && ph.read(w.heard) && <em>/{ph.read(w.heard)}/</em>}
                        </span>
                        <span className="sh2-ikind">
                          {w.unsure ? t('sh.kind.unsure') : t('sh.kind.' + w.kind)}
                        </span>
                      </div>

                      {w.unsure ? (
                        <p className="sh2-idev">{t('sh.unsureNote')}</p>
                      ) : detail ? (
                        <>
                          {cellsOf(w)}
                          <p className="sh2-idev">{devText(w)}</p>
                        </>
                      ) : !w.known ? (
                        <p className="sh2-idev">{t('sh.noPhone')}</p>
                      ) : null}

                      {detail && !w.unsure && (
                        <>
                          <button className="sh2-imore" onClick={() => setOpenWord(open ? -1 : k)} aria-expanded={open}>
                            <Icon name={open ? 'chevron-left' : 'bulb'} size={13} />
                            {open ? t('sh.hideFix') : t('sh.showFix')}
                          </button>
                          {open && (
                            <div className="sh2-drill">
                              <button className="sh2-dw" onClick={() => speak(w.target, 0.6)}>
                                <Icon name="volume" size={12} /> {t('sh.slow')}
                              </button>
                              <button className="sh2-dw" disabled={!myClip} onClick={playMine}>
                                <Icon name="play" size={12} /> {t('sh.replayMine')}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {fixes.length > 0 && (
              <div className="sh2-fixes">
                <div className="sh2-fixh">{t('sh.fixHead')}</div>
                <ul>
                  {fixes.map(({ fix, words, count }) => fix && (
                    <li key={fix.key}>
                      <div className="sh2-fixtop">
                        <b>{fix.title}</b>
                        {words.length > 0 && <span className="sh2-ftag" lang={learnLang}>{t('sh.fixIn', { w: words.join(', ') })}</span>}
                        {count > 1 && <span className="sh2-ftag">{t('sh.fixTimes', { n: count })}</span>}
                      </div>
                      <p className="sh2-fwhy">{fix.why}</p>
                      <p className="sh2-fhow"><Icon name="target" size={13} /> {fix.how}</p>
                      {fix.drill.length > 0 && (
                        <div className="sh2-drill">
                          <span>{t('sh.drill')}</span>
                          {fix.drill.map((d) => (
                            <button key={d} className="sh2-dw" lang={learnLang} onClick={() => speak(d, 0.75)}>
                              <Icon name="volume" size={12} /> {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {grade.skipped.length > 0 && (
              <p className="sh2-idev">{t('sh.skipped', { w: grade.skipped.join(', ') })}</p>
            )}

            {mode === 'repeat' && myClip && (
              <ProsodyCard clip={myClip} refSec={refDuration(segs, i)} text={cur.ko} lang={learnLang} />
            )}

            <div className="sh2-legend">
              <span><i className="lg ok" /> {t('sh.legend.ok')}</span>
              <span><i className="lg near" /> {t('sh.legend.near')}</span>
              <span><i className="lg bad" /> {t('sh.legend.wrong')}</span>
              <span><i className="lg gone" /> {t('sh.legend.missing')}</span>
              <span className="sh2-band">{t(band.labelKey)}{shown >= PASS && rewarded.has(i) && <em>+{REWARD} XP</em>}</span>
            </div>

            <div className="sh2-resact">
              <button className="btn-ghost sm" onClick={resetAttempt}><Icon name="mic" size={14} /> {t('sh.retry')}</button>
              <button className="btn-ghost sm" onClick={discardAttempt} title={t('sh.misheardTip')}>
                <Icon name="x-circle" size={14} /> {t('sh.misheard')}
              </button>
              <button className="btn-primary sm" onClick={askAI} disabled={aiLoading}>
                <Icon name="sparkles" size={14} /> {aiLoading ? t('sh.aiScoring') : t('sh.aiBtn')}
              </button>
              {missed.length > 0 && (
                saved ? (
                  <span className="shadow-savedok"><Icon name="check-circle" size={14} /> {t('sh.saved', { n: saved })}</span>
                ) : (
                  <button className="btn-ghost sm" onClick={saveMissed}>
                    <Icon name="cards" size={14} /> {t('sh.saveMiss', { n: missed.length })}
                  </button>
                )
              )}
            </div>
            {saveErr && <div className="shadow-err"><Icon name="x-circle" size={14} /> {t('sh.saveFail', { msg: saveErr })}</div>}
            <p className="sh2-srnote"><Icon name="bulb" size={13} /> {t('sh.srNote')}</p>
          </div>
        )}

        {aiError && (
          <div className="shadow-aierr">
            <Icon name="x-circle" size={15} /> {t('sh.aiFail', { msg: aiError })}
            <span>{t('sh.aiFailTip')}</span>
          </div>
        )}

        {ai && (
          <div className="ai-feedback">
            <div className="ai-fb-head"><Icon name="vyling" size={18} /> {t('sh.aiHead')} {ai.model && <span className="ai-model">{ai.model}</span>}</div>
            <p className="ai-fb-text">{ai.feedback}</p>
            {ai.tips.length > 0 && (
              <ul className="ai-fb-tips">
                {ai.tips.map((tip, k) => <li key={k}><Icon name="check" size={14} /> {tip}</li>)}
              </ul>
            )}
            {ai.encouragement && <div className="ai-fb-enc">💪 {ai.encouragement}</div>}
          </div>
        )}
      </div>

      <TranscriptRail
        segs={segs}
        current={i}
        scores={scores}
        pass={PASS}
        masked={false}
        onJump={go}
        onReset={() => prog.reset('speak', lesson.id)}
        phonetic={ph.supported ? ph.line : undefined}
        side
      />
    </div>
  )
}
