import BlankQuiz from '../shared/BlankQuiz'
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

export default function QuestionQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Xem lại quy tắc"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => ({ id: f.id, group: f.group, ok: oks[k] })), pct)}
      ask={(f) => (f.group === 'indirect' ? 'Chọn phần đúng để hoàn thành câu hỏi gián tiếp:' : 'Chọn câu hỏi đuôi đúng:')}
      doneTitle={(good) => (good ? 'Câu hỏi đuôi và câu hỏi gián tiếp đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại quy tắc của các câu sai')}
      missedNote={(m) => `${GROUPS[m.group].name}: ${GROUPS[m.group].form}`}
      feedback={(f) => <>{GROUPS[f.group].name}: <span lang="en">{GROUPS[f.group].form}</span>.</>}
      extra={(f) => <p className="bq-rule">{GROUPS[f.group].rule}</p>}
    />
  )
}
