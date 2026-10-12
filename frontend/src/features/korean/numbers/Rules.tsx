import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import KoText from './KoText'
import { hanViet } from './drills'
import {
  COUNTERS, counterExample, groups4, native, nativeAdn, romanizeNum, sino, viNum, type Counter,
} from './numerals'

interface HearProps {
  canHear: boolean
}

// Ô chữ Hàn bấm được để nghe; không có giọng thì vẫn hiện chữ và phiên âm.
function Say({ ko, canHear, big }: { ko: string; canHear: boolean; big?: boolean }) {
  const body = (
    <>
      <span lang="ko" className={'kn-say-ko' + (big ? ' big' : '')}>{ko}</span>
      <small>{romanizeNum(ko)}</small>
    </>
  )
  if (!canHear) return <span className="kn-say">{body}</span>
  return (
    <button className="kn-say on" onClick={() => speakKO(ko, 0.8)} aria-label={`Nghe ${ko}`}>
      {body}
    </button>
  )
}

const TABLE_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20]
const TENS = [30, 40, 50, 60, 70, 80, 90]

export function TwoSystems({ canHear }: HearProps) {
  return (
    <section className="kn-card">
      <h3 className="kn-card-h"><span className="kn-step">1</span> Hai hệ số đếm</h3>
      <p className="kn-card-p">
        <b>Số Hán</b> đọc gần y như Hán Việt (삼 tam, 사 tứ, 십 thập, 백 bách, 천 thiên, 만 vạn). <b>Số thuần Hàn</b> là
        bộ riêng, chỉ có từ 1 tới 99. Đứng trước lượng từ, năm số đổi dạng: 하나 → 한, 둘 → 두, 셋 → 세, 넷 → 네, 스물 → 스무.
      </p>
      <div className="kn-table-wrap">
        <table className="kn-table">
          <thead>
            <tr><th scope="col">Số</th><th scope="col">Số Hán</th><th scope="col">Thuần Hàn</th><th scope="col">Trước lượng từ</th></tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((n) => (
              <tr key={n} className={native(n) !== nativeAdn(n) ? 'kn-changes' : undefined}>
                <th scope="row">{n}</th>
                <td><Say ko={sino(n)} canHear={canHear} /><em>{hanViet(sino(n))}</em></td>
                <td><Say ko={native(n)} canHear={canHear} /></td>
                <td><Say ko={nativeAdn(n)} canHear={canHear} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="kn-tens">
        <span className="hg-group-title">Hàng chục thuần Hàn</span>
        <div className="kn-chips">
          {TENS.map((n) => (
            <span key={n} className="kn-chip"><b>{n}</b><Say ko={native(n)} canHear={canHear} /></span>
          ))}
        </div>
      </div>
    </section>
  )
}

const USES: { native: [string, string][]; sino: [string, string][] } = {
  native: [
    ['Đếm đồ vật, người, con vật', '사과 세 개 · 두 명'],
    ['Giờ (lúc mấy giờ)', '세 시'],
    ['Tuổi', '스무 살'],
    ['Số lần', '한 번 · 두 번'],
  ],
  sino: [
    ['Tiền', '삼만 오천 원'],
    ['Phút, giây', '삼십 분 · 십 초'],
    ['Ngày, tháng, năm', '유월 육일 · 이천이십육 년'],
    ['Tầng, số thứ tự, điện thoại', '삼 층 · 삼 번 출구 · 공일공'],
    ['Từ 100 trở lên', '백 개 (thuần Hàn chỉ tới 99)'],
  ],
}

export function WhichSystem() {
  return (
    <section className="kn-card">
      <h3 className="kn-card-h"><span className="kn-step">2</span> Khi nào dùng hệ nào</h3>
      <div className="kn-uses">
        <div className="kn-use native">
          <b>Thuần Hàn <span lang="ko">하나 둘 셋</span></b>
          <ul>
            {USES.native.map(([vi, ko]) => <li key={vi}>{vi}: <KoText text={ko} /></li>)}
          </ul>
        </div>
        <div className="kn-use sino">
          <b>Số Hán <span lang="ko">일 이 삼</span></b>
          <ul>
            {USES.sino.map(([vi, ko]) => <li key={vi}>{vi}: <KoText text={ko} /></li>)}
          </ul>
        </div>
      </div>
      <p className="kn-card-p kn-tip">
        <Icon name="bulb" size={14} /> Một câu có thể dùng cả hai: <KoText text="세 시 삼십 분" /> — giờ thuần Hàn, phút số Hán.
        30 phút còn nói gọn là <KoText text="반" /> (rưỡi): <KoText text="세 시 반" />.
      </p>
    </section>
  )
}

const BIG_UNITS: [number, string][] = [
  [10_000, '1 vạn'], [100_000, '100 nghìn'], [1_000_000, '1 triệu'], [10_000_000, '10 triệu'], [100_000_000, '100 triệu'],
]

export function FourDigits({ canHear }: HearProps) {
  const [raw, setRaw] = useState('35000')
  const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  const n = digits ? Number(digits) : NaN
  const tooBig = digits.length > 9
  const valid = !!digits && !tooBig
  const groups = valid ? groups4(n) : []
  const UNIT = ['억', '만', '']
  const reading = valid ? sino(n) : ''

  return (
    <section className="kn-card kn-wide">
      <h3 className="kn-card-h"><span className="kn-step">3</span> Nhóm 4 chữ số — lỗi số 1 của người Việt</h3>
      <p className="kn-card-p">
        Tiếng Việt gom 3 số một nhóm (nghìn, triệu). Tiếng Hàn gom <b>4 số</b> một nhóm, đơn vị là <span lang="ko">만</span> (vạn
        = 10.000) và <span lang="ko">억</span> (100 triệu). Vì vậy 35.000 không phải "35 nghìn" mà là "3 vạn 5 nghìn".
      </p>
      <div className="kn-flow" aria-label="35.000 tách thành 3 và 5000, đọc là 삼만 오천">
        <span className="kn-flow-num">35.000</span>
        <Icon name="arrow-right" size={16} />
        <span className="kn-flow-num"><i>3</i><span className="kn-bar" aria-hidden="true">|</span><i>5000</i></span>
        <Icon name="arrow-right" size={16} />
        <Say ko="삼만 오천" canHear={canHear} big />
      </div>
      <p className="kn-card-p kn-tip">
        <Icon name="bulb" size={14} /> Đếm 4 số từ phải sang và đặt vạch: trước vạch thứ nhất đọc thêm <span lang="ko">만</span>,
        trước vạch thứ hai đọc <span lang="ko">억</span>. Không đọc <span lang="ko">일</span> trước <span lang="ko">십, 백, 천, 만</span>
        (<span lang="ko">만 원</span>, không phải <span lang="ko">일만 원</span>), riêng 100 triệu vẫn là <span lang="ko">일억</span>.
      </p>
      <div className="kn-units">
        {BIG_UNITS.map(([v, vi]) => (
          <div key={v} className="kn-unit">
            <span className="kn-unit-n">{groups4(v).join(' ')}</span>
            <Say ko={sino(v)} canHear={canHear} />
            <small>{vi}</small>
          </div>
        ))}
      </div>

      <div className="kn-try">
        <label htmlFor="kn-try-input" className="hg-group-title">Thử một số bất kỳ</label>
        <div className="kn-try-row">
          <input
            id="kn-try-input"
            className="hg-input kn-digits"
            inputMode="numeric"
            autoComplete="off"
            value={raw}
            onChange={(e) => setRaw(e.target.value.replace(/[^\d.,\s]/g, '').slice(0, 15))}
            placeholder="Ví dụ 1250000"
          />
          {valid && canHear && (
            <button className="btn-ghost sm" onClick={() => speakKO(reading, 0.8)}><Icon name="volume" size={13} /> Nghe</button>
          )}
        </div>
        {tooBig && <p className="hg-note">Phần này luyện tới 999.999.999 (dưới 1 tỷ) thôi nhé.</p>}
        {valid && (
          <div className="kn-try-out" aria-live="polite">
            <div className="kn-groups">
              {groups.map((g, k) => {
                const unit = UNIT[UNIT.length - groups.length + k]
                const val = Number(g)
                return (
                  <span key={k} className={'kn-group' + (val ? '' : ' zero')}>
                    <b>{g}</b>
                    <small lang="ko">{val ? (unit === '만' && val === 1 ? '만' : sino(val) + unit) : '—'}</small>
                  </span>
                )
              })}
            </div>
            <div className="kn-try-read">
              <span lang="ko">{reading}</span>
              <small>{romanizeNum(reading)} · {viNum(n)}</small>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function CounterRow({ c, canHear }: { c: Counter; canHear: boolean }) {
  return (
    <li className="kn-counter">
      <span className="kn-counter-emoji" aria-hidden="true">{c.emoji}</span>
      <span className="kn-counter-ko"><b lang="ko">{c.ko}</b><small>{romanizeNum(c.ko)}</small></span>
      <span className="kn-counter-vi">{c.vi}</span>
      <span className="kn-counter-ex">
        <Say ko={counterExample(c)} canHear={canHear} />
        <small>{c.exVi}</small>
      </span>
      {c.note && <span className="kn-counter-note"><KoText text={c.note} /></span>}
    </li>
  )
}

export function CounterTable({ canHear }: HearProps) {
  const native = COUNTERS.filter((c) => c.system === 'native')
  const sinoList = COUNTERS.filter((c) => c.system === 'sino')
  return (
    <section className="kn-card kn-wide">
      <h3 className="kn-card-h"><span className="kn-step">4</span> Bảng lượng từ</h3>
      <p className="kn-card-p">
        Tiếng Hàn đếm theo thứ tự <b>danh từ + số + lượng từ</b>: <KoText text="사과 세 개" /> (táo · ba · quả). Lượng từ quyết
        định dùng hệ số nào.
      </p>
      <div className="kn-counter-groups">
        <div>
          <span className="hg-group-title">Đi với số thuần Hàn</span>
          <ul className="kn-counters">{native.map((c) => <CounterRow key={c.ko} c={c} canHear={canHear} />)}</ul>
        </div>
        <div>
          <span className="hg-group-title">Đi với số Hán</span>
          <ul className="kn-counters">{sinoList.map((c) => <CounterRow key={c.ko} c={c} canHear={canHear} />)}</ul>
        </div>
      </div>
    </section>
  )
}
