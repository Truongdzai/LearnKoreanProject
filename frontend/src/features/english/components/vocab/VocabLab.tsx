import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { wTerm, wRead, loadDefs, type VocabUnit, type WordDefs } from '@/data/vocabCore'
import { ukIpa } from '@/core/ukIpa'
import { onVoicesChanged, speakAccent } from '@/core/tts'
import { addCard } from '@/core/api/srs.api'
import { useAppStore } from '@/store/app.store'
import { speakEN, useLearnedWords } from '../../progress'
import Flashcard from './Flashcard'
import Guess from './Guess'
import Choice from './Choice'
import Repeat from './Repeat'
import { useDeck, type Grade } from './store'
import type { Card } from './types'

type Mode = 'guess' | 'flash' | 'quiz' | 'quizRev' | 'repeat'

const MODES: { id: Mode; label: string; icon: IconName }[] = [
  { id: 'guess', label: 'Đoán', icon: 'bulb' },
  { id: 'flash', label: 'Flashcard', icon: 'cards' },
  { id: 'quiz', label: 'Trắc nghiệm', icon: 'target' },
  { id: 'quizRev', label: 'Trắc nghiệm đảo', icon: 'refresh' },
  { id: 'repeat', label: 'Lặp lại', icon: 'mic' },
]

const UNITS_PREVIEW = 24

interface Props {
  initialUnit?: string
  units: VocabUnit[]
  speak?: (text: string) => void
  sourceLabel?: string
  lang?: string
  title?: string
}

