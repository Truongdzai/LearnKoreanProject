import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import {
  KIND_LABEL, matchAny, normalizeAnswer,
  type ActiveChunk, type ActivePack, type SceneLine,
} from '@/data/englishActive'
import { useMastery } from './mastery'
import ProduceCard from './ProduceCard'

interface Props {
  pack: ActivePack
  onGoDrill?: () => void
}

type StepId = 'grasp' | 'notice' | 'blind' | 'shadow' | 'retell'

const STEPS: { id: StepId; n: number; name: string; icon: IconName; goal: string }[] = [
  { id: 'grasp', n: 1, name: 'Hiểu nội dung', icon: 'eye', goal: 'Đọc bản tiếng Việt trước. Mục tiêu duy nhất: nắm được chuyện gì đang xảy ra.' },
  { id: 'notice', n: 2, name: 'Soi cách nói', icon: 'search', goal: 'Giờ mới nhìn tiếng Anh. Những chỗ tô đậm là cụm đáng lấy — bấm vào để xem kỹ.' },
  { id: 'blind', n: 3, name: 'Bỏ phụ đề', icon: 'headphones', goal: 'Chỉ nghe, không nhìn chữ. Nghe ra được câu nào thì bấm lật câu đó để đối chiếu.' },
  { id: 'shadow', n: 4, name: 'Nhại theo', icon: 'mic', goal: 'Nói đè lên, chậm hơn nửa giây. Học nhịp và nối âm bằng miệng chứ không bằng mắt.' },
  { id: 'retell', n: 5, name: 'Kể lại', icon: 'send', goal: 'Đóng lời thoại lại, kể lại cảnh này bằng lời của bạn. Đây mới là bước biến Input thành Output.' },
]

function chunkKey(c: ActiveChunk): string {
  return normalizeAnswer(c.en.replace(/…|\.\.\./g, ' '))
}

