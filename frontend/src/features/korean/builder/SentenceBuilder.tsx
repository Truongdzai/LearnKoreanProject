import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { koreanVoiceStatus, onVoicesChanged, speakKO } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import KoText from '../numbers/KoText'
import BuildQuiz from './BuildQuiz'
import { LEVELS, buildRound, poolFor, type LevelId, type Sentence } from './sentences'
import { MASTERY, useOrderProgress } from './progress'
import './styles.css'

const ROM_KEY = 'vyling.ko.order.rom'

function readRom(): boolean {
  try { return localStorage.getItem(ROM_KEY) === '1' } catch { return false }
}

// Một câu mẫu đặt song song hai thứ tự để thấy động từ chạy xuống cuối
const DEMO: { vi: string; ko: string; role: string }[] = [
  { vi: 'Tôi', ko: '저는', role: 'chủ đề' },
  { vi: 'ăn', ko: '먹어요', role: 'động từ' },
  { vi: 'cơm', ko: '밥을', role: 'tân ngữ' },
  { vi: 'ở nhà hàng', ko: '식당에서', role: 'nơi chốn' },
]
const KO_ORDER = [0, 3, 2, 1]

export default function SentenceBuilder() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useOrderProgress()
  const [canHear, setCanHear] = useState(() => koreanVoiceStatus() === 'ready')
  const [showRom, setShowRom] = useState(readRom)
  const [quiz, setQuiz] = useState<{ level: LevelId; items: Sentence[] } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(koreanVoiceStatus() === 'ready')), [])

  const toggleRom = (on: boolean) => {
    setShowRom(on)
    try { localStorage.setItem(ROM_KEY, on ? '1' : '0') } catch {  }
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((pct: number, solved: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'ko')
    if (finishRound(quiz.level, pct, solved)) recordEvent('grammar', 1, 0, 0, 'ko')
  }, [quiz, finishRound, recordEvent])

  const romToggle = (
    <label className="hg-toggle ks-rom-toggle">
      <input type="checkbox" checked={showRom} onChange={(e) => toggleRom(e.target.checked)} />
      Hiện phiên âm Latin
    </label>
  )

  if (quiz) {
    const meta = LEVELS.find((l) => l.id === quiz.level)!
    return (
      <div className="ks-lab">
        {romToggle}
        <BuildQuiz
          key={quiz.items[0].ko + quiz.items.length}
          items={quiz.items}
          level={quiz.level}
          title={meta.label}
          canHear={canHear}
          showRom={showRom}
          onFinish={onFinish}
          onAgain={() => setQuiz({ ...quiz, items: buildRound(quiz.level) })}
          onBack={back}
        />
      </div>
    )
  }

  const demoKo = KO_ORDER.map((k) => DEMO[k].ko).join(' ') + '.'

  return (
    <div className="ks-lab">
      <div className="grammar-intro">
        <Icon name="shuffle" size={20} />
        <div>
          <b>Ghép câu — động từ luôn đứng cuối</b>
          <p>
            <KoText text="Tiếng Việt nói Chủ – Động – Tân (Tôi ăn cơm), tiếng Hàn nói Chủ – Tân – Động (저는 밥을 먹어요). Nhờ trợ từ đánh dấu vai trò, các cụm trước động từ còn được đổi chỗ khá tự do — nhưng động từ / tính từ thì luôn ở cuối." />
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

      <section className="ks-demo" aria-labelledby="ks-demo-h">
        <div className="section-title" id="ks-demo-h"><span className="pin" /> Cùng một câu, hai trật tự</div>
        <div className="ks-demo-rows">
          <div className="ks-demo-row">
            <span className="ks-demo-lang">Tiếng Việt</span>
            <div className="ks-demo-cells">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className={`ks-cell r${k}`}>
                  <b>{DEMO[k].vi}</b>
                  <small>{DEMO[k].role}</small>
                </span>
              ))}
            </div>
          </div>
          <div className="ks-demo-row">
            <span className="ks-demo-lang">Tiếng Hàn</span>
            <div className="ks-demo-cells">
              {KO_ORDER.map((k) => (
                <span key={k} className={`ks-cell r${k}`}>
                  <b lang="ko">{DEMO[k].ko}</b>
                  <small>{DEMO[k].role}</small>
                </span>
              ))}
              {canHear && (
                <button type="button" className="kn-icon-btn" onClick={() => speakKO(demoKo, 0.85)} aria-label="Nghe câu tiếng Hàn">
                  <Icon name="volume" size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
        <ul className="ks-rules">
          <li><KoText text="Động từ, tính từ (đã chia đuôi …요, …니다) đứng cuối câu." /></li>
          <li><KoText text="Trợ từ dính ngay sau danh từ nó đánh dấu: 저 + 는, 밥 + 을, 식당 + 에서." /></li>
          <li><KoText text="Từ bổ nghĩa đứng trước danh từ: 이 사람, 한국 음식, 맛있는 김치 — không tách rời được." /></li>
          <li><KoText text="Thứ tự quen dùng: (thời gian) → chủ ngữ → nơi chốn → tân ngữ → động từ. 저는 내일 학교에서 친구를 만나요." /></li>
        </ul>
      </section>

      <section className="ks-practice" ref={practiceRef} aria-labelledby="ks-practice-h">
        <div className="ks-practice-head">
          <div className="section-title" id="ks-practice-h"><span className="pin" /> Luyện tập</div>
          {romToggle}
        </div>
        <div className="hg-practice-pick ks-levels">
          {LEVELS.map((l) => {
            const best = state.best[l.id]
            return (
              <button
                key={l.id}
                className={'hg-pool ks-level' + ((best ?? 0) >= MASTERY ? ' done' : '')}
                onClick={() => setQuiz({ level: l.id, items: buildRound(l.id) })}
              >
                <Icon name={l.id === 'hard' ? 'note' : l.id === 'mid' ? 'book' : 'cards'} size={18} />
                <b>{l.label}</b>
                <span><KoText text={l.desc} /></span>
                <small className="ks-level-best">
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
