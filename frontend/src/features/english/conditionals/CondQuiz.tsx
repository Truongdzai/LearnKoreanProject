import BlankQuiz from '../shared/BlankQuiz'
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

export default function CondQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Xem lại quy tắc"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => ({ id: f.id, type: f.type, ok: oks[k] })), pct)}
      ask={(f) => `Chọn dạng đúng của động từ trong ngoặc (vế ${f.clause === 'if' ? 'có if' : 'chính'}):`}
      doneTitle={(good) => (good ? 'Câu điều kiện đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại công thức của các câu sai')}
      missedNote={(m) => `${TYPES[m.type].name}: ${TYPES[m.type].form}`}
      feedback={(f) => <>{TYPES[f.type].name}: <span lang="en">{TYPES[f.type].form}</span>.</>}
      extra={(f) => <p className="bq-rule">{TYPES[f.type].use}</p>}
    />
  )
}
