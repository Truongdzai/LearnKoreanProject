import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import ProgramOverview from './components/ProgramOverview'
import VocabLab from './components/vocab/VocabLab'
import GrammarLessons from './components/GrammarLessons'
import PronunciationLab from './components/PronunciationLab'
import VocabQuiz from './components/VocabQuiz'
import EnglishSummary from './components/EnglishSummary'
import { recordWeekQuiz } from './progress'
import Expectations, { type ExpectationSpec } from './components/Expectations'
import { ALL_WORDS, UNITS, type RoadmapMode } from '@/data/englishCore'
import { useTabs } from '@/core/a11y'
import { useServerPlan } from '@/core/hooks/useServerPlan'
import ViContentNote from '../shared/ViContentNote'

type Tab = 'program' | 'learn' | 'grammar' | 'pron' | 'quiz' | 'summary'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'program', label: 'Lộ trình', icon: 'map' },
  { id: 'learn', label: 'Học từ vựng', icon: 'cards' },
  { id: 'grammar', label: 'Ngữ pháp', icon: 'book' },
  { id: 'pron', label: 'Phát âm', icon: 'mic' },
  { id: 'quiz', label: 'Kiểm tra', icon: 'target' },
  { id: 'summary', label: 'Tóm tắt & xuất', icon: 'note' },
]
const TAB_IDS = TABS.map((t) => t.id)

interface WeekQuiz {
  week: number
  units: string[]
  pass: number
}

interface ModeState {
  mode: RoadmapMode | null
}

const normalizeMode = (raw: unknown): ModeState => {
  const m = (raw as Partial<ModeState> | null)?.mode
  return { mode: m === 'boot' || m === 'lite' ? m : null }
}

const SPEC_LITE: ExpectationSpec = {
  daily: '45–60 phút mỗi ngày',
  hours: '70–90 giờ',
  words: ALL_WORDS.length,
  can: [
    'Hiểu khoảng 90% từ trong hội thoại đời thường',
    'Tự giới thiệu, kể việc đã làm, nói dự định sắp tới',
    'Xoay xở khi đi du lịch: sân bay, khách sạn, nhà hàng, hỏi đường',
    'Viết email ngắn, tin nhắn công việc đơn giản',
    'Đọc hiểu bài ngắn và tin tức viết cho người học',
    'Nắm 18 điểm ngữ pháp lõi từ to be tới câu điều kiện',
  ],
  cannot: [
    'Nghe phim, podcast bản ngữ ở tốc độ thật mà không cần phụ đề',
    'Họp hành, thuyết trình hay đàm phán trôi chảy',
    'Đọc tài liệu chuyên ngành, hợp đồng, báo chí học thuật',
    'Đạt điểm TOEIC cao chỉ nhờ từ vựng — cần luyện riêng theo dạng đề',
    'Phản xạ nói tự nhiên không cần nghĩ trước trong đầu',
  ],
  next: 'Sau 90 ngày (70–90 giờ) bạn ở khoảng A2 — nền móng tốt, nhưng "giỏi" thật sự (B2) cần tổng 500–600 giờ. Giai đoạn kế: hoàn tất lộ trình TOEIC 60 ngày, tăng dần độ dài video trong vùng vừa sức i+1, luyện nói với AI mỗi ngày và giữ SRS mỗi tuần — thêm 6–9 tháng đều đặn là chạm mức khá–giỏi. Muốn giỏi ngay trong 90 ngày? Chuyển sang chế độ Bootcamp 7–8 giờ/ngày ở tab Lộ trình.',
}

const SPEC_BOOT: ExpectationSpec = {
  daily: '7–8 giờ mỗi ngày (toàn thời gian)',
  hours: '630–700 giờ',
  words: ALL_WORDS.length,
  verdict: 'đủ giờ để một người mất gốc chạm mức giỏi giao tiếp (B1 vững – B2) — nếu bạn theo được nhịp',
  can: [
    'Nghe hiểu video, podcast chủ đề quen ở tốc độ thật không cần phụ đề',
    'Trò chuyện 15–20 phút liền mạch: kể chuyện, trình bày ý kiến có lớp lang',
    'Phỏng vấn xin việc cơ bản, họp ngắn có chuẩn bị trước',
    'Đọc báo phổ thông, email dài; viết email công việc và đoạn văn 150–200 từ',
    'TOEIC quanh 550–700 tuỳ nền xuất phát (đã qua trọn lộ trình 60 ngày + 2 lần thi thử)',
    '3000 từ chủ động, 18 điểm ngữ pháp, 13 nhóm âm phát chuẩn',
  ],
  cannot: [
    'Xem phim hài kịch đủ mọi giọng, nghe tiếng lóng dày đặc không phụ đề',
    'Đàm phán, thuyết trình chuyên sâu trước đám đông',
    'Đọc tài liệu học thuật, hợp đồng pháp lý',
    'Giọng tự nhiên như người bản xứ — C1 cần thêm ~6–12 tháng "sống trong tiếng Anh"',
  ],
  next: 'Sau tốt nghiệp: hạ về 1–2 giờ/ngày để giữ và mở rộng — mỗi ngày 1 video không phụ đề, nói AI duy trì phản xạ, đọc theo sở thích. Mục tiêu C1 cần thêm ~400–500 giờ nữa, nhưng phần khó nhất (0 → nói được) bạn đã đi qua rồi.',
}

