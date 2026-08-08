export interface PitchPoint {
  t: number
  st: number | null
}

export interface Pause {
  at: number
  len: number
}

export interface ProsodyReport {
  speechSec: number
  refSec: number
  tempoRatio: number
  pauses: Pause[]
  points: PitchPoint[]
  medianHz: number
  rangeSt: number
  endSt: number
  energyVar: number
  voicedRatio: number
}

const SR = 16000
const WIN = 640
const HOP = 320
const MIN_HZ = 70
const MAX_HZ = 400
const PAUSE_SEC = 0.18

function pct(sorted: number[], p: number): number {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)))
  return sorted[idx]
}

function toMono(buf: AudioBuffer): Float32Array {
  const n = buf.length
  const out = new Float32Array(n)
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const ch = buf.getChannelData(c)
    for (let k = 0; k < n; k++) out[k] += ch[k]
  }
  if (buf.numberOfChannels > 1) {
    for (let k = 0; k < n; k++) out[k] /= buf.numberOfChannels
  }
  return out
}

function resample(x: Float32Array, from: number): Float32Array {
  if (Math.abs(from - SR) < 1) return x
  const ratio = from / SR
  const n = Math.floor(x.length / ratio)
  const out = new Float32Array(n)
  for (let k = 0; k < n; k++) {
    const a = k * ratio
    const i0 = Math.floor(a)
    const i1 = Math.min(x.length - 1, i0 + 1)
    const f = a - i0
    out[k] = x[i0] * (1 - f) + x[i1] * f
  }
  return out
}

function pitchAt(x: Float32Array, start: number): number {
  const maxLag = Math.floor(SR / MIN_HZ)
  const minLag = Math.floor(SR / MAX_HZ)
  if (start + WIN + maxLag > x.length) return 0

  let mean = 0
  for (let k = 0; k < WIN; k++) mean += x[start + k]
  mean /= WIN

  let e0 = 0
  for (let k = 0; k < WIN; k++) {
    const v = x[start + k] - mean
    e0 += v * v
  }
  if (e0 < 1e-7) return 0

  const norm = new Float32Array(maxLag + 2)
  let best = 0
  for (let lag = minLag; lag <= maxLag; lag++) {
    let num = 0
    let e1 = 0
    for (let k = 0; k < WIN; k++) {
      const a = x[start + k] - mean
      const b = x[start + k + lag] - mean
      num += a * b
      e1 += b * b
    }
    const v = e1 > 1e-9 ? num / Math.sqrt(e0 * e1) : 0
    norm[lag] = v
    if (v > best) best = v
  }
  if (best < 0.34) return 0

  const want = best * 0.88
  let pick = 0
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (norm[lag] >= want && norm[lag] > norm[lag - 1] && norm[lag] >= norm[lag + 1]) { pick = lag; break }
  }
  if (!pick) return 0

  let lag = pick
  const den = norm[pick - 1] - 2 * norm[pick] + norm[pick + 1]
  if (Math.abs(den) > 1e-9) lag = pick + (0.5 * (norm[pick - 1] - norm[pick + 1])) / den

  const hz = SR / lag
  return hz >= MIN_HZ && hz <= MAX_HZ ? hz : 0
}

function medianSmooth(track: (number | null)[]): (number | null)[] {
  return track.map((v, k) => {
    if (v == null) return null
    const a = track[k - 1]
    const b = track[k + 1]
    if (a == null || b == null) return v
    return [a, v, b].sort((p, q) => p - q)[1]
  })
}

function slopeSt(points: { t: number; st: number }[]): number {
  if (points.length < 3) return 0
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const p of points) {
    sx += p.t; sy += p.st; sxx += p.t * p.t; sxy += p.t * p.st
  }
  const n = points.length
  const den = n * sxx - sx * sx
  if (Math.abs(den) < 1e-9) return 0
  const slope = (n * sxy - sx * sy) / den
  const span = points[points.length - 1].t - points[0].t
  return slope * Math.max(0.1, span)
}

export async function analyzeClip(dataUrl: string, refSec: number): Promise<ProsodyReport | null> {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor || !dataUrl) return null

  let raw: Float32Array
  let rate: number
  const ctx = new Ctor()
  try {
    const bytes = await (await fetch(dataUrl)).arrayBuffer()
    const buf = await ctx.decodeAudioData(bytes)
    raw = toMono(buf)
    rate = buf.sampleRate
  } catch {
    return null
  } finally {
    void ctx.close()
  }

  const x = resample(raw, rate)
  const frames = Math.floor((x.length - WIN) / HOP)
  if (frames < 8) return null

  const rms = new Float32Array(frames)
  for (let f = 0; f < frames; f++) {
    let s = 0
    for (let k = 0; k < WIN; k++) {
      const v = x[f * HOP + k]
      s += v * v
    }
    rms[f] = Math.sqrt(s / WIN)
  }

  const sorted = Array.from(rms).sort((a, b) => a - b)
  const floor = pct(sorted, 0.15)
  const peak = pct(sorted, 0.95)
  if (peak < 0.008) return null
  const thr = Math.max(floor + (peak - floor) * 0.18, peak * 0.08)

  const loud: boolean[] = []
  for (let f = 0; f < frames; f++) loud.push(rms[f] >= thr)

  const first = loud.indexOf(true)
  const last = loud.lastIndexOf(true)
  if (first < 0 || last - first < 6) return null

  const secOf = (f: number) => (f * HOP) / SR
  const speechSec = secOf(last) - secOf(first)

  const pauses: Pause[] = []
  let run = 0
  for (let f = first; f <= last; f++) {
    if (!loud[f]) { run++; continue }
    if (run > 0) {
      const len = (run * HOP) / SR
      if (len >= PAUSE_SEC) pauses.push({ at: secOf(f - run) - secOf(first), len })
      run = 0
    }
  }

  const rawHz: (number | null)[] = []
  for (let f = first; f <= last; f++) {
    rawHz.push(loud[f] ? pitchAt(x, f * HOP) || null : null)
  }
  const hz = medianSmooth(rawHz)

  const voiced = hz.filter((v): v is number => v != null && v > 0)
  if (voiced.length < 5) return null
  const vSorted = [...voiced].sort((a, b) => a - b)
  const medianHz = pct(vSorted, 0.5)

  const points: PitchPoint[] = hz.map((v, k) => ({
    t: (k * HOP) / SR,
    st: v ? 12 * Math.log2(v / medianHz) : null,
  }))

  const stSorted = voiced.map((v) => 12 * Math.log2(v / medianHz)).sort((a, b) => a - b)
  const rangeSt = pct(stSorted, 0.9) - pct(stSorted, 0.1)

  const tail = points
    .filter((p): p is { t: number; st: number } => p.st != null && p.t >= speechSec - 0.55)
  const endSt = slopeSt(tail)

  const voicedRms: number[] = []
  for (let f = first; f <= last; f++) if (loud[f]) voicedRms.push(rms[f])
  const rSorted = [...voicedRms].sort((a, b) => a - b)
  const hi = pct(rSorted, 0.9)
  const energyVar = hi > 0 ? (hi - pct(rSorted, 0.2)) / hi : 0

  return {
    speechSec,
    refSec,
    tempoRatio: refSec > 0.2 ? speechSec / refSec : 1,
    pauses,
    points,
    medianHz,
    rangeSt,
    endSt,
    energyVar,
    voicedRatio: voiced.length / Math.max(1, hz.length),
  }
}
