import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import { posLabel, loadDefs, type WordDefs } from '@/data/vocabCore'
import { defineWordRich } from '@/core/api/dict.api'
import { fetchWordImage, fetchWordReady, type WordImage } from '@/core/api/english.api'
import { addCard } from '@/core/api/srs.api'
import type { DictRich } from '@/models/dict.model'
import { pctOf, useDeep, type DeepPart } from './deep'
import {
  chunkUses, coreNote, corpusExamples, findDeepWord, localCollocations, localSenses,
  minedCollocations, staticImage, suggestWords, type DeepWord,
} from './wordData'
import Practice from './Practice'

interface Props {
  term: string
  onPickWord: (term: string) => void
  onBack: () => void
}

const SECTIONS: { id: DeepPart; n: number; name: string; icon: IconName }[] = [
  { id: 'sense', n: 1, name: 'Nghĩa & cách dùng', icon: 'book' },
  { id: 'colloc', n: 2, name: 'Collocations (Cụm từ)', icon: 'letters' },
  { id: 'example', n: 3, name: 'Ví dụ thực tế', icon: 'cards' },
  { id: 'drill', n: 4, name: 'Luyện tập', icon: 'note' },
]

const DRILLS: { id: string; name: string; sub: string; icon: IconName }[] = [
  { id: 'quiz', name: 'Trắc nghiệm', sub: 'Chọn đáp án đúng', icon: 'target' },
  { id: 'listen', name: 'Nghe & điền', sub: 'Nghe và điền từ còn thiếu', icon: 'headphones' },
  { id: 'speak', name: 'Nói câu với từ', sub: 'Luyện nói với từ này', icon: 'mic' },
  { id: 'write', name: 'Viết câu', sub: 'Viết câu có dùng từ này', icon: 'note' },
]

function Donut({ pct }: { pct: number }) {
  const r = 40
  const c = 2 * Math.PI * r
  return (
    <svg className="dp-donut" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r={r} className="dp-donut-bg" />
      <circle
        cx="50" cy="50" r={r} className="dp-donut-on"
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="48" className="dp-donut-n">{pct}%</text>
      <text x="50" y="64" className="dp-donut-t">Hoàn thành</text>
    </svg>
  )
}

function Picker({ onPickWord, onBack }: Omit<Props, 'term'>) {
  const [q, setQ] = useState('')
  const found = q.trim() ? findDeepWord(q) : null
  const list = useMemo(() => suggestWords(14), [])
  return (
    <div className="dp-picker">
      <button className="dp-back" onClick={onBack}><Icon name="chevron-left" size={16} /> Quay lại thẻ</button>
      <h3>Học sâu từ vựng</h3>
      <p>Gõ một từ trong kho để mở trang học sâu của từ đó.</p>
      <input
        className="ac-input one"
        value={q}
        placeholder="Ví dụ: people, take, coffee…"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && found) onPickWord(found.term) }}
      />
      {q.trim() && !found && <p className="dp-empty">Không có từ “{q.trim()}” trong kho 3.122 thẻ.</p>}
      {found && (
        <button className="dp-cta" onClick={() => onPickWord(found.term)}>
          Mở trang học sâu “{found.term}” <Icon name="arrow-right" size={15} />
        </button>
      )}
      <div className="dp-suggest">
        {list.map((d) => (
          <button key={d.term} className="ac-chip" onClick={() => onPickWord(d.term)}>{d.term}</button>
        ))}
      </div>
    </div>
  )
}

