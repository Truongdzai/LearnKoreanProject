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

export default function RelativeQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Xem lại quy tắc"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => ({ id: f.id, group: f.group, ok: oks[k] })), pct)}
      ask={() => 'Chọn đại từ / trạng từ quan hệ đúng cho chỗ trống:'}
      doneTitle={(good) => (good ? 'Mệnh đề quan hệ đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại quy tắc của các câu sai')}
      missedNote={(m) => `${GROUPS[m.group].name}: ${GROUPS[m.group].form}`}
      feedback={(f) => <>{GROUPS[f.group].name}: {GROUPS[f.group].form}.</>}
      extra={(f) => <p className="bq-rule">{GROUPS[f.group].rule}</p>}
    />
  )
}
