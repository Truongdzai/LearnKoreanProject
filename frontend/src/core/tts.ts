import type { ScriptLine } from '@/data/toeicCore'


let voiceM: SpeechSynthesisVoice | null = null
let voiceW: SpeechSynthesisVoice | null = null
const listeners = new Set<() => void>()

function refreshVoices(): void {
  try {
    const all = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'))
    if (!all.length) { voiceM = null; voiceW = null; return }
    const female = all.find((v) => /female|zira|jenny|aria|samantha|susan|hazel/i.test(v.name))
    const male = all.find((v) => v !== female && /male|david|guy|mark|daniel|alex|george/i.test(v.name))
    voiceW = female ?? all[0]
    voiceM = male ?? all.find((v) => v !== voiceW) ?? all[0]
  } catch {
    voiceM = null
    voiceW = null
  }
}

if (typeof speechSynthesis !== 'undefined') {
  refreshVoices()
  speechSynthesis.onvoiceschanged = () => {
    refreshVoices()
    listeners.forEach((cb) => cb())
  }
}

export function englishVoiceStatus(): 'ready' | 'none' | 'unknown' {
  try {
    if (voiceW) return 'ready'
    refreshVoices()
    if (voiceW) return 'ready'
    return speechSynthesis.getVoices().length ? 'none' : 'unknown'
  } catch {
    return 'none'
  }
}

export function onVoicesChanged(cb: () => void): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function speakScript(lines: ScriptLine[], opts?: { rate?: number; onEnd?: () => void }): boolean {
  if (englishVoiceStatus() === 'none') {
    opts?.onEnd?.()
    return false
  }
  try {
    speechSynthesis.cancel()
    const rate = opts?.rate ?? 0.92
    lines.forEach((line, idx) => {
      const u = new SpeechSynthesisUtterance(line.text)
      u.lang = 'en-US'
      u.rate = rate
      if (line.s === 'W') {
        if (voiceW) u.voice = voiceW
        if (!voiceW || voiceW === voiceM) u.pitch = 1.2
      } else {
        if (voiceM) u.voice = voiceM
        if (!voiceM || voiceW === voiceM) u.pitch = 0.8
      }
      if (idx === lines.length - 1 && opts?.onEnd) u.onend = opts.onEnd
      speechSynthesis.speak(u)
    })
    return true
  } catch {
    opts?.onEnd?.()
    return false
  }
}

export function speakEN(text: string, rate = 0.95): void {
  speakScript([{ s: 'W', text }], { rate })
}

export function speakLang(text: string, lang: string, rate = 0.95): void {
  try {
    const pre = lang.slice(0, 2).toLowerCase()
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(pre))
    if (!voice) return
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.voice = voice
    u.rate = rate
    speechSynthesis.speak(u)
  } catch {
  }
}

export function speakKO(text: string, rate = 0.92): void {
  speakLang(text, 'ko-KR', rate)
}


let currentAudio: HTMLAudioElement | null = null
let queueToken = 0

export function playAudioFiles(urls: string[], opts?: { onEnd?: () => void }): void {
  stopSpeak()
  const token = ++queueToken
  const step = (i: number) => {
    if (token !== queueToken) return
    if (i >= urls.length) { currentAudio = null; opts?.onEnd?.(); return }
    const a = new Audio(urls[i])
    currentAudio = a
    a.onended = () => { window.setTimeout(() => step(i + 1), 550) }
    a.onerror = () => step(i + 1)
    a.play().catch(() => step(i + 1))
  }
  step(0)
}

export function stopSpeak(): void {
  queueToken += 1
  if (currentAudio) {
    try { currentAudio.pause() } catch {  }
    currentAudio = null
  }
  try { speechSynthesis.cancel() } catch {  }
}

export const VOICE_HELP: { os: string; how: string }[] = [
  { os: 'Windows', how: 'Cài đặt (Settings) → Time & Language → Speech → Manage voices → Add voices → chọn English (United States).' },
  { os: 'Android', how: 'Cài/mở "Speech Recognition & Synthesis" (Google TTS) trên Play Store → Cài đặt giọng nói → tải dữ liệu giọng English.' },
  { os: 'iPhone / iPad / Mac', how: 'Thường có sẵn giọng tiếng Anh. Nếu thiếu: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → thêm English.' },
]
