import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { LOOP, PACKS, packById, type ActiveChunk } from '@/data/englishActive'
import { useMastery } from './mastery'
import Scene from './Scene'
import Drill from './Drill'
import ProduceCard from './ProduceCard'

interface Props {
  onGoBoard?: () => void
  onGoErrors?: () => void
  onGoPacks?: () => void
}

type Block = 'input' | 'recall' | 'output' | 'review'

const BLOCKS: { id: Block; n: number; name: string; steps: string; mins: number; desc: string }[] = [
  { id: 'input', n: 1, name: 'Nạp vào & Nhận diện', steps: 'Input · Notice', mins: 10, desc: 'Nghe một cảnh thật, soi ra các cụm đáng lấy.' },
  { id: 'recall', n: 2, name: 'Truy xuất', steps: 'Recall', mins: 10, desc: 'Bỏ đáp án, tự lôi cụm ra khỏi trí nhớ — có bấm giờ.' },
  { id: 'output', n: 3, name: 'Bật ra & Phản hồi', steps: 'Output · Feedback · Retry', mins: 8, desc: 'Tự nói một đoạn, AI soi lỗi, bạn nói lại cho đúng.' },
  { id: 'review', n: 4, name: 'Ôn lại', steps: 'Review', mins: 5, desc: 'Gặp lại các cụm tới hạn, ở chiều kiểm khó hơn lần trước.' },
]

