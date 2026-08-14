import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { UNITS } from '@/data/englishCore'
import { wTerm } from '@/data/vocabCore'
import { normalizeAnswer, type ActiveChunk } from '@/data/englishActive'
import ProduceCard from '../active/ProduceCard'
import { useDeep } from './deep'
import type { DeepExample, DeepWord } from './wordData'

type Kind = 'quiz' | 'listen' | 'speak' | 'write'

const KINDS: { id: Kind; name: string; sub: string; icon: IconName }[] = [
  { id: 'quiz', name: 'Trắc nghiệm', sub: 'Chọn đáp án đúng', icon: 'target' },
  { id: 'listen', name: 'Nghe & điền', sub: 'Nghe và điền từ còn thiếu', icon: 'headphones' },
  { id: 'speak', name: 'Nói câu với từ', sub: 'Luyện nói với từ này', icon: 'mic' },
  { id: 'write', name: 'Viết câu', sub: 'Viết câu có dùng từ này', icon: 'note' },
]

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function blankOut(sentence: string, term: string): { masked: string; hit: boolean } {
  const re = new RegExp(`(^|[^a-zA-Z'])(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*)`, 'i')
  if (!re.test(sentence)) return { masked: sentence, hit: false }
  return { masked: sentence.replace(re, (_m, p1) => `${p1}______`), hit: true }
}

interface Props {
  dw: DeepWord
  examples: DeepExample[]
  start?: string
  onDone: () => void
}

