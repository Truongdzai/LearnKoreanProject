import BlankQuiz from '../shared/BlankQuiz'
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

export default function TenseQuiz({ items, onFinish, ...rest }: Props) {
  return (
    <BlankQuiz
      {...rest}
      items={items}
      filled={filled}
      backLabel="Chọn nhóm khác"
      onFinish={(oks, pct) => onFinish(items.map((f, k) => ({ id: f.id, tense: f.tense, ok: oks[k] })), pct)}
      ask={() => 'Chọn dạng đúng của động từ trong ngoặc:'}
      doneTitle={(good) => (good ? 'Nhìn dấu hiệu là ra thì — giỏi lắm!' : 'Xong một lượt — xem lại dấu hiệu của các câu sai')}
      missedNote={(m) => `${TENSES[m.tense].name} · dấu hiệu: ${m.signal}`}
      feedback={(f) => (
        <>
          Dấu hiệu <span className="bq-strong" lang={/^[\x20-\x7E…]+$/.test(f.signal) ? 'en' : undefined}>{f.signal}</span> → <b>{TENSES[f.tense].name}</b>.
        </>
      )}
      extra={(f) => <p className="bq-rule">{TENSES[f.tense].rule}</p>}
    />
  )
}
