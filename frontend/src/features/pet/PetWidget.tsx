import { useCallback, useEffect, useRef, useState } from 'react'
import Pet, { type PetMood } from '@/core/components/Pet'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'

const SIZE_KEY = 'vyling.pet.size'
const HIDDEN_KEY = 'vyling.pet.hidden'
const SESSION_KEY = 'vyling.pet.sessionStart'
const ACT_KEY = 'vyling.pet.lastActivity'
const POMO_KEY = 'vyling.pet.pomo'        // phiên Pomodoro đang chạy (để giữ qua lần tải lại)
const POMO_CFG_KEY = 'vyling.pet.pomoCfg' // thời lượng học/nghỉ đã chọn lần trước

const SIZES: Record<string, number> = { sm: 78, md: 104, lg: 140 }

// ---- Nhịp đổi biểu cảm (đã cho chậm lại cho dễ chịu) ----
const TICK = 20_000          // chu kỳ đánh giá trạng thái
const BLINK_EVERY = 5_200    // chớp mắt
const IDLE_EXPR_EVERY = 24_000
const IDLE_EXPR_CHANCE = 0.5 // không phải lúc nào tới hẹn cũng đổi mặt
const YAWN_EVERY = 60_000    // lúc mệt, lâu lâu ngáp một cái

// ---- Mốc thời gian học / nghỉ ----
const YAWN_AFTER = 4 * 3_600_000   // học liên tục 4h -> bắt đầu ngáp
const SLEEP_AFTER = 5 * 3_600_000  // 5h -> lăn ra ngủ, khuyên nghỉ
const LONG_IDLE = 25 * 60_000      // không hoạt động lâu -> nhắc học
const AWAY_RESET = 15 * 60_000     // vắng quá lâu -> tính là phiên học mới
const NAG_COOLDOWN = 8 * 60_000    // giãn cách giữa các lần nhắc nhở

// ---- Pomodoro ----
type PomoPhase = 'focus' | 'break'
interface Pomo {
  phase: PomoPhase
  focusMin: number
  breakMin: number
  round: number
  endsAt: number   // mốc thời điểm kết thúc chặng hiện tại (khi đang chạy)
  paused: boolean
  leftMs: number   // thời gian còn lại (dùng khi tạm dừng / lưu lại)
}
const POMO_PRESETS = [
  { id: 'standard', label: 'Standard', focus: 25, break: 5, desc: '25 phút học · 5 phút nghỉ' },
  { id: 'deep', label: 'Deep Work', focus: 50, break: 10, desc: '50 phút học · 10 phút nghỉ' },
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

// Một AudioContext dùng chung, được "mở khóa" ở lần người dùng tương tác đầu tiên.
// Nhờ vậy chuông vẫn kêu được khi Pomodoro TỰ chuyển chặng (không có cú click trực tiếp).
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

// Gõ một tiếng chuông tại thời điểm t: cộng thêm bồi âm lệch để nghe ngân như chuông thật.
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

// Chuông báo chuyển chặng. up=true: tới giờ HỌC (giai điệu đi lên, réo rắt);
// up=false: tới giờ NGHỈ (giai điệu đi xuống, dịu nhẹ).
function chime(up: boolean): void {
  const ctx = unlockAudio()
  if (!ctx) return
  const seq = up ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25] // C5 · E5 · G5
  const t0 = ctx.currentTime + 0.02
  seq.forEach((f, i) => ring(ctx, f, t0 + i * 0.18, 0.24))
}

type PetState = 'normal' | 'tired' | 'sleep' | 'study' | 'break'

const BASE_MOOD: Record<PetState, PetMood> = {
  normal: 'happy', tired: 'happy', sleep: 'sleep', study: 'reading', break: 'love',
}

