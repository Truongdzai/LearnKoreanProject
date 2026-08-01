import { useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { ZH_UNITS, ZH_ALL_WORDS, ZH_TARGET_WORDS } from '@/data/chineseCore'
import { speakLang } from '@/core/tts'
import IcesLearn from '../english/components/IcesLearn'
import VocabQuiz from '../english/components/VocabQuiz'
import { useTabs } from '@/core/a11y'
import ViContentNote from '../shared/ViContentNote'

type Tab = 'learn' | 'quiz'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'learn', label: 'Học từ vựng', icon: 'cards' },
  { id: 'quiz', label: 'Kiểm tra', icon: 'target' },
]
const TAB_IDS = TABS.map((t) => t.id)

const speakZH = (text: string, rate = 0.9) => speakLang(text, 'zh-CN', rate)

export default function ChinesePage() {
  const [tab, setTab] = useState<Tab>('learn')
  const [learnUnit, setLearnUnit] = useState<string | undefined>(undefined)

  const pickTab = (t: Tab) => {
    if (t === 'learn') setLearnUnit(undefined)
    setTab(t)
  }
  const tabs = useTabs('zh', TAB_IDS, tab, pickTab, 'Tiếng Trung 3 tháng')

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="globe" /> Tiếng Trung · từ số 0</h2>
        <div className="meta">
          Phương pháp ICES — {ZH_ALL_WORDS.length} từ lõi qua {ZH_UNITS.length} chủ đề, mẹo nhớ bám
          âm Hán–Việt, có pinyin và nghe đọc từng từ.
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

      <div className="en-tabs" {...tabs.list}>
        {TABS.map((t) => (
          <button key={t.id} {...tabs.tab(t.id)} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => pickTab(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div {...tabs.panel(tab)}>
        {tab === 'learn' && (
          <IcesLearn
            initialUnit={learnUnit}
            units={ZH_UNITS}
            speak={speakZH}
            sourceLabel="Chinese Core"
            lang="zh"
          />
        )}
        {tab === 'quiz' && (
          <VocabQuiz allUnits={ZH_UNITS} allWords={ZH_ALL_WORDS} speak={speakZH} lang="zh" />
        )}
      </div>

      <p className="topik-note">
        Mục tiêu vốn từ của lộ trình: {ZH_TARGET_WORDS} từ — đủ cho kỳ thi <b>HSK 1</b> và những
        tình huống sinh tồn (chào hỏi, mua bán, hỏi đường, gọi món).
      </p>
    </div>
  )
}
