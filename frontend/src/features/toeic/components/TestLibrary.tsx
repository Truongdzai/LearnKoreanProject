import Icon from '@/core/components/Icon'
import { BANK_SIZE, FIXED_TEST_COUNT } from '../engine'
import type { SavedRun } from '../testSave'
import type { TestRecord } from '../state'
import { TOEIC_TARGET } from '@/data/toeicCore'
import { ETS_TESTS } from '@/data/english/toeic/etsTests'

interface Props {
  tests: Record<string, TestRecord>
  saved: SavedRun | null
  savedMinutes: number
  savedInReading: boolean
  latestEstimate: { listening: number; reading: number; total: number } | null
  onFixed: (idx: number) => void
  onRandomFull: () => void
  onMini: () => void
  onResume: () => void
  onDropSaved: () => void
  onEtsOpen: (test: number) => void
}

const STRUCTURE: { sec: string; time: string; rows: [string, string, number][] }[] = [
  {
    sec: 'Nghe',
    time: '≈ 45 phút',
    rows: [
      ['Part 1', 'Mô tả tranh', 6],
      ['Part 2', 'Hỏi — đáp', 25],
      ['Part 3', 'Hội thoại', 39],
      ['Part 4', 'Bài nói ngắn', 30],
    ],
  },
  {
    sec: 'Đọc',
    time: '75 phút',
    rows: [
      ['Part 5', 'Câu chưa hoàn chỉnh', 30],
      ['Part 6', 'Điền vào đoạn văn', 16],
      ['Part 7', 'Đọc hiểu', 54],
    ],
  },
]

const BANDS: [string, string][] = [
  ['450 – 600', 'Giao tiếp công sở cơ bản — mức nhiều trường đại học lấy làm chuẩn đầu ra.'],
  ['650 – 750', 'Đủ cho phần lớn vị trí tuyển dụng có yêu cầu tiếng Anh.'],
  ['800 – 900', 'Thành thạo — lợi thế rõ khi ứng tuyển công ty nước ngoài.'],
  ['900+', 'Gần kịch trần thang điểm.'],
]

const FAQ: [string, string][] = [
  ['Đề thi TOEIC bao nhiêu câu, bao lâu?',
    'Bài Nghe – Đọc có 200 câu trong 120 phút: 100 câu Nghe (khoảng 45 phút) và 100 câu Đọc (75 phút). FULL TEST ở đây dựng đúng tỉ lệ đó và bấm giờ riêng từng phần như phòng thi.'],
  ['Bao nhiêu điểm là tốt?',
    'Thang chạy từ 10 đến 990, phần Nghe và phần Đọc mỗi phần từ 5 đến 495. Không có mốc đỗ/trượt — điểm bao nhiêu là đủ tuỳ mục tiêu của bạn.'],
  ['Điểm ước lượng ở đây có sát điểm thật không?',
    'Bài quy đổi bằng bảng neo bám sát thang ETS nên sát khi bạn làm FULL TEST 200 câu trong đúng thời gian. Đề rút gọn 50 câu chỉ để đo nhanh, sai số lớn hơn nhiều.'],
  ['Nên bắt đầu từ đâu?',
    'Làm một đề trong Bộ đề để biết mình đang ở đâu, xem tab Phân tích để biết Part nào yếu nhất, rồi luyện trúng chỗ đó trước khi làm đề tiếp theo.'],
]

