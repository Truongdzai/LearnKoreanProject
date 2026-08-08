import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakEN } from '@/core/tts'
import {
  ERROR_CODES, ERROR_PRIORITY, EXAM_DAY, EXAM_SPECS, FOUR_STRANDS,
  GRAMMAR_FRAME, GRAMMAR_FRAME_RULE, GUIDE_SOURCE, LISTEN_CYCLE, MISCONCEPTIONS,
  PHRASE_FIELDS, PHRASE_RULE, PLAN_12W, PLAN_12W_NOTES, READ_CYCLE, READ_TIMING,
  SESSION_90, SPACING_STEPS,
} from '@/data/toeicGuide'

type Chapter = 'exam' | 'method' | 'plan' | 'errors' | 'grammar' | 'phrases' | 'day'

const CHAPTERS: { id: Chapter; label: string }[] = [
  { id: 'exam', label: 'Cấu trúc 4 kỹ năng' },
  { id: 'method', label: 'Cách luyện có hiệu quả' },
  { id: 'plan', label: 'Chương trình 12 tuần' },
  { id: 'errors', label: 'Nhật ký lỗi' },
  { id: 'grammar', label: 'Khung ngữ pháp' },
  { id: 'phrases', label: 'Cụm từ theo tình huống' },
  { id: 'day', label: 'Thi thử & ngày thi' },
]

