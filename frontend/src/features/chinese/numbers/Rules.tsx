import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakZH } from '@/core/tts'
import { COUNT_ITEMS, MEASURE_VI, hanViet } from './drills'
import { WEEKDAYS, count, date, groups4, phone, pinyinOf, price, time, year, zh } from './zhnum'

interface HearProps {
  canHear: boolean
}

// Đoạn chữ Hán trong câu tiếng Việt: bọc lang="zh" để đúng phông
export function ZhText({ text }: { text: string }) {
  const parts = text.split(/(\p{Script=Han}+)/u)
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} lang="zh">{p}</span> : p))}</>
}

// Ô chữ Trung bấm được để nghe; không có giọng thì vẫn hiện chữ và pinyin
export function Say({ zh: text, canHear, big }: { zh: string; canHear: boolean; big?: boolean }) {
  const body = (
    <>
      <span lang="zh" className={'zn-say-zh' + (big ? ' big' : '')}>{text}</span>
      <small>{pinyinOf(text)}</small>
    </>
  )
  if (!canHear) return <span className="zn-say">{body}</span>
  return (
    <button className="zn-say on" onClick={() => speakZH(text, 0.8)} aria-label={`Nghe ${text}`}>
      {body}
    </button>
  )
}

const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20, 99, 100, 1000]

