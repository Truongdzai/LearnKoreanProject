import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { filled, pairOf, type Frame } from './frames'
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
  ask: (f) => `Chọn từ đúng cho chỗ trống (${pairOf(f.pair).words}):`,
  feedback: (f) => pairOf(f.pair).tip,
  missedNote: (m) => `${pairOf(m.pair).words}: ${pairOf(m.pair).tip}`,
  result: (f, ok) => ({ id: f.id, pair: f.pair, ok }),
}

export default function ConfuseQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Chọn nhóm khác"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => view.result(f, oks[k])), pct)}
      ask={view.ask}
      feedback={view.feedback}
      missedNote={view.missedNote}
      doneTitle={(good) => (good ? 'Không còn nhầm nữa — giỏi lắm!' : 'Xong một lượt — đọc lại mẹo phân biệt của các câu sai')}
    />
  )
}