export default function GuideBook({ initialChapter }: { initialChapter?: string | null }) {
  const [ch, setCh] = useState<Chapter>('exam')
  const [field, setField] = useState(0)

  useEffect(() => {
    if (initialChapter && CHAPTERS.some((c) => c.id === initialChapter)) setCh(initialChapter as Chapter)
  }, [initialChapter])

  return (
    <div className="toeic-guide">
      <div className="tg-nav">
        {CHAPTERS.map((c) => (
          <button key={c.id} className={'tw-chip' + (ch === c.id ? ' on' : '')} onClick={() => setCh(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {ch === 'exam' && (
        <div className="tg-body">
          {EXAM_SPECS.map((s) => (
            <div key={s.id} className="tg-card">
              <div className="tgc-head">
                <b>{s.name}</b>
                <span>{s.vi}</span>
              </div>
              <p className="tgc-sum">{s.summary} · <b>{s.scale}</b></p>
              <table className="tg-table">
                <tbody>
                  {s.rows.map((r, i) => (
                    <tr key={i}>
                      <th>{r.part}</th>
                      <td>{r.task}</td>
                      <td className="tgt-n">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="tg-notes">{s.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          ))}
          <p className="tg-src">{GUIDE_SOURCE}</p>
        </div>
      )}

      {ch === 'method' && (
        <div className="tg-body">
          <div className="tg-card">
            <b>Bốn nhánh của một chương trình cân bằng</b>
            <p className="tgc-sum">Một chương trình chỉ vững khi có đủ bốn loại hoạt động, không phải khi làm thật nhiều đề.</p>
            <div className="tg-grid4">
              {FOUR_STRANDS.map((f) => (
                <div key={f.name}><b>{f.name}</b><p>{f.body}</p></div>
              ))}
            </div>
          </div>

          <div className="tg-card">
            <b>Truy hồi và giãn cách</b>
            <p className="tgc-sum">
              Đọc lại ghi chú tạo cảm giác quen thuộc nhưng không bảo đảm nhớ lại được khi cần. Luyện
              truy hồi bắt bạn tái tạo thông tin TRƯỚC khi xem đáp án: nhìn nghĩa tiếng Việt rồi tự
              nói cụm tiếng Anh; nhìn lịch trình rồi tự trả lời trước khi nghe mẫu; tự viết email rồi
              mới so với tiêu chí.
            </p>
            <div className="tg-space">
              <span>Lịch ôn khởi đầu cho người mới:</span>
              {SPACING_STEPS.map((s) => <i key={s}>{s}</i>)}
            </div>
            <p className="tg-mini">
              Giãn cách không có nghĩa để cách quá lâu đến mức quên gần hết — điều chỉnh theo mức độ
              nhớ thực tế của bạn.
            </p>
          </div>

          <div className="tg-card">
            <b>Quy trình luyện nghe theo hướng chẩn đoán</b>
            <p className="tgc-sum">
              “Em nghe không kịp” chưa đủ để chữa. Không nghe kịp có thể do không biết từ, biết chữ
              nhưng không nhận ra âm, nghe ra từ nhưng không hiểu cấu trúc, hoặc hiểu câu nhưng quên
              chi tiết trước khi đọc xong lựa chọn — mỗi nguyên nhân cần một cách chữa khác nhau.
            </p>
            <ol className="tg-steps">
              {LISTEN_CYCLE.map((s) => (
                <li key={s.step}><b>{s.step}</b><p>{s.body}</p></li>
              ))}
            </ol>
          </div>

          <div className="tg-card">
            <b>Chu kỳ luyện đọc</b>
            <ol className="tg-steps">
              {READ_CYCLE.map((s) => (
                <li key={s.step}><b>{s.step}</b><p>{s.body}</p></li>
              ))}
            </ol>
            <h5>Quản lý thời gian Reading</h5>
            <ul className="tg-notes">{READ_TIMING.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>

          <div className="tg-card">
            <b>Một phiên học 90 phút</b>
            <ol className="tg-steps">
              {SESSION_90.map((s) => (
                <li key={s.step}><b>{s.step}</b><p>{s.body}</p></li>
              ))}
            </ol>
            <p className="tg-mini">
              Tách rõ “lượt chính xác” (được dừng, tra cứu, sửa) và “lượt trôi chảy” (nội dung đã
              quen, làm liền mạch trong thời gian). Nếu mọi hoạt động đều chậm và bị ngắt thì không
              phát triển được độ trôi chảy; nếu mọi hoạt động đều chạy theo giờ thì lỗi nền tảng bị lặp lại.
            </p>
          </div>

          <div className="tg-card">
            <b>Sáu ngộ nhận phổ biến</b>
            <div className="tg-myths">
              {MISCONCEPTIONS.map((m) => (
                <div key={m.wrong}>
                  <p className="tgm-x">✗ {m.wrong}</p>
                  <p className="tgm-v">✓ {m.right}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {ch === 'plan' && (
        <div className="tg-body">
          <div className="tg-card">
            <b>Chương trình nền tảng mười hai tuần cho cả bốn kỹ năng</b>
            <p className="tgc-sum">
              Khác với lộ trình 60 ngày trong tab đầu (tập trung Nghe – Đọc), chương trình này chạy
              song song cả bốn kỹ năng và lấy sản phẩm làm mốc đánh giá thay vì lấy số câu.
            </p>
            <table className="tg-table plan">
              <thead><tr><th>Giai đoạn</th><th>Trọng tâm</th><th>Sản phẩm đánh giá</th></tr></thead>
              <tbody>
                {PLAN_12W.map((w) => (
                  <tr key={w.range}>
                    <th>{w.range}</th>
                    <td>{w.focus}</td>
                    <td className="tgt-out">{w.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="tg-notes">{PLAN_12W_NOTES.map((n, i) => <li key={i}>{n}</li>)}</ul>
          </div>
        </div>
      )}

      {ch === 'errors' && (
        <div className="tg-body">
          <div className="tg-card">
            <b>Vì sao phải phân loại nguyên nhân sai</b>
            <p className="tgc-sum">
              Một câu sai chỉ có giá trị khi được chuyển thành thông tin về quá trình. Nếu chỉ ghi
              đáp án đúng, cùng một nguyên nhân sẽ quay lại dưới hình thức khác. Mục “nguyên nhân”
              phải cụ thể — “bất cẩn” hiếm khi đủ; hãy viết “không xác định được chủ ngữ chính vì bị
              cụm giới từ chen giữa” hoặc “nghe thấy Monday nhưng bỏ qua not until”.
            </p>
            <p className="tg-mini">
              Trong tab <b>Sổ tay câu sai</b>, mỗi câu bạn làm sai đều gắn được một mã nguyên nhân.
              Sau mỗi tuần, đếm ba nhóm lỗi phổ biến nhất và chọn MỘT nhóm làm mục tiêu.
            </p>
          </div>

          <div className="tg-codes">
            {ERROR_CODES.map((c) => (
              <div key={c.code} className="tg-code">
                <div className="tgcd-head"><b>{c.code}</b><span>{c.vi}</span></div>
                <p className="tgcd-hint">{c.hint}</p>
                <p className="tgcd-fix"><b>Cách chữa:</b> {c.fix}</p>
              </div>
            ))}
          </div>

          <div className="tg-card">
            <b>Sửa theo thứ tự ưu tiên</b>
            <ul className="tg-notes">{ERROR_PRIORITY.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        </div>
      )}

      {ch === 'grammar' && (
        <div className="tg-body">
          <div className="tg-card">
            <b>Khung ngữ pháp nền tảng cho bốn kỹ năng</b>
            <p className="tgc-sum">{GRAMMAR_FRAME_RULE}</p>
            <table className="tg-table gram">
              <thead><tr><th>Chủ điểm</th><th>Chức năng giao tiếp</th><th>Ví dụ</th></tr></thead>
              <tbody>
                {GRAMMAR_FRAME.map((g) => (
                  <tr key={g.topic}>
                    <th>{g.topic}</th>
                    <td>{g.fn}</td>
                    <td lang="en" className="tgt-ex">{g.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ch === 'phrases' && (
        <div className="tg-body">
          <div className="tg-card">
            <b>Cụm từ ưu tiên theo trường giao tiếp</b>
            <p className="tgc-sum">{PHRASE_RULE}</p>
            <div className="tg-nav inner">
              {PHRASE_FIELDS.map((f, i) => (
                <button key={f.field} className={'tw-chip' + (field === i ? ' on' : '')} onClick={() => setField(i)}>
                  {f.field}
                </button>
              ))}
            </div>
            <ul className="tg-phrases">
              {PHRASE_FIELDS[field].items.map((it) => (
                <li key={it.en}>
                  <b lang="en">{it.en}</b>
                  <span>{it.vi}</span>
                  <button className="btn-ghost sm" onClick={() => speakEN(it.en)} aria-label={`Nghe ${it.en}`}>
                    <Icon name="volume" size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {ch === 'day' && (
        <div className="tg-body">
          {EXAM_DAY.map((d) => (
            <div key={d.title} className="tg-card">
              <b>{d.title}</b>
              <p className="tgc-sum">{d.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
