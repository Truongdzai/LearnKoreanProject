export interface BlogSection {
  h: string
  p: string[]
  list?: string[]
}

export interface BlogPost {
  slug: string
  title: string
  answer: string
  desc: string
  date: string
  minutes: number
  tag: string
  emoji: string
  sections: BlogSection[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'hoc-tieng-han-bao-lau-thi-noi-duoc',
    title: 'Học tiếng Hàn bao lâu thì nói được?',
    answer:
      'Với 40–60 phút mỗi ngày và một lộ trình có thứ tự, phần lớn người Việt nói được những câu giao tiếp cơ bản (chào hỏi, hỏi đường, gọi món, mua sắm, thuê phòng) sau khoảng 3 tháng — tương đương vốn từ của TOPIK cấp 1. Nói cho rõ: đó là mức sinh tồn, còn xa cấp 2 và càng xa mức nói chuyện công việc. Ba tháng không làm bạn giỏi tiếng Hàn; nó làm bạn hết sợ tiếng Hàn.',
    desc: 'Mốc thời gian thực tế để nói được tiếng Hàn cơ bản, học bao nhiêu từ là đủ, và ba sai lầm khiến người mới học mãi không nói được.',
    date: '2026-07-30',
    minutes: 6,
    tag: 'Tiếng Hàn',
    emoji: '🇰🇷',
    sections: [
      {
        h: 'Ba tháng thật sự nghĩa là gì',
        p: [
          'Con số "3 tháng" chỉ có nghĩa khi gắn với khối lượng cụ thể. Ở mức giao tiếp cơ bản, bạn cần khoảng 500 từ dùng thường xuyên và chừng 30 mẫu câu — không cần nhiều hơn.',
          '40–60 phút mỗi ngày trong 90 ngày là khoảng 60–90 giờ. Để so sánh: tiếng Hàn thuộc nhóm ngôn ngữ khó nhất với người học nước ngoài, và mức dùng được trong công việc thường được tính bằng nghìn giờ. Nên hãy đặt kỳ vọng đúng: 90 ngày đưa bạn qua vạch xuất phát một cách vững vàng, không đưa bạn tới đích.',
          'Chia ra, đó là khoảng 6 từ mới mỗi ngày cộng một mẫu câu mỗi tuần. Nghe rất nhẹ, và đúng là nhẹ — cái khó nằm ở chỗ duy trì 90 ngày liên tục chứ không phải ở độ khó của từng ngày.',
        ],
      },
      {
        h: 'Vì sao nhiều người học một năm vẫn không nói được',
        p: ['Ba lỗi lặp đi lặp lại ở người mới:'],
        list: [
          'Học chữ cái quá lâu. Hangeul đọc được sau vài buổi, nhưng nhiều người dành cả tháng luyện viết mà chưa nói nổi một câu, rồi chán.',
          'Học từ rời rạc không có câu. Thuộc 500 từ mà không biết ghép thì vẫn đứng hình khi cần nói — từ vựng phải đi kèm mẫu câu.',
          'Nghe tài liệu quá khó. Xem phim Hàn không phụ đề từ ngày đầu chỉ tạo cảm giác thất bại; tài liệu phải nằm trong vùng bạn hiểu được khoảng 80–97%.',
        ],
      },
      {
        h: 'Thứ tự học hiệu quả cho người Việt',
        p: [
          'Người Việt có một lợi thế lớn ít ai tận dụng: khoảng 60% từ vựng tiếng Hàn là từ gốc Hán, trùng gốc với từ Hán–Việt. 회의 là "hội nghị", 안경 là "nhãn kính", 지하철 là "địa hạ thiết". Nhận ra quy luật này thì tốc độ nhớ từ tăng gấp đôi.',
          'Thứ tự nên đi: chào hỏi và xưng hô → từ để hỏi → động từ gốc và ăn uống → thời gian và hai hệ số đếm → tính từ → tình huống đời thật (mua sắm, đi lại, khám bệnh). Mỗi tuần thêm 2–3 mẫu câu để ghép từ đã học thành câu nói được ngay.',
        ],
      },
      {
        h: 'Cách đo xem mình có thật sự tiến bộ',
        p: [
          'Đừng đo bằng số giờ đã học — đo bằng số từ bạn còn nhớ sau một tuần. Ôn tập ngắt quãng (SRS) làm đúng việc này: nhắc bạn ôn vào đúng lúc sắp quên, nên mỗi từ chỉ tốn vài lần ôn là nhớ lâu.',
          'Một thước đo thứ hai rất hữu ích: mở một video tiếng Hàn cho người mới và xem bạn hiểu được bao nhiêu phần trăm. Khi con số đó vượt 80%, bạn đã bước vào giai đoạn học nhanh nhất.',
        ],
      },
    ],
  },
  {
    slug: 'topik-la-gi-cau-truc-de-thi',
    title: 'TOPIK là gì? Cấu trúc đề thi và cách ôn cho người mới',
    answer:
      'TOPIK (한국어능력시험) là kỳ thi năng lực tiếng Hàn chính thức của Hàn Quốc. TOPIK I dành cho cấp 1–2, gồm 듣기 (nghe) 30 câu trong 40 phút và 읽기 (đọc) 40 câu trong 60 phút, tổng 200 điểm — đạt 80 điểm là cấp 1, 140 điểm là cấp 2. TOPIK II dành cho cấp 3–6, có thêm phần 쓰기 (viết).',
    desc: 'Giải thích cấu trúc TOPIK I và II, mốc điểm từng cấp, các dạng câu hay ra và lộ trình ôn thi cho người mới bắt đầu.',
    date: '2026-07-30',
    minutes: 7,
    tag: 'Luyện thi',
    emoji: '🏆',
    sections: [
      {
        h: 'TOPIK I và TOPIK II khác nhau thế nào',
        p: [
          'TOPIK I chỉ có hai phần nghe và đọc, làm trong 100 phút, thang 200 điểm. Không có phần viết, không cần biết chữ Hán.',
          'TOPIK II dài hơn nhiều: 듣기 50 câu (60 phút), 쓰기 4 câu (50 phút) và 읽기 50 câu (70 phút), thang 300 điểm. Mốc: 120 điểm là cấp 3, 150 cấp 4, 190 cấp 5, 230 cấp 6.',
        ],
      },
      {
        h: 'Đề TOPIK I hỏi những dạng nào',
        p: ['Đề rất có quy luật, và biết trước quy luật là đã hơn nửa phần thắng:'],
        list: [
          'Nghe: trả lời câu hỏi ngắn (có/không, 5W1H), đoán nơi đang diễn ra hội thoại, nắm chủ đề, lấy chi tiết (giờ, giá, kế hoạch), suy luận câu tiếp theo.',
          'Đọc: đoán chủ đề đoạn văn, điền trợ từ hoặc từ vựng vào chỗ trống, đọc hiểu chi tiết, tìm ý chính, xác định mục đích của thông báo, sắp xếp câu theo thứ tự.',
          'Điểm chung: đề không hỏi "từ này nghĩa gì" mà hỏi bạn có dùng đúng trợ từ và đuôi câu trong ngữ cảnh hay không.',
        ],
      },
      {
        h: 'Phần viết 쓰기 mất điểm ở đâu',
        p: [
          'Lỗi khiến người Việt mất điểm oan nhiều nhất ở câu 53 và 54 không phải sai ngữ pháp, mà là dùng sai văn phong: hai câu này bắt buộc viết bằng thể văn viết 문어체 (-(ㄴ/는)다), trong khi thói quen nói hằng ngày là -아요/어요. Viết đúng nội dung mà sai thể là mất một phần điểm cố định.',
          'Lỗi thứ hai là không đủ số chữ. Câu 53 cần 200–300 chữ, câu 54 cần 600–700 chữ; thiếu chữ bị trừ thẳng dù bài hay.',
        ],
      },
      {
        h: 'Lộ trình ôn hợp lý',
        p: [
          'Với người mới, đừng lao vào làm đề ngay. Học trước bộ ngữ pháp hay ra thi theo từng viên nhỏ (trợ từ 은/는 và 이/가, 에 và 에서, các đuôi -아서/-(으)니까, -(으)면, -(으)ㄹ 수 있다…), mỗi viên luyện vài câu là chuyển sang viên kế tiếp.',
          'Khi đã qua khoảng 20 viên ngữ pháp cơ bản, bắt đầu làm đề theo dạng, rồi mới thi thử có bấm giờ. Sau mỗi lần thi thử, quan trọng nhất là xem lại câu sai — ghi vào một cuốn sổ và ôn lại sau vài ngày.',
        ],
      },
    ],
  },
  {
    slug: 'hoc-tieng-anh-qua-youtube',
    title: 'Cách học tiếng Anh qua YouTube mà không bỏ cuộc',
    answer:
      'Bí quyết không nằm ở việc xem thật nhiều, mà ở việc chọn video vừa sức: bạn nên hiểu được khoảng 80–97% số từ trong video. Xem 1–2 video ngắn mỗi ngày theo cách chủ động (dừng lại tra từ, lưu thẻ, nhại lại) hiệu quả hơn hẳn xem hàng giờ một cách thụ động.',
    desc: 'Phương pháp chọn video đúng trình độ, cách xem chủ động và những kênh an toàn cho người mới bắt đầu học tiếng Anh.',
    date: '2026-07-30',
    minutes: 6,
    tag: 'Tiếng Anh',
    emoji: '🎬',
    sections: [
      {
        h: 'Quy tắc i+1: chọn video hơi khó hơn mình một chút',
        p: [
          'Nhà ngôn ngữ học Stephen Krashen gọi đây là "đầu vào dễ hiểu": bạn học nhanh nhất khi nội dung chỉ khó hơn trình độ hiện tại một bậc. Cụ thể là hiểu được khoảng 80–97% số từ — đủ để nắm mạch nội dung mà vẫn còn từ mới để nhặt.',
          'Dưới 80% thì bạn phải tra quá nhiều, mất mạch và nản. Trên 98% thì dễ chịu nhưng gần như không học thêm được gì.',
        ],
      },
      {
        h: 'Xem chủ động khác xem thụ động thế nào',
        p: ['Cùng một video 6 phút, hai cách xem cho kết quả rất khác nhau:'],
        list: [
          'Lượt 1: xem hết, không dừng, chỉ nắm ý chính. Đừng tra từ ở lượt này.',
          'Lượt 2: xem lại với phụ đề, dừng ở những từ lặp lại nhiều lần và tra nghĩa — chỉ lưu từ nào bạn thấy sẽ dùng lại.',
          'Lượt 3: chọn 3–5 câu bạn thích và nhại lại đúng nhịp, đúng nối âm của người nói. Đây là bước biến từ "hiểu" thành "nói được".',
        ],
      },
      {
        h: 'Kênh an toàn cho người mới',
        p: [
          'BBC Learning English (loạt 6 Minute English) là lựa chọn tốt nhất cho trình độ B1: mỗi tập sáu phút, luôn có phụ đề chuẩn, chủ đề đời sống và tốc độ nói vừa phải.',
          'TED-Ed hợp khi bạn muốn nội dung khoa học ngắn, hình ảnh minh hoạ nhiều nên dễ đoán nghĩa. Với người mới hơn nữa, các kênh Easy English phỏng vấn đường phố cho bạn nghe tiếng Anh đời thật với phụ đề kép.',
        ],
      },
      {
        h: 'Biến việc xem thành tiến bộ đo được',
        p: [
          'Sau mỗi video, hãy để lại 3–8 thẻ từ mới, không hơn. Nhiều hơn thì bạn sẽ không ôn nổi và bỏ luôn cả bộ thẻ.',
          'Mỗi tuần nhìn lại một con số duy nhất: số thẻ đã chuyển sang trạng thái "nhớ chắc". Đó là thước đo trung thực hơn nhiều so với số giờ đã ngồi trước màn hình.',
        ],
      },
    ],
  },
  {
    slug: 'on-tap-ngat-quang-srs-la-gi',
    title: 'Ôn tập ngắt quãng (SRS) là gì và vì sao nó hiệu quả?',
    answer:
      'Ôn tập ngắt quãng là cách học trong đó mỗi từ được nhắc lại đúng vào lúc bạn sắp quên, với khoảng cách giãn dần: 1 ngày, 3 ngày, 1 tuần, 2 tuần, 1 tháng. Nhờ ôn đúng thời điểm, bạn nhớ được nhiều từ hơn với tổng thời gian ít hơn hẳn so với học nhồi.',
    desc: 'Giải thích đường cong quên của Ebbinghaus, cách thuật toán SRS hoạt động và cách dùng SRS mà không bị ngợp thẻ.',
    date: '2026-07-30',
    minutes: 5,
    tag: 'Phương pháp',
    emoji: '🧠',
    sections: [
      {
        h: 'Đường cong quên',
        p: [
          'Nhà tâm lý học Hermann Ebbinghaus phát hiện trí nhớ rơi rất nhanh trong những ngày đầu rồi chậm dần. Học xong một từ hôm nay, vài ngày sau bạn quên phần lớn — trừ khi gặp lại nó.',
          'Điểm mấu chốt: mỗi lần ôn lại đúng lúc sắp quên, đường cong dốc thoải hơn, tức là lần sau bạn nhớ được lâu hơn. Ôn quá sớm thì lãng phí, ôn quá muộn thì phải học lại từ đầu.',
        ],
      },
      {
        h: 'Thuật toán làm gì cho bạn',
        p: [
          'Hệ SRS lưu với mỗi thẻ một khoảng cách ôn và một hệ số dễ. Bạn trả lời "nhớ" thì khoảng cách nhân lên; trả lời "quên" thì thẻ quay về đầu hàng đợi.',
          'Kết quả là bạn không cần tự quyết định hôm nay ôn gì — mỗi ngày mở lên chỉ có đúng những thẻ đến hạn, thường 10–20 thẻ cho người học đều đặn.',
        ],
      },
      {
        h: 'Ba nguyên tắc để không bỏ cuộc',
        p: [],
        list: [
          'Chỉ thêm thẻ cho từ bạn thật sự sẽ dùng. Thêm 50 thẻ một ngày là công thức chắc chắn để bỏ cuộc sau một tuần.',
          'Ôn mỗi ngày một ít còn hơn dồn cuối tuần. Bỏ ba ngày là hàng đợi phình lên và cảm giác ngợp bắt đầu.',
          'Thẻ nào sai hoài thì sửa lại thẻ, đừng cố nhớ. Thường là do nghĩa quá mơ hồ hoặc thiếu câu ví dụ — thêm ngữ cảnh vào là nhớ được ngay.',
        ],
      },
    ],
  },
]

export const postBySlug = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find((p) => p.slug === slug)
