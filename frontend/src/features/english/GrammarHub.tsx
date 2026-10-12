import { Suspense, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { clearUrlParams, useUrlParam } from '@/core/hooks/useTabParam'
import { useLabScores, type LabKey, type LabScores } from '@/core/labScores'
import GrammarLessons from './components/GrammarLessons'
import { VoiceNotice } from './components/PronunciationLab'
import { lazyPage } from '@/core/lazyPage'
import Spinner from '@/core/components/Spinner'
import './hub.css'

// Mỗi phòng luyện là một gói riêng, chỉ tải khi mở — trang Tiếng Anh không phải chở sẵn cả 6 phòng
const IrregularLab = lazyPage(() => import('./irregular/IrregularLab'))
const EnNumbersLab = lazyPage(() => import('./numbers/EnNumbersLab'))
const SentenceBuilder = lazyPage(() => import('./builder/SentenceBuilder'))
const PrepLab = lazyPage(() => import('./prepositions/PrepLab'))
const TenseLab = lazyPage(() => import('./tenses/TenseLab'))
const ConfuseLab = lazyPage(() => import('./confusables/ConfuseLab'))
const CompareLab = lazyPage(() => import('./compare/CompareLab'))
const CondLab = lazyPage(() => import('./conditionals/CondLab'))
const PassiveLab = lazyPage(() => import('./passive/PassiveLab'))

type Pane = 'lessons' | 'tense' | 'order' | 'prep' | 'compare' | 'cond' | 'passive' | 'confuse' | 'verbs' | 'numbers'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'lessons', label: '18 bài ngữ pháp', icon: 'book' },
  { id: 'tense', label: 'Chọn thì', icon: 'clock' },
  { id: 'order', label: 'Ghép câu', icon: 'shuffle' },
  { id: 'prep', label: 'in / on / at', icon: 'map' },
  { id: 'compare', label: 'So sánh', icon: 'trending' },
  { id: 'cond', label: 'Câu điều kiện', icon: 'sparkles' },
  { id: 'passive', label: 'Câu bị động', icon: 'refresh' },
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
  { pane: 'compare', key: 'encompare', parts: ['mix'], desc: 'cheaper, more expensive, the best' },
  { pane: 'cond', key: 'encond', parts: ['mix'], desc: 'If it rains… / If I had…' },
  { pane: 'passive', key: 'enpassive', parts: ['mix'], desc: 'was built, is spoken, will be sent' },
  { pane: 'confuse', key: 'enconfuse', parts: ['mix'], desc: 'borrow / lend, say / tell…' },
  { pane: 'verbs', key: 'enirregular', parts: ['v2', 'v3', 'type'], desc: '105 động từ V1 · V2 · V3' },
  { pane: 'numbers', key: 'ennumbers', parts: ['read', 'listen', 'type'], desc: 'Giá tiền, năm, giờ, ngày tháng' },
]
const PASS = 80

// Bài ngữ pháp → phòng luyện để luyện thêm đúng chủ điểm đó
const LESSON_LABS: Record<string, Pane[]> = {
  e02: ['order'], e03: ['tense'], e04: ['tense'], e05: ['order'], e07: ['confuse'], e08: ['verbs', 'tense'], e09: ['tense'],
  e10: ['order'], e11: ['compare'], e12: ['order'], e13: ['prep'], e15: ['verbs', 'tense'], e16: ['cond'],
}

function MoreLabs({ ids, onOpen }: { ids: Pane[]; onOpen: (p: Pane) => void }) {
  return (
    <div className="en-more-labs">
      <span>Luyện thêm ở phòng:</span>
      {ids.map((id) => {
        const meta = PANES.find((p) => p.id === id)!
        return (
          <button key={id} type="button" className="btn-ghost sm" onClick={() => onOpen(id)}>
            <Icon name={meta.icon} size={14} /> {meta.label}
          </button>
        )
      })}
    </div>
  )
}

function LabShelf({ scores, onOpen }: { scores: LabScores; onOpen: (p: Pane) => void }) {
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
  // Đọc điểm một lần khi vào tab (không gọi lại mỗi lần mở / đóng một bài)
  const scores = useLabScores('en')

  const pick = (p: Pane) => {
    clearUrlParams(['lesson'])
    setSeed(undefined)
    setNonce((n) => n + 1)
    setPane(p === 'lessons' ? null : p)
  }

  return (
    <div className="en-grammar-hub">
      {/* Điện thoại: một ô chọn thay cho 10 nút */}
      <label className="en-pane-select">
        <span>Mục</span>
        <select value={pane} onChange={(e) => pick(e.target.value as Pane)} aria-label="Chọn mục ngữ pháp">
          {PANES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </label>
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

      {pane === 'lessons' && (
        <GrammarLessons
          key={nonce}
          initialLesson={seed}
          aside={<LabShelf scores={scores} onOpen={pick} />}
          more={(id) => (LESSON_LABS[id] ? <MoreLabs ids={LESSON_LABS[id]} onOpen={pick} /> : null)}
        />
      )}
      {pane !== 'lessons' && <VoiceNotice lang="en" />}
      {pane !== 'lessons' && (
        <Suspense fallback={<div className="center-state"><Spinner /></div>}>
          {pane === 'tense' && <TenseLab />}
          {pane === 'order' && <SentenceBuilder />}
          {pane === 'prep' && <PrepLab />}
          {pane === 'compare' && <CompareLab />}
          {pane === 'cond' && <CondLab />}
          {pane === 'passive' && <PassiveLab />}
          {pane === 'confuse' && <ConfuseLab />}
          {pane === 'verbs' && <IrregularLab />}
          {pane === 'numbers' && <EnNumbersLab />}
        </Suspense>
      )}
    </div>
  )
}
