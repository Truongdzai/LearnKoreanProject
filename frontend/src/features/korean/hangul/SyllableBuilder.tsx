import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { LEADS, TAILS, VOWELS, compose, decompose } from '@/core/utils/hangul'
import { romanizeLine, romanizeWord } from '@/core/utils/romanize'
import { isCompoundTail, jamoInfo, tailSoundOf } from '@/data/koreanHangul'

// Nguyên âm dọc đứng bên phải phụ âm, nguyên âm ngang nằm dưới, nguyên âm ghép ôm cả hai phía.
const VERTICAL = new Set(['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ'])
const HORIZONTAL = new Set(['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'])

function layoutOf(vowel: string): 'v' | 'h' | 'm' {
  if (VERTICAL.has(vowel)) return 'v'
  if (HORIZONTAL.has(vowel)) return 'h'
  return 'm'
}

const LAYOUT_TEXT = {
  v: 'Nguyên âm dọc → phụ âm đầu đứng bên trái, nguyên âm bên phải.',
  h: 'Nguyên âm ngang → phụ âm đầu ở trên, nguyên âm nằm dưới.',
  m: 'Nguyên âm ghép → phụ âm ở góc trên trái, nguyên âm ôm phía dưới và bên phải.',
}

export default function SyllableBuilder() {
  const [lead, setLead] = useState('ㅎ')
  const [vowel, setVowel] = useState('ㅏ')
  const [tail, setTail] = useState('ㄴ')
  const [text, setText] = useState('안녕하세요')

  const syl = compose(lead, vowel, tail)
  const layout = layoutOf(vowel)
  const tailSound = tail ? (tailSoundOf(tail)?.sound ?? null) : null

  return (
    <div className="hg-builder">
      <div className="hg-build-main">
        <div className={'hg-block l-' + layout + (tail ? ' has-tail' : '')} aria-hidden="true">
          <span className="b-lead">{lead}</span>
          <span className="b-vowel">{vowel}</span>
          {tail && <span className="b-tail">{tail}</span>}
        </div>
        <div className="hg-build-out">
          <button className="hg-big" onClick={() => speakKO(syl, 0.7)} lang="ko" aria-label={`Nghe ${syl}`}>
            {syl} <Icon name="volume" size={22} />
          </button>
          <div className="hg-build-rom">{romanizeWord(syl)}</div>
          <p className="hg-note">{LAYOUT_TEXT[layout]}</p>
          <ul className="hg-parts">
            <li><b lang="ko">{lead}</b> {lead === 'ㅇ' ? 'câm ở đầu âm tiết' : `đọc "${jamoInfo(lead)?.rom}"`}</li>
            <li><b lang="ko">{vowel}</b> {jamoInfo(vowel)?.vi}</li>
            {tail && (
              <li>
                <b lang="ko">{tail}</b>{' '}
                {isCompoundTail(tail) ? `patchim đôi — chỉ đọc một chữ, ra âm "${tailSound}"` : `patchim đọc "${tailSound}"`}
              </li>
            )}
          </ul>
        </div>
      </div>

      <JamoPicker title="1. Phụ âm đầu" list={LEADS} value={lead} onPick={setLead} />
      <JamoPicker title="2. Nguyên âm" list={VOWELS} value={vowel} onPick={setVowel} />
      <JamoPicker title="3. Patchim (phụ âm cuối)" list={TAILS} value={tail} onPick={setTail} allowNone />

      <Analyzer text={text} onText={setText} />
    </div>
  )
}

function JamoPicker({ title, list, value, onPick, allowNone }: {
  title: string; list: string[]; value: string; onPick: (j: string) => void; allowNone?: boolean
}) {
  return (
    <div className="hg-picker">
      <span className="hg-group-title">{title}</span>
      <div className="hg-jamo-row">
        {list.map((j) => (
          <button
            key={j || 'none'}
            className={'hg-jamo sm' + (value === j ? ' on' : '')}
            onClick={() => onPick(j)}
            aria-pressed={value === j}
            lang="ko"
          >
            {j || (allowNone ? '∅' : '')}
          </button>
        ))}
      </div>
    </div>
  )
}

function Analyzer({ text, onText }: { text: string; onText: (s: string) => void }) {
  const chars = useMemo(() => Array.from(text.slice(0, 40)), [text])
  const read = romanizeLine(text.slice(0, 40))

  return (
    <div className="hg-analyze">
      <div className="section-title"><span className="pin" /> Phân tích chữ bất kỳ</div>
      <p className="hg-note">Dán một từ hay câu tiếng Hàn (tên bài hát, biển hiệu, phụ đề…) để xem từng âm tiết ghép từ chữ nào và cách đọc thực tế khi nối âm.</p>
      <div className="hg-analyze-row">
        <input
          className="hg-input"
          value={text}
          maxLength={40}
          onChange={(e) => onText(e.target.value)}
          placeholder="Ví dụ: 사랑해요"
          lang="ko"
          aria-label="Chữ tiếng Hàn cần phân tích"
        />
        <button className="btn-primary sm" onClick={() => speakKO(text, 0.8)} disabled={!text.trim()}>
          <Icon name="volume" size={14} /> Nghe
        </button>
      </div>
      {read.trim() && <div className="hg-read">Đọc là: <b>{read}</b></div>}
      <div className="hg-syls">
        {chars.map((ch, i) => {
          const p = decompose(ch)
          if (!p) return ch.trim() ? <span key={i} className="hg-syl other">{ch}</span> : <span key={i} className="hg-gap" />
          return (
            <button key={i} className="hg-syl" onClick={() => speakKO(ch, 0.7)} lang="ko">
              <b>{ch}</b>
              <span>{p.lead}{p.lead === 'ㅇ' ? '∅' : ''} + {p.vowel}{p.tail ? ` + ${p.tail}` : ''}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
