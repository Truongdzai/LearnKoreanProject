import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import { posLabel, loadDefs, type WordDefs } from '@/data/vocabCore'
import { fetchWordImage, type WordImage } from '@/core/api/english.api'
import { addCard } from '@/core/api/srs.api'
import type { WordProfile } from '@/models/wordprofile.model'
import { masteryOf, pctOf, useDeep, type DeepPart } from './deep'
import {
  chunkUses, coreNote, corpusExamples, DEEP_WORD_COUNT, findDeepWord, localCollocations, localSenses,
  minedCollocations, suggestWords, type DeepWord,
} from './wordData'
import { loadStaticImages, staticImage } from './staticImage'
import { curatedProfile, loadProfile, RICHEST_WORDS } from './profiles'
import SenseMap from './SenseMap'
import WordUse from './WordUse'
import WordCompare from './WordCompare'
import Practice from './Practice'

interface Props {
  term: string
  onPickWord: (term: string) => void
  onBack: () => void
}

const SECTIONS: { id: DeepPart; n: number; name: string; icon: IconName }[] = [
  { id: 'sense', n: 1, name: 'Tất cả nghĩa', icon: 'book' },
  { id: 'colloc', n: 2, name: 'Cụm & thành ngữ', icon: 'letters' },
  { id: 'compare', n: 3, name: 'Phân biệt & họ từ', icon: 'target' },
  { id: 'example', n: 4, name: 'Ví dụ thực tế', icon: 'cards' },
  { id: 'drill', n: 5, name: 'Luyện tập', icon: 'note' },
]

const DRILLS: { id: string; name: string; sub: string; icon: IconName }[] = [
  { id: 'sense', name: 'Nghĩa nào ở đây?', sub: 'Đọc câu, chọn đúng nghĩa đang dùng', icon: 'book' },
  { id: 'quiz', name: 'Trắc nghiệm', sub: 'Chọn đáp án đúng', icon: 'target' },
  { id: 'colloc', name: 'Ghép cụm', sub: 'Chọn từ đi cùng cho đúng', icon: 'letters' },
  { id: 'listen', name: 'Nghe & điền', sub: 'Nghe và điền từ còn thiếu', icon: 'headphones' },
  { id: 'speak', name: 'Nói câu với từ', sub: 'Luyện nói với từ này', icon: 'mic' },
  { id: 'write', name: 'Viết câu', sub: 'Viết câu có dùng từ này', icon: 'note' },
]

function Donut({ pct }: { pct: number }) {
  return (
    <div className="dp-meter">
      <b>{pct}<small>%</small></b>
      <span className="dp-meter-lbl">Hoàn thành</span>
      <span className="dp-meter-gauge"><i style={{ width: pct + '%' }} /></span>
    </div>
  )
}

function Figure({ img, term }: { img: WordImage; term: string }) {
  return (
    <figure className="dp-fig">
      <img src={img.url} alt={`Hình minh hoạ cho từ ${term}`} />
      {!img.ai && (
        <figcaption>
          {img.author ? `${img.author} · ` : ''}
          <a href={img.license_url || img.source} target="_blank" rel="noreferrer noopener">{img.license}</a>
        </figcaption>
      )}
    </figure>
  )
}

function Picker({ onPickWord, onBack }: Omit<Props, 'term'>) {
  const [q, setQ] = useState('')
  const found = q.trim() ? findDeepWord(q) : null
  const rich = useMemo(
    () => RICHEST_WORDS.filter((w) => findDeepWord(w.term)).slice(0, 18),
    [],
  )
  const list = useMemo(() => (rich.length ? [] : suggestWords(14)), [rich.length])
  return (
    <div className="dp-picker">
      <button className="dp-back" onClick={onBack}><Icon name="chevron-left" size={16} /> Quay lại thẻ</button>
      <h3>Học sâu từ vựng</h3>
      <p>
        Gõ một từ trong kho {DEEP_WORD_COUNT.toLocaleString('vi-VN')} thẻ để mở hồ sơ đầy đủ của từ đó:
        tất cả các nghĩa, cụm đi kèm, họ từ, từ gần nghĩa và những lỗi hay mắc.
      </p>
      <input
        className="ac-input one"
        value={q}
        placeholder="Ví dụ: people, take, coffee…"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && found) onPickWord(found.term) }}
      />
      {q.trim() && !found && (
        <p className="dp-empty">
          Không có từ “{q.trim()}” trong kho {DEEP_WORD_COUNT.toLocaleString('vi-VN')} thẻ.
        </p>
      )}
      {found && (
        <button className="dp-cta" onClick={() => onPickWord(found.term)}>
          Mở trang học sâu “{found.term}” <Icon name="arrow-right" size={15} />
        </button>
      )}
      {rich.length > 0 && (
        <p className="dp-pickhint">Bắt đầu từ những từ nhiều nghĩa nhất — đây là nhóm dễ hiểu nhầm nhất:</p>
      )}
      <div className="dp-suggest">
        {rich.map((w) => (
          <button key={w.term} className="ac-chip" onClick={() => onPickWord(w.term)}>
            {w.term} <em>{w.n}</em>
          </button>
        ))}
        {list.map((d) => (
          <button key={d.term} className="ac-chip" onClick={() => onPickWord(d.term)}>{d.term}</button>
        ))}
      </div>
    </div>
  )
}

