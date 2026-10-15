import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { TYPES, filled, type Frame } from './frames'
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
  ask: (f) => `Chọn dạng đúng của động từ trong ngoặc (vế ${f.clause === 'if' ? 'có if' : 'chính'}):`,
  feedback: (f) => <>{TYPES[f.type].name}: <span lang="en">{TYPES[f.type].form}</span>.</>,
  extra: (f) => <p className="bq-rule">{TYPES[f.type].use}</p>,
  missedNote: (m) => `${TYPES[m.type].name}: ${TYPES[m.type].form}`,
  result: (f, ok) => ({ id: f.id, type: f.type, ok }),
}

export default function CondQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Câu điều kiện đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại công thức của các câu sai')}
    />
  )
}
