import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { BLOG_POSTS, postBySlug } from '@/data/blog'


const HELP_GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Bắt đầu',
    items: [
      { q: 'Tôi nên bắt đầu từ đâu?', a: 'Chọn ngôn ngữ ở thanh bên trái, rồi mở trang lộ trình của ngôn ngữ đó và bấm "Bắt đầu hành trình 90 ngày". Hệ thống sẽ tính ngày và giao việc cụ thể cho từng ngày. Nếu chỉ muốn thử, hãy dán một link YouTube ở trang chủ.' },
      { q: 'Có bắt buộc tạo tài khoản không?', a: 'Không. Bạn dùng được gần như mọi thứ khi chưa đăng nhập. Nhưng tiến độ khi đó chỉ nằm trong trình duyệt đang dùng — đăng nhập thì kho từ, thẻ ôn tập và lộ trình được lưu trên máy chủ, đổi máy vẫn còn.' },
      { q: 'Đổi ngôn ngữ đang học ở đâu?', a: 'Bấm vào ô "NGÔN NGỮ" ở đầu thanh bên trái. Mỗi ngôn ngữ có kho video, kho từ và lộ trình riêng — đổi qua lại không mất dữ liệu của ngôn ngữ kia.' },
    ],
  },
  {
    title: 'Bài học từ video',
    items: [
      { q: 'Dán link mà báo không tìm thấy phụ đề?', a: 'Video đó không bật phụ đề, hoặc chỉ có phụ đề tự động ở ngôn ngữ khác. Hãy chọn video có biểu tượng CC trên YouTube. Trong kho video của VyLing, mọi video đều đã được kiểm chứng là có phụ đề.' },
      { q: 'Vì sao lần đầu tạo bài học hơi lâu?', a: 'Lần đầu hệ thống phải tải phụ đề và dịch toàn bộ, mất khoảng 10–60 giây tuỳ độ dài. Sau đó bài học được lưu lại, ai mở cùng video đó sẽ hiện ra ngay lập tức.' },
      { q: '"Độ vừa sức" trong bài học nghĩa là gì?', a: 'Là phần trăm số từ trong phụ đề mà bạn đã biết. Dưới 80% là hơi khó, 80–97% là vừa sức nhất để học (gọi là vùng i+1), trên 97% là dễ với bạn. Chỉ tính được khi bạn đã đăng nhập và có kho từ.' },
    ],
  },
  {
    title: 'Ôn tập & tiến độ',
    items: [
      { q: 'Thẻ ôn tập hoạt động thế nào?', a: 'Mỗi thẻ có lịch ôn riêng, giãn dần theo mức bạn nhớ: nhớ tốt thì lần sau ôn xa hơn, quên thì quay lại từ đầu. Mỗi ngày bạn chỉ cần ôn những thẻ đến hạn, thường 10–20 thẻ.' },
      { q: 'Tôi lỡ bỏ vài ngày, chuỗi ngày mất rồi có sao không?', a: 'Không sao cả. Chuỗi ngày chỉ là thứ tạo động lực, không ảnh hưởng tới thẻ hay lộ trình. Thẻ đến hạn vẫn nằm đó chờ bạn, chỉ là nhiều hơn một chút.' },
      { q: 'Lộ trình 90 ngày có tự tick không?', a: 'Có. Nhiệm vụ học từ vựng, kiểm tra tuần, phát âm và ngữ pháp tự tick theo tiến độ thật của bạn. Nhiệm vụ xem video và luyện nói thì bạn tự đánh dấu.' },
    ],
  },
  {
    title: 'Tài khoản & chi phí',
    items: [
      { q: 'VyLing thu phí thế nào?', a: 'Phần học chính miễn phí hoàn toàn. Gói Plus chỉ thêm tiện ích phụ và hạn mức AI cao hơn, không khoá bài học hay từ vựng.' },
      { q: 'Vì sao có giới hạn lượt dùng AI mỗi ngày?', a: 'Các tính năng gọi AI (gia sư, chấm bài viết, luyện nói, chấm phát âm) tốn chi phí thật cho mỗi lượt. Hạn mức giúp mọi người đều dùng được và tránh bị lạm dụng. Đăng nhập thì hạn mức cao hơn khách vãng lai.' },
      { q: 'Quên mật khẩu thì làm sao?', a: 'Ở cửa sổ đăng nhập, bấm "Quên mật khẩu?" rồi nhập email. Hệ thống gửi mã 6 số về email để bạn đặt lại mật khẩu.' },
    ],
  },
]

