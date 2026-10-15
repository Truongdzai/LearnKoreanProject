import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { FORMS, filled, type Frame } from './frames'
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
  ask: () => 'Chọn dạng bị động đúng của động từ trong ngoặc:',
  feedback: (f) => <>{FORMS[f.tense].name}: <span lang="en">{FORMS[f.tense].form}</span>.</>,
  extra: () => <p className="bq-rule">Bị động = be (chia theo thì) + V3; người làm (nếu cần) đứng sau by.</p>,
  missedNote: (m) => `${FORMS[m.tense].name}: ${FORMS[m.tense].form}`,
  result: (f, ok) => ({ id: f.id, tense: f.tense, ok }),
}

export default function PassiveQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Câu bị động đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại công thức của các câu sai')}
    />
  )
}
