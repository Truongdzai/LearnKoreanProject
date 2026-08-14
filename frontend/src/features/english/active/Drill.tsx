import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import {
  ALL_CHUNKS, DIM_BY_ID, KIND_LABEL, familiesOf, familySiblings, levelSpec,
  matchSay, packOfChunk, speedBand, SPEED_LABEL,
  type ActiveChunk, type Dim,
} from '@/data/englishActive'
import { useMastery, nextDim } from './mastery'
import ProduceCard from './ProduceCard'

interface Props {
  queue: ActiveChunk[]
  forceDim?: Dim
  heading?: string
  onFinish?: () => void
}

type Phase = 'ask' | 'show'

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function distractors(target: ActiveChunk, n: number): ActiveChunk[] {
  const family = shuffle(familySiblings(target))
  const pack = packOfChunk(target.id)
  const near = shuffle((pack?.chunks ?? []).filter((c) => c.id !== target.id))
  const far = shuffle(ALL_CHUNKS.filter((c) => c.id !== target.id))

  const out: ActiveChunk[] = []
  const seen = new Set<string>([target.id])
  for (const pool of [family, near, far]) {
    for (const c of pool) {
      if (out.length >= n) break
      if (seen.has(c.id)) continue
      seen.add(c.id)
      out.push(c)
    }
  }
  return out
}

function Timer({ from, stopAt }: { from: number; stopAt: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (stopAt) return
    setNow(Date.now())
    const t = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(t)
  }, [from, stopAt])
  const v = Math.max(0, (stopAt || now) - from) / 1000
  return (
    <span className={'ac-timer' + (v > 5 ? ' slow' : v > 2.5 ? ' ok' : '') + (stopAt ? ' fixed' : '')}>
      {v.toFixed(1)}s
    </span>
  )
}

