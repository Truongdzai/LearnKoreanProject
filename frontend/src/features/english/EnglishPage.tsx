import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import ProgramOverview from './components/ProgramOverview'
import IcesLearn from './components/IcesLearn'
import GrammarLessons from './components/GrammarLessons'
import PronunciationLab from './components/PronunciationLab'
import VocabQuiz from './components/VocabQuiz'
import EnglishSummary from './components/EnglishSummary'
import { recordWeekQuiz } from './progress'
import Expectations from './components/Expectations'
import { ALL_WORDS, UNITS } from '@/data/englishCore'
import { useTabs } from '@/core/a11y'
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

  const tabs = useTabs('en', TAB_IDS, tab, pickTab, 'Tiếng Anh 3 tháng')

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Anh · 3 tháng</h2>
        <div className="meta">Quy tắc 3C + phương pháp ICES + ôn tập ngắt quãng.</div>
      </div>

      <ViContentNote />

      <Expectations
        lang="en"
        spec={{
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
          next: 'Sau 90 ngày: vào phần luyện thi TOEIC theo lộ trình 60 ngày, tăng dần độ dài video trong vùng vừa sức i+1, và luyện nói với AI mỗi ngày để rút ngắn độ trễ phản xạ.',
        }}
      />

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
          onStart={() => openLearn()}
          onLearn={openLearn}
          onQuiz={openQuiz}
          onSummary={() => setTab('summary')}
          onGrammar={openGrammar}
          onPron={openPron}
        />
      )}
      {tab === 'learn' && <IcesLearn initialUnit={learnUnit} units={UNITS} />}
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
