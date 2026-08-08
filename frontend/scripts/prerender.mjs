import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SITE = 'https://vyling.vn'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const PAGES = [
  {
    path: '/', title: 'VyLing — Học ngoại ngữ qua video bạn thích',
    desc: 'Học tiếng Hàn, tiếng Anh qua chính video YouTube bạn thích: phụ đề song ngữ, bấm từ là tra nghĩa, lưu thẻ ôn tập SRS. Kèm lộ trình 90 ngày, gia sư AI 24/7 và luyện thi TOPIK, TOEIC. Miễn phí.',
    h1: 'Học ngoại ngữ qua video bạn thích',
    lead: 'VyLing biến bất kỳ video YouTube có phụ đề thành một bài học: phụ đề song ngữ, bấm từ là tra nghĩa, lưu thẻ rồi ôn đúng lúc sắp quên.',
    points: [
      'Dán link YouTube là có bài học song ngữ sau 10–60 giây',
      'Bấm một từ trong phụ đề để tra nghĩa, ví dụ và cách đọc',
      'Thẻ ôn tập ngắt quãng (SRS) nhắc ôn đúng lúc bạn sắp quên',
      'Lộ trình 90 ngày cho tiếng Hàn và tiếng Anh, chia tới từng ngày',
      'Gia sư AI 24/7 trả lời theo đúng trình độ và tiến độ thật của bạn',
      'Luyện thi TOPIK và TOEIC với ngân hàng câu hỏi theo dạng đề thật',
      'Phần học chính miễn phí hoàn toàn',
    ],
  },
  {
    path: '/shadowing', title: 'Luyện Shadowing qua video · VyLing',
    desc: 'Luyện Shadowing trên video thật: dán link YouTube bất kỳ, hoặc chọn trong kho video đã kiểm chứng phụ đề tiếng Anh, Hàn, Trung, Nhật.',
    h1: 'Luyện Shadowing qua video bạn thích',
    lead: '113 video được chọn lọc cho 6 ngôn ngữ, mọi video đều đã xác nhận có phụ đề trước khi đưa vào kho.',
    points: [
      'Tiếng Hàn: 34 video từ mức vỡ lòng tới TOPIK 2',
      'Tiếng Anh: 46 video từ BBC Learning English, TED-Ed và các kênh hội thoại',
      'Tiếng Nhật, Trung, Đức, Việt: video cơ bản có phụ đề',
      'Lọc theo trình độ và độ dài; mỗi video hiện độ vừa sức so với vốn từ của bạn',
    ],
  },
  {
    path: '/tieng-han-3-thang', title: 'Tiếng Hàn 3 tháng — lộ trình 90 ngày · VyLing',
    desc: 'Lộ trình tiếng Hàn 90 ngày từ số 0: 805 từ lõi theo phương pháp ICES, 36 mẫu câu, 12 nhóm phát âm người Việt hay sai.',
    h1: 'Lộ trình học tiếng Hàn 90 ngày từ số 0',
    lead: 'Mười hai tuần chia tới từng ngày: học từ vựng theo chủ đề, ghép câu bằng mẫu câu của tuần, luyện phát âm rồi kiểm tra cuối tuần.',
    points: [
      '805 từ lõi chia 67 chủ đề, mỗi từ có phiên âm La-tinh và mẹo nhớ theo tiếng Việt',
      '36 mẫu câu ngữ pháp, mỗi tuần 3 mẫu để nói được câu hoàn chỉnh',
      '12 nhóm phát âm đúng lỗi người Việt hay mắc: bật hơi ㅋㅌㅍ, âm căng ㄲㄸㅃ, batchim ㄹ, nối âm',
      'Tháng 1 nền móng · tháng 2 ghép câu · tháng 3 tình huống đời thật',
      'Nhiệm vụ tự tick theo tiến độ học thật, không phải tự đánh dấu thủ công',
    ],
  },
  {
    path: '/luyen-thi-topik', title: 'Luyện thi TOPIK · VyLing',
    desc: 'Luyện thi TOPIK: 20 viên ngữ pháp theo cấp, ngân hàng câu nghe và đọc theo dạng đề thật, thi thử quy đổi thang 200 và chấm bài viết bằng AI.',
    h1: 'Luyện thi TOPIK online miễn phí',
    lead: 'TOPIK I gồm 듣기 30 câu trong 40 phút và 읽기 40 câu trong 60 phút, tổng 200 điểm — đạt 80 điểm là cấp 1, 140 điểm là cấp 2.',
    points: [
      '20 viên ngữ pháp cấp 1–2 hay ra thi, mỗi viên có bài luyện ngắn',
      'Ngân hàng câu nghe và đọc theo đúng dạng đề: đoán chủ đề, điền trợ từ, sắp xếp câu, tìm mục đích văn bản',
      'Thi thử có đồng hồ, quy đổi điểm thang 200 và ước lượng cấp',
      'Chấm bài viết 쓰기 bằng AI theo 4 tiêu chí TOPIK, chỉ rõ lỗi và viết lại bài chuẩn',
      'Sổ tay câu sai tự động, làm đúng thì gạch khỏi sổ',
    ],
  },
  {
    path: '/tieng-trung-3-thang', title: 'Tiếng Trung 3 tháng — lộ trình 90 ngày · VyLing',
    desc: 'Học tiếng Trung từ số 0 cho người Việt: từ vựng lõi theo phương pháp ICES, mẹo nhớ bám âm Hán–Việt, phiên âm pinyin và lộ trình theo khung HSK.',
    h1: 'Lộ trình học tiếng Trung 90 ngày từ số 0',
    lead: 'Mười hai tuần chia tới từng ngày, bám khung HSK 1–2: học từ theo chủ đề, sửa phát âm thanh điệu, ghép câu bằng khung câu của tuần rồi kiểm tra cuối tuần.',
    points: [
      '324 từ lõi chia 27 chủ đề, mỗi từ có pinyin và mẹo nhớ bám âm Hán–Việt',
      '10 nhóm phát âm đúng chỗ người Việt hay sai: bốn thanh, biến điệu thanh 3, zh-ch-sh, j-q-x, ü, -n/-ng',
      '36 khung câu chia đều 12 tuần để nói được câu hoàn chỉnh ngay từ tuần đầu',
      'Bấm vào chữ Hán trong phụ đề video là ra pinyin và nghĩa, không cần gõ lại',
      'Nối thẳng sang trang Luyện thi HSK 1–2 khi muốn thi lấy chứng chỉ',
    ],
  },
  {
    path: '/luyen-thi-hsk', title: 'Luyện thi HSK 1–2 · VyLing',
    desc: 'Luyện thi HSK 1–2: 18 viên ngữ pháp theo cấp, ngân hàng câu nghe và đọc theo dạng đề thật, bật/tắt pinyin từng câu, thi thử quy đổi thang 200.',
    h1: 'Luyện thi HSK 1–2 online miễn phí',
    lead: 'HSK 1 gồm 听力 20 câu và 阅读 20 câu; HSK 2 gồm 听力 35 câu và 阅读 25 câu. Cả hai cấp đều tính thang 200 điểm và 120 điểm là đạt.',
    points: [
      '18 viên ngữ pháp HSK 1–2 hay ra thi, mỗi viên có 3 điểm mấu chốt và 4 câu luyện',
      'Ngân hàng câu nghe và đọc theo đúng dạng đề: xét đúng/sai, nối câu hỏi – câu đáp, điền từ, sắp xếp câu',
      'Bật/tắt pinyin ngay trong lúc làm bài, đúng như đề HSK 1–2 thật luôn in kèm pinyin',
      'Thi thử có đồng hồ, quy đổi điểm 听力 + 阅读 thang 200 và ước lượng mốc đạt',
      'Sổ tay câu sai tự động, làm đúng thì gạch khỏi sổ',
    ],
  },
  {
    path: '/tieng-anh-giao-tiep', title: 'Tiếng Anh giao tiếp — lộ trình 90 ngày · VyLing',
    desc: 'Tiếng Anh giao tiếp theo quy tắc 3C: 3000 từ tần suất cao học kiểu flashcard có giọng US và UK, 18 bài ngữ pháp giao tiếp, 12 nhóm phát âm, tự tick theo tiến độ thật.',
    h1: 'Tiếng Anh giao tiếp từ số 0',
    lead: 'Theo quy tắc 3C (Compress – Compile – Consolidate): học đúng từ cần học, ghép thành câu, rồi củng cố bằng ôn tập ngắt quãng.',
    points: [
      '3000 từ tần suất cao chia 117 chủ đề, học kiểu flashcard lật thẻ có giọng đọc US và UK — đủ hiểu khoảng 90% hội thoại hằng ngày',
      '18 bài ngữ pháp giao tiếp từ to be tới câu điều kiện',
      '12 nhóm phát âm người Việt hay sai: âm cuối, /θ/, ship–sheep, trọng âm, nối âm',
      'Lịch 7 ngày cho từng tuần, mỗi việc có nút bấm đi thẳng tới chỗ học',
    ],
  },
  {
    path: '/luyen-thi-toeic', title: 'Luyện thi TOEIC · VyLing',
    desc: 'Luyện thi TOEIC: lộ trình 60 ngày, ngân hàng 504 câu đủ 7 Part, thi thử full test có đồng hồ và sổ tay câu sai.',
    h1: 'Luyện thi TOEIC online miễn phí',
    lead: 'Lộ trình 60 ngày từ mất gốc tới 750+, ngân hàng 504 câu tự biên soạn theo đúng định dạng đề thật của cả 7 Part.',
    points: [
      'Thi thử full test với đồng hồ hai phần: Nghe 45 phút, Đọc 75 phút',
      'Audio thu sẵn giọng bản ngữ cho Part 1–4, không phụ thuộc giọng máy',
      'Phân tích điểm yếu theo 31 nhãn kỹ năng và luyện trúng phần yếu',
      'Sổ tay câu sai có lịch ôn lại, màn ôn bài chi tiết sau mỗi lần thi',
    ],
  },
  {
    path: '/luyen-noi', title: 'Luyện nói với AI · VyLing',
    desc: 'Luyện nói với AI qua 20 tình huống đời thật: phỏng vấn, nhà hàng, khách sạn, khám bệnh, họp hành — có gợi ý câu và nhận xét ngay.',
    h1: 'Luyện nói ngoại ngữ với AI',
    lead: 'Hai mươi tình huống đời thật để tập nói mà không ngại sai, có gợi ý câu trả lời và nhận xét ngay sau mỗi lượt.',
    points: [
      'Tình huống đời sống: chào hỏi, nhà hàng, mua sắm, hỏi đường, khám bệnh, hiệu thuốc',
      'Tình huống công việc: phỏng vấn, họp, gọi điện, thuyết trình, trao đổi với sếp, networking',
      'Tiếng Hàn và tiếng Anh có lời thoại viết tay nên chạy được cả khi AI bận',
      'Bảng cụm từ nên thuộc trước mỗi tình huống',
    ],
  },
  {
    path: '/gia-su-ai', title: 'Gia sư AI 24/7 · VyLing',
    desc: 'Gia sư AI 24/7 hiểu đúng trình độ của bạn: giải thích ngữ pháp, sửa câu, gợi ý học gì hôm nay và lưu thẳng từ mới vào thẻ ôn tập.',
    h1: 'Gia sư AI 24/7 cho người tự học',
    lead: 'Hỏi bất cứ lúc nào: giải thích ngữ pháp, sửa câu bạn viết, chỉ cách nói tự nhiên, hoặc xin kế hoạch học cho hôm nay.',
    points: [
      'Gia sư biết bạn đã thuộc bao nhiêu từ, có bao nhiêu thẻ đến hạn và đang ở ngày mấy của lộ trình',
      'Mọi ví dụ đều kèm bản dịch tiếng Việt và nghe được',
      'Bấm một nút để lưu từ mới trong câu trả lời vào thẻ ôn tập',
      'Dùng được cả khi chưa đăng nhập',
    ],
  },
  {
    path: '/tu-vung', title: 'Từ vựng & ôn tập SRS · VyLing',
    desc: 'Kho từ vựng cá nhân và ôn tập ngắt quãng (SRS): học tới đâu lưu thẻ tới đó, hệ thống nhắc ôn đúng lúc sắp quên.',
    h1: 'Kho từ vựng và ôn tập ngắt quãng',
    lead: 'Mọi từ bạn lưu từ video, từ điển hay gia sư AI đều vào chung một kho, có lịch ôn riêng cho từng thẻ.',
    points: [
      'Ôn tập ngắt quãng theo thuật toán SM-2: nhớ tốt thì giãn xa, quên thì quay lại từ đầu',
      'Mỗi ngày chỉ ôn những thẻ đến hạn, thường 10–20 thẻ',
      'Gói từ theo ngữ cảnh dựng sẵn theo mục tiêu học của bạn',
    ],
  },
  {
    path: '/blog', title: 'Blog học ngoại ngữ · VyLing',
    desc: 'Blog VyLing: kinh nghiệm tự học tiếng Hàn, tiếng Anh, phương pháp ôn tập ngắt quãng và hướng dẫn luyện thi TOPIK, TOEIC.',
    h1: 'Blog học ngoại ngữ',
    lead: 'Kinh nghiệm tự học viết cho người Việt: mốc thời gian thực tế, phương pháp có cơ sở, không hứa hẹn viển vông.',
    points: [
      'Học tiếng Hàn bao lâu thì nói được?',
      'TOPIK là gì? Cấu trúc đề thi và cách ôn cho người mới',
      'Cách học tiếng Anh qua YouTube mà không bỏ cuộc',
      'Ôn tập ngắt quãng (SRS) là gì và vì sao nó hiệu quả?',
    ],
  },
  {
    path: '/tro-giup', title: 'Trợ giúp & câu hỏi thường gặp · VyLing',
    desc: 'Trợ giúp VyLing: hướng dẫn bắt đầu, xử lý lỗi phụ đề, cách hoạt động của thẻ ôn tập và câu hỏi thường gặp về tài khoản.',
    h1: 'Trợ giúp & câu hỏi thường gặp',
    lead: 'Hướng dẫn bắt đầu, xử lý sự cố hay gặp và giải thích cách các tính năng chính hoạt động.',
    points: [
      'Bắt đầu từ đâu, có bắt buộc tạo tài khoản không, đổi ngôn ngữ ở đâu',
      'Dán link báo không tìm thấy phụ đề thì làm sao',
      'Thẻ ôn tập và độ vừa sức i+1 hoạt động thế nào',
      'Vì sao có giới hạn lượt dùng AI mỗi ngày',
    ],
  },
  {
    path: '/ve-chung-toi', title: 'Về chúng tôi · VyLing',
    desc: 'VyLing là công cụ học ngoại ngữ qua video do người Việt làm cho người Việt tự học: dùng gì học nấy, phần học chính miễn phí, nói thật về tiến độ.',
    h1: 'Về VyLing',
    lead: 'Một công cụ học ngoại ngữ qua video, làm cho người Việt tự học, với ba nguyên tắc rõ ràng.',
    points: [
      'Dùng gì học nấy — chỉ dạy từ bạn sẽ gặp lại',
      'Phần học chính luôn miễn phí',
      'Nói thật về tiến độ, không hứa giỏi sau 7 ngày',
      'Nội dung tự biên soạn, video chỉ nhúng trình phát chính thức của YouTube',
    ],
  },
  {
    path: '/lien-he', title: 'Liên hệ · VyLing',
    desc: 'Liên hệ VyLing: gửi góp ý ngay trong web, email hợp tác nội dung và cách báo cáo bản quyền video.',
    h1: 'Liên hệ VyLing',
    lead: 'Cách nhanh nhất là nút Góp ý ở góc dưới bên phải màn hình; email dành cho các việc cần trao đổi dài.',
    points: [
      'Báo lỗi hoặc đề xuất tính năng bằng nút Góp ý ngay trong web',
      'Email: hello@vyling.vn cho hợp tác nội dung và câu hỏi tài khoản',
      'Báo cáo bản quyền: gửi email kèm đường dẫn video, chúng tôi gỡ ngay khi xác minh',
    ],
  },
  {
    path: '/dieu-khoan', title: 'Điều khoản sử dụng · VyLing',
    desc: 'Điều khoản sử dụng VyLing: quyền và nghĩa vụ khi dùng, bản quyền video YouTube, giới hạn của nội dung do AI tạo ra.',
    h1: 'Điều khoản sử dụng VyLing',
    lead: 'Những điều bạn đồng ý khi dùng VyLing, viết ngắn gọn và không vòng vo.',
    points: [
      'Phần học chính miễn phí; gói Plus chỉ thêm tiện ích và hạn mức AI cao hơn',
      'VyLing không lưu trữ video — video luôn chạy qua trình phát chính thức của YouTube',
      'Nội dung do AI tạo ra có thể sai, hãy coi là gợi ý học tập chứ không phải kết luận',
      'Xu là điểm thưởng trong ứng dụng, không quy đổi ra tiền',
      'Chủ sở hữu nội dung có thể yêu cầu gỡ video khỏi kho, xử lý trong 72 giờ',
    ],
  },
  {
    path: '/bao-mat', title: 'Chính sách quyền riêng tư · VyLing',
    desc: 'Chính sách quyền riêng tư VyLing: lưu những gì, gửi cho ai, giữ bao lâu, và cách bạn tự tải về hoặc xoá sạch dữ liệu của mình.',
    h1: 'Chính sách quyền riêng tư của VyLing',
    lead: 'Viết theo đúng những gì phần mềm đang làm: lưu gì, gửi cho ai, giữ bao lâu và bạn kiểm soát bằng cách nào.',
    points: [
      'Chưa đăng nhập thì dữ liệu học nằm trong trình duyệt của bạn, không gửi lên máy chủ',
      'Có tài khoản thì lưu email, tên và dữ liệu học để đồng bộ giữa các máy',
      'Không bán dữ liệu, không đặt quảng cáo theo dõi, không cookie theo dõi mặc định',
      'Câu gửi cho AI được chuyển tới Google Gemini để xử lý',
      'Tải về toàn bộ dữ liệu dạng JSON hoặc xoá sạch tài khoản bất cứ lúc nào',
      'Đo lường Google Analytics chỉ chạy sau khi bạn bấm Đồng ý',
    ],
  },
  {
    path: '/bang-gia', title: 'Bảng giá · VyLing',
    desc: 'Bảng giá VyLing: toàn bộ tính năng học chính miễn phí, gói Plus thêm tiện ích. Không ràng buộc, huỷ bất cứ lúc nào.',
    h1: 'Bảng giá VyLing',
    lead: 'Phần học chính miễn phí hoàn toàn. Gói Plus chỉ thêm tiện ích và hạn mức AI cao hơn.',
    points: [
      'Miễn phí: bài học từ video, phụ đề song ngữ, tra từ, thẻ SRS, lộ trình 90 ngày, luyện thi TOPIK và TOEIC',
      'Plus: hạn mức AI cao hơn và các tiện ích phụ',
      'Không khoá nội dung học sau tường phí',
    ],
  },
]

