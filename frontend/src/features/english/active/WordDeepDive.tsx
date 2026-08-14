import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import {
  DIMS, FAMILIES, FAMILY_GLOSS, KIND_LABEL, LEVELS, comboCount, levelSpec,
  packOfChunk, wordEntry,
} from '@/data/englishActive'
import { useMastery } from './mastery'
import Drill from './Drill'

interface Props {
  head: string
  onPickWord: (head: string) => void
  onBack: () => void
}

const BAR_TONE = ['b1', 'b2', 'b3', 'b4', 'b5']

function FamilyPicker({ onPickWord, onBack }: Omit<Props, 'head'>) {
  const { familyMastery } = useMastery()
  return (
    <div className="ac-lib">
      <div className="ac-lib-intro">
        <Icon name="letters" size={16} />
        <div>
          <b>Học sâu theo từ, không theo danh sách</b>
          <span>
            Mỗi từ dưới đây có nhiều đời sống khác nhau nằm rải khắp các gói tình huống.
            Làm chủ một từ nghĩa là dùng được <em>tất cả</em> các đời sống đó, không phải nhớ một nghĩa tiếng Việt.
          </span>
        </div>
      </div>
      <button className="ac-ghost ac-selfstart" onClick={onBack}>
        <Icon name="arrow-left" size={15} /> Quay lại
      </button>
      <div className="ac-wordgrid">
        {FAMILIES.map((f) => {
          const m = familyMastery(f.members)
          const g = FAMILY_GLOSS[f.head]
          return (
            <button key={f.head} className="ac-wordcard" onClick={() => onPickWord(f.head)}>
              <b>{f.head}</b>
              <small>{g?.vi}</small>
              <div className="ac-wordmeta">
                <span>{wordEntry(f.head)?.senses.length ?? 0} nghĩa · {f.members.length} cụm</span>
                <span>{m.pct[2]}%</span>
              </div>
              <div className="ac-packbar"><div style={{ width: `${m.pct[2]}%` }} /></div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function WordDeepDive({ head, onPickWord, onBack }: Props) {
  const { familyMastery, recOf, queueFor } = useMastery()
  const [drilling, setDrilling] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const family = FAMILIES.find((f) => f.head === head)

  const queue = useMemo(() => {
    if (!family) return []
    const day = new Date().toISOString().slice(0, 10)
    return [...family.members].sort((a, b) => {
      const ra = recOf(a.id)
      const rb = recOf(b.id)
      const ka = !ra.seen ? 1 : (!ra.due || ra.due <= day ? 0 : ra.lv >= 5 ? 4 : 3)
      const kb = !rb.seen ? 1 : (!rb.due || rb.due <= day ? 0 : rb.lv >= 5 ? 4 : 3)
      return ka - kb
    }).slice(0, 10)
  }, [family, recOf])

  if (!family) return <FamilyPicker onPickWord={onPickWord} onBack={onBack} />

  const m = familyMastery(family.members)
  const gloss = FAMILY_GLOSS[head]
  const entry = wordEntry(head)
  const nextLevel = LEVELS.slice(1).find((l) => m.pct[l.lv - 1] < 100)

  if (drilling) {
    return (
      <div className="ac-gym">
        <button className="ac-ghost ac-selfstart" onClick={() => setDrilling(false)}>
          <Icon name="arrow-left" size={15} /> Về trang từ “{head}”
        </button>
        <Drill
          key={`word-${head}`}
          queue={queue}
          heading={`Học sâu · họ từ “${head}”`}
          onFinish={() => setDrilling(false)}
        />
      </div>
    )
  }

  return (
    <div className="ac-deep">
      <button className="ac-ghost ac-selfstart" onClick={onBack}>
        <Icon name="arrow-left" size={15} /> Quay lại
      </button>

      <div className="ac-deephead">
        <div className="ac-deepword">
          <div className="ac-deeptop">
            <h2>{head}</h2>
            <button className="ac-play" onClick={() => speakAccent(head, 'us')}>
              <Icon name="volume" size={18} />
            </button>
          </div>
          <p className="ac-deepipa">{entry?.ipa ?? gloss?.ipa} · {entry?.pos ?? gloss?.pos}</p>
          {gloss && <p className="ac-deepgloss">{gloss.vi}</p>}
          {entry && <p className="ac-deepcore">{entry.core}</p>}
          <p className="ac-deepnote">
            {entry
              ? <><b>{entry.senses.length} nghĩa</b> · <b>{comboCount(entry)} cách ghép</b> · <b>{family.members.length} cụm</b> có bài luyện.
                Học một từ là hiểu hết chừng này, không phải nhớ một dòng nghĩa tiếng Việt.</>
              : <>Từ này có <b>{family.members.length} cách dùng</b> nằm rải{' '}
                <b>{new Set(family.members.map((c) => packOfChunk(c.id)?.id)).size} gói tình huống</b>.</>}
          </p>
          <button className="ac-next" onClick={() => setDrilling(true)}>
            <Icon name="bulb" size={15} /> Luyện riêng từ này
          </button>
        </div>

        <div className="ac-deepchart">
          <span className="mw-sub">Mức độ làm chủ</span>
          <div className="mw-bars">
            {LEVELS.slice(1).map((l, i) => (
              <div key={l.lv} className="mw-bar">
                <b>{m.pct[i]}%</b>
                <div className="mw-track">
                  <div className={'mw-fill ' + BAR_TONE[i]} style={{ height: `${Math.max(m.pct[i], 2)}%` }} />
                </div>
                <span className="mw-barlv">Level {l.lv}</span>
                <em>{l.name}</em>
              </div>
            ))}
          </div>
          <p className="ac-deepfoot">
            {nextLevel
              ? <>Còn <b>{100 - m.pct[nextLevel.lv - 1]}%</b> số cách dùng chưa qua được mức {nextLevel.lv} — {nextLevel.name.toLowerCase()}.</>
              : <>Bạn đã làm chủ trọn vẹn từ này ở cả 5 mức.</>}
            {m.medianMs > 0 && <> Độ trễ truy xuất trung bình: <b>{(m.medianMs / 1000).toFixed(1)}s</b>.</>}
          </p>
        </div>
      </div>

      {entry && (
        <div className="ac-panel">
          <div className="ac-panel-head">
            <h3><Icon name="book" size={17} /> Tất cả nghĩa của “{head}”</h3>
            <span>{entry.senses.length} nghĩa — cùng một từ, khác ngữ cảnh là khác nghĩa</span>
          </div>
          <ol className="ac-senses">
            {entry.senses.map((s, i) => (
              <li key={i}>
                <span className="ac-sensen">{i + 1}</span>
                <div>
                  <b>{s.vi}</b>
                  <p>{s.ex}</p>
                  <small>{s.exVi}</small>
                </div>
                <button className="ac-play tiny" onClick={() => speakAccent(s.ex, 'us')}>
                  <Icon name="volume" size={14} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {entry && (
        <div className="ac-panel">
          <div className="ac-panel-head">
            <h3><Icon name="letters" size={17} /> Cách ghép “{head}” với từ khác</h3>
            <span>{comboCount(entry)} khuôn ghép — đây mới là thứ quyết định bạn dùng được hay không</span>
          </div>
          <div className="ac-combos">
            {entry.combos.map((g, gi) => (
              <div key={gi} className="ac-combo">
                <b className="ac-combolabel">{g.label}</b>
                {g.note && <p className="ac-combonote">{g.note}</p>}
                <div className="ac-comboitems">
                  {g.items.map((it, ii) => (
                    <div key={ii} className="ac-comboitem">
                      <div className="ac-comboform">
                        <code>{it.form}</code>
                        <button className="ac-play tiny" onClick={() => speakAccent(it.ex, 'us')}>
                          <Icon name="volume" size={13} />
                        </button>
                      </div>
                      <span className="ac-combovi">{it.vi}</span>
                      <em className="ac-comboex">{it.ex}</em>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="cards" size={17} /> {family.members.length} cụm có bài luyện</h3>
          <span>Đây là phần được chấm theo 5 mức làm chủ</span>
        </div>
        <div className="ac-chunks">
          {family.members.map((c) => {
            const rec = recOf(c.id)
            const lv = levelSpec(rec.lv)
            const open = openId === c.id
            const pack = packOfChunk(c.id)
            return (
              <div key={c.id} className={'ac-chunk' + (open ? ' open' : '')}>
                <button className="ac-chunk-head" onClick={() => setOpenId(open ? null : c.id)}>
                  <span className={'ac-lv l' + rec.lv}>{rec.lv}</span>
                  <div className="ac-chunk-main">
                    <b>{c.en}</b>
                    <small>{c.vi}</small>
                  </div>
                  <span className="ac-chunk-lv">{pack?.emoji} {lv.name}</span>
                  <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} />
                </button>
                {open && (
                  <div className="ac-chunk-body">
                    <div className="ac-chunk-row">
                      <span className="ac-kindchip">{KIND_LABEL[c.kind]}</span>
                      {c.pattern && c.pattern !== c.en && <code>{c.pattern}</code>}
                    </div>
                    <div className="ac-chunk-say">
                      <p>“{c.say}”</p>
                      <button className="ac-play tiny" onClick={() => speakAccent(c.say, 'us')}>
                        <Icon name="volume" size={14} />
                      </button>
                    </div>
                    <p className="ac-chunk-cue"><b>Tình huống:</b> {c.cue}</p>
                    {c.note && <p className="ac-detail-note"><Icon name="bulb" size={14} /> {c.note}</p>}
                    {c.trap && <p className="ac-detail-trap"><Icon name="frown" size={14} /> {c.trap}</p>}
                    <div className="ac-dimrow">
                      {DIMS.map((d) => {
                        const got = rec.d[d.id] ?? 0
                        const pass = got >= d.hits
                        return (
                          <span key={d.id} className={'ac-dimdot' + (pass ? ' on' : '')}>
                            <Icon name={d.icon} size={12} /> {d.name}
                            {pass ? <Icon name="check" size={11} /> : <em>{got}/{d.hits}</em>}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="ac-wordnav">
        <span>Họ từ khác</span>
        <div className="ac-chips">
          {FAMILIES.filter((f) => f.head !== head).map((f) => (
            <button key={f.head} className="ac-chip" onClick={() => onPickWord(f.head)}>
              {f.head} <em>{f.members.length}</em>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
