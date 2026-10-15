import { Suspense, useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { clearUrlParams, useUrlParam } from '@/core/hooks/useTabParam'
import { EN_REVIEW_KEYS, readLabScores, readLabWeak, useLabScores, type LabKey, type LabScores } from '@/core/labScores'
import GrammarLessons from './components/GrammarLessons'
import { GRAMMAR_LESSONS } from '@/data/englishGrammarData'
import { VoiceNotice } from './components/PronunciationLab'
import { lazyPage } from '@/core/lazyPage'
import Spinner from '@/core/components/Spinner'
import './hub.css'

// Mỗi phòng luyện là một gói riêng, chỉ tải khi mở — trang Tiếng Anh không phải chở sẵn mọi phòng
const IrregularLab = lazyPage(() => import('./irregular/IrregularLab'))
const EnNumbersLab = lazyPage(() => import('./numbers/EnNumbersLab'))
const SentenceBuilder = lazyPage(() => import('./builder/SentenceBuilder'))
const PrepLab = lazyPage(() => import('./prepositions/PrepLab'))
const TenseLab = lazyPage(() => import('./tenses/TenseLab'))
const ConfuseLab = lazyPage(() => import('./confusables/ConfuseLab'))
const CompareLab = lazyPage(() => import('./compare/CompareLab'))
const CondLab = lazyPage(() => import('./conditionals/CondLab'))
const PassiveLab = lazyPage(() => import('./passive/PassiveLab'))
const GerundLab = lazyPage(() => import('./gerund/GerundLab'))
const ArticleLab = lazyPage(() => import('./articles/ArticleLab'))
const RelativeLab = lazyPage(() => import('./relative/RelativeLab'))
const QuestionLab = lazyPage(() => import('./questions/QuestionLab'))
const PhrasalLab = lazyPage(() => import('./phrasal/PhrasalLab'))
const WeakReview = lazyPage(() => import('./review/WeakReview'))

type Pane = 'lessons' | 'review' | 'tense' | 'order' | 'prep' | 'article' | 'compare' | 'cond' | 'passive' | 'gerund' | 'relative' | 'question'
  | 'phrasal' | 'confuse' | 'verbs' | 'numbers'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'lessons', label: `${GRAMMAR_LESSONS.length} bài ngữ pháp`, icon: 'book' },
  { id: 'review', label: 'Ôn câu sai', icon: 'target' },
  { id: 'tense', label: 'Chọn thì', icon: 'clock' },
  { id: 'order', label: 'Ghép câu', icon: 'shuffle' },
  { id: 'prep', label: 'in / on / at', icon: 'map' },
  { id: 'article', label: 'a / an / the', icon: 'note' },
  { id: 'compare', label: 'So sánh', icon: 'trending' },
  { id: 'cond', label: 'Câu điều kiện', icon: 'sparkles' },
  { id: 'passive', label: 'Câu bị động', icon: 'refresh' },
  { id: 'gerund', label: 'V-ing hay to V', icon: 'letters' },
  { id: 'relative', label: 'Mệnh đề quan hệ', icon: 'user' },
  { id: 'question', label: 'Câu hỏi đuôi', icon: 'search' },
  { id: 'phrasal', label: 'Cụm động từ', icon: 'tool' },
  { id: 'confuse', label: 'Từ dễ nhầm', icon: 'bulb' },
  { id: 'verbs', label: 'Động từ bất quy tắc', icon: 'refresh' },
  { id: 'numbers', label: 'Số đếm & giờ giấc', icon: 'chart' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]
const meta = (id: Pane) => PANES.find((p) => p.id === id)!
// Hai mục chung đứng đầu; các phòng luyện xếp theo nhóm bên dưới
const MAIN = PANES.filter((p) => p.id === 'lessons' || p.id === 'review')

function PaneButton({ p, on, onPick }: { p: (typeof PANES)[number]; on: boolean; onPick: (id: Pane) => void }) {
  return (
    <button type="button" aria-pressed={on} className={'vl-mode' + (on ? ' on' : '')} onClick={() => onPick(p.id)}>
      <Icon name={p.icon} size={14} /> {p.label}
    </button>
  )
}

