import Icon from '@/core/components/Icon'
import type { WordProfile } from '@/models/wordprofile.model'

interface Props {
  profile: WordProfile
  onPickWord: (term: string) => void
  hasWord: (term: string) => boolean
  onSay: (text: string) => void
}

export default function WordCompare({ profile, onPickWord, hasWord, onSay }: Props) {
  const { family, synonyms, antonyms, confuse, mistakes } = profile
  if (!family.length && !synonyms.length && !antonyms.length && !confuse.length && !mistakes.length) {
    return null
  }

  const open = (term: string) => {
    if (hasWord(term)) onPickWord(term)
    else onSay(term)
  }

  return (
    <div className="dp-compare">
      {family.length > 0 && (
        <div className="dp-cmpblock">
          <h4><Icon name="letters" size={15} /> Họ từ — cùng gốc, khác từ loại</h4>
          <p className="dp-combonote">
            Học một từ mà lấy được cả họ nhà nó là cách nhân vốn từ nhanh nhất. Bấm vào từ có sẵn trong kho để mở trang học sâu của từ đó.
          </p>
          <div className="dp-family">
            {family.map((f, i) => (
              <button key={i} className={'dp-famcard' + (hasWord(f.form) ? ' link' : '')} onClick={() => open(f.form)}>
                <b>{f.form}</b>
                <span className="dp-fampos">{f.pos}</span>
                <small>{f.vi}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {synonyms.length > 0 && (
        <div className="dp-cmpblock">
          <h4><Icon name="target" size={15} /> Gần nghĩa — khác nhau chỗ nào</h4>
          <p className="dp-combonote">
            Đây là chỗ người học hay sai: biết nghĩa rồi nhưng chọn nhầm từ. Đọc cột bên phải để thấy ranh giới giữa chúng.
          </p>
          <div className="dp-syns">
            {synonyms.map((s, i) => (
              <div key={i} className="dp-syn">
                <div className="dp-synhead">
                  <button className="dp-synword" onClick={() => open(s.word)}>{s.word}</button>
                  <span>{s.vi}</span>
                </div>
                <p>{s.diff}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {antonyms.length > 0 && (
        <div className="dp-cmpblock">
          <h4><Icon name="refresh" size={15} /> Trái nghĩa</h4>
          <div className="dp-ants">
            {antonyms.map((a, i) => (
              <button key={i} className="dp-ant" onClick={() => open(a.word)}>
                <b>{a.word}</b>{a.vi && <span>{a.vi}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {confuse.length > 0 && (
        <div className="dp-cmpblock">
          <h4><Icon name="bell" size={15} /> Dễ nhầm với</h4>
          <div className="dp-confuse">
            {confuse.map((c, i) => (
              <div key={i} className="dp-conf">
                <div className="dp-confhead">
                  <button className="dp-synword" onClick={() => open(c.word)}>{c.word}</button>
                  {c.vi && <span>{c.vi}</span>}
                </div>
                <p>{c.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {mistakes.length > 0 && (
        <div className="dp-cmpblock">
          <h4><Icon name="bulb" size={15} /> Lỗi người Việt hay mắc</h4>
          <ul className="dp-mistakes">
            {mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
