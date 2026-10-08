import { useCallback, useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { chineseVoiceStatus, onVoicesChanged } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import { VoiceNotice } from '../../english/components/PronunciationLab'
import NumQuiz from './NumQuiz'
import { BasicNumbers, Daily, FourDigits, MeasureTable, Traps, ZhText } from './Rules'
import { buildRound, type ModeId, type ZQuestion } from './drills'
import { MASTERY, MODE_IDS, useZhNumbersProgress } from './progress'
import './styles.css'

const MODES: { id: ModeId; label: string; icon: IconName; desc: string }[] = [
  { id: 'price', label: 'Đọc giá', icon: 'coin', desc: 'Nhìn bảng giá, chọn cách đọc đúng. Bẫy quen thuộc: 一百五 với 一百零五, 三十五千, 二块.' },
  { id: 'listen', label: 'Nghe số', icon: 'headphones', desc: 'Nghe giá tiền, năm, số điện thoại rồi gõ lại chữ số.' },
  { id: 'count', label: 'Lượng từ', icon: 'cards', desc: 'Đếm hình rồi chọn: 两本书 hay 二本书, 两本书 hay 两张书?' },
  { id: 'mixed', label: 'Giờ · ngày · thứ · tuổi', icon: 'clock', desc: 'Trộn tình huống hằng ngày: 两点半, 二月十四号, 星期一, 两岁, số điện thoại.' },
]

const PY_KEY = 'vyling.zh.numbers.py'

function readPy(): boolean {
  try { return localStorage.getItem(PY_KEY) !== '0' } catch { return true }
}

export default function NumbersLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useZhNumbersProgress()
  // Chỉ mở phần nghe khi máy chắc chắn có giọng tiếng Trung
  const [canHear, setCanHear] = useState(() => chineseVoiceStatus() === 'ready')
  const [mode, setMode] = useState<ModeId | null>(null)
  const [quiz, setQuiz] = useState<ZQuestion[]>([])
  const [showPy, setShowPy] = useState(readPy)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(chineseVoiceStatus() === 'ready')), [])

  const start = (m: ModeId) => {
    setMode(m)
    setQuiz(buildRound(m))
  }

  const back = () => {
    setMode(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const togglePy = (on: boolean) => {
    setShowPy(on)
    try { localStorage.setItem(PY_KEY, on ? '1' : '0') } catch {  }
  }

  const onFinish = useCallback((pct: number) => {
    if (!mode) return
    recordEvent('review', 1, 0, 0, 'zh')
    finishRound(mode, pct)
  }, [mode, finishRound, recordEvent])

  const pyToggle = (
    <label className="hg-toggle zn-rom-toggle">
      <input type="checkbox" checked={showPy} onChange={(e) => togglePy(e.target.checked)} />
      Hiện pinyin
    </label>
  )

  if (mode && quiz.length) {
    const meta = MODES.find((m) => m.id === mode)!
    return (
      <div className="hg-lab zn-lab">
        {pyToggle}
        <NumQuiz
          key={quiz[0].id}
          questions={quiz}
          title={meta.label}
          best={state.best[mode]}
          canHear={canHear}
          showPy={showPy}
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
    <div className="hg-lab zn-lab">
      <div className="grammar-intro">
        <Icon name="chart" size={20} />
        <div>
          <b>Số đếm tiếng Trung — đếm theo vạn, 零, 两 và lượng từ</b>
          <p>
            <ZhText text="Tin vui: số tiếng Trung chính là số Hán–Việt (十一 thập nhất, 二十 nhị thập). Ba chỗ người Việt hay vấp: đếm theo nghìn thay vì theo vạn (35.000 là 三万五千), quên 零 (一百零五 khác hẳn 一百五), và dùng 二 trước lượng từ (phải là 两个)." />
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

      <VoiceNotice lang="zh" />

      <div className="zn-rules">
        <BasicNumbers canHear={canHear} />
        <Traps canHear={canHear} />
        <FourDigits canHear={canHear} />
        <Daily canHear={canHear} />
        <MeasureTable canHear={canHear} />
      </div>

      <section className="zn-practice" ref={practiceRef} aria-labelledby="zn-practice-h">
        <div className="zn-practice-head">
          <div className="section-title" id="zn-practice-h"><span className="pin" /> Luyện tập</div>
          {pyToggle}
        </div>
        <div className="hg-practice-pick zn-modes">
          {visibleModes.map((m) => {
            const best = state.best[m.id]
            return (
              <button key={m.id} className={'hg-pool zn-mode' + ((best ?? 0) >= MASTERY ? ' done' : '')} onClick={() => start(m.id)}>
                <Icon name={m.icon} size={18} />
                <b>{m.label}</b>
                <span><ZhText text={m.desc} /></span>
                <small className="zn-mode-best">{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · 10 câu</small>
              </button>
            )
          })}
        </div>
        {!canHear && (
          <p className="hg-note zn-no-voice">
            <Icon name="headphones" size={14} /> Phần <b>Nghe số</b> đang ẩn vì máy chưa có giọng đọc tiếng Trung. Cài giọng
            Chinese (<span lang="zh">中文</span>) cho máy rồi tải lại trang là có.
          </p>
        )}
      </section>
    </div>
  )
}
