import Icon from '@/core/components/Icon'
import { ZH_UNITS, ZH_ALL_WORDS, ZH_TARGET_WORDS } from '@/data/chineseCore'
import { ZH_PLAN_12_WEEKS, ZH_PLAN_TASK_TOTAL } from '@/data/chineseRoadmap'
import { ZH_PRON_GROUPS } from '@/data/chinesePronunciation'
import { speakZH } from '@/core/tts'
import { useLearnedWords, readPlan, planDay } from '../english/progress'
import RoadmapWeeks from '../english/components/RoadmapWeeks'

const STEPS = [
  { k: 'Tháng 1', vi: 'Nền móng', tone: 'tone-a', desc: 'Chào hỏi, gia đình, số đếm, lượng từ, động từ gốc, thời gian và nơi chốn — đủ để mở lời và hỏi được điều mình cần.' },
  { k: 'Tháng 2', vi: 'Ghép câu', tone: 'tone-c', desc: 'Ăn uống, mua sắm, tiền bạc, từ nối, thời tiết, sức khoẻ — thêm khung câu mỗi tuần để nói thành câu dài.' },
  { k: 'Tháng 3', vi: 'Ra đời thật', tone: 'tone-e', desc: 'Đi lại, hỏi đường, nhà cửa, quần áo, công việc, du lịch — trọn các tình huống bạn sẽ gặp ở Trung Quốc.' },
]

interface Props {
  onStart: () => void
  onLearn: (unitId: string) => void
  onQuiz: (week: number, units: string[], pass: number) => void
  onPron: (groupId?: string) => void
}

export default function ChineseRoadmap({ onStart, onLearn, onQuiz, onPron }: Props) {
  const { learned } = useLearnedWords('zh')
  const day = Math.min(planDay(readPlan('zh').start), 90)

  return (
    <div className="en-overview">
      <div className="en-hero">
        <div className="en-hero-badge"><Icon name="rocket" size={14} /> Lộ trình 90 ngày</div>
        <h1>Tiếng Trung từ số 0 trong 3 tháng</h1>
        <p>
          Mỗi tuần một chủ đề, học bằng phương pháp <b>ICES</b> (hình ảnh – liên tưởng – ví dụ – âm thanh),
          kèm <b>khung câu của tuần</b> để ghép từ đã học thành câu nói được ngay, rồi củng cố bằng ôn tập ngắt quãng.
        </p>
        <div className="en-hero-stats">
          {day > 0 && <div><b>{day}</b><span>ngày đã đi / 90</span></div>}
          <div><b>{ZH_ALL_WORDS.length}</b><span>từ lõi sẵn sàng</span></div>
          <div><b>{learned.size}</b><span>từ bạn đã thuộc</span></div>
          <div><b>{ZH_TARGET_WORDS}</b><span>mục tiêu kho từ</span></div>
        </div>
        <button className="btn-primary lg" onClick={onStart}><Icon name="play" size={16} /> Bắt đầu học từ vựng</button>
      </div>

      <div className="section-title"><span className="pin" /> Hành trình 12 tuần của bạn</div>
      <RoadmapWeeks
        lang="zh"
        weeks={ZH_PLAN_12_WEEKS}
        taskTotal={ZH_PLAN_TASK_TOTAL}
        vocabUnits={ZH_UNITS}
        speak={speakZH}
        firstUnitId="zh-greetings"
        onLearn={onLearn}
        onQuiz={onQuiz}
        onPron={onPron}
        pronGroups={ZH_PRON_GROUPS}
      />

      <div className="section-title"><span className="pin" /> Ba chặng của lộ trình</div>
      <div className="threec-grid">
        {STEPS.map((c) => (
          <div key={c.k} className={'threec ' + c.tone}>
            <div className="threec-ic"><Icon name="target" size={22} /></div>
            <h3>{c.k} <small>· {c.vi}</small></h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="en-principle pron-cta">
        <Icon name="mic" size={20} />
        <div>
          <b>Chữ S trong ICES — Sound.</b> Tiếng Trung sai thanh điệu là sai hẳn từ: 妈 (mẹ) thành 马 (ngựa).
          {' '}{ZH_PRON_GROUPS.length} nhóm âm người Việt hay sai (bốn thanh, thanh 2 với thanh 3, âm cuốn lưỡi zh ch sh,
          j q x, ü, âm r, đuôi -n với -ng, bật hơi, thanh nhẹ, biến điệu) đã có sẵn: nghe mẫu, phân biệt bằng tai rồi đọc cho máy chấm.
        </div>
        <button className="btn-primary sm" onClick={() => onPron()}><Icon name="volume" size={15} /> Luyện phát âm</button>
      </div>

      <div className="en-principle">
        <Icon name="bulb" size={20} />
        <div>
          <b>Lợi thế của người Việt: hơn nửa vốn từ đã nằm sẵn trong đầu bạn.</b> Tiếng Việt mượn kho từ Hán rất dày,
          nên 学生 chính là <i>học sinh</i>, 注意 là <i>chú ý</i>, 经理 là <i>kinh lý</i>. Mỗi thẻ từ ở đây đều chỉ ra cây cầu Hán–Việt đó —
          nhớ một chữ là mở ra cả loạt từ ghép, thứ mà người học phương Tây phải học thuộc từng từ một.
        </div>
      </div>
    </div>
  )
}
