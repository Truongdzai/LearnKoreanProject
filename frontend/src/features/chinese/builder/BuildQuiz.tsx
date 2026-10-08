import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakZH } from '@/core/tts'
import { useRevealTop } from '../../korean/hangul/useRevealTop'
import { hintFor, judge, pinyinOf, scramble, tilesFor, type Sentence, type Verdict } from './sentences'
import { MASTERY } from './progress'

interface Props {
  items: Sentence[]
  title: string
  canHear: boolean
  showPy: boolean
  onFinish: (pct: number, solved: number) => void
  onAgain: () => void
  onBack: () => void
}

interface Checked {
  verdict: Verdict
  built: string[]
  hinted: boolean
}

function ZhText({ text }: { text: string }) {
  const parts = text.split(/(\p{Script=Han}+)/u)
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} lang="zh">{p}</span> : p))}</>
}

export default function BuildQuiz({ items, title, canHear, showPy, onFinish, onAgain, onBack }: Props) {
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

  // Câu mới: đưa focus về thẻ đầu tiên để dùng bàn phím liền mạch
  useEffect(() => {
    if (!done) poolRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true })
  }, [i, done])

  const put = (id: string) => {
    if (checked || placed.includes(id)) return
    setPlaced((p) => [...p, id])
    // Thẻ vừa bấm bị ẩn: chuyển focus sang thẻ còn lại kế tiếp
    window.setTimeout(() => poolRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true }), 0)
  }

  const take = (id: string) => {
    if (checked) return
    setPlaced((p) => p.filter((x) => x !== id))
  }

  const hint = () => {
    if (checked || !cur) return
    let k = 0
    while (k < placed.length && byId.get(placed[k])?.text === cur.tiles[k].text) k++
    if (k >= cur.tiles.length) return
    const keep = placed.slice(0, k)
    const want = cur.tiles[k].text
    const next = cur.order.find((t) => t.text === want && !keep.includes(t.id))
    if (!next) return
    setPlaced([...keep, next.id])
    setHinted(true)
  }

  const check = () => {
    if (checked || !full || !cur) return
    const built = placedTiles.map((t) => t.text)
    const verdict = judge(cur.s.tiles, built)
    setChecked({ verdict, built, hinted })
    setLog((l) => [...l, verdict !== 'wrong' && !hinted])
    if (canHear) speakZH(cur.s.zh, 0.8)
  }

  const next = () => {
    if (i + 1 >= rounds.length) {
      setDone(true)
      const solved = log.filter(Boolean).length
      onFinish(Math.round((solved / rounds.length) * 100), solved)
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
      <div className="hg-result zs-result" ref={rootRef}>
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
                key={m.s.zh}
                className="hg-wrong-row zs-wrong-row"
                onClick={() => speakZH(m.s.zh, 0.8)}
                aria-label={canHear ? `Nghe lại: ${m.s.zh}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span className="zs-wrong-a">
                  <span lang="zh">{m.s.zh}</span>
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
  const ok = checked && checked.verdict !== 'wrong'

  return (
    <div className="hg-quiz zs-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{rounds.length} · đúng {solvedSoFar}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / rounds.length) * 100}%` }} /></div>

      <div className="hg-q zs-q">
        <p className="hg-ask">Xếp thẻ thành câu tiếng Trung có nghĩa:</p>
        <p className="zs-vi">{cur.s.vi}</p>
      </div>

      <div className={'zs-answer' + (checked ? (ok ? ' ok' : ' bad') : '')} aria-label="Câu đang ghép" aria-live="polite">
        {placedTiles.length === 0 ? (
          <span className="zs-placeholder">Bấm các thẻ bên dưới theo thứ tự…</span>
        ) : (
          placedTiles.map((t) => (
            <button
              key={t.id}
              type="button"
              className="zs-tile placed"
              onClick={() => take(t.id)}
              disabled={!!checked}
              lang="zh"
              aria-label={`Bỏ thẻ ${t.text}`}
            >
              {t.text}
            </button>
          ))
        )}
      </div>

      {!checked && (
        <>
          <div className="zs-pool" role="group" aria-label="Các thẻ" ref={poolRef}>
            {cur.order.map((t) => {
              const used = placed.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  className={'zs-tile' + (used ? ' used' : '')}
                  onClick={() => put(t.id)}
                  disabled={used}
                  tabIndex={used ? -1 : 0}
                  aria-hidden={used || undefined}
                  lang="zh"
                >
                  {t.text}
                </button>
              )
            })}
          </div>
          <div className="zs-tools">
            <button type="button" className="btn-ghost sm" onClick={hint}><Icon name="bulb" size={14} /> Gợi ý một thẻ</button>
            <button type="button" className="btn-ghost sm" onClick={() => setPlaced([])} disabled={!placed.length}>
              <Icon name="refresh" size={14} /> Xếp lại
            </button>
            <button ref={checkRef} type="button" className="btn-primary sm zs-check" onClick={check} disabled={!full}>
              Kiểm tra
            </button>
          </div>
        </>
      )}

      {checked && (
        <div className={'hg-feedback zs-feedback' + (ok ? ' ok' : ' bad')} role="status">
          <div className="zs-fb-body">
            <p>
              <b>
                {checked.verdict === 'wrong' ? 'Chưa đúng.' : checked.hinted ? 'Đúng — nhưng có dùng gợi ý.' : checked.verdict === 'alt' ? 'Cũng đúng!' : 'Chính xác!'}
              </b>{' '}
              {checked.verdict === 'alt' && 'Từ chỉ thời gian đứng đầu câu hay ngay sau chủ ngữ đều được.'}
              {checked.verdict === 'wrong' && <ZhText text={hintFor(cur.s.tiles, checked.built)} />}
            </p>
            {checked.verdict === 'wrong' && (
              <p className="zs-yours">Bạn ghép: <span lang="zh">{checked.built.join('')}{cur.s.end}</span></p>
            )}
            <p className="zs-fb-say">
              {checked.verdict !== 'exact' && <span className="zs-fb-label">{checked.verdict === 'alt' ? 'Câu gốc:' : 'Đáp án:'}</span>}
              <span lang="zh">{cur.s.zh}</span>
              {canHear && (
                <button className="zs-icon-btn" onClick={() => speakZH(cur.s.zh, 0.8)} aria-label="Nghe cả câu">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
            {showPy && pinyinOf(cur.s.zh) && <p className="zs-fb-rom">{pinyinOf(cur.s.zh)}</p>}
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= rounds.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
