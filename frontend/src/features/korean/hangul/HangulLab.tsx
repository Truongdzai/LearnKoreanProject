import { useCallback, useEffect, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { koreanVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useUrlParam } from '@/core/hooks/useTabParam'
import { useAppStore } from '@/store/app.store'
import { ALL_JAMO, HANGUL_LESSONS, HANGUL_PASS, TAIL_SOUNDS } from '@/data/koreanHangul'
import { VoiceNotice } from '../../english/components/PronunciationLab'
import HangulLessons from './HangulLessons'
import HangulChart from './HangulChart'
import SyllableBuilder from './SyllableBuilder'
import ReadingPractice from './ReadingPractice'
import TypingTrainer from './TypingTrainer'
import { isSolid, useHangulProgress } from './progress'

type Pane = 'lessons' | 'chart' | 'build' | 'read' | 'type'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'lessons', label: 'Bài học', icon: 'map' },
  { id: 'chart', label: 'Bảng chữ', icon: 'letters' },
  { id: 'build', label: 'Ghép chữ', icon: 'plus' },
  { id: 'read', label: 'Luyện đọc', icon: 'eye' },
  { id: 'type', label: 'Gõ phím', icon: 'keyboard' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]

// Chỉ thống kê chữ cái và 7 âm cuối; từ vựng đã có SRS lo.
const TRACKED = new Set([...ALL_JAMO.map((j) => j.j), ...TAIL_SOUNDS.map((t) => t.id)])

export default function HangulLab() {
  const { recordEvent } = useAppStore()
  const { state, finishLesson, recordAnswer, recordTyping } = useHangulProgress()
  const [paneRaw, setPane] = useUrlParam('pane', null, (v) => PANE_IDS.includes(v))
  const pane = (paneRaw ?? 'lessons') as Pane
  // Chỉ ra câu hỏi nghe khi máy chắc chắn có giọng tiếng Hàn, không thì người học bị kẹt ở câu không phát tiếng.
  const [canHear, setCanHear] = useState(() => koreanVoiceStatus() === 'ready')

  useEffect(() => onVoicesChanged(() => setCanHear(koreanVoiceStatus() === 'ready')), [])

  const onAnswer = useCallback((item: string, ok: boolean) => {
    if (TRACKED.has(item)) recordAnswer(item, ok)
  }, [recordAnswer])

  const onLessonDone = useCallback((id: string, pct: number) => {
    if (finishLesson(id, pct, HANGUL_PASS)) recordEvent('pronounce', 2, 0, 0, 'ko')
  }, [finishLesson, recordEvent])

  const onTyping = useCallback((items: number, perMinute: number) => {
    recordTyping(items, perMinute)
    if (items > 0) recordEvent('review', 1, 0, 0, 'ko')
  }, [recordTyping, recordEvent])

  const passed = HANGUL_LESSONS.filter((l) => (state.done[l.id] ?? 0) >= HANGUL_PASS).length
  const solid = ALL_JAMO.filter((j) => isSolid(state.stats, j.j)).length

  return (
    <div className="hg-lab">
      <div className="grammar-intro">
        <Icon name="letters" size={20} />
        <div>
          <b>Bảng chữ Hangul — đọc được mọi chữ Hàn sau 9 bài ngắn</b>
          <p>
            Hangul có 40 chữ cái, ghép thành khối vuông theo quy tắc cố định: thuộc quy tắc là đọc được cả biển hiệu
            lẫn phụ đề, kể cả từ chưa từng gặp. Mỗi bài 5–10 phút: xem thẻ chữ, nghe mẫu, rồi làm 10 câu kiểm tra.
          </p>
          <div className="hg-stats">
            <span><b>{passed}</b>/{HANGUL_LESSONS.length} bài đạt</span>
            <span><b>{solid}</b>/{ALL_JAMO.length} chữ đã vững</span>
            {state.typing.best > 0 && <span><b>{state.typing.best}</b> âm tiết/phút khi gõ</span>}
          </div>
        </div>
      </div>

      <VoiceNotice lang="ko" />

      <div className="vl-modes hg-panes" role="tablist" aria-label="Phòng Hangul">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            className={'vl-mode' + (pane === p.id ? ' on' : '')}
            onClick={() => setPane(p.id === 'lessons' ? null : p.id)}
          >
            <Icon name={p.icon} size={14} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'lessons' && (
        <HangulLessons done={state.done} canHear={canHear} onAnswer={onAnswer} onFinish={onLessonDone} />
      )}
      {pane === 'chart' && <HangulChart stats={state.stats} />}
      {pane === 'build' && <SyllableBuilder />}
      {pane === 'read' && (
        <ReadingPractice
          done={state.done}
          stats={state.stats}
          canHear={canHear}
          onAnswer={onAnswer}
          onRoundDone={() => recordEvent('review', 1, 0, 0, 'ko')}
        />
      )}
      {pane === 'type' && <TypingTrainer best={state.typing.best} canHear={canHear} onRound={onTyping} />}
    </div>
  )
}
