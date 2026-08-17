import { useCallback, useEffect, useRef, useState } from 'react'
import { edgeAsrBase } from '@/core/asr'
import { createLevelMeter, openMic, SPEECH_LEVEL, type LevelMeter } from '@/core/mic'

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
const SILENCE_MS = 1200
const NO_SPEECH_MS = 6000
const MAX_MS = 15000

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

	const recRef = useRef<MediaRecorder | null>(null)
	const chunksRef = useRef<BlobPart[]>([])
	const streamRef = useRef<MediaStream | null>(null)
	const meterRef = useRef<LevelMeter | null>(null)
	const watchRef = useRef<number | null>(null)

	const cleanup = useCallback(() => {
		if (watchRef.current) { window.clearInterval(watchRef.current); watchRef.current = null }
		meterRef.current?.stop()
		meterRef.current = null
		streamRef.current?.getTracks().forEach((t) => t.stop())
		streamRef.current = null
		recRef.current = null
		setLevel(0)
	}, [])

	useEffect(() => cleanup, [cleanup])

	const send = useCallback(
		async (blob: Blob) => {
			try {
				const res = await fetch(
					`${edgeAsrBase()}/cf/asr?lang=${encodeURIComponent(lang)}`,
					{ method: 'POST', body: blob, headers: { 'Content-Type': blob.type || 'audio/webm' } },
				)
				const data = (await res.json()) as { text?: string; detail?: string }
				if (!res.ok) throw new Error(data.detail || `Lỗi máy chủ (${res.status})`)
				const text = (data.text ?? '').trim()
				if (!text) {
					setError('Không nghe thấy giọng nói — hãy nói to hơn hoặc lại gần micro.')
					return
				}
				setTranscript(text)
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

	const stop = useCallback(() => {
		try {
			if (recRef.current?.state === 'recording') recRef.current.stop()
		} catch {
			setListening(false)
		}
	}, [])

	const start = useCallback(async () => {
		setError('')
		setTranscript('')
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

		const mime = pickMime()
		const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
		rec.ondataavailable = (e) => {
			if (e.data.size > 0) chunksRef.current.push(e.data)
		}
		rec.onstop = async () => {
			setListening(false)
			const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' })
			cleanup()
			if (blob.size > 0) await send(blob)
		}
		recRef.current = rec
		rec.start()
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
	}, [supported, cleanup, send, stop])

	const reset = useCallback(() => {
		setTranscript('')
		setConfidence(0)
		setError('')
	}, [])

	return {
		supported,
		listening,
		transcript,
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