// Nhóm phòng luyện: hàng nút và dải Phòng luyện xếp theo nhóm cho dễ tìm khi số phòng tăng
type Group = 'verb' | 'sentence' | 'word'
const GROUPS: { id: Group; label: string }[] = [
  { id: 'verb', label: 'Thì & động từ' },
  { id: 'sentence', label: 'Cấu trúc câu' },
  { id: 'word', label: 'Từ & con số' },
]

// Phòng luyện: phần nào tính cho lộ trình (đạt 80% mỗi phần)
const LABS: { pane: Pane; key: LabKey; group: Group; parts: string[]; desc: string }[] = [
  { pane: 'tense', key: 'entense', group: 'verb', parts: ['mix'], desc: 'Nhìn dấu hiệu chọn đúng thì' },
  { pane: 'passive', key: 'enpassive', group: 'verb', parts: ['mix'], desc: 'was built, is spoken, will be sent' },
  { pane: 'cond', key: 'encond', group: 'verb', parts: ['mix'], desc: 'If it rains… / If I had…' },
  { pane: 'gerund', key: 'engerund', group: 'verb', parts: ['mix'], desc: 'enjoy swimming, decide to go' },
  { pane: 'phrasal', key: 'enphrasal', group: 'verb', parts: ['mix'], desc: 'look after, turn it off' },
  { pane: 'verbs', key: 'enirregular', group: 'verb', parts: ['v2', 'v3', 'type'], desc: '105 động từ V1 · V2 · V3' },
  { pane: 'order', key: 'enorder', group: 'sentence', parts: ['easy', 'hard'], desc: 'Xếp thẻ thành câu đúng trật tự' },
  { pane: 'compare', key: 'encompare', group: 'sentence', parts: ['mix'], desc: 'cheaper, more expensive, the best' },
  { pane: 'relative', key: 'enrelative', group: 'sentence', parts: ['mix'], desc: 'who, which, whose, where' },
  { pane: 'question', key: 'enquestion', group: 'sentence', parts: ['mix'], desc: "isn't it?, Do you know where…" },
  { pane: 'prep', key: 'enprep', group: 'word', parts: ['time', 'place'], desc: 'Giới từ thời gian, nơi chốn' },
  { pane: 'article', key: 'enarticle', group: 'word', parts: ['mix'], desc: 'an hour, the sun, không mạo từ' },
  { pane: 'confuse', key: 'enconfuse', group: 'word', parts: ['mix'], desc: 'borrow / lend, say / tell…' },
  { pane: 'numbers', key: 'ennumbers', group: 'word', parts: ['read', 'listen', 'type'], desc: 'Giá tiền, năm, giờ, ngày tháng' },
]
const PASS = 80

// Bài ngữ pháp → phòng luyện để luyện thêm đúng chủ điểm đó
const LESSON_LABS: Record<string, Pane[]> = {
  e02: ['order'], e03: ['tense'], e04: ['tense'], e05: ['order'], e06: ['article'], e07: ['confuse'], e08: ['verbs', 'tense'], e09: ['tense'],
  e10: ['order'], e11: ['compare'], e12: ['order'], e13: ['prep'], e15: ['verbs', 'tense'], e16: ['cond'], e18: ['gerund'],
  // Tầng B1
  e19: ['tense'], e21: ['tense'], e22: ['verbs'], e23: ['passive', 'verbs'], e24: ['relative'], e25: ['confuse'], e26: ['verbs'],
  e28: ['order'], e29: ['question'], e30: ['phrasal'],
}

function MoreLabs({ ids, onOpen }: { ids: Pane[]; onOpen: (p: Pane) => void }) {
  return (
    <div className="en-more-labs">
      <span>Luyện thêm ở phòng:</span>
      {ids.map((id) => {
        const m = meta(id)
        return (
          <button key={id} type="button" className="btn-ghost sm" onClick={() => onOpen(id)}>
            <Icon name={m.icon} size={14} /> {m.label}
          </button>
        )
      })}
    </div>
  )
}

