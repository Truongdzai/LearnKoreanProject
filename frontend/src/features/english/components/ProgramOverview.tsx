import Icon, { type IconName } from '@/core/components/Icon'
import { TARGET_WORDS, ALL_WORDS, PLAN_12_WEEKS, PLAN_TASK_TOTAL, UNITS } from '@/data/englishCore'
import { PRON_GROUPS } from '@/data/englishPronunciation'
import { useLearnedWords, readPlan, planDay } from '../progress'
import RoadmapWeeks from './RoadmapWeeks'

const THREE_C: { k: string; vi: string; icon: IconName; tone: string; desc: string }[] = [
  { k: 'Compress', vi: 'Nén', icon: 'target', tone: 'tone-a', desc: 'Không học tràn lan. Chỉ giữ lại từ tần suất cao — dùng tới đâu học tới đó. 3000 từ lõi đủ hiểu ~90% hội thoại hằng ngày.' },
  { k: 'Compile', vi: 'Biên soạn', icon: 'cards', tone: 'tone-c', desc: 'Tổng hợp từ thành cụm, mẫu câu và tình huống thật. Ghép danh từ + động từ + tính từ để nói được câu hoàn chỉnh.' },
  { k: 'Consolidate', vi: 'Củng cố', icon: 'flame', tone: 'tone-e', desc: 'Ôn tập ngắt quãng (SRS) đúng thời điểm để chuyển từ ngắn hạn sang trí nhớ dài hạn, và luyện nghe – nói qua video thật.' },
]

const ICES = [
  { k: 'I', label: 'Image', desc: 'Gắn mỗi từ với một hình ảnh để não nhớ bằng thị giác.' },
  { k: 'C', label: 'Connect', desc: 'Liên tưởng từ mới với điều đã biết bằng mẹo nhớ.' },
  { k: 'E', label: 'Experience', desc: 'Đặt từ vào câu & tình huống thật bạn sẽ gặp.' },
  { k: 'S', label: 'Sound', desc: 'Nghe và nhại lại đúng phát âm, đúng trọng âm.' },
]

interface Props {
  onStart: () => void
  onLearn: (unitId: string) => void
  onQuiz: (week: number, units: string[], pass: number) => void
  onSummary: () => void
  onGrammar: (lessonId?: string) => void
  onPron: (groupId?: string) => void
}

export default function ProgramOverview({ onStart, onLearn, onQuiz, onSummary, onGrammar, onPron }: Props) {
  const { learned } = useLearnedWords()
  const day = Math.min(planDay(readPlan().start), 90)

  return (
    <div className="en-overview">
      <div className="en-hero">
        <div className="en-hero-badge"><Icon name="rocket" size={14} /> Lộ trình 3 tháng</div>
        <h1>Học giỏi Tiếng Anh trong 3 tháng</h1>
        <p>Đi theo <b>Quy tắc 3C</b> và phương pháp <b>ICES</b>: học đúng từ cần học, nhớ bằng hình ảnh – liên tưởng – trải nghiệm – âm thanh, rồi củng cố bằng lặp lại ngắt quãng.</p>
        <div className="en-hero-stats">
          {day > 0 && <div><b>{day}</b><span>ngày đã đi / 90</span></div>}
          <div><b>{ALL_WORDS.length}</b><span>từ lõi sẵn sàng</span></div>
          <div><b>{learned.size}</b><span>từ bạn đã thuộc</span></div>
          <div><b>{TARGET_WORDS.toLocaleString('vi-VN')}</b><span>mục tiêu (hiểu ~90%)</span></div>
        </div>
        <button className="btn-primary lg" onClick={onStart}><Icon name="play" size={16} /> Bắt đầu học từ vựng</button>
      </div>

      <div className="section-title"><span className="pin" /> Hành trình 12 tuần của bạn</div>
      <RoadmapWeeks weeks={PLAN_12_WEEKS} taskTotal={PLAN_TASK_TOTAL} vocabUnits={UNITS}
        onLearn={onLearn} onQuiz={onQuiz} onSummary={onSummary} onGrammar={onGrammar} onPron={onPron} />

      <div className="section-title"><span className="pin" /> Quy tắc 3C (3C Protocol)</div>
      <div className="threec-grid">
        {THREE_C.map((c) => (
          <div key={c.k} className={'threec ' + c.tone}>
            <div className="threec-ic"><Icon name={c.icon} size={22} /></div>
            <h3>{c.k} <small>· {c.vi}</small></h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="en-principle">
        <Icon name="bulb" size={20} />
        <div>
          <b>Nguyên tắc 1 — Không học tràn lan.</b> Ưu tiên số 1 là <b>từ vựng</b>: 3000 từ tần suất cao đã đủ hiểu ~90% hội thoại.
          Tập trung vào 3 nhóm: danh từ &amp; động từ cốt lõi, từ để hỏi (5W1H) và tính từ ứng dụng cao.
        </div>
      </div>

      <div className="section-title"><span className="pin" /> Phương pháp ghi nhớ ICES</div>
      <div className="ices-grid">
        {ICES.map((x) => (
          <div key={x.k} className="ices-box">
            <b>{x.k}</b>
            <div><h4>{x.label}</h4><p>{x.desc}</p></div>
          </div>
        ))}
      </div>

      <div className="en-principle pron-cta">
        <Icon name="mic" size={20} />
        <div>
          <b>Chữ S trong ICES — Sound.</b> Thuộc từ mà đọc sai thì người nghe vẫn không hiểu.
          {' '}{PRON_GROUPS.length} nhóm âm người Việt hay sai (âm cuối, /θ/, ship–sheep, trọng âm, nối âm) đã có sẵn:
          nghe mẫu, phân biệt bằng tai rồi đọc cho máy chấm.
        </div>
        <button className="btn-primary sm" onClick={() => onPron()}><Icon name="volume" size={15} /> Luyện phát âm</button>
      </div>
    </div>
  )
}