export default function Practice({ dw, examples, start, onDone }: Props) {
  const { addAnswer, addHeard } = useDeep()
  const [kind, setKind] = useState<Kind>(
    KINDS.some((k) => k.id === start) ? (start as Kind) : 'quiz',
  )
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const [round, setRound] = useState(0)
  const sr = useSpeechRecognition('en-US')
  const seen = useRef('')

  const term = dw.term

  useEffect(() => {
    if (start && KINDS.some((k) => k.id === start)) setKind(start as Kind)
  }, [start])

  useEffect(() => {
    setPicked(null)
    setTyped('')
    setChecked(null)
    sr.reset()
    seen.current = ''
  }, [kind, round, term])

  const options = useMemo(() => {
    const pool = dw.unit.words.filter((w) => wTerm(w) !== term)
    const extra = UNITS.flatMap((u) => u.words).filter((w) => wTerm(w) !== term)
    const picks = [...shuffle(pool).slice(0, 3), ...shuffle(extra)].slice(0, 3)
    return shuffle([{ vi: dw.w.vi, ok: true }, ...picks.map((w) => ({ vi: w.vi, ok: false }))])
  }, [dw, term, round])

  const listenItem = useMemo(() => {
    const pool = examples.map((e) => blankOut(e.en, term)).filter((x) => x.hit)
    if (!pool.length) return null
    const idx = round % pool.length
    return { ...pool[idx], full: examples.filter((e) => blankOut(e.en, term).hit)[idx] }
  }, [examples, term, round])

  useEffect(() => {
    if (kind === 'speak' && sr.transcript && sr.transcript !== seen.current) {
      seen.current = sr.transcript
      setTyped(sr.transcript)
    }
  }, [sr.transcript, kind])

  const answer = useCallback((ok: boolean) => {
    setChecked(ok)
    addAnswer(term, ok)
  }, [addAnswer, term])

  const pseudo: ActiveChunk = useMemo(() => ({
    id: `w-${term}`,
    en: term,
    pattern: '',
    vi: dw.w.vi,
    kind: 'chunk',
    cue: '',
    say: dw.w.ex,
    alts: [],
    ask: '',
    note: '',
    trap: '',
  }), [term, dw])

  const next = () => setRound((r) => r + 1)

  return (
    <div className="dp-practice">
      <div className="dp-ptabs">
        {KINDS.map((k) => (
          <button key={k.id} className={'dp-ptab' + (kind === k.id ? ' on' : '')} onClick={() => setKind(k.id)}>
            <span className="dp-pic"><Icon name={k.icon} size={16} /></span>
            <div>
              <b>{k.name}</b>
              <small>{k.sub}</small>
            </div>
          </button>
        ))}
      </div>

      {kind === 'quiz' && (
        <div className="dp-pbox">
          <p className="dp-pq">“{term}” nghĩa là gì?</p>
          <div className="ac-options">
            {options.map((o, i) => (
              <button
                key={i}
                className={'ac-option'
                  + (checked !== null && o.ok ? ' right' : '')
                  + (checked !== null && picked === o.vi && !o.ok ? ' wrong' : '')}
                disabled={checked !== null}
                onClick={() => { setPicked(o.vi); answer(o.ok) }}
              >
                {o.vi}
              </button>
            ))}
          </div>
          {checked !== null && (
            <div className="dp-pafter">
              <span>{checked ? 'Chuẩn.' : `Đáp án đúng: ${dw.w.vi}`}</span>
              <button className="ac-next" onClick={next}>Câu tiếp <Icon name="arrow-right" size={15} /></button>
            </div>
          )}
        </div>
      )}

      {kind === 'listen' && (
        <div className="dp-pbox">
          {listenItem ? (
            <>
              <div className="dp-listen">
                <button
                  className="ac-play big"
                  onClick={() => { speakAccent(listenItem.full.en, 'us'); addHeard(term) }}
                >
                  <Icon name="volume" size={20} />
                </button>
                <button className="ac-ghost" onClick={() => speakAccent(listenItem.full.en, 'us', 0.6)}>
                  <Icon name="volume" size={14} /> Chậm
                </button>
              </div>
              <p className="dp-masked">{checked === null ? listenItem.masked : listenItem.full.en}</p>
              <p className="dp-maskvi">{listenItem.full.vi}</p>
              {checked === null ? (
                <div className="ac-tools">
                  <input
                    className="ac-input one"
                    value={typed}
                    autoFocus
                    placeholder="Điền từ còn thiếu…"
                    onChange={(e) => setTyped(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && typed.trim()) answer(normalizeAnswer(typed).startsWith(normalizeAnswer(term))) }}
                  />
                  <button className="ac-send" disabled={!typed.trim()} onClick={() => answer(normalizeAnswer(typed).startsWith(normalizeAnswer(term)))}>
                    <Icon name="check" size={15} /> Kiểm tra
                  </button>
                </div>
              ) : (
                <div className="dp-pafter">
                  <span>{checked ? 'Nghe chuẩn.' : `Từ cần điền là “${term}”.`}</span>
                  <button className="ac-next" onClick={next}>Câu tiếp <Icon name="arrow-right" size={15} /></button>
                </div>
              )}
            </>
          ) : (
            <p className="dp-empty">Chưa có câu ví dụ nào chứa từ này để làm bài nghe.</p>
          )}
        </div>
      )}

      {kind === 'speak' && (
        <div className="dp-pbox">
          <p className="dp-pq">Nói một câu của bạn có dùng từ “{term}”</p>
          <p className="dp-phint">Không cần hay — cần là câu của chính bạn. Ví dụ mẫu: “{dw.w.ex}”</p>
          <div className="ac-tools">
            {sr.supported ? (
              <button className={'ac-mic' + (sr.listening ? ' on' : '')} onClick={() => (sr.listening ? sr.stop() : sr.start())}>
                <Icon name={sr.listening ? 'stop' : 'mic'} size={15} /> {sr.listening ? 'Đang nghe…' : 'Bấm rồi nói'}
              </button>
            ) : <span className="ac-hint">Trình duyệt chưa hỗ trợ micro — hãy dùng Chrome hoặc Edge.</span>}
            <button
              className="ac-send"
              disabled={!typed.trim()}
              onClick={() => answer(normalizeAnswer(typed).includes(normalizeAnswer(term)))}
            >
              <Icon name="check" size={15} /> Kiểm tra
            </button>
          </div>
          {sr.interim && <div className="ac-interim">{sr.interim}</div>}
          {typed && <p className="dp-said">Bạn nói: “{typed}”</p>}
          {checked !== null && (
            <div className="dp-pafter">
              <span>{checked ? `Câu của bạn có dùng “${term}”.` : `Chưa nghe thấy từ “${term}” trong câu.`}</span>
              <button className="ac-next" onClick={next}>Nói câu khác <Icon name="arrow-right" size={15} /></button>
            </div>
          )}
        </div>
      )}

      {kind === 'write' && (
        <ProduceCard
          key={`w-${term}-${round}`}
          task="use"
          target={pseudo}
          rows={3}
          placeholder={`Viết một câu tiếng Anh có dùng “${term}”…`}
          brief={
            <>
              <b>Viết một câu có dùng “{term}”</b>
              <span>AI sẽ sửa ngữ pháp, gợi ý cách người bản xứ hay nói hơn, và ghi lỗi vào Sổ lỗi.</span>
            </>
          }
          onResult={(r) => addAnswer(term, r.ok)}
          onNext={next}
          nextLabel="Viết câu khác"
        />
      )}

      <div className="dp-pfoot">
        <span>Làm đủ bốn dạng là bạn đã soi từ này từ bốn phía khác nhau.</span>
        <button className="ac-next" onClick={onDone}>Đánh dấu đã luyện xong <Icon name="check" size={15} /></button>
      </div>
    </div>
  )
}
