import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { useAsr } from '@/hooks/useAsr'
import { openMic } from '@/core/mic'
import { usePhonetics } from '@/hooks/usePhonetics'
import { romanizeLine } from '@/core/utils/romanize'
import { splitWords } from '@/core/utils/speechDiff'
import { devLabel, gradeSpeech } from '@/core/utils/pronGrade'
import { useAppStore } from '@/store/app.store'
import { takeTaste } from '@/core/taste'
import { track } from '@/core/monitor'
import { studyLang } from '@/core/constants/languages'
import { detectSpeakers, diarizeVoice } from '@/core/api/learn.api'
import { playRange, refDuration, segEnd } from '../segments'
import type { Lesson } from '@/models/lesson.model'

interface Clip {
  url: string
  duration: number
  delay: number | null
  rhythm: number
  delayScore: number | null
}

interface SoundStat {
  score: number
  notes: string[]
}

function rhythmScore(dur: number, ref: number): number {
  return Math.round(Math.max(0, 100 - Math.min(100, (Math.abs(dur - ref) / ref) * 120)))
}
function delayScore(delay: number): number {
  return Math.round(Math.max(0, 100 - Math.min(100, Math.max(0, delay - 0.3) * 110)))
}

const charLabel = (c: number) => String.fromCharCode(65 + c)

