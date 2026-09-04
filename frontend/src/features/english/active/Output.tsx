import { useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { ALL_CHUNKS, PACKS, packById, packOfChunk } from '@/data/englishActive'
import type { CoachTask } from '@/core/api/english.api'
import { useMastery } from './mastery'
import ProduceCard from './ProduceCard'

type Mode = 'free' | 'respond' | 'retell' | 'email'

const MODES: { id: Mode; label: string; icon: IconName; task: CoachTask; blurb: string }[] = [
  { id: 'free', label: 'Nói tự do', icon: 'mic', task: 'free', blurb: 'Một tình huống, 45–60 giây, không gợi ý.' },
  { id: 'respond', label: 'Đáp nhanh', icon: 'flame', task: 'respond', blurb: 'Nghe hỏi là đáp — đo phản xạ dưới sức ép.' },
  { id: 'retell', label: 'Kể lại', icon: 'film', task: 'retell', blurb: 'Xem xong kể lại bằng lời của bạn.' },
  { id: 'email', label: 'Viết công việc', icon: 'note', task: 'email', blurb: 'Email và tin nhắn thật trong nghề.' },
]

const BRIEFS: { id: string; title: string; brief: string; prompt: string }[] = [
  {
    id: 'delay',
    title: 'Xin lùi hạn',
    brief: 'Bạn không kịp hạn nộp tài liệu thiết kế vì còn chờ dữ liệu từ bên khác. Viết email cho quản lý dự án phía khách hàng xin thêm hai ngày.',
    prompt: 'Write a short email asking the client PM for a two-day extension on the design document.',
  },
  {
    id: 'bug',
    title: 'Báo sự cố',
    brief: 'Hệ thống vừa lỗi 40 phút sáng nay. Viết thư báo cho khách: chuyện gì đã xảy ra, đã xử lý thế nào, làm gì để không lặp lại.',
    prompt: 'Write an email to the client about a 40-minute outage this morning: what happened, how you fixed it, how you will prevent it.',
  },
  {
    id: 'handover',
    title: 'Bàn giao trước khi nghỉ phép',
    brief: 'Bạn nghỉ phép một tuần. Viết thư cho cả nhóm: ai tiếp quản việc gì, những chỗ cần lưu ý, cách liên lạc khi khẩn cấp.',
    prompt: 'Write a handover email to your team before a one-week holiday.',
  },
  {
    id: 'review',
    title: 'Nhờ duyệt code',
    brief: 'Viết tin nhắn nhờ đồng nghiệp duyệt pull request: nó làm gì, cần chú ý chỗ nào, khi nào bạn cần xong.',
    prompt: 'Write a short message asking a colleague to review your pull request.',
  },
  {
    id: 'followup',
    title: 'Nhắc khéo',
    brief: 'Bạn gửi thư ba ngày trước mà chưa ai trả lời. Viết thư nhắc lại sao cho lịch sự nhưng rõ ràng là bạn đang bị chặn.',
    prompt: 'Write a polite follow-up email after three days of no reply, making clear that you are blocked.',
  },
  {
    id: 'thanks',
    title: 'Cảm ơn sau phỏng vấn',
    brief: 'Viết thư cảm ơn sau buổi phỏng vấn: nhắc một điều cụ thể đã trao đổi, nhấn lại vì sao bạn hợp với vị trí.',
    prompt: 'Write a thank-you email after a job interview, mentioning one specific thing from the conversation.',
  },
]

export default function Output() {
  const { state, logOutput } = useMastery()
  const [mode, setMode] = useState<Mode>('free')
  const [packId, setPackId] = useState(state.goal)
  const [briefId, setBriefId] = useState(BRIEFS[0].id)
  const [seed, setSeed] = useState(0)

  const pack = packById(packId) ?? PACKS[0]
  const spec = MODES.find((m) => m.id === mode) ?? MODES[0]
  const brief = BRIEFS.find((b) => b.id === briefId) ?? BRIEFS[0]

  const rapid = useMemo(() => {
    const pool = ALL_CHUNKS.filter((c) => c.ask)
    return pool[Math.floor(Math.random() * pool.length)] ?? ALL_CHUNKS[0]
  }, [seed])

  return (
    <div className="ac-output">
      <div className="ac-lib-intro">
        <Icon name="mic" size={16} />
        <div>
          <b>Đây là khối mà hầu hết người học bỏ qua</b>
          <span>
            Nạp vào bao nhiêu cũng không tự biến thành nói được. Mỗi lần bạn tự tạo ra một câu mới,
            AI sẽ chấm ngay, xếp loại lỗi và ghi vào Sổ lỗi — rồi bạn nói lại cho đúng.
          </span>
        </div>
      </div>

      <div className="ac-modes">
        {MODES.map((m) => (
          <button key={m.id} className={'ac-mode' + (mode === m.id ? ' on' : '')} onClick={() => setMode(m.id)}>
            <Icon name={m.icon} size={15} />
            <b>{m.label}</b>
            <small>{m.blurb}</small>
          </button>
        ))}
      </div>

      {(mode === 'free' || mode === 'retell') && (
        <div className="ac-pickrow">
          <label>Tình huống</label>
          <select value={packId} onChange={(e) => setPackId(e.target.value)}>
            {PACKS.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.cefr}</option>)}
          </select>
        </div>
      )}

      {mode === 'email' && (
        <div className="ac-pickrow">
          <label>Đề bài</label>
          <select value={briefId} onChange={(e) => setBriefId(e.target.value)}>
            {BRIEFS.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>
      )}

      {mode === 'free' && (
        <ProduceCard
          key={`free-${packId}`}
          task="free"
          rows={5}
          prompt={`Speak about: ${pack.scene.setting}`}
          placeholder="Nói hoặc gõ đoạn 45–60 giây của bạn…"
          brief={
            <>
              <b>{pack.scene.setting}</b>
              <span>
                Nói liền mạch 45–60 giây: mở đầu, một hai ý chính có ví dụ, rồi kết.
                Đừng soạn sẵn trong đầu bằng tiếng Việt — cứ bắt đầu rồi sửa dần.
              </span>
            </>
          }
          onResult={logOutput}
        />
      )}

      {mode === 'retell' && (
        <ProduceCard
          key={`retell-${packId}`}
          task="retell"
          rows={5}
          prompt={`Retell this scene: ${pack.scene.title}`}
          placeholder="Kể lại cảnh đó bằng tiếng Anh…"
          brief={
            <>
              <b>Kể lại cảnh “{pack.scene.title}”</b>
              <span>
                Mở tab Hôm nay nghe lại cảnh nếu cần, rồi đóng lời thoại và kể lại bằng lời của bạn.
                Đây là bước biến thứ bạn vừa nghe thành thứ bạn nói được.
              </span>
            </>
          }
          onResult={logOutput}
        />
      )}

      {mode === 'respond' && (
        <>
          <div className="ac-rapid-head">
            <div>
              <b>Câu hỏi lấy từ: {packOfChunk(rapid.id)?.name}</b>
              <small>Nghe rồi đáp trong vài giây. Chậm không sao — nhưng đừng dừng lại dịch từng chữ.</small>
            </div>
            <button className="ac-ghost" onClick={() => setSeed((s) => s + 1)}>
              <Icon name="refresh" size={15} /> Câu khác
            </button>
          </div>
          <ProduceCard
            key={`rapid-${rapid.id}-${seed}`}
            task="respond"
            rows={2}
            target={rapid}
            prompt={rapid.ask}
            speakPrompt={rapid.ask}
            placeholder="Trả lời ngay bằng tiếng Anh…"
            brief={
              <>
                <b>Đáp nhanh</b>
                <span>Nếu dùng được cụm <em>{rapid.en}</em> thì càng tốt, nhưng trả lời tự nhiên quan trọng hơn.</span>
              </>
            }
            onResult={logOutput}
            onNext={() => setSeed((s) => s + 1)}
            nextLabel="Câu khác"
          />
        </>
      )}

      {mode === 'email' && (
        <ProduceCard
          key={`email-${briefId}`}
          task="email"
          rows={9}
          prompt={brief.prompt}
          placeholder="Viết email của bạn bằng tiếng Anh…"
          brief={
            <>
              <b>{brief.title}</b>
              <span>{brief.brief}</span>
            </>
          }
          onResult={logOutput}
        />
      )}
    </div>
  )
}