const DROP = /[.,!?;:"“”'’()\-—\s]/

function foldWithMap(text: string): { norm: string; map: number[] } {
  const out: string[] = []
  const map: number[] = []
  let gap = true
  for (let i = 0; i < text.length; i++) {
    const ch = text[i].toLowerCase()
    if (DROP.test(ch)) {
      if (!gap) { out.push(' '); map.push(i); gap = true }
      continue
    }
    out.push(ch)
    map.push(i)
    gap = false
  }
  while (out.length && out[out.length - 1] === ' ') { out.pop(); map.pop() }
  return { norm: out.join(''), map }
}

function Highlighted({ text, chunks, onPick }: { text: string; chunks: ActiveChunk[]; onPick: (c: ActiveChunk) => void }) {
  const nodes = useMemo<ReactNode[]>(() => {
    const { norm, map } = foldWithMap(text)
    const hits: { from: number; to: number; c: ActiveChunk }[] = []
    for (const c of chunks) {
      const key = chunkKey(c)
      if (key.length < 3) continue
      const at = norm.indexOf(key)
      if (at < 0) continue
      const from = map[at]
      const to = map[at + key.length - 1] + 1
      if (hits.some((h) => from < h.to && h.from < to)) continue
      hits.push({ from, to, c })
    }
    hits.sort((a, b) => a.from - b.from)
    if (!hits.length) return [text]

    const out: ReactNode[] = []
    let cur = 0
    hits.forEach((h, i) => {
      if (h.from > cur) out.push(text.slice(cur, h.from))
      out.push(
        <button key={`h${i}`} className="ac-mark" onClick={() => onPick(h.c)}>
          {text.slice(h.from, h.to)}
        </button>,
      )
      cur = h.to
    })
    if (cur < text.length) out.push(text.slice(cur))
    return out
  }, [text, chunks, onPick])

  return <>{nodes}</>
}

function ShadowLine({ line }: { line: SceneLine }) {
  const sr = useSpeechRecognition('en-US')
  const [score, setScore] = useState<number | null>(null)
  const seen = useRef('')

  useEffect(() => {
    if (sr.transcript && sr.transcript !== seen.current) {
      seen.current = sr.transcript
      setScore(matchAny(sr.transcript, [line.en]).score)
    }
  }, [sr.transcript, line.en])

  return (
    <div className="ac-shadow">
      <div className="ac-shadow-top">
        <button className="ac-play" onClick={() => speakAccent(line.en, 'us')}><Icon name="volume" size={16} /></button>
        <p>{line.en}</p>
      </div>
      <div className="ac-shadow-bot">
        {sr.supported ? (
          <button
            className={'ac-mic sm' + (sr.listening ? ' on' : '')}
            onClick={() => { setScore(null); seen.current = ''; sr.listening ? sr.stop() : sr.start() }}
          >
            <Icon name={sr.listening ? 'stop' : 'mic'} size={14} /> {sr.listening ? 'Đang nghe…' : 'Nhại lại'}
          </button>
        ) : <span className="ac-hint">Trình duyệt này chưa hỗ trợ micro — hãy dùng Chrome hoặc Edge.</span>}
        {sr.transcript && <span className="ac-shadow-said">{sr.transcript}</span>}
        {score != null && (
          <span className={'ac-shadow-score ' + (score >= 85 ? 'good' : score >= 60 ? 'mid' : 'bad')}>{score}%</span>
        )}
      </div>
    </div>
  )
}

export default function Scene({ pack, onGoDrill }: Props) {
  const { watchScene, packProgress } = useMastery()
  const [step, setStep] = useState<StepId>('grasp')
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [detail, setDetail] = useState<ActiveChunk | null>(null)
  const counted = useRef(false)

  const prog = packProgress(pack)

  useEffect(() => {
    setStep('grasp')
    setOpen({})
    setDetail(null)
    counted.current = false
  }, [pack.id])

  const playAll = useCallback(() => {
    pack.scene.lines.forEach((l, idx) => {
      window.setTimeout(() => speakAccent(l.en, 'us'), idx * 2600)
    })
    if (!counted.current) {
      counted.current = true
      watchScene(pack.id)
    }
  }, [pack, watchScene])

  const cur = STEPS.find((s) => s.id === step) ?? STEPS[0]

  return (
    <div className="ac-scene">
      <div className="ac-scene-head">
        <div>
          <span className="ac-scene-kicker">{pack.emoji} {pack.name} · {pack.cefr}</span>
          <h3>{pack.scene.title}</h3>
          <p>{pack.scene.setting}</p>
        </div>
        <div className="ac-scene-side">
          <button className="ac-play big" onClick={playAll} title="Nghe cả cảnh">
            <Icon name="play" size={20} />
          </button>
          <span className="ac-watched">Đã xem {prog.watched} lượt</span>
        </div>
      </div>

      <div className="ac-steps">
        {STEPS.map((s) => (
          <button
            key={s.id}
            className={'ac-step' + (step === s.id ? ' on' : '')}
            onClick={() => setStep(s.id)}
          >
            <b>{s.n}</b>
            <span><Icon name={s.icon} size={13} /> {s.name}</span>
          </button>
        ))}
      </div>

      <p className="ac-step-goal"><Icon name="target" size={14} /> {cur.goal}</p>

      {step === 'retell' ? (
        <ProduceCard
          task="retell"
          rows={4}
          level="a2b1"
          placeholder="Kể lại cảnh này bằng tiếng Anh, bằng lời của bạn…"
          prompt={`Retell this scene: ${pack.scene.title}`}
          brief={
            <>
              <b>Kể lại cảnh vừa rồi bằng lời của bạn</b>
              <span>
                3–5 câu là đủ. Không cần nhớ đúng từng chữ — cần nhất là bạn tự tạo ra câu chứ không chép lại.
                Cố dùng ít nhất hai cụm vừa soi được ở bước 2.
              </span>
            </>
          }
        />
      ) : (
        <div className="ac-lines">
          {pack.scene.lines.map((l, idx) => (
            <div key={idx} className="ac-line">
              <span className="ac-sp">{l.sp}</span>
              {step === 'grasp' && <p className="ac-vi only">{l.vi}</p>}

              {step === 'notice' && (
                <>
                  <p className="ac-en">
                    <Highlighted text={l.en} chunks={pack.chunks} onPick={setDetail} />
                  </p>
                  <p className="ac-vi">{l.vi}</p>
                  <button className="ac-play tiny" onClick={() => speakAccent(l.en, 'us')}><Icon name="volume" size={14} /></button>
                </>
              )}

              {step === 'blind' && (
                <div className="ac-blind">
                  <button className="ac-play" onClick={() => speakAccent(l.en, 'us')}><Icon name="volume" size={16} /></button>
                  {open[idx] ? (
                    <p className="ac-en">{l.en}</p>
                  ) : (
                    <button className="ac-flip" onClick={() => setOpen((o) => ({ ...o, [idx]: true }))}>
                      Lật để đối chiếu
                    </button>
                  )}
                </div>
              )}

              {step === 'shadow' && <ShadowLine line={l} />}
            </div>
          ))}
        </div>
      )}

      {detail && (
        <div className="ac-detail" onClick={() => setDetail(null)}>
          <div className="ac-detail-box" onClick={(e) => e.stopPropagation()}>
            <button className="ac-detail-x" onClick={() => setDetail(null)}><Icon name="x" size={16} /></button>
            <span className="ac-kindchip">{KIND_LABEL[detail.kind]}</span>
            <h4>{detail.en}</h4>
            <p className="ac-detail-vi">{detail.vi}</p>
            {detail.pattern && detail.pattern !== detail.en && <p className="ac-detail-pat">{detail.pattern}</p>}
            <div className="ac-detail-ex">
              <p>“{detail.say}”</p>
              <button className="ac-play tiny" onClick={() => speakAccent(detail.say, 'us')}><Icon name="volume" size={14} /></button>
            </div>
            {detail.note && <p className="ac-detail-note"><Icon name="bulb" size={14} /> {detail.note}</p>}
            {detail.trap && <p className="ac-detail-trap"><Icon name="frown" size={14} /> {detail.trap}</p>}
          </div>
        </div>
      )}

      {step !== 'retell' && (
        <div className="ac-scene-foot">
          <div>
            <b>Xem lại quan trọng hơn xem nhiều</b>
            <span>Cùng một cảnh, mỗi lượt soi một thứ khác: lần đầu hiểu chuyện, lần sau bắt cụm, lần nữa bắt nhịp, rồi mới tự nói.</span>
          </div>
          {onGoDrill && (
            <button className="ac-next" onClick={onGoDrill}>
              Sang phòng truy xuất <Icon name="arrow-right" size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
