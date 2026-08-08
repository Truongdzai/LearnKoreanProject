import Icon from '@/core/components/Icon'
import { langLabel, posLabel, type WordDef } from '@/data/vocabCore'
import AudioBtn from './AudioBtn'
import type { Card } from './types'

export function highlight(sentence: string, term: string) {
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return sentence
    .split(new RegExp(`(${safe}\\w*)`, 'i'))
    .map((part, i) => (i % 2 ? <b key={i} className="vl-hl">{part}</b> : <span key={i}>{part}</span>))
}

interface Props {
  card: Card
  lang: string
  def: WordDef
  accents: boolean
  speak: (text: string) => void
}

export default function WordDetail({ card, lang, def, accents, speak }: Props) {
  const { w, term } = card

  return (
    <>
      <div className="vl-back-head">
        <span className="vl-back-term" lang={lang}>{term}</span>
        <span className="vl-pos">{posLabel(w.pos)}</span>
      </div>

      <div className="vl-ipa-row">
        {accents ? (
          <>
            <AudioBtn text={term} accent="us" ipa={card.us} compact />
            <AudioBtn text={term} accent="uk" ipa={card.uk} compact />
          </>
        ) : (
          <button className="vl-mini" onClick={(e) => { e.stopPropagation(); speak(term) }}>
            <Icon name="volume" size={14} /> {card.read}
          </button>
        )}
      </div>

      <div className="vl-mean">{w.vi}</div>

      {def.def && (
        <div className="vl-block def">
          <h4>Định nghĩa {langLabel(lang)}</h4>
          <p lang={lang}>{def.def}</p>
        </div>
      )}
      {def.defVi && (
        <div className="vl-block def vi">
          <h4>Định nghĩa</h4>
          <p>{def.defVi}</p>
        </div>
      )}

      <div className="vl-block tip">
        <h4>Mẹo nhớ</h4>
        <p>{w.connect}</p>
      </div>

      <div className="vl-block ex">
        <div className="vl-block-head">
          <h4>Ví dụ</h4>
          {accents && (
            <span className="vl-ex-audio">
              <AudioBtn text={w.ex} accent="us" compact />
              <AudioBtn text={w.ex} accent="uk" compact />
            </span>
          )}
        </div>
        <p className="vl-ex" lang={lang}>{highlight(w.ex, term)}</p>
        <p className="vl-ex-vi">{w.exVi}</p>
      </div>
    </>
  )
}
