export const MIC_AUDIO: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 1,
}

export async function openMic(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: MIC_AUDIO })
}

export interface LevelMeter {
  level: () => number
  stop: () => void
}

export function createLevelMeter(stream: MediaStream): LevelMeter {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return { level: () => 0, stop: () => {} }

  const ctx = new Ctx()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  source.connect(analyser)
  const buf = new Float32Array(analyser.fftSize)

  return {
    level: () => {
      analyser.getFloatTimeDomainData(buf)
      let sum = 0
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
      const rms = Math.sqrt(sum / buf.length)
      return Math.min(1, Math.sqrt(rms) * 2.2)
    },
    stop: () => { try { void ctx.close() } catch {} },
  }
}

export const SPEECH_LEVEL = 0.14
