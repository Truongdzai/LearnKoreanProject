import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { GROUPS, filled, type Frame } from './frames'
import type { Result } from './progress'

type Item = Frame & { shuffled: string[] }

interface Props {
  items: Item[]
  title: string
  canHear: boolean
  onFinish: (results: Result[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

// Nhóm few / little: nghĩa tích cực hay tiêu cực nằm ở câu tiếng Việt, nên nhắc người học đọc kỹ
const askFor = (f: Frame) => {
  if (f.group === 'count') return 'Chọn dạng danh từ đúng cho chỗ trống:'
  if (f.group === 'few') return 'Chọn từ đúng. Đọc kỹ câu tiếng Việt: "vài, một ít" hay "hầu như không"?'
  return 'Chọn lượng từ đúng cho chỗ trống:'
}

// Cách hỏi và giải thích từng câu (lượt Ôn câu sai cũng dùng)
export const view: LabView<Frame, Result> = {
  ask: askFor,
  feedback: (f) => <>{f.why}</>,
  extra: (f) => <p className="bq-rule">{GROUPS[f.group].brief}</p>,
  missedNote: (m) => `${m.answer}: ${m.why}`,
  result: (f, ok) => ({ id: f.id, group: f.group, ok }),
}

export default function QuantityQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Xem lại quy tắc"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => view.result(f, oks[k])), pct)}
      ask={view.ask}
      feedback={view.feedback}
      extra={view.extra}
      missedNote={view.missedNote}
      doneTitle={(good) => (good ? 'Số nhiều và lượng từ đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại quy tắc của các câu sai')}
    />
  )
}