export default function Today({ onGoBoard, onGoErrors, onGoPacks }: Props) {
  const { state, queueFor, dueList, stats, todayLog, streak, logOutput } = useMastery()
  const [packId, setPackId] = useState(state.goal || PACKS[0].id)
  const [block, setBlock] = useState<Block>('input')
  const [done, setDone] = useState<Record<Block, boolean>>({ input: false, recall: false, output: false, review: false })
  const picked = useRef(false)

  useEffect(() => {
    if (!picked.current && state.goal) setPackId(state.goal)
  }, [state.goal])

  const pack = packById(packId) ?? PACKS[0]
  const queue = useMemo(() => queueFor(packId, 8), [queueFor, packId])
  const due = useMemo(() => dueList().slice(0, 10), [dueList])

  const targets: ActiveChunk[] = useMemo(() => queue.slice(0, 3), [queue])
  const doneCount = BLOCKS.filter((b) => done[b.id]).length

  const finish = (b: Block) => {
    setDone((d) => ({ ...d, [b]: true }))
    const at = BLOCKS.findIndex((x) => x.id === b)
    const nxt = BLOCKS[at + 1]
    if (nxt) setBlock(nxt.id)
  }

  return (
    <div className="ac-today-page">
      <div className="ac-formula">
        {LOOP.map((s, i) => (
          <span key={s.id} className="ac-fstep">
            <b className={s.tone}><Icon name={s.icon} size={13} /></b>
            <em>{s.name}</em>
            {i < LOOP.length - 1 && <i>→</i>}
          </span>
        ))}
        <span className="ac-fend">AUTOMATICITY</span>
      </div>
      <p className="ac-formula-note">
        Cả trang này chạy đúng một vòng lặp. Bỏ bất kỳ mắt xích nào thì kiến thức sẽ nằm lại ở dạng thụ động —
        hiểu được nhưng không nói ra được.
      </p>

      {!state.goal && (
        <div className="ac-goalnudge">
          <Icon name="target" size={16} />
          <div>
            <b>Bạn chưa chọn mục tiêu</b>
            <span>
              Buổi học đang chạy tạm với gói <em>{pack.name}</em>. Ngôn ngữ bạn cần khác hẳn nhau tuỳ việc
              bạn sẽ dùng nó vào đâu — hãy chọn gói sát nhất với việc thật của bạn để hệ thống ưu tiên đúng chỗ.
            </span>
          </div>
          {onGoPacks && <button className="ac-next" onClick={onGoPacks}>Chọn mục tiêu <Icon name="arrow-right" size={15} /></button>}
        </div>
      )}

      <div className="ac-session">
        <aside className="ac-rail">
          <div className="ac-rail-head">
            <span>BUỔI HÔM NAY</span>
            <b>{doneCount}/4 khối · ~33 phút</b>
          </div>
          {BLOCKS.map((b) => (
            <button
              key={b.id}
              className={'ac-railstep' + (block === b.id ? ' on' : '') + (done[b.id] ? ' done' : '')}
              onClick={() => setBlock(b.id)}
            >
              <span className="ac-railn">{done[b.id] ? <Icon name="check" size={13} /> : b.n}</span>
              <div>
                <b>{b.name}</b>
                <small>{b.steps} · {b.mins} phút</small>
              </div>
            </button>
          ))}

          <div className="ac-rail-pack">
            <span>GÓI TÌNH HUỐNG</span>
            <select value={packId} onChange={(e) => { picked.current = true; setPackId(e.target.value); setBlock('input'); setDone({ input: false, recall: false, output: false, review: false }) }}>
              {PACKS.map((p) => (
                <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
              ))}
            </select>
            <small>{pack.goal}</small>
          </div>

          <div className="ac-rail-stat">
            <div><b>{stats.active}</b><span>cụm chủ động</span></div>
            <div><b>{streak}</b><span>ngày liên tiếp</span></div>
            <div><b>{todayLog.drills}</b><span>lượt hôm nay</span></div>
          </div>
        </aside>

        <main className="ac-stage">
          {block === 'input' && (
            <>
              <Scene pack={pack} onGoDrill={() => finish('input')} />
              <div className="ac-blockfoot">
                <span>Xong bước 1–5 của cảnh này rồi thì sang khối tiếp theo.</span>
                <button className="ac-next" onClick={() => finish('input')}>Xong khối 1 <Icon name="arrow-right" size={15} /></button>
              </div>
            </>
          )}

          {block === 'recall' && (
            <>
              <Drill
                key={`q-${packId}`}
                queue={queue}
                heading={`Truy xuất · ${pack.name}`}
                onFinish={() => finish('recall')}
              />
              <div className="ac-blockfoot">
                <span>Mỗi cụm được kiểm ở đúng chiều nó còn yếu, không phải chiều nó đã qua.</span>
                <button className="ac-ghost" onClick={() => finish('recall')}>Bỏ qua khối này</button>
              </div>
            </>
          )}

          {block === 'output' && (
            <>
              <ProduceCard
                task="free"
                rows={5}
                prompt={`Speak about: ${pack.scene.setting}`}
                brief={
                  <>
                    <b>Nói tự do 45–60 giây — không nhìn gợi ý</b>
                    <span>
                      Tình huống: <em>{pack.scene.setting}</em>. Cố dùng cho được{' '}
                      {targets.length
                        ? targets.map((t, i) => (
                          <span key={t.id}>{i > 0 && ', '}<code>{t.en}</code></span>
                        ))
                        : 'các cụm bạn vừa luyện'}.
                      {' '}Bắt chước được câu mẫu chưa tính là biết nói — tự tạo ra câu mới mới tính.
                    </span>
                  </>
                }
                placeholder="Nói hoặc gõ đoạn của bạn…"
                onResult={() => logOutput()}
                onNext={() => finish('output')}
                nextLabel="Xong khối 3"
              />
              <div className="ac-blockfoot">
                <span>Lỗi AI bắt được sẽ tự vào Sổ lỗi. Mỗi tuần chọn 3 lỗi ở đó chữa dứt điểm.</span>
                {onGoErrors && <button className="ac-ghost" onClick={onGoErrors}>Mở Sổ lỗi</button>}
              </div>
            </>
          )}

          {block === 'review' && (
            <>
              {due.length ? (
                <Drill key="due" queue={due} heading="Ôn lại · tới hạn hôm nay" onFinish={() => finish('review')} />
              ) : (
                <div className="ac-empty">
                  <Icon name="check-circle" size={30} />
                  <b>Chưa có cụm nào tới hạn</b>
                  <p>
                    Lịch ôn giãn dần theo mức làm chủ: mức 1 gặp lại sau 1 ngày, mức 4 sau 16 ngày, mức 5 sau 35 ngày.
                    Cứ học tiếp gói mới, hệ thống sẽ gọi bạn quay lại đúng lúc sắp quên.
                  </p>
                </div>
              )}
              <div className="ac-blockfoot">
                <span>Xong buổi rồi. Xem lại tiến độ thật của bạn ở Bảng làm chủ.</span>
                {onGoBoard && <button className="ac-next" onClick={onGoBoard}>Bảng làm chủ <Icon name="arrow-right" size={15} /></button>}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
