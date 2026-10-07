import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { romanizeLine } from '@/core/utils/romanize'
import { useRevealTop } from '../hangul/useRevealTop'
import KoText from '../numbers/KoText'
import { hintFor, joinTiles, judge, scramble, tilesFor, type LevelId, type Sentence, type Tile, type Verdict } from './sentences'
import { MASTERY } from './progress'

interface Props {
  items: Sentence[]
  level: LevelId
  title: string
  canHear: boolean
  showRom: boolean
  onFinish: (pct: number, solved: number) => void
  onAgain: () => void
  onBack: () => void
}

interface Checked {
  verdict: Verdict
  built: string[]
  hinted: boolean
}

const endMark = (ko: string) => (/[.?!]$/.test(ko) ? ko.slice(-1) : '.')

export default function BuildQuiz({ items, level, title, canHear, showRom, onFinish, onAgain, onBack }: Props) {
  const rounds = useMemo(() => items.map((s) => {
    const tiles = tilesFor(s, level)
    return { s, tiles, order: scramble(tiles) }
  }), [items, level])
  const [i, setI] = useState(0)
  const [placed, setPlaced] = useState<string[]>([])
  const [hinted, setHinted] = useState(false)
  const [checked, setChecked] = useState<Checked | null>(null)
  const [log, setLog] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const checkRef = useRef<HTMLButtonElement>(null)
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

  const put = (t: Tile) => {
    if (checked || placed.includes(t.id)) return
    setPlaced((p) => [...p, t.id])
  }

  const take = (id: string) => {
    if (checked) return
    setPlaced((p) => p.filter((x) => x !== id))
  }

  const hint = () => {
    if (checked || !cur) return
    // Giữ phần đầu đã đúng, trả các thẻ sau về, rồi đặt thêm một thẻ đúng
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
    const built = joinTiles(placedTiles)
    const verdict = judge(cur.s.words, built)
    setChecked({ verdict, built, hinted })
    setLog((l) => [...l, verdict !== 'wrong' && !hinted])
    if (canHear) speakKO(cur.s.ko, 0.85)
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
      <div className="hg-result ks-result" ref={rootRef}>
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
                key={m.s.ko}
                className="hg-wrong-row ks-wrong-row"
                onClick={() => speakKO(m.s.ko, 0.8)}
                aria-label={canHear ? `Nghe lại: ${m.s.ko}` : undefined}
              >
                <Icon name="volume" size={14} />
                <span className="ks-wrong-a">
                  <span lang="ko">{m.s.ko}</span>
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
  const preview = joinTiles(placedTiles)
  const ok = checked && checked.verdict !== 'wrong'

  return (
    <div className="hg-quiz ks-quiz" ref={rootRef}>
      <div className="hg-quiz-top">
        <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> {title}</button>
        <span className="hg-count">Câu {i + 1}/{rounds.length} · đúng {solvedSoFar}</span>
      </div>
      <div className="hg-bar"><i style={{ width: `${(i / rounds.length) * 100}%` }} /></div>

      <div className="hg-q ks-q">
        <p className="hg-ask">Xếp thẻ thành câu tiếng Hàn có nghĩa:</p>
        <p className="ks-vi">{cur.s.vi}</p>
      </div>

      <div className={'ks-answer' + (checked ? (ok ? ' ok' : ' bad') : '')} aria-label="Câu đang ghép" aria-live="polite">
        {placedTiles.length === 0 ? (
          <span className="ks-placeholder">Bấm các thẻ bên dưới theo thứ tự…</span>
        ) : (
          placedTiles.map((t) => (
            <button
              key={t.id}
              type="button"
              className={'ks-tile placed' + (t.part ? ' part' : '')}
              onClick={() => take(t.id)}
              disabled={!!checked}
              lang="ko"
              aria-label={`Bỏ thẻ ${t.text}`}
            >
              {t.text}
            </button>
          ))
        )}
      </div>
      {preview.length > 0 && !checked && (
        <p className="ks-preview" lang="ko">{preview.join(' ')}{full ? endMark(cur.s.ko) : ''}</p>
      )}

      {!checked && (
        <>
          <div className="ks-pool" role="group" aria-label="Các thẻ">
            {cur.order.map((t) => {
              const used = placed.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  className={'ks-tile' + (t.part ? ' part' : '') + (used ? ' used' : '')}
                  onClick={() => put(t)}
                  disabled={used}
                  tabIndex={used ? -1 : 0}
                  aria-hidden={used || undefined}
                  lang="ko"
                >
                  {t.text}
                </button>
              )
            })}
          </div>
          <div className="ks-tools">
            <button type="button" className="btn-ghost sm" onClick={hint}><Icon name="bulb" size={14} /> Gợi ý một thẻ</button>
            <button type="button" className="btn-ghost sm" onClick={() => setPlaced([])} disabled={!placed.length}>
              <Icon name="refresh" size={14} /> Xếp lại
            </button>
            <button ref={checkRef} type="button" className="btn-primary sm ks-check" onClick={check} disabled={!full}>
              Kiểm tra
            </button>
          </div>
          {level === 'hard' && (
            <p className="hg-note ks-note">Thẻ viền chấm là trợ từ — nó sẽ tự dính vào thẻ đứng ngay trước.</p>
          )}
        </>
      )}

      {checked && (
        <div className={'hg-feedback ks-feedback' + (ok ? ' ok' : ' bad')} role="status">
          <div className="ks-fb-body">
            <p>
              <b>
                {checked.verdict === 'wrong' ? 'Chưa đúng.' : checked.hinted ? 'Đúng — nhưng có dùng gợi ý.' : checked.verdict === 'alt' ? 'Cũng đúng!' : 'Chính xác!'}
              </b>{' '}
              {checked.verdict === 'alt' && 'Tiếng Hàn cho đổi chỗ các cụm có trợ từ trước động từ; câu gốc nghe tự nhiên hơn.'}
              {checked.verdict === 'wrong' && <KoText text={hintFor(cur.s.words, checked.built)} />}
            </p>
            {checked.verdict === 'wrong' && (
              <p className="ks-yours">Bạn ghép: <span lang="ko">{checked.built.join(' ')}</span></p>
            )}
            <p className="ks-fb-say">
              {checked.verdict !== 'exact' && <span className="ks-fb-label">{checked.verdict === 'alt' ? 'Câu gốc:' : 'Đáp án:'}</span>}
              <span lang="ko">{cur.s.ko}</span>
              {canHear && (
                <button className="kn-icon-btn" onClick={() => speakKO(cur.s.ko, 0.8)} aria-label="Nghe cả câu">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </p>
            {showRom && <p className="ks-fb-rom">{romanizeLine(cur.s.ko)}</p>}
          </div>
          <button ref={nextRef} className="btn-primary sm" onClick={next}>
            {i + 1 >= rounds.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
