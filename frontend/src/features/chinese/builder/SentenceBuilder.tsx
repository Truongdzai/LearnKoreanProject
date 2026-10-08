import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { chineseVoiceStatus, onVoicesChanged, speakZH } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import BuildQuiz from './BuildQuiz'
import { LEVELS, buildRound, pinyinOf, poolFor, type LevelId, type Sentence } from './sentences'
import { MASTERY, useZhOrderProgress } from './progress'
import './styles.css'

const PY_KEY = 'vyling.zh.order.py'

function readPy(): boolean {
  try { return localStorage.getItem(PY_KEY) !== '0' } catch { return true }
}

// Ba chỗ trật tự tiếng Trung ngược tiếng Việt, mỗi chỗ một cặp câu đối chiếu
const CONTRASTS: { title: string; vi: string; zh: string; note: string }[] = [
  { title: 'Nơi chốn đứng trước động từ', vi: 'Tôi ăn cơm ở nhà.', zh: '我在家吃饭。', note: 'Tôi + ở nhà + ăn cơm' },
  { title: 'Định ngữ đứng trước danh từ', vi: 'Sách của tôi · áo màu đỏ', zh: '我的书 · 红色的衣服', note: 'của tôi + sách · màu đỏ + áo' },
  { title: 'Thời gian không đứng cuối câu', vi: 'Tôi đi Bắc Kinh ngày mai.', zh: '我明天去北京。', note: 'Tôi + ngày mai + đi Bắc Kinh (hoặc 明天我去北京)' },
]

function ZhText({ text }: { text: string }) {
  const parts = text.split(/(\p{Script=Han}+)/u)
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} lang="zh">{p}</span> : p))}</>
}

export default function SentenceBuilder() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useZhOrderProgress()
  const [canHear, setCanHear] = useState(() => chineseVoiceStatus() === 'ready')
  const [showPy, setShowPy] = useState(readPy)
  const [quiz, setQuiz] = useState<{ level: LevelId; items: Sentence[] } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(chineseVoiceStatus() === 'ready')), [])

  const togglePy = (on: boolean) => {
    setShowPy(on)
    try { localStorage.setItem(PY_KEY, on ? '1' : '0') } catch {  }
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((pct: number, solved: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'zh')
    finishRound(quiz.level, pct, solved)
  }, [quiz, finishRound, recordEvent])

  const pyToggle = (
    <label className="hg-toggle zs-rom-toggle">
      <input type="checkbox" checked={showPy} onChange={(e) => togglePy(e.target.checked)} />
      Hiện pinyin
    </label>
  )

  if (quiz) {
    const meta = LEVELS.find((l) => l.id === quiz.level)!
    return (
      <div className="hg-lab zs-lab">
        {pyToggle}
        <BuildQuiz
          key={quiz.items.map((s) => s.zh).join('')}
          items={quiz.items}
          title={meta.label}
          canHear={canHear}
          showPy={showPy}
          onFinish={onFinish}
          onAgain={() => setQuiz({ ...quiz, items: buildRound(quiz.level) })}
          onBack={back}
        />
      </div>
    )
  }

  return (
    <div className="hg-lab zs-lab">
      <div className="grammar-intro">
        <Icon name="shuffle" size={20} />
        <div>
          <b>Ghép câu tiếng Trung — giống tiếng Việt, trừ ba chỗ</b>
          <p>
            <ZhText text="Tiếng Trung cũng nói Chủ – Động – Tân như tiếng Việt (我吃饭 = tôi ăn cơm), nên phần lớn câu xếp đúng ngay. Ba chỗ bị ngược: nơi chốn (在…) và thời gian đứng trước động từ, còn định ngữ + 的 đứng trước danh từ." />
          </p>
          <div className="hg-stats">
            <span><b>{state.solved}</b> câu đã tự ghép đúng</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <section className="zs-demo" aria-labelledby="zs-demo-h">
        <div className="section-title" id="zs-demo-h"><span className="pin" /> Ba chỗ ngược với tiếng Việt</div>
        <div className="zs-demo-rows">
          {CONTRASTS.map((c) => (
            <div key={c.title} className="zs-demo-row">
              <span className="zs-demo-lang">{c.title}</span>
              <div className="zs-demo-cells">
                <span className="zs-cell r0"><b>{c.vi}</b><small>tiếng Việt</small></span>
                <Icon name="arrow-right" size={14} />
                <button
                  type="button"
                  className={'zs-cell r2' + (canHear ? ' on' : '')}
                  onClick={canHear ? () => speakZH(c.zh.replace(/ · /g, '，'), 0.8) : undefined}
                  tabIndex={canHear ? 0 : -1}
                >
                  <b lang="zh">{c.zh}</b>
                  <small>{(showPy && pinyinOf(c.zh)) || c.note}</small>
                </button>
              </div>
            </div>
          ))}
        </div>
        <ul className="zs-rules">
          <li><ZhText text="Trật tự quen dùng: chủ ngữ → thời gian → nơi chốn (在…) → động từ → tân ngữ: 我明天在家看书。" /></li>
          <li><ZhText text="Phó từ 也, 都, 很, 不 đứng ngay trước động từ / tính từ: 我们都是学生。" /></li>
          <li><ZhText text="Câu hỏi có / không chỉ cần thêm 吗 ở cuối, không đảo trật tự: 你是学生吗？" /></li>
        </ul>
      </section>

      <section className="zs-practice" ref={practiceRef} aria-labelledby="zs-practice-h">
        <div className="zs-practice-head">
          <div className="section-title" id="zs-practice-h"><span className="pin" /> Luyện tập</div>
          {pyToggle}
        </div>
        <div className="hg-practice-pick zs-levels">
          {LEVELS.map((l) => {
            const best = state.best[l.id]
            return (
              <button
                key={l.id}
                className={'hg-pool zs-level' + ((best ?? 0) >= MASTERY ? ' done' : '')}
                onClick={() => setQuiz({ level: l.id, items: buildRound(l.id) })}
              >
                <Icon name={l.id === 'hard' ? 'book' : 'cards'} size={18} />
                <b>{l.label}</b>
                <span><ZhText text={l.desc} /></span>
                <small className="zs-level-best">
                  {best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · 8 câu · kho {poolFor(l.id).length} câu
                </small>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
