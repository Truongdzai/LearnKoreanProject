import { useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakZH } from '@/core/tts'
import { normalizePinyin, numberedToMarked, spokenTones } from '@/core/utils/pinyin'
import QuizRunner from '../../korean/hangul/QuizRunner'
import { shuffle, type HQuestion } from '../../korean/hangul/quiz'
import { PAIRS, WORDS, markQuestion, pairKey, pairQuestion, singleToneQuestion, spellingQuestion, type ZhWord } from './quiz'
import { pairWeights, type PinyinState } from './progress'

interface Common {
  stats: PinyinState['stats']
  onAnswer: (item: string, ok: boolean) => void
  onRound: (typed?: number) => void
}

type EarMode = 'single' | 'pair'

export function EarPractice({ stats, onAnswer, onRound, canHear }: Common & { canHear: boolean }) {
  const [quiz, setQuiz] = useState<HQuestion[] | null>(null)
  const [mode, setMode] = useState<EarMode>('pair')

  const build = (m: EarMode) => Array.from({ length: 10 }, () => (m === 'single' ? singleToneQuestion() : pairQuestion(pairWeights(stats))))

  if (!canHear) {
    return (
      <p className="hg-note">
        Máy bạn chưa có giọng đọc tiếng Trung nên chưa luyện nghe được. Cài giọng theo hướng dẫn ở trên rồi tải lại trang;
        trong lúc chờ, hãy luyện mục "Quy tắc viết" và "Gõ pinyin".
      </p>
    )
  }

  if (quiz) {
    return (
      <QuizRunner
        key={quiz[0]?.id}
        questions={quiz}
        title={mode === 'single' ? 'Nghe thanh' : 'Cặp thanh'}
        onAnswer={onAnswer}
        onFinish={() => onRound()}
        onAgain={() => setQuiz(build(mode))}
        onBack={() => setQuiz(null)}
        speak={speakZH}
        lang="zh"
      />
    )
  }

  const go = (m: EarMode) => { setMode(m); setQuiz(build(m)) }

  return (
    <div className="py-learn">
      <div className="hg-practice-pick">
        <button className="hg-pool" onClick={() => go('pair')}>
          <Icon name="headphones" size={18} />
          <b>Cặp thanh</b>
          <span>Nghe từ hai âm tiết, đoán đúng cả hai thanh — cách luyện tai hiệu quả nhất</span>
        </button>
        <button className="hg-pool" onClick={() => go('single')}>
          <Icon name="volume" size={18} />
          <b>Nghe một thanh</b>
          <span>Nghe một chữ, chọn thanh 1–4</span>
        </button>
      </div>
      <PairHeatmap stats={stats} />
    </div>
  )
}

const FIRST = [1, 2, 3, 4]
const SECOND = [1, 2, 3, 4, 5]

