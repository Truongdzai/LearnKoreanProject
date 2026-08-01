import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'


const UPDATED = '31/07/2026'

export function TermsPage() {
  const { setView } = useAppStore()
  return (
    <div className="page-doc">
      <div className="lesson-head">
        <h2><Icon name="note" /> Điều khoản sử dụng</h2>
        <div className="meta">Cập nhật {UPDATED} · Dùng VyLing nghĩa là bạn đồng ý với những điều dưới đây.</div>
      </div>

      <section className="doc-sec">
        <h3>1. VyLing là gì</h3>
        <p>
          VyLing là công cụ học ngoại ngữ qua video: lấy phụ đề của video YouTube bạn chọn, dịch song ngữ,
          cho tra từ và lưu thẻ ôn tập, kèm lộ trình học và các phần luyện thi. Phần học chính miễn phí;
          gói Plus chỉ thêm tiện ích và hạn mức AI cao hơn.
        </p>
      </section>

      <section className="doc-sec">
        <h3>2. Tài khoản</h3>
        <p>
          Bạn dùng được phần lớn tính năng mà không cần tài khoản. Khi tạo tài khoản, bạn chịu trách nhiệm
          giữ mật khẩu và mọi hoạt động diễn ra dưới tài khoản đó. Hãy dùng email thật để lấy lại được tài khoản
          khi quên mật khẩu. Chúng tôi có thể khoá tài khoản vi phạm mục 4, và sẽ nói rõ lý do.
        </p>
      </section>

      <section className="doc-sec">
        <h3>3. Nội dung video và bản quyền</h3>
        <p>
          VyLing <b>không lưu trữ và không phát lại video</b>. Video luôn chạy qua trình phát chính thức của
          YouTube, nhúng vào trang; bản quyền thuộc về chủ kênh. Phụ đề được lấy từ chính video và chỉ dùng
          cho mục đích học tập cá nhân của bạn. Khi bạn dùng VyLing với một video, bạn cũng đang chịu ràng buộc
          của Điều khoản dịch vụ YouTube.
        </p>
        <p>
          Nếu bạn là chủ sở hữu nội dung và muốn video của mình không xuất hiện trong kho video của VyLing,
          hãy báo qua trang Liên hệ — chúng tôi gỡ trong vòng 72 giờ.
        </p>
      </section>

      <section className="doc-sec">
        <h3>4. Bạn không được</h3>
        <ul className="doc-list">
          <li>Tự động hoá việc gọi các tính năng AI để rút cạn hạn mức chung, hoặc lách hạn mức bằng nhiều tài khoản.</li>
          <li>Dùng VyLing để tạo hoặc phát tán nội dung vi phạm pháp luật Việt Nam.</li>
          <li>Cố tình dò tìm, tấn công hoặc làm quá tải hệ thống.</li>
          <li>Bán lại, cho thuê hoặc phân phối lại dữ liệu lấy từ VyLing.</li>
        </ul>
      </section>

      <section className="doc-sec">
        <h3>5. Nội dung do AI tạo ra</h3>
        <p>
          Phần dịch, giải thích ngữ pháp, chấm phát âm, chấm bài viết và câu trả lời của gia sư đều do mô hình AI
          sinh ra, nên <b>có thể sai</b>. Hãy coi đó là gợi ý học tập, không phải kết luận chính thức — đặc biệt khi
          bạn ôn thi. Chúng tôi không bảo đảm bạn sẽ đạt một mức điểm cụ thể nào.
        </p>
      </section>

      <section className="doc-sec">
        <h3>6. Gói Plus &amp; xu</h3>
        <p>
          Xu là điểm thưởng trong ứng dụng, không phải tiền, không quy đổi ra tiền và không chuyển được ra ngoài.
          Khi có thanh toán cho gói Plus, chính sách giá và hoàn tiền sẽ được ghi rõ ở trang Bảng giá trước khi bạn trả tiền.
        </p>
      </section>

      <section className="doc-sec">
        <h3>7. Dịch vụ ở giai đoạn thử nghiệm</h3>
        <p>
          VyLing đang trong giai đoạn hoàn thiện. Tính năng có thể thay đổi, tạm ngừng hoặc lỗi. Chúng tôi cố gắng
          giữ dữ liệu học của bạn an toàn (sao lưu tự động hằng ngày), nhưng bạn nên tự tải bản sao dữ liệu định kỳ —
          nút tải nằm ở trang Hoạt động.
        </p>
      </section>

      <section className="doc-sec">
        <h3>8. Thay đổi điều khoản</h3>
        <p>
          Khi có thay đổi đáng kể, chúng tôi sẽ báo trên web trước khi áp dụng. Bạn tiếp tục dùng VyLing sau đó
          nghĩa là chấp nhận bản mới. Bản đang áp dụng luôn là bản trên trang này, ghi ngày cập nhật ở đầu trang.
        </p>
      </section>

      <div className="doc-cta">
        <span>Còn thắc mắc về cách dữ liệu của bạn được dùng?</span>
        <button className="btn-primary sm" onClick={() => setView('privacy')}>
          <Icon name="lock" size={15} /> Đọc chính sách quyền riêng tư
        </button>
      </div>
    </div>
  )
}