export function HelpPage() {
  const { setView } = useAppStore()
  const [q, setQ] = useState('')
  const kw = q.trim().toLowerCase()
  const groups = HELP_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((i) => !kw || (i.q + i.a).toLowerCase().includes(kw)) }))
    .filter((g) => g.items.length)

  return (
    <div className="page-doc">
      <div className="lesson-head">
        <h2><Icon name="bulb" /> Trợ giúp &amp; câu hỏi thường gặp</h2>
        <div className="meta">Không tìm thấy câu trả lời? Gửi câu hỏi cho chúng tôi ở trang Liên hệ.</div>
      </div>

      <div className="lib-search doc-search">
        <Icon name="search" size={16} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm trong trợ giúp…" aria-label="Tìm trong trợ giúp…" />
        {q && <button className="lib-search-x" onClick={() => setQ('')}><Icon name="x" size={14} /></button>}
      </div>

      {groups.length === 0 && <div className="empty"><div className="big">🔍</div>Không có mục nào khớp — thử từ khoá khác nhé.</div>}

      {groups.map((g) => (
        <section key={g.title} className="doc-sec">
          <h3>{g.title}</h3>
          {g.items.map((i) => (
            <div key={i.q} className="doc-qa">
              <b>{i.q}</b>
              <p>{i.a}</p>
            </div>
          ))}
        </section>
      ))}

      <div className="doc-cta">
        <span>Vẫn chưa rõ điều gì?</span>
        <button className="btn-primary sm" onClick={() => setView('contact')}>
          <Icon name="mail" size={15} /> Liên hệ với chúng tôi
        </button>
      </div>
    </div>
  )
}


export function AboutPage() {
  const { setView } = useAppStore()
  return (
    <div className="page-doc">
      <div className="lesson-head">
        <h2><Icon name="heart" /> Về VyLing</h2>
        <div className="meta">Vì sao chúng tôi làm công cụ này, và làm theo nguyên tắc nào.</div>
      </div>

      <section className="doc-sec">
        <h3>Câu chuyện</h3>
        <p>
          VyLing bắt đầu từ một việc rất riêng tư: một người Việt muốn học tiếng Hàn bằng chính những video
          mình vẫn xem mỗi tối, thay vì ngồi học giáo trình khô khan rồi bỏ dở sau hai tuần. Các công cụ có sẵn
          hoặc quá đắt, hoặc bắt cài nhiều phần mềm rời rạc, hoặc dạy thứ không dùng tới.
        </p>
        <p>
          Nên chúng tôi gom mọi thứ cần thiết vào một chỗ: dán link video là có bài học song ngữ, bấm từ là tra
          được nghĩa, lưu thẻ là có lịch ôn, và một lộ trình rõ ràng để không phải tự hỏi "hôm nay học gì".
        </p>
      </section>

      <section className="doc-sec">
        <h3>Ba nguyên tắc chúng tôi giữ</h3>
        <div className="doc-qa">
          <b>1. Dùng gì học nấy</b>
          <p>
            Không nhồi từ hiếm để trông cho nhiều. Mỗi từ trong kho đều là từ bạn sẽ gặp lại — chọn theo tần suất
            dùng thật, kèm câu ví dụ có thể nói ngay hôm nay.
          </p>
        </div>
        <div className="doc-qa">
          <b>2. Phần học chính luôn miễn phí</b>
          <p>
            Học ngoại ngữ không nên là đặc quyền của người có tiền. Bài học, từ vựng, ôn tập, lộ trình và luyện thi
            đều miễn phí. Gói Plus chỉ là cách để những ai thấy hữu ích có thể góp phần nuôi máy chủ.
          </p>
        </div>
        <div className="doc-qa">
          <b>3. Nói thật về tiến độ</b>
          <p>
            Chúng tôi không hứa "giỏi sau 7 ngày". Các con số trên trang này — 805 từ tiếng Hàn, 3000 từ tiếng Anh,
            90 ngày — là khối lượng thật, và kết quả phụ thuộc vào việc bạn quay lại mỗi ngày.
          </p>
        </div>
      </section>

      <section className="doc-sec">
        <h3>Nội dung đến từ đâu</h3>
        <p>
          Từ vựng, ngữ pháp và câu hỏi luyện thi đều do chúng tôi tự biên soạn theo định dạng đề thật, không sao chép
          từ sách có bản quyền. Video trong kho là video công khai trên YouTube, được kiểm chứng có phụ đề trước khi
          đưa vào — VyLing chỉ nhúng trình phát của YouTube, không tải xuống hay phát tán lại nội dung của họ.
        </p>
      </section>

      <div className="doc-cta">
        <span>Có góp ý để VyLing tốt hơn?</span>
        <button className="btn-primary sm" onClick={() => setView('contact')}>
          <Icon name="mail" size={15} /> Gửi góp ý
        </button>
      </div>
    </div>
  )
}