// Bản đồ 4×5: ô nào đỏ là cặp thanh bạn hay nghe nhầm
function PairHeatmap({ stats }: { stats: PinyinState['stats'] }) {
  const available = useMemo(() => {
    const s = new Set<string>()
    for (const w of PAIRS) s.add(pairKey(spokenTones(w.tones)))
    return s
  }, [])
  const tried = Object.keys(stats).filter((k) => k.includes('-')).length
  return (
    <div className="py-heat">
      <div className="section-title"><span className="pin" /> Bản đồ cặp thanh của bạn</div>
      <p className="hg-note">{tried ? 'Xanh: nghe chắc · vàng: còn lẫn · đỏ: hay nhầm. Lượt luyện sau sẽ hỏi nhiều hơn ở ô đỏ.' : 'Làm một lượt "Cặp thanh" để thấy bạn hay nhầm cặp nào.'}</p>
      <div className="py-heat-grid" role="table" aria-label="Độ chính xác theo cặp thanh">
        <span className="py-heat-corner" role="columnheader">1 \ 2</span>
        {SECOND.map((b) => <span key={b} className="py-heat-h" role="columnheader">{b === 5 ? 'nhẹ' : b}</span>)}
        {FIRST.map((a) => (
          <div key={a} className="py-heat-row" role="row">
            <span className="py-heat-h" role="rowheader">{a}</span>
            {SECOND.map((b) => {
              const k = `${a}-${b}`
              const [right, wrong] = stats[k] ?? [0, 0]
              const n = right + wrong
              const pct = n ? right / n : -1
              const cls = !available.has(k) ? 'na' : n === 0 ? 'none' : pct >= 0.85 ? 'good' : pct >= 0.6 ? 'mid' : 'bad'
              return (
                <span key={k} className={'py-heat-cell ' + cls} role="cell" title={n ? `${a}+${b}: đúng ${right}/${n}` : `${a}+${b}`}>
                  {n ? `${Math.round(pct * 100)}%` : available.has(k) ? '·' : '—'}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function WritePractice({ onAnswer, onRound }: Common) {
  const [quiz, setQuiz] = useState<HQuestion[] | null>(null)
  const build = () => shuffle(Array.from({ length: 10 }, (_, k) => (k % 2 ? spellingQuestion() : markQuestion())))
  if (quiz) {
    return (
      <QuizRunner
        key={quiz[0]?.id}
        questions={quiz}
        title="Quy tắc viết"
        onAnswer={onAnswer}
        onFinish={() => onRound()}
        onAgain={() => setQuiz(build())}
        onBack={() => setQuiz(null)}
        speak={speakZH}
        lang="zh"
      />
    )
  }
  return (
    <div className="hg-actions">
      <button className="btn-primary" onClick={() => setQuiz(build())}>
        <Icon name="target" size={15} /> Làm 10 câu: đặt dấu thanh và viết y/w/ü
      </button>
    </div>
  )
}

const ROUND = 10

// 不 và 一 có lúc được ghi theo thanh đã biến (bú, yí): chấp nhận cả cách ghi thanh gốc lẫn thanh đã biến
const VARIANTS: Record<string, string[]> = { bù: ['bú'], bú: ['bù'], yī: ['yí', 'yì'], yí: ['yī', 'yì'], yì: ['yī', 'yí'] }

function acceptedForms(w: ZhWord): Set<string> {
  const chars = Array.from(w.zh).filter((c) => /[\u4e00-\u9fff]/.test(c))
  let forms: string[][] = [[]]
  w.syl.forEach((s, k) => {
    const alts = (chars[k] === '不' || chars[k] === '一') ? [s, ...(VARIANTS[s] ?? [])] : [s]
    forms = forms.flatMap((f) => alts.map((a) => [...f, a]))
  })
  return new Set(forms.map((f) => normalizePinyin(f.join(''))))
}

export function TypingPractice({ onAnswer, onRound, canHear }: Common & { canHear: boolean }) {
  const [round, setRound] = useState<ZhWord[]>(() => shuffle(WORDS).slice(0, ROUND))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [tries, setTries] = useState(0)
  const [state, setState] = useState<'typing' | 'ok' | 'shown'>('typing')
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const w = round[idx]
  const preview = numberedToMarked(input)
  const accepted = useMemo(() => (w ? acceptedForms(w) : new Set<string>()), [w])

  const restart = () => {
    setRound(shuffle(WORDS).slice(0, ROUND)); setIdx(0); setInput(''); setTries(0); setState('typing'); setScore(0); setDone(false)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const next = () => {
    if (idx + 1 >= round.length) {
      setDone(true)
      onRound(round.length)
      return
    }
    setIdx(idx + 1); setInput(''); setTries(0); setState('typing')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const check = () => {
    if (state !== 'typing') { next(); return }
    if (!input.trim()) return
    if (accepted.has(normalizePinyin(preview))) {
      setState('ok')
      if (tries === 0) setScore((s) => s + 1)
      onAnswer('type', tries === 0)
      if (canHear) speakZH(w.zh, 0.85)
      return
    }
    if (tries >= 1) {
      setState('shown')
      onAnswer('type', false)
      if (canHear) speakZH(w.zh, 0.85)
    } else {
      setTries(tries + 1)
    }
  }

  if (done) {
    const pct = Math.round((score / round.length) * 100)
    return (
      <div className="hg-result">
        <div className={'hg-score' + (pct >= 80 ? ' ok' : '')}><b>{pct}%</b><span>{score}/{round.length} đúng ngay lần đầu</span></div>
        <div className="hg-actions"><button className="btn-primary" onClick={restart}><Icon name="refresh" size={15} /> Lượt mới</button></div>
      </div>
    )
  }

  return (
    <div className="py-type">
      <p className="hg-note">
        Gõ pinyin kiểu số: số 1–4 ngay sau mỗi âm tiết là thanh điệu, thanh nhẹ để trống (hoặc số 5); "v" thay cho "ü".
        Ví dụ <b>ni3 hao3</b> → nǐ hǎo, <b>lv4</b> → lǜ, <b>xie4xie</b> → xièxie.
      </p>
      <div className={'py-type-card' + (state === 'ok' ? ' ok' : state === 'shown' ? ' bad' : tries ? ' bad' : '')}>
        <div className="hg-type-meta"><span>{idx + 1}/{round.length}</span><span>Đúng: {score}</span></div>
        <div className="py-type-zh" lang="zh">{w.zh}</div>
        <div className="hg-target-vi">{w.vi}</div>
        <input
          ref={inputRef}
          className="hg-input py-type-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') check() }}
          placeholder="vd: ni3 hao3"
          aria-label={`Gõ pinyin cho ${w.zh}`}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          readOnly={state !== 'typing'}
          autoFocus
        />
        <div className="py-preview">{preview || ' '}</div>
        {tries > 0 && state === 'typing' && <div className="hg-type-warn">Chưa đúng — kiểm tra lại thanh điệu và vần, còn một lần thử.</div>}
        {state !== 'typing' && (
          <div className={'hg-feedback ' + (state === 'ok' ? 'ok' : 'bad')}>
            <b>{state === 'ok' ? 'Chính xác!' : 'Đáp án:'}</b> {w.pinyin}
            {canHear && <button className="btn-ghost sm" onClick={() => speakZH(w.zh, 0.8)}><Icon name="volume" size={13} /> Nghe</button>}
          </div>
        )}
        <div className="hg-actions">
          <button className="btn-primary sm" onClick={check}>
            {state === 'typing' ? 'Kiểm tra' : idx + 1 >= round.length ? 'Xem kết quả' : 'Từ tiếp'} <Icon name="arrow-right" size={14} />
          </button>
          {state === 'typing' && <button className="btn-ghost sm" onClick={() => { setState('shown'); onAnswer('type', false) }}>Xem đáp án</button>}
        </div>
      </div>
    </div>
  )
}