export default function VocabLab({
  initialUnit,
  units,
  speak = speakEN,
  sourceLabel = 'English Core',
  lang = 'en',
  title = 'Từ vựng tiếng Anh giao tiếp',
}: Props) {
  const { isAuthed, recordEvent } = useAppStore()
  const { learned, mark } = useLearnedWords(lang)
  const { grade, toggleMastered, toggleSaved, mastered, saved, boxOf } = useDeck(lang)

  const [unitId, setUnitId] = useState(initialUnit || units[0].id)
  const [mode, setMode] = useState<Mode>('flash')
  const [i, setI] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [panel, setPanel] = useState<'keys' | 'setup' | null>(null)
  const [autoPlay, setAutoPlay] = useState(true)

  const accents = lang === 'en'

  const [, bumpVoices] = useReducer((n: number) => n + 1, 0)
  useEffect(() => onVoicesChanged(bumpVoices), [])

  const [defs, setDefs] = useState<WordDefs>({})
  useEffect(() => {
    let alive = true
    loadDefs(lang).then((d) => { if (alive) setDefs(d) }).catch(() => {  })
    return () => { alive = false }
  }, [lang])

  useEffect(() => {
    if (initialUnit) { setUnitId(initialUnit); setI(0) }
  }, [initialUnit])

  const unit = units.find((u) => u.id === unitId) ?? units[0]

  const cards: Card[] = useMemo(
    () => unit.words.map((w) => {
      const term = wTerm(w)
      const us = w.ipa ?? ''
      return { w, term, read: wRead(w), us, uk: accents ? ukIpa(term, us) : '', unit }
    }),
    [unit, accents],
  )

  const card = cards[Math.min(i, cards.length - 1)]
  const totalWords = useMemo(() => units.reduce((n, u) => n + u.words.length, 0), [units])
  const doneInUnit = useMemo(
    () => unit.words.filter((w) => learned.has(wTerm(w))).length,
    [unit, learned],
  )

  const speakTerm = useCallback((text: string) => {
    if (accents) speakAccent(text, 'us')
    else speak(text)
  }, [accents, speak])

  useEffect(() => {
    if (!autoPlay || !card || mode === 'guess' || mode === 'quiz') return
    const t = window.setTimeout(() => speakTerm(card.term), 320)
    return () => window.clearTimeout(t)
  }, [card?.term, mode, autoPlay, speakTerm])

  const learnTerm = useCallback((term: string, w: Card['w']) => {
    if (learned.has(term)) return
    mark(term, true)
    recordEvent('word', 1, 0, 1)
    if (isAuthed) {
      const d = defs[term] ?? {}
      const lines = [w.vi, w.ipa ?? '']
      if (d.def) lines.push(d.def)
      if (d.defVi) lines.push(d.defVi)
      lines.push(`Mẹo nhớ: ${w.connect}`, `“${w.ex}” — ${w.exVi}`)
      addCard({
        front: term,
        back: lines.join('\n'),
        source: `${sourceLabel} · ${unit.name}`,
      }).catch(() => {  })
    }
  }, [learned, mark, recordEvent, isAuthed, sourceLabel, unit.name, defs])

  const next = useCallback(() => {
    setI((x) => (x + 1) % cards.length)
  }, [cards.length])

  const prev = useCallback(() => {
    setI((x) => (x - 1 + cards.length) % cards.length)
  }, [cards.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const onGrade = useCallback((g: Grade) => {
    grade(card.term, g)
    if (g === 'good' || g === 'easy') learnTerm(card.term, card.w)
    next()
  }, [card, grade, learnTerm, next])

  const onDone = useCallback((correct: boolean) => {
    grade(card.term, correct ? 'good' : 'again')
    if (correct) learnTerm(card.term, card.w)
  }, [card, grade, learnTerm])

  const pickUnit = (id: string) => { setUnitId(id); setI(0) }

  const activeIdx = units.findIndex((u) => u.id === unit.id)
  const expanded = showAll || units.length <= UNITS_PREVIEW
  const visibleUnits = expanded
    ? units
    : activeIdx < UNITS_PREVIEW
      ? units.slice(0, UNITS_PREVIEW)
      : [...units.slice(0, UNITS_PREVIEW), unit]

  const common = {
    card,
    pool: cards,
    lang,
    def: defs[card.term] ?? {},
    accents,
    speak: speakTerm,
    onNext: next,
    onDone,
  }

  return (
    <div className="vl">
      <div className="vl-head">
        <h2>{title}</h2>
        <div className="vl-modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={'vl-mode' + (mode === m.id ? ' on' : '')}
              onClick={() => { setMode(m.id); setPanel(null) }}
            >
              <Icon name={m.icon} size={15} /> {m.label}
            </button>
          ))}
          <button
            className={'vl-icon-btn' + (panel === 'keys' ? ' on' : '')}
            title="Phím tắt"
            onClick={() => setPanel((p) => (p === 'keys' ? null : 'keys'))}
          >
            <Icon name="keyboard" size={16} />
          </button>
          <button
            className={'vl-icon-btn' + (panel === 'setup' ? ' on' : '')}
            title="Tuỳ chỉnh"
            onClick={() => setPanel((p) => (p === 'setup' ? null : 'setup'))}
          >
            <Icon name="settings" size={16} />
          </button>
        </div>
      </div>

      {panel === 'keys' && (
        <div className="vl-panel">
          <b>Phím tắt</b>
          <span><span className="kbd">Space</span> lật thẻ</span>
          <span><span className="kbd">1</span>–<span className="kbd">4</span> chấm độ khó</span>
          <span><span className="kbd">←</span> <span className="kbd">→</span> chuyển thẻ</span>
          <span><span className="kbd">Enter</span> kiểm tra đáp án ở chế độ Đoán</span>
        </div>
      )}
      {panel === 'setup' && (
        <div className="vl-panel">
          <label className="vl-switch">
            <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
            Tự phát âm khi mở thẻ
          </label>
          {accents && <span className="vl-note">Giọng US và UK lấy từ kho giọng của máy bạn. Thiếu giọng nào thì nút giọng đó sẽ mờ đi.</span>}
        </div>
      )}

      <div className="vl-body">
        <aside className="vl-side">
          <h3>DANH SÁCH CHỦ ĐỀ</h3>
          <div className="vl-topics">
            {visibleUnits.map((u) => {
              const done = u.words.filter((w) => learned.has(wTerm(w))).length
              const pct = Math.round((done / u.words.length) * 100)
              return (
                <button
                  key={u.id}
                  className={'vl-topic' + (u.id === unitId ? ' on' : '')}
                  onClick={() => pickUnit(u.id)}
                >
                  <span className={'vl-topic-emoji ' + u.tone}>{u.emoji}</span>
                  <span className="vl-topic-body">
                    <b>{u.name}</b>
                    <small>{done}/{u.words.length} thẻ</small>
                  </span>
                  <span className={'vl-topic-pct' + (done ? ' on' : '')}>{done ? `${pct}%` : '—'}</span>
                </button>
              )
            })}
          </div>
          {units.length > UNITS_PREVIEW && (
            <button className="vl-more" onClick={() => setShowAll((v) => !v)}>
              {expanded
                ? <>Thu gọn <Icon name="chevron-up" size={14} /></>
                : <>Xem thêm {units.length - UNITS_PREVIEW} chủ đề <Icon name="chevron-down" size={14} /></>}
            </button>
          )}
        </aside>

        <main className="vl-main">
          <div className="vl-prog-head">
            <span>TIẾN ĐỘ — {unit.name.toUpperCase()}</span>
            <b>{doneInUnit} / {unit.words.length} THẺ</b>
          </div>
          <div className="vl-prog">
            <div style={{ width: `${(doneInUnit / unit.words.length) * 100}%` }} />
          </div>

          {mode === 'flash' && (
            <Flashcard
              {...common}
              box={boxOf(card.term)}
              mastered={mastered.has(card.term)}
              saved={saved.has(card.term)}
              onGrade={onGrade}
              onMaster={() => { toggleMastered(card.term); learnTerm(card.term, card.w) }}
              onSave={() => toggleSaved(card.term)}
            />
          )}
          {mode === 'guess' && <Guess {...common} />}
          {mode === 'quiz' && <Choice {...common} reverse={false} />}
          {mode === 'quizRev' && <Choice {...common} reverse />}
          {mode === 'repeat' && <Repeat {...common} />}

          <div className="vl-nav">
            <button className="vl-mini" onClick={prev}><Icon name="arrow-left" size={14} /> Thẻ trước</button>
            <span className="vl-count">Thẻ {i + 1} / {cards.length}</span>
            <button className="vl-mini" onClick={next}>Thẻ sau <Icon name="arrow-right" size={14} /></button>
          </div>

          <div className="vl-foot">
            Chủ đề {activeIdx + 1}/{units.length} · Tổng cộng {totalWords.toLocaleString('vi-VN')} thẻ trong kho
          </div>
        </main>
      </div>
    </div>
  )
}
