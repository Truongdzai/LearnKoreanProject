import BlankQuiz from '../shared/BlankQuiz'
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

export default function CompareQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Xem lại quy tắc"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => ({ id: f.id, kind: f.kind, ok: oks[k] })), pct)}
      ask={(f) => (f.degree === 'comp' ? 'Chọn dạng so sánh hơn của tính từ trong ngoặc:' : 'Chọn dạng so sánh nhất của tính từ trong ngoặc:')}
      doneTitle={(good) => (good ? 'So sánh chuẩn rồi — giỏi lắm!' : 'Xong một lượt — đọc lại ba dạng của các tính từ sai')}
      missedNote={(m) => formsOf(m.adj)}
      feedback={(f) => <>{KIND_INFO[f.kind].name}: <span lang="en">{formsOf(f.adj)}</span>.</>}
      extra={(f) => <p className="bq-rule">{KIND_INFO[f.kind].rule}</p>}
    />
  )
}