const CHEERS = [
  'Mình học chút nha! 학습! 📚',
  'Đại ca cố lên, em tin đại ca! 🔥',
  'Tới giờ ôn từ vựng rồi đó~',
  'Học mỗi ngày một chút, giỏi lúc nào không hay 💪',
  'Yêu đại ca nhiều lắm luôn á 💕',
  'Nghỉ tay xíu rồi học tiếp nhé!',
]

// 4h: ngáp ngắn — nhắc nhẹ
const YAWN_MSGS = [
  'Hoaaa~ 🥱 đại ca cày 4 tiếng rồi đó, uống miếng nước nha.',
  'Mỏi mắt chưa đại caaa 🥱 đứng dậy vươn vai cái coi.',
  'Học hăng quá Shiba theo hụt hơi luôn 🥱 nghỉ 5 phút hen?',
]
// 5h: ngủ — khuyên nghỉ hẳn
const REST_MSGS = [
  'Khuya quá rồi đại ca ơi 😴 nghỉ đi mà, Shiba đi ngủ trước nha 💤',
  '5 tiếng rồi đó nha cao thủ! Cho não nghỉ xíu, mai chiến tiếp 😴',
  'Zzz… đại ca học dữ vậy trời 😵 mắt nhí lại rồi kìa, đi ngủ thôiii 💤',
]
// Lười lâu không học: cầm sách nhắc — hài
const STUDY_MSGS = [
  'Đại caaa 📖 sách sắp mọc rêu rồi nè 🕸️ mình ôn vài từ hong?',
  'Hello? Có ai ở nhà hông ạ 🥺 Shiba ôm sách đợi nãy giờ mỏi tay quá 📚',
  'Lâu không ôn, mớ từ vựng nó rủ nhau bay đi mất tiêu giờ 😱 học lẹ kẻo quên!',
  'Bài học: "다음에 (để sau)" — học hoài để sau là toang đó nha đại ca 😏 vô học thôi!',
]
// Học khuya (0–5h sáng): mặt sợ hãi — hù đại ca đi ngủ
const LATE_MSGS = [
  'Khuyaaa lắm rồi đại ca ơi 😱 hơn 2 giờ sáng rồi đó, ngủ điii kẻo Shiba sợ ma 👻',
  'Tối thui à 😨 đại ca thức khuya quá Shiba hết hồn luôn, đi ngủ thôi mà 🥺',
  'Giờ này còn cày 😱 mai dậy nổi hong đại ca? Tắt đèn đi ngủ nào 💤',
]
// Pomodoro — vào chặng học: cổ vũ tập trung
const FOCUS_MSGS = [
  'Vào guồng thôi đại ca! Shiba ngồi học cùng nè 📖✨',
  'Tập trung nào~ hết chặng này mình nghỉ một xíu nha 🔥',
  'Cất điện thoại đi đại caaa, mình cày hết chặng này! 💪',
]
// Pomodoro — vào chặng nghỉ: khen thưởng, nhắc thư giãn
const BREAK_MSGS = [
  'Hết chặng rồi! Đứng dậy vươn vai, uống miếng nước nha 🥤',
  'Giỏi quá đại ca 💕 nghỉ chút cho mắt đỡ mỏi rồi học tiếp!',
  'Nghỉ giải lao thôiii~ Shiba duỗi chân cái đã 😌',
]
// Biểu cảm dễ thương random lúc rảnh (chỉ đổi mặt, không làm phiền bằng thoại)
const IDLE_MOODS: PetMood[] = ['wink', 'shy', 'confused', 'love']

const isLateNight = (): boolean => { const h = new Date().getHours(); return h >= 0 && h < 5 }

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

function loadCfg(): { focusMin: number; breakMin: number } {
  try {
    const v = JSON.parse(localStorage.getItem(POMO_CFG_KEY) || '')
    if (v && typeof v.focusMin === 'number' && typeof v.breakMin === 'number') {
      return { focusMin: clamp(v.focusMin, FOCUS_MIN, FOCUS_MAX), breakMin: clamp(v.breakMin, BREAK_MIN, BREAK_MAX) }
    }
  } catch { /* ignore */ }
  return { focusMin: POMO_PRESETS[0].focus, breakMin: POMO_PRESETS[0].break }
}

