import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { KEY_ROWS, compose, composeKeys, isVowel, jamoForKey, keyForJamo, toJamoKeys } from '@/core/utils/hangul'
import { KO_ALL_WORDS } from '@/data/koreanCore'
import { shuffle, wordPool } from './quiz'

type Level = 'keys' | 'syll' | 'words' | 'phrases'

const LEVELS: { id: Level; label: string; desc: string; size: number }[] = [
  { id: 'keys', label: 'Từng phím', desc: 'Nhớ vị trí: phụ âm nằm bên tay trái, nguyên âm bên tay phải.', size: 15 },
  { id: 'syll', label: 'Âm tiết', desc: 'Gõ phụ âm → nguyên âm → (patchim), bộ gõ tự ghép thành khối chữ.', size: 10 },
  { id: 'words', label: 'Từ vựng', desc: 'Từ thật trong lộ trình 90 ngày, kèm nghĩa.', size: 10 },
  { id: 'phrases', label: 'Câu ngắn', desc: 'Câu ví dụ ngắn — nhớ bấm Space giữa các từ.', size: 8 },
]

interface Target {
  text: string
  vi?: string
}

const SHORT_SENTENCES: Target[] = KO_ALL_WORDS.flatMap((w) => {
  const s = w.ex.replace(/[.?!,]/g, '').trim()
  return /^[가-힣]+( [가-힣]+)+$/.test(s) && s.length <= 14 ? [{ text: s, vi: w.exVi }] : []
})

const COMMON_TAILS = ['ㄴ', 'ㄹ', 'ㅁ', 'ㅇ', 'ㄱ', 'ㅂ', 'ㅅ']
const SYL_LEADS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ']
const SYL_VOWELS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅘ', 'ㅝ', 'ㅚ', 'ㅟ', 'ㅢ']

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

function makeRound(level: Level): Target[] {
  const size = LEVELS.find((l) => l.id === level)!.size
  if (level === 'keys') {
    const all = KEY_ROWS.flat().flatMap((k) => (k.shift ? [k.base, k.base, k.shift] : [k.base]))
    return shuffle(all).slice(0, size).map((text) => ({ text }))
  }
  if (level === 'syll') {
    return Array.from({ length: size }, () => {
      const tail = Math.random() < 0.35 ? pick(COMMON_TAILS) : ''
      return { text: compose(pick(SYL_LEADS), pick(SYL_VOWELS), tail) }
    })
  }
  if (level === 'words') {
    return shuffle(wordPool()).slice(0, size).map((w) => ({ text: w.ko!, vi: w.vi }))
  }
  return shuffle(SHORT_SENTENCES).slice(0, size)
}

const syllableCount = (s: string) => Array.from(s).filter((c) => /[가-힣ㄱ-ㅣ]/.test(c)).length

interface Props {
  best: number
  canHear: boolean
  onRound: (items: number, perMinute: number) => void
}

