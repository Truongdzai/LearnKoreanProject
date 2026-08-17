import { useEdgeAsr } from '@/core/asr'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useWhisperRecognition } from './useWhisperRecognition'

export function useAsr(lang = 'ko-KR') {
	const browser = useSpeechRecognition(lang)
	const whisper = useWhisperRecognition(lang)
	const edge = useEdgeAsr()

	return edge && whisper.supported ? whisper : browser
}
