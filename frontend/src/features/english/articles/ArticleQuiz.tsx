import BlankQuiz from '../shared/BlankQuiz'
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

export default function ArticleQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Xem lại quy tắc"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => ({ id: f.id, group: f.group, ok: oks[k] })), pct)}
      ask={() => 'Chọn mạo từ đúng cho chỗ trống ("—" nghĩa là không dùng mạo từ):'}
      doneTitle={(good) => (good ? 'Mạo từ đã vững, giỏi lắm!' : 'Xong một lượt. Đọc lại quy tắc của các câu sai')}
      missedNote={(m) => `${label(m.answer)}: ${m.why}`}
      feedback={(f) => <>{f.why}</>}
      extra={(f) => (
        <p className="bq-rule">
          {GROUPS[f.group].name}.{f.answer === ZERO && ' Đáp án "—": bỏ trống, không thêm a, an hay the.'}
        </p>
      )}
    />
  )
}
