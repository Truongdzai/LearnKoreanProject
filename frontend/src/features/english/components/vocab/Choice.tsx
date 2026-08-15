import { useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { posLabel } from '@/data/vocabCore'
import AudioBtn from './AudioBtn'
import WordImg from '../WordImg'
import type { Card, ModeProps } from './types'

interface Props extends ModeProps {
  reverse: boolean
}

const LETTERS = ['A', 'B', 'C', 'D']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Choice({ card, pool, lang, def, accents, speak, onNext, onDone, reverse }: Props) {
  const { w, term } = card
  const [picked, setPicked] = useState<string | null>(null)

  const options = useMemo(() => {
    const key = (c: Card) => (reverse ? c.w.vi : c.term)
    const others = shuffle(pool.filter((c) => c.term !== term && key(c) !== key(card))).slice(0, 3)
    return shuffle([card, ...others]).map(key)
  }, [term, pool, reverse])

  const answer = reverse ? w.vi : term

  useEffect(() => { setPicked(null) }, [term, reverse])

  const choose = (opt: string) => {
    if (picked) return
    setPicked(opt)
    onDone(opt === answer)
    if (opt === answer && !reverse && accents) speak(term)
  }

  return (
    <div className="vl-card-wrap">
      <div className="vl-card">
        {reverse ? (
          <>
            <WordImg term={term} emoji={w.img} />
            <div className="vl-term-row">
              <h3 lang={lang}>{term}</h3>
              <span className="vl-pos">{posLabel(w.pos)}</span>
            </div>
            {accents && (
              <div className="vl-ipa-row">
                <AudioBtn text={term} accent="us" ipa={card.us} compact />
                <AudioBtn text={term} accent="uk" ipa={card.uk} compact />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="vl-mean big">{w.vi}</div>
            <p className="vl-def">{def.defVi ?? w.connect}</p>
          </>
        )}

        <p className="vl-ask">{reverse ? 'Từ này nghĩa là gì?' : 'Chọn đáp án đúng'}</p>

        <div className="vl-options">
          {options.map((opt, i) => {
            let cls = 'vl-opt'
            if (picked) {
              if (opt === answer) cls += ' correct'
              else if (opt === picked) cls += ' wrong'
            }
            return (
              <button key={opt} className={cls} onClick={() => choose(opt)} disabled={!!picked}>
                <span className="vl-letter">
                  {picked && opt === answer ? <Icon name="check-circle" size={16} /> : LETTERS[i]}
                </span>
                <span lang={reverse ? undefined : lang}>{opt}</span>
              </button>
            )
          })}
        </div>

        {picked && (
          <div className="vl-foot-row">
            <p className="vl-ex" lang={lang}>“{w.ex}”</p>
            <p className="vl-ex-vi">{w.exVi}</p>
            <button className="vl-btn ok" onClick={onNext}>
              Thẻ tiếp theo <Icon name="arrow-right" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
