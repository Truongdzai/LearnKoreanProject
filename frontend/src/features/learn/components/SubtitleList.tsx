import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { formatTime } from '@/core/utils/format'
import { romanizeWord } from '@/core/utils/romanize'
import { addCard } from '@/core/api/srs.api'
import { defineWord } from '@/core/api/dict.api'
import Icon from '@/core/components/Icon'
import type { Segment } from '@/models/lesson.model'
import type { DictResult } from '@/models/dict.model'
import WordPopup from './WordPopup'

interface Props {
  segments: Segment[]
  activeIndex: number
  source: string
  onSeek: (sec: number) => void
}

interface PopupState {
  x: number
  y: number
  loading: boolean
  result: DictResult | null
  error?: string
}

export default function SubtitleList({ segments, activeIndex, source, onSeek }: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const [popup, setPopup] = useState<PopupState | null>(null)
  const [showRomaja, setShowRomaja] = useState(true)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const row = list.querySelector('.seg.active') as HTMLElement | null
    if (row) list.scrollTop = row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2
  }, [activeIndex])

  const handleWordClick = async (word: string, rect: DOMRect) => {
    const x = rect.left
    const y = rect.bottom
    setPopup({ x, y, loading: true, result: null })
    try {
      const result = await defineWord(word)
      setPopup({ x, y, loading: false, result })
    } catch (e) {
      setPopup({ x, y, loading: false, result: null, error: (e as Error).message })
    }
  }

  return (
    <div className="subs">
      <div className="subs-head">
        <span>Phụ đề</span>
        <div className="subs-tools">
          <button
            className={'romaja-toggle' + (showRomaja ? ' on' : '')}
            onClick={() => setShowRomaja((v) => !v)}
            title="Bật/tắt phiên âm cách đọc"
          >
            <Icon name="letters" size={15} /> Phiên âm
          </button>
          <span className="count"><Icon name="bulb" /> bấm vào từ tiếng Hàn để tra nghĩa</span>
        </div>
      </div>
      <div className="subs-list" ref={listRef}>
        {segments.map((s, i) => (
          <SegmentRow
            key={i}
            seg={s}
            active={i === activeIndex}
            source={source}
            showRomaja={showRomaja}
            onSeek={() => onSeek(s.start)}
            onWordClick={handleWordClick}
          />
        ))}
      </div>

      {popup && (
        <WordPopup
          x={popup.x}
          y={popup.y}
          loading={popup.loading}
          result={popup.result}
          error={popup.error}
          onClose={() => setPopup(null)}
          onSave={(front, back) => addCard({ front, back, source })}
        />
      )}
    </div>
  )
}

function SegmentRow({
  seg,
  active,
  source,
  showRomaja,
  onSeek,
  onWordClick,
}: {
  seg: Segment
  active: boolean
  source: string
  showRomaja: boolean
  onSeek: () => void
  onWordClick: (word: string, rect: DOMRect) => void
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const mine = async (e: MouseEvent) => {
    e.stopPropagation()
    setState('loading')
    try {
      await addCard({ front: seg.ko, back: seg.vi || '', source })
      setState('done')
    } catch (err) {
      setState('idle')
      alert('Không lưu được thẻ: ' + (err as Error).message)
    }
  }

  const clickWord = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    const word = e.currentTarget.textContent || ''
    onWordClick(word, e.currentTarget.getBoundingClientRect())
  }

  return (
    <div className={'seg' + (active ? ' active' : '')} onClick={onSeek}>
      <div className="t">{formatTime(seg.start)}</div>
      <div className="txt">
        <div className={'ko' + (showRomaja ? ' has-romaja' : '')} lang="ko">
          {seg.ko.split(/(\s+)/).map((tok, i) =>
            tok.trim() ? (
              <span className="wword" key={i}>
                {showRomaja && <span className="romaja">{romanizeWord(tok)}</span>}
                <span className="w" onClick={clickWord}>
                  {tok}
                </span>
              </span>
            ) : (
              <span key={i}> </span>
            ),
          )}
        </div>
        {seg.vi && <div className="vi">{seg.vi}</div>}
      </div>
      <button
        className={'mine' + (state === 'done' ? ' done' : '')}
        disabled={state !== 'idle'}
        onClick={mine}
        title="Lưu câu vào bộ thẻ ôn tập"
      >
        {state === 'done' ? (
          <><Icon name="check" /> Đã lưu</>
        ) : state === 'loading' ? (
          '…'
        ) : (
          <><Icon name="plus" /> Lưu</>
        )}
      </button>
    </div>
  )
}
