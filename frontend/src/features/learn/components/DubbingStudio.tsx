import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { romanizeLine } from '@/core/utils/romanize'
import { useAppStore } from '@/store/app.store'
import type { Lesson } from '@/models/lesson.model'

interface Clip {
  url: string
  duration: number
  delay: number | null
  rhythm: number
  delayScore: number | null
}

const REWARD = 12

function refDuration(segs: Lesson['segments'], idx: number): number {
  const a = segs[idx].start
  const b = idx + 1 < segs.length ? segs[idx + 1].start : a + 3.5
  return Math.max(1.2, Math.min(8, b - a))
}

function rhythmScore(dur: number, ref: number): number {
  return Math.round(Math.max(0, 100 - Math.min(100, (Math.abs(dur - ref) / ref) * 120)))
}
function delayScore(delay: number): number {
  return Math.round(Math.max(0, 100 - Math.min(100, Math.max(0, delay - 0.3) * 110)))
}

export default function DubbingStudio({ lesson }: { lesson: Lesson }) {
  const { addCoins } = useAppStore()
  const segs = lesson.segments
  const yt = useYouTubePlayer('dub-player')

  const [clips, setClips] = useState<Record<number, Clip>>({})
  const [recording, setRecording] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())

  const mrRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const onsetRef = useRef<number | null>(null)
  const playTimerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    yt.load(lesson.id)
    setTimeout(() => yt.mute(), 1200)
    return () => stopPlayback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mrRef.current = mr
      const chunks: BlobPart[] = []
      startRef.current = performance.now()
      onsetRef.current = null

      // Detect speech onset for the "delay" metric.
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
      } catch { /* analyser optional */ }

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
          addCoins(REWARD)
          setRewarded((r) => new Set(r).add(idx))
        }
        cleanupRec()
        setRecording(null)
      }
      mr.start()
      setRecording(idx)
    } catch {
      setError('Không truy cập được micro. Hãy cho phép quyền micro trong trình duyệt.')
      cleanupRec()
      setRecording(null)
    }
  }

  const stopRecord = () => { try { mrRef.current?.stop() } catch { /* */ } }

  const playClip = (idx: number) => {
    const c = clips[idx]
    if (!c) return
    const a = new Audio(c.url)
    a.play().catch(() => {})
  }

  const stopPlayback = () => {
    if (playTimerRef.current) clearInterval(playTimerRef.current)
    playTimerRef.current = null
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPlaying(false)
  }

  // Play the muted video and trigger each recorded clip at its timestamp.
  const playDub = () => {
    if (playing) { stopPlayback(); return }
    if (Object.keys(clips).length === 0) return
    yt.mute(); setMuted(true)
    yt.seek(segs[0].start)
    setPlaying(true)
    const fired = new Set<number>()
    const last = segs.length - 1
    playTimerRef.current = window.setInterval(() => {
      const t = yt.getTime()
      if (t == null) return
      segs.forEach((s, idx) => {
        if (clips[idx] && !fired.has(idx) && t >= s.start - 0.15) {
          fired.add(idx)
          const a = new Audio(clips[idx].url)
          audioRef.current = a
          a.play().catch(() => {})
        }
      })
      if (t > segs[last].start + refDuration(segs, last)) stopPlayback()
    }, 200)
  }

  const share = async () => {
    const text = `Mình vừa lồng tiếng tiếng Hàn cho "${lesson.title}" trên VyLing! 🎬🇰🇷`
    try {
      if (navigator.share) await navigator.share({ title: 'VyLing Dubbing', text })
      else { await navigator.clipboard.writeText(text); setError(''); alert('Đã sao chép nội dung chia sẻ!') }
    } catch { /* cancelled */ }
  }

  const doneCount = Object.keys(clips).length
  const avg = doneCount
    ? Math.round(
        Object.values(clips).reduce((a, c) => a + (c.delayScore !== null ? (c.rhythm + c.delayScore) / 2 : c.rhythm), 0) / doneCount,
      )
    : 0

  return (
    <div className="dubbing">
      <div className="dub-intro">
        <div className="dub-intro-ic"><Icon name="mic" size={20} /></div>
        <div>
          <b>Dubbing Studio — Lồng tiếng nhập vai</b>
          <p>Tắt tiếng gốc và tự lồng tiếng cho từng câu. AI chấm <b>phát âm</b>, <b>nhịp điệu</b> và <b>độ trễ</b>, rồi ghép thành bản lồng tiếng của bạn.</p>
        </div>
      </div>

      <div className="dub-grid">
        <div className="dub-stage">
          <div className="player-wrap"><div id="dub-player" /></div>
          <div className="dub-controls">
            <button className={'btn-ghost' + (muted ? ' on' : '')} onClick={toggleMute}>
              <Icon name={muted ? 'mute' : 'volume'} size={16} /> {muted ? 'Đang tắt tiếng gốc' : 'Bật tiếng gốc'}
            </button>
            <button className="btn-primary" disabled={doneCount === 0} onClick={playDub}>
              <Icon name={playing ? 'stop' : 'play'} size={16} /> {playing ? 'Dừng' : 'Phát bản lồng tiếng'}
            </button>
            <button className="btn-ghost" disabled={doneCount === 0} onClick={share}><Icon name="share" size={16} /> Chia sẻ</button>
          </div>
          {doneCount > 0 && (
            <div className="dub-summary">
              <span>Đã lồng {doneCount}/{segs.length} câu</span>
              <span className="dub-avg">Điểm trung bình: <b>{avg}%</b></span>
            </div>
          )}
          {error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {error}</div>}
          <div className="dub-note"><Icon name="bulb" size={14} /> Mẹo: bấm “Nghe mẫu” để bắt nhịp, rồi thu sao cho độ dài khớp câu gốc — đó chính là điểm nhịp điệu.</div>
        </div>

        <div className="dub-script">
          {segs.map((s, idx) => {
            const clip = clips[idx]
            const isRec = recording === idx
            const ref = refDuration(segs, idx)
            return (
              <div key={idx} className={'dub-line' + (clip ? ' done' : '') + (isRec ? ' rec' : '')}>
                <div className="dub-line-head">
                  <span className="dub-num">{idx + 1}</span>
                  <span className="dub-ref">~{ref.toFixed(1)}s</span>
                  {clip && (
                    <span className="dub-scores">
                      <span title="Nhịp điệu"><Icon name="trending" size={12} /> {clip.rhythm}%</span>
                      {clip.delayScore !== null && <span title="Độ trễ"><Icon name="clock" size={12} /> {clip.delayScore}%</span>}
                    </span>
                  )}
                </div>
                <div className="dub-ko" lang="ko">{s.ko}</div>
                <div className="dub-romaja">{romanizeLine(s.ko)}</div>
                {s.vi && <div className="dub-vi">{s.vi}</div>}
                <div className="dub-line-actions">
                  <button className="btn-ghost sm" onClick={() => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(s.ko); u.lang = 'ko-KR'; u.rate = 0.9; speechSynthesis.speak(u) } catch { /* */ } }}>
                    <Icon name="volume" size={14} /> Nghe mẫu
                  </button>
                  {isRec ? (
                    <button className="btn-rec on" onClick={stopRecord}><Icon name="stop" size={14} /> Dừng thu</button>
                  ) : (
                    <button className="btn-rec" disabled={recording !== null} onClick={() => startRecord(idx)}><Icon name="mic" size={14} /> {clip ? 'Thu lại' : 'Thu âm'}</button>
                  )}
                  {clip && <button className="btn-ghost sm" onClick={() => playClip(idx)}><Icon name="play" size={13} /> Nghe lại</button>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
