import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { romanizeLine } from '@/core/utils/romanize'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import { detectSpeakers, diarizeVoice } from '@/core/api/learn.api'
import type { Lesson } from '@/models/lesson.model'

interface Clip {
  url: string
  duration: number
  delay: number | null
  rhythm: number
  delayScore: number | null
}

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

const charLabel = (c: number) => String.fromCharCode(65 + c)

export default function DubbingStudio({ lesson }: { lesson: Lesson }) {
  const { recordEvent, user, setView, learnLang } = useAppStore()
  const cfg = studyLang(learnLang)
  const segs = lesson.segments
  const yt = useYouTubePlayer('dub-player')

  const [clips, setClips] = useState<Record<number, Clip>>({})
  const [recording, setRecording] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())

  // Role-play: per-line speaker + which character's original voice is turned off.
  const [speakers, setSpeakers] = useState<number[]>([])
  const [names, setNames] = useState<string[]>(['Nhân vật A', 'Nhân vật B'])
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
  // Auto-dub: one persistent mic stream, a fresh recorder per "my" line.
  const autoStreamRef = useRef<MediaStream | null>(null)
  const autoMrRef = useRef<MediaRecorder | null>(null)
  const autoStartRef = useRef(0)

  useEffect(() => {
    yt.load(lesson.id)
    setTimeout(() => yt.mute(), 1200)
    setSpeakers(segs.map((s, i) => (typeof s.speaker === 'number' ? s.speaker : i % 2)))
    setRoleChar(null)
    return () => stopPlayback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  const spkOf = (idx: number) => speakers[idx] ?? idx % 2
  const nSpk = speakers.length ? Math.max(2, Math.max(...speakers) + 1) : 2
  const nameOf = (c: number) => names[c] || `Nhân vật ${charLabel(c)}`

  const detect = async () => {
    if (!user.isPlus) { setView('pricing'); return }
    setDetecting(true)
    setError('')
    try {
      const r = await detectSpeakers(lesson.id, segs.map((s) => ({ start: s.start, ko: s.ko })))
      if (r.speakers.length === segs.length) {
        setSpeakers(r.speakers)
        if (r.names?.length) setNames(r.names)
        if (r.source !== 'ai') {
          setError('AI chưa chắc chắn nên tạm chia luân phiên. Bạn có thể chỉnh từng câu bằng nút A/B.')
        }
      } else {
        setError('AI nhận diện chưa khớp số câu — giữ cách chia hiện tại. Bạn có thể chỉnh thủ công bằng nút A/B trên mỗi câu.')
      }
    } catch {
      setError('Chưa nhận diện tự động được (cần máy chủ AI). Bạn vẫn có thể gán nhân vật thủ công bằng nút A/B trên mỗi câu.')
    } finally {
      setDetecting(false)
    }
  }

  const detectVoice = async () => {
    if (!user.isPlus) { setView('pricing'); return }
    setVoiceDetecting(true)
    setError('')
    try {
      const r = await diarizeVoice(lesson.id, segs.map((s) => s.start))
      if (r.speakers.length === segs.length) {
        setSpeakers(r.speakers)
        if (r.names?.length) setNames(r.names)
      } else {
        setError('Phân tích giọng chưa khớp số câu — giữ cách chia hiện tại.')
      }
    } catch (e) {
      setError((e as Error).message || 'Không phân tích được giọng nói.')
    } finally {
      setVoiceDetecting(false)
    }
  }

  const cycleSpeaker = (idx: number) => {
    setSpeakers((prev) => {
      const max = prev.length ? Math.max(...prev) : 1
      const total = Math.min(6, Math.max(2, max + 2)) // allow adding up to 6 speakers
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
          recordEvent('pronounce', 1)
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

  // Start recording the current "my" line onto the shared mic stream.
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
    } catch { /* ignore */ }
  }

  const stopAutoRec = () => {
    try { autoMrRef.current?.stop() } catch { /* */ }
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

  // Play the video; in role-play mode mute the original ONLY on the chosen
  // character's turns (by timestamp). When auto-dub is on, the mic records
  // automatically on each of your turns; otherwise your saved clip plays.
  const play = async () => {
    if (playing) { stopPlayback(); return }
    if (roleChar === null && Object.keys(clips).length === 0) return

    const autoDubActive = roleChar !== null && autoDub
    if (autoDubActive) {
      try {
        autoStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        setError('Không bật được micro để tự thu — vẫn phát nhập vai nhưng không thu âm. Hãy cho phép quyền micro.')
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
    const text = `Mình vừa lồng tiếng ${cfg.name.replace('Tiếng ', 'tiếng ')} cho "${lesson.title}" trên VyLing!`
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

  const myLines = roleChar === null ? segs.length : segs.filter((_, i) => spkOf(i) === roleChar).length

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

          <div className="dub-roleplay">
            <div className="dub-rp-head">
              <span><Icon name="user" size={15} /> Nhập vai — tắt tiếng một nhân vật</span>
              {user.isPlus ? (
                <div className="dub-rp-detect">
                  <button className="btn-ghost sm" onClick={detectVoice} disabled={voiceDetecting || detecting} title="Phân tích âm thanh thật để phân biệt giọng từng người — chính xác nhất">
                    <Icon name="volume" size={13} /> {voiceDetecting ? 'Đang nghe giọng…' : 'Theo giọng nói'}
                  </button>
                  <button className="btn-ghost sm" onClick={detect} disabled={detecting || voiceDetecting} title="Đoán người nói từ nội dung phụ đề bằng AI">
                    <Icon name="sparkles" size={13} /> {detecting ? 'Đang nhận diện…' : 'Theo nội dung (AI)'}
                  </button>
                </div>
              ) : (
                <button className="btn-ghost sm dub-rp-plus" onClick={() => setView('pricing')} title="Nâng cấp Plus để tự động nhận diện người nói">
                  <Icon name="sparkles" size={13} /> Tự động nhận diện ⭐ Plus
                </button>
              )}
            </div>
            {voiceDetecting && <p className="dub-rp-note"><Icon name="bulb" size={13} /> Đang tải âm thanh & phân tích vân giọng — có thể mất 1–2 phút với video dài, bạn chờ chút nhé.</p>}
            <div className="dub-rp-chips">
              <button className={'dub-rp-chip' + (roleChar === null ? ' on' : '')} onClick={() => { stopPlayback(); setRoleChar(null) }}>
                <Icon name="mic" size={13} /> Lồng cả {nSpk} vai
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
                <Icon name="bulb" size={13} /> Bản Free: bấm nhãn <b>A/B</b> trên mỗi câu để tự gán nhân vật. Nâng cấp <b>Plus</b> để tự động nhận diện theo giọng nói / nội dung.
              </p>
            )}
            {roleChar !== null && (
              <>
                <p className="dub-rp-note">
                  <Icon name="mute" size={13} /> Tắt tiếng gốc của <b>{nameOf(roleChar)}</b> ({myLines} câu) — bạn đọc/lồng tiếng phần này. Các nhân vật khác vẫn phát tiếng gốc thật của video.
                </p>
                <label className="dub-rp-auto">
                  <input type="checkbox" checked={autoDub} onChange={(e) => setAutoDub(e.target.checked)} />
                  <span><Icon name="mic" size={13} /> Tự động thu âm khi tới lượt của bạn (bấm “Phát nhập vai”, micro tự bật đúng câu của bạn)</span>
                </label>
              </>
            )}
          </div>

          <div className="dub-controls">
            {roleChar === null && (
              <button className={'btn-ghost' + (muted ? ' on' : '')} onClick={toggleMute}>
                <Icon name={muted ? 'mute' : 'volume'} size={16} /> {muted ? 'Đang tắt tiếng gốc' : 'Bật tiếng gốc'}
              </button>
            )}
            <button className="btn-primary" disabled={roleChar === null && doneCount === 0} onClick={play}>
              <Icon name={playing ? 'stop' : 'play'} size={16} /> {playing ? 'Dừng' : roleChar === null ? 'Phát bản lồng tiếng' : autoDub ? 'Phát nhập vai & tự thu' : 'Phát nhập vai'}
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
            const mine = roleChar === null || spkOf(idx) === roleChar
            return (
              <div key={idx} className={'dub-line' + (clip ? ' done' : '') + (isRec ? ' rec' : '') + (roleChar !== null && !mine ? ' partner' : '')}>
                <div className="dub-line-head">
                  <span className="dub-num">{idx + 1}</span>
                  <button className={'dub-spk c' + (spkOf(idx) % 6)} onClick={() => cycleSpeaker(idx)} title="Đổi nhân vật">
                    {charLabel(spkOf(idx))}
                  </button>
                  <span className="dub-ref">~{ref.toFixed(1)}s</span>
                  {clip && (
                    <span className="dub-scores">
                      <span title="Nhịp điệu"><Icon name="trending" size={12} /> {clip.rhythm}%</span>
                      {clip.delayScore !== null && <span title="Độ trễ"><Icon name="clock" size={12} /> {clip.delayScore}%</span>}
                    </span>
                  )}
                </div>
                <div className="dub-ko" lang={learnLang}>{s.ko}</div>
                {cfg.romanizeChat && <div className="dub-romaja">{romanizeLine(s.ko)}</div>}
                {s.vi && <div className="dub-vi">{s.vi}</div>}
                <div className="dub-line-actions">
                  <button className="btn-ghost sm" onClick={() => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(s.ko); u.lang = cfg.locale; u.rate = 0.9; speechSynthesis.speak(u) } catch { /* */ } }}>
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
