import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { GROUPS, ZERO, filled, type Article, type Frame } from './frames'
import type { Result } from './progress'

type Item = Frame & { shuffled: Article[] }

interface Props {
  items: Item[]
  title: string
  canHear: boolean
  onFinish: (results: Result[], pct: number) => void
  onAgain: () => void
  onBack: () => void
}

const label = (a: Article) => (a === ZERO ? 'không mạo từ' : a)

// Cách hỏi và giải thích từng câu (lượt Ôn câu sai cũng dùng)
export const view: LabView<Frame, Result> = {
  ask: () => 'Chọn mạo từ đúng cho chỗ trống ("—" nghĩa là không dùng mạo từ):',
  feedback: (f) => <>{f.why}</>,
  extra: (f) => (
    <p className="bq-rule">
      {GROUPS[f.group].name}.{f.answer === ZERO && ' Đáp án "—": bỏ trống, không thêm a, an hay the.'}
    </p>
  ),
  missedNote: (m) => `${label(m.answer)}: ${m.why}`,
  result: (f, ok) => ({ id: f.id, group: f.group, ok }),
}

export default function ArticleQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Mạo từ đã vững, giỏi lắm!' : 'Xong một lượt. Đọc lại quy tắc của các câu sai')}
    />
  )
}
