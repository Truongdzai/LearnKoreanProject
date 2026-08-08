import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import type { EtsIndexItem } from '@/data/english/toeic/etsTests'

export type EtsMode = 'exam' | 'practice'

interface Props {
  item: EtsIndexItem
  onBack: () => void
  onStart: (parts: number[], mode: EtsMode) => void
}

const PARTS: { part: number; sec: 'listening' | 'reading'; en: string; vi: string; n: number }[] = [
  { part: 1, sec: 'listening', en: 'Photos', vi: 'Mô tả tranh', n: 6 },
  { part: 2, sec: 'listening', en: 'Question–Response', vi: 'Hỏi — đáp', n: 25 },
  { part: 3, sec: 'listening', en: 'Conversations', vi: 'Hội thoại', n: 39 },
  { part: 4, sec: 'listening', en: 'Talks', vi: 'Bài nói ngắn', n: 30 },
  { part: 5, sec: 'reading', en: 'Incomplete Sentences', vi: 'Câu chưa hoàn chỉnh', n: 30 },
  { part: 6, sec: 'reading', en: 'Text Completion', vi: 'Điền vào đoạn văn', n: 16 },
  { part: 7, sec: 'reading', en: 'Reading Comprehension', vi: 'Đọc hiểu', n: 54 },
]

const ALL = PARTS.map((p) => p.part)
const MINUTES: Record<number, number> = { 1: 4, 2: 10, 3: 17, 4: 14, 5: 12, 6: 12, 7: 51 }

export default function EtsDetail({ item, onBack, onStart }: Props) {
  const [picked, setPicked] = useState<number[]>(ALL)
  const [mode, setMode] = useState<EtsMode>('exam')

  const chosen = useMemo(() => PARTS.filter((p) => picked.includes(p.part)), [picked])
  const questions = chosen.reduce((s, p) => s + p.n, 0)
  const minutes = picked.length === ALL.length
    ? 120
    : chosen.reduce((s, p) => s + MINUTES[p.part], 0)
  const full = picked.length === ALL.length

  const toggle = (part: number) => setPicked((s) =>
    s.includes(part) ? s.filter((x) => x !== part) : [...s, part].sort((a, b) => a - b))

  return (
    <div className="ets-detail">
      <button className="btn-ghost sm ets-back" onClick={onBack}>
        <Icon name="arrow-left" size={14} /> Bộ đề ETS 2026
      </button>

      <h2 className="ets-name">{item.name}</h2>
      <div className="ets-facts">
        <span><Icon name="note" size={14} /> 200 câu hỏi</span>
        <span><Icon name="clock" size={14} /> 120 phút</span>
        <span><Icon name="volume" size={14} /> {item.listening} câu Nghe · {item.reading ?? item.part5} câu Đọc</span>
      </div>

      <div className="ets-cols">
        <div className="ets-table">
          <div className="ets-row head">
            <span>Section</span><span>Part</span><span>Type</span><span className="num">Questions</span>
          </div>
          {PARTS.map((p) => (
            <div key={p.part} className="ets-row">
              <span className={'ets-sec ' + p.sec}>
                {p.sec === 'listening' ? 'LISTENING' : 'READING'}
              </span>
              <span className="ets-part">Part {p.part}</span>
              <span className="ets-type" lang="en">{p.en}<small>{p.vi}</small></span>
              <span className="num">{p.n}</span>
            </div>
          ))}
        </div>

        <div className="ets-side">
          <div className="ets-box">
            <div className="ets-box-head">Chế độ làm bài</div>
            <div className="ets-modes">
              <button className={'ets-mode' + (mode === 'exam' ? ' on' : '')}
                onClick={() => setMode('exam')}>
                <b>Luyện thi</b>
                <small>Giống thi thật — không xem đáp án khi đang làm, có đồng hồ</small>
              </button>
              <button className={'ets-mode' + (mode === 'practice' ? ' on' : '')}
                onClick={() => setMode('practice')}>
                <b>Luyện tập</b>
                <small>Xem đáp án và giải thích ngay sau mỗi câu, không tính giờ</small>
              </button>
            </div>
          </div>

          <div className="ets-box">
            <div className="ets-box-head">
              Chọn phần muốn làm
              <span className="ets-quick">
                <button className="link-btn" onClick={() => setPicked(ALL)}>Chọn tất cả</button>
                <button className="link-btn" onClick={() => setPicked([])}>Bỏ chọn</button>
              </span>
            </div>
            {(['listening', 'reading'] as const).map((sec) => (
              <div key={sec} className="ets-group">
                <div className={'ets-group-head ' + sec}>
                  {sec === 'listening' ? 'LISTENING' : 'READING'}
                </div>
                {PARTS.filter((p) => p.sec === sec).map((p) => (
                  <label key={p.part} className="ets-check">
                    <input type="checkbox" checked={picked.includes(p.part)}
                      onChange={() => toggle(p.part)} />
                    <span>P{p.part} — <span lang="en">{p.en}</span> <em>({p.n})</em></span>
                  </label>
                ))}
              </div>
            ))}
            <div className="ets-total">
              {picked.length === 0
                ? 'Chưa chọn phần nào'
                : full
                  ? 'Toàn bộ 7 part — 200 câu — 120 phút'
                  : `${picked.length} part — ${questions} câu — ${minutes} phút`}
            </div>
          </div>

          {mode === 'exam' && (
            <p className="ets-note">
              Bài thi tự nộp khi hết giờ. Phần Nghe audio chỉ phát 1 lần và không quay lại được,
              đúng như thi thật.
            </p>
          )}

          <button className="btn-primary ets-start" disabled={!picked.length}
            onClick={() => onStart(picked, mode)}>
            Bắt đầu làm bài <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
