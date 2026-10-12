import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import { useRevealTop } from '@/features/korean/hangul/useRevealTop'
import { bestTarget, endMark, hintFor, judge, scramble, sentenceCase, tilesFor, type Sentence, type Tile, type Verdict } from './sentences'
import { MASTERY } from './progress'

interface Props {
  items: Sentence[]
  title: string
  canHear: boolean
  onFinish: (pct: number, results: { id: string; ok: boolean }[]) => void
  onAgain: () => void
  onBack: () => void
}

interface Checked {
  verdict: Verdict
  built: string[]
  hinted: boolean
}

export default function BuildQuiz({ items, title, canHear, onFinish, onAgain, onBack }: Props) {
  const rounds = useMemo(() => items.map((s) => {
    const tiles = tilesFor(s)
    return { s, tiles, order: scramble(tiles) }
  }), [items])
  const [i, setI] = useState(0)
  const [placed, setPlaced] = useState<string[]>([])
  const [hinted, setHinted] = useState(false)
  const [checked, setChecked] = useState<Checked | null>(null)
  const [log, setLog] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const checkRef = useRef<HTMLButtonElement>(null)
  const poolRef = useRef<HTMLDivElement>(null)
  const rootRef = useRevealTop<HTMLDivElement>(done)
  const cur = rounds[i]

  const byId = useMemo(() => new Map(cur?.tiles.map((t) => [t.id, t]) ?? []), [cur])
  const placedTiles = placed.map((id) => byId.get(id)!).filter(Boolean)
  const full = !!cur && placed.length === cur.tiles.length

  useEffect(() => {
    if (checked) nextRef.current?.focus({ preventScroll: true })
  }, [checked])

  useEffect(() => {
    if (full && !checked) checkRef.current?.focus({ preventScroll: true })
  }, [full, checked])

  // Câu mới: đưa focus về thẻ đầu tiên (nút "Câu tiếp" vừa biến mất)
  useEffect(() => {
    if (!done) poolRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true })
  }, [i, done])

  // Thẻ vừa bấm bị ẩn / gỡ khỏi câu: chuyển focus sang thẻ còn lại đầu tiên để không rơi về đầu trang
  const refocus = () => window.setTimeout(() => {
    const el = poolRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')
    ;(el ?? checkRef.current)?.focus({ preventScroll: true })
  }, 0)

  const put = (t: Tile) => {
    if (checked || placed.includes(t.id)) return
    setPlaced((p) => [...p, t.id])
    refocus()
  }

  const take = (id: string) => {
    if (checked) return
    setPlaced((p) => p.filter((x) => x !== id))
    refocus()
  }

  // Giữ phần đầu đã đúng, trả các thẻ sau về, rồi đặt thêm một thẻ đúng (so theo chữ, vì có thể trùng từ như "the")
  // Bám theo cách xếp đúng (câu gốc hoặc cách khác) mà người học đang đi theo
  const hint = () => {
    if (checked || !cur) return
    const { words: target, k } = bestTarget(cur.s, placedTiles.map((t) => t.text))
    if (k >= target.length) return
    const keep = placed.slice(0, k)
    const next = cur.order.find((t) => t.text.toLowerCase() === target[k].toLowerCase() && !keep.includes(t.id))
    if (!next) return
    setPlaced([...keep, next.id])
    setHinted(true)
    refocus()
  }

  const check = () => {
    if (checked || !full || !cur) return
    const built = placedTiles.map((t) => t.text)
    const verdict = judge(cur.s, built)
    setChecked({ verdict, built, hinted })
    // Ghi kết quả ngay ở câu cuối, để thoát ở màn kết quả vẫn được tính lượt
    const all = [...log, verdict !== 'wrong' && !hinted]
    setLog(all)
    if (all.length === rounds.length) {
      onFinish(Math.round((all.filter(Boolean).length / rounds.length) * 100), rounds.map((r, k) => ({ id: r.s.id, ok: !!all[k] })))
    }
    if (canHear) speakEN(cur.s.en, 0.9)
  }

  const next = () => {
    if (i + 1 >= rounds.length) {
      setDone(true)
      return
    }
    setPlaced([])
    setHinted(false)
    setChecked(null)
    setI((x) => x + 1)
  }

  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Backspace' && !checked && placed.length) {
        e.preventDefault()
        setPlaced((p) => p.slice(0, -1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!rounds.length) return null

  if (done) {
    const solved = log.filter(Boolean).length
    const pct = Math.round((solved / rounds.length) * 100)
    const good = pct >= MASTERY
    const missed = rounds.filter((_, k) => !log[k])
    return (
      <div className="hg-result eb-result" ref={rootRef}>
        <div className={'hg-score' + (good ? ' ok' : '')}>
          <b>{pct}%</b>
          <span>{solved}/{rounds.length} câu tự ghép đúng</span>
        </div>
        <h3>{good ? 'Trật tự câu đã vào tay — thử cấp khó hơn' : 'Xong một lượt — đọc to lại các câu bên dưới'}</h3>
        {missed.length > 0 && (
          <div className="hg-wrong">
            <div className="section-title"><span className="pin" /> Câu sai hoặc phải dùng gợi ý</div>
            {missed.map((m) => (
              <button
                key={m.s.id}
                className="hg-wrong-row eb-wrong-row"
                onClick={canHear ? () => speakEN(m.s.en, 0.85) : undefined}
                aria-label={canHear ? `Nghe lại: ${m.s.en}` : undefined}
              >
                {canHear ? <Icon name="volume" size={14} /> : <span />}
                <span className="eb-wrong-a">
                  <span lang="en">{m.s.en}</span>
                  <small>{m.s.vi}</small>
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="hg-actions">
          <button className="btn-primary" onClick={onAgain}><Icon name="refresh" size={15} /> Làm lượt mới</button>
          <button className="btn-ghost" onClick={onBack}><Icon name="arrow-left" size={15} /> Chọn cấp khác</button>
        </div>
      </div>
    )
  }

  const solvedSoFar = log.filter(Boolean).length
  const preview = placedTiles.map((t) => t.text)
  const ok = checked && checked.verdict !== 'wrong'

  return (
    <div className="hg-quiz eb-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{rounds.length} · đúng {solvedSoFar}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / rounds.length) * 100}%` }} /></div>

      <div className="hg-q eb-q">
        <p className="hg-ask">Xếp thẻ thành câu tiếng Anh có nghĩa:</p>
        <p className="eb-vi">{cur.s.vi}</p>
      </div>

      <div className={'eb-answer' + (checked ? (ok ? ' ok' : ' bad') : '')} aria-label="Câu đang ghép" aria-live="polite">
        {placedTiles.length === 0 ? (
          <span className="eb-placeholder">Bấm các thẻ bên dưới theo thứ tự…</span>
        ) : (
          placedTiles.map((t) => (
            <button
              key={t.id}
              type="button"
              className="eb-tile placed"
              onClick={() => take(t.id)}
              disabled={!!checked}
              lang="en"
              aria-label={`Bỏ thẻ ${t.text}`}
            >
              {t.text}
            </button>
          ))
        )}
      </div>
      {preview.length > 0 && !checked && (
        <p className="eb-preview" lang="en">{sentenceCase(preview)}{full ? endMark(cur.s.en) : ''}</p>
      )}

      {!checked && (
        <>
          <div className="eb-pool" role="group" aria-label="Các thẻ" ref={poolRef}>
            {cur.order.map((t) => {
              const used = placed.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  className={'eb-tile' + (used ? ' used' : '')}
                  onClick={() => put(t)}
                  disabled={used}
                  tabIndex={used ? -1 : 0}
                  aria-hidden={used || undefined}
                  lang="en"
                >
                  {t.text}
                </button>
              )
            })}
          </div>
          <div className="eb-tools">
            <button type="button" className="btn-ghost sm" onClick={hint}><Icon name="bulb" size={14} /> Gợi ý một thẻ</button>
            <button type="button" className="btn-ghost sm" onClick={() => setPlaced([])} disabled={!placed.length}>
              <Icon name="refresh" size={14} /> Xếp lại
            </button>
            <button ref={checkRef} type="button" className="btn-primary sm eb-check" onClick={check} disabled={!full}>
              Kiểm tra
            </button>
          </div>
        </>
      )}

      {checked && (
        <div className={'hg-feedback eb-feedback' + (ok ? ' ok' : ' bad')} role="status">
          <div className="eb-fb-body">
            <p>
              <b>
                {checked.verdict === 'wrong' ? 'Chưa đúng.' : checked.hinted ? 'Đúng — nhưng có dùng gợi ý.' : checked.verdict === 'alt' ? 'Cũng đúng!' : 'Chính xác!'}
              </b>{' '}
              {checked.verdict === 'alt' && 'Cách xếp của bạn vẫn đúng ngữ pháp; câu gốc là cách nói phổ biến hơn.'}
              {checked.verdict === 'wrong' && hintFor(cur.s, checked.built)}
            </p>
            {checked.verdict === 'wrong' && (
              <p className="eb-yours">Bạn ghép: <span lang="en">{sentenceCase(checked.built)}{endMark(cur.s.en)}</span></p>
            )}
            <p className="eb-fb-say">
              {checked.verdict !== 'exact' && <span className="eb-fb-label">{checked.verdict === 'alt' ? 'Câu gốc:' : 'Đáp án:'}</span>}
              <span lang="en">{cur.s.en}</span>
              {canHear && (
                <button className="eb-icon-btn" onClick={() => speakEN(cur.s.en, 0.85)} aria-label="Nghe cả câu">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= rounds.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