export function BasicNumbers({ canHear }: HearProps) {
  return (
    <section className="zn-card">
      <h3 className="zn-card-h"><span className="zn-step">1</span> 0 – 9999: ghép y như Hán–Việt</h3>
      <p className="zn-card-p">
        Số tiếng Trung chính là số Hán–Việt: <ZhText text="十一" /> thập nhất = 11, <ZhText text="二十" /> nhị thập = 20,
        <ZhText text=" 三百" /> tam bách = 300. Chỉ cần nhớ 10 chữ số và 4 đơn vị <ZhText text="十 百 千 万" />.
      </p>
      <div className="zn-table-wrap">
        <table className="zn-table">
          <thead>
            <tr><th scope="col">Số</th><th scope="col">Tiếng Trung</th><th scope="col">Hán–Việt</th></tr>
          </thead>
          <tbody>
            {ROWS.map((n) => (
              <tr key={n}>
                <th scope="row">{n}</th>
                <td><Say zh={zh(n)} canHear={canHear} /></td>
                <td><em className="zn-hv">{hanViet(zh(n))}</em></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="zn-card-p zn-tip">
        <Icon name="bulb" size={14} /> 10 – 19 đứng đầu số thì bỏ <ZhText text="一" />: 15 là <ZhText text="十五" />, nhưng 115
        là <ZhText text="一百一十五" />.
      </p>
    </section>
  )
}

const BIG_UNITS: [number, string][] = [
  [10_000, '1 vạn'], [100_000, '100 nghìn'], [1_000_000, '1 triệu'], [10_000_000, '10 triệu'], [100_000_000, '100 triệu'],
]

const viNum = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export function FourDigits({ canHear }: HearProps) {
  const [raw, setRaw] = useState('35000')
  const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  const n = digits ? Number(digits) : NaN
  const tooBig = digits.length > 12
  const valid = !!digits && !tooBig
  const groups = valid ? groups4(n) : []
  const UNIT = ['亿', '万', '']
  const reading = valid ? zh(n) : ''

  return (
    <section className="zn-card zn-wide">
      <h3 className="zn-card-h"><span className="zn-step">3</span> Nhóm 4 chữ số — <ZhText text="万" /> (vạn) và <ZhText text="亿" /> (ức)</h3>
      <p className="zn-card-p">
        Tiếng Việt gom 3 số một nhóm (nghìn, triệu). Tiếng Trung gom <b>4 số</b> một nhóm: <ZhText text="万" /> = vạn = 10.000,
        <ZhText text=" 亿" /> = 100 triệu. Vì vậy 35.000 không phải "35 nghìn" mà là "3 vạn 5 nghìn".
      </p>
      <div className="zn-flow" aria-label="35.000 tách thành 3 và 5000, đọc là 三万五千">
        <span className="zn-flow-num">35.000</span>
        <Icon name="arrow-right" size={16} />
        <span className="zn-flow-num"><i>3</i><span className="zn-bar" aria-hidden="true">|</span><i>5000</i></span>
        <Icon name="arrow-right" size={16} />
        <Say zh="三万五千" canHear={canHear} big />
      </div>
      <div className="zn-units">
        {BIG_UNITS.map(([v, vi]) => (
          <div key={v} className="zn-unit">
            <span className="zn-unit-n">{groups4(v).join(' ')}</span>
            <Say zh={zh(v)} canHear={canHear} />
            <small>{vi}</small>
          </div>
        ))}
      </div>

      <div className="zn-try">
        <label htmlFor="zn-try-input" className="hg-group-title">Thử một số bất kỳ</label>
        <div className="zn-try-row">
          <input
            id="zn-try-input"
            className="hg-input zn-digits"
            inputMode="numeric"
            autoComplete="off"
            value={raw}
            onChange={(e) => setRaw(e.target.value.replace(/[^\d.,\s]/g, '').slice(0, 18))}
            placeholder="Ví dụ 1050000"
          />
          {valid && canHear && (
            <button className="btn-ghost sm" onClick={() => speakZH(reading, 0.8)}><Icon name="volume" size={13} /> Nghe</button>
          )}
        </div>
        {tooBig && <p className="hg-note">Phần này luyện tới dưới 1.000 tỷ thôi nhé.</p>}
        {valid && (
          <div className="zn-try-out" aria-live="polite">
            <div className="zn-groups">
              {groups.map((g, k) => {
                const unit = UNIT[UNIT.length - groups.length + k]
                const val = Number(g)
                return (
                  <span key={k} className={'zn-group' + (val ? '' : ' zero')}>
                    <b>{g}</b>
                    <small lang="zh">{val ? zh(val) + unit : '—'}</small>
                  </span>
                )
              })}
            </div>
            <div className="zn-try-read">
              <span lang="zh">{reading}</span>
              <small>{pinyinOf(reading)} · {viNum(n)}</small>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function Traps({ canHear }: HearProps) {
  return (
    <section className="zn-card">
      <h3 className="zn-card-h"><span className="zn-step">2</span> <ZhText text="零" />, <ZhText text="二" /> hay <ZhText text="两" />, và chữ <ZhText text="一" /></h3>
      <ul className="zn-rules-list">
        <li>
          <b>Số 0 ở giữa đọc <ZhText text="零" /></b> (như "linh, lẻ"). Thiếu nó là sai số:
          <div className="zn-pairs">
            <span className="zn-pair good"><Say zh={zh(105)} canHear={canHear} /><small>105 — một trăm lẻ năm</small></span>
            <span className="zn-pair bad"><Say zh="一百五" canHear={canHear} /><small>150 — nói tắt của 一百五十</small></span>
          </div>
        </li>
        <li>
          <b>Trước lượng từ, số 2 là <ZhText text="两" /></b>: <ZhText text="两个人, 两点, 两块, 两岁" />. Còn đếm, số thứ tự, tháng,
          điện thoại, hàng đơn vị thì dùng <ZhText text="二" />: <ZhText text="十二, 二十, 二月, 第二" />. Trước <ZhText text="百 千 万" /> dùng
          cả hai, <ZhText text="两千, 两万" /> nghe tự nhiên hơn.
        </li>
        <li>
          <b>Chữ <ZhText text="一" /> đổi thanh</b>: đứng một mình hoặc trong số thứ tự đọc yī (<ZhText text="一月, 星期一, 十一" />);
          trước thanh 4 đọc yí (<ZhText text="一个, 一万, 一块" />); trước thanh 1, 2, 3 đọc yì (<ZhText text="一千, 一百, 一毛" />).
        </li>
      </ul>
    </section>
  )
}

const DAILY: { vi: string; zh: string; note?: string }[] = [
  { vi: '18,5 tệ', zh: price(18.5), note: '块 (tệ) · 毛 (hào) · 分 (xu); hào đứng cuối bỏ chữ 毛' },
  { vi: '0,5 tệ', zh: price(0.5) },
  { vi: '2 tệ', zh: price(2) },
  { vi: '2:00', zh: time(2, 0) },
  { vi: '3:30', zh: time(3, 30, 'half'), note: '半 = rưỡi; 一刻 = 15 phút' },
  { vi: '10:15', zh: time(10, 15) },
  { vi: 'ngày 14/2', zh: date(2, 14), note: 'Tháng trước, ngày sau; 号 khi nói, 日 khi viết' },
  { vi: 'năm 2025', zh: year(2025), note: 'Năm đọc từng chữ số' },
  { vi: '138-0013-8000', zh: phone('138-0013-8000'), note: 'Số 1 trong số điện thoại đọc 幺 (yāo)' },
  { vi: '2 tuổi', zh: count(2) + '岁' },
]

export function Daily({ canHear }: HearProps) {
  return (
    <section className="zn-card">
      <h3 className="zn-card-h"><span className="zn-step">4</span> Tiền, giờ, ngày, thứ</h3>
      <div className="zn-uses">
        {DAILY.map((d) => (
          <div key={d.vi} className="zn-use">
            <b>{d.vi}</b>
            <Say zh={d.zh} canHear={canHear} />
            {d.note && <small className="zn-hv"><ZhText text={d.note} /></small>}
          </div>
        ))}
      </div>
      <p className="zn-card-p zn-tip">
        <Icon name="bulb" size={14} /> Thứ: <b>Thứ Hai = <ZhText text="星期一" /></b>, Thứ Ba = <ZhText text="星期二" />… (lấy số thứ tiếng
        Việt trừ 1). Chủ nhật = <ZhText text="星期天" /> hoặc <ZhText text="星期日" />. Hôm nay thứ mấy: <ZhText text="今天星期几？" />
      </p>
      <div className="zn-chips">
        {WEEKDAYS.map((w) => (
          <span key={w.zh} className="zn-chip"><b>{w.vi}</b><Say zh={w.zh} canHear={canHear} /></span>
        ))}
      </div>
    </section>
  )
}

export function MeasureTable({ canHear }: HearProps) {
  const seen = new Set<string>()
  const rows = COUNT_ITEMS.filter((c) => (seen.has(c.measure) ? false : (seen.add(c.measure), true)))
  return (
    <section className="zn-card zn-wide">
      <h3 className="zn-card-h"><span className="zn-step">5</span> Lượng từ — giống "quyển, con, chiếc" của tiếng Việt</h3>
      <p className="zn-card-p">
        Trật tự <b>số + lượng từ + danh từ</b> y như tiếng Việt: <ZhText text="两本书" /> = hai quyển sách. Không chắc thì dùng
        <ZhText text=" 个" /> — lượng từ chung nhất, dùng được với rất nhiều thứ.
      </p>
      <ul className="zn-counters">
        {rows.map((c) => (
          <li key={c.measure} className="zn-counter">
            <span className="zn-counter-emoji" aria-hidden="true">{c.emoji}</span>
            <span className="zn-counter-zh"><b lang="zh">{c.measure}</b><small>{pinyinOf(c.measure)}</small></span>
            <span className="zn-counter-vi">{MEASURE_VI[c.measure]}</span>
            <span className="zn-counter-ex">
              <Say zh={`${count(2)}${c.measure}${c.noun}`} canHear={canHear} />
              <small>hai {c.vi}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
