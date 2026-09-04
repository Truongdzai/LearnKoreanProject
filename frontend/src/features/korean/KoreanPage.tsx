import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { KO_UNITS, KO_ALL_WORDS } from '@/data/koreanCore'
import { speakKO } from '@/core/tts'
import VocabLab from '../english/components/vocab/VocabLab'
import VocabQuiz from '../english/components/VocabQuiz'
import PronunciationLab from '../english/components/PronunciationLab'
import { KO_PRON_GROUPS } from '@/data/koreanPronunciation'
import { recordWeekQuiz } from '../english/progress'
import KoreanRoadmap from './KoreanRoadmap'
import Expectations from '../english/components/Expectations'
import { useTabs } from '@/core/a11y'
import ViContentNote from '../shared/ViContentNote'
import { useTabParam } from '@/core/hooks/useTabParam'

type Tab = 'program' | 'learn' | 'pron' | 'quiz'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'program', label: 'Lộ trình', icon: 'map' },
  { id: 'learn', label: 'Học từ vựng', icon: 'cards' },
  { id: 'pron', label: 'Phát âm', icon: 'mic' },
  { id: 'quiz', label: 'Kiểm tra', icon: 'target' },
]
const TAB_IDS = TABS.map((t) => t.id)

interface WeekQuiz {
  week: number
  units: string[]
  pass: number
}

export default function KoreanPage() {
  const [tab, setTab] = useTabParam<Tab>(TAB_IDS, 'program')
  const [learnUnit, setLearnUnit] = useState<string | undefined>(undefined)
  const [pronGroup, setPronGroup] = useState<string | undefined>(undefined)
  const [weekQuiz, setWeekQuiz] = useState<WeekQuiz | null>(null)

  const openLearn = (unitId?: string) => {
    setLearnUnit(unitId)
    setTab('learn')
  }

  const openPron = (groupId?: string) => {
    setPronGroup(groupId)
    setTab('pron')
  }

  const openQuiz = (week: number, units: string[], pass: number) => {
    setWeekQuiz({ week, units, pass })
    setTab('quiz')
  }

  const pickTab = (t: Tab) => {
    if (t === 'quiz') setWeekQuiz(null)
    if (t === 'learn') setLearnUnit(undefined)
    if (t === 'pron') setPronGroup(undefined)
    setTab(t)
  }

  const tabs = useTabs('ko', TAB_IDS, tab, pickTab, 'Tiếng Hàn 3 tháng')

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Hàn · lộ trình 90 ngày</h2>
        <div className="meta">
          Phương pháp ICES (Hình ảnh · Liên tưởng · Ví dụ · Âm thanh) — {KO_ALL_WORDS.length} từ lõi qua {KO_UNITS.length} chủ đề, học tới đâu lưu thẻ ôn tập tới đó.
        </div>
      </div>

      <ViContentNote />

      <Expectations
        lang="ko"
        spec={{
          daily: '40–60 phút mỗi ngày',
          hours: '60–90 giờ',
          words: KO_ALL_WORDS.length,
          can: [
            'Đọc thông Hangul và đánh vần được từ mới chưa gặp',
            'Tự giới thiệu, hỏi tuổi, nghề nghiệp, xưng hô đúng vai vế',
            'Gọi món, mua sắm, mặc cả, hỏi đường, bắt xe',
            'Đi khám bệnh, mua thuốc, tả chỗ đau',
            'Làm thủ tục cơ bản: ngân hàng, bưu điện, thuê phòng',
            'Trò chuyện đơn giản với người Hàn chịu nói chậm',
            'Vốn từ đủ cho TOPIK cấp 1 (khoảng 800 từ)',
          ],
          cannot: [
            'Nghe người Hàn nói chuyện với nhau ở tốc độ thật',
            'Xem phim, chương trình truyền hình mà không cần phụ đề',
            'Tranh luận, trình bày ý kiến dài hoặc nói chuyện công việc',
            'Đọc báo, hợp đồng, tài liệu chuyên ngành',
            'Thi chắc TOPIK cấp 2 (cần thêm khoảng 700–1.000 từ)',
            'Dùng thành thạo kính ngữ trong tình huống trang trọng',
          ],
          next: 'Sau 90 ngày: tiếp tục bằng phần luyện thi TOPIK, nghe video dài hơn trong vùng vừa sức i+1, và luyện nói với AI mỗi ngày. Ngôn ngữ là việc của nhiều năm — 90 ngày là để bạn không còn sợ nó.',
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
        <KoreanRoadmap onStart={() => openLearn()} onLearn={openLearn} onQuiz={openQuiz} onPron={openPron} />
      )}
      {tab === 'learn' && (
        <VocabLab
          initialUnit={learnUnit}
          units={KO_UNITS}
          speak={speakKO}
          sourceLabel="Korean Core"
          lang="ko"
          title="Từ vựng tiếng Hàn"
        />
      )}
      {tab === 'pron' && (
        <PronunciationLab
          key={pronGroup ?? 'list'}
          initialGroup={pronGroup}
          lang="ko"
          groups={KO_PRON_GROUPS}
          speak={speakKO}
          intro="Mỗi nhóm là một lỗi người Việt hay mắc khi nói tiếng Hàn: nghe mẫu → phân biệt bằng tai → ghi âm hai bản để đối chiếu → tự chấm theo 5 tiêu chí."
        />
      )}
      {tab === 'quiz' && (weekQuiz ? (
        <VocabQuiz
          key={`kw${weekQuiz.week}`}
          units={weekQuiz.units}
          allUnits={KO_UNITS}
          allWords={KO_ALL_WORDS}
          speak={speakKO}
          lang="ko"
          heading={`Bài kiểm tra Tuần ${weekQuiz.week}`}
          passPct={weekQuiz.pass}
          onFinish={(pct) => recordWeekQuiz(weekQuiz.week, pct, 'ko')}
          onBack={() => { setWeekQuiz(null); setTab('program') }}
        />
      ) : (
        <VocabQuiz allUnits={KO_UNITS} allWords={KO_ALL_WORDS} speak={speakKO} lang="ko" />
      ))}
      </div>
    </div>
  )
}
