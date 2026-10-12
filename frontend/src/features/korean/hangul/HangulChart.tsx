import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { compose } from '@/core/utils/hangul'
import { romanizeWord } from '@/core/utils/romanize'
import {
  CHART_LEADS, CHART_TENSE, CHART_VOWELS, CONSONANTS, VOWELS, type JamoKind,
} from '@/data/koreanHangul'
import { JamoCard } from './HangulLessons'
import { isSolid } from './progress'
import type { Stats } from './quiz'

const GROUPS: { title: string; kinds: JamoKind[]; list: typeof CONSONANTS }[] = [
  { title: 'Phụ âm thường', kinds: ['basic'], list: CONSONANTS },
  { title: 'Phụ âm bật hơi', kinds: ['aspirated'], list: CONSONANTS },
  { title: 'Phụ âm căng', kinds: ['tense'], list: CONSONANTS },
  { title: 'Nguyên âm gốc', kinds: ['vowel'], list: VOWELS },
  { title: 'Nguyên âm có "y" · ㅐ ㅔ', kinds: ['yvowel'], list: VOWELS },
  { title: 'Nguyên âm ghép', kinds: ['compound'], list: VOWELS },
]

export default function HangulChart({ stats }: { stats: Stats }) {
  const [sel, setSel] = useState<string>('ㄱ')
  const [tense, setTense] = useState(false)
  const leads = tense ? CHART_TENSE : CHART_LEADS

  const pickJamo = (j: string) => {
    setSel(j)
    const isCons = CONSONANTS.some((c) => c.j === j)
    speakKO(isCons ? compose(j, 'ㅏ') : compose('ㅇ', j), 0.75)
  }

  return (
    <div className="hg-chart">
      <div className="hg-chart-split">
        <div className="hg-jamo-groups">
          {GROUPS.map((g) => (
            <div key={g.title} className="hg-jamo-group">
              <span className="hg-group-title">{g.title}</span>
              <div className="hg-jamo-row">
                {g.list.filter((x) => g.kinds.includes(x.kind)).map((x) => (
                  <button
                    key={x.j}
                    className={'hg-jamo' + (sel === x.j ? ' on' : '') + (isSolid(stats, x.j) ? ' solid' : '')}
                    onClick={() => pickJamo(x.j)}
                    aria-label={`${x.j}, đọc ${x.rom || 'câm'}`}
                    lang="ko"
                  >
                    {x.j}
                    <small>{x.rom || '∅'}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="hg-legend"><i className="dot solid" /> Viền xanh: chữ bạn đã đọc đúng chắc chắn trong bài luyện.</p>
        </div>
        <div className="hg-chart-detail">
          <JamoCard j={sel} />
        </div>
      </div>

      <div className="section-title"><span className="pin" /> Bảng ghép âm tiết (반절표)</div>
      <p className="hg-note">
        Hàng là phụ âm, cột là nguyên âm. Bấm một ô để nghe. Nguyên âm dọc (ㅏ ㅑ ㅓ ㅕ ㅣ) đứng bên phải phụ âm,
        nguyên âm ngang (ㅗ ㅛ ㅜ ㅠ ㅡ) nằm bên dưới.
      </p>
      <div className="hg-chart-tools">
        <button className={'chip' + (!tense ? ' on' : '')} onClick={() => setTense(false)}>14 phụ âm cơ bản</button>
        <button className={'chip' + (tense ? ' on' : '')} onClick={() => setTense(true)}>5 phụ âm căng</button>
      </div>
      <div className="hg-table-wrap">
        <table className="hg-table">
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Phụ âm</span></th>
              {CHART_VOWELS.map((v) => <th key={v} scope="col" lang="ko">{v}</th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l}>
                <th scope="row" lang="ko">{l}</th>
                {CHART_VOWELS.map((v) => {
                  const s = compose(l, v)
                  return (
                    <td key={v}>
                      <button className="hg-cell" onClick={() => speakKO(s, 0.75)} aria-label={`${s} ${romanizeWord(s)}`}>
                        <span lang="ko">{s}</span>
                        <small>{romanizeWord(s)}</small>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hg-note"><Icon name="volume" size={13} /> Mẹo: đọc to theo từng hàng như học bảng cửu chương — 가 갸 거 겨 고 교 구 규 그 기.</p>
    </div>
  )
}