export default function TestLibrary(props: Props) {
  const { tests, saved, savedMinutes, savedInReading, latestEstimate } = props

  return (
    <div className="toeic-test-intro">
      {saved && (
        <div className="tt-resume">
          <div>
            <b>⏸️ Bạn có một bài thi đang dở</b>
            <p>
              {saved.fixed != null ? `Đề số ${saved.fixed + 1}` : saved.full ? 'FULL TEST 200 câu' : 'Thi thử rút gọn'} · đã làm{' '}
              {Object.keys(saved.answers).length} câu · còn {savedMinutes} phút
              {saved.full ? (savedInReading ? ' của phần Đọc' : ' (Nghe + Đọc)') : ''}.
              Bài tự lưu nên tắt máy hay lỡ tay thoát vẫn không mất.
            </p>
          </div>
          <div className="tt-resume-actions">
            <button className="btn-primary sm" onClick={props.onResume}>
              <Icon name="rocket" size={14} /> Tiếp tục bài thi
            </button>
            <button className="btn-ghost sm" onClick={props.onDropSaved}>Bỏ bài này</button>
          </div>
        </div>
      )}

      {ETS_TESTS.length > 0 && (
        <div className="tt-lib">
          <div className="tt-lib-head">
            <div>
              <h3><Icon name="volume" size={17} /> ETS TOEIC 2026</h3>
            </div>
          </div>

          <div className="tt-grid">
            {ETS_TESTS.map((t) => (
              <div key={t.id} className="tt-item">
                <div className="tt-item-top">
                  <span className="tt-item-no">Test {t.test}</span>
                  <span className="tt-item-tag">ETS 2026</span>
                </div>
                <div className="tt-item-meta">
                  200 câu · 120 phút · {t.listening} Nghe + {t.reading ?? t.part5} Đọc
                </div>
                <div className="tt-item-actions ets">
                  <button className="btn-primary sm" onClick={() => props.onEtsOpen(t.test)}>
                    <Icon name="arrow-right" size={14} /> Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tt-lib">
        <div className="tt-lib-head">
          <div>
            <h3><Icon name="trophy" size={17} /> VyLing TOEIC</h3>
          </div>
        </div>

        <div className="tt-grid">
          {Array.from({ length: FIXED_TEST_COUNT }, (_, i) => {
            const rec = tests[String(i)]
            const hit = rec ? rec.best >= TOEIC_TARGET : false
            return (
              <div key={i} className={'tt-item' + (rec ? ' done' : '')}>
                <div className="tt-item-top">
                  <span className="tt-item-no">Đề {i + 1}</span>
                  {rec
                    ? <span className="tt-item-tag ok"><Icon name="check-circle" size={12} /> đã làm {rec.n} lần</span>
                    : <span className="tt-item-tag">chưa làm</span>}
                </div>
                <div className="tt-item-meta">200 câu · 120 phút · đủ 7 Part</div>
                {rec ? (
                  <div className="tt-item-score">
                    <div>
                      <small>Cao nhất</small>
                      <b className={hit ? 'hit' : ''}>{rec.best}</b>
                    </div>
                    <div>
                      <small>Gần nhất</small>
                      <b>{rec.last}</b>
                    </div>
                    <span className="tt-item-date">{rec.t}</span>
                  </div>
                ) : (
                  <div className="tt-item-empty">Chưa có điểm — làm một lượt để lấy mốc so sánh.</div>
                )}
                <button className={rec ? 'btn-ghost sm' : 'btn-primary sm'} onClick={() => props.onFixed(i)}>
                  <Icon name={rec ? 'rocket' : 'target'} size={14} /> {rec ? 'Làm lại đề này' : 'Vào thi'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="tt-card full">
        <h3>Đề ngẫu nhiên</h3>
        <ul>
          <li><b>200 câu · Nghe 45 phút + Đọc 75 phút</b>, cùng cấu trúc với Bộ đề nhưng <b>bốc ngẫu nhiên từ kho {BANK_SIZE} câu</b> mỗi lượt.</li>
          <li>Hợp khi bạn đã làm hết Bộ đề và chỉ muốn thêm lượt luyện; đổi lại <b>không so điểm giữa các lần</b> được vì mỗi lần một đề khác.</li>
          <li>Bài <b>tự lưu liên tục</b> — tắt máy giữa chừng vẫn quay lại làm tiếp được.</li>
        </ul>
        <button className="btn-primary" onClick={props.onRandomFull}>
          <Icon name="rocket" size={16} /> Vào đề ngẫu nhiên
        </button>
        {latestEstimate && (
          <small className="tt-last">Lần gần nhất: <b>{latestEstimate.total}</b>/990 (Nghe {latestEstimate.listening} · Đọc {latestEstimate.reading})</small>
        )}
      </div>

      <div className="tt-card">
        <h3>Thi thử rút gọn</h3>
        <ul>
          <li><b>~50 câu · 30 phút</b></li>
          <li>Hợp với kiểm tra nhanh giữa lộ trình; điểm ước lượng thang 990 chỉ mang tính tham khảo.</li>
          <li>Cũng bốc ngẫu nhiên nên làm lại nhiều lần vẫn ra đề mới.</li>
        </ul>
        <button className="btn-ghost" onClick={props.onMini}>
          <Icon name="target" size={16} /> Thi rút gọn
        </button>
      </div>

      <div className="tt-info">
        <h3><Icon name="book" size={16} /> Cấu trúc đề Nghe – Đọc</h3>
        <div className="tt-table-wrap">
          <table className="tt-table">
            <thead>
              <tr><th>Phần</th><th>Part</th><th>Dạng bài</th><th>Số câu</th></tr>
            </thead>
            <tbody>
              {STRUCTURE.map((s) => s.rows.map((r, i) => (
                <tr key={s.sec + r[0]}>
                  {i === 0 && <th rowSpan={s.rows.length} scope="rowgroup">{s.sec}<small>{s.time}</small></th>}
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td className="num">{r[2]}</td>
                </tr>
              )))}
              <tr className="tt-total"><th colSpan={3}>Tổng</th><td className="num">200 câu / 120 phút</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="tt-info">
        <h3><Icon name="chart" size={16} /> Thang điểm nói lên điều gì</h3>
        <p className="tt-info-sub">Nghe và Đọc mỗi phần 5 – 495 điểm, cộng lại thành 10 – 990. Không có mốc đỗ/trượt.</p>
        <div className="tt-bands">
          {BANDS.map(([range, mean]) => (
            <div key={range} className="tt-band">
              <b>{range}</b>
              <span>{mean}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tt-info">
        <h3><Icon name="bulb" size={16} /> Câu hỏi thường gặp</h3>
        <div className="tt-faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