function readJump(): { tab?: string; unit?: string } | null {
  try {
    const raw = sessionStorage.getItem('vyling.en.jump')
    if (!raw) return null
    sessionStorage.removeItem('vyling.en.jump')
    return JSON.parse(raw) as { tab?: string; unit?: string }
  } catch {
    return null
  }
}

export default function EnglishPage() {
  const [jump] = useState(readJump)
  const [tab, setTab] = useState<Tab>(jump?.tab === 'learn' ? 'learn' : 'program')
  const [learnUnit, setLearnUnit] = useState<string | undefined>(jump?.unit)
  const [grammarLesson, setGrammarLesson] = useState<string | undefined>(undefined)
  const [pronGroup, setPronGroup] = useState<string | undefined>(undefined)
  const [weekQuiz, setWeekQuiz] = useState<WeekQuiz | null>(null)
  const { state: modeState, mutate: mutateMode } = useServerPlan<ModeState>(
    'enmode', 'vyling.en.mode', normalizeMode, (s) => s.mode == null,
  )
  const mode: RoadmapMode = modeState.mode ?? 'lite'
  const setMode = (m: RoadmapMode) => mutateMode(() => ({ mode: m }))

  const openLearn = (unitId?: string) => {
    setLearnUnit(unitId)
    setTab('learn')
  }

  const openGrammar = (lessonId?: string) => {
    setGrammarLesson(lessonId)
    setTab('grammar')
  }

  const openQuiz = (week: number, units: string[], pass: number) => {
    setWeekQuiz({ week, units, pass })
    setTab('quiz')
  }

  const openPron = (groupId?: string) => {
    setPronGroup(groupId)
    setTab('pron')
  }

  const pickTab = (t: Tab) => {
    if (t === 'quiz') setWeekQuiz(null)
    if (t === 'learn') setLearnUnit(undefined)
    if (t === 'grammar') setGrammarLesson(undefined)
    if (t === 'pron') setPronGroup(undefined)
    setTab(t)
  }

  const tabs = useTabs('en', TAB_IDS, tab, pickTab, 'Tiếng Anh giao tiếp')

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Anh giao tiếp</h2>
        <div className="meta">Quy tắc 3C + phương pháp ICES + ôn tập ngắt quãng · giọng đọc US &amp; UK.</div>
      </div>

      <ViContentNote />

      <Expectations lang="en" spec={mode === 'boot' ? SPEC_BOOT : SPEC_LITE} />

      <div className="en-tabs" {...tabs.list}>
        {TABS.map((t) => (
          <button key={t.id} {...tabs.tab(t.id)} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => pickTab(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div {...tabs.panel(tab)}>
      {tab === 'program' && (
        <ProgramOverview
          mode={mode}
          onMode={setMode}
          onStart={() => openLearn()}
          onLearn={openLearn}
          onQuiz={openQuiz}
          onSummary={() => setTab('summary')}
          onGrammar={openGrammar}
          onPron={openPron}
        />
      )}
      {tab === 'learn' && <VocabLab initialUnit={learnUnit} units={UNITS} title="Từ vựng tiếng Anh giao tiếp" />}
      {tab === 'grammar' && <GrammarLessons key={grammarLesson ?? 'list'} initialLesson={grammarLesson} />}
      {tab === 'pron' && <PronunciationLab key={pronGroup ?? 'list'} initialGroup={pronGroup} />}
      {tab === 'quiz' && (weekQuiz ? (
        <VocabQuiz
          key={`w${weekQuiz.week}`}
          units={weekQuiz.units}
          allUnits={UNITS}
          allWords={ALL_WORDS}
          heading={`Bài kiểm tra Tuần ${weekQuiz.week}`}
          passPct={weekQuiz.pass}
          onFinish={(pct) => recordWeekQuiz(weekQuiz.week, pct)}
          onBack={() => { setWeekQuiz(null); setTab('program') }}
        />
      ) : (
        <VocabQuiz allUnits={UNITS} allWords={ALL_WORDS} />
      ))}
      {tab === 'summary' && <EnglishSummary />}
      </div>
    </div>
  )
}
