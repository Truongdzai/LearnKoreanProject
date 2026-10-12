import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { clearUrlParams, useUrlParam } from '@/core/hooks/useTabParam'
import { useLabScores, type LabKey } from '@/core/labScores'
import GrammarLessons from './components/GrammarLessons'
import { VoiceNotice } from './components/PronunciationLab'
import IrregularLab from './irregular/IrregularLab'
import EnNumbersLab from './numbers/EnNumbersLab'
import SentenceBuilder from './builder/SentenceBuilder'
import PrepLab from './prepositions/PrepLab'
import TenseLab from './tenses/TenseLab'
import './hub.css'
import ConfuseLab from './confusables/ConfuseLab'

type Pane = 'lessons' | 'tense' | 'order' | 'prep' | 'confuse' | 'verbs' | 'numbers'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'lessons', label: '18 bài ngữ pháp', icon: 'book' },
  { id: 'tense', label: 'Chọn thì', icon: 'clock' },
  { id: 'order', label: 'Ghép câu', icon: 'shuffle' },
  { id: 'prep', label: 'in / on / at', icon: 'map' },
  { id: 'confuse', label: 'Từ dễ nhầm', icon: 'bulb' },
  { id: 'verbs', label: 'Động từ bất quy tắc', icon: 'refresh' },
  { id: 'numbers', label: 'Số đếm & giờ giấc', icon: 'chart' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]

// Phòng luyện: phần nào tính cho lộ trình (đạt 80% mỗi phần)
const LABS: { pane: Pane; key: LabKey; parts: string[]; desc: string }[] = [
  { pane: 'tense', key: 'entense', parts: ['mix'], desc: 'Nhìn dấu hiệu chọn đúng thì' },
  { pane: 'order', key: 'enorder', parts: ['easy', 'hard'], desc: 'Xếp thẻ thành câu đúng trật tự' },
  { pane: 'prep', key: 'enprep', parts: ['time', 'place'], desc: 'Giới từ thời gian, nơi chốn' },
  { pane: 'confuse', key: 'enconfuse', parts: ['mix'], desc: 'borrow / lend, say / tell…' },
  { pane: 'verbs', key: 'enirregular', parts: ['v2', 'v3', 'type'], desc: '105 động từ V1 · V2 · V3' },
  { pane: 'numbers', key: 'ennumbers', parts: ['read', 'listen', 'type'], desc: 'Giá tiền, năm, giờ, ngày tháng' },
]
const PASS = 80

function LabShelf({ onOpen }: { onOpen: (p: Pane) => void }) {
  const scores = useLabScores('en')
  return (
    <section className="en-lab-shelf" aria-labelledby="en-lab-shelf-h">
      <div className="section-title" id="en-lab-shelf-h"><span className="pin" /> Phòng luyện</div>
      <div className="en-lab-grid">
        {LABS.map((l) => {
          const s = scores[l.key] ?? {}
          const reached = l.parts.filter((m) => (s[m] ?? 0) >= PASS).length
          const meta = PANES.find((p) => p.id === l.pane)!
          return (
            <button key={l.pane} type="button" className={'en-lab-card' + (reached === l.parts.length ? ' done' : '')} onClick={() => onOpen(l.pane)}>
              <b><Icon name={meta.icon} size={15} /> {meta.label}</b>
              <small>{l.desc}</small>
              <span className="en-lab-dots" aria-label={`${reached}/${l.parts.length} phần đạt ${PASS}%`}>
                {l.parts.map((m) => <i key={m} className={(s[m] ?? 0) >= PASS ? 'on' : ''} />)}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

interface Props {
  initialLesson?: string
}

// Tab Ngữ pháp: bài học theo chủ điểm + phòng luyện riêng (?pane=)
export default function GrammarHub({ initialLesson }: Props) {
  const [paneRaw, setPane] = useUrlParam('pane', null, (v) => PANE_IDS.includes(v))
  const pane = (paneRaw ?? 'lessons') as Pane
  // Bài được mở từ lộ trình chỉ mở một lần; quay lại mục bài học thì về danh sách
  const [seed, setSeed] = useState(initialLesson)
  const [nonce, setNonce] = useState(0)

  const pick = (p: Pane) => {
    clearUrlParams(['lesson'])
    setSeed(undefined)
    setNonce((n) => n + 1)
    setPane(p === 'lessons' ? null : p)
  }

  return (
    <div className="en-grammar-hub">
      <div className="vl-modes hg-panes" role="group" aria-label="Ngữ pháp tiếng Anh">
        {PANES.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={pane === p.id}
            className={'vl-mode' + (pane === p.id ? ' on' : '')}
            onClick={() => pick(p.id)}
          >
            <Icon name={p.icon} size={14} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'lessons' && <GrammarLessons key={nonce} initialLesson={seed} aside={<LabShelf onOpen={pick} />} />}
      {pane !== 'lessons' && <VoiceNotice lang="en" />}
      {pane === 'tense' && <TenseLab />}
      {pane === 'order' && <SentenceBuilder />}
      {pane === 'prep' && <PrepLab />}
      {pane === 'confuse' && <ConfuseLab />}
      {pane === 'verbs' && <IrregularLab />}
      {pane === 'numbers' && <EnNumbersLab />}
    </div>
  )
}
