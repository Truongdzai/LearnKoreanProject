import Icon, { type IconName } from '@/core/components/Icon'
import {
  TARGET_WORDS, ALL_WORDS, UNITS,
  PLAN_12_WEEKS, PLAN_TASK_TOTAL,
  PLAN_12_WEEKS_BOOT, PLAN_BOOT_TASK_TOTAL,
  type RoadmapMode,
} from '@/data/englishCore'
import { PRON_GROUPS } from '@/data/englishPronunciation'
import { useLearnedWords, readPlan, planDay } from '../progress'
import RoadmapWeeks from './RoadmapWeeks'
import FastMethod from './fast/FastMethod'

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

const MODES: { id: RoadmapMode; icon: IconName; name: string; time: string; goal: string; desc: string }[] = [
  {
    id: 'lite', icon: 'cards', name: 'Cơ bản', time: '45–60 phút/ngày',
    goal: 'Giao tiếp sinh tồn (A2)',
    desc: 'Học bên cạnh công việc, trường lớp. Nền móng vững, không kiệt sức.',
  },
  {
    id: 'boot', icon: 'flame', name: 'Bootcamp', time: '7–8 giờ/ngày',
    goal: 'Giỏi giao tiếp (B1–B2)',
    desc: 'Toàn thời gian như một khoá quân sự: 630–700 giờ trong 90 ngày, kể cả bắt đầu từ số 0.',
  },
]

interface Props {
  mode: RoadmapMode
  onMode: (m: RoadmapMode) => void
  onStart: () => void
  onLearn: (unitId: string) => void
  onQuiz: (week: number, units: string[], pass: number) => void
  onSummary: () => void
  onGrammar: (lessonId?: string) => void
  onPron: (groupId?: string) => void
  onSkills: () => void
  onErrors: () => void
}

export default function ProgramOverview({
  mode, onMode, onStart, onLearn, onQuiz, onSummary, onGrammar, onPron, onSkills, onErrors,
}: Props) {
  const { learned } = useLearnedWords()
  const day = Math.min(planDay(readPlan().start), 90)
  const boot = mode === 'boot'

  return (
    <div className="en-overview">
      <div className="en-hero">
        <div className="en-hero-badge"><Icon name="rocket" size={14} /> {boot ? 'Bootcamp 90 ngày' : 'Lộ trình 3 tháng'}</div>
        <h1>{boot ? 'Giỏi Tiếng Anh trong 90 ngày' : 'Nói được Tiếng Anh trong 3 tháng'}</h1>
        {boot ? (
          <p>Phiên bản toàn thời gian cho người quyết tâm — <b>7–8 giờ mỗi ngày</b>, kể cả bắt đầu từ số 0: trọn 3000 từ, 18 bài ngữ pháp, 13 nhóm âm, TOEIC 60 ngày và nghe – nói – đọc – viết mỗi ngày. Không có đường tắt, chỉ có đủ giờ bay.</p>
        ) : (
          <p>Đi theo phương pháp <b>F.A.S.T</b>: <b>F</b>ocus vào đúng 20% cần học, <b>A</b>ssociate để nhớ bằng liên tưởng, <b>S</b>ystem để chia giờ đều cho 4 kỹ năng, <b>T</b>imely feedback để lỗi được sửa trước khi hoá thạch. Nghe – nói – đọc – viết đều có chỗ trong lộ trình, không bỏ kỹ năng nào.</p>
        )}
        <div className="en-hero-stats">
          {day > 0 && <div><b>{day}</b><span>ngày đã đi / 90</span></div>}
          <div><b>{ALL_WORDS.length}</b><span>từ lõi sẵn sàng</span></div>
          <div><b>{learned.size}</b><span>từ bạn đã thuộc</span></div>
          <div><b>{TARGET_WORDS.toLocaleString('vi-VN')}</b><span>mục tiêu (hiểu ~90%)</span></div>
        </div>
        <button className="btn-primary lg" onClick={onStart}><Icon name="play" size={16} /> Bắt đầu học từ vựng</button>
      </div>

      <div className="section-title"><span className="pin" /> Chọn cường độ của bạn</div>
      <div className="mode-pick">
        {MODES.map((m) => (
          <button key={m.id} className={'mode-card' + (mode === m.id ? ' on' : '')} onClick={() => onMode(m.id)}>
            <div className="mode-head"><Icon name={m.icon} size={17} /> <b>{m.name}</b> <span className="mode-time">{m.time}</span></div>
            <div className="mode-goal">{m.goal}</div>
            <p>{m.desc}</p>
          </button>
        ))}
      </div>
      <div className="mode-note">
        <Icon name="bulb" size={15} />
        {boot
          ? 'Bootcamp dùng chung tiến độ từ vựng, ngữ pháp, phát âm với chế độ Cơ bản — đổi qua lại không mất gì, chỉ khác mật độ nhiệm vụ và chuẩn đầu ra.'
          : 'Sự thật về số giờ: 45–60 phút/ngày trong 90 ngày ra mức A2. Muốn GIỎI ngay trong 90 ngày thì phải trả bằng giờ — chế độ Bootcamp 7–8 giờ/ngày dành cho người dồn toàn lực.'}
      </div>

      <FastMethod onGrammar={onGrammar} onPron={onPron} onSkills={onSkills} onErrors={onErrors} />

      <div className="section-title"><span className="pin" /> Hành trình 12 tuần của bạn</div>
      <RoadmapWeeks key={mode} weeks={boot ? PLAN_12_WEEKS_BOOT : PLAN_12_WEEKS} taskTotal={boot ? PLAN_BOOT_TASK_TOTAL : PLAN_TASK_TOTAL} vocabUnits={UNITS}
        onLearn={onLearn} onQuiz={onQuiz} onSummary={onSummary} onGrammar={onGrammar} onPron={onPron} />

      <div className="section-title"><span className="pin" /> Quy tắc 3C — cách chữ F đi vào từ vựng</div>
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

      <div className="section-title"><span className="pin" /> ICES — cách chữ A đi vào từng từ</div>
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
          {' '}{PRON_GROUPS.length} nhóm âm người Việt hay sai (âm cuối, /θ/, ship–sheep, trọng âm, nối âm, nhịp câu) đã có sẵn:
          nghe mẫu, phân biệt bằng tai, ghi âm hai bản để đối chiếu rồi tự chấm theo 5 tiêu chí.
        </div>
        <button className="btn-primary sm" onClick={() => onPron()}><Icon name="volume" size={15} /> Luyện phát âm</button>
      </div>
    </div>
  )
}