export default function DubbingStudio({ lesson }: { lesson: Lesson }) {
  const { recordEvent, user, setView, learnLang, t, learnLangName } = useAppStore()
  const cfg = studyLang(learnLang)
  const segs = lesson.segments
  const yt = useYouTubePlayer('dub-player')
  const samplePlay = useRef<(() => void) | null>(null)

  const playSample = (idx: number) => {
    samplePlay.current?.()
    if (yt.getTime() == null) {
      speakLang(segs[idx].ko, cfg.locale, 0.9)
      return
    }
    samplePlay.current = playRange(yt, segs[idx].start, segEnd(segs, idx), { times: 1, rate: 1 })
  }

  const lines = useMemo(() => segs.map((s) => s.ko), [segs])
  const ph = usePhonetics(learnLang, lines)
  const sr = useAsr(cfg.locale)
  const srIdx = useRef(-1)

  const [clips, setClips] = useState<Record<number, Clip>>({})
  const [sounds, setSounds] = useState<Record<number, SoundStat>>({})
  const [recording, setRecording] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())

  const [speakers, setSpeakers] = useState<number[]>([])
  const [names, setNames] = useState<string[]>([])
  const [roleChar, setRoleChar] = useState<number | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [voiceDetecting, setVoiceDetecting] = useState(false)
  const [autoDub, setAutoDub] = useState(true)

  const mrRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const onsetRef = useRef<number | null>(null)
  const playTimerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoStreamRef = useRef<MediaStream | null>(null)
  const autoMrRef = useRef<MediaRecorder | null>(null)
  const autoStartRef = useRef(0)

  useEffect(() => {
    yt.load(lesson.id)
    setTimeout(() => yt.mute(), 1200)
    setSpeakers(segs.map((s, i) => (typeof s.speaker === 'number' ? s.speaker : i % 2)))
    setRoleChar(null)
    return () => stopPlayback()
  }, [lesson.id])

  const spkOf = (idx: number) => speakers[idx] ?? idx % 2
  const nSpk = speakers.length ? Math.max(2, Math.max(...speakers) + 1) : 2
  const nameOf = (c: number) => names[c] || t('dub.char', { c: charLabel(c) })

  const allowPlus = (): boolean => {
    if (user.isPlus) return true
    if (takeTaste('dubbing')) {
      track('taste_used', { feature: 'dubbing' })
      setError(t('dub.tasteOnce'))
      return true
    }
    track('upgrade_click', { from: 'dubbing' })
    setView('pricing')
    return false
  }

  const detect = async () => {
    if (!allowPlus()) return
    setDetecting(true)
    setError('')
    try {
      const r = await detectSpeakers(lesson.id, segs.map((s) => ({ start: s.start, ko: s.ko })))
      if (r.speakers.length === segs.length) {
        setSpeakers(r.speakers)
        if (r.names?.length) setNames(r.names)
        if (r.source !== 'ai') {
          setError(t('dub.aiUnsure'))
        }
      } else {
        setError(t('dub.aiMismatch'))
      }
    } catch {
      setError(t('dub.aiFail'))
    } finally {
      setDetecting(false)
    }
  }

  const detectVoice = async () => {
    if (!allowPlus()) return
    setVoiceDetecting(true)
    setError('')
    try {
      const r = await diarizeVoice(lesson.id, segs.map((s) => s.start))
      if (r.speakers.length === segs.length) {
        setSpeakers(r.speakers)
        if (r.names?.length) setNames(r.names)
      } else {
        setError(t('dub.voiceMismatch'))
      }
    } catch (e) {
      setError((e as Error).message || t('dub.voiceFail'))
    } finally {
      setVoiceDetecting(false)
    }
  }

  const cycleSpeaker = (idx: number) => {
    setSpeakers((prev) => {
      const max = prev.length ? Math.max(...prev) : 1
      const total = Math.min(6, Math.max(2, max + 2))
      return prev.map((v, i) => (i === idx ? (v + 1) % total : v))
    })
  }

  const toggleMute = () => {
    if (muted) { yt.unMute(); setMuted(false) } else { yt.mute(); setMuted(true) }
  }

  const cleanupRec = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
  }

  const startRecord = async (idx: number) => {
    setError('')
    try {
      const stream = await openMic()
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mrRef.current = mr
      const chunks: BlobPart[] = []
      startRef.current = performance.now()
      onsetRef.current = null

      try {
        const ctx = new AudioContext()
        ctxRef.current = ctx
        const src = ctx.createMediaStreamSource(stream)
        const an = ctx.createAnalyser()
        an.fftSize = 512
        src.connect(an)
        const buf = new Uint8Array(an.fftSize)
        const tick = () => {
          an.getByteTimeDomainData(buf)
          let sum = 0
          for (let k = 0; k < buf.length; k++) { const v = (buf[k] - 128) / 128; sum += v * v }
          const rms = Math.sqrt(sum / buf.length)
          if (onsetRef.current === null && rms > 0.045) onsetRef.current = performance.now()
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch {}

      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      mr.onstop = () => {
        const stopT = performance.now()
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const dur = (stopT - startRef.current) / 1000
        const delay = onsetRef.current ? (onsetRef.current - startRef.current) / 1000 : null
        const ref = refDuration(segs, idx)
        const rh = rhythmScore(dur, ref)
        const ds = delay !== null ? delayScore(delay) : null
        setClips((c) => ({ ...c, [idx]: { url, duration: dur, delay, rhythm: rh, delayScore: ds } }))
        const overall = ds !== null ? Math.round((rh + ds) / 2) : rh
        if (overall >= 65 && !rewarded.has(idx)) {
          recordEvent('pronounce', 1)
          setRewarded((r) => new Set(r).add(idx))
        }
        cleanupRec()
        setRecording(null)
      }
      mr.start()
      setRecording(idx)
      if (sr.supported) {
        setSounds((s) => { const next = { ...s }; delete next[idx]; return next })
        srIdx.current = idx
        sr.start()
      }
    } catch {
      setError(t('dub.micFail'))
      cleanupRec()
      setRecording(null)
    }
  }

  const stopRecord = () => {
    try { mrRef.current?.stop() } catch {}
    if (sr.listening) sr.stop()
  }

  useEffect(() => {
    if (sr.listening) return
    const idx = srIdx.current
    const said = sr.transcript.trim()
    if (idx < 0 || !said || !segs[idx]) return
    srIdx.current = -1
    const alts = sr.alternatives
    void (async () => {
      await ph.ensure(splitWords([said, ...alts].join(' '), learnLang))
      const g = gradeSpeech(
        { lang: learnLang, phones: ph.phones, read: ph.read },
        { target: segs[idx].ko, heard: said, alternatives: alts },
      )
      const notes = g.issues.slice(0, 2).map((d) => (
        d.state === 'miss'
          ? t('sh.dev.miss', { a: devLabel(learnLang, d.want) })
          : d.state === 'extra'
            ? t('sh.dev.extra', { a: devLabel(learnLang, d.got) })
            : t('sh.dev.sub', { a: devLabel(learnLang, d.want), b: devLabel(learnLang, d.got) })
      ))
      setSounds((s) => ({ ...s, [idx]: { score: g.score, notes } }))
      sr.reset()
    })()
  }, [sr.listening, sr.transcript])

  const playClip = (idx: number) => {
    const c = clips[idx]
    if (!c) return
    const a = new Audio(c.url)
    a.play().catch(() => {})
  }

  const startAutoRec = (idx: number) => {
    const stream = autoStreamRef.current
    if (!stream || autoMrRef.current) return
    try {
      const mr = new MediaRecorder(stream)
      autoMrRef.current = mr
      autoStartRef.current = performance.now()
      const chunks: BlobPart[] = []
      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      mr.onstop = () => {
        const dur = (performance.now() - autoStartRef.current) / 1000
        if (chunks.length) {
          const url = URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' }))
          const rh = rhythmScore(dur, refDuration(segs, idx))
          setClips((c) => ({ ...c, [idx]: { url, duration: dur, delay: null, rhythm: rh, delayScore: null } }))
          if (rh >= 65 && !rewarded.has(idx)) {
            recordEvent('pronounce', 1)
            setRewarded((r) => new Set(r).add(idx))
          }
        }
      }
      mr.start()
      setRecording(idx)
    } catch {}
  }

  const stopAutoRec = () => {
    try { autoMrRef.current?.stop() } catch {}
    autoMrRef.current = null
    setRecording(null)
  }

  const stopPlayback = () => {
    if (playTimerRef.current) clearInterval(playTimerRef.current)
    playTimerRef.current = null
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    stopAutoRec()
    autoStreamRef.current?.getTracks().forEach((t) => t.stop())
    autoStreamRef.current = null
    setPlaying(false)
  }

  const play = async () => {
    if (playing) { stopPlayback(); return }
    if (roleChar === null && Object.keys(clips).length === 0) return

    const autoDubActive = roleChar !== null && autoDub
    if (autoDubActive) {
      try {
        autoStreamRef.current = await openMic()
      } catch {
        setError(t('dub.micAutoFail'))
      }
    }

    yt.seek(segs[0].start)
    setPlaying(true)
    setMuted(true)
    const fired = new Set<number>()
    const last = segs.length - 1
    let curMute: boolean | null = null
    let curIdx = -2
    playTimerRef.current = window.setInterval(() => {
      const t = yt.getTime()
      if (t == null) return
      let idx = -1
      for (let i = 0; i < segs.length; i++) {
        if (segs[i].start - 0.15 <= t) idx = i
        else break
      }
      const isMine = roleChar === null ? true : idx >= 0 && spkOf(idx) === roleChar
      const shouldMute = roleChar === null ? true : isMine
      if (shouldMute !== curMute) { shouldMute ? yt.mute() : yt.unMute(); curMute = shouldMute }

      if (idx !== curIdx) {
        if (autoStreamRef.current) {
          stopAutoRec()
          if (idx >= 0 && isMine) startAutoRec(idx)
        }
        curIdx = idx
      }

      if (!autoDubActive && idx >= 0 && isMine && clips[idx] && !fired.has(idx) && t >= segs[idx].start - 0.12) {
        fired.add(idx)
        const a = new Audio(clips[idx].url)
        audioRef.current = a
        a.play().catch(() => {})
      }
      if (t > segs[last].start + refDuration(segs, last)) stopPlayback()
    }, 150)
  }

  const share = async () => {
    const text = t('dub.shareText', { title: lesson.title, lang: learnLangName })
    try {
      if (navigator.share) await navigator.share({ title: 'VyLing Dubbing', text })
      else { await navigator.clipboard.writeText(text); setError(''); alert(t('dub.copied')) }
    } catch {}
  }

  const doneCount = Object.keys(clips).length
  const avg = doneCount
    ? Math.round(
        Object.values(clips).reduce((a, c) => a + (c.delayScore !== null ? (c.rhythm + c.delayScore) / 2 : c.rhythm), 0) / doneCount,
      )
    : 0

  const myLines = roleChar === null ? segs.length : segs.filter((_, i) => spkOf(i) === roleChar).length

  return (
    <div className="dubbing">
      <div className="dub-intro">
        <div className="dub-intro-ic"><Icon name="mic" size={20} /></div>
        <div>
          <b>{t('dub.introTitle')}</b>
          <p>{t('dub.introText')}</p>
        </div>
      </div>

      <div className="dub-grid">
        <div className="dub-stage">
          <div className="player-wrap"><div id="dub-player" /></div>

          <div className="dub-roleplay">
            <div className="dub-rp-head">
              <span><Icon name="user" size={15} /> {t('dub.rpHead')}</span>
              {user.isPlus ? (
                <div className="dub-rp-detect">
                  <button className="btn-ghost sm" onClick={detectVoice} disabled={voiceDetecting || detecting} title={t('dub.byVoiceHint')}>
                    <Icon name="volume" size={13} /> {voiceDetecting ? t('dub.byVoiceBusy') : t('dub.byVoice')}
                  </button>
                  <button className="btn-ghost sm" onClick={detect} disabled={detecting || voiceDetecting} title={t('dub.byAIHint')}>
                    <Icon name="sparkles" size={13} /> {detecting ? t('dub.byAIBusy') : t('dub.byAI')}
                  </button>
                </div>
              ) : (
                <button className="btn-ghost sm dub-rp-plus" onClick={() => setView('pricing')} title={t('dub.plusDetectHint')}>
                  <Icon name="sparkles" size={13} /> {t('dub.plusDetect')}
                </button>
              )}
            </div>
            {voiceDetecting && <p className="dub-rp-note"><Icon name="bulb" size={13} /> {t('dub.voiceWait')}</p>}
            <div className="dub-rp-chips">
              <button className={'dub-rp-chip' + (roleChar === null ? ' on' : '')} onClick={() => { stopPlayback(); setRoleChar(null) }}>
                <Icon name="mic" size={13} /> {t('dub.allRoles', { n: nSpk })}
              </button>
              {Array.from({ length: nSpk }).map((_, c) => (
                <button key={c} className={'dub-rp-chip' + (roleChar === c ? ' on' : '')} onClick={() => { stopPlayback(); setRoleChar(c) }}>
                  <Icon name="user" size={13} /> {nameOf(c)}
                  <span className="dub-rp-count">{segs.filter((_, i) => spkOf(i) === c).length}</span>
                </button>
              ))}
            </div>
            {!user.isPlus && (
              <p className="dub-rp-note">
                <Icon name="bulb" size={13} /> {t('dub.freeNote')}
              </p>
            )}
            {roleChar !== null && (
              <>
                <p className="dub-rp-note">
                  <Icon name="mute" size={13} /> {t('dub.roleNote', { name: nameOf(roleChar), n: myLines })}
                </p>
                <label className="dub-rp-auto">
                  <input type="checkbox" checked={autoDub} onChange={(e) => setAutoDub(e.target.checked)} />
                  <span><Icon name="mic" size={13} /> {t('dub.autoRec')}</span>
                </label>
              </>
            )}
          </div>

          <div className="dub-controls">
            {roleChar === null && (
              <button className={'btn-ghost' + (muted ? ' on' : '')} onClick={toggleMute}>
                <Icon name={muted ? 'mute' : 'volume'} size={16} /> {muted ? t('dub.muted') : t('dub.unmuted')}
              </button>
            )}
            <button className="btn-primary" disabled={roleChar === null && doneCount === 0} onClick={play}>
              <Icon name={playing ? 'stop' : 'play'} size={16} /> {playing ? t('dub.stop') : roleChar === null ? t('dub.playDub') : autoDub ? t('dub.playRoleRec') : t('dub.playRole')}
            </button>
            <button className="btn-ghost" disabled={doneCount === 0} onClick={share}><Icon name="share" size={16} /> {t('dub.share')}</button>
          </div>
          {doneCount > 0 && (
            <div className="dub-summary">
              <span>{t('dub.summary', { a: doneCount, b: segs.length })}</span>
              <span className="dub-avg">{t('dub.avg')} <b>{avg}%</b></span>
            </div>
          )}
          {error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {error}</div>}
          {!error && sr.error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {sr.error}</div>}
          <div className="dub-note"><Icon name="bulb" size={14} /> {t('dub.tip')}</div>
        </div>

        <div className="dub-script">
          {segs.map((s, idx) => {
            const clip = clips[idx]
            const sound = sounds[idx]
            const isRec = recording === idx
            const ref = refDuration(segs, idx)
            const mine = roleChar === null || spkOf(idx) === roleChar
            return (
              <div key={idx} className={'dub-line' + (clip ? ' done' : '') + (isRec ? ' rec' : '') + (roleChar !== null && !mine ? ' partner' : '')}>
                <div className="dub-line-head">
                  <span className="dub-num">{idx + 1}</span>
                  <button className={'dub-spk c' + (spkOf(idx) % 6)} onClick={() => cycleSpeaker(idx)} title={t('dub.cycleTitle')}>
                    {charLabel(spkOf(idx))}
                  </button>
                  <span className="dub-ref">~{ref.toFixed(1)}s</span>
                  {clip && (
                    <span className="dub-scores">
                      <span title={t('dub.rhythm')}><Icon name="trending" size={12} /> {clip.rhythm}%</span>
                      {clip.delayScore !== null && <span title={t('dub.delay')}><Icon name="clock" size={12} /> {clip.delayScore}%</span>}
                      {sound && <span title={t('dub.sound')}><Icon name="mic" size={12} /> {sound.score}%</span>}
                    </span>
                  )}
                </div>
                <div className="dub-ko" lang={learnLang}>{s.ko}</div>
                {cfg.reading === 'romaja' && <div className="dub-romaja">{romanizeLine(s.ko)}</div>}
                {s.vi && <div className="dub-vi">{s.vi}</div>}
                {sound && sound.notes.length > 0 && (
                  <div className="dub-sound">
                    <Icon name="target" size={12} /> {t('dub.soundOff', { list: sound.notes.join(' · ') })}
                  </div>
                )}
                <div className="dub-line-actions">
                  <button className="btn-ghost sm" onClick={() => playSample(idx)}>
                    <Icon name="volume" size={14} /> {t('sh.listen')}
                  </button>
                  {isRec ? (
                    <button className="btn-rec on" onClick={stopRecord}><Icon name="stop" size={14} /> {t('dub.stopRec')}</button>
                  ) : (
                    <button className="btn-rec" disabled={recording !== null} onClick={() => startRecord(idx)}><Icon name="mic" size={14} /> {clip ? t('dub.reRec') : t('dub.rec')}</button>
                  )}
                  {clip && <button className="btn-ghost sm" onClick={() => playClip(idx)}><Icon name="play" size={13} /> {t('dub.replay')}</button>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
