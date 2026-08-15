const LANG: Record<string, string> = {
	ko: 'ko', 'ko-KR': 'ko',
	en: 'en', 'en-US': 'en', 'en-GB': 'en',
	zh: 'zh', 'zh-CN': 'zh',
	ja: 'ja', 'ja-JP': 'ja',
	vi: 'vi', 'vi-VN': 'vi',
	de: 'de', 'de-DE': 'de',
}

const MAX_BYTES = 8 * 1024 * 1024

export interface AsrResult {
	text: string
	words?: { word: string; start: number; end: number }[]
	language?: string
	duration?: number
}

function toBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer)
	let binary = ''
	const STEP = 0x8000
	for (let i = 0; i < bytes.length; i += STEP) {
		binary += String.fromCharCode(...bytes.subarray(i, i + STEP))
	}
	return btoa(binary)
}

export async function transcribe(
	env: Env,
	audio: ArrayBuffer,
	lang: string,
): Promise<AsrResult> {
	if (audio.byteLength === 0) throw new Error('Không nhận được dữ liệu âm thanh.')
	if (audio.byteLength > MAX_BYTES) {
		throw new Error(`Đoạn ghi âm quá dài (tối đa ${MAX_BYTES / 1024 / 1024} MB).`)
	}

	const result = (await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
		audio: toBase64(audio),
		task: 'transcribe',
		language: LANG[lang] ?? 'en',
		vad_filter: true,
		condition_on_previous_text: false,
	})) as {
		text?: string
		words?: { word: string; start: number; end: number }[]
		transcription_info?: { language?: string; duration?: number }
	}

	return {
		text: (result.text ?? '').trim(),
		words: result.words,
		language: result.transcription_info?.language,
		duration: result.transcription_info?.duration,
	}
}
