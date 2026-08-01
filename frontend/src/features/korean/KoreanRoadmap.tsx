import Icon from '@/core/components/Icon'
import { KO_ALL_WORDS } from '@/data/koreanCore'
import { KO_PLAN_12_WEEKS, KO_PLAN_TASK_TOTAL, KO_TARGET_WORDS } from '@/data/koreanRoadmap'
import { KO_UNITS } from '@/data/koreanCore'
import { KO_PRON_GROUPS } from '@/data/koreanPronunciation'
import { speakKO } from '@/core/tts'
import { useLearnedWords, readPlan, planDay } from '../english/progress'
import RoadmapWeeks from '../english/components/RoadmapWeeks'

const STEPS = [
  { k: 'Tháng 1', vi: 'Nền móng', tone: 'tone-a', desc: 'Chào hỏi, gia đình, từ để hỏi, động từ gốc, thời gian và hai hệ số đếm — đủ để mở lời và hỏi được điều mình cần.' },
  { k: 'Tháng 2', vi: 'Ghép câu', tone: 'tone-c', desc: 'Cơ thể, tính từ, sinh hoạt, vị trí, màu sắc, thời tiết, cảm xúc — cộng mẫu câu mỗi tuần để nói thành câu hoàn chỉnh.' },
  { k: 'Tháng 3', vi: 'Ra đời thật', tone: 'tone-e', desc: 'Mua sắm, nhà hàng, đi lại, lớp học, sức khoẻ, công việc, du lịch — trọn các tình huống bạn sẽ gặp ở Hàn.' },
]

interface Props {
  onStart: () => void
  onLearn: (unitId: string) => void
  onQuiz: (week: number, units: string[], pass: number) => void
  onPron: (groupId?: string) => void
}

export default function KoreanRoadmap({ onStart, onLearn, onQuiz, onPron }: Props) {
  const { learned } = useLearnedWords('ko')
  const day = Math.min(planDay(readPlan('ko').start), 90)

  return (
    <div className="en-overview">
      <div className="en-hero">
        <div className="en-hero-badge"><Icon name="rocket" size={14} /> Lộ trình 90 ngày</div>
        <h1>Tiếng Hàn từ số 0 trong 3 tháng</h1>
        <p>
          Mỗi tuần một chủ đề, học bằng phương pháp <b>ICES</b> (hình ảnh – liên tưởng – ví dụ – âm thanh),
          kèm <b>mẫu câu của tuần</b> để ghép từ đã học thành câu nói được ngay, rồi củng cố bằng ôn tập ngắt quãng.
        </p>
        <div className="en-hero-stats">
          {day > 0 && <div><b>{day}</b><span>ngày đã đi / 90</span></div>}
          <div><b>{KO_ALL_WORDS.length}</b><span>từ lõi sẵn sàng</span></div>
          <div><b>{learned.size}</b><span>từ bạn đã thuộc</span></div>
          <div><b>{KO_TARGET_WORDS}</b><span>mục tiêu kho từ</span></div>
        </div>
        <button className="btn-primary lg" onClick={onStart}><Icon name="play" size={16} /> Bắt đầu học từ vựng</button>
      </div>

      <div className="section-title"><span className="pin" /> Hành trình 12 tuần của bạn</div>
      <RoadmapWeeks
        lang="ko"
        weeks={KO_PLAN_12_WEEKS}
        taskTotal={KO_PLAN_TASK_TOTAL}
        vocabUnits={KO_UNITS}
        speak={speakKO}
        firstUnitId="greetings"
        onLearn={onLearn}
        onQuiz={onQuiz}
        onPron={onPron}
        pronGroups={KO_PRON_GROUPS}
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
          <b>Chữ S trong ICES — Sound.</b> Thuộc từ mà đọc sai thì người Hàn vẫn không hiểu.
          {' '}{KO_PRON_GROUPS.length} nhóm âm người Việt hay sai (bật hơi ㅋㅌㅍ, âm căng ㄲㄸㅃ, ㅓ–ㅗ, batchim ㄹ, nối âm, biến âm mũi)
          đã có sẵn: nghe mẫu, phân biệt bằng tai rồi đọc cho máy chấm.
        </div>
        <button className="btn-primary sm" onClick={() => onPron()}><Icon name="volume" size={15} /> Luyện phát âm</button>
      </div>

      <div className="en-principle">
        <Icon name="bulb" size={20} />
        <div>
          <b>Vì sao học theo chủ đề chứ không học chữ cái trước?</b> Bảng chữ Hangeul đọc được sau vài buổi,
          nhưng thứ giữ bạn lại là <b>nói được ngay tuần đầu</b>. Mỗi từ trong lộ trình đều kèm phiên âm La-tinh,
          mẹo nhớ theo tiếng Việt và câu ví dụ có thể dùng thật — bạn vừa quen mặt chữ vừa dùng được luôn.
        </div>
      </div>
    </div>
  )
}
