import Icon, { type IconName } from '@/core/components/Icon'
import type { LearnTab } from '@/core/constants/enum'

type SoonTab = Exclude<LearnTab, 'shadowing'>

const SOON: Record<SoonTab, { ic: IconName; h: string; p: string; phase: string }> = {
  phatam: { ic: 'mic', h: 'Luyện phát âm', p: 'Nói từng câu vào micro, AI sẽ chấm điểm phát âm, độ chính xác, độ trôi chảy và độ hoàn thiện.', phase: 'Phase 2 · dùng Whisper' },
  chepchinhta: { ic: 'headphones', h: 'Chép chính tả', p: 'Nghe từng câu rồi gõ lại để luyện kỹ năng nghe và chính tả tiếng Hàn.', phase: 'Phase 2' },
  tomtat: { ic: 'note', h: 'Tóm tắt & luyện tập', p: 'AI tóm tắt video, tạo quiz, sơ đồ tư duy và bảng cụm câu / ngữ pháp hữu ích.', phase: 'Phase 3 · Gemini đã sẵn sàng' },
}

export default function ComingSoon({ tab }: { tab: SoonTab }) {
  const x = SOON[tab]
  return (
    <div className="soon">
      <div className="big"><Icon name={x.ic} /></div>
      <h3>{x.h}</h3>
      <p>{x.p}</p>
      <span className="phase"><Icon name="clock" size={13} /> {x.phase}</span>
    </div>
  )
}
