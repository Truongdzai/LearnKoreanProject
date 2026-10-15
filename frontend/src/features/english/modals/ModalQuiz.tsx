import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { GROUPS, filled, type Frame, type ModalGroup } from './frames'
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

// Câu hỏi theo nhóm: nhóm dạng động từ hỏi theo gợi ý trong ngoặc, các nhóm còn lại dựa vào nghĩa câu tiếng Việt
const ASK: Record<ModalGroup, string> = {
  form: 'Chọn dạng đúng của động từ trong ngoặc:',
  must: 'Chọn từ khớp nghĩa câu tiếng Việt (phải, không được hay không cần):',
  advice: 'Chọn từ khớp nghĩa câu tiếng Việt (nên hay biết, có thể):',
  deduce: 'Chọn cách suy đoán khớp mức chắc chắn trong câu tiếng Việt:',
}

// Cách hỏi và giải thích từng câu (lượt Ôn câu sai cũng dùng)
export const view: LabView<Frame, Result> = {
  ask: (f) => ASK[f.group],
  feedback: (f) => <>{f.why}</>,
  extra: (f) => <p className="bq-rule">{GROUPS[f.group].name}: {GROUPS[f.group].tip}</p>,
  missedNote: (m) => `${m.answer}: ${m.why}`,
  result: (f, ok) => ({ id: f.id, group: f.group, ok }),
}

export default function ModalQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Động từ khuyết thiếu đã vững — giỏi lắm!' : 'Xong một lượt — đọc lại giải thích của các câu sai')}
    />
  )
}