export function ContactPage() {
  const { setView } = useAppStore()
  return (
    <div className="page-doc">
      <div className="lesson-head">
        <h2><Icon name="mail" /> Liên hệ</h2>
        <div className="meta">Chúng tôi đọc mọi góp ý — đây là cách nhanh nhất để tính năng bạn cần được làm sớm.</div>
      </div>

      <section className="doc-sec">
        <h3>Cách nhanh nhất: nút góp ý ngay trong web</h3>
        <p>
          Góc dưới bên phải màn hình luôn có nút <b>Góp ý</b>. Bấm vào đó để báo lỗi hoặc đề xuất tính năng —
          góp ý gửi thẳng vào hệ thống kèm thông tin trang bạn đang xem, nên chúng tôi tái hiện lỗi nhanh hơn nhiều
          so với email.
        </p>
      </section>

      <section className="doc-sec">
        <h3>Email</h3>
        <p>
          Với các việc cần trao đổi dài (hợp tác nội dung, báo cáo bản quyền, câu hỏi về tài khoản):
          <br />
          <b className="doc-mail">hello@vyling.vn</b>
        </p>
        <p className="doc-note">
          Chúng tôi là một nhóm rất nhỏ nên thời gian phản hồi thường là vài ngày làm việc. Nếu là lỗi khiến bạn
          không học được, hãy dùng nút Góp ý để được ưu tiên xử lý.
        </p>
      </section>

      <section className="doc-sec">
        <h3>Báo cáo bản quyền</h3>
        <p>
          Nếu bạn là chủ sở hữu nội dung và cho rằng một video trong kho không nên xuất hiện ở đây, hãy gửi email
          kèm đường dẫn video. Chúng tôi gỡ khỏi kho ngay khi xác minh, không cần thủ tục phức tạp.
        </p>
      </section>

      <div className="doc-cta">
        <span>Muốn xem trước các câu hỏi hay gặp?</span>
        <button className="btn-ghost sm" onClick={() => setView('help')}>
          <Icon name="bulb" size={15} /> Mở trang Trợ giúp
        </button>
      </div>
    </div>
  )
}


const BLOG_SLUG_KEY = 'vyling.blog.slug'

export function BlogPage() {
  const { setView } = useAppStore()
  const [slug, setSlug] = useState<string | null>(() => {
    try { return sessionStorage.getItem(BLOG_SLUG_KEY) } catch { return null }
  })

  useEffect(() => {
    try {
      if (slug) sessionStorage.setItem(BLOG_SLUG_KEY, slug)
      else sessionStorage.removeItem(BLOG_SLUG_KEY)
    } catch {  }
  }, [slug])

  const post = slug ? postBySlug(slug) : undefined

  if (post) {
    return (
      <article className="page-doc blog-post">
        <button className="btn-ghost sm" onClick={() => setSlug(null)}>
          <Icon name="arrow-left" size={14} /> Tất cả bài viết
        </button>
        <div className="blog-post-head">
          <span className="blog-tag">{post.emoji} {post.tag}</span>
          <h1>{post.title}</h1>
          <div className="blog-meta">{post.date} · đọc khoảng {post.minutes} phút</div>
        </div>

        <p className="blog-answer">{post.answer}</p>

        {post.sections.map((s) => (
          <section key={s.h} className="doc-sec">
            <h3>{s.h}</h3>
            {s.p.map((par, i) => <p key={i}>{par}</p>)}
            {s.list && <ul className="blog-list">{s.list.map((li, i) => <li key={i}>{li}</li>)}</ul>}
          </section>
        ))}

        <div className="doc-cta">
          <span>Muốn thử ngay những gì vừa đọc?</span>
          <button className="btn-primary sm" onClick={() => setView('home')}>
            <Icon name="rocket" size={15} /> Bắt đầu học miễn phí
          </button>
        </div>
      </article>
    )
  }

  return (
    <div className="page-doc">
      <div className="lesson-head">
        <h2><Icon name="note" /> Blog học ngoại ngữ</h2>
        <div className="meta">Kinh nghiệm học thật, không hứa hẹn viển vông — viết cho người Việt tự học.</div>
      </div>
      <div className="blog-grid">
        {BLOG_POSTS.map((p) => (
          <button key={p.slug} className="blog-card" onClick={() => setSlug(p.slug)}>
            <span className="blog-emoji">{p.emoji}</span>
            <div>
              <span className="blog-tag">{p.tag}</span>
              <b>{p.title}</b>
              <p>{p.desc}</p>
              <small>{p.date} · {p.minutes} phút đọc</small>
            </div>
            <Icon name="arrow-right" size={16} />
          </button>
        ))}
      </div>
    </div>
  )
}


export function NotFoundPage() {
  const { setView } = useAppStore()
  return (
    <div className="page-404">
      <div className="big">🧭</div>
      <h1>Không tìm thấy trang này</h1>
      <p>
        Đường dẫn bạn vừa mở không tồn tại hoặc đã đổi tên. Không sao — dưới đây là những lối đi hay dùng nhất.
      </p>
      <div className="p404-links">
        <button className="btn-primary" onClick={() => setView('home')}><Icon name="home" size={15} /> Trang chủ</button>
        <button className="btn-ghost" onClick={() => setView('library')}><Icon name="film" size={15} /> Kho video</button>
        <button className="btn-ghost" onClick={() => setView('help')}><Icon name="bulb" size={15} /> Trợ giúp</button>
        <button className="btn-ghost" onClick={() => setView('blog')}><Icon name="note" size={15} /> Blog</button>
      </div>
    </div>
  )
}
