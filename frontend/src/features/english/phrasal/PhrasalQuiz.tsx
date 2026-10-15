import BlankQuiz from '../shared/BlankQuiz'
import type { LabView } from '../shared/labView'
import { GROUPS, VERBS, filled, type Frame } from './frames'
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

// Câu về vị trí tân ngữ: nhắc cụm này tách được hay không; câu chọn nghĩa: nhắc quy tắc của nhóm
const note = (f: Frame) => {
  if (f.group !== 'object') return GROUPS[f.group].rule
  return VERBS[f.verb].sep
    ? `${f.verb} tách được: đại từ (it, them, me, him) phải đứng giữa động từ và tiểu từ.`
    : `${f.verb} không tách được: tân ngữ, kể cả đại từ, luôn đứng sau cả cụm.`
}

// Cách hỏi và giải thích từng câu (lượt Ôn câu sai cũng dùng)
export const view: LabView<Frame, Result> = {
  ask: (f) => (f.group === 'object' ? 'Chọn cách đặt tân ngữ đúng cho chỗ trống:' : 'Chọn cụm động từ mang nghĩa trong ngoặc:'),
  feedback: (f) => <><b lang="en">{f.verb}</b> = {VERBS[f.verb].vi}.</>,
  extra: (f) => <p className="bq-rule">{note(f)}</p>,
  missedNote: (m) => `${m.verb} = ${VERBS[m.verb].vi}`,
  result: (f, ok) => ({ id: f.id, group: f.group, ok }),
}

export default function PhrasalQuiz({ items, onFinish, ...rest }: Props) {
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
      doneTitle={(good) => (good ? 'Cụm động từ đã vững — giỏi lắm!' : 'Xong một lượt — xem lại nghĩa của các cụm bị sai')}
    />
  )
}
