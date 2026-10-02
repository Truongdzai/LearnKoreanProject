import { useEffect, useState, type MouseEvent } from 'react'
import Icon from '@/core/components/Icon'
import { inertRef } from '@/core/a11y'
import { posLabel } from '@/data/vocabCore'
import WordImg from '../WordImg'
import AudioBtn from './AudioBtn'
import WordDetail from './WordDetail'
import { gradeLabel, type Grade } from './store'
import type { ModeProps } from './types'

interface Props extends ModeProps {
  box: number
  mastered: boolean
  saved: boolean
  onGrade: (g: Grade) => void
  onMaster: () => void
  onSave: () => void
  onDeep?: (term: string) => void
}

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: 'again', label: 'HỌC LẠI', cls: 'again' },
  { g: 'hard', label: 'KHÓ', cls: 'hard' },
  { g: 'good', label: 'TỐT', cls: 'good' },
  { g: 'easy', label: 'DỄ', cls: 'easy' },
]

export default function Flashcard({
  card, lang, def, accents, speak, box, mastered, saved, onGrade, onMaster, onSave, onDeep,
}: Props) {
  const [flipped, setFlipped] = useState(false)
  const { w, term } = card

  useEffect(() => { setFlipped(false) }, [term])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (e.code === 'Space') { e.preventDefault(); setFlipped((v) => !v) }
      if (flipped && e.key >= '1' && e.key <= '4') onGrade(GRADES[Number(e.key) - 1].g)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, onGrade])

  const ipaRow = (
    <div className="vl-ipa-row">
      {accents ? (
        <>
          <AudioBtn text={term} accent="us" ipa={card.us} />
          <AudioBtn text={term} accent="uk" ipa={card.uk} />
        </>
      ) : (
        <button className="vl-mini" onClick={(e) => { e.stopPropagation(); speak(term) }}>
          <Icon name="volume" size={14} /> {card.read}
        </button>
      )}
    </div>
  )

  // Mặt vừa úp thành inert nên focus sẽ rơi mất: chuyển sang nút lật của mặt vừa hiện.
  const flipTo = (e: MouseEvent<HTMLButtonElement>, back: boolean) => {
    const card = e.currentTarget.closest('.vl-flip')
    setFlipped(back)
    requestAnimationFrame(() => card?.querySelector<HTMLElement>(back ? '.vl-back .vl-hint' : '.vl-front .vl-hint')?.focus())
  }

  return (
    <div className="vl-card-wrap">
      <div className="vl-scene">
        {/* Bấm vào thẻ để lật bằng chuột; bàn phím dùng nút "lật" thật ở chân mỗi mặt,
            vì thẻ đã chứa nút nghe nên không thể tự làm role=button. */}
        <div className={'vl-flip' + (flipped ? ' card-flipped' : '')} onClick={() => setFlipped((v) => !v)}>
          <div className={'vl-face vl-front' + (flipped ? '' : ' on')} aria-hidden={flipped} ref={inertRef(flipped)}>
            <span className="vl-face-tag">Mặt trước</span>
            <button
              className="vl-speak"
              onClick={(e) => { e.stopPropagation(); speak(term) }}
              title="Nghe phát âm"
            >
              <Icon name="volume" size={19} />
            </button>

            <div className="vl-face-body">
              <WordImg term={term} emoji={w.img} className={'vl-img big ' + card.unit.tone} />
              <h3 className="vl-word" lang={lang}>{term}</h3>
              <span className="vl-pos">{posLabel(w.pos)}</span>
              {ipaRow}
            </div>

            <button type="button" className="vl-hint" onClick={(e) => { e.stopPropagation(); flipTo(e, true) }}>
              <Icon name="refresh" size={13} /> Nhấn để lật thẻ
            </button>
          </div>

          <div className={'vl-face vl-back' + (flipped ? ' on' : '')} aria-hidden={!flipped} ref={inertRef(!flipped)}>
            <span className="vl-face-tag">Mặt sau</span>
            <button
              className="vl-speak"
              onClick={(e) => { e.stopPropagation(); speak(term) }}
              title="Nghe phát âm"
            >
              <Icon name="volume" size={19} />
            </button>

            <WordDetail card={card} lang={lang} def={def} accents={accents} speak={speak} />

            <button type="button" className="vl-hint" onClick={(e) => { e.stopPropagation(); flipTo(e, false) }}>
              <Icon name="refresh" size={13} /> Nhấn để lật lại
            </button>
          </div>
        </div>
      </div>

      <div className={'vl-after' + (flipped ? ' on' : '')} aria-hidden={!flipped} ref={inertRef(!flipped)}>
        <div className="vl-grades">
          {GRADES.map((x) => (
            <button key={x.g} className={'vl-grade ' + x.cls} onClick={() => onGrade(x.g)}>
              <b>{x.label}</b>
              <span>{gradeLabel(box, x.g)}</span>
            </button>
          ))}
        </div>
        <div className="vl-card-actions">
          {onDeep && (
            <button className="vl-deep" onClick={() => onDeep(term)}>
              <Icon name="book" size={15} /> Học sâu từ vựng <Icon name="sparkles" size={14} />
            </button>
          )}
          <button className={'vl-mini' + (mastered ? ' on' : '')} onClick={onMaster}>
            <Icon name="check-circle" size={14} /> {mastered ? 'Đã thành thạo' : 'Thành thạo'}
          </button>
          <button className={'vl-mini' + (saved ? ' on' : '')} onClick={onSave}>
            <Icon name="star" size={14} /> {saved ? 'Đã lưu' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
