import { useCallback, useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { koreanVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import KoText from './KoText'
import NumberQuiz from './NumberQuiz'
import { CounterTable, FourDigits, TwoSystems, WhichSystem } from './Rules'
import { buildRound, type ModeId, type NQuestion } from './drills'
import { MASTERY, MODE_IDS, useNumbersProgress } from './progress'
import './styles.css'

const MODES: { id: ModeId; label: string; icon: IconName; desc: string }[] = [
  { id: 'price', label: 'Đọc giá', icon: 'coin', desc: 'Nhìn bảng giá, chọn cách đọc đúng. Bẫy quen thuộc: 삼십오천, 일만, đọc tiền bằng số thuần Hàn.' },
  { id: 'listen', label: 'Nghe số', icon: 'headphones', desc: 'Nghe giá tiền, năm, số điện thoại rồi gõ lại chữ số.' },
  { id: 'count', label: 'Đếm đồ vật', icon: 'cards', desc: 'Đếm hình rồi chọn: 사과 세 개 hay 사과 삼 개, 셋 개, 세 명?' },
  { id: 'mixed', label: 'Giờ · ngày · tuổi · điện thoại', icon: 'clock', desc: 'Trộn bốn tình huống hằng ngày: 세 시 반, 유월 육일, 스무 살, 공일공.' },
]

const ROM_KEY = 'vyling.ko.numbers.rom'

function readRom(): boolean {
  try { return localStorage.getItem(ROM_KEY) !== '0' } catch { return true }
}

export default function NumbersLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useNumbersProgress()
  // Chỉ mở phần nghe khi máy chắc chắn có giọng tiếng Hàn, không thì người học bị kẹt ở câu không phát tiếng.
  const [canHear, setCanHear] = useState(() => koreanVoiceStatus() === 'ready')
  const [mode, setMode] = useState<ModeId | null>(null)
  const [quiz, setQuiz] = useState<NQuestion[]>([])
  const [showRom, setShowRom] = useState(readRom)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(koreanVoiceStatus() === 'ready')), [])

  const start = (m: ModeId) => {
    setMode(m)
    setQuiz(buildRound(m))
  }

  const back = () => {
    setMode(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const toggleRom = (on: boolean) => {
    setShowRom(on)
    try { localStorage.setItem(ROM_KEY, on ? '1' : '0') } catch {  }
  }

  const onFinish = useCallback((pct: number) => {
    if (!mode) return
    recordEvent('review', 1, 0, 0, 'ko')
    if (finishRound(mode, pct)) recordEvent('grammar', 1, 0, 0, 'ko')
  }, [mode, finishRound, recordEvent])

  const romToggle = (
    <label className="hg-toggle kn-rom-toggle">
      <input type="checkbox" checked={showRom} onChange={(e) => toggleRom(e.target.checked)} />
      Hiện phiên âm Latin
    </label>
  )

  if (mode && quiz.length) {
    const meta = MODES.find((m) => m.id === mode)!
    return (
      <div className="kn-lab">
        {romToggle}
        <NumberQuiz
          key={quiz[0].id}
          questions={quiz}
          title={meta.label}
          best={state.best[mode]}
          canHear={canHear}
          showRom={showRom}
          onFinish={onFinish}
          onAgain={() => setQuiz(buildRound(mode))}
          onBack={back}
        />
      </div>
    )
  }

  const mastered = MODE_IDS.filter((id) => (state.best[id] ?? 0) >= MASTERY).length
  const visibleModes = MODES.filter((m) => m.id !== 'listen' || canHear)

  return (
    <div className="kn-lab">
      <div className="grammar-intro">
        <Icon name="chart" size={20} />
        <div>
          <b>Số đếm tiếng Hàn — hai hệ số, nhóm 4 chữ số và lượng từ</b>
          <p>
            Người Việt hay vấp ba chỗ: đọc 35.000 thành "35 nghìn" (tiếng Hàn đếm theo vạn), lẫn số Hán với số thuần Hàn,
            và quên lượng từ. Đọc bốn thẻ quy tắc ngắn bên dưới rồi luyện theo lượt 10 câu.
          </p>
          <div className="hg-stats">
            <span><b>{mastered}</b>/{MODE_IDS.length} chế độ đạt {MASTERY}%</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <div className="kn-rules">
        <TwoSystems canHear={canHear} />
        <WhichSystem />
        <FourDigits canHear={canHear} />
        <CounterTable canHear={canHear} />
      </div>

      <section className="kn-practice" ref={practiceRef} aria-labelledby="kn-practice-h">
        <div className="kn-practice-head">
          <div className="section-title" id="kn-practice-h"><span className="pin" /> Luyện tập</div>
          {romToggle}
        </div>
        <div className="hg-practice-pick kn-modes">
          {visibleModes.map((m) => {
            const best = state.best[m.id]
            return (
              <button key={m.id} className={'hg-pool kn-mode' + ((best ?? 0) >= MASTERY ? ' done' : '')} onClick={() => start(m.id)}>
                <Icon name={m.icon} size={18} />
                <b>{m.label}</b>
                <span><KoText text={m.desc} /></span>
                <small className="kn-mode-best">{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · 10 câu</small>
              </button>
            )
          })}
        </div>
        {!canHear && (
          <p className="hg-note kn-no-voice">
            <Icon name="headphones" size={14} /> Phần <b>Nghe số</b> đang ẩn vì máy chưa có giọng đọc tiếng Hàn. Cài giọng
            Korean (<span lang="ko">한국어</span>) cho máy rồi tải lại trang là có.
          </p>
        )}
      </section>
    </div>
  )
}
