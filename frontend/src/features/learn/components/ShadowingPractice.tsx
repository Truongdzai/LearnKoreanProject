import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useVoiceClip } from '@/hooks/useVoiceClip'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { romanizeLine } from '@/core/utils/romanize'
import { pronunciationScore, markWords, scoreBand } from '@/core/utils/pronounce'
import { fetchPronounceFeedback, type PronounceFeedback } from '@/core/api/pronounce.api'
import { addCard } from '@/core/api/srs.api'
import { useSkillLog } from '@/core/skills'
import { useMissBook } from '@/core/missBook'
import { useLessonProgress, lessonStat } from '@/core/lessonProgress'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { playRange, segEnd } from '../segments'
import TranscriptRail from './TranscriptRail'
import type { Lesson } from '@/models/lesson.model'

const REWARD = 5
const RATES = [0.5, 0.75, 1]
const LOOPS = [1, 3, 5]
const PASS = 65

type Mode = 'repeat' | 'overlay'

export default function ShadowingPractice({ lesson }: { lesson: Lesson }) {
  const { recordEvent, learnLang, nativeLang, t } = useAppStore()
  const cfg = studyLang(learnLang)
  const segs = lesson.segments
  const [i, setI] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
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
  const [rate, setRate] = useState(1)
  const [loops, setLoops] = useState(1)
  const [origPlaying, setOrigPlaying] = useState(false)
  const [myClip, setMyClip] = useState('')
  const [saved, setSaved] = useState(0)
  const [saveErr, setSaveErr] = useState('')
  const clip = useVoiceClip()
  const yt = useYouTubePlayer('shadow-player')
  const cancelPlay = useRef<(() => void) | null>(null)
  const myAudio = useRef<HTMLAudioElement | null>(null)

  const cur = segs[i]
  const romaja = useMemo(() => (cfg.reading === 'romaja' ? romanizeLine(cur.ko) : ''), [cur.ko, cfg.reading === 'romaja'])

  const speak = (text: string, rate = 0.9) => speakLang(text, cfg.locale, rate)

  useEffect(() => { yt.load(lesson.id) }, [lesson.id])

  const stopOriginal = () => {
    cancelPlay.current?.()
    cancelPlay.current = null
    yt.pause()
    setOrigPlaying(false)
  }

  const playOriginal = (times = loops) => {
    if (origPlaying) { stopOriginal(); return }
    setOrigPlaying(true)
    cancelPlay.current = playRange(yt, cur.start, segEnd(segs, i), { times, rate, onEnd: stopOriginal })
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
    setScore(null); setHeard(''); setAi(null); setAiError(''); sr.reset()
    setMyClip(''); setSaved(0); setSaveErr(''); setDropped(false)
  }

  const go = (idx: number) => {
    if (idx < 0 || idx >= segs.length) return
    stopOriginal(); stopMine()
    if (clip.recording) clip.cancel()
    setI(idx); resetAttempt()
  }

  useEffect(() => () => { stopOriginal(); stopMine() }, [])

  const record = () => {
    if (sr.listening) { sr.stop(); return }
    setScore(null); setAi(null); setAiError(''); setMyClip('')
    sr.start()
    if (clip.supported && !clip.recording) clip.start((data) => setMyClip(data))
  }

  const shadowOver = () => {
    if (clip.recording) { clip.stop(); stopOriginal(); return }
    setMyClip(''); setSaveErr('')
    clip.start((data) => { setMyClip(data); stopOriginal() })
    playOriginal(1)
  }

  const applyResult = (said: string) => {
    const sc = pronunciationScore(cur.ko, said)
    setHeard(said)
    setScore(sc)
    skills.record('speak', sc)
    prog.record('speak', lesson.id, i, sc, segs.length, lesson.title)
    const bad = markWords(cur.ko, said).filter((m) => !m.ok).map((m) => m.word)
    if (bad.length) {
      missBook.add(bad.map((w) => ({ w, ctx: cur.ko, vi: cur.vi || '', lang: learnLang, k: 'speak' as const })))
    }
    if (sc >= PASS && !rewarded.has(i)) {
      recordEvent('pronounce', 1)
      setRewarded((r) => new Set(r).add(i))
    }
  }

  const discardAttempt = () => {
    if (score === null) return
    skills.undo('speak', score)
    prog.drop('speak', lesson.id, i)
    missBook.undo(
      markWords(cur.ko, heard).filter((m) => !m.ok)
        .map((m) => ({ w: m.word, lang: learnLang, k: 'speak' as const })),
    )
    setDropped(true)
    setScore(null); setHeard(''); setAi(null); setAiError(''); sr.reset()
  }

  useEffect(() => {
    if (sr.listening || score !== null) return
    const said = sr.transcript.trim()
    if (said) applyResult(said)
  }, [sr.listening, sr.transcript])

  useEffect(() => {
    if (mode === 'repeat' || !sr.listening) return
    sr.stop()
  }, [mode, sr.listening])

  const askAI = async () => {
    if (score === null) return
    setAiLoading(true); setAiError(''); setAi(null)
    try {
      const fb = await fetchPronounceFeedback({ target: cur.ko, heard, score, vi: cur.vi || '', lang: learnLang, native: nativeLang })
      setAi(fb)
    } catch (e) {
      setAiError((e as Error).message)
    } finally {
      setAiLoading(false)
    }
  }

  const band = score !== null ? scoreBand(score) : null
  const marks = score !== null ? markWords(cur.ko, heard) : []
  const missed = marks.filter((m) => !m.ok).map((m) => m.word)
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

  return (
    <div className="shadow">
      <div className="shadow-steps">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="shadow-step">
            <span className="shadow-step-n">{n}</span>
            <div>
              <b>{t(`sh.step${n}`)}</b>
              <small>{t(`sh.step${n}d`)}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="shadow-bar">
        <button className="btn-ghost sm" disabled={i === 0} onClick={() => go(i - 1)}><Icon name="chevron-left" size={15} /> {t('sh.prev')}</button>
        <div className="shadow-prog">
          <span>{t('sh.line', { a: i + 1, b: segs.length })}</span>
          <div className="tp-bar"><span style={{ width: ((i + 1) / segs.length) * 100 + '%' }} /></div>
          <span className="shadow-passed"><Icon name="check-circle" size={14} /> {t('sh.passed', { n: stat.passed })}</span>
        </div>
        <button className="btn-ghost sm" disabled={i === segs.length - 1} onClick={() => go(i + 1)}>{t('sh.next')} <Icon name="arrow-right" size={15} /></button>
      </div>

      <div className="shadow-stage">
        <div className="shadow-source">
          <div className="shadow-src-head"><Icon name="film" size={15} /> {t('sh.origHead')}</div>
          <div className="player-wrap"><div id="shadow-player" /></div>

          <div className="shadow-ctrls">
            <button className={'btn-primary sm' + (origPlaying ? ' on' : '')} onClick={() => playOriginal()}>
              <Icon name={origPlaying ? 'pause' : 'volume'} size={15} /> {origPlaying ? t('sh.stopOrig') : t('sh.playOrig')}
            </button>
            <div className="shadow-chipgroup">
              <span>{t('sh.speed')}</span>
              {RATES.map((r) => (
                <button key={r} className={'shadow-chip' + (rate === r ? ' on' : '')} onClick={() => { setRate(r); yt.setRate(r) }}>
                  {r}×
                </button>
              ))}
            </div>
            <div className="shadow-chipgroup">
              <span>{t('sh.loops')}</span>
              {LOOPS.map((n) => (
                <button key={n} className={'shadow-chip' + (loops === n ? ' on' : '')} onClick={() => setLoops(n)}>
                  {t('sh.loopN', { n })}
                </button>
              ))}
            </div>
          </div>

          <div className="shadow-tts">
            <span>{t('sh.ttsGroup')}</span>
            <button className="btn-ghost sm" onClick={() => speak(cur.ko, 0.9)}><Icon name="volume" size={14} /> {t('sh.listen')}</button>
            <button className="btn-ghost sm" onClick={() => speak(cur.ko, 0.6)}><Icon name="volume" size={14} /> {t('sh.slow')}</button>
          </div>
        </div>

        <div className="shadow-card">
          <div className="shadow-modes">
            <button className={'shadow-mode' + (mode === 'repeat' ? ' on' : '')} onClick={() => setMode('repeat')}>
              <Icon name="mic" size={14} /> {t('sh.modeRepeat')}
            </button>
            <button className={'shadow-mode' + (mode === 'overlay' ? ' on' : '')} onClick={() => setMode('overlay')}>
              <Icon name="headphones" size={14} /> {t('sh.modeOverlay')}
            </button>
          </div>
          <p className="shadow-modehint">{t(mode === 'repeat' ? 'sh.modeRepeatHint' : 'sh.modeOverlayHint')}</p>

          <div className="shadow-ko" lang={learnLang}>
            {marks.length
              ? marks.map((m, k) => <span key={k} className={'sw ' + (m.ok ? 'ok' : 'miss')}>{m.word} </span>)
              : cur.ko}
          </div>
          {romaja && <div className="shadow-romaja">{romaja}</div>}
          {cur.vi && <div className="shadow-vi">{cur.vi}</div>}

          {mode === 'repeat' ? (
            sr.supported ? (
              <>
                <button className={'mic-btn' + (sr.listening ? ' on' : '')} onClick={record}>
                  <Icon name="mic" size={26} />
                  <span>{sr.listening ? t('sh.micStop') : t('sh.micStart')}</span>
                </button>
                {(sr.listening || sr.interim) && <div className="shadow-interim" lang={learnLang}>{sr.interim || '…'}</div>}
                {sr.error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {sr.error}</div>}
                {dropped && <div className="shadow-dropped"><Icon name="check-circle" size={14} /> {t('sh.misheardOk')}</div>}
                <p className="shadow-srnote"><Icon name="bulb" size={13} /> {t('sh.srNote')}</p>
              </>
            ) : (
              <div className="shadow-err"><Icon name="x-circle" size={15} /> {t('sh.noSR')}</div>
            )
          ) : clip.supported ? (
            <>
              <button className={'mic-btn' + (clip.recording ? ' on' : '')} onClick={shadowOver}>
                <Icon name="mic" size={26} />
                <span>{clip.recording ? t('sh.shadowStop', { s: clip.seconds }) : t('sh.shadowNow')}</span>
              </button>
              <div className="shadow-headnote"><Icon name="headphones" size={14} /> {t('sh.tipHeadphone')}</div>
            </>
          ) : (
            <div className="shadow-err"><Icon name="x-circle" size={15} /> {t('sh.noRec')}</div>
          )}

          {myClip && (
            <div className="shadow-compare">
              <span className="shadow-cmp-label">{t('sh.compare')}</span>
              <button className="btn-ghost sm" onClick={() => playOriginal(1)}><Icon name="volume" size={14} /> {t('sh.playOrigShort')}</button>
              <button className="btn-ghost sm" onClick={playMine}><Icon name="play" size={14} /> {t('sh.playMine')}</button>
            </div>
          )}
        </div>
      </div>

      {score !== null && band && (
        <div className={'shadow-result ' + band.tone}>
          <div className="sr-score">
            <svg viewBox="0 0 80 80" className="sr-ring">
              <circle cx="40" cy="40" r="34" className="sr-ring-bg" />
              <circle cx="40" cy="40" r="34" className="sr-ring-fg"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)} />
            </svg>
            <b>{score}<small>%</small></b>
          </div>
          <div className="sr-body">
            <div className="sr-band">{t(band.labelKey)}{score >= 65 && rewarded.has(i) && <span className="sr-coin">+{REWARD} XP <Icon name="star" size={13} /></span>}</div>
            <div className="sr-heard"><span>{t('sh.youSaid')}</span> <em lang={learnLang}>{heard || t('sh.unclear')}</em></div>
            <div className="sr-actions">
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
          </div>
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

      <TranscriptRail
        segs={segs}
        current={i}
        scores={scores}
        pass={PASS}
        masked={false}
        onJump={go}
        onReset={() => prog.reset('speak', lesson.id)}
      />
    </div>
  )
}
