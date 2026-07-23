import { useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { UNITS as EN_UNITS, wTerm, wRead, type IcesWord, type VocabUnit } from '@/data/englishCore'
import { addCard } from '@/core/api/srs.api'
import { useAppStore } from '@/store/app.store'
import { speakEN, useLearnedWords } from '../progress'

const ICES = [
  { k: 'I', label: 'Image', desc: 'Hình ảnh gợi nhớ' },
  { k: 'C', label: 'Connect', desc: 'Liên tưởng' },
  { k: 'E', label: 'Experience', desc: 'Câu ví dụ thật' },
  { k: 'S', label: 'Sound', desc: 'Nghe & nhại' },
]

const UNITS_PREVIEW = 20

interface Props {
  initialUnit?: string
  units?: VocabUnit[]
  speak?: (text: string) => void
  sourceLabel?: string
  lang?: string
}

export default function IcesLearn({
  initialUnit,
  units = EN_UNITS,
  speak = speakEN,
  sourceLabel = 'English Core',
  lang = 'en',
}: Props) {
  const { isAuthed, recordEvent, t } = useAppStore()
  const { has, mark, learned } = useLearnedWords(lang)
  const [unitId, setUnitId] = useState(initialUnit || units[0].id)
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showAllUnits, setShowAllUnits] = useState(false)

  useEffect(() => {
    if (initialUnit) {
      setUnitId(initialUnit)
      setI(0)
      setFlipped(false)
    }
  }, [initialUnit])

  const unit = units.find((u) => u.id === unitId) ?? units[0]
  const words = unit.words
  const word: IcesWord = words[i]

  const activeIdx = units.findIndex((u) => u.id === unit.id)
  const expanded = showAllUnits || units.length <= UNITS_PREVIEW
  const visibleUnits = expanded
    ? units
    : activeIdx < UNITS_PREVIEW
      ? units.slice(0, UNITS_PREVIEW)
      : [...units.slice(0, UNITS_PREVIEW), unit]

  const progress = useMemo(
    () => words.filter((w) => learned.has(wTerm(w))).length,
    [words, learned],
  )

  const go = (d: number) => {
    setFlipped(false)
    setI((x) => (x + d + words.length) % words.length)
  }

  const pickUnit = (id: string) => {
    setUnitId(id)
    setI(0)
    setFlipped(false)
  }

  const learnIt = () => {
    const term = wTerm(word)
    if (!has(term)) {
      mark(term, true)
      recordEvent('word', 1, 0, 1)
      if (isAuthed) {
        addCard({
          front: term,
          back: `${word.vi}\n${wRead(word)}\n“${word.ex}” — ${word.exVi}`,
          source: `${sourceLabel} · ${unit.name}`,
        }).catch(() => {  })
      }
    }
    setTimeout(() => go(1), 250)
  }

  return (
    <div className="ices">
      <div className="ices-units">
        {visibleUnits.map((u) => (
          <button
            key={u.id}
            className={'ices-unit' + (u.id === unitId ? ' on' : '')}
            onClick={() => pickUnit(u.id)}
          >
            <span className={'iu-emoji ' + u.tone}>{u.emoji}</span>
            <span className="iu-body">
              <b>{u.name}</b>
              <small>{u.words.filter((w) => learned.has(wTerm(w))).length}/{u.words.length} từ</small>
            </span>
          </button>
        ))}
      </div>
      {units.length > UNITS_PREVIEW && (
        <button className="ices-units-more" onClick={() => setShowAllUnits((v) => !v)}>
          {expanded
            ? <>{t('ices.lessUnits')} <Icon name="chevron-up" size={15} /></>
            : <>{t('ices.moreUnits', { n: units.length - UNITS_PREVIEW })} <Icon name="chevron-down" size={15} /></>}
        </button>
      )}

      <div className="ices-bar">
        <div className="ices-bar-fill" style={{ width: `${(progress / words.length) * 100}%` }} />
      </div>
      <div className="ices-bar-meta">
        <span>{unit.sub}</span>
        <span>Từ {i + 1} / {words.length} · đã thuộc {progress}</span>
      </div>

      <div className={'ices-card' + (flipped ? ' flip' : '')}>
        <button className="ices-sound" onClick={() => speak(wTerm(word))} title="Nghe phát âm">
          <Icon name="volume" size={20} />
        </button>

        <div className={'ices-img ' + unit.tone}>{word.img}</div>
        <h2 className="ices-word" lang={lang}>{wTerm(word)}</h2>
        <div className="ices-ipa">{wRead(word)} · <b>{word.vi}</b></div>

        {flipped ? (
          <div className="ices-detail">
            <div className="ices-row">
              <span className="ices-tag c">C · Connect</span>
              <p>{word.connect}</p>
            </div>
            <div className="ices-row">
              <span className="ices-tag e">E · Experience</span>
              <p lang={lang} className="ices-ex">“{word.ex}”</p>
              <p className="ices-ex-vi">{word.exVi}</p>
              <button className="btn-ghost sm" onClick={() => speak(word.ex)}>
                <Icon name="volume" size={14} /> Nghe câu
              </button>
            </div>
          </div>
        ) : (
          <button className="reveal-btn" onClick={() => setFlipped(true)}>
            Xem mẹo nhớ & ví dụ <span className="kbd">Space</span>
          </button>
        )}
      </div>

      <div className="ices-actions">
        <button className="btn-ghost" onClick={() => go(-1)}><Icon name="arrow-left" size={16} /> Trước</button>
        <button
          className={'btn-primary' + (has(wTerm(word)) ? ' done' : '')}
          onClick={learnIt}
        >
          {has(wTerm(word)) ? <><Icon name="check" size={16} /> Đã thuộc</> : <><Icon name="check-circle" size={16} /> Tôi đã thuộc từ này</>}
        </button>
        <button className="btn-ghost" onClick={() => go(1)}>Sau <Icon name="arrow-right" size={16} /></button>
      </div>

      <div className="ices-legend">
        {ICES.map((x) => (
          <div key={x.k} className="ices-leg"><b>{x.k}</b><span>{x.label}<small>{x.desc}</small></span></div>
        ))}
      </div>
    </div>
  )
}
