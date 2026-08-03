import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { ZH_UNITS, ZH_ALL_WORDS } from '@/data/chineseCore'
import { ZH_PRON_GROUPS } from '@/data/chinesePronunciation'
import { speakZH } from '@/core/tts'
import IcesLearn from '../english/components/IcesLearn'
import VocabQuiz from '../english/components/VocabQuiz'
import PronunciationLab from '../english/components/PronunciationLab'
import { recordWeekQuiz } from '../english/progress'
import ChineseRoadmap from './ChineseRoadmap'
import Expectations from '../english/components/Expectations'
import { useTabs } from '@/core/a11y'
import ViContentNote from '../shared/ViContentNote'
import { useAppStore } from '@/store/app.store'
import { HSK_BANK } from '@/data/hskCore'

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

export default function ChinesePage() {
  const { setView } = useAppStore()
  const [tab, setTab] = useState<Tab>('program')
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

  const tabs = useTabs('zh', TAB_IDS, tab, pickTab, 'Tiếng Trung 3 tháng')

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Trung · lộ trình 90 ngày</h2>
        <div className="meta">
          Phương pháp ICES (Hình ảnh · Liên tưởng · Ví dụ · Âm thanh) — {ZH_ALL_WORDS.length} từ lõi qua {ZH_UNITS.length} chủ đề,
          mẹo nhớ bám âm Hán–Việt, có pinyin và nghe đọc từng từ.
        </div>
      </div>

      <ViContentNote />

      <div className="zh-hanviet">
        <Icon name="bulb" size={16} />
        <span>
          <b>Lợi thế của người Việt:</b> hơn một nửa từ tiếng Trung có âm Hán–Việt quen thuộc —
          学生 là <i>học sinh</i>, 朋友 là <i>bằng hữu</i>, 再见 là <i>tái kiến</i>. Mỗi thẻ từ ở đây
          đều chỉ ra cây cầu đó, nhớ một chữ là mở ra cả loạt từ ghép.
        </span>
      </div>

      <Expectations
        lang="zh"
        spec={{
          daily: '40–60 phút mỗi ngày',
          hours: '60–90 giờ',
          words: ZH_ALL_WORDS.length,
          can: [
            'Đọc được pinyin và tự đánh vần từ mới chưa gặp',
            'Nói đúng bốn thanh điệu ở mức người bản xứ nghe hiểu',
            'Tự giới thiệu, hỏi tuổi, nghề nghiệp, kể về gia đình',
            'Gọi món, mua sắm, mặc cả, hỏi đường, bắt xe',
            'Đi khám bệnh, mua thuốc, tả chỗ đau',
            'Nhận mặt khoảng 300 chữ Hán thông dụng nhất',
            'Vốn từ đủ cho kỳ thi HSK 2 (chuẩn 300 từ)',
          ],
          cannot: [
            'Nghe người Trung Quốc nói chuyện với nhau ở tốc độ thật',
            'Xem phim, chương trình truyền hình mà không cần phụ đề',
            'Đọc báo hay tin nhắn dài (cần khoảng 1.500–2.000 chữ)',
            'Viết tay chữ Hán đúng nét — lộ trình này ưu tiên nghe nói và nhận mặt chữ',
            'Thi chắc HSK 3–4 (cần thêm khoảng 300–900 từ)',
            'Bàn chuyện công việc chuyên môn hay tranh luận dài',
          ],
          next: 'Sau 90 ngày: xem video tiếng Trung trong vùng vừa sức i+1, luyện nói với AI mỗi ngày, và nới vốn từ lên mốc HSK 3. Chữ Hán là chuyện của nhiều năm — 90 ngày là để bạn không còn sợ nó.',
        }}
      />

      <div className="en-principle">
        <Icon name="trophy" size={20} />
        <div>
          <b>Muốn lấy chứng chỉ HSK?</b> Lộ trình này dạy để nói được; còn dạng câu ra thi thì học ở trang
          <b> Luyện thi HSK</b>: {HSK_BANK.capsules} viên ngữ pháp HSK 1–2, {HSK_BANK.listening} câu 听力,
          {' '}{HSK_BANK.reading} câu 阅读 và đề thi thử quy đổi thang 200.
          <div className="zh-hsk-cta">
            <button className="btn-primary sm" onClick={() => setView('hsk')}>
              <Icon name="book" size={15} /> Mở trang Luyện thi HSK
            </button>
          </div>
        </div>
      </div>

      <div className="en-tabs" {...tabs.list}>
        {TABS.map((t) => (
          <button key={t.id} {...tabs.tab(t.id)} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => pickTab(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div {...tabs.panel(tab)}>
        {tab === 'program' && (
          <ChineseRoadmap onStart={() => openLearn()} onLearn={openLearn} onQuiz={openQuiz} onPron={openPron} />
        )}
        {tab === 'learn' && (
          <IcesLearn initialUnit={learnUnit} units={ZH_UNITS} speak={speakZH} sourceLabel="Chinese Core" lang="zh" />
        )}
        {tab === 'pron' && (
          <PronunciationLab
            key={pronGroup ?? 'list'}
            initialGroup={pronGroup}
            lang="zh"
            groups={ZH_PRON_GROUPS}
            speak={speakZH}
            intro="Mỗi nhóm là một lỗi người Việt hay mắc khi nói tiếng Trung: nghe mẫu → phân biệt bằng tai → đọc lại cho máy chấm."
          />
        )}
        {tab === 'quiz' && (weekQuiz ? (
          <VocabQuiz
            key={`zw${weekQuiz.week}`}
            units={weekQuiz.units}
            allUnits={ZH_UNITS}
            allWords={ZH_ALL_WORDS}
            speak={speakZH}
            lang="zh"
            heading={`Bài kiểm tra Tuần ${weekQuiz.week}`}
            passPct={weekQuiz.pass}
            onFinish={(pct) => recordWeekQuiz(weekQuiz.week, pct, 'zh')}
            onBack={() => { setWeekQuiz(null); setTab('program') }}
          />
        ) : (
          <VocabQuiz allUnits={ZH_UNITS} allWords={ZH_ALL_WORDS} speak={speakZH} lang="zh" />
        ))}
      </div>
    </div>
  )
}
