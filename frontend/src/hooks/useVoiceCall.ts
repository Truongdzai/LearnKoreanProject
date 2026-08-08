import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchIceConfig, fetchSignals, sendSignal, type RoomSignal } from '@/core/api/rooms.api'

const POLL_MS = 1000
const LEVEL_MS = 200
const SPEAK_GATE = 0.045

export type PeerPhase = 'connecting' | 'live' | 'lost'
export type CallError = { code: 'denied' | 'nomic' | 'other'; text: string }

function micError(e: unknown): CallError {
  const name = (e as DOMException)?.name || ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return { code: 'denied', text: '' }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return { code: 'nomic', text: '' }
  return { code: 'other', text: (e as Error)?.message || '' }
}

export interface CallPeer {
  id: string
  phase: PeerPhase
  speaking: boolean
}

interface Wire {
  pc: RTCPeerConnection
  stream: MediaStream
  polite: boolean
  queued: RTCIceCandidateInit[]
}

interface Meter {
  ctx: AudioContext
  analyser: AnalyserNode
  data: Uint8Array<ArrayBuffer>
}

function rms(meter: Meter): number {
  meter.analyser.getByteTimeDomainData(meter.data)
  let sum = 0
  for (let i = 0; i < meter.data.length; i++) {
    const v = (meter.data[i] - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / meter.data.length)
}

export function useVoiceCall(roomId: string, meId: string, memberIds: string[]) {
  const [active, setActive] = useState(false)
  const [muted, setMuted] = useState(false)
  const [peers, setPeers] = useState<CallPeer[]>([])
  const [mySpeaking, setMySpeaking] = useState(false)
  const [error, setError] = useState<CallError | null>(null)
  const [starting, setStarting] = useState(false)

  const local = useRef<MediaStream | null>(null)
  const wires = useRef(new Map<string, Wire>())
  const meters = useRef(new Map<string, Meter>())
  const ice = useRef<RTCIceServer[]>([])
  const after = useRef(0)
  const on = useRef(false)
  const members = useRef<string[]>(memberIds)
  members.current = memberIds

  const secure = typeof window !== 'undefined' && window.isSecureContext
  const supported = typeof RTCPeerConnection !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const publish = useCallback(() => {
    setPeers(
      [...wires.current.entries()].map(([id, w]) => ({
        id,
        phase: w.pc.connectionState === 'connected'
          ? 'live'
          : w.pc.connectionState === 'failed' || w.pc.connectionState === 'closed' ? 'lost' : 'connecting',
        speaking: false,
      })),
    )
  }, [])

  const meterFor = useCallback((id: string, stream: MediaStream) => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      meters.current.set(id, { ctx, analyser, data: new Uint8Array(analyser.fftSize) })
    } catch { }
  }, [])

  const dropPeer = useCallback((id: string) => {
    const w = wires.current.get(id)
    if (w) {
      w.pc.onicecandidate = null
      w.pc.ontrack = null
      w.pc.onconnectionstatechange = null
      w.pc.close()
      wires.current.delete(id)
    }
    const m = meters.current.get(id)
    if (m) { m.ctx.close().catch(() => { }); meters.current.delete(id) }
    publish()
  }, [publish])

  const wireFor = useCallback((id: string): Wire => {
    const found = wires.current.get(id)
    if (found) return found

    const pc = new RTCPeerConnection({ iceServers: ice.current })
    const stream = new MediaStream()
    const wire: Wire = { pc, stream, polite: meId > id, queued: [] }
    wires.current.set(id, wire)

    local.current?.getTracks().forEach((tr) => pc.addTrack(tr, local.current as MediaStream))

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(roomId, id, 'ice', JSON.stringify(e.candidate)).catch(() => { })
    }
    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((tr) => stream.addTrack(tr))
      if (!meters.current.has(id)) meterFor(id, stream)
      publish()
    }
    pc.onconnectionstatechange = () => publish()
    publish()
    return wire
  }, [meId, roomId, meterFor, publish])

  const offerTo = useCallback(async (id: string) => {
    const wire = wireFor(id)
    if (wire.polite || wire.pc.signalingState !== 'stable') return
    try {
      const offer = await wire.pc.createOffer()
      await wire.pc.setLocalDescription(offer)
      await sendSignal(roomId, id, 'offer', JSON.stringify(offer))
    } catch { }
  }, [roomId, wireFor])

  const digest = useCallback(async (sig: RoomSignal) => {
    if (sig.kind === 'bye') { dropPeer(sig.from); return }
    const wire = wireFor(sig.from)
    let data: RTCSessionDescriptionInit | RTCIceCandidateInit
    try { data = JSON.parse(sig.payload) } catch { return }

    try {
      if (sig.kind === 'offer') {
        await wire.pc.setRemoteDescription(data as RTCSessionDescriptionInit)
        for (const c of wire.queued.splice(0)) await wire.pc.addIceCandidate(c).catch(() => { })
        const answer = await wire.pc.createAnswer()
        await wire.pc.setLocalDescription(answer)
        await sendSignal(roomId, sig.from, 'answer', JSON.stringify(answer))
      } else if (sig.kind === 'answer') {
        if (wire.pc.signalingState !== 'have-local-offer') return
        await wire.pc.setRemoteDescription(data as RTCSessionDescriptionInit)
        for (const c of wire.queued.splice(0)) await wire.pc.addIceCandidate(c).catch(() => { })
      } else if (sig.kind === 'ice') {
        if (wire.pc.remoteDescription) await wire.pc.addIceCandidate(data as RTCIceCandidateInit).catch(() => { })
        else wire.queued.push(data as RTCIceCandidateInit)
      }
    } catch { }
  }, [dropPeer, roomId, wireFor])

  const hangUp = useCallback(() => {
    on.current = false
    for (const id of [...wires.current.keys()]) {
      sendSignal(roomId, id, 'bye', '1').catch(() => { })
      dropPeer(id)
    }
    const mine = meters.current.get(meId)
    if (mine) { mine.ctx.close().catch(() => { }); meters.current.delete(meId) }
    local.current?.getTracks().forEach((tr) => tr.stop())
    local.current = null
    setActive(false)
    setMuted(false)
    setMySpeaking(false)
    setPeers([])
  }, [dropPeer, meId, roomId])

  const call = useCallback(async () => {
    if (!supported || on.current) return
    setStarting(true); setError(null)
    try {
      const cfg = await fetchIceConfig().catch(() => ({ iceServers: [] as RTCIceServer[], relay: false }))
      ice.current = cfg.iceServers
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      })
      local.current = stream
      meterFor(meId, stream)
      after.current = 0
      on.current = true
      setActive(true)
      for (const id of members.current) if (id !== meId) offerTo(id)
    } catch (e) {
      setError(micError(e))
    } finally {
      setStarting(false)
    }
  }, [meId, meterFor, offerTo, supported])

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => {
      fetchSignals(roomId, after.current)
        .then(async ({ signals }) => {
          if (!on.current) return
          for (const sig of signals) {
            after.current = Math.max(after.current, sig.id)
            await digest(sig)
          }
          for (const id of members.current) {
            if (id !== meId && !wires.current.has(id)) offerTo(id)
          }
          for (const id of [...wires.current.keys()]) {
            if (!members.current.includes(id)) dropPeer(id)
          }
        })
        .catch(() => { })
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [active, roomId, meId, digest, offerTo, dropPeer])

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => {
      const mine = meters.current.get(meId)
      setMySpeaking(!!mine && !muted && rms(mine) > SPEAK_GATE)
      setPeers((prev) => prev.map((p) => {
        const m = meters.current.get(p.id)
        return { ...p, speaking: !!m && rms(m) > SPEAK_GATE }
      }))
    }, LEVEL_MS)
    return () => window.clearInterval(timer)
  }, [active, meId, muted])

  useEffect(() => () => { if (on.current) hangUp() }, [hangUp])

  const toggleMute = useCallback(() => {
    const next = !muted
    local.current?.getAudioTracks().forEach((tr) => { tr.enabled = !next })
    setMuted(next)
  }, [muted])

  const streamOf = useCallback((id: string) => wires.current.get(id)?.stream || null, [])

  return { supported, secure, active, starting, muted, peers, mySpeaking, error, call, hangUp, toggleMute, streamOf }
}
