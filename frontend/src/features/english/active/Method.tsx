import Icon from '@/core/components/Icon'
import { BLIND_SPOTS, CHUNK_COUNT, DIMS, LEVELS, LOOP, PACK_COUNT } from '@/data/englishActive'

interface Props {
  onStart?: () => void
}

export default function Method({ onStart }: Props) {
  return (
    <div className="ac-method">
      <div className="ac-gap">
        <div className="ac-gap-side wrong">
          <span>CÁI BẪY</span>
          <b>Biết từ vựng</b>
          <ul>
            <li>Nhìn thấy thì hiểu nghĩa</li>
            <li>Dịch được đoạn văn ngắn</li>
            <li>Nhớ 500 từ trong hai tuần</li>
            <li>Xem có phụ đề thì theo kịp</li>
          </ul>
        </div>
        <div className="ac-gap-mid">
          <Icon name="arrow-right" size={22} />
          <b>KHOẢNG CÁCH THẬT</b>
          <span>Đây mới là bài toán, không phải “học thêm bao nhiêu từ nữa”.</span>
        </div>
        <div className="ac-gap-side right">
          <span>ĐÍCH ĐẾN</span>
          <b>Dùng được từ vựng</b>
          <ul>
            <li>Gặp tình huống là tự bật ra câu</li>
            <li>Nghe người thật nói vẫn nhận ra từ đã học</li>
            <li>Tự tạo câu mới, không chép câu mẫu</li>
            <li>Đáp lại trong vài giây, không dịch trong đầu</li>
          </ul>
        </div>
      </div>

      <p className="ac-thesis">
        <b>500 từ dùng được đáng giá hơn 3000 từ nhớ trong đầu.</b> Vì vậy toàn bộ trang này đo bạn bằng
        “làm chủ được bao nhiêu” và “bật ra nhanh đến mức nào”, chứ không phải “đã học bao nhiêu”.
      </p>

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="cards" size={17} /> Đổi đơn vị học</h3>
          <span>Không học từ trần trụi nữa</span>
        </div>
        <div className="ac-unit">
          <div className="ac-unit-old">
            <span>CÁCH CŨ</span>
            <code>take = lấy</code>
            <small>Học xong vẫn không hiểu take off, take up, take after, take care of, take part in…</small>
          </div>
          <Icon name="arrow-right" size={20} />
          <div className="ac-unit-new">
            <span>ĐƠN VỊ MỚI</span>
            <code>cụm + khuôn câu + tình huống + cách dùng + bẫy hay mắc</code>
            <small>
              Mỗi mục học kèm: câu mẫu có ngữ cảnh, tình huống tiếng Việt để tự truy xuất,
              một câu hỏi để bạn phản xạ đáp lại, và lỗi người Việt hay mắc với chính cụm đó.
            </small>
          </div>
        </div>
        <p className="ac-unit-note">
          Câu hỏi đúng không phải “từ này nghĩa là gì” mà là <b>“từ này được dùng như thế nào”</b>.
          Có hẳn một gói {' '}<em>Họ nhà take</em>{' '} để bạn thấy tận mắt điều đó.
        </p>
      </div>

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="chart" size={17} /> Năm tầng làm chủ</h3>
          <span>Mỗi tầng có một cửa ải riêng, không thể nhảy cóc</span>
        </div>
        <div className="ac-ladder">
          {LEVELS.filter((l) => l.lv > 0).map((l) => {
            const dim = DIMS.find((d) => d.proves === l.lv)
            return (
              <div key={l.lv} className="ac-rung">
                <span className={'ac-rung-n ' + l.tone}>{l.lv}</span>
                <div>
                  <b>{l.name} <em>{l.en}</em></b>
                  <small>{l.desc}</small>
                  {dim && <span className="ac-rung-gate"><Icon name={dim.icon} size={12} /> {dim.question}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="refresh" size={17} /> Vòng lặp bảy bước</h3>
          <span>Bỏ mắt xích nào thì kiến thức nằm lại ở dạng thụ động</span>
        </div>
        <div className="ac-loopgrid">
          {LOOP.map((s) => (
            <div key={s.id} className="ac-loopcard">
              <b className={s.tone}><Icon name={s.icon} size={15} /></b>
              <span>{s.n}. {s.name} <em>{s.en}</em></span>
              <small>{s.desc}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="ac-panel">
        <div className="ac-panel-head">
          <h3><Icon name="eye" size={17} /> Bảy điểm mù đã được vá</h3>
          <span>Đây là lý do bản trước không hiệu quả</span>
        </div>
        <div className="ac-spots">
          {BLIND_SPOTS.map((s) => (
            <div key={s.id} className="ac-spot">
              <b className={'ac-spot-ic ' + s.tone}><Icon name={s.icon} size={15} /></b>
              <div>
                <b>{s.title}</b>
                <p className="ac-spot-sym">{s.symptom}</p>
                <p className="ac-spot-why">{s.why}</p>
                <p className="ac-spot-fix"><Icon name="check-circle" size={13} /> {s.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ac-cta">
        <div>
          <b>{CHUNK_COUNT} cụm trong {PACK_COUNT} gói tình huống</b>
          <span>Chọn gói đúng đích của bạn rồi vào buổi học đầu tiên — khoảng 33 phút.</span>
        </div>
        {onStart && <button className="ac-next" onClick={onStart}>Bắt đầu buổi học <Icon name="arrow-right" size={15} /></button>}
      </div>
    </div>
  )
}
