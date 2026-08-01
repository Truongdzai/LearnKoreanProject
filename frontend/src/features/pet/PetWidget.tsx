import { useCallback, useEffect, useRef, useState } from 'react'
import Pet, { type PetMood } from '@/core/components/Pet'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'

const SIZE_KEY = 'vyling.pet.size'
const HIDDEN_KEY = 'vyling.pet.hidden'
const SESSION_KEY = 'vyling.pet.sessionStart'
const ACT_KEY = 'vyling.pet.lastActivity'
const POMO_KEY = 'vyling.pet.pomo'
const POMO_CFG_KEY = 'vyling.pet.pomoCfg'

const SIZES: Record<string, number> = { sm: 78, md: 104, lg: 140 }

const TICK = 20_000
const BLINK_EVERY = 5_200
const IDLE_EXPR_EVERY = 24_000
const IDLE_EXPR_CHANCE = 0.5
const YAWN_EVERY = 60_000

const YAWN_AFTER = 4 * 3_600_000
const SLEEP_AFTER = 5 * 3_600_000
const LONG_IDLE = 25 * 60_000
const AWAY_RESET = 15 * 60_000
const NAG_COOLDOWN = 8 * 60_000

type PomoPhase = 'focus' | 'break'
interface Pomo {
  phase: PomoPhase
  focusMin: number
  breakMin: number
  round: number
  endsAt: number
  paused: boolean
  leftMs: number
}
const POMO_PRESETS = [
  { id: 'standard', label: 'Standard', focus: 25, break: 5 },
  { id: 'deep', label: 'Deep Work', focus: 50, break: 10 },
] as const
const FOCUS_MIN = 5, FOCUS_MAX = 90
const BREAK_MIN = 1, BREAK_MAX = 30

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const phaseDur = (p: Pomo) => (p.phase === 'focus' ? p.focusMin : p.breakMin) * 60_000

const mmss = (sec: number): string => {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

let audioCtx: AudioContext | null = null
function unlockAudio(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return null
      audioCtx = new Ctx()
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    return audioCtx
  } catch { return null }
}

function ring(ctx: AudioContext, freq: number, t: number, vol: number): void {
  const partials = [
    { mult: 1, gain: 1 },
    { mult: 2.0, gain: 0.45 },
    { mult: 2.76, gain: 0.2 },
  ]
  for (const p of partials) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * p.mult
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(vol * p.gain, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 1.7)
  }
}

function chime(up: boolean): void {
  const ctx = unlockAudio()
  if (!ctx) return
  const seq = up ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25]
  const t0 = ctx.currentTime + 0.02
  seq.forEach((f, i) => ring(ctx, f, t0 + i * 0.18, 0.24))
}

type PetState = 'normal' | 'tired' | 'sleep' | 'study' | 'break'

const BASE_MOOD: Record<PetState, PetMood> = {
  normal: 'happy', tired: 'happy', sleep: 'sleep', study: 'reading', break: 'love',
}

const CHEERS = ['pet.cheer1', 'pet.cheer2', 'pet.cheer3', 'pet.cheer4', 'pet.cheer5', 'pet.cheer6']

const YAWN_MSGS = ['pet.yawn1', 'pet.yawn2', 'pet.yawn3']
const REST_MSGS = ['pet.rest1', 'pet.rest2', 'pet.rest3']
const STUDY_MSGS = ['pet.study1', 'pet.study2', 'pet.study3', 'pet.study4']
const LATE_MSGS = ['pet.late1', 'pet.late2', 'pet.late3']
const FOCUS_MSGS = ['pet.focus1', 'pet.focus2', 'pet.focus3']
const BREAK_MSGS = ['pet.break1', 'pet.break2', 'pet.break3']
const IDLE_MOODS: PetMood[] = ['wink', 'shy', 'confused', 'love']

const isLateNight = (): boolean => { const h = new Date().getHours(); return h >= 0 && h < 5 }

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