export default function DeepPage({ term, onPickWord, onBack }: Props) {
  const { progressOf, markPart, addHeard, addTime, streak, week } = useDeep()
  const [active, setActive] = useState<DeepPart>('sense')
  const [defs, setDefs] = useState<WordDefs>({})
  const [rich, setRich] = useState<DictRich | null>(null)
  const [richState, setRichState] = useState<'idle' | 'loading' | 'done' | 'fail'>('idle')
  const [allEx, setAllEx] = useState(false)
  const [allCol, setAllCol] = useState(false)
  const [img, setImg] = useState<WordImage | null>(null)
  const [drill, setDrill] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const startRef = useRef(Date.now())
  const refs = {
    sense: useRef<HTMLElement>(null),
    colloc: useRef<HTMLElement>(null),
    example: useRef<HTMLElement>(null),
    drill: useRef<HTMLDivElement>(null),
  }

  const dw: DeepWord | null = useMemo(() => (term ? findDeepWord(term) : null), [term])

  useEffect(() => {
    loadDefs('en').then(setDefs).catch(() => {  })
  }, [])

  useEffect(() => {
    setActive('sense')
    setRich(null)
    setRichState('idle')
    setAllEx(false)
    setAllCol(false)
    setImg(null)
    setDrill(null)
    setSaved(false)
    startRef.current = Date.now()
    if (term && findDeepWord(term)) markPart(term, 'sense')
  }, [term])

  useEffect(() => {
    if (!term || !findDeepWord(term)) return
    let alive = true

    const local = staticImage(term)
    if (local) {
      setImg({
        url: local, full: local, title: `Hình cho “${term}”`, author: '', author_url: '',
        license: 'AI', license_url: '', source: '', provider: 'repo', query: term, ai: true,
      })
    } else {
      fetchWordImage(term, term)
        .then((r) => { if (alive) setImg(r.image) })
        .catch(() => {  })
    }

    fetchWordReady(term)
      .then((r) => {
        if (!alive || !r.rich) return
        setRichState('loading')
        return defineWordRich(term, 'en', 'vi').then((d) => {
          if (!alive) return
          setRich(d.rich)
          setRichState(d.rich ? 'done' : 'fail')
        })
      })
      .catch(() => {  })

    return () => { alive = false }
  }, [term])

  useEffect(() => () => {
    if (term) addTime(term, (Date.now() - startRef.current) / 1000)
  }, [term])

  const jump = useCallback((id: DeepPart) => {
    setActive(id)
    markPart(term, id)
    refs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [term, markPart])

  if (!dw) return <Picker onPickWord={onPickWord} onBack={onBack} />

  const { w, unit } = dw
  const def = defs[dw.term] ?? {}
  const prog = progressOf(dw.term)
  const pct = pctOf(prog)

  const senses = localSenses(dw.term, w.vi, def.defVi ?? '', w.ex, w.exVi)
  const core = coreNote(dw.term)
  const collocs = localCollocations(dw.term)
  const chunks = chunkUses(dw.term)
  const examples = corpusExamples(dw.term, 24)

  const richPhrases = (rich?.phrases ?? []).filter((p) => p && p.toLowerCase() !== dw.term.toLowerCase())
  const richExamples = (rich?.examples ?? []).map((e) => ({ en: e.ko, vi: e.vi, from: 'Từ điển' }))
  const allExamples = [...examples, ...richExamples]
  const shownEx = allEx ? allExamples : allExamples.slice(0, 3)

  const colRows = collocs.length
    ? collocs.map((c) => ({ form: c.form, vi: c.vi, ex: c.ex }))
    : [
      ...chunks.map((c) => ({ form: c.en, vi: c.vi, ex: c.say })),
      ...richPhrases.map((p) => ({ form: p, vi: '', ex: p })),
      ...minedCollocations(dw.term).map((p) => ({ form: p, vi: '', ex: p })),
    ].filter((r, i, xs) => xs.findIndex((x) => x.form.toLowerCase() === r.form.toLowerCase()) === i)
  const shownCol = allCol ? colRows : colRows.slice(0, 8)

  const loadRich = () => {
    if (richState === 'loading' || richState === 'done') return
    setRichState('loading')
    defineWordRich(dw.term, 'en', 'vi')
      .then((r) => { setRich(r.rich); setRichState(r.rich ? 'done' : 'fail') })
      .catch(() => setRichState('fail'))
  }

  const say = (text: string, rate?: number) => {
    speakAccent(text, 'us', rate)
    addHeard(dw.term)
  }

  const save = () => {
    setSaved(true)
    addCard({ front: dw.term, back: w.vi, source: 'hoc-sau' }).catch(() => {  })
  }

  return (
    <div className="dp">
      <div className="dp-top">
        <button className="dp-back" onClick={onBack}><Icon name="chevron-left" size={16} /> Quay lại thẻ</button>
        <h2>HỌC SÂU TỪ VỰNG</h2>
        <button className="dp-topbtn" onClick={onBack}>
          <Icon name="chevron-left" size={15} /> Quay lại học tiếp
        </button>
      </div>

      <div className="dp-grid">
        <div className="dp-card">
          <div className="dp-head">
            <div className={'dp-icon ' + unit.tone}>
              {img ? <img src={img.url} alt="" /> : <span>{w.img}</span>}
            </div>
            <div className="dp-headmain">
              <div className="dp-wordrow">
                <h1>{dw.term}</h1>
                <button className="dp-say" onClick={() => say(dw.term)} title="Nghe">
                  <Icon name="volume" size={18} />
                </button>
              </div>
              <div className="dp-metarow">
                <span className="dp-ipa">/{dw.us.replace(/^\/|\/$/g, '')}/</span>
                <button className="dp-acc" onClick={() => say(dw.term)}>US <Icon name="volume" size={13} /></button>
                <button className="dp-acc" onClick={() => say(dw.term, 0.6)}>Chậm <Icon name="volume" size={13} /></button>
                <span className="dp-pos">{posLabel(w.pos)}</span>
              </div>
              <h2 className="dp-gloss">{w.vi}</h2>
              {def.defVi && <p className="dp-glossdesc">{def.defVi}</p>}
            </div>
            <button className={'dp-save' + (saved ? ' on' : '')} onClick={save} disabled={saved}>
              <Icon name="star" size={15} /> {saved ? 'Đã lưu' : 'Lưu từ'}
            </button>
          </div>

          <div className="dp-tabs">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className={'dp-tab' + (active === s.id ? ' on' : '')}
                onClick={() => (s.id === 'drill' ? (setDrill('quiz'), jump('drill')) : jump(s.id))}
              >
                <Icon name={s.icon} size={15} /> {s.n}. {s.name}
              </button>
            ))}
          </div>

          <div className="dp-two">
            <section className="dp-sec" ref={refs.sense}>
              <h3 className="dp-h"><Icon name="book" size={16} /> Nghĩa &amp; cách dùng</h3>
              <div className="dp-senseblock">
                <div className="dp-sensetext">
                  <p className="dp-term">{dw.term} <em>({posLabel(w.pos).toLowerCase()})</em></p>
                  <p className="dp-termvi">{w.vi}</p>
                  <ul className="dp-senselist">
                    {senses.map((s, i) => (
                      <li key={i}>
                        <b>{s.title}</b>
                        {s.desc && <span className="dp-sdesc">{s.desc}</span>}
                        <em>{s.ex}</em>
                        <small>({s.exVi})</small>
                        <button className="ac-play tiny" onClick={() => say(s.ex)}><Icon name="volume" size={12} /></button>
                      </li>
                    ))}
                  </ul>
                </div>
                {img && (
                  <figure className="dp-fig">
                    <img src={img.url} alt={`Hình minh hoạ cho từ ${dw.term}`} />
                    <figcaption>
                      {img.ai ? 'Hình do AI vẽ' : (
                        <>
                          {img.author ? `${img.author} · ` : ''}
                          <a href={img.license_url || img.source} target="_blank" rel="noreferrer noopener">{img.license}</a>
                        </>
                      )}
                    </figcaption>
                  </figure>
                )}
              </div>
              <div className="dp-tip">
                <b><Icon name="bulb" size={14} /> Mẹo nhớ</b>
                <p>{w.connect}</p>
                {core && <p className="dp-core">{core}</p>}
              </div>
            </section>

            <section className="dp-sec" ref={refs.colloc}>
              <div className="dp-sechead">
                <h3 className="dp-h b"><Icon name="letters" size={16} /> Collocations (Cụm từ)</h3>
                {colRows.length > 8 && (
                  <button className="dp-link" onClick={() => setAllCol((v) => !v)}>
                    {allCol ? 'Thu gọn' : 'Xem tất cả'}
                  </button>
                )}
              </div>
              {colRows.length ? (
                <div className="dp-collocs">
                  {shownCol.map((c, i) => (
                    <div key={i} className="dp-colloc">
                      <i className="dp-bullet" />
                      <code>{c.form}</code>
                      <span>{c.vi}</span>
                      <button className="ac-play tiny" onClick={() => say(c.ex)}><Icon name="volume" size={12} /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dp-fetch">
                  <p>Từ này chưa có bộ cụm từ sẵn. Tra một lần rồi hệ thống lưu lại, lần sau mở là có ngay.</p>
                  <button className="dp-cta sm" disabled={richState === 'loading'} onClick={loadRich}>
                    {richState === 'loading'
                      ? <><Icon name="refresh" size={14} /> Đang tra…</>
                      : <><Icon name="search" size={14} /> Tra cụm đi với “{dw.term}”</>}
                  </button>
                  {richState === 'fail' && <p className="dp-empty">Chưa tra được lúc này.</p>}
                </div>
              )}
              <button className="dp-add" onClick={save} disabled={saved}>
                <Icon name="plus" size={14} /> {saved ? 'Đã thêm vào sổ tay' : 'Thêm vào sổ tay từ vựng'}
              </button>
            </section>
          </div>

          <section className="dp-sec wide" ref={refs.example}>
            <div className="dp-sechead">
              <h3 className="dp-h c"><Icon name="cards" size={16} /> 3. Ví dụ thực tế</h3>
              {allExamples.length > 3 && (
                <button className="dp-link" onClick={() => setAllEx((v) => !v)}>
                  {allEx ? 'Thu gọn' : 'Xem tất cả'}
                </button>
              )}
            </div>
            <div className="dp-exlist">
              {shownEx.map((e, i) => (
                <div key={i} className="dp-exrow">
                  <button className="dp-exsay" onClick={() => say(e.en)}><Icon name="volume" size={14} /></button>
                  <p className="dp-exen">{e.en}</p>
                  <p className="dp-exvi">{e.vi}</p>
                  <div className="dp-exacts">
                    <button className="dp-mini" onClick={() => say(e.en)}>US</button>
                    <button className="dp-mini" onClick={() => say(e.en, 0.6)}>Chậm</button>
                  </div>
                </div>
              ))}
            </div>
            {allExamples.length > 3 && (
              <button className="dp-more" onClick={() => setAllEx((v) => !v)}>
                {allEx ? 'Thu gọn' : `Xem thêm ví dụ (${allExamples.length})`}
                <Icon name={allEx ? 'chevron-up' : 'chevron-down'} size={15} />
              </button>
            )}
          </section>

          <div ref={refs.drill}>
            {drill && (
              <section className="dp-sec wide">
                <div className="dp-sechead">
                  <h3 className="dp-h d"><Icon name="note" size={16} /> 4. Luyện tập</h3>
                  <button className="dp-link" onClick={() => setDrill(null)}>Đóng</button>
                </div>
                <Practice
                  dw={dw}
                  examples={allExamples}
                  start={drill}
                  onDone={() => markPart(dw.term, 'drill')}
                />
              </section>
            )}
          </div>
        </div>

        <aside className="dp-right">
          <div className="dp-panel">
            <b className="dp-plabel">TIẾN ĐỘ HỌC SÂU</b>
            <div className="dp-progrow">
              <Donut pct={pct} />
              <ul className="dp-checklist">
                {SECTIONS.map((s) => (
                  <li key={s.id} className={prog.done.includes(s.id) ? 'on' : ''}>
                    <span>{s.n}. {s.name}</span>
                    {prog.done.includes(s.id)
                      ? <Icon name="check-circle" size={16} />
                      : <i className="dp-dot" />}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dp-panel">
            <div className="dp-panelhead">
              <b className="dp-plabel"><Icon name="flame" size={14} /> Chuỗi ngày học sâu</b>
              <span className="dp-streak">{streak} ngày liên tiếp!</span>
            </div>
            <div className="dp-week">
              {week.map((d) => (
                <div key={d.label} className={'dp-day' + (d.on ? ' on' : '')}>
                  <i>{d.on && <Icon name="check" size={13} />}</i>
                  <span>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dp-panel">
            <b className="dp-plabel">Thống kê học từ này</b>
            <div className="dp-stats">
              <div><Icon name="book" size={18} /><b>{prog.done.length}/4</b><span>Phần hoàn thành</span></div>
              <div><Icon name="headphones" size={18} /><b>{prog.heard}</b><span>Ví dụ đã nghe</span></div>
              <div><Icon name="note" size={18} /><b>{prog.ok}/{prog.asked}</b><span>Câu đúng</span></div>
              <div><Icon name="clock" size={18} /><b>{Math.max(0, Math.round(prog.sec / 60))}</b><span>Phút học</span></div>
            </div>
          </div>

          <div className="dp-panel">
            <div className="dp-panelhead">
              <b className="dp-plabel d">4. Luyện tập</b>
              <span className="dp-link">{prog.asked > 0 ? `${prog.ok}/${prog.asked} đúng` : 'chưa làm'}</span>
            </div>
            <div className="dp-quick">
              {DRILLS.map((d) => (
                <div key={d.id} className="dp-quickrow">
                  <span className="dp-pic"><Icon name={d.icon} size={15} /></span>
                  <div>
                    <b>{d.name}</b>
                    <small>{d.sub}</small>
                  </div>
                  <button className="dp-do" onClick={() => { setDrill(d.id); jump('drill') }}>Làm bài</button>
                </div>
              ))}
            </div>
          </div>

          <button className="dp-return" onClick={onBack}>
            <Icon name="chevron-left" size={16} /> Quay lại thẻ để học tiếp <Icon name="arrow-right" size={16} />
          </button>
        </aside>
      </div>
    </div>
  )
}
