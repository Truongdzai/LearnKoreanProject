import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakKO } from '@/core/tts'
import { compose } from '@/core/utils/hangul'
import { HANGUL_LESSONS, HANGUL_PASS, TAIL_SOUNDS, jamoInfo, type HangulLesson } from '@/data/koreanHangul'
import QuizRunner from './QuizRunner'
import { lessonQuiz, type HQuestion } from './quiz'
import { useRevealTop } from './useRevealTop'

interface Props {
  done: Record<string, number>
  canHear: boolean
  onAnswer: (item: string, ok: boolean) => void
  onFinish: (lessonId: string, pct: number) => void
}

const LINKING_EXAMPLES = [
  { w: '음악', read: '으막', rom: 'eumak', vi: 'âm nhạc', rule: 'ㅁ nhảy sang ㅇ câm' },
  { w: '한국어', read: '한구거', rom: 'hangugeo', vi: 'tiếng Hàn', rule: 'ㄱ nhảy sang ㅇ câm' },
  { w: '먹어요', read: '머거요', rom: 'meogeoyo', vi: 'ăn', rule: 'ㄱ nhảy sang ㅇ câm' },
  { w: '옷이', read: '오시', rom: 'osi', vi: 'quần áo (chủ ngữ)', rule: 'ㅅ nhảy sang thì đọc lại là "s"' },
  { w: '감사합니다', read: '감사함니다', rom: 'gamsahamnida', vi: 'cảm ơn', rule: 'ㅂ gặp ㄴ thì thành ㅁ' },
  { w: '좋아요', read: '조아요', rom: 'joayo', vi: 'tốt; thích', rule: 'ㅎ gặp ㅇ câm thì biến mất' },
]