function loadCfg(): { focusMin: number; breakMin: number } {
  try {
    const v = JSON.parse(localStorage.getItem(POMO_CFG_KEY) || '')
    if (v && typeof v.focusMin === 'number' && typeof v.breakMin === 'number') {
      return { focusMin: clamp(v.focusMin, FOCUS_MIN, FOCUS_MAX), breakMin: clamp(v.breakMin, BREAK_MIN, BREAK_MAX) }
    }
  } catch {}
  return { focusMin: POMO_PRESETS[0].focus, breakMin: POMO_PRESETS[0].break }
}

export default function PetWidget() {
  const { setView, openLookup, t } = useAppStore()
  const art = 'shiba'

  const [size, setSize] = useState<string>(() => {
    try { const v = localStorage.getItem(SIZE_KEY); return v && v in SIZES ? v : 'md' } catch { return 'md' }
  })
  const [hidden, setHidden] = useState<boolean>(() => {
    try { return localStorage.getItem(HIDDEN_KEY) === '1' } catch { return false }
  })
  const [mood, setMood] = useState<PetMood>('happy')
  const [state, setState] = useState<PetState>('normal')
  const [bubble, setBubble] = useState('')
  const [hop, setHop] = useState(false)
  const [menu, setMenu] = useState(false)

  const [pomo, setPomo] = useState<Pomo | null>(null)
  const [pomoLeft, setPomoLeft] = useState(0)
  const [setup, setSetup] = useState(false)
  const [cfg, setCfg] = useState(loadCfg)

  const stateRef = useRef<PetState>('normal')
  const baseMoodRef = useRef<PetMood>('happy')
  const transient = useRef(false)
  const lastActivity = useRef(Date.now())
  const sessionStart = useRef(Date.now())
  const lastNag = useRef(0)
  const decideRef = useRef<() => void>(() => {})
  const pomoRef = useRef<Pomo | null>(null)
  const timers = useRef<number[]>([])

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => { try { localStorage.setItem(SIZE_KEY, size) } catch {} }, [size])
  useEffect(() => { try { localStorage.setItem(HIDDEN_KEY, hidden ? '1' : '0') } catch {} }, [hidden])

  useEffect(() => {
    const now = Date.now()
    try {
      const la = Number(localStorage.getItem(ACT_KEY)) || 0
      const ss = Number(localStorage.getItem(SESSION_KEY)) || 0
      if (la && ss && now - la <= AWAY_RESET) {
        lastActivity.current = la
        sessionStart.current = ss
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POMO_KEY)
      if (!raw) return
      const p = JSON.parse(raw) as Pomo
      if (!p || (p.phase !== 'focus' && p.phase !== 'break')) return
      const now = Date.now()
      if (!p.paused && p.endsAt <= now) { p.endsAt = now + phaseDur(p); p.leftMs = phaseDur(p) }
      else if (p.paused) p.endsAt = now + p.leftMs
      setPomo(p)
      setPomoLeft(Math.ceil((p.paused ? p.leftMs : p.endsAt - now) / 1000))
    } catch {}
  }, [])

  useEffect(() => {
    pomoRef.current = pomo
    try {
      if (pomo) localStorage.setItem(POMO_KEY, JSON.stringify(pomo))
      else localStorage.removeItem(POMO_KEY)
    } catch {}
  }, [pomo])

  const nag = useCallback((msgs: string[]) => {
    const now = Date.now()
    if (now - lastNag.current < NAG_COOLDOWN) return
    lastNag.current = now
    setBubble(pick(msgs))
    after(7200, () => setBubble(''))
  }, [after])

  const say = useCallback((msg: string, ms = 6000) => {
    setBubble(msg)
    after(ms, () => setBubble(''))
  }, [after])

  const decide = useCallback(() => {
    if (hidden || pomoRef.current) return
    const now = Date.now()
    const idle = now - lastActivity.current
    const session = now - sessionStart.current

    let next: PetState = 'normal'
    if (idle >= LONG_IDLE) next = 'study'
    else if (session >= SLEEP_AFTER) next = 'sleep'
    else if (session >= YAWN_AFTER) next = 'tired'

    stateRef.current = next
    setState(next)

    if (next === 'study') nag(STUDY_MSGS)
    else if (next === 'sleep') nag(REST_MSGS)
    else if (next === 'tired') nag(YAWN_MSGS)

    try {
      localStorage.setItem(SESSION_KEY, String(sessionStart.current))
      localStorage.setItem(ACT_KEY, String(lastActivity.current))
    } catch {}
  }, [hidden, nag])

  useEffect(() => { decideRef.current = decide }, [decide])

  useEffect(() => {
    if (hidden) return
    decide()
    const id = window.setInterval(decide, TICK)
    return () => clearInterval(id)
  }, [hidden, decide])

  useEffect(() => {
    const bump = () => {
      const now = Date.now()
      const gap = now - lastActivity.current
      lastActivity.current = now
      if (pomoRef.current) return
      if (gap > AWAY_RESET) sessionStart.current = now
      if (gap > 60_000) decideRef.current()
    }
    const opts = { passive: true } as AddEventListenerOptions
    window.addEventListener('pointermove', bump, opts)
    window.addEventListener('pointerdown', bump, opts)
    window.addEventListener('keydown', bump, opts)
    window.addEventListener('scroll', bump, opts)
    const onVis = () => { if (!document.hidden) bump() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pointermove', bump)
      window.removeEventListener('pointerdown', bump)
      window.removeEventListener('keydown', bump)
      window.removeEventListener('scroll', bump)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  useEffect(() => {
    transient.current = false
    baseMoodRef.current = BASE_MOOD[state]
    setMood(BASE_MOOD[state])
  }, [state])

  const pomoPhase = pomo?.phase
  useEffect(() => {
    if (!pomoPhase) return
    const st: PetState = pomoPhase === 'focus' ? 'study' : 'break'
    stateRef.current = st
    setState(st)
  }, [pomoPhase])

  const focusMin = pomo?.focusMin
  const breakMin = pomo?.breakMin
  useEffect(() => {
    if (!pomo) return
    const advance = () => {
      const p = pomoRef.current
      if (!p) return
      const now = Date.now()
      if (p.phase === 'focus') {
        const dur = p.breakMin * 60_000
        setPomo({ ...p, phase: 'break', endsAt: now + dur, paused: false, leftMs: dur })
        setPomoLeft(p.breakMin * 60)
        chime(false)
        say(pick(BREAK_MSGS))
      } else {
        const dur = p.focusMin * 60_000
        setPomo({ ...p, phase: 'focus', round: p.round + 1, endsAt: now + dur, paused: false, leftMs: dur })
        setPomoLeft(p.focusMin * 60)
        chime(true)
        say(pick(FOCUS_MSGS))
      }
    }
    const tick = () => {
      const p = pomoRef.current
      if (!p) return
      if (p.paused) { setPomoLeft(Math.ceil(p.leftMs / 1000)); return }
      const left = p.endsAt - Date.now()
      if (left <= 0) advance()
      else setPomoLeft(Math.ceil(left / 1000))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [!!pomo, focusMin, breakMin, say])

  useEffect(() => {
    if (hidden) return
    const id = window.setInterval(() => {
      if (stateRef.current !== 'normal' || transient.current) return
      setMood('wink')
      after(190, () => { if (!transient.current) setMood(baseMoodRef.current) })
    }, BLINK_EVERY)
    return () => clearInterval(id)
  }, [hidden, after])

  useEffect(() => {
    if (hidden) return
    const id = window.setInterval(() => {
      if (stateRef.current !== 'normal' || transient.current) return
      if (Math.random() > IDLE_EXPR_CHANCE) return
      transient.current = true
      setMood(pick(IDLE_MOODS))
      after(2400, () => { setMood(baseMoodRef.current); transient.current = false })
    }, IDLE_EXPR_EVERY)
    return () => clearInterval(id)
  }, [hidden, after])

  useEffect(() => {
    if (hidden) return
    const id = window.setInterval(() => {
      if (stateRef.current !== 'tired' || transient.current) return
      transient.current = true
      setMood('sleepy')
      after(3200, () => { setMood(baseMoodRef.current); transient.current = false })
    }, YAWN_EVERY)
    return () => clearInterval(id)
  }, [hidden, after])

  useEffect(() => {
    if (hidden) return
    const id = window.setInterval(() => {
      if (transient.current || !isLateNight()) return
      if (stateRef.current !== 'normal' && stateRef.current !== 'tired') return
      transient.current = true
      setMood('scared')
      nag(LATE_MSGS)
      after(3400, () => { setMood(baseMoodRef.current); transient.current = false })
    }, YAWN_EVERY)
    return () => clearInterval(id)
  }, [hidden, after, nag])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    ;(window as unknown as { __pet?: unknown }).__pet = {
      session: (min: number) => { sessionStart.current = Date.now() - min * 60_000; decideRef.current() },
      idle: (min: number) => { lastActivity.current = Date.now() - min * 60_000; decideRef.current() },
      reset: () => { sessionStart.current = Date.now(); lastActivity.current = Date.now(); lastNag.current = 0; decideRef.current() },
      get state() { return stateRef.current },
    }
  }, [])

  const startPomo = useCallback((focus: number, brk: number) => {
    const f = clamp(focus, FOCUS_MIN, FOCUS_MAX)
    const b = clamp(brk, BREAK_MIN, BREAK_MAX)
    const dur = f * 60_000
    unlockAudio()
    setPomo({ phase: 'focus', focusMin: f, breakMin: b, round: 1, endsAt: Date.now() + dur, paused: false, leftMs: dur })
    setPomoLeft(f * 60)
    setCfg({ focusMin: f, breakMin: b })
    try { localStorage.setItem(POMO_CFG_KEY, JSON.stringify({ focusMin: f, breakMin: b })) } catch {}
    setSetup(false); setMenu(false)
    lastActivity.current = Date.now()
    say(pick(FOCUS_MSGS))
  }, [say])

  const pausePomo = useCallback(() => {
    setPomo((p) => (p && !p.paused ? { ...p, paused: true, leftMs: Math.max(0, p.endsAt - Date.now()) } : p))
  }, [])

  const resumePomo = useCallback(() => {
    unlockAudio()
    setPomo((p) => (p && p.paused ? { ...p, paused: false, endsAt: Date.now() + p.leftMs } : p))
  }, [])

  const stopPomo = useCallback(() => {
    setPomo(null)
    setSetup(false)
    sessionStart.current = Date.now()
    lastActivity.current = Date.now()
    stateRef.current = 'normal'
    setState('normal')
    setBubble('')
    after(0, () => decideRef.current())
  }, [after])

  const greet = useCallback(() => {
    lastActivity.current = Date.now()
    transient.current = true
    setHop(true)
    setMood(Math.random() > 0.5 ? 'love' : 'wink')
    setBubble(pick(CHEERS))
    after(600, () => setHop(false))
    after(2600, () => { setMood(baseMoodRef.current); transient.current = false })
    after(4200, () => setBubble(''))
  }, [after])

  const lookup = useCallback(() => { setMenu(false); openLookup() }, [openLookup])

  if (hidden) {
    return (
      <button className="pet-peek" onClick={() => setHidden(false)} title={t('pet.show')}>
        <Pet art={art} size={30} mood="happy" />
      </button>
    )
  }

  const px = SIZES[size]
  const total = pomo ? (pomo.phase === 'focus' ? pomo.focusMin : pomo.breakMin) * 60 : 0
  const progress = pomo && total ? clamp((1 - pomoLeft / total) * 100, 0, 100) : 0

  return (
    <div className="pet-widget" style={{ width: px }}>
      {pomo && (
        <div className={'pet-timer' + (pomo.phase === 'break' ? ' is-break' : '')}>
          <div className="pomo-dial" style={{ ['--p' as string]: progress } as React.CSSProperties}>
            <span>{pomo.phase === 'focus' ? '📖' : '☕'}</span>
          </div>
          <div className="pomo-info">
            <span className="pomo-phase">
              {pomo.phase === 'focus' ? t('pet.phaseFocus') : t('pet.phaseBreak')} · {t('pet.round', { n: pomo.round })}
            </span>
            <span className="pomo-time">{mmss(pomoLeft)}{pomo.paused ? ' ⏸' : ''}</span>
          </div>
          <div className="pomo-ctl">
            <button onClick={pomo.paused ? resumePomo : pausePomo} title={pomo.paused ? t('pet.resume') : t('pet.pause')}>
              <Icon name={pomo.paused ? 'play' : 'pause'} size={14} />
            </button>
            <button onClick={stopPomo} title={t('pet.stop')}>
              <Icon name="stop" size={14} />
            </button>
          </div>
        </div>
      )}

      {bubble && (
        <div className="pet-bubble">
          {t(bubble)}
          <div className="pet-bubble-actions">
            <button onClick={() => setView('flashcards')}>{t('pet.reviewNow')}</button>
            <button onClick={lookup}>{t('pet.lookup')}</button>
          </div>
        </div>
      )}

      {setup && (
        <div className="pomo-setup" onMouseLeave={() => setSetup(false)}>
          <h4><Icon name="clock" size={15} /> {t('pet.pomoTitle')}</h4>
          <div className="pomo-presets">
            {POMO_PRESETS.map((p) => (
              <button
                key={p.id}
                className={'pomo-preset' + (cfg.focusMin === p.focus && cfg.breakMin === p.break ? ' on' : '')}
                onClick={() => setCfg({ focusMin: p.focus, breakMin: p.break })}
              >
                <b>{p.label}</b>
                <small>{t('pet.presetDesc', { f: p.focus, b: p.break })}</small>
              </button>
            ))}
          </div>
          <div className="pomo-fields">
            <label className="pomo-field">
              <span>{t('pet.focusMin')}</span>
              <div className="pomo-step">
                <button onClick={() => setCfg((c) => ({ ...c, focusMin: clamp(c.focusMin - 5, FOCUS_MIN, FOCUS_MAX) }))}>−</button>
                <b>{cfg.focusMin}</b>
                <button onClick={() => setCfg((c) => ({ ...c, focusMin: clamp(c.focusMin + 5, FOCUS_MIN, FOCUS_MAX) }))}>+</button>
              </div>
            </label>
            <label className="pomo-field">
              <span>{t('pet.breakMin')}</span>
              <div className="pomo-step">
                <button onClick={() => setCfg((c) => ({ ...c, breakMin: clamp(c.breakMin - 1, BREAK_MIN, BREAK_MAX) }))}>−</button>
                <b>{cfg.breakMin}</b>
                <button onClick={() => setCfg((c) => ({ ...c, breakMin: clamp(c.breakMin + 1, BREAK_MIN, BREAK_MAX) }))}>+</button>
              </div>
            </label>
          </div>
          <button className="pomo-start" onClick={() => startPomo(cfg.focusMin, cfg.breakMin)}>
            <Icon name="play" size={14} /> {t('pet.start')}
          </button>
        </div>
      )}

      {menu && (
        <div className="pet-menu" onMouseLeave={() => setMenu(false)}>
          <div className="pet-menu-row">
            <span>{t('pet.size')}</span>
            <div className="pet-sizes">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(s)}>
                  {s === 'sm' ? t('pet.sizeS') : s === 'md' ? t('pet.sizeM') : t('pet.sizeL')}
                </button>
              ))}
            </div>
          </div>
          <button className="pet-menu-btn" onClick={lookup}>
            <Icon name="search" size={14} /> {t('pet.lookup')}
          </button>
          <button className="pet-menu-btn" onClick={() => { setSetup((s) => !s); setMenu(false) }}>
            <Icon name="clock" size={14} /> {pomo ? t('pet.pomoAdjust') : t('pet.pomoOn')}
          </button>
          <button className="pet-menu-btn" onClick={() => { setView('shop'); setMenu(false) }}>
            <Icon name="store" size={14} /> {t('nav.shop')}
          </button>
          <button className="pet-menu-btn" onClick={() => { setHidden(true); setMenu(false) }}>
            <Icon name="x" size={14} /> {t('pet.hide')}
          </button>
        </div>
      )}

      <div className={'pet-stage' + (hop ? ' hop' : '')}>
        <button className="pet-body" onClick={greet} title={t('pet.tap')}>
          <span className="pet-float"><Pet art={art} size={px} mood={mood} /></span>
          <span className="pet-shadow" />
        </button>
        <button className="pet-gear" onClick={() => { setMenu((m) => !m); setSetup(false) }} title={t('pet.settings')}>
          <Icon name="settings" size={14} />
        </button>
      </div>
    </div>
  )
}