export default function PetWidget() {
  const { setView, openLookup } = useAppStore()
  const art = 'shiba' // hiện chỉ còn Shiba — các loài khác sẽ phát triển sau

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

  // Pomodoro
  const [pomo, setPomo] = useState<Pomo | null>(null)
  const [pomoLeft, setPomoLeft] = useState(0) // giây còn lại, để hiển thị đồng hồ
  const [setup, setSetup] = useState(false)    // bảng chọn thời gian học/nghỉ
  const [cfg, setCfg] = useState(loadCfg)      // thời lượng đang chọn ở bảng cài đặt

  const stateRef = useRef<PetState>('normal')
  const baseMoodRef = useRef<PetMood>('happy')
  const transient = useRef(false)        // đang diễn 1 biểu cảm tạm -> idle nhường
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

  // Mở khóa âm thanh ở lần tương tác đầu tiên để chuông kêu được khi tự chuyển chặng.
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => { try { localStorage.setItem(SIZE_KEY, size) } catch { /* ignore */ } }, [size])
  useEffect(() => { try { localStorage.setItem(HIDDEN_KEY, hidden ? '1' : '0') } catch { /* ignore */ } }, [hidden])

  // Khôi phục đồng hồ phiên học từ lần trước (nếu vắng chưa lâu).
  useEffect(() => {
    const now = Date.now()
    try {
      const la = Number(localStorage.getItem(ACT_KEY)) || 0
      const ss = Number(localStorage.getItem(SESSION_KEY)) || 0
      if (la && ss && now - la <= AWAY_RESET) {
        lastActivity.current = la
        sessionStart.current = ss
      }
    } catch { /* ignore */ }
  }, [])

  // Khôi phục phiên Pomodoro đang chạy (nếu có) sau khi tải lại trang.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POMO_KEY)
      if (!raw) return
      const p = JSON.parse(raw) as Pomo
      if (!p || (p.phase !== 'focus' && p.phase !== 'break')) return
      const now = Date.now()
      // Nếu chặng đã hết trong lúc vắng mặt: cho bắt đầu lại chặng hiện tại từ bây giờ.
      if (!p.paused && p.endsAt <= now) { p.endsAt = now + phaseDur(p); p.leftMs = phaseDur(p) }
      else if (p.paused) p.endsAt = now + p.leftMs
      setPomo(p)
      setPomoLeft(Math.ceil((p.paused ? p.leftMs : p.endsAt - now) / 1000))
    } catch { /* ignore */ }
  }, [])

  // Đồng bộ ref + lưu phiên Pomodoro để giữ qua lần tải lại.
  useEffect(() => {
    pomoRef.current = pomo
    try {
      if (pomo) localStorage.setItem(POMO_KEY, JSON.stringify(pomo))
      else localStorage.removeItem(POMO_KEY)
    } catch { /* ignore */ }
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

  // Bộ não: quyết định trạng thái theo thời gian học & thời gian rảnh.
  // Khi Pomodoro đang bật thì nhường quyền điều khiển cho Pomodoro.
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
    } catch { /* ignore */ }
  }, [hidden, nag])

  useEffect(() => { decideRef.current = decide }, [decide])

  // Nhịp đánh giá trạng thái.
  useEffect(() => {
    if (hidden) return
    decide()
    const id = window.setInterval(decide, TICK)
    return () => clearInterval(id)
  }, [hidden, decide])

  // Theo dõi hoạt động của người dùng (để biết đang học hay đang lười).
  useEffect(() => {
    const bump = () => {
      const now = Date.now()
      const gap = now - lastActivity.current
      lastActivity.current = now
      if (pomoRef.current) return                       // Pomodoro tự quản trạng thái
      if (gap > AWAY_RESET) sessionStart.current = now   // quay lại sau khi vắng lâu = phiên mới
      if (gap > 60_000) decideRef.current()              // vừa hoạt động lại -> đánh giá ngay
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

  // Khi đổi trạng thái: đặt lại khuôn mặt nền tương ứng.
  useEffect(() => {
    transient.current = false
    baseMoodRef.current = BASE_MOOD[state]
    setMood(BASE_MOOD[state])
  }, [state])

  // Pomodoro lái trạng thái pet: chặng học -> "study" (mặt đọc sách), chặng nghỉ -> "break".
  const pomoPhase = pomo?.phase
  useEffect(() => {
    if (!pomoPhase) return
    const st: PetState = pomoPhase === 'focus' ? 'study' : 'break'
    stateRef.current = st
    setState(st)
  }, [pomoPhase])

  // Đồng hồ đếm ngược Pomodoro + tự chuyển chặng.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pomo, focusMin, breakMin, say])

  // Chớp mắt đều đặn (chỉ khi đang bình thường).
  useEffect(() => {
    if (hidden) return
    const id = window.setInterval(() => {
      if (stateRef.current !== 'normal' || transient.current) return
      setMood('wink')
      after(190, () => { if (!transient.current) setMood(baseMoodRef.current) })
    }, BLINK_EVERY)
    return () => clearInterval(id)
  }, [hidden, after])

  // Thỉnh thoảng đổi sang một biểu cảm dễ thương rồi quay lại (lúc bình thường).
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

  // Lúc mệt (>4h): lâu lâu ngáp một cái.
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

  // Học khuya: hiện mặt sợ hãi + hù đại ca đi ngủ (khi đang thức học, chưa tới ngưỡng ngủ).
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

  // Hook gỡ lỗi: trong môi trường dev có thể tua nhanh đồng hồ để kiểm thử.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    ;(window as unknown as { __pet?: unknown }).__pet = {
      session: (min: number) => { sessionStart.current = Date.now() - min * 60_000; decideRef.current() },
      idle: (min: number) => { lastActivity.current = Date.now() - min * 60_000; decideRef.current() },
      reset: () => { sessionStart.current = Date.now(); lastActivity.current = Date.now(); lastNag.current = 0; decideRef.current() },
      get state() { return stateRef.current },
    }
  }, [])

  // ---- Hành động Pomodoro ----
  const startPomo = useCallback((focus: number, brk: number) => {
    const f = clamp(focus, FOCUS_MIN, FOCUS_MAX)
    const b = clamp(brk, BREAK_MIN, BREAK_MAX)
    const dur = f * 60_000
    unlockAudio()
    setPomo({ phase: 'focus', focusMin: f, breakMin: b, round: 1, endsAt: Date.now() + dur, paused: false, leftMs: dur })
    setPomoLeft(f * 60)
    setCfg({ focusMin: f, breakMin: b })
    try { localStorage.setItem(POMO_CFG_KEY, JSON.stringify({ focusMin: f, breakMin: b })) } catch { /* ignore */ }
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
      <button className="pet-peek" onClick={() => setHidden(false)} title="Hiện Shiba">
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
              {pomo.phase === 'focus' ? 'Đang học' : 'Giải lao'} · chặng {pomo.round}
            </span>
            <span className="pomo-time">{mmss(pomoLeft)}{pomo.paused ? ' ⏸' : ''}</span>
          </div>
          <div className="pomo-ctl">
            <button onClick={pomo.paused ? resumePomo : pausePomo} title={pomo.paused ? 'Tiếp tục' : 'Tạm dừng'}>
              <Icon name={pomo.paused ? 'play' : 'pause'} size={14} />
            </button>
            <button onClick={stopPomo} title="Kết thúc">
              <Icon name="stop" size={14} />
            </button>
          </div>
        </div>
      )}

      {bubble && (
        <div className="pet-bubble">
          {bubble}
          <div className="pet-bubble-actions">
            <button onClick={() => setView('flashcards')}>Ôn tập ngay</button>
            <button onClick={lookup}>Tra từ vựng</button>
          </div>
        </div>
      )}

      {setup && (
        <div className="pomo-setup" onMouseLeave={() => setSetup(false)}>
          <h4><Icon name="clock" size={15} /> Pomodoro cùng Shiba</h4>
          <div className="pomo-presets">
            {POMO_PRESETS.map((p) => (
              <button
                key={p.id}
                className={'pomo-preset' + (cfg.focusMin === p.focus && cfg.breakMin === p.break ? ' on' : '')}
                onClick={() => setCfg({ focusMin: p.focus, breakMin: p.break })}
              >
                <b>{p.label}</b>
                <small>{p.desc}</small>
              </button>
            ))}
          </div>
          <div className="pomo-fields">
            <label className="pomo-field">
              <span>Học (phút)</span>
              <div className="pomo-step">
                <button onClick={() => setCfg((c) => ({ ...c, focusMin: clamp(c.focusMin - 5, FOCUS_MIN, FOCUS_MAX) }))}>−</button>
                <b>{cfg.focusMin}</b>
                <button onClick={() => setCfg((c) => ({ ...c, focusMin: clamp(c.focusMin + 5, FOCUS_MIN, FOCUS_MAX) }))}>+</button>
              </div>
            </label>
            <label className="pomo-field">
              <span>Nghỉ (phút)</span>
              <div className="pomo-step">
                <button onClick={() => setCfg((c) => ({ ...c, breakMin: clamp(c.breakMin - 1, BREAK_MIN, BREAK_MAX) }))}>−</button>
                <b>{cfg.breakMin}</b>
                <button onClick={() => setCfg((c) => ({ ...c, breakMin: clamp(c.breakMin + 1, BREAK_MIN, BREAK_MAX) }))}>+</button>
              </div>
            </label>
          </div>
          <button className="pomo-start" onClick={() => startPomo(cfg.focusMin, cfg.breakMin)}>
            <Icon name="play" size={14} /> Bắt đầu tập trung
          </button>
        </div>
      )}

      {menu && (
        <div className="pet-menu" onMouseLeave={() => setMenu(false)}>
          <div className="pet-menu-row">
            <span>Kích thước</span>
            <div className="pet-sizes">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(s)}>
                  {s === 'sm' ? 'Bé' : s === 'md' ? 'Vừa' : 'Lớn'}
                </button>
              ))}
            </div>
          </div>
          <button className="pet-menu-btn" onClick={lookup}>
            <Icon name="search" size={14} /> Tra từ vựng
          </button>
          <button className="pet-menu-btn" onClick={() => { setSetup((s) => !s); setMenu(false) }}>
            <Icon name="clock" size={14} /> {pomo ? 'Hẹn giờ Pomodoro' : 'Bật Pomodoro'}
          </button>
          <button className="pet-menu-btn" onClick={() => { setView('shop'); setMenu(false) }}>
            <Icon name="store" size={14} /> Cửa hàng
          </button>
          <button className="pet-menu-btn" onClick={() => { setHidden(true); setMenu(false) }}>
            <Icon name="x" size={14} /> Ẩn Shiba
          </button>
        </div>
      )}

      <div className={'pet-stage' + (hop ? ' hop' : '')}>
        <button className="pet-body" onClick={greet} title="Shiba — chạm để cổ vũ">
          <span className="pet-float"><Pet art={art} size={px} mood={mood} /></span>
          <span className="pet-shadow" />
        </button>
        <button className="pet-gear" onClick={() => { setMenu((m) => !m); setSetup(false) }} title="Tùy chỉnh">
          <Icon name="settings" size={14} />
        </button>
      </div>
    </div>
  )
}
