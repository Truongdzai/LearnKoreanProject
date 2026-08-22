import { useCallback, useEffect, useRef, useState } from 'react'
import { edgeAsrBase } from '@/core/asr'
import { canStreamUpload, createUploadStream, markStreamUnsupported, type UploadStream } from '@/core/asrStream'
import { createLevelMeter, openMic, SPEECH_LEVEL, type LevelMeter } from '@/core/mic'
import { wakeBackend } from '@/core/quota'
import { track } from '@/core/monitor'
import type { AsrWord } from '@/models/srs.model'

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
const SILENCE_MS = 700
const NO_SPEECH_MS = 6000
const MAX_MS = 15000
const AUDIO_BPS = 24000
const CHUNK_MS = 250

function pickMime(): string {
	if (typeof MediaRecorder === 'undefined') return ''
	return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? ''
}

export function useWhisperRecognition(lang = 'ko-KR') {
	const [supported] = useState(
		() => typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices,
	)
	const [listening, setListening] = useState(false)
	const [transcript, setTranscript] = useState('')
	const [confidence, setConfidence] = useState(0)
	const [error, setError] = useState('')
	const [level, setLevel] = useState(0)
	const [words, setWords] = useState<AsrWord[]>([])

	const recRef = useRef<MediaRecorder | null>(null)
	const chunksRef = useRef<BlobPart[]>([])
	const streamRef = useRef<MediaStream | null>(null)
	const meterRef = useRef<LevelMeter | null>(null)
	const watchRef = useRef<number | null>(null)
	const stopAtRef = useRef(0)
	const upRef = useRef<UploadStream | null>(null)

	const cleanup = useCallback(() => {
		upRef.current?.abort()
		upRef.current = null
		if (watchRef.current) { window.clearInterval(watchRef.current); watchRef.current = null }
		meterRef.current?.stop()
		meterRef.current = null
		streamRef.current?.getTracks().forEach((t) => t.stop())
		streamRef.current = null
		recRef.current = null
		setLevel(0)
	}, [])

	useEffect(() => cleanup, [cleanup])

	const consume = useCallback(
		async (res: Response, meta: { tSend: number; bytes: number; streamed: boolean }) => {
			const stoppedAt = stopAtRef.current
			try {
				const data = (await res.json()) as {
					text?: string
					detail?: string
					words?: AsrWord[]
					model?: string
					duration?: number
				}
				const tEdge = performance.now()
				track('asr_latency', {
					engine: 'edge',
					lang,
					streamed: meta.streamed,
					bytes: meta.bytes,
					tailMs: stoppedAt ? Math.round(tEdge - stoppedAt) : null,
					edgeMs: Math.round(tEdge - meta.tSend),
					model: data.model ?? null,
					ok: res.ok,
				})
				if (!res.ok) throw new Error(data.detail || `Lỗi máy chủ (${res.status})`)
				const text = (data.text ?? '').trim()
				if (!text) {
					setError('Không nghe thấy giọng nói — hãy nói to hơn hoặc lại gần micro.')
					return
				}
				setTranscript(text)
				setWords(Array.isArray(data.words) ? data.words : [])
				setConfidence(1)
			} catch (e) {
				setError(
					e instanceof Error && e.message
						? e.message
						: 'Không gửi được bản ghi âm lên máy chủ. Kiểm tra kết nối mạng.',
				)
			}
		},
		[lang],
	)

	const sendWhole = useCallback(
		async (blob: Blob) => {
			const tSend = performance.now()
			try {
				const res = await fetch(
					`${edgeAsrBase()}/cf/asr?lang=${encodeURIComponent(lang)}`,
					{ method: 'POST', body: blob, headers: { 'Content-Type': blob.type || 'audio/webm' } },
				)
				await consume(res, { tSend, bytes: blob.size, streamed: false })
			} catch {
				setError('Không gửi được bản ghi âm lên máy chủ. Kiểm tra kết nối mạng.')
			}
		},
		[lang, consume],
	)

	const stop = useCallback(() => {
		try {
			if (recRef.current?.state === 'recording') {
				stopAtRef.current = performance.now()
				recRef.current.stop()
			}
		} catch {
			setListening(false)
		}
	}, [])

	const start = useCallback(async () => {
		setError('')
		setTranscript('')
		setWords([])
		setConfidence(0)
		chunksRef.current = []

		if (!supported) {
			setError('Trình duyệt không ghi âm được. Hãy cập nhật trình duyệt rồi thử lại.')
			return
		}

		let stream: MediaStream
		try {
			stream = await openMic()
		} catch {
			setError('Bạn cần cho phép truy cập micro để luyện nói.')
			return
		}
		streamRef.current = stream

		wakeBackend()

		const mime = pickMime()
		const rec = new MediaRecorder(stream, {
			...(mime ? { mimeType: mime } : {}),
			audioBitsPerSecond: AUDIO_BPS,
		})

		const streaming = canStreamUpload()

		rec.ondataavailable = (e) => {
			if (e.data.size === 0) return
			chunksRef.current.push(e.data)
			if (!streaming) return
			if (!upRef.current) {
				upRef.current = createUploadStream(
					`${edgeAsrBase()}/cf/asr?lang=${encodeURIComponent(lang)}`,
					mime || 'audio/webm',
				)
			}
			upRef.current.push(e.data)
		}
		rec.onstop = async () => {
			setListening(false)
			const up = upRef.current
			upRef.current = null
			cleanup()
			const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' })
			if (up) {
				up.end()
				const tSend = performance.now()
				try {
					await consume(await up.response, { tSend, bytes: up.bytes(), streamed: true })
					return
				} catch {
					markStreamUnsupported()
					track('asr_stream_fallback', { lang, bytes: blob.size })
				}
			}
			if (blob.size > 0) await sendWhole(blob)
		}
		recRef.current = rec
		rec.start(streaming ? CHUNK_MS : undefined)
		setListening(true)

		const meter = createLevelMeter(stream)
		meterRef.current = meter
		const began = Date.now()
		let spokeAt = 0
		watchRef.current = window.setInterval(() => {
			const now = meter.level()
			setLevel(now)
			const elapsed = Date.now() - began
			if (now >= SPEECH_LEVEL) { spokeAt = Date.now(); return }
			const quietFor = spokeAt ? Date.now() - spokeAt : elapsed
			const limit = spokeAt ? SILENCE_MS : NO_SPEECH_MS
			if (quietFor >= limit || elapsed >= MAX_MS) stop()
		}, 100)
	}, [supported, cleanup, consume, sendWhole, stop, lang])

	const reset = useCallback(() => {
		setTranscript('')
		setWords([])
		setConfidence(0)
		setError('')
	}, [])

	return {
		supported,
		listening,
		transcript,
		words,
		alternatives: [] as string[],
		confidence,
		interim: '',
		error,
		level,
		start,
		stop,
		reset,
	}
}
