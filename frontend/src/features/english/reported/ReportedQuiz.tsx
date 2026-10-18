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
  ask: (f) => GROUPS[f.group].ask,
  feedback: (f) => <>{f.why}</>,
  extra: (f) => <p className="bq-rule">{GROUPS[f.group].name}: <span lang="en">{GROUPS[f.group].form}</span></p>,
  missedNote: (m) => `${m.answer}: ${m.why}`,
  result: (f, ok) => ({ id: f.id, group: f.group, ok }),
}

export default function ReportedQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Câu tường thuật đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại quy tắc của các câu sai')}
    />
  )
}
