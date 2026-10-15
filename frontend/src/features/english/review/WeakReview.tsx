import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import type { LabKey } from '@/core/labScores'
import { englishVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import BlankQuiz from '../shared/BlankQuiz'
import { useTenseProgress } from '../tenses/progress'
import { useConfuseProgress } from '../confusables/progress'
import { useCompareProgress } from '../compare/progress'
import { useCondProgress } from '../conditionals/progress'
import { usePassiveProgress } from '../passive/progress'
import { useGerundProgress } from '../gerund/progress'
import { useArticleProgress } from '../articles/progress'
import { useRelativeProgress } from '../relative/progress'
import { useQuestionProgress } from '../questions/progress'
import { usePhrasalProgress } from '../phrasal/progress'
import { ROUND, SOURCES, buildReview, type ReviewItem } from './sources'
import './styles.css'

interface Props {
  onOpen: (pane: string) => void
}

type Hook = { state: { weak: string[] }; reviewDone: (results: never[]) => void }

const BY_KEY = Object.fromEntries(SOURCES.map((s) => [s.key, s])) as Record<LabKey, (typeof SOURCES)[number]>

// Lượt trộn các câu từng làm sai ở mọi phòng điền chỗ trống; trả lời đúng thì câu rời danh sách của phòng đó
export default function WeakReview({ onOpen }: Props) {
  const { recordEvent } = useAppStore()
  // Thứ tự gọi hook cố định (đủ 10 phòng) để React giữ đúng trạng thái
  const hooks: Partial<Record<LabKey, Hook>> = {
    entense: useTenseProgress(),
    enconfuse: useConfuseProgress(),
    encompare: useCompareProgress(),
    encond: useCondProgress(),
    enpassive: usePassiveProgress(),
    engerund: useGerundProgress(),
    enarticle: useArticleProgress(),
    enrelative: useRelativeProgress(),
    enquestion: useQuestionProgress(),
    enphrasal: usePhrasalProgress(),
  }
  const weak = Object.fromEntries(SOURCES.map((s) => [s.key, hooks[s.key]?.state.weak ?? []])) as Record<LabKey, string[]>
  const counts = SOURCES.map((s) => {
    const ids = new Set(weak[s.key])
    return { s, n: s.frames.filter((f) => ids.has(f.id)).length }
  })
  const total = counts.reduce((a, c) => a + c.n, 0)

  const [canHear, setCanHear] = useState(() => englishVoiceStatus() === 'ready')
  useEffect(() => onVoicesChanged(() => setCanHear(englishVoiceStatus() === 'ready')), [])
  const [quiz, setQuiz] = useState<{ items: ReviewItem[]; n: number } | null>(null)

  const start = () => setQuiz((q) => ({ items: buildReview(weak), n: (q?.n ?? 0) + 1 }))

  // Gọi một lần khi trả lời xong câu cuối: chia kết quả về đúng phòng của từng câu
  const finish = (oks: boolean[]) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'en')
    for (const s of SOURCES) {
      const mine = quiz.items.map((it, k) => ({ it, ok: oks[k] })).filter((x) => x.it.key === s.key)
      if (mine.length) hooks[s.key]?.reviewDone(mine.map((x) => s.view.result(x.it.src, x.ok)) as never[])
    }
  }

  if (quiz) {
    return (
      <div className="erv-lab">
        <BlankQuiz<ReviewItem>
          key={quiz.n}
          items={quiz.items}
          title="Ôn câu sai"
          canHear={canHear}
          filled={(it) => BY_KEY[it.key].filled(it.src)}
          ask={(it) => `${BY_KEY[it.key].name} · ${BY_KEY[it.key].view.ask(it.src)}`}
          feedback={(it) => BY_KEY[it.key].view.feedback(it.src)}
          extra={(it) => BY_KEY[it.key].view.extra?.(it.src)}
          missedNote={(it) => <>{BY_KEY[it.key].name} · {BY_KEY[it.key].view.missedNote(it.src)}</>}
          doneTitle={(good) => (good ? 'Đã sửa được phần lớn lỗi cũ — giỏi lắm!' : 'Xong một lượt — câu còn sai sẽ quay lại ở lượt sau')}
          backLabel="Xem danh sách câu sai"
          onFinish={finish}
          onAgain={start}
          onBack={() => setQuiz(null)}
        />
      </div>
    )
  }

  return (
    <div className="erv-lab">
      <div className="grammar-intro">
        <Icon name="target" size={20} />
        <div>
          <b>Ôn câu sai — gom từ {SOURCES.length} phòng luyện</b>
          <p>
            Mỗi lần làm sai ở các phòng điền chỗ trống (Chọn thì, Mạo từ, Câu bị động, Cụm động từ…), câu đó được ghi lại.
            Ở đây bạn làm lại chúng trong một lượt trộn, mỗi phòng vài câu. Làm đúng thì câu rời danh sách; còn sai thì
            lượt sau gặp lại. Lượt ôn không làm thay đổi điểm tốt nhất của từng phòng.
          </p>
          <div className="hg-stats">
            <span><b>{total}</b> câu đang chờ ôn</span>
            <span><b>{counts.filter((c) => c.n).length}</b> phòng có câu sai</span>
          </div>
        </div>
      </div>

      <section className="erv-list" aria-labelledby="erv-list-h">
        <div className="section-title" id="erv-list-h"><span className="pin" /> Câu sai theo phòng</div>
        {total === 0 ? (
          <p className="erv-empty">
            Chưa có câu sai nào. Làm vài lượt ở các phòng luyện, câu nào chưa đúng sẽ được gom về đây.
          </p>
        ) : (
          <div className="erv-grid">
            {counts.map(({ s, n }) => (
              <button key={s.key} type="button" className={'erv-room' + (n ? '' : ' none')} onClick={() => onOpen(s.pane)}>
                <span>{s.name}</span>
                <b>{n}</b>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className={'erv-start' + (total ? '' : ' off')}>
        <div>
          <b><Icon name="refresh" size={16} /> Một lượt ôn</b>
          <p>{Math.min(ROUND, total) || ROUND} câu, lấy xoay vòng từ các phòng có câu sai.</p>
        </div>
        <button className="btn-primary sm" onClick={start} disabled={!total}>
          <Icon name="play" size={14} /> Bắt đầu
        </button>
      </div>
    </div>
  )
}