function build() {
  const indexPath = join(DIST, 'index.html')
  if (!existsSync(indexPath)) {
    console.error('[prerender] Chưa có dist/index.html — hãy chạy vite build trước.')
    process.exit(1)
  }
  const shell = readFileSync(indexPath, 'utf8')
  let count = 0

  for (const page of PAGES) {
    const url = SITE + (page.path === '/' ? '/' : page.path)
    const body = [
      '<div id="root">',
      '<main class="prerender-shell">',
      `<h1>${esc(page.h1)}</h1>`,
      `<p>${esc(page.lead)}</p>`,
      '<ul>',
      ...page.points.map((p) => `<li>${esc(p)}</li>`),
      '</ul>',
      '<nav><a href="/">Trang chủ</a> · <a href="/shadowing">Shadowing</a> · ',
      '<a href="/tieng-han-3-thang">Tiếng Hàn 3 tháng</a> · <a href="/tieng-anh-giao-tiep">Tiếng Anh giao tiếp</a> · ',
      '<a href="/luyen-thi-topik">Luyện thi TOPIK</a> · <a href="/luyen-thi-toeic">Luyện thi TOEIC</a> · ',
      '<a href="/tieng-trung-3-thang">Tiếng Trung 3 tháng</a> · <a href="/luyen-thi-hsk">Luyện thi HSK</a> · ',
      '<a href="/blog">Blog</a> · <a href="/tro-giup">Trợ giúp</a></nav>',
      '</main>',
      '</div>',
    ].join('')

    let html = shell
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/, `$1${esc(page.desc)}$2`)
      .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/, `$1${esc(page.title)}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/, `$1${esc(page.desc)}$2`)
      .replace(/(<meta\s+property="og:url"\s+content=")[\s\S]*?(")/, `$1${url}$2`)
      .replace(/(<link\s+rel="canonical"\s+href=")[\s\S]*?(")/, `$1${url}$2`)
      .replace('<div id="root"></div>', body)

    if (page.path === '/') {
      writeFileSync(indexPath, html, 'utf8')
    } else {
      const dir = join(DIST, page.path.replace(/^\//, ''))
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'index.html'), html, 'utf8')
    }
    count += 1
  }
  console.log(`[prerender] Đã sinh HTML tĩnh cho ${count} trang công khai.`)
}

build()
