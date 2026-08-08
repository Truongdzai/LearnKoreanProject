import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import type { PronGroup, PronSyllable } from '@/data/englishPronunciation'
import { CTX, MicButton, ResultLine, useReader } from './reader'

function Syllables({ item }: { item: PronSyllable }) {
  return (
    <span className="stb-parts" lang={CTX.lang}>
      {item.parts.map((p, k) => (
        <span key={k} className={'stb-part' + (k === item.hit ? ' hit' : '')}>
          {k === item.hit ? p.toUpperCase() : p}
        </span>
      ))}
    </span>
  )
}

function MarkDrill({ items }: { items: PronSyllable[] }) {
  const [picks, setPicks] = useState<Record<string, number>>({})
  const done = Object.keys(picks).length
  const right = useMemo(
    () => items.filter((it) => picks[it.w] === it.hit).length,
    [items, picks],
  )

  return (
    <div className="stb-drill">
      <div className="stb-head">
        <b><Icon name="target" size={15} /> Bấm vào âm tiết bạn nghĩ là được nhấn</b>
        <span className="stb-count">{right}/{done || 0} đúng</span>
        {done > 0 && (
          <button className="btn-ghost sm" onClick={() => setPicks({})}>
            <Icon name="refresh" size={13} /> Làm lại
          </button>
        )}
      </div>
      <div className="stb-grid">
        {items.map((it) => {
          const pick = picks[it.w]
          const answered = pick != null
          const ok = pick === it.hit
          return (
            <div key={it.w} className={'stb-card' + (answered ? (ok ? ' ok' : ' bad') : '')}>
              <div className="stb-row">
                {it.parts.map((p, k) => (
                  <button
                    key={k}
                    className={'stb-btn' + (answered && k === it.hit ? ' hit' : '') + (answered && pick === k && !ok ? ' miss' : '')}
                    disabled={answered}
                    onClick={() => setPicks((prev) => ({ ...prev, [it.w]: k }))}
                    lang={CTX.lang}
                  >
                    {answered && k === it.hit ? p.toUpperCase() : p}
                  </button>
                ))}
                <button className="pron-play" onClick={() => CTX.speak(it.w, 0.8)} title="Nghe mẫu">
                  <Icon name="volume" size={14} />
                </button>
              </div>
              {answered && (
                <div className="stb-answer">
                  <span className="pron-ipa">{it.ipa}</span>
                  <small>{it.vi}</small>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="stb-note">
        Viết từ theo cụm âm tiết rồi in hoa phần mang trọng âm — PHO-to-graph, pho-TOG-ra-phy — sau đó đọc liền cả từ
        và làm âm tiết ấy nổi lên bằng cách kéo dài và đổi cao độ, thay vì đọc to hơn.
      </p>
    </div>
  )
}

export default function StressBoard({ group }: { group: PronGroup }) {
  const reader = useReader()
  const syl = group.syllables ?? []
  const pairs = group.classPairs ?? []
  const families = group.families ?? []

  return (
    <div className="stb">
      {syl.length > 0 && <MarkDrill items={syl} />}

      {pairs.length > 0 && (
        <div className="stb-sec">
          <div className="stb-head"><b><Icon name="letters" size={15} /> Đổi từ loại là đổi trọng âm</b></div>
          <p className="stb-note">
            Một nhóm từ hai âm tiết đổi vị trí trọng âm theo từ loại: danh từ nhấn âm đầu, động từ nhấn âm sau. Mẫu này
            chỉ đúng với một nhóm từ, nên gặp từ mới vẫn phải tra từ điển và nghe trong câu.
          </p>
          <div className="stb-grid">
            {pairs.map((p) => (
              <div key={p.base} className="stb-card wide">
                <div className="stb-cls">
                  <div>
                    <span className="stb-tag">Danh từ</span>
                    <b className="stb-word" lang={CTX.lang}>{p.nounParts.join('-')}</b>
                    <span className="pron-ipa">{p.nounIpa}</span>
                    <small>{p.nounVi}</small>
                    <button className="pron-play" onClick={() => CTX.speak(p.base, 0.75)} title="Nghe mẫu">
                      <Icon name="volume" size={14} />
                    </button>
                  </div>
                  <div>
                    <span className="stb-tag">Động từ</span>
                    <b className="stb-word" lang={CTX.lang}>{p.verbParts.join('-')}</b>
                    <span className="pron-ipa">{p.verbIpa}</span>
                    <small>{p.verbVi}</small>
                    <button className="pron-play" onClick={() => CTX.speak(p.base, 0.75)} title="Nghe mẫu">
                      <Icon name="volume" size={14} />
                    </button>
                  </div>
                </div>
                <div className="stb-sent">
                  <b lang={CTX.lang}>{p.sent}</b>
                  <button className="pron-play" onClick={() => CTX.speak(p.sent, 0.8)} title="Nghe mẫu">
                    <Icon name="volume" size={14} />
                  </button>
                  <MicButton id={'cp' + p.base} target={p.sent} reader={reader} />
                </div>
                <small>{p.vi}</small>
                <ResultLine id={'cp' + p.base} reader={reader} />
              </div>
            ))}
          </div>
        </div>
      )}

      {families.length > 0 && (
        <div className="stb-head"><b><Icon name="chart" size={15} /> Cùng họ từ, trọng âm chạy chỗ</b></div>
      )}
      {families.map((fam, i) => (
        <div key={i} className="stb-sec">
          <p className="stb-note">{fam.note}</p>
          <div className="stb-fam">
            {fam.items.map((it) => (
              <div key={it.w} className="stb-card">
                <div className="stb-row">
                  <Syllables item={it} />
                  <button className="pron-play" onClick={() => CTX.speak(it.w, 0.75)} title="Nghe mẫu">
                    <Icon name="volume" size={14} />
                  </button>
                  <MicButton id={'fm' + it.w} target={it.w} reader={reader} />
                </div>
                <div className="stb-answer">
                  <span className="pron-ipa">{it.ipa}</span>
                  <small>{it.vi}</small>
                </div>
                <ResultLine id={'fm' + it.w} reader={reader} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