export default function DeepPage({ term, onPickWord, onBack }: Props) {
  const { progressOf, markPart, touchWord, toggleSense, setSenseTotal, addHeard, addTime, streak, week } = useDeep()
  const [active, setActive] = useState<DeepPart>('sense')
  const [defs, setDefs] = useState<WordDefs>({})
  const [profile, setProfile] = useState<WordProfile | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'fail'>('idle')
  const [allEx, setAllEx] = useState(false)
  const [img, setImg] = useState<WordImage | null>(null)
  const [drill, setDrill] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const startRef = useRef(Date.now())
  const refs = {
    sense: useRef<HTMLElement>(null),
    colloc: useRef<HTMLElement>(null),
    compare: useRef<HTMLElement>(null),
    example: useRef<HTMLElement>(null),
    drill: useRef<HTMLDivElement>(null),
  }

  const dw: DeepWord | null = useMemo(() => (term ? findDeepWord(term) : null), [term])

  useEffect(() => {
    loadDefs('en').then(setDefs).catch(() => {  })
  }, [])

  useEffect(() => {
    setActive('sense')
    setAllEx(false)
    setImg(null)
    setDrill(null)
    setSaved(false)
    startRef.current = Date.now()
    if (term && findDeepWord(term)) touchWord(term)
  }, [term])

  useEffect(() => {
    const found = term ? findDeepWord(term) : null
    if (!found) return
    let alive = true

    setProfile(curatedProfile(found.term))
    setState('loading')

    loadProfile(found.term, found.w.pos, found.w.vi)
      .then((p) => {
        if (!alive) return
        setProfile(p)
        setState(p && p.senses.length ? 'done' : 'fail')
        if (p) setSenseTotal(found.term, p.senses.length)
      })
      .catch(() => { if (alive) setState('fail') })

    void loadStaticImages().then(() => {
      if (!alive) return
      const local = staticImage(found.term)
      if (local) {
        setImg({
          url: local, full: local, title: `Hình cho “${found.term}”`, author: '', author_url: '',
          license: 'AI', license_url: '', source: '', provider: 'repo', query: found.term, ai: true,
        })
        return
      }
      fetchWordImage(found.term, found.term)
        .then((r) => { if (alive) setImg(r.image) })
        .catch(() => {  })
    })

    return () => { alive = false }
  }, [term])

  useEffect(() => () => {
    if (term) addTime(term, (Date.now() - startRef.current) / 1000)
  }, [term])

  const jump = useCallback((id: DeepPart) => {
    setActive(id)
    if (id === 'example') markPart(term, id)
    refs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [term, markPart])

  if (!dw) return <Picker onPickWord={onPickWord} onBack={onBack} />

  const { w, unit } = dw
  const def = defs[dw.term] ?? {}
  const prog = progressOf(dw.term)
  const pct = pctOf(prog)
  const mastery = masteryOf(prog)

  const fallbackSenses = localSenses(dw.term, w.vi, def.defVi ?? '', w.ex, w.exVi)
  const shown: WordProfile | null = profile && profile.senses.length ? profile : null
  const senseCount = shown?.senses.length ?? fallbackSenses.length
  const gotSenses = prog.senses.filter((i) => i < senseCount).length

  const core = coreNote(dw.term)
  const chunks = chunkUses(dw.term)
  const examples = corpusExamples(dw.term, 24)
  const senseExamples = (shown?.senses ?? []).flatMap((s) => [
    ...(s.ex ? [{ en: s.ex, vi: s.exVi, from: s.vi }] : []),
    ...(s.ex2 ? [{ en: s.ex2, vi: s.ex2Vi, from: s.vi }] : []),
  ])
  const allExamples = [...examples, ...senseExamples].filter(
    (e, i, xs) => xs.findIndex((x) => x.en.toLowerCase() === e.en.toLowerCase()) === i,
  )
  const shownEx = allEx ? allExamples : allExamples.slice(0, 4)

  const hasRichUse = !!shown && (shown.combos.length > 0 || shown.phrasals.length > 0)
  const inTerm = (text: string) => text.toLowerCase().includes(dw.term.toLowerCase())
  const extraCols = [
    ...localCollocations(dw.term).map((c) => ({ form: c.form, vi: c.vi, ex: c.ex })),
    ...chunks.filter((c) => inTerm(c.en)).map((c) => ({ form: c.en, vi: c.vi, ex: c.say })),
    ...(hasRichUse ? [] : minedCollocations(dw.term).map((p) => ({ form: p, vi: '', ex: p }))),
  ].filter((r, i, xs) => xs.findIndex((x) => x.form.toLowerCase() === r.form.toLowerCase()) === i)

  const say = (text: string, rate?: number) => {
    speakAccent(text, 'us', rate)
    addHeard(dw.term)
  }

  const save = () => {
    setSaved(true)
    addCard({ front: dw.term, back: w.vi, source: 'hoc-sau' }).catch(() => {  })
  }

  const pickSense = (i: number) => toggleSense(dw.term, i, senseCount)

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
            <div className={'dp-icon ' + unit.tone + (img ? ' has-pic' : '')}>
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
                <span className="dp-ipa">/{(shown?.ipa || dw.us).replace(/^\/|\/$/g, '')}/</span>
                <button className="dp-acc" onClick={() => say(dw.term)}>US <Icon name="volume" size={13} /></button>
                <button className="dp-acc" onClick={() => say(dw.term, 0.6)}>Chậm <Icon name="volume" size={13} /></button>
                <span className="dp-pos">{posLabel(w.pos)}</span>
                {shown?.level && <span className="dp-level">{shown.level}</span>}
                {senseCount > 1 && <span className="dp-count">{senseCount} nghĩa</span>}
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
                onClick={() => (s.id === 'drill' ? (setDrill(drill ?? 'sense'), jump('drill')) : jump(s.id))}
              >
                <Icon name={s.icon} size={15} /> {s.n}. {s.name}
              </button>
            ))}
          </div>

          <section className="dp-sec" ref={refs.sense}>
            <div className="dp-sechead">
              <h3 className="dp-h"><Icon name="book" size={16} /> 1. Tất cả nghĩa của “{dw.term}”</h3>
              {state === 'loading' && <span className="dp-loading"><Icon name="refresh" size={13} /> Đang dựng hồ sơ từ…</span>}
            </div>

            {shown ? (
              <SenseMap
                profile={shown}
                prog={prog}
                figure={img ? <Figure img={img} term={dw.term} /> : null}
                onToggle={pickSense}
                onSay={say}
              />
            ) : (
              <div className="dp-senseblock">
                <div className="dp-sensetext">
                  <p className="dp-term">{dw.term} <em>({posLabel(w.pos).toLowerCase()})</em></p>
                  <p className="dp-termvi">{w.vi}</p>
                  <ul className="dp-senselist">
                    {fallbackSenses.map((s, i) => (
                      <li key={i}>
                        <b>{s.title}</b>
                        {s.desc && <span className="dp-sdesc">{s.desc}</span>}
                        <em>{s.ex}</em>
                        <small>({s.exVi})</small>
                        <button className="ac-play tiny" onClick={() => say(s.ex)}><Icon name="volume" size={12} /></button>
                      </li>
                    ))}
                  </ul>
                  {state === 'fail' && (
                    <p className="dp-empty">
                      Chưa dựng được đầy đủ các nghĩa cho từ này lúc này. Phần nghĩa chính bên trên vẫn dùng được,
                      mở lại trang sau là có bản đầy đủ.
                    </p>
                  )}
                </div>
                {img && <Figure img={img} term={dw.term} />}
              </div>
            )}

            <div className="dp-tip">
              <b><Icon name="bulb" size={14} /> Mẹo nhớ</b>
              <p>{w.connect}</p>
              {core && <p className="dp-core">{core}</p>}
            </div>
          </section>

          <section className="dp-sec wide" ref={refs.colloc}>
            <div className="dp-sechead">
              <h3 className="dp-h b"><Icon name="letters" size={16} /> 2. Từ này đi với những từ nào</h3>
              <button className="dp-link" onClick={() => markPart(dw.term, 'colloc')} disabled={prog.done.includes('colloc')}>
                {prog.done.includes('colloc') ? <><Icon name="check" size={13} /> Đã xong</> : 'Đánh dấu đã xong'}
              </button>
            </div>
            {shown || extraCols.length ? (
              <WordUse
                profile={shown ?? curatedProfile(dw.term) ?? emptyProfile(dw.term)}
                extra={extraCols}
                onSay={say}
              />
            ) : (
              <p className="dp-empty">Từ này chưa có bộ cụm từ sẵn.</p>
            )}
            <button className="dp-add" onClick={save} disabled={saved}>
              <Icon name="plus" size={14} /> {saved ? 'Đã thêm vào sổ tay' : 'Thêm vào sổ tay từ vựng'}
            </button>
          </section>

          <section className="dp-sec wide" ref={refs.compare}>
            <div className="dp-sechead">
              <h3 className="dp-h e"><Icon name="target" size={16} /> 3. Phân biệt, họ từ &amp; lỗi hay gặp</h3>
              <button className="dp-link" onClick={() => markPart(dw.term, 'compare')} disabled={prog.done.includes('compare')}>
                {prog.done.includes('compare') ? <><Icon name="check" size={13} /> Đã xong</> : 'Đánh dấu đã xong'}
              </button>
            </div>
            {shown ? (
              <WordCompare
                profile={shown}
                onPickWord={onPickWord}
                hasWord={(t) => !!findDeepWord(t)}
                onSay={say}
              />
            ) : (
              <p className="dp-empty">Phần này hiện ra khi hồ sơ đầy đủ của từ được dựng xong.</p>
            )}
          </section>

          <section className="dp-sec wide" ref={refs.example}>
            <div className="dp-sechead">
              <h3 className="dp-h c"><Icon name="cards" size={16} /> 4. Ví dụ thực tế</h3>
              {allExamples.length > 4 && (
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
            {allExamples.length > 4 && (
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
                  <h3 className="dp-h d"><Icon name="note" size={16} /> 5. Luyện tập</h3>
                  <button className="dp-link" onClick={() => setDrill(null)}>Đóng</button>
                </div>
                <Practice
                  dw={dw}
                  profile={shown}
                  examples={allExamples}
                  start={drill}
                  onDone={() => markPart(dw.term, 'drill')}
                />
              </section>
            )}
          </div>
        </div>

        <aside className="dp-right">
          <div className="dp-panel dp-mastery">
            <b className="dp-plabel">MỨC LÀM CHỦ TỪ NÀY</b>
            <div className="dp-mastop">
              <span className={'dp-maslv ' + mastery.tone}>{mastery.lv}</span>
              <div>
                <b>{mastery.name}</b>
                <small>{mastery.desc}</small>
              </div>
            </div>
            <div className="dp-masbar">
              {[1, 2, 3, 4, 5].map((n) => (
                <i key={n} className={mastery.lv >= n ? 'on' : ''} />
              ))}
            </div>
            <p className="dp-masnext">
              {mastery.lv >= 5
                ? 'Từ này bạn đã làm chủ — gặp ở nghĩa nào cũng hiểu và tự dùng được.'
                : gotSenses < senseCount
                  ? `Còn ${senseCount - gotSenses} nghĩa chưa đánh dấu hiểu. Đọc và bấm “Đã hiểu nghĩa này” ở từng nghĩa.`
                  : !prog.done.includes('colloc')
                    ? 'Đủ nghĩa rồi. Sang phần 2 xem từ này đi với những từ nào, rồi bấm “Đánh dấu đã xong”.'
                    : !prog.done.includes('compare')
                      ? 'Còn phần 3: phân biệt với từ gần nghĩa và xem lỗi hay mắc.'
                      : `Còn bài luyện: làm thêm ${Math.max(0, 8 - prog.asked)} câu và giữ độ đúng trên 90% là lên mức làm chủ.`}
            </p>
          </div>

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
              <div><Icon name="book" size={18} /><b>{gotSenses}/{senseCount}</b><span>Nghĩa đã nắm</span></div>
              <div><Icon name="headphones" size={18} /><b>{prog.heard}</b><span>Ví dụ đã nghe</span></div>
              <div><Icon name="note" size={18} /><b>{prog.ok}/{prog.asked}</b><span>Câu đúng</span></div>
              <div><Icon name="clock" size={18} /><b>{Math.max(0, Math.round(prog.sec / 60))}</b><span>Phút học</span></div>
            </div>
          </div>

          <div className="dp-panel">
            <div className="dp-panelhead">
              <b className="dp-plabel d">5. Luyện tập</b>
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

function emptyProfile(term: string): WordProfile {
  return {
    term, ipa: '', level: '', core: '', grammar: '',
    senses: [], family: [], combos: [], phrasals: [], idioms: [],
    synonyms: [], antonyms: [], confuse: [], mistakes: [],
  }
}