function LabShelf({ scores, onOpen }: { scores: LabScores; onOpen: (p: Pane) => void }) {
  // Bản local đọc lại mỗi lần dải hiện ra (vừa luyện xong một phòng là thấy ngay), lấy điểm cao hơn của hai nguồn
  const local = useMemo(() => readLabScores('en'), [])
  const best = (key: LabKey, m: string) => Math.max(scores[key]?.[m] ?? 0, local[key]?.[m] ?? 0)
  // Số câu sai (bản local) ở các phòng mà mục Ôn câu sai gom về
  const weak = useMemo(() => readLabWeak('en').filter((w) => EN_REVIEW_KEYS.includes(w.key)).reduce((a, w) => a + w.n, 0), [])
  return (
    <section className="en-lab-shelf" aria-labelledby="en-lab-shelf-h">
      <div className="section-title" id="en-lab-shelf-h"><span className="pin" /> Phòng luyện</div>
      {weak > 0 && (
        <button type="button" className="en-review-cta" onClick={() => onOpen('review')}>
          <Icon name="target" size={16} />
          <span>Còn <b>{weak}</b> câu từng làm sai ở các phòng luyện — ôn lại trong một lượt trộn</span>
          <Icon name="arrow-right" size={15} />
        </button>
      )}
      {GROUPS.map((g) => (
        <div key={g.id} className="en-lab-group">
          <h3 className="en-lab-group-h">{g.label}</h3>
          <div className="en-lab-grid">
            {LABS.filter((l) => l.group === g.id).map((l) => {
              const reached = l.parts.filter((m) => best(l.key, m) >= PASS).length
              const m = meta(l.pane)
              return (
                <button key={l.pane} type="button" className={'en-lab-card' + (reached === l.parts.length ? ' done' : '')} onClick={() => onOpen(l.pane)}>
                  <b><Icon name={m.icon} size={15} /> {m.label}</b>
                  <small>{l.desc}</small>
                  <span className="en-lab-dots" aria-label={`${reached}/${l.parts.length} phần đạt ${PASS}%`}>
                    {l.parts.map((part) => <i key={part} className={best(l.key, part) >= PASS ? 'on' : ''} />)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
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
      {/* Điện thoại: một ô chọn thay cho hàng nút */}
      <label className="en-pane-select">
        <span>Mục</span>
        <select value={pane} onChange={(e) => pick(e.target.value as Pane)} aria-label="Chọn mục ngữ pháp">
          {MAIN.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          {GROUPS.map((g) => (
            <optgroup key={g.id} label={g.label}>
              {LABS.filter((l) => l.group === g.id).map((l) => <option key={l.pane} value={l.pane}>{meta(l.pane).label}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <nav className="hg-nav" aria-label="Ngữ pháp tiếng Anh">
        <div className="vl-modes hg-panes">
          {MAIN.map((p) => <PaneButton key={p.id} p={p} on={pane === p.id} onPick={pick} />)}
        </div>
        {GROUPS.map((g) => (
          <div key={g.id} className="hg-pane-group" role="group" aria-labelledby={`hg-g-${g.id}`}>
            <span className="hg-pane-label" id={`hg-g-${g.id}`}>{g.label}</span>
            <div className="vl-modes hg-panes">
              {LABS.filter((l) => l.group === g.id).map((l) => (
                <PaneButton key={l.pane} p={meta(l.pane)} on={pane === l.pane} onPick={pick} />
              ))}
            </div>
          </div>
        ))}
      </nav>

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
          {pane === 'gerund' && <GerundLab />}
          {pane === 'article' && <ArticleLab />}
          {pane === 'relative' && <RelativeLab />}
          {pane === 'question' && <QuestionLab />}
          {pane === 'phrasal' && <PhrasalLab />}
          {pane === 'review' && <WeakReview onOpen={(p) => pick(p as Pane)} />}
          {pane === 'confuse' && <ConfuseLab />}
          {pane === 'verbs' && <IrregularLab />}
          {pane === 'numbers' && <EnNumbersLab />}
        </Suspense>
      )}
    </div>
  )
}
