import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { TENSES, filled, type Frame } from './frames'
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
  ask: () => 'Chọn dạng đúng của động từ trong ngoặc:',
  feedback: (f) => (
    <>
      Dấu hiệu <span className="bq-strong" lang={/^[\x20-\x7E…]+$/.test(f.signal) ? 'en' : undefined}>{f.signal}</span> → <b>{TENSES[f.tense].name}</b>.
    </>
  ),
  extra: (f) => <p className="bq-rule">{TENSES[f.tense].rule}</p>,
  missedNote: (m) => `${TENSES[m.tense].name} · dấu hiệu: ${m.signal}`,
  result: (f, ok) => ({ id: f.id, tense: f.tense, ok }),
}

export default function TenseQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Chọn nhóm khác"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => view.result(f, oks[k])), pct)}
      ask={view.ask}
      feedback={view.feedback}
      extra={view.extra}
      missedNote={view.missedNote}
      doneTitle={(good) => (good ? 'Nhìn dấu hiệu là ra thì — giỏi lắm!' : 'Xong một lượt — xem lại dấu hiệu của các câu sai')}
    />
  )
}
