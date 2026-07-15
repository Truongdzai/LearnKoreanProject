import { useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { UNITS, type IcesWord } from '@/data/englishCore'
import { addCard } from '@/core/api/srs.api'
import { useAppStore } from '@/store/app.store'
import { speakEN, useLearnedWords } from '../progress'

const ICES = [
  { k: 'I', label: 'Image', desc: 'Hình ảnh gợi nhớ' },
  { k: 'C', label: 'Connect', desc: 'Liên tưởng' },
  { k: 'E', label: 'Experience', desc: 'Câu ví dụ thật' },
  { k: 'S', label: 'Sound', desc: 'Nghe & nhại' },
]

export default function IcesLearn({ initialUnit }: { initialUnit?: string }) {
  const { isAuthed, recordEvent } = useAppStore()
  const { has, mark, learned } = useLearnedWords()
  const [unitId, setUnitId] = useState(initialUnit || 'nouns')
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Lộ trình gửi sang unit cụ thể (nút "Học ngay" của tuần) → nhảy thẳng tới unit đó.
  useEffect(() => {
    if (initialUnit) {
      setUnitId(initialUnit)
      setI(0)
      setFlipped(false)
    }
  }, [initialUnit])

  const unit = UNITS.find((u) => u.id === unitId) ?? UNITS[0]
  const words = unit.words
  const word: IcesWord = words[i]

  const progress = useMemo(
    () => words.filter((w) => learned.has(w.en)).length,
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
    if (!has(word.en)) {
      mark(word.en, true)
      recordEvent('word', 1, 0, 1)
      if (isAuthed) {
        addCard({
          front: word.en,
          back: `${word.vi}\n${word.ipa}\n“${word.ex}” — ${word.exVi}`,
          source: `English Core · ${unit.name}`,
        }).catch(() => { /* không chặn */ })
      }
    }
    setTimeout(() => go(1), 250)
  }

  return (
    <div className="ices">
      <div className="ices-units">
        {UNITS.map((u) => (
          <button
            key={u.id}
            className={'ices-unit' + (u.id === unitId ? ' on' : '')}
            onClick={() => pickUnit(u.id)}
          >
            <span className={'iu-emoji ' + u.tone}>{u.emoji}</span>
            <span className="iu-body">
              <b>{u.name}</b>
              <small>{u.words.filter((w) => learned.has(w.en)).length}/{u.words.length} từ</small>
            </span>
          </button>
        ))}
      </div>

      <div className="ices-bar">
        <div className="ices-bar-fill" style={{ width: `${(progress / words.length) * 100}%` }} />
      </div>
      <div className="ices-bar-meta">
        <span>{unit.sub}</span>
        <span>Từ {i + 1} / {words.length} · đã thuộc {progress}</span>
      </div>

      <div className={'ices-card' + (flipped ? ' flip' : '')}>
        <button className="ices-sound" onClick={() => speakEN(word.en)} title="Nghe phát âm">
          <Icon name="volume" size={20} />
        </button>

        <div className={'ices-img ' + unit.tone}>{word.img}</div>
        <h2 className="ices-word" lang="en">{word.en}</h2>
        <div className="ices-ipa">{word.ipa} · <b>{word.vi}</b></div>

        {flipped ? (
          <div className="ices-detail">
            <div className="ices-row">
              <span className="ices-tag c">C · Connect</span>
              <p>{word.connect}</p>
            </div>
            <div className="ices-row">
              <span className="ices-tag e">E · Experience</span>
              <p lang="en" className="ices-ex">“{word.ex}”</p>
              <p className="ices-ex-vi">{word.exVi}</p>
              <button className="btn-ghost sm" onClick={() => speakEN(word.ex)}>
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
          className={'btn-primary' + (has(word.en) ? ' done' : '')}
          onClick={learnIt}
        >
          {has(word.en) ? <><Icon name="check" size={16} /> Đã thuộc</> : <><Icon name="check-circle" size={16} /> Tôi đã thuộc từ này</>}
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
