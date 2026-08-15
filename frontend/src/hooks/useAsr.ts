import { env } from '@/config/env'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useWhisperRecognition } from './useWhisperRecognition'

export const whisperEnabled = !!env.agentBase

export function useAsr(lang = 'ko-KR') {
	const browser = useSpeechRecognition(lang)
	const whisper = useWhisperRecognition(lang)

	return whisperEnabled && whisper.supported ? whisper : browser
}
