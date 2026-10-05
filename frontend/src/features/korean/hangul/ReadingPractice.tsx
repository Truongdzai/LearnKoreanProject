import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { HANGUL_LESSONS, HANGUL_PASS } from '@/data/koreanHangul'
import QuizRunner from './QuizRunner'
import { isSolid } from './progress'
import { knownJamo, practiceRound, wordQuestion, type HQuestion, type Stats } from './quiz'

type Pool = 'learned' | 'all' | 'words'

interface Props {
  done: Record<string, number>
  stats: Stats
  canHear: boolean
  onAnswer: (item: string, ok: boolean) => void
  onRoundDone: () => void
}

export default function ReadingPractice({ done, stats, canHear, onAnswer, onRoundDone }: Props) {
  const [quiz, setQuiz] = useState<HQuestion[] | null>(null)
  const [pool, setPool] = useState<Pool>('learned')

  // "Chữ đã học" = chữ của các bài đã đạt; chưa đạt bài nào thì lấy bài 1 cho có cái luyện.
  const passedLessons = HANGUL_LESSONS.filter((l) => (done[l.id] ?? 0) >= HANGUL_PASS && l.items.length && l.kind !== 'tail')
  const learned = passedLessons.length ? passedLessons.flatMap((l) => l.items) : HANGUL_LESSONS[0].items
  const all = knownJamo(HANGUL_LESSONS.length - 1)

  const build = (p: Pool): HQuestion[] => {
    if (p === 'words') return Array.from({ length: 10 }, (_, i) => wordQuestion(canHear && i % 3 === 2, false))
    return practiceRound(p === 'learned' ? learned : all, stats, canHear)
  }

  const go = (p: Pool) => {
    setPool(p)
    setQuiz(build(p))
  }

  if (quiz) {
    return (
      <QuizRunner
        key={quiz[0]?.id}
        questions={quiz}
        title="Luyện đọc"
        onAnswer={onAnswer}
        onFinish={() => onRoundDone()}
        onAgain={() => setQuiz(build(pool))}
        onBack={() => setQuiz(null)}
      />
    )
  }

  const tried = all.filter((j) => stats[j])
  const weak = tried
    .map((j) => ({ j, right: stats[j][0], wrong: stats[j][1] }))
    .filter((x) => x.wrong > 0)
    .sort((a, b) => b.wrong / (b.right + b.wrong) - a.wrong / (a.right + a.wrong) || b.wrong - a.wrong)
    .slice(0, 8)
  const solid = all.filter((j) => isSolid(stats, j)).length

  return (
    <div className="hg-practice">
      <div className="grammar-intro">
        <Icon name="eye" size={20} />
        <div>
          <b>Luyện đọc — {solid}/{all.length} chữ đã vững</b>
          <p>
            Mỗi lượt 10 câu trộn ba kiểu: nhìn chữ đoán âm, nghe chọn chữ, nhìn phiên âm chọn chữ. Chữ bạn hay sai
            sẽ được hỏi lại nhiều hơn cho tới khi đúng chắc.
          </p>
        </div>
      </div>

      <div className="hg-practice-pick">
        <button className="hg-pool" onClick={() => go('learned')}>
          <Icon name="check-circle" size={18} />
          <b>Chữ đã học</b>
          <span>{learned.length} chữ · {passedLessons.length ? `${passedLessons.length} bài đã đạt` : 'bài 1'}</span>
        </button>
        <button className="hg-pool" onClick={() => go('all')}>
          <Icon name="letters" size={18} />
          <b>Cả bảng chữ</b>
          <span>{all.length} chữ cái</span>
        </button>
        <button className="hg-pool" onClick={() => go('words')}>
          <Icon name="cards" size={18} />
          <b>Đọc từ thật</b>
          <span>Từ trong lộ trình 90 ngày</span>
        </button>
      </div>

      {weak.length > 0 && (
        <>
          <div className="section-title"><span className="pin" /> Chữ bạn hay nhầm</div>
          <div className="hg-weak">
            {weak.map((x) => (
              <span key={x.j} className="hg-weak-chip">
                <b lang="ko">{x.j}</b> sai {x.wrong}/{x.right + x.wrong}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
