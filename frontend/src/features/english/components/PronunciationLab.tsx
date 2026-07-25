import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN, stopSpeak, englishVoiceStatus, onVoicesChanged, VOICE_HELP } from '@/core/tts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useAppStore } from '@/store/app.store'
import { PRON_GROUPS, PRON_PASS, pronWords, scoreSpoken, type PronGroup } from '@/data/englishPronunciation'
import { usePronProgress } from '../progress'

interface Props {
  initialGroup?: string
}

export default function PronunciationLab({ initialGroup }: Props) {
  const { recordEvent } = useAppStore()
  const { pron, record } = usePronProgress()
  const [openId, setOpenId] = useState<string | null>(initialGroup ?? null)

  const passed = PRON_GROUPS.filter((g) => (pron.best[g.id] ?? 0) >= PRON_PASS).length
  const group = openId ? PRON_GROUPS.find((g) => g.id === openId) ?? null : null

  const onDone = useCallback((g: PronGroup, pct: number) => {
    if (record(g.id, pct)) recordEvent('pronounce', 3)
  }, [record, recordEvent])

  if (group) {
    return (
      <GroupView
        key={group.id}
        group={group}
        best={pron.best[group.id]}
        onDone={(pct) => onDone(group, pct)}
        onBack={() => { stopSpeak(); setOpenId(null) }}
      />
    )
  }

  return (
    <div className="pron-lab">
      <div className="grammar-intro">
        <Icon name="mic" size={20} />
        <div>
          <b>Luyện phát âm — {passed}/{PRON_GROUPS.length} nhóm âm đạt.</b>
          <p>
            Mỗi nhóm là một lỗi người Việt hay mắc khi nói tiếng Anh: nghe mẫu → phân biệt bằng tai → đọc lại cho máy chấm.
            Đạt {PRON_PASS}% trong bài kiểm tra là hoàn thành nhóm (thưởng XP lần đầu).
          </p>
        </div>
      </div>

      <VoiceNotice />

      <div className="capsule-grid">
        {PRON_GROUPS.map((g, i) => {
          const best = pron.best[g.id]
          const ok = (best ?? 0) >= PRON_PASS
          return (
            <button key={g.id} className={'capsule-card pron-card' + (ok ? ' done' : '')} onClick={() => setOpenId(g.id)}>
              <div className="cap-head">
                <span className="cap-num">{i + 1}</span>
                <span className="cap-tag">{g.sub}</span>
                {ok && <Icon name="check-circle" size={15} />}
              </div>
              <b><span className="pron-emoji">{g.emoji}</span> {g.title}</b>
              <small>{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function VoiceNotice() {
  const [status, setStatus] = useState(englishVoiceStatus)
  useEffect(() => onVoicesChanged(() => setStatus(englishVoiceStatus())), [])
  if (status !== 'none') return null
  return (
    <div className="pron-warn">
      <b><Icon name="volume" size={15} /> Máy chưa có giọng đọc tiếng Anh</b>
      <p>Bạn vẫn luyện đọc và chấm điểm được, chỉ là chưa nghe được câu mẫu. Cách cài giọng:</p>
      <ul>
        {VOICE_HELP.map((h) => <li key={h.os}><b>{h.os}:</b> {h.how}</li>)}
      </ul>
    </div>
  )
}

type Mode = 'practice' | 'ear' | 'test'

interface ViewProps {
  group: PronGroup
  best?: number
  onDone: (pct: number) => void
  onBack: () => void
}

function GroupView({ group, best, onDone, onBack }: ViewProps) {
  const words = useMemo(() => pronWords(group), [group])
  const hasPairs = !!group.pairs?.length
  const [mode, setMode] = useState<Mode>('practice')

  useEffect(() => () => stopSpeak(), [])

  return (
    <div className="capsule-view pron-view">
      <div className="cap-view-head">
        <button className="btn-ghost sm" onClick={onBack}>
          <Icon name="arrow-left" size={14} /> Danh sách
        </button>
        <div>
          <div className="cap-tag">{group.sub}</div>
          <h3>{group.emoji} {group.title}</h3>
        </div>
        {best != null && <span className={'cap-best' + (best >= PRON_PASS ? ' ok' : '')}>Tốt nhất: {best}%</span>}
      </div>

      <div className="pron-notes">
        <div className="pron-note why">
          <b><Icon name="x-circle" size={14} /> Vì sao người Việt hay sai</b>
          <p>{group.why}</p>
        </div>
        <div className="pron-note tip">
          <b><Icon name="bulb" size={14} /> Cách đọc đúng</b>
          <p>{group.tip}</p>
        </div>
      </div>

      <div className="pron-modes">
        <button className={'pron-mode' + (mode === 'practice' ? ' on' : '')} onClick={() => { stopSpeak(); setMode('practice') }}>
          <Icon name="volume" size={15} /> Nghe & đọc theo
        </button>
        {hasPairs && (
          <button className={'pron-mode' + (mode === 'ear' ? ' on' : '')} onClick={() => { stopSpeak(); setMode('ear') }}>
            <Icon name="target" size={15} /> Phân biệt bằng tai
          </button>
        )}
        <button className={'pron-mode' + (mode === 'test' ? ' on' : '')} onClick={() => { stopSpeak(); setMode('test') }}>
          <Icon name="mic" size={15} /> Kiểm tra
        </button>
      </div>

      {mode === 'practice' && <PracticeBoard group={group} />}
      {mode === 'ear' && <EarTraining group={group} />}
      {mode === 'test' && <PronTest key={group.id} group={group} words={words} onDone={onDone} />}
    </div>
  )
}

/* Ghi âm dùng chung: bấm mic → nói → so chuỗi nhận diện với câu mẫu để ra điểm. */
function useReader() {
  const sr = useSpeechRecognition('en-US')
  const [active, setActive] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { pct: number; heard: string }>>({})
  const targetRef = useRef<Record<string, string>>({})
  const startedRef = useRef(false)

  useEffect(() => {
    if (sr.listening) { startedRef.current = true; return }
    if (!startedRef.current || !active) return
    startedRef.current = false
    const heard = sr.transcript.trim()
    const pct = heard ? scoreSpoken(targetRef.current[active] ?? '', heard) : 0
    setResults((prev) => ({ ...prev, [active]: { pct, heard } }))
    setActive(null)
    sr.reset()
  }, [sr.listening, sr.transcript, sr.reset, active])

  const listen = useCallback((id: string, target: string) => {
    if (sr.listening) { sr.stop(); return }
    targetRef.current[id] = target
    setResults((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    stopSpeak()
    setActive(id)
    sr.start()
  }, [sr])

  const clear = useCallback(() => { setResults({}); setActive(null) }, [])

  return { sr, active, results, listen, clear }
}

function verdict(pct: number): { cls: string; text: string } {
  if (pct >= 90) return { cls: 'great', text: 'Rất chuẩn!' }
  if (pct >= PRON_PASS) return { cls: 'ok', text: 'Được rồi — đọc lại cho chắc nhé' }
  return { cls: 'bad', text: 'Chưa rõ — nghe mẫu rồi thử lại' }
}

function MicButton({ id, target, reader }: { id: string; target: string; reader: ReturnType<typeof useReader> }) {
  const { sr, active, listen } = reader
  const on = active === id && sr.listening
  if (!sr.supported) return null
  return (
    <button className={'pron-mic' + (on ? ' on' : '')} onClick={() => listen(id, target)} title="Đọc theo">
      <Icon name="mic" size={15} />
    </button>
  )
}

function ResultLine({ id, reader }: { id: string; reader: ReturnType<typeof useReader> }) {
  const r = reader.results[id]
  if (reader.active === id && reader.sr.listening) return <div className="pron-res listening">Đang nghe… hãy đọc to và rõ</div>
  if (!r) return null
  const v = verdict(r.pct)
  return (
    <div className={'pron-res ' + v.cls}>
      <b>{r.pct}% · {v.text}</b>
      {r.heard ? <span>Máy nghe được: “{r.heard}”</span> : <span>Máy không nghe được gì.</span>}
    </div>
  )
}

function PracticeBoard({ group }: { group: PronGroup }) {
  const reader = useReader()
  const pairs = group.pairs ?? []
  const words = group.words ?? []

  return (
    <div className="pron-board">
      {!reader.sr.supported && (
        <div className="pron-warn sm">Trình duyệt này chưa hỗ trợ nhận diện giọng nói — hãy dùng Chrome hoặc Edge để được chấm điểm. Bạn vẫn nghe mẫu bình thường.</div>
      )}

      {pairs.map((p, i) => (
        <div key={i} className="pron-pair">
          {([['a', p.a, p.aIpa, p.aVi], ['b', p.b, p.bIpa, p.bVi]] as const).map(([side, w, ipa, vi]) => {
            const id = `p${i}${side}`
            return (
              <div key={side} className="pron-item">
                <div className="pron-item-top">
                  <b lang="en">{w}</b>
                  <span className="pron-ipa">{ipa}</span>
                  <button className="pron-play" onClick={() => speakEN(w, 0.85)} title="Nghe mẫu"><Icon name="volume" size={15} /></button>
                  <MicButton id={id} target={w} reader={reader} />
                </div>
                <small>{vi}</small>
                <ResultLine id={id} reader={reader} />
              </div>
            )
          })}
        </div>
      ))}

      {words.length > 0 && (
        <div className="pron-words">
          {words.map((w, i) => {
            const id = `w${i}`
            return (
              <div key={i} className="pron-item">
                <div className="pron-item-top">
                  <b lang="en">{w.w}</b>
                  <span className="pron-ipa">{w.ipa}</span>
                  <button className="pron-play" onClick={() => speakEN(w.w, 0.85)} title="Nghe mẫu"><Icon name="volume" size={15} /></button>
                  <MicButton id={id} target={w.w} reader={reader} />
                </div>
                <small>{w.vi}</small>
                <ResultLine id={id} reader={reader} />
              </div>
            )
          })}
        </div>
      )}

      <div className="pron-sents">
        <div className="pron-sents-head"><Icon name="letters" size={15} /> Đọc cả câu</div>
        {group.sentences.map((s, i) => {
          const id = `s${i}`
          return (
            <div key={i} className="pron-item wide">
              <div className="pron-item-top">
                <b lang="en">{s.en}</b>
                <button className="pron-play" onClick={() => speakEN(s.en, 0.85)} title="Nghe mẫu"><Icon name="volume" size={15} /></button>
                <MicButton id={id} target={s.en} reader={reader} />
              </div>
              <small>{s.vi}</small>
              <ResultLine id={id} reader={reader} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface EarQ { target: string; other: string; targetIsA: boolean }

function buildEar(group: PronGroup): EarQ[] {
  const pairs = group.pairs ?? []
  return pairs.map((p) => {
    const targetIsA = Math.random() < 0.5
    return { target: targetIsA ? p.a : p.b, other: targetIsA ? p.b : p.a, targetIsA }
  })
}

function EarTraining({ group }: { group: PronGroup }) {
  const [qs, setQs] = useState<EarQ[]>(() => buildEar(group))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const q = qs[i]
  const done = i >= qs.length

  useEffect(() => {
    if (!q) return
    const id = window.setTimeout(() => speakEN(q.target, 0.85), 250)
    return () => window.clearTimeout(id)
  }, [q])

  const restart = () => { setQs(buildEar(group)); setI(0); setPicked(null); setScore(0) }

  if (done) {
    const pct = Math.round((score / qs.length) * 100)
    return (
      <div className="quiz-done">
        <div className="qd-ring" style={{ ['--p' as string]: pct }}>
          <b>{pct}%</b>
          <span>{score}/{qs.length}</span>
        </div>
        <h3>{pct >= PRON_PASS ? '👂 Tai bạn đã phân biệt được cặp âm này!' : 'Nghe lại vài lần nữa rồi thử lại nhé'}</h3>
        <p className="pron-ear-note">Nghe ra được thì mới đọc đúng được — luyện tai trước khi luyện miệng.</p>
        <div className="quiz-done-actions">
          <button className="btn-primary" onClick={restart}><Icon name="rocket" size={15} /> Nghe lại lượt mới</button>
        </div>
      </div>
    )
  }

  const first = q.targetIsA ? q.target : q.other
  const second = q.targetIsA ? q.other : q.target

  return (
    <div className="pron-ear">
      <div className="quiz-top">
        <span>Câu {i + 1} / {qs.length}</span>
        <span className="quiz-score"><Icon name="star" size={13} /> {score} đúng</span>
      </div>
      <p className="pron-ear-q">Bạn vừa nghe từ nào?</p>
      <button className="btn-ghost pron-replay" onClick={() => speakEN(q.target, 0.8)}>
        <Icon name="volume" size={16} /> Nghe lại (chậm)
      </button>
      <div className="quiz-options pron-ear-opts">
        {[first, second].map((w) => {
          let cls = 'quiz-opt'
          if (picked) {
            if (w === q.target) cls += ' correct'
            else if (w === picked) cls += ' wrong'
          }
          return (
            <button
              key={w}
              className={cls}
              disabled={!!picked}
              onClick={() => {
                if (picked) return
                setPicked(w)
                if (w === q.target) setScore((s) => s + 1)
              }}
            >
              <span lang="en">{w}</span>
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="quiz-foot">
          <div className="quiz-ex">{picked === q.target ? '✅ Chính xác.' : `❌ Từ đúng là “${q.target}”.`} Nghe lại cả hai để so sánh:
            <button className="pron-play inline" onClick={() => speakEN(first, 0.8)}>{first}</button>
            <button className="pron-play inline" onClick={() => speakEN(second, 0.8)}>{second}</button>
          </div>
          <button className="btn-primary" onClick={() => { setI((x) => x + 1); setPicked(null) }}>
            {i + 1 >= qs.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

interface TestItem { id: string; text: string; hint: string; sentence: boolean }

function buildTest(group: PronGroup, words: ReturnType<typeof pronWords>): TestItem[] {
  const picked = [...words].sort(() => Math.random() - 0.5).slice(0, 6)
  const items: TestItem[] = picked.map((w, i) => ({ id: `tw${i}`, text: w.w, hint: `${w.ipa} · ${w.vi}`, sentence: false }))
  group.sentences.slice(0, 2).forEach((s, i) => items.push({ id: `ts${i}`, text: s.en, hint: s.vi, sentence: true }))
  return items
}

function PronTest({ group, words, onDone }: { group: PronGroup; words: ReturnType<typeof pronWords>; onDone: (pct: number) => void }) {
  const [items, setItems] = useState<TestItem[]>(() => buildTest(group, words))
  const [i, setI] = useState(-1)
  const [scores, setScores] = useState<number[]>([])
  const reader = useReader()

  const item = i >= 0 && i < items.length ? items[i] : null
  const finished = i >= items.length
  const result = item ? reader.results[item.id] : undefined

  const start = () => {
    setItems(buildTest(group, words))
    reader.clear()
    setScores([])
    setI(0)
  }

  const next = () => {
    const pct = result?.pct ?? 0
    const all = [...scores, pct]
    setScores(all)
    if (i + 1 >= items.length) {
      onDone(Math.round(all.reduce((a, b) => a + b, 0) / all.length))
    }
    setI((x) => x + 1)
  }

  if (!reader.sr.supported) {
    return (
      <div className="pron-warn">
        <b><Icon name="mic" size={15} /> Trình duyệt chưa hỗ trợ nhận diện giọng nói</b>
        <p>Bài kiểm tra phát âm cần micro và Web Speech API. Hãy mở trang bằng <b>Chrome</b> hoặc <b>Edge</b> trên máy tính, hoặc Chrome trên Android. Trong lúc chờ, bạn vẫn dùng được phần “Nghe & đọc theo” và “Phân biệt bằng tai”.</p>
      </div>
    )
  }

  if (finished) {
    const pct = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1))
    return (
      <div className="quiz-done">
        <div className="qd-ring" style={{ ['--p' as string]: pct }}>
          <b>{pct}%</b>
          <span>{items.length} câu</span>
        </div>
        <h3>{pct >= PRON_PASS ? '🎤 Nhóm âm này đạt rồi!' : 'Chưa đạt — đọc lại phần mẹo rồi thử lần nữa'}</h3>
        <div className="quiz-done-actions">
          <button className="btn-primary" onClick={start}><Icon name="rocket" size={15} /> Kiểm tra lại</button>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="pron-test-intro">
        <p>
          Bài kiểm tra gồm <b>6 từ</b> và <b>2 câu</b> của nhóm âm này. Với mỗi câu: bấm micro, đọc to, máy sẽ chấm theo
          những gì nhận diện được. Trung bình đạt <b>{PRON_PASS}%</b> là hoàn thành nhóm.
        </p>
        <p className="pron-test-note">Mẹo: đọc ở nơi yên tĩnh, cách micro khoảng một gang tay và đọc trọn vẹn từ cuối.</p>
        <button className="btn-primary" onClick={start}><Icon name="mic" size={15} /> Bắt đầu kiểm tra</button>
      </div>
    )
  }

  return (
    <div className="pron-test">
      <div className="quiz-top">
        <span>Câu {i + 1} / {items.length}</span>
        <span className="quiz-score"><Icon name="star" size={13} /> {scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0}% trung bình</span>
      </div>

      <div className={'pron-test-card' + (item.sentence ? ' sentence' : '')}>
        <b lang="en">{item.text}</b>
        <small>{item.hint}</small>
        <div className="pron-test-actions">
          <button className="btn-ghost sm" onClick={() => speakEN(item.text, 0.85)}><Icon name="volume" size={15} /> Nghe mẫu</button>
          <button
            className={'pron-mic big' + (reader.active === item.id && reader.sr.listening ? ' on' : '')}
            onClick={() => reader.listen(item.id, item.text)}
          >
            <Icon name="mic" size={26} />
          </button>
        </div>
        <ResultLine id={item.id} reader={reader} />
        {reader.sr.error && <div className="pron-res bad"><span>{reader.sr.error}</span></div>}
      </div>

      <div className="quiz-foot">
        <button className="btn-primary" disabled={!result} onClick={next}>
          {i + 1 >= items.length ? 'Xem kết quả' : 'Câu tiếp'} <Icon name="arrow-right" size={15} />
        </button>
      </div>
    </div>
  )
}
