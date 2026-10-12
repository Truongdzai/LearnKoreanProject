import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakZH } from '@/core/tts'
import { parseSyllable, splitSyllable } from '@/core/utils/pinyin'
import { FINALS, INITIALS, SPELLING_RULES, TONES, VALID_SYLLABLES } from '@/data/chinesePinyin'
import { EXAMPLES, type CharExample } from './quiz'

// Đường nét thanh điệu trên thang 5 bậc (5 cao nhất)
function ToneContour({ contour }: { contour: number[] }) {
  const w = 64
  const h = 46
  const y = (lv: number) => 4 + ((5 - lv) / 4) * (h - 8)
  const step = (w - 12) / Math.max(1, contour.length - 1)
  const pts = contour.map((lv, k) => `${6 + k * step},${y(lv)}`).join(' ')
  return (
    <svg className="py-contour" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((lv) => <line key={lv} x1="0" x2={w} y1={y(lv)} y2={y(lv)} className="py-grid" />)}
      <polyline points={pts} className="py-line" />
    </svg>
  )
}

export function ToneCards() {
  return (
    <div className="py-learn">
      <div className="py-tones">
        {TONES.map((t) => (
          <div key={t.n} className="py-card">
            <div className="py-card-top">
              <ToneContour contour={t.contour} />
              <div>
                <b>{t.name}</b>
                <span>{t.vi}</span>
              </div>
            </div>
            <p className="py-how">{t.how}</p>
            <div className="py-ex">
              {t.ex.map((e) => (
                <button key={e.zh} className="btn-ghost sm" onClick={() => speakZH(e.zh, 0.75)}>
                  <Icon name="volume" size={13} /> <span lang="zh">{e.zh}</span> {e.py} · {e.vi}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="en-principle">
        <Icon name="bulb" size={20} />
        <div>
          <b>Mẹo cho người Việt:</b> tiếng Việt có 6 thanh nên tai bạn đã quen phân biệt cao thấp — lợi thế lớn.
          Hai chỗ hay sai nhất: <b>thanh 3</b> đọc lên cao quá (thực tế phần lớn chỉ trầm xuống, như thanh nặng kéo dài) và
          <b> thanh 4</b> đọc thành huyền nhẹ (phải bắt đầu thật cao rồi rơi mạnh). Luyện tai ở mục "Luyện nghe" với cặp thanh là nhanh nhất.
        </div>
      </div>
    </div>
  )
}

// Ghép thanh mẫu + vận mẫu thành cách viết chuẩn (yi, wu, ju, liu, gui, lun…)
const ZERO_WRITE: Record<string, string> = {
  i: 'yi', ia: 'ya', ie: 'ye', iao: 'yao', iou: 'you', ian: 'yan', in: 'yin', iang: 'yang', ing: 'ying', iong: 'yong',
  u: 'wu', ua: 'wa', uo: 'wo', uai: 'wai', uei: 'wei', uan: 'wan', uen: 'wen', uang: 'wang', ueng: 'weng',
  ü: 'yu', üe: 'yue', üan: 'yuan', ün: 'yun',
}
const SHORT: Record<string, string> = { iou: 'iu', uei: 'ui', uen: 'un' }

export function writtenForm(initial: string, final: string): string {
  if (!initial) return ZERO_WRITE[final] ?? final
  let f = SHORT[final] ?? final
  if ('jqx'.includes(initial) && f.startsWith('ü')) f = 'u' + f.slice(1)
  return initial + f
}

function bestExample(base: string): CharExample | undefined {
  const list = EXAMPLES.get(base)
  if (!list?.length) return undefined
  return list.find((x) => x.word.syl.length === 1) ?? list[0]
}

export function PinyinChart() {
  const [sel, setSel] = useState<string | null>(null)
  const columns = ['', ...INITIALS.map((i) => i.p)]

  const byInitial = useMemo(() => {
    const m = new Map<string, CharExample>()
    for (const [base, list] of EXAMPLES) {
      const { initial } = splitSyllable(base)
      if (!m.has(initial) && list[0]) m.set(initial, list.find((x) => x.word.syl.length === 1) ?? list[0])
    }
    return m
  }, [])

  const byFinal = useMemo(() => {
    const m = new Map<string, CharExample>()
    for (const [base, list] of EXAMPLES) {
      const { final } = splitSyllable(base)
      if (!m.has(final) && list[0]) m.set(final, list.find((x) => x.word.syl.length === 1) ?? list[0])
    }
    return m
  }, [])

  const play = (ex?: CharExample) => {
    if (!ex) return
    speakZH(ex.word.zh, 0.75)
    setSel(`${ex.word.zh} ${ex.word.pinyin} · ${ex.word.vi}`)
  }

  return (
    <div className="py-learn">
      <div className="section-title"><span className="pin" /> 21 thanh mẫu (phụ âm đầu)</div>
      <div className="py-grid-cards">
        {INITIALS.map((i) => {
          const ex = byInitial.get(i.p)
          return (
            <button key={i.p} className="py-unit" onClick={() => play(ex)} disabled={!ex}>
              <b>{i.p}</b>
              <span className="py-unit-group">{i.group}</span>
              <span>{i.vi}</span>
              {i.trap && <small>{i.trap}</small>}
              {ex && <em lang="zh">{ex.ch} {ex.syl}</em>}
            </button>
          )
        })}
      </div>

      <div className="section-title"><span className="pin" /> Vận mẫu (phần vần)</div>
      <div className="py-grid-cards finals">
        {FINALS.map((f) => {
          const ex = byFinal.get(f.p)
          return (
            <button key={f.p} className="py-unit sm" onClick={() => play(ex)} disabled={!ex}>
              <b>{f.p}</b>
              <span>{f.vi}</span>
              {ex && <em lang="zh">{ex.ch} {ex.syl}</em>}
            </button>
          )
        })}
      </div>

      <div className="section-title"><span className="pin" /> Bảng ghép âm tiết</div>
      <p className="hg-note">
        Cột là thanh mẫu, hàng là vận mẫu; ô trống là tổ hợp tiếng phổ thông không có. Ô đậm có ví dụ trong kho từ — bấm để nghe.
        {sel && <> Đang nghe: <b lang="zh">{sel}</b></>}
      </p>
      <div className="hg-table-wrap">
        <table className="hg-table py-table">
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Vận mẫu</span></th>
              {columns.map((c) => <th key={c || 'zero'} scope="col">{c || '∅'}</th>)}
            </tr>
          </thead>
          <tbody>
            {FINALS.map((f) => (
              <tr key={f.p}>
                <th scope="row">{f.p}</th>
                {columns.map((c) => {
                  const w = writtenForm(c, f.p)
                  if (!VALID_SYLLABLES.has(w)) return <td key={c || 'zero'} className="py-empty" />
                  const ex = bestExample(parseSyllable(w).base)
                  return (
                    <td key={c || 'zero'}>
                      <button className={'hg-cell' + (ex ? ' has' : '')} onClick={() => play(ex)} disabled={!ex}
                        aria-label={ex ? `${w}, ví dụ ${ex.ch}` : w}>
                        <span className="py-cell">{w}</span>
                        {ex && <small lang="zh">{ex.ch}</small>}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SpellingRules() {
  return (
    <div className="py-learn">
      <div className="py-rules">
        {SPELLING_RULES.map((r, k) => (
          <div key={k} className="py-card">
            <b className="py-rule-title">{k + 1}. {r.title}</b>
            <p className="py-how">{r.rule}</p>
            <div className="py-chips">
              {r.ex.map((e) => <span key={e} className="py-chip">{e}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