export default function Drill({ queue, forceDim, heading, onFinish }: Props) {
  const { recOf, hit, miss } = useMastery()
  const sr = useSpeechRecognition('en-US')
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<Phase>('ask')
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [verdict, setVerdict] = useState<'ok' | 'close' | 'no' | null>(null)
  const [done, setDone] = useState<{ ok: number; ms: number[] }>({ ok: 0, ms: [] })
  const startRef = useRef(Date.now())
  const firstRef = useRef(0)
  const [firstAt, setFirstAt] = useState(0)

  const markFirst = useCallback(() => {
    if (firstRef.current) return
    firstRef.current = Date.now()
    setFirstAt(firstRef.current)
  }, [])

  const latency = useCallback(
    () => (firstRef.current || Date.now()) - startRef.current,
    [],
  )

  const [cards, setCards] = useState<ActiveChunk[]>(queue)
  useEffect(() => {
    if (!cards.length && queue.length) setCards(queue)
  }, [queue, cards.length])

  const chunk = cards[i]

  const recRef = useRef(recOf)
  recRef.current = recOf

  const [dim, setDim] = useState<Dim>(
    () => forceDim ?? (chunk ? nextDim(recOf(chunk.id)) : 'recognize'),
  )
  const spec = DIM_BY_ID[dim]

  useEffect(() => {
    if (!chunk) return
    setDim(forceDim ?? nextDim(recRef.current(chunk.id)))
    startRef.current = Date.now()
    firstRef.current = 0
    setFirstAt(0)
    setPhase('ask')
    setPicked(null)
    setTyped('')
    setVerdict(null)
    sr.reset()
  }, [chunk?.id, forceDim])

  useEffect(() => {
    if (dim === 'listen' && chunk && phase === 'ask') {
      const t = window.setTimeout(() => speakAccent(chunk.say, 'us'), 260)
      return () => window.clearTimeout(t)
    }
  }, [dim, chunk?.id, phase])

  useEffect(() => {
    if (sr.transcript) setTyped((t) => (t ? `${t} ${sr.transcript}`.trim() : sr.transcript))
  }, [sr.transcript])

  const options = useMemo(() => {
    if (!chunk || (dim !== 'recognize' && dim !== 'listen')) return []
    return shuffle([chunk, ...distractors(chunk, 3)])
  }, [chunk?.id, dim])

  const settle = useCallback((ok: boolean, ms: number) => {
    if (!chunk) return
    if (ok) hit(chunk.id, dim, ms)
    else miss(chunk.id, dim)
    setDone((d) => ({ ok: d.ok + (ok ? 1 : 0), ms: ok && ms ? [...d.ms, ms] : d.ms }))
    setPhase('show')
  }, [chunk, dim, hit, miss])

  const choose = useCallback((id: string) => {
    if (phase === 'show' || !chunk) return
    markFirst()
    setPicked(id)
    settle(id === chunk.id, latency())
  }, [phase, chunk, settle, markFirst, latency])

  const checkTyped = useCallback(() => {
    if (!chunk || phase === 'show') return
    const ms = latency()
    const m = matchSay(typed, chunk)
    setVerdict(m.ok ? 'ok' : m.close ? 'close' : 'no')
    settle(m.ok || m.close, ms)
  }, [chunk, typed, phase, settle, latency])

  const next = useCallback(() => {
    if (i + 1 >= cards.length) onFinish?.()
    else setI(i + 1)
  }, [i, cards.length, onFinish])

  if (!chunk) {
    return (
      <div className="ac-empty">
        <Icon name="check-circle" size={30} />
        <b>Không còn cụm nào tới hạn</b>
        <p>Chọn một gói tình huống ở tab Kho cụm để nạp thêm, hoặc quay lại sau khi ôn tập tới hạn.</p>
      </div>
    )
  }

  const rec = recOf(chunk.id)
  const lv = levelSpec(rec.lv)
  const pack = packOfChunk(chunk.id)
  const finished = i + 1 >= cards.length

  return (
    <div className="ac-drill">
      <div className="ac-drill-head">
        <div>
          <span className="ac-drill-kicker">{heading || 'Phòng truy xuất'}</span>
          <b>{spec.question}</b>
        </div>
        <div className="ac-drill-meta">
          <span className={'ac-dim ' + spec.tone}><Icon name={spec.icon} size={13} /> {spec.name}</span>
          <span className="ac-lvchip">Đang ở mức {rec.lv}: {lv.name}</span>
        </div>
      </div>

      <div className="ac-drill-bar">
        <div style={{ width: `${((i + (phase === 'show' ? 1 : 0)) / cards.length) * 100}%` }} />
      </div>
      <div className="ac-drill-count">
        Câu {i + 1}/{cards.length} · đúng {done.ok}
        {(dim === 'recall' || dim === 'respond') && phase === 'ask' && (
          <> · <Timer from={startRef.current} stopAt={firstAt} /></>
        )}
      </div>

      {dim === 'recognize' && (
        <>
          <div className="ac-stem">
            <b>{chunk.en}</b>
            {chunk.pattern && chunk.pattern !== chunk.en && <small>{chunk.pattern}</small>}
          </div>
          <div className="ac-options">
            {options.map((o) => (
              <button
                key={o.id}
                className={'ac-option'
                  + (phase === 'show' && o.id === chunk.id ? ' right' : '')
                  + (phase === 'show' && picked === o.id && o.id !== chunk.id ? ' wrong' : '')}
                disabled={phase === 'show'}
                onClick={() => choose(o.id)}
              >
                {o.vi}
              </button>
            ))}
          </div>
        </>
      )}

      {dim === 'listen' && (
        <>
          <div className="ac-listen">
            <button className="ac-play big" onClick={() => speakAccent(chunk.say, 'us')}>
              <Icon name="volume" size={22} />
            </button>
            <span>Nghe cả câu rồi chọn cụm vừa xuất hiện. Nghe lại thoải mái.</span>
          </div>
          <div className="ac-options">
            {options.map((o) => (
              <button
                key={o.id}
                className={'ac-option en'
                  + (phase === 'show' && o.id === chunk.id ? ' right' : '')
                  + (phase === 'show' && picked === o.id && o.id !== chunk.id ? ' wrong' : '')}
                disabled={phase === 'show'}
                onClick={() => choose(o.id)}
              >
                {o.en}
              </button>
            ))}
          </div>
        </>
      )}

      {dim === 'recall' && (
        <>
          <div className="ac-cue">
            <span>TÌNH HUỐNG</span>
            <b>{chunk.cue}</b>
          </div>
          {phase === 'ask' ? (
            <>
              <input
                className="ac-input one"
                value={typed}
                autoFocus
                placeholder="Gõ câu tiếng Anh bạn nghĩ ra…"
                onChange={(e) => { markFirst(); setTyped(e.target.value) }}
                onKeyDown={(e) => { if (e.key === 'Enter') checkTyped() }}
              />
              <div className="ac-tools">
                {sr.supported && (
                  <button
                    className={'ac-mic' + (sr.listening ? ' on' : '')}
                    onClick={() => { markFirst(); sr.listening ? sr.stop() : sr.start() }}
                  >
                    <Icon name={sr.listening ? 'stop' : 'mic'} size={15} />
                    {sr.listening ? 'Đang nghe…' : 'Nói ra miệng'}
                  </button>
                )}
                <button className="ac-send" disabled={!typed.trim()} onClick={checkTyped}>
                  <Icon name="check" size={15} /> Kiểm tra
                </button>
                <button className="ac-skip" onClick={() => settle(false, 0)}>Chưa nghĩ ra</button>
              </div>
              <p className="ac-latency-note">
                Đồng hồ dừng ngay khi bạn <b>bắt đầu</b> trả lời — gõ nhanh hay chậm không tính điểm.
                Cái được đo là khoảng lặng từ lúc thấy tình huống tới lúc câu bật ra trong đầu.
              </p>
              {sr.interim && <div className="ac-interim">{sr.interim}</div>}
            </>
          ) : (
            <div className={'ac-verdict ' + (verdict ?? 'no')}>
              <b>
                {verdict === 'ok' ? 'Chuẩn' : verdict === 'close' ? 'Gần đúng — ý đúng rồi' : 'Chưa ra'}
              </b>
              {typed && <span>Bạn viết: {typed}</span>}
            </div>
          )}
        </>
      )}

      {(dim === 'use' || dim === 'respond') && phase === 'ask' && (
        <ProduceCard
          task={dim === 'use' ? 'use' : 'respond'}
          target={chunk}
          prompt={dim === 'respond' ? chunk.ask : undefined}
          speakPrompt={dim === 'respond' ? chunk.ask : undefined}
          rows={dim === 'respond' ? 2 : 3}
          placeholder={dim === 'use' ? `Đặt một câu của riêng bạn với "${chunk.en}"…` : 'Trả lời ngay bằng tiếng Anh…'}
          brief={dim === 'use' ? (
            <>
              <b>Tự đặt câu với <em>{chunk.en}</em></b>
              <span>{chunk.pattern} — {chunk.vi}. Câu phải là chuyện thật của bạn, đừng chép câu mẫu.</span>
            </>
          ) : (
            <>
              <b>Nghe hỏi rồi đáp trong vài giây</b>
              <span>Dùng <em>{chunk.en}</em> nếu hợp. Đừng soạn sẵn cả câu trong đầu.</span>
            </>
          )}
          onResult={(r, seconds) => {
            const ok = dim === 'use' ? r.ok && r.used_target : r.ok
            settle(ok, Math.round(seconds * 1000))
          }}
        />
      )}

      {phase === 'show' && (
        <div className="ac-reveal">
          <div className="ac-reveal-main">
            <div>
              <span className="ac-kindchip">{KIND_LABEL[chunk.kind]}</span>
              <b>{chunk.en}</b>
              <small>{chunk.vi}</small>
            </div>
            <button className="ac-play" onClick={() => speakAccent(chunk.say, 'us')}>
              <Icon name="volume" size={17} />
            </button>
          </div>
          <p className="ac-reveal-say">“{chunk.say}”</p>
          {chunk.note && <p className="ac-reveal-note"><Icon name="bulb" size={14} /> {chunk.note}</p>}
          {chunk.trap && <p className="ac-reveal-trap"><Icon name="frown" size={14} /> {chunk.trap}</p>}
          <div className="ac-reveal-foot">
            <span>{pack?.emoji} {pack?.name}</span>
            <button className="ac-next" onClick={next}>
              {finished ? 'Xong lượt này' : 'Câu tiếp theo'} <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>
      )}

      {done.ms.length > 1 && (
        <div className="ac-speed-note">
          Tốc độ truy xuất trung bình lượt này:{' '}
          <b>{(done.ms.reduce((a, b) => a + b, 0) / done.ms.length / 1000).toFixed(1)}s</b>{' '}
          — {SPEED_LABEL[speedBand(done.ms.reduce((a, b) => a + b, 0) / done.ms.length)]}
        </div>
      )}
    </div>
  )
}
