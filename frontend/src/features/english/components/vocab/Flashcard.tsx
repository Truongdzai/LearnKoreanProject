import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { posLabel } from '@/data/vocabCore'
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
}

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: 'again', label: 'HỌC LẠI', cls: 'again' },
  { g: 'hard', label: 'KHÓ', cls: 'hard' },
  { g: 'good', label: 'TỐT', cls: 'good' },
  { g: 'easy', label: 'DỄ', cls: 'easy' },
]

export default function Flashcard({
  card, lang, def, accents, speak, box, mastered, saved, onGrade, onMaster, onSave,
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

  return (
    <div className="vl-card-wrap">
      <div className="vl-scene">
        <div
          className={'vl-flip' + (flipped ? ' card-flipped' : '')}
          onClick={() => setFlipped((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter') setFlipped((v) => !v) }}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={flipped ? `Mặt sau của thẻ ${term}` : `Mặt trước của thẻ ${term}`}
        >
          <div className={'vl-face vl-front' + (flipped ? '' : ' on')} aria-hidden={flipped}>
            <span className="vl-face-tag">Mặt trước</span>
            <button
              className="vl-speak"
              onClick={(e) => { e.stopPropagation(); speak(term) }}
              title="Nghe phát âm"
            >
              <Icon name="volume" size={19} />
            </button>

            <div className="vl-face-body">
              <div className={'vl-img big ' + card.unit.tone}>{w.img}</div>
              <h3 className="vl-word" lang={lang}>{term}</h3>
              <span className="vl-pos">{posLabel(w.pos)}</span>
              {ipaRow}
            </div>

            <p className="vl-hint"><Icon name="refresh" size={13} /> Nhấn để lật thẻ</p>
          </div>

          <div className={'vl-face vl-back' + (flipped ? ' on' : '')} aria-hidden={!flipped}>
            <span className="vl-face-tag">Mặt sau</span>
            <button
              className="vl-speak"
              onClick={(e) => { e.stopPropagation(); speak(term) }}
              title="Nghe phát âm"
            >
              <Icon name="volume" size={19} />
            </button>

            <WordDetail card={card} lang={lang} def={def} accents={accents} speak={speak} />

            <p className="vl-hint"><Icon name="refresh" size={13} /> Nhấn để lật lại</p>
          </div>
        </div>
      </div>

      <div className={'vl-after' + (flipped ? ' on' : '')} aria-hidden={!flipped}>
        <div className="vl-grades">
          {GRADES.map((x) => (
            <button key={x.g} className={'vl-grade ' + x.cls} onClick={() => onGrade(x.g)}>
              <b>{x.label}</b>
              <span>{gradeLabel(box, x.g)}</span>
            </button>
          ))}
        </div>
        <div className="vl-card-actions">
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