export function PrivacyPage() {
  const { setView } = useAppStore()
  return (
    <div className="page-doc">
      <div className="lesson-head">
        <h2><Icon name="lock" /> Chính sách quyền riêng tư</h2>
        <div className="meta">Cập nhật {UPDATED} · Viết theo đúng những gì phần mềm đang làm, không phải mẫu chung.</div>
      </div>

      <section className="doc-sec">
        <h3>Tóm tắt trong 5 dòng</h3>
        <ul className="doc-list">
          <li>Không đăng nhập thì chúng tôi <b>không biết bạn là ai</b> — dữ liệu học nằm trong trình duyệt của bạn.</li>
          <li>Có tài khoản thì chúng tôi lưu email, tên, và dữ liệu học của bạn để đồng bộ giữa các máy.</li>
          <li>Chúng tôi <b>không bán dữ liệu</b> cho bất kỳ ai, và không đặt quảng cáo theo dõi.</li>
          <li>Câu bạn gửi cho AI được chuyển tới Google Gemini để xử lý — đừng gửi thông tin nhạy cảm.</li>
          <li>Bạn tải về hoặc xoá sạch dữ liệu của mình bất cứ lúc nào, ngay trong trang Hoạt động.</li>
        </ul>
      </section>

      <section className="doc-sec">
        <h3>1. Chúng tôi lưu những gì</h3>
        <div className="doc-qa">
          <b>Khi bạn chưa đăng nhập</b>
          <p>
            Tiến độ học, ngôn ngữ đang chọn và giao diện sáng/tối được lưu <b>trong chính trình duyệt</b> của bạn
            (localStorage), không gửi lên máy chủ. Xoá dữ liệu trình duyệt là mất hết.
          </p>
        </div>
        <div className="doc-qa">
          <b>Khi bạn có tài khoản</b>
          <p>
            Tên hiển thị, email (hoặc thông tin cơ bản từ Google/Facebook nếu bạn đăng nhập bằng chúng), ảnh đại diện
            nếu bạn tải lên, mật khẩu <b>đã băm</b> (chúng tôi không đọc được mật khẩu của bạn), và dữ liệu học:
            thẻ từ vựng, lịch sử ôn tập, số phút học mỗi ngày, tiến độ lộ trình, kết quả thi thử, video đã lưu, xu và cấp độ.
          </p>
        </div>
        <div className="doc-qa">
          <b>Dữ liệu kỹ thuật</b>
          <p>
            Địa chỉ IP được dùng để đếm hạn mức AI của khách chưa đăng nhập và để chặn đăng nhập sai quá nhiều lần.
            Nhật ký máy chủ ghi lại đường dẫn và mã lỗi của các yêu cầu — không lưu nội dung bài học của bạn.
          </p>
        </div>
      </section>

      <section className="doc-sec">
        <h3>2. Bên thứ ba nhận dữ liệu gì</h3>
        <table className="doc-table">
          <thead><tr><th>Bên</th><th>Nhận gì</th><th>Vì sao</th></tr></thead>
          <tbody>
            <tr>
              <td>Google Gemini</td>
              <td>Câu/đoạn bạn gửi để dịch, giải thích, chấm bài, hỏi gia sư</td>
              <td>Không có mô hình AI thì các tính năng này không chạy</td>
            </tr>
            <tr>
              <td>YouTube</td>
              <td>Yêu cầu phát video (do trình phát nhúng thực hiện)</td>
              <td>Video luôn chạy trên hạ tầng chính thức của YouTube</td>
            </tr>
            <tr>
              <td>Google Analytics</td>
              <td>Lượt xem trang, sự kiện học ẩn danh — <b>chỉ khi bạn đồng ý</b></td>
              <td>Biết trang nào hữu ích để làm tiếp. Không gửi email/tên/nội dung học</td>
            </tr>
            <tr>
              <td>Máy chủ email</td>
              <td>Email của bạn + nội dung thư hệ thống</td>
              <td>Gửi mã xác minh, mã đặt lại mật khẩu, thư nhắc học</td>
            </tr>
          </tbody>
        </table>
        <p>Ngoài bốn bên trên, không ai khác nhận dữ liệu của bạn. Chúng tôi không dùng mạng quảng cáo.</p>
      </section>

      <section className="doc-sec">
        <h3>3. Cookie &amp; bộ nhớ trình duyệt</h3>
        <p>
          VyLing <b>không đặt cookie theo dõi</b>. Chúng tôi dùng localStorage — bộ nhớ của trình duyệt — cho những thứ
          cần để chạy: mã đăng nhập, ngôn ngữ, giao diện, tiến độ khi bạn chưa có tài khoản. Nếu bật đo lường,
          Google Analytics sẽ đặt cookie của họ, và chỉ sau khi bạn bấm Đồng ý ở dải hỏi ý kiến.
        </p>
      </section>

      <section className="doc-sec">
        <h3>4. Giữ trong bao lâu</h3>
        <p>
          Dữ liệu học được giữ chừng nào tài khoản còn tồn tại. Bản sao lưu tự động giữ 14 ngày gần nhất.
          Nhật ký dùng AI tự xoá sau 7 ngày. Mã xác minh hết hạn sau 10 phút. Khi bạn xoá tài khoản,
          toàn bộ dữ liệu cá nhân bị xoá ngay; góp ý bạn từng gửi được giữ lại nhưng <b>gỡ bỏ danh tính</b>.
        </p>
      </section>

      <section className="doc-sec">
        <h3>5. Quyền của bạn</h3>
        <ul className="doc-list">
          <li><b>Xem &amp; mang đi:</b> tải toàn bộ dữ liệu của bạn dưới dạng JSON — trang Hoạt động, mục "Dữ liệu của tôi".</li>
          <li><b>Xoá:</b> xoá tài khoản cùng toàn bộ dữ liệu, cũng ở mục đó. Thao tác này không hoàn tác được.</li>
          <li><b>Sửa:</b> đổi tên, ảnh đại diện, mật khẩu trong menu tài khoản.</li>
          <li><b>Từ chối thư:</b> tắt thư nhắc học bằng nút trong trang Hoạt động hoặc link cuối mỗi thư.</li>
          <li><b>Từ chối đo lường:</b> bấm Từ chối ở dải hỏi ý kiến — khi đó không script đo lường nào được tải.</li>
        </ul>
      </section>

      <section className="doc-sec">
        <h3>6. Trẻ em</h3>
        <p>
          VyLing dành cho người từ 13 tuổi trở lên. Nếu bạn dưới 13 tuổi, hãy nhờ cha mẹ hoặc người giám hộ
          tạo và quản lý tài khoản giúp.
        </p>
      </section>

      <section className="doc-sec">
        <h3>7. An toàn dữ liệu</h3>
        <p>
          Mật khẩu được băm bằng PBKDF2-SHA256 với muối riêng cho từng người. Phiên đăng nhập ký bằng khoá bí mật
          sinh ngẫu nhiên trên máy chủ và thu hồi được. Dữ liệu được sao lưu tự động hằng ngày.
          Không hệ thống nào an toàn tuyệt đối — nếu xảy ra sự cố ảnh hưởng tới dữ liệu của bạn, chúng tôi sẽ thông báo.
        </p>
      </section>

      <div className="doc-cta">
        <span>Muốn hỏi về dữ liệu của bạn?</span>
        <button className="btn-primary sm" onClick={() => setView('contact')}>
          <Icon name="mail" size={15} /> Liên hệ với chúng tôi
        </button>
      </div>
    </div>
  )
}
