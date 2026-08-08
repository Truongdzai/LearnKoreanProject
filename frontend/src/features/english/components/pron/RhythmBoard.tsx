import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakFocus } from '@/core/tts'
import type { PronFocus, PronGroup } from '@/data/englishPronunciation'
import { CTX, MicButton, ResultLine, useReader } from './reader'

const STEPS = [
  'Gạch dưới hai hoặc ba từ mang thông tin chính.',
  'Đánh dấu âm tiết mang trọng âm trong mỗi từ khoá.',
  'Vỗ tay hoặc chạm bàn ở các nhịp nhấn — không ép khoảng cách giữa các nhịp phải bằng nhau.',
  'Đưa các từ nhẹ vào giữa hai nhịp mà không cố nói thật nhanh.',
  'Ghi âm hai phiên bản với từ nhấn khác nhau và mô tả sự thay đổi về nghĩa.',
]

function Sentence({ item }: { item: PronFocus }) {
  const reader = useReader()
  const [picks, setPicks] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const [focus, setFocus] = useState<number | null>(null)

  const sentence = item.words.join(' ')
  const shift = useMemo(() => item.shifts.find((s) => s.at === focus), [item.shifts, focus])
  const hitCount = picks.filter((k) => item.content.includes(k)).length

  const toggle = (k: number) => {
    if (checked) {
      setFocus(k)
      speakFocus(item.words, k, CTX.srLang)
      return
    }
    setPicks((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
  }

  const reset = () => { setPicks([]); setChecked(false); setFocus(null) }

  return (
    <div className="rhy-card">
      <div className="rhy-task">
        {checked
          ? <b><Icon name="target" size={14} /> Bấm từng từ để nghe câu khi nhấn vào từ đó</b>
          : <b><Icon name="target" size={14} /> Bấm chọn 2–3 từ mang thông tin chính</b>}
        <small>{item.vi}</small>
      </div>

      <div className="rhy-words" lang={CTX.lang}>
        {item.words.map((w, k) => {
          const picked = picks.includes(k)
          const isContent = item.content.includes(k)
          let cls = 'rhy-w'
          if (!checked && picked) cls += ' picked'
          if (checked) {
            if (isContent) cls += ' content'
            if (focus === k) cls += ' focus'
          }
          return (
            <button key={k} className={cls} onClick={() => toggle(k)}>
              {checked && focus === k ? w.toUpperCase() : w}
            </button>
          )
        })}
      </div>

      {!checked ? (
        <div className="rhy-actions">
          <button className="btn-primary sm" disabled={!picks.length} onClick={() => setChecked(true)}>
            <Icon name="check" size={14} /> Xem đáp án
          </button>
          <button className="btn-ghost sm" onClick={() => CTX.speak(sentence, 0.85)}>
            <Icon name="volume" size={14} /> Nghe câu
          </button>
        </div>
      ) : (
        <>
          <div className="rhy-verdict">
            <b>{hitCount}/{item.content.length} từ mang thông tin</b>
            <span>
              Danh từ, động từ chính, tính từ và trạng từ nhận nhịp nhấn; mạo từ, giới từ ngắn, trợ động từ và đại từ
              lướt nhẹ giữa hai nhịp.
            </span>
          </div>
          {shift && (
            <div className="rhy-mean">
              <Icon name="bulb" size={14} /> {shift.mean}
            </div>
          )}
          {focus != null && !shift && (
            <div className="rhy-mean plain">
              <Icon name="bulb" size={14} /> Nhấn vào từ này nghe được, nhưng không tạo ra ý đối chiếu rõ như các từ khoá.
            </div>
          )}
          <div className="rhy-actions">
            <button className="btn-ghost sm" onClick={() => CTX.speak(sentence, 0.85)}>
              <Icon name="volume" size={14} /> Nghe câu đều
            </button>
            <MicButton id={'rh' + sentence} target={sentence} reader={reader} />
            <button className="btn-ghost sm" onClick={reset}>
              <Icon name="refresh" size={14} /> Làm lại
            </button>
          </div>
          <ResultLine id={'rh' + sentence} reader={reader} />
        </>
      )}
    </div>
  )
}

export default function RhythmBoard({ group }: { group: PronGroup }) {
  const list = group.focus ?? []
  const [i, setI] = useState(0)
  const item = list[i]

  if (!item) return null

  return (
    <div className="rhy">
      <ol className="rhy-steps">
        {STEPS.map((s, k) => <li key={k}>{s}</li>)}
      </ol>

      <div className="rhy-tabs">
        {list.map((f, k) => (
          <button key={k} className={'pron-mode' + (k === i ? ' on' : '')} onClick={() => setI(k)}>
            Câu {k + 1}
          </button>
        ))}
      </div>

      <Sentence key={i} item={item} />

      <p className="stb-note">
        Đổi từ nhấn là đổi hướng chú ý của người nghe, nên bài luyện nhịp phải bắt đầu từ ý định giao tiếp: điều gì là
        thông tin mới, điều gì đang được sửa lại và từ nào mang sự đối chiếu.
      </p>
    </div>
  )
}
