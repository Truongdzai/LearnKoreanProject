import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { langLabel, posLabel } from '@/data/vocabCore'
import WordDetail, { highlight } from './WordDetail'
import type { ModeProps } from './types'

function mask(sentence: string, term: string): string {
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return sentence.replace(new RegExp(`${safe}\\w*`, 'ig'), (m) => '*'.repeat(Math.max(4, m.length)))
}

const LETTER = /[\p{L}\p{N}]/u

function spotsOf(term: string): number[] {
  return [...term].map((c, i) => (LETTER.test(c) ? i : -1)).filter((i) => i >= 0)
}

function hintSteps(term: string): number {
  const n = spotsOf(term).length
  if (n < 2) return 0
  return n > 2 ? 2 : 1
}

function hintOf(term: string, level: number): string {
  const spots = spotsOf(term)
  if (level <= 0 || spots.length < 2) return ''
  const show = new Set([spots[0]])
  if (level >= 2 && spots.length > 2) show.add(spots[spots.length - 1])
  return [...term]
    .map((c, i) => (!LETTER.test(c) || show.has(i) ? c : '*'))
    .join('')
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')

export default function Guess({ card, lang, def, accents, speak, onNext, onDone }: ModeProps) {
  const { w, term } = card
  const [value, setValue] = useState('')
  const [hint, setHint] = useState(0)
  const [result, setResult] = useState<'ok' | 'bad' | 'gave' | null>(null)
  const [flipped, setFlipped] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue('')
    setHint(0)
    setResult(null)
    setFlipped(false)
    inputRef.current?.focus()
  }, [term])

  const solved = result === 'ok' || result === 'gave'
  const typed = value.trim().length > 0
  const steps = hintSteps(term)

  const check = () => {
    if (solved || !typed) return
    const ok = norm(value) === norm(term)
    setResult(ok ? 'ok' : 'bad')
    if (ok) {
      onDone(true)
      if (accents) speak(term)
    }
  }

  const giveUp = () => {
    if (solved) return
    setResult('gave')
    setFlipped(true)
    onDone(false)
    if (accents) speak(term)
  }

  return (
    <div className="vl-card-wrap">
      <div className="vl-scene">
        <div className={'vl-flip' + (flipped ? ' card-flipped' : '')}>
          <div className={'vl-face vl-guess-face' + (flipped ? '' : ' on')} aria-hidden={flipped}>
            <span className="vl-face-tag">Mặt trước</span>

            <div className="vl-guess-body">
              <div className={'vl-img big ' + card.unit.tone}>{w.img}</div>

              <div className="vl-term-row">
                <div className="vl-mean big">{w.vi}</div>
                <span className="vl-pos">{posLabel(w.pos)}</span>
              </div>

              {def.def && (
                <div className="vl-block center def">
                  <h4>Định nghĩa {langLabel(lang)}</h4>
                  <p lang={lang}>{def.def}</p>
                </div>
              )}
              {def.defVi && (
                <div className="vl-block center def vi">
                  <h4>Định nghĩa</h4>
                  <p>{def.defVi}</p>
                </div>
              )}
              {!def.def && !def.defVi && (
                <div className="vl-block center tip">
                  <h4>Mẹo nhớ</h4>
                  <p>{w.connect}</p>
                </div>
              )}

              <div className="vl-block center ex">
                <h4>Ví dụ</h4>
                <p className="vl-ex" lang={lang}>{solved ? highlight(w.ex, term) : mask(w.ex, term)}</p>
                <p className="vl-ex-vi">{w.exVi}</p>
              </div>

              {hint > 0 && !solved && <div className="vl-hintchip">{hintOf(term, hint)}</div>}
            </div>

            <div className="vl-guess-row">
              <input
                ref={inputRef}
                className={'vl-input' + (result === 'bad' ? ' bad' : result === 'ok' ? ' ok' : '')}
                placeholder={`Nhập từ ${langLabel(lang)}...`}
                value={value}
                onChange={(e) => { setValue(e.target.value); if (result === 'bad') setResult(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter') (solved ? onNext() : check()) }}
                disabled={solved}
              />
              {steps > 0 && (
                <button
                  className="vl-hintbtn"
                  onClick={() => setHint((h) => Math.min(h + 1, steps))}
                  disabled={solved || hint >= steps}
                  title={hint === 0 ? 'Mở chữ đầu' : 'Mở chữ cuối'}
                >
                  <Icon name="bulb" size={15} /> Gợi ý
                </button>
              )}
            </div>

            {result === 'bad' && (
              <p className="vl-wrong"><Icon name="x-circle" size={14} /> Chưa đúng — thử lại hoặc bấm Gợi ý.</p>
            )}
            {result === 'ok' && (
              <p className="vl-right"><Icon name="check-circle" size={14} /> Chính xác!</p>
            )}

            <div className="vl-guess-actions">
              {solved ? (
                <>
                  <button className="vl-btn detail" onClick={() => setFlipped(true)}>
                    <Icon name="book" size={16} /> XEM CHI TIẾT
                  </button>
                  <button className="vl-btn ok" onClick={onNext}>
                    Thẻ tiếp theo <Icon name="arrow-right" size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button className="vl-btn danger" onClick={giveUp}>
                    <Icon name="eye" size={16} /> KHÔNG BIẾT
                  </button>
                  <button className="vl-btn ok" onClick={check} disabled={!typed}>
                    <Icon name="check-circle" size={16} /> KIỂM TRA ĐÁP ÁN
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={'vl-face vl-back' + (flipped ? ' on' : '')} aria-hidden={!flipped}>
            <span className="vl-face-tag">Mặt sau</span>
            <button
              className="vl-speak"
              onClick={() => speak(term)}
              title="Nghe phát âm"
            >
              <Icon name="volume" size={19} />
            </button>

            <WordDetail card={card} lang={lang} def={def} accents={accents} speak={speak} />

            <div className="vl-guess-actions back">
              <button className="vl-mini" onClick={() => setFlipped(false)}>
                <Icon name="refresh" size={14} /> Lật lại mặt trước
              </button>
              <button className="vl-btn ok" onClick={onNext}>
                Thẻ tiếp theo <Icon name="arrow-right" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
