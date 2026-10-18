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

// Cách hỏi và giải thích từng câu (lượt Ôn câu sai cũng dùng)
export const view: LabView<Frame, Result> = {
  ask: () => 'Chọn từ nối (hoặc cách viết) đúng cho chỗ trống:',
  feedback: (f) => <>{f.why}</>,
  extra: (f) => <p className="bq-rule">{GROUPS[f.group].name}: <span lang="en">{GROUPS[f.group].form}</span></p>,
  missedNote: (m) => m.why,
  result: (f, ok) => ({ id: f.id, group: f.group, ok }),
}

export default function LinkerQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Từ nối đã vững, giỏi lắm!' : 'Xong một lượt. Đọc lại giải thích của các câu sai')}
    />
  )
}
