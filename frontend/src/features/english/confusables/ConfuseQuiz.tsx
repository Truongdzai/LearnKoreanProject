import BlankQuiz from '../shared/BlankQuiz'
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

export default function ConfuseQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Chọn nhóm khác"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => ({ id: f.id, pair: f.pair, ok: oks[k] })), pct)}
      ask={(f) => `Chọn từ đúng cho chỗ trống (${pairOf(f.pair).words}):`}
      doneTitle={(good) => (good ? 'Không còn nhầm nữa — giỏi lắm!' : 'Xong một lượt — đọc lại mẹo phân biệt của các câu sai')}
      missedNote={(m) => `${pairOf(m.pair).words}: ${pairOf(m.pair).tip}`}
      feedback={(f) => pairOf(f.pair).tip}
    />
  )
}
