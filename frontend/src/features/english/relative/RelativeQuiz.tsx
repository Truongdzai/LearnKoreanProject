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
  ask: () => 'Chọn đại từ / trạng từ quan hệ đúng cho chỗ trống:',
  feedback: (f) => <>{GROUPS[f.group].name}: {GROUPS[f.group].form}.</>,
  extra: (f) => <p className="bq-rule">{GROUPS[f.group].rule}</p>,
  missedNote: (m) => `${GROUPS[m.group].name}: ${GROUPS[m.group].form}`,
  result: (f, ok) => ({ id: f.id, group: f.group, ok }),
}

export default function RelativeQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Mệnh đề quan hệ đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại quy tắc của các câu sai')}
    />
  )
}
