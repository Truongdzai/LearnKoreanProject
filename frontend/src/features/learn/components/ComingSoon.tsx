import Icon, { type IconName } from '@/core/components/Icon'
import type { LearnTab } from '@/core/constants/enum'

type SoonTab = Exclude<LearnTab, 'shadowing'>

const SOON: Record<SoonTab, { ic: IconName; h: string; p: string; phase: string }> = {
  phatam: { ic: 'mic', h: 'Luyện phát âm', p: 'Nói từng câu vào micro, AI sẽ chấm điểm phát âm, độ chính xác, độ trôi chảy và độ hoàn thiện.', phase: 'Phase 2 · dùng Whisper' },
  chepchinhta: { ic: 'headphones', h: 'Chép chính tả', p: 'Nghe từng câu rồi gõ lại để luyện kỹ năng nghe và chính tả tiếng Hàn.', phase: 'Phase 2' },
  luyendich: { ic: 'globe', h: 'Luyện dịch', p: 'Tự dịch từng câu sang tiếng Việt rồi đối chiếu với đáp án.', phase: 'Đã có' },
  tomtat: { ic: 'note', h: 'Tóm tắt & luyện tập', p: 'AI tóm tắt video: tổng quan, mục tiêu, ngữ pháp, từ vựng, cụm nói hữu ích và gợi ý luyện tập.', phase: 'Phase 3 · Gemini đã sẵn sàng' },
  dubbing: { ic: 'mic', h: 'Dubbing Studio — Lồng tiếng nhập vai', p: 'Tắt tiếng một nhân vật trong video và tự lồng tiếng. AI chấm phát âm, nhịp điệu & độ trễ rồi xuất video để chia sẻ.', phase: 'Phase 4 · sắp ra mắt' },
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
