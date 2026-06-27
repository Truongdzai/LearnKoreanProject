import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import type { Lesson } from '@/models/lesson.model'

/** Extract candidate Korean words (strip trailing particles) for a vocab chip list. */
function keywords(lesson: Lesson): string[] {
  const stop = new Set(['저는', '오늘', '정말', '또'])
  const seen = new Set<string>()
  const out: string[] = []
  for (const seg of lesson.segments) {
    for (let w of seg.ko.split(/\s+/)) {
      w = w.replace(/[.,!?]/g, '').replace(/(을|를|이|가|은|는|에서|에게|에|와|과|도)$/u, '')
      if (w.length >= 2 && !stop.has(w) && !seen.has(w)) {
        seen.add(w)
        out.push(w)
      }
      if (out.length >= 10) return out
    }
  }
  return out
}

const GRAMMAR = [
  { p: '–아요/어요', d: 'Đuôi câu thân mật lịch sự ở thì hiện tại.', ex: '공부해요 — học' },
  { p: '–았어요/었어요', d: 'Thì quá khứ lịch sự.', ex: '봤어요 — đã xem' },
  { p: '에서', d: 'Trợ từ chỉ nơi chốn diễn ra hành động.', ex: '학교에서 — ở trường' },
  { p: '을/를', d: 'Trợ từ tân ngữ (đối tượng của hành động).', ex: '영화를 — bộ phim' },
]

export default function SummaryView({ lesson }: { lesson: Lesson }) {
  const { openLookup, learnLang } = useAppStore()
  const words = keywords(lesson)
  const phrases = lesson.segments.slice(0, 5)

  return (
    <div className="summary">
      <div className="sm-ai-tag"><Icon name="sparkles" size={14} /> Tóm tắt do AI tạo từ nội dung video</div>

      <div className="sm-grid">
        <div className="sm-card span2">
          <div className="sm-label"><Icon name="bulb" size={15} /> Tổng quan</div>
          <p>Video <b>“{lesson.title}”</b> gồm {lesson.segments.length} câu, phù hợp luyện nghe – nói ở trình độ sơ cấp.
            Nội dung xoay quanh giao tiếp đời sống hằng ngày với câu ngắn, dễ lặp lại theo phương pháp shadowing.</p>
        </div>

        <div className="sm-card">
          <div className="sm-label"><Icon name="note" size={15} /> Thông tin chung</div>
          <ul className="sm-info">
            <li><span>Mục tiêu</span><b>Nghe hiểu & phản xạ câu cơ bản</b></li>
            <li><span>Đối tượng</span><b>Người mới bắt đầu</b></li>
            <li><span>Số câu</span><b>{lesson.segments.length} câu</b></li>
            <li><span>Khái niệm chính</span><b>{Math.max(3, Math.round(lesson.segments.length / 2))} chủ điểm</b></li>
          </ul>
        </div>

        <div className="sm-card">
          <div className="sm-label"><Icon name="cards" size={15} /> Từ vựng nổi bật</div>
          <p className="sm-sub">Bấm vào từ để tra cứu nhanh với AI</p>
          <div className="sm-words">
            {words.map((w) => (
              <button key={w} lang={learnLang} onClick={() => openLookup(w)}>{w}</button>
            ))}
          </div>
        </div>

        {learnLang === 'ko' && (
          <div className="sm-card">
            <div className="sm-label"><Icon name="letters" size={15} /> Ngữ pháp</div>
            <ul className="sm-grammar">
              {GRAMMAR.map((g) => (
                <li key={g.p}><b lang="ko">{g.p}</b><span>{g.d}</span><em lang="ko">{g.ex}</em></li>
              ))}
            </ul>
          </div>
        )}

        <div className="sm-card">
          <div className="sm-label"><Icon name="volume" size={15} /> Cụm nói hữu ích</div>
          <ul className="sm-phrases">
            {phrases.map((s, i) => (
              <li key={i}><span lang={learnLang}>{s.ko}</span><em>{s.vi}</em></li>
            ))}
          </ul>
        </div>

        <div className="sm-card span2 sm-practice">
          <div className="sm-label"><Icon name="target" size={15} /> Gợi ý luyện tập</div>
          <ul>
            <li><Icon name="check-circle" size={15} /> Nghe & nhại lại từng câu (shadowing) 3 lần.</li>
            <li><Icon name="check-circle" size={15} /> Lưu 5 từ mới vào flashcard rồi ôn bằng SRS.</li>
            <li><Icon name="check-circle" size={15} /> Thử dịch lại các câu ở tab <b>Luyện dịch</b> mà không nhìn đáp án.</li>
            <li><Icon name="check-circle" size={15} /> Ghi âm và so sánh phát âm ở tab <b>Phát âm</b>.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