export default function TypingTrainer({ best, canHear, onRound }: Props) {
  const [level, setLevel] = useState<Level>('keys')
  const [listenPref, setListen] = useState(false)
  const listen = listenPref && canHear
  const [round, setRound] = useState<Target[]>(() => makeRound('keys'))
  const [idx, setIdx] = useState(0)
  const [keys, setKeys] = useState<string[]>([])
  const [errors, setErrors] = useState(0)
  const [shift, setShift] = useState(false)
  const [hint, setHint] = useState(true)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [finished, setFinished] = useState<{ spm: number; acc: number; items: number } | null>(null)
  const [revealed, setRevealed] = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)
  // Bộ đếm của lượt để trong ref: cập nhật ngay trong lúc gõ nhanh, không chờ render.
  const run = useRef({ hits: 0, errors: 0, skipped: 0, syl: 0, startAt: 0, lock: false })

  const target = round[idx]
  const expected = useMemo(() => (target ? toJamoKeys(target.text) : []), [target])
  const composed = composeKeys(keys)
  const okPrefix = keys.every((k, i) => expected[i] === k)
  const nextKey = okPrefix ? expected[keys.length] : undefined
  const nextInfo = nextKey && nextKey !== ' ' ? keyForJamo(nextKey) : null

  const start = useCallback((lv: Level) => {
    setLevel(lv)
    setRound(makeRound(lv))
    setIdx(0)
    setKeys([])
    setErrors(0)
    setFinished(null)
    setRevealed(false)
    run.current = { hits: 0, errors: 0, skipped: 0, syl: 0, startAt: 0, lock: false }
    window.setTimeout(() => areaRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    areaRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (listen && target && !finished) {
      const t = window.setTimeout(() => speakKO(target.text, 0.8), 300)
      return () => window.clearTimeout(t)
    }
  }, [idx, round, listen])

  const advance = (wasSkip: boolean) => {
    const r = run.current
    if (wasSkip) r.skipped += 1
    else r.syl += syllableCount(target.text)
    r.lock = false
    setRevealed(false)
    setKeys([])
    if (idx + 1 < round.length) {
      setIdx(idx + 1)
      return
    }
    const mins = r.startAt ? Math.max((Date.now() - r.startAt) / 60000, 1 / 60) : 1
    const spm = Math.round(r.syl / mins)
    const total = r.hits + r.errors
    const items = round.length - r.skipped
    setFinished({ spm, acc: total ? Math.round((r.hits / total) * 100) : 100, items })
    onRound(items, level === 'keys' ? 0 : spm)
  }

  const press = (j: string) => {
    const r = run.current
    if (finished || !target || r.lock) return
    if (!r.startAt) r.startAt = Date.now()
    setShift(false)
    const next = [...keys, j]
    const good = next.every((k, i) => expected[i] === k)
    if (good) {
      r.hits += 1
    } else if (okPrefix) {
      r.errors += 1
      setErrors(r.errors)
      setFlash('bad')
      window.setTimeout(() => setFlash(null), 300)
    }
    setKeys(next)
    if (good && next.length === expected.length) {
      r.lock = true
      setFlash('ok')
      window.setTimeout(() => {
        setFlash(null)
        // Người học đã đổi cấp trong lúc chờ thì lượt cũ không còn, bỏ qua.
        if (run.current === r) advance(false)
      }, 380)
    }
  }

  const back = () => {
    if (!run.current.lock) setKeys((k) => k.slice(0, -1))
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.code === 'Backspace') { e.preventDefault(); back(); return }
    if (e.code === 'Space') { e.preventDefault(); press(' '); return }
    if (e.code === 'Enter') {
      e.preventDefault()
      if (finished) start(level)
      else if (run.current.lock) return
      else if (listen && !revealed) setRevealed(true)
      else advance(true)
      return
    }
    const j = jamoForKey(e.code, e.shiftKey)
    if (j) { e.preventDefault(); press(j) }
  }

  if (finished) {
    return (
      <div className="hg-result">
        <div className="hg-score ok">
          <b>{level === 'keys' ? `${finished.acc}%` : finished.spm}</b>
          <span>{level === 'keys' ? 'gõ đúng phím' : 'âm tiết / phút'}</span>
        </div>
        <h3>Xong {finished.items}/{round.length} mục · độ chính xác {finished.acc}%</h3>
        {level !== 'keys' && best > 0 && <p className="hg-note">Kỷ lục của bạn: {Math.max(best, finished.spm)} âm tiết/phút. Người Hàn gõ thường 200–300.</p>}
        <div className="hg-actions">
          <button className="btn-primary" onClick={() => start(level)}><Icon name="refresh" size={15} /> Lượt mới</button>
          {level !== 'phrases' && (
            <button className="btn-ghost" onClick={() => start(LEVELS[LEVELS.findIndex((l) => l.id === level) + 1].id)}>
              Lên cấp tiếp <Icon name="arrow-right" size={14} />
            </button>
          )}
        </div>
      </div>
    )
  }

  const showTarget = !listen || revealed

  return (
    <div className="hg-typing">
      <div className="hg-type-tools">
        <div className="vl-modes">
          {LEVELS.map((l) => (
            <button key={l.id} className={'vl-mode' + (level === l.id ? ' on' : '')} onClick={() => start(l.id)}>{l.label}</button>
          ))}
        </div>
        <label className="hg-toggle" title={canHear ? undefined : 'Máy chưa có giọng đọc tiếng Hàn'}>
          <input type="checkbox" checked={listen} disabled={!canHear} onChange={(e) => { setListen(e.target.checked); areaRef.current?.focus() }} />
          Nghe rồi gõ (chép chính tả)
        </label>
        <label className="hg-toggle">
          <input type="checkbox" checked={hint} onChange={(e) => { setHint(e.target.checked); areaRef.current?.focus() }} />
          Gợi ý phím
        </label>
      </div>
      <p className="hg-note">{LEVELS.find((l) => l.id === level)!.desc}</p>

      <div
        ref={areaRef}
        className={'hg-type-area' + (flash ? ' ' + flash : '')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="textbox"
        aria-label="Vùng gõ tiếng Hàn: bấm vào đây rồi gõ bằng bàn phím"
        aria-describedby="hg-type-help"
      >
        <div className="hg-type-meta">
          <span>{idx + 1}/{round.length}</span>
          <span>Lỗi: {errors}</span>
        </div>
        <div className="hg-target" lang="ko">
          {showTarget ? target.text : (
            <button className="btn-ghost sm" onClick={() => speakKO(target.text, 0.8)}><Icon name="volume" size={14} /> Nghe lại</button>
          )}
        </div>
        {target.vi && showTarget && <div className="hg-target-vi">{target.vi}</div>}
        <div className={'hg-typed' + (okPrefix ? '' : ' bad')} lang="ko">
          {composed || <span className="hg-placeholder">Bấm vào đây rồi gõ…</span>}
          <i className="hg-caret" />
        </div>
        {!okPrefix && <div className="hg-type-warn">Sai phím — bấm ⌫ Backspace để xoá.</div>}
        <p id="hg-type-help" className="hg-type-help">
          Enter: {listen && !revealed ? 'xem đáp án' : 'bỏ qua'} · Backspace: xoá một phím · Đang bật Unikey/EVKey thì chuyển sang gõ tiếng Anh (E) để phím không bị đổi dấu.
        </p>
      </div>

      <div className="hg-kb" aria-label="Bàn phím tiếng Hàn 2-set">
        {KEY_ROWS.map((row, r) => (
          <div key={r} className={'hg-kb-row r' + r}>
            {row.map((k) => {
              const label = shift && k.shift ? k.shift : k.base
              const isNext = hint && nextInfo?.code === k.code
              return (
                <button
                  key={k.code}
                  className={'hg-key-btn' + (isVowel(k.base) ? ' v' : ' c') + (isNext ? ' next' : '')}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => press(label)}
                  aria-label={`${label} (phím ${k.latin})`}
                  lang="ko"
                >
                  {k.shift && <sup>{shift ? k.base : k.shift}</sup>}
                  <b>{label}</b>
                  <small>{k.latin}</small>
                </button>
              )
            })}
          </div>
        ))}
        <div className="hg-kb-row r3">
          <button
            className={'hg-key-btn wide' + (shift ? ' on' : '') + (hint && nextInfo?.shift ? ' next' : '')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShift((s) => !s)}
            aria-pressed={shift}
          >
            ⇧ Shift
          </button>
          <button
            className={'hg-key-btn space' + (hint && nextKey === ' ' ? ' next' : '')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => press(' ')}
          >
            Space
          </button>
          <button className="hg-key-btn wide" onMouseDown={(e) => e.preventDefault()} onClick={back} aria-label="Xoá một phím">
            ⌫
          </button>
        </div>
      </div>
    </div>
  )
}
