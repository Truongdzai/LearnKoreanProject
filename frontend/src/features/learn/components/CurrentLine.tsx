import type { Segment } from '@/models/lesson.model'

export default function CurrentLine({ segment }: { segment?: Segment }) {
  return (
    <div className="cur-line">
      <div className="ko" lang="ko">{segment ? segment.ko : '—'}</div>
      <div className="vi">{segment?.vi || 'Bấm một câu bên phải để bắt đầu.'}</div>
    </div>
  )
}