export default function HangulLessons({ done, canHear, onAnswer, onFinish }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const nextIdx = HANGUL_LESSONS.findIndex((l) => (done[l.id] ?? 0) < HANGUL_PASS)
  const passed = HANGUL_LESSONS.filter((l) => (done[l.id] ?? 0) >= HANGUL_PASS).length

  if (open != null) {
    return (
      <LessonView
        key={open}
        idx={open}
        lesson={HANGUL_LESSONS[open]}
        best={done[HANGUL_LESSONS[open].id]}
        canHear={canHear}
        onAnswer={onAnswer}
        onFinish={(pct) => onFinish(HANGUL_LESSONS[open].id, pct)}
        onBack={() => setOpen(null)}
        onNext={open + 1 < HANGUL_LESSONS.length ? () => setOpen(open + 1) : undefined}
      />
    )
  }

  return (
    <div className="hg-lessons">
      <div className="hg-progress-line">
        <b>{passed}/{HANGUL_LESSONS.length}</b> bài đã đạt
        <div className="hg-bar"><i style={{ width: `${(passed / HANGUL_LESSONS.length) * 100}%` }} /></div>
      </div>
      <div className="capsule-grid">
        {HANGUL_LESSONS.map((l, i) => {
          const best = done[l.id]
          const ok = (best ?? 0) >= HANGUL_PASS
          return (
            <button
              key={l.id}
              className={'capsule-card hg-lesson-card' + (ok ? ' done' : '') + (i === nextIdx ? ' next' : '')}
              onClick={() => setOpen(i)}
            >
              <div className="cap-head">
                <span className="cap-num">{i + 1}</span>
                <span className="cap-tag">{i === nextIdx ? 'Học tiếp' : l.kind === 'vowel' ? 'Nguyên âm' : l.kind === 'consonant' ? 'Phụ âm' : l.kind === 'tail' ? 'Âm cuối' : 'Đọc từ'}</span>
                {ok && <Icon name="check-circle" size={15} />}
              </div>
              <b>{l.title}</b>
              <span className="hg-lesson-sub" lang="ko">{l.sub}</span>
              <small>{best != null ? `Tốt nhất: ${best}%` : 'Chưa học'}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface ViewProps {
  idx: number
  lesson: HangulLesson
  best?: number
  canHear: boolean
  onAnswer: (item: string, ok: boolean) => void
  onFinish: (pct: number) => void
  onBack: () => void
  onNext?: () => void
}

function LessonView({ idx, lesson, best, canHear, onAnswer, onFinish, onBack, onNext }: ViewProps) {
  const [quiz, setQuiz] = useState<HQuestion[] | null>(null)
  const [lastPct, setLastPct] = useState<number | null>(null)
  const rootRef = useRevealTop<HTMLDivElement>(quiz === null)

  if (quiz) {
    return (
      <QuizRunner
        key={quiz[0]?.id}
        questions={quiz}
        title={`Bài ${idx + 1}: ${lesson.title}`}
        pass={HANGUL_PASS}
        onAnswer={onAnswer}
        onFinish={(pct) => { setLastPct(pct); onFinish(pct) }}
        onAgain={() => setQuiz(lessonQuiz(idx, canHear))}
        onBack={() => setQuiz(null)}
      />
    )
  }

  const passed = Math.max(best ?? 0, lastPct ?? 0) >= HANGUL_PASS

  return (
    <div className="hg-lesson" ref={rootRef}>
      <button className="btn-ghost sm" onClick={onBack}><Icon name="arrow-left" size={14} /> Tất cả bài</button>
      <div className="grammar-intro hg-intro">
        <Icon name="bulb" size={20} />
        <div>
          <b>Bài {idx + 1}: {lesson.title}</b>
          <p>{lesson.intro}</p>
        </div>
      </div>

      {(lesson.kind === 'vowel' || lesson.kind === 'consonant') && (
        <div className="hg-cards">
          {lesson.items.map((j) => <JamoCard key={j} j={j} />)}
        </div>
      )}

      {lesson.kind === 'tail' && (
        <div className="hg-cards">
          {TAIL_SOUNDS.map((t) => (
            <div key={t.id} className="hg-card">
              <div className="hg-card-top">
                <span className="hg-glyph sm" lang="ko">{t.letters.join(' ')}</span>
                <span className="hg-rom">→ {t.sound}</span>
              </div>
              <p>{t.vi}</p>
              <div className="hg-card-btns">
                <button className="btn-ghost sm" onClick={() => speakKO(t.demo, 0.75)} lang="ko"><Icon name="volume" size={13} /> {t.demo}</button>
                <button className="btn-ghost sm" onClick={() => speakKO(t.ex, 0.8)}>
                  <Icon name="volume" size={13} /> <span lang="ko">{t.ex}</span> · {t.exRom} · {t.exVi}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lesson.kind === 'words' && (
        <div className="hg-link-table">
          {LINKING_EXAMPLES.map((x) => (
            <button key={x.w} className="hg-link-row" onClick={() => speakKO(x.w, 0.8)}>
              <span className="hg-link-w" lang="ko">{x.w}</span>
              <Icon name="arrow-right" size={14} />
              <span className="hg-link-r" lang="ko">[{x.read}]</span>
              <span className="hg-link-rom">{x.rom}</span>
              <span className="hg-link-vi">{x.vi} · <i>{x.rule}</i></span>
            </button>
          ))}
        </div>
      )}

      <div className="hg-actions">
        <button className="btn-primary" onClick={() => setQuiz(lessonQuiz(idx, canHear))}>
          <Icon name="target" size={15} /> Làm bài kiểm tra (đạt {HANGUL_PASS}%)
        </button>
        {passed && onNext && (
          <button className="btn-ghost" onClick={onNext}>Bài tiếp theo <Icon name="arrow-right" size={14} /></button>
        )}
        {best != null && <span className="hg-best">Tốt nhất: {best}%</span>}
      </div>
    </div>
  )
}

export function JamoCard({ j }: { j: string }) {
  const info = jamoInfo(j)
  if (!info) return null
  const isCons = !!info.name
  const syl = isCons ? compose(j, 'ㅏ') : compose('ㅇ', j)
  return (
    <div className="hg-card">
      <div className="hg-card-top">
        <span className="hg-glyph" lang="ko">{j}</span>
        <div>
          <span className="hg-rom">{info.rom || '(câm)'}{info.tail ? ` · cuối: ${info.tail}` : isCons ? ' · không làm patchim' : ''}</span>
          {info.name && <span className="hg-name" lang="ko">{info.name}</span>}
        </div>
      </div>
      <p><b>Đọc:</b> {info.vi}</p>
      <p className="hg-hint"><b>Mẹo nhớ:</b> {info.hint}</p>
      <div className="hg-card-btns">
        <button className="btn-ghost sm" onClick={() => speakKO(syl, 0.75)}><Icon name="volume" size={13} /> <span lang="ko">{syl}</span></button>
        {info.name && <button className="btn-ghost sm" onClick={() => speakKO(info.name!, 0.8)}><Icon name="volume" size={13} /> Tên chữ</button>}
        <button className="btn-ghost sm" onClick={() => speakKO(info.ex, 0.8)}>
          <Icon name="volume" size={13} /> <span lang="ko">{info.ex}</span> · {info.exRom} · {info.exVi}
        </button>
      </div>
    </div>
  )
}
