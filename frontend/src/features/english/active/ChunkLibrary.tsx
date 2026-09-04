import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakAccent } from '@/core/tts'
import {
  DIMS, FAMILIES, KIND_LABEL, PACKS, familySiblings, levelSpec, packById, packOfChunk,
} from '@/data/englishActive'
import { useMastery } from './mastery'

interface Props {
  packId: string
  onPack: (id: string) => void
  onScene?: () => void
  onDrill?: () => void
  onDeepWord?: (head: string) => void
}

export default function ChunkLibrary({ packId, onPack, onScene, onDrill, onDeepWord }: Props) {
  const { recOf, packProgress, setGoal, state } = useMastery()
  const [openId, setOpenId] = useState<string | null>(null)
  const [openFam, setOpenFam] = useState<string | null>(null)
  const pack = packById(packId) ?? PACKS[0]
  const prog = packProgress(pack)
  const fam = FAMILIES.find((f) => f.head === openFam)

  return (
    <div className="ac-lib">
      <div className="ac-lib-intro">
        <Icon name="target" size={16} />
        <div>
          <b>Dùng gì học nấy — chọn gói theo đích của bạn</b>
          <span>
            Đơn vị học ở đây không phải một từ trần trụi mà là <em>cụm + khuôn câu + tình huống + cách dùng</em>.
            Đặt một gói làm mục tiêu, hệ thống sẽ ưu tiên gói đó trong buổi học hằng ngày.
            {!state.goal && <> <b>Bạn chưa đặt mục tiêu nào</b> — chọn gói sát nhất với việc bạn thật sự phải làm bằng tiếng Anh, không nhất thiết phải là công việc.</>}
          </span>
        </div>
      </div>

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="letters" size={17} /> Họ từ — một từ, nhiều đời sống</h3>
          <span>Cùng một động từ, đổi giới từ là đổi hẳn nghĩa</span>
        </div>
        <p className="ac-fam-why">
          Đây là chỗ trả lời câu “biết hết nghĩa của từ trong mọi tình huống”. Các cụm dưới đây
          <b> nằm rải khắp các gói khác nhau</b> — bấm một từ để thấy tất cả đời sống của nó cạnh nhau.
          Trong bài kiểm tra, phương án nhiễu cũng được lấy <b>ưu tiên từ cùng họ</b>, nên bạn buộc phải
          phân biệt <em>take off</em> với <em>take up</em> chứ không đoán mò được.
        </p>
        <div className="ac-fams">
          {FAMILIES.map((f) => (
            <button
              key={f.head}
              className={'ac-fam' + (openFam === f.head ? ' on' : '')}
              onClick={() => setOpenFam(openFam === f.head ? null : f.head)}
            >
              <b>{f.head}</b>
              <em>{f.members.length} cách dùng</em>
            </button>
          ))}
        </div>
        {fam && onDeepWord && (
          <button className="ac-next ac-famdeep" onClick={() => onDeepWord(fam.head)}>
            Mở trang học sâu “{fam.head}” <Icon name="arrow-right" size={15} />
          </button>
        )}
        {fam && (
          <div className="ac-famlist">
            {fam.members.map((m) => {
              const r = recOf(m.id)
              const p = packOfChunk(m.id)
              return (
                <div key={m.id} className="ac-famrow">
                  <span className={'ac-lv l' + r.lv}>{r.lv}</span>
                  <div>
                    <b>{m.en}</b>
                    <small>{m.vi}</small>
                  </div>
                  <span className="ac-fampack">{p?.name}</span>
                  <button className="ac-play tiny" onClick={() => speakAccent(m.say, 'us')}>
                    <Icon name="volume" size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="ac-packs">
        {PACKS.map((p) => {
          const pr = packProgress(p)
          return (
            <button
              key={p.id}
              className={'ac-pack' + (p.id === packId ? ' on' : '') + (state.goal === p.id ? ' goal' : '')}
              onClick={() => { onPack(p.id); setOpenId(null) }}
            >
              <span className={'ac-pack-emoji ' + p.tone}>{p.cefr}</span>
              <b>{p.name}</b>
              <small>{p.sub}</small>
              <div className="ac-pack-meta">
                <span>{p.chunks.length} cụm</span>
                <span>{p.cefr}</span>
              </div>
              <div className="ac-packbar"><div style={{ width: `${pr.pct}%` }} /></div>
              {state.goal === p.id && <em className="ac-goal-tag">Mục tiêu</em>}
            </button>
          )
        })}
      </div>

      <div className="ac-packhead">
        <div>
          <h3>{pack.name}</h3>
          <p className="ac-packgoal"><b>Đích:</b> {pack.goal}</p>
          <p className="ac-packwhy">{pack.why}</p>
        </div>
        <div className="ac-packacts">
          <button
            className={'ac-goalbtn' + (state.goal === pack.id ? ' on' : '')}
            onClick={() => setGoal(pack.id)}
          >
            <Icon name={state.goal === pack.id ? 'check-circle' : 'target'} size={15} />
            {state.goal === pack.id ? 'Đang là mục tiêu' : 'Đặt làm mục tiêu'}
          </button>
          {onScene && <button className="ac-ghost" onClick={onScene}><Icon name="play" size={15} /> Xem cảnh</button>}
          {onDrill && <button className="ac-next" onClick={onDrill}><Icon name="bulb" size={15} /> Luyện gói này</button>}
        </div>
      </div>

      <div className="ac-packstat">
        <span><b>{prog.active}</b> / {prog.total} cụm đã dùng được chủ động</span>
        <span><b>{prog.pct}%</b> mức làm chủ trung bình</span>
        <span>Đã xem cảnh <b>{prog.watched}</b> lượt</span>
      </div>

      <div className="ac-chunks">
        {pack.chunks.map((c) => {
          const rec = recOf(c.id)
          const lv = levelSpec(rec.lv)
          const open = openId === c.id
          return (
            <div key={c.id} className={'ac-chunk' + (open ? ' open' : '')}>
              <button className="ac-chunk-head" onClick={() => setOpenId(open ? null : c.id)}>
                <span className={'ac-lv l' + rec.lv}>{rec.lv}</span>
                <div className="ac-chunk-main">
                  <b>{c.en}</b>
                  <small>{c.vi}</small>
                </div>
                <span className="ac-chunk-lv">{lv.name}</span>
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
                    <button className="ac-play tiny" onClick={() => speakAccent(c.say, 'us')}><Icon name="volume" size={14} /></button>
                  </div>
                  <p className="ac-chunk-cue"><b>Tình huống:</b> {c.cue}</p>
                  {c.ask && <p className="ac-chunk-ask"><b>Câu hỏi kích hoạt:</b> “{c.ask}”</p>}
                  {c.note && <p className="ac-detail-note"><Icon name="bulb" size={14} /> {c.note}</p>}
                  {c.trap && <p className="ac-detail-trap"><Icon name="frown" size={14} /> {c.trap}</p>}

                  <div className="ac-dimrow">
                    {DIMS.map((d) => {
                      const got = rec.d[d.id] ?? 0
                      const pass = got >= d.hits
                      return (
                        <span key={d.id} className={'ac-dimdot' + (pass ? ' on' : '')} title={d.name}>
                          <Icon name={d.icon} size={12} /> {d.name}
                          {pass ? <Icon name="check" size={11} /> : <em>{got}/{d.hits}</em>}
                        </span>
                      )
                    })}
                  </div>
                  {rec.ms.length > 0 && (
                    <p className="ac-chunk-ms">
                      Độ trễ truy xuất gần đây: {rec.ms.map((m) => `${(m / 1000).toFixed(1)}s`).join(' · ')}
                    </p>
                  )}
                  {familySiblings(c).length > 0 && (
                    <p className="ac-chunk-fam">
                      <b>Cùng họ:</b>{' '}
                      {familySiblings(c).map((s, k) => (
                        <span key={s.id}>{k > 0 && ' · '}<em>{s.en}</em> ({s.vi})</span>
                      ))}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
