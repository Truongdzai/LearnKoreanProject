import Icon from '@/core/components/Icon'
import { accentStatus, speakAccent, type Accent } from '@/core/tts'

interface Props {
  text: string
  accent: Accent
  ipa?: string
  rate?: number
  compact?: boolean
}

const NAME: Record<Accent, string> = { us: 'US', uk: 'UK' }

export default function AudioBtn({ text, accent, ipa, rate = 0.9, compact }: Props) {
  const status = accentStatus(accent)
  const title = status === 'exact'
    ? `Nghe giọng ${NAME[accent]}`
    : status === 'fallback'
      ? `Máy chưa có giọng ${NAME[accent]} — đang dùng giọng tiếng Anh gần nhất`
      : 'Máy chưa cài giọng tiếng Anh'

  return (
    <span className={'vl-audio' + (compact ? ' sm' : '') + (status === 'none' ? ' off' : '')}>
      <b>{NAME[accent]}:</b>
      {ipa && <i>{ipa}</i>}
      <button
        type="button"
        title={title}
        disabled={status === 'none'}
        onClick={(e) => { e.stopPropagation(); speakAccent(text, accent, rate) }}
      >
        <Icon name="volume" size={compact ? 13 : 15} />
      </button>
    </span>
  )
}
