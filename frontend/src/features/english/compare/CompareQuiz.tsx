import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { KIND_INFO, filled, formsOf, type Frame } from './frames'
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
  ask: (f) => (f.degree === 'comp' ? 'Chọn dạng so sánh hơn của tính từ trong ngoặc:' : 'Chọn dạng so sánh nhất của tính từ trong ngoặc:'),
  feedback: (f) => <>{KIND_INFO[f.kind].name}: <span lang="en">{formsOf(f.adj)}</span>.</>,
  extra: (f) => <p className="bq-rule">{KIND_INFO[f.kind].rule}</p>,
  missedNote: (m) => formsOf(m.adj),
  result: (f, ok) => ({ id: f.id, kind: f.kind, ok }),
}

export default function CompareQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'So sánh chuẩn rồi — giỏi lắm!' : 'Xong một lượt — đọc lại ba dạng của các tính từ sai')}
    />
  )
}
