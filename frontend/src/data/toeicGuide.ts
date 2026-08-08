
export interface ExamRow {
  part: string
  task: string
  count: string
}

export interface ExamSpec {
  id: 'lr' | 'speaking' | 'writing'
  name: string
  vi: string
  summary: string
  scale: string
  rows: ExamRow[]
  notes: string[]
}

export const EXAM_SPECS: ExamSpec[] = [
  {
    id: 'lr',
    name: 'TOEIC Listening and Reading',
    vi: 'Nghe và Đọc',
    summary: '200 câu trắc nghiệm · Nghe 100 câu trong khoảng 45 phút · Đọc 100 câu trong 75 phút',
    scale: 'Hai thang riêng, mỗi thang 5–495 điểm, tổng 10–990',
    rows: [
      { part: 'Part 1', task: 'Nghe bốn câu mô tả một bức ảnh và chọn câu phù hợp nhất', count: '6' },
      { part: 'Part 2', task: 'Nghe một câu hỏi hoặc phát biểu và chọn phản hồi phù hợp', count: '25' },
      { part: 'Part 3', task: 'Nghe 13 đoạn hội thoại, mỗi đoạn ba câu hỏi', count: '39' },
      { part: 'Part 4', task: 'Nghe 10 bài nói ngắn, mỗi bài ba câu hỏi', count: '30' },
      { part: 'Part 5', task: 'Chọn từ hoặc cụm từ hoàn thành câu', count: '30' },
      { part: 'Part 6', task: 'Hoàn thành bốn văn bản ngắn', count: '16' },
      { part: 'Part 7', task: 'Đọc các văn bản đơn', count: '29' },
      { part: 'Part 7', task: 'Đọc năm nhóm gồm hai hoặc ba văn bản', count: '25' },
    ],
    notes: [
      'Điểm được quy đổi từ số câu đúng sang thang chuẩn hoá để giảm ảnh hưởng của khác biệt độ khó giữa các mã đề. Số câu đúng không cộng trực tiếp thành điểm báo cáo, nên mọi bảng quy đổi không chính thức chỉ là ước lượng rất thô.',
      'Không có hình phạt trừ điểm riêng cho câu trả lời sai, vì vậy trong phòng thi không nên bỏ trống câu nào. Điều đó không có nghĩa đoán ngẫu nhiên là một chiến lược học tập.',
      'ETS không áp dụng một mức “đỗ” chung. Trường học hoặc doanh nghiệp tự đặt ngưỡng, nên mục tiêu phải bắt đầu từ yêu cầu thực tế của nơi nhận điểm.',
    ],
  },
  {
    id: 'speaking',
    name: 'TOEIC Speaking',
    vi: 'Nói',
    summary: '11 câu · khoảng 20 phút',
    scale: 'Thang 0–200',
    rows: [
      { part: 'Câu 1–2', task: 'Đọc thành tiếng một văn bản', count: '45 giây chuẩn bị · 45 giây trả lời' },
      { part: 'Câu 3–4', task: 'Mô tả một bức tranh', count: '45 giây chuẩn bị · 30 giây trả lời' },
      { part: 'Câu 5–6', task: 'Trả lời câu hỏi ngắn', count: '3 giây chuẩn bị · 15 giây trả lời' },
      { part: 'Câu 7', task: 'Trả lời câu hỏi mở rộng cùng chủ đề', count: '3 giây chuẩn bị · 30 giây trả lời' },
      { part: 'Câu 8–9', task: 'Trả lời dựa trên thông tin cho sẵn', count: '45 giây đọc dữ liệu · 3 giây trước mỗi câu · 15 giây trả lời' },
      { part: 'Câu 10', task: 'Trả lời tổng hợp dựa trên dữ liệu (câu hỏi phát hai lần)', count: '3 giây chuẩn bị · 30 giây trả lời' },
      { part: 'Câu 11', task: 'Trình bày quan điểm', count: '45 giây chuẩn bị · 60 giây trả lời' },
    ],
    notes: [
      'Tiêu chí chấm tăng dần theo độ phức tạp: câu 1–2 tập trung phát âm, ngữ điệu và trọng âm; câu 3–4 bổ sung ngữ pháp, từ vựng và tính liên kết; từ câu 5 trở đi thêm mức độ liên quan và độ đầy đủ của nội dung.',
      'Phát âm là điều kiện để thông điệp hiểu được, nhưng mục tiêu là dễ hiểu chứ không phải bắt chước hoàn hảo giọng Mỹ hay Anh.',
      'Điểm Speaking và Writing báo cáo riêng, không cộng lại thành một tổng để so trực tiếp với Listening and Reading.',
    ],
  },
  {
    id: 'writing',
    name: 'TOEIC Writing',
    vi: 'Viết',
    summary: '8 câu · khoảng 60 phút',
    scale: 'Thang 0–200',
    rows: [
      { part: 'Câu 1–5', task: 'Viết một câu dựa trên tranh, dùng hai từ hoặc cụm từ bắt buộc', count: '8 phút cho toàn bộ năm câu' },
      { part: 'Câu 6–7', task: 'Viết email phản hồi một yêu cầu', count: '10 phút cho mỗi email' },
      { part: 'Câu 8', task: 'Viết bài luận trình bày quan điểm', count: '30 phút' },
    ],
    notes: [
      'Câu 1–5 chấm ngữ pháp và mức độ phù hợp với hình ảnh. Câu 6–7 thêm chất lượng và sự đa dạng của câu, từ vựng và tổ chức. Câu 8 xét thêm mức độ quan điểm được hỗ trợ bằng lý do hoặc ví dụ.',
      'ETS mô tả một bài luận hiệu quả thường có tối thiểu khoảng 300 từ. Đây là mô tả độ dài thường thấy, không phải quy tắc “đủ 300 từ thì điểm cao”.',
      'Bài thi làm trên máy tính, nên tốc độ gõ ảnh hưởng đến thời gian lập ý và sửa bài — nhưng không được đánh đổi bằng thói quen bỏ chủ ngữ hay không đọc lại.',
    ],
  },
]

export interface ErrorCode {
  code: string
  vi: string
  hint: string
  fix: string
}

export const ERROR_CODES: ErrorCode[] = [
  { code: 'LEX', vi: 'Từ vựng', hint: 'Không biết từ, hoặc biết nghĩa lẻ nhưng không nhận ra trong cụm.', fix: 'Học theo cụm có ngữ cảnh và luyện nhận ra cách diễn đạt tương đương (moved to a later date ↔ postponed).' },
  { code: 'GRM', vi: 'Ngữ pháp', hint: 'Sai vì cấu trúc: từ loại, thì, hoà hợp chủ vị, bị động, liên từ.', fix: 'Quay lại viên nang ngữ pháp tương ứng, rồi tự tạo một câu mới cùng cấu trúc để kiểm tra chuyển giao.' },
  { code: 'AUD', vi: 'Nhận diện âm', hint: 'Biết từ khi nhìn mặt chữ nhưng không nhận ra khi nghe.', fix: 'Nghe theo cụm 3–8 giây, đánh dấu chỗ mất thông tin, rồi mới mở bản chép lời và nghe lại kèm chữ.' },
  { code: 'DIS', vi: 'Mạch diễn ngôn', hint: 'Nghe hoặc đọc được từng câu nhưng không nối được mục đích, vấn đề, quyết định.', fix: 'Sau mỗi bài, vẽ sơ đồ ngắn: ai – mục đích – vấn đề – giải pháp – hành động tiếp.' },
  { code: 'TASK', vi: 'Hiểu sai yêu cầu', hint: 'Trả lời thiếu vế, làm một trong hai yêu cầu, hoặc chọn chi tiết đúng nhưng bỏ điều kiện.', fix: 'Gạch yêu cầu trước khi làm; khi kiểm tra thì đọc lại đề trước rồi mới đọc bài của mình.' },
  { code: 'TIME', vi: 'Quản lý thời gian', hint: 'Mất quá nhiều thời gian cho một câu nên hụt phần sau.', fix: 'Đặt mốc theo dữ liệu luyện tập của chính bạn, và tập bỏ một câu đúng lúc thay vì cố đến cùng.' },
  { code: 'PRON', vi: 'Phát âm cản trở hiểu', hint: 'Lỗi âm cuối, trọng âm hoặc ngắt nhóm khiến người nghe phải đoán.', fix: 'Ưu tiên lỗi tần suất cao làm giảm hiểu; ghi âm trước và sau để so, mỗi lần chỉ sửa một đến ba mục tiêu.' },
  { code: 'ORG', vi: 'Tổ chức bài nói/viết', hint: 'Có ý nhưng thứ tự lộn xộn, đoạn không có trọng tâm, liên kết yếu.', fix: 'Lập dàn ý bằng năm nhãn ngắn trước khi nói hoặc viết; kiểm tra mỗi đoạn chỉ có một ý trung tâm.' },
]

export const ERROR_PRIORITY: string[] = [
  'Sửa trước: lỗi làm sai nhiệm vụ, hoặc làm người nghe và người đọc hiểu sai.',
  'Sửa tiếp: lỗi lặp lại có tần suất cao, kể cả khi từng lỗi riêng lẻ không nghiêm trọng.',
  'Sửa sau: lỗi hiếm và không cản trở hiểu — một lựa chọn từ chưa tinh tế không quan trọng bằng một câu thiếu động từ chính.',
  'Sau khi sửa, phải gặp một ví dụ MỚI. Nhận ra đáp án cũ có thể chỉ là nhớ đáp án, không phải nắm quy tắc.',
]

export interface WeekPhase {
  range: string
  focus: string
  output: string
}

export const PLAN_12W: WeekPhase[] = [
  {
    range: 'Tuần 1–2',
    focus: 'Chẩn đoán; cấu trúc câu; loại từ; âm cuối; từ vựng văn phòng và lịch trình; Part 1, Part 2, Part 5; đọc thành tiếng.',
    output: 'Bản ghi âm ban đầu, bài viết ban đầu, nhật ký lỗi và bộ từ vựng có âm thanh.',
  },
  {
    range: 'Tuần 3–4',
    focus: 'Hệ thống động từ; hỏi và phản hồi; nghe theo cụm; Part 3 cơ bản; Part 6; mô tả tranh; viết câu từ ảnh.',
    output: 'Một bài Listening rút gọn, bốn bài mô tả tranh và 20 câu Writing từ ảnh.',
  },
  {
    range: 'Tuần 5–6',
    focus: 'Giới từ, liên từ, mệnh đề; diễn đạt tương đương; Part 4; Part 7 đoạn đơn; câu hỏi Speaking ngắn; email yêu cầu thông tin.',
    output: 'Hai email hoàn chỉnh, một bài Reading có bấm giờ và bản ghi câu 5–7.',
  },
  {
    range: 'Tuần 7–8',
    focus: 'Kết nối nhiều nguồn thông tin; Part 7 văn bản đôi và ba; Speaking câu 8–10; email đề xuất hoặc xử lý vấn đề.',
    output: 'Bốn bài đọc nhiều văn bản, bốn bộ trả lời theo lịch trình và hai email.',
  },
  {
    range: 'Tuần 9–10',
    focus: 'Tổ chức lập luận; Speaking câu 11; Writing bài luận; tích hợp từ vựng và ngữ pháp.',
    output: 'Bốn bài nói một phút và hai bài luận 30 phút có sửa.',
  },
  {
    range: 'Tuần 11–12',
    focus: 'Luyện thời gian; đề rút gọn và đề đầy đủ có chọn lọc; ôn lỗi lặp lại; điều chỉnh chiến lược.',
    output: 'Một hoặc hai bài mô phỏng, báo cáo tiến bộ và kế hoạch giai đoạn tiếp theo.',
  },
]

export const PLAN_12W_NOTES: string[] = [
  'Đây là chương trình tham khảo, giả định học khoảng sáu đến chín giờ mỗi tuần. Không phải lịch chính thức của ETS và không bảo đảm một mức điểm.',
  'Hai tuần đầu KHÔNG cố bao phủ toàn bộ đề. Giai đoạn này tạo công cụ: cách phân tích câu, cách ghi từ, cách nghe với bản chép lời, cách ghi âm, cách viết nhật ký lỗi.',
  'Mỗi tuần cần ít nhất một phiên chỉ để truy hồi và sửa lỗi, không học nội dung mới: làm lại câu từng sai mà không xem đáp án, nói lại câu cũ, viết lại email từ dàn ý.',
  'Một tuần hiệu quả xoay cùng một chủ đề qua bốn kỹ năng. Ví dụ chủ đề giao hàng: học cụm từ → gặp lại ở Part 2 và Part 3 → đọc email và hoá đơn ở Part 7 → đóng vai trả lời khách và viết email giải thích chậm trễ.',
]

export const SESSION_90: { step: string; body: string }[] = [
  { step: 'Mở đầu', body: 'Truy hồi từ và cấu trúc của buổi trước — tự nói ra, không nhìn ghi chú.' },
  { step: 'Phần chính', body: 'Một kỹ năng tiếp nhận (Part 3 hoặc Part 7): làm bài, xác định bằng chứng cho từng đáp án, chữa lỗi.' },
  { step: 'Chuyển kỹ năng', body: 'Cùng chủ đề đó chuyển sang một nhiệm vụ sản sinh: trả lời theo lịch trình, hoặc viết email xác nhận thay đổi.' },
  { step: 'Kết phiên', body: 'Ghi hai hoặc ba kết luận có thể hành động cho buổi sau.' },
]

export const FOUR_STRANDS: { name: string; body: string }[] = [
  { name: 'Đầu vào có thể hiểu được', body: 'Nghe và đọc nội dung vừa sức, chú trọng nghĩa chứ không phải phân tích.' },
  { name: 'Học ngôn ngữ có chủ đích', body: 'Học từ vựng, ngữ pháp và phát âm một cách có mục tiêu.' },
  { name: 'Đầu ra chú trọng nghĩa', body: 'Nói và viết để truyền một thông điệp thật, không chỉ làm bài tập.' },
  { name: 'Phát triển độ trôi chảy', body: 'Làm lại nội dung đã quen trong thời gian giới hạn, không dừng để sửa từng lỗi.' },
]

export const SPACING_STEPS = ['sau 1 ngày', 'sau 3 ngày', 'sau 7 ngày', 'sau 2 tuần']

export const LISTEN_CYCLE: { step: string; body: string }[] = [
  { step: '1. Làm như thi', body: 'Nghe một lượt trong điều kiện gần bài thi. Ngoài đúng hay sai, tự tóm tắt: ai đang nói, họ làm gì, vấn đề là gì, chi tiết nào quyết định đáp án. Bản tóm tắt này lộ ra câu đúng do đoán.' },
  { step: '2. Nghe theo cụm', body: 'Nghe lại từng cụm 3–8 giây và đánh dấu vị trí mất thông tin. Nếu không nhận ra một từ, thử đoán loại từ và vai trò nghĩa TRƯỚC khi mở bản chép lời.' },
  { step: '3. Mở bản chép lời', body: 'Chỉ mở sau khi đã nỗ lực xử lý âm thanh. Tập trung vào chỗ khác với hình dung ban đầu: dạng yếu của trợ động từ, âm cuối nối sang từ sau, cụm quen được phát nhanh. Không cần dịch toàn bộ.' },
  { step: '4. Tái tạo', body: 'Nói theo một nhóm ý để bắt nhịp và trọng âm, rồi tự kể lại nội dung bằng câu của mình. Không cần thuộc nguyên văn.' },
]

export const READ_CYCLE: { step: string; body: string }[] = [
  { step: 'Lượt 1', body: 'Đọc theo thời gian và trả lời câu hỏi.' },
  { step: 'Lượt 2', body: 'Đánh dấu bằng chứng cho từng đáp án, phân tích cách diễn đạt tương đương, ghi lại chỗ đã đọc sai.' },
  { step: 'Lượt 3', body: 'Tóm tắt văn bản bằng một hoặc hai câu.' },
  { step: 'Lượt 4', body: 'Viết một tiêu đề khác hoặc đặt một câu hỏi mới cho văn bản.' },
  { step: 'Sau vài ngày', body: 'Đọc lại với mục tiêu nhanh hơn nhưng giữ nguyên độ chính xác.' },
]

export const READ_TIMING: string[] = [
  'ETS cho 75 phút cho Reading nhưng KHÔNG chia thời gian bắt buộc cho từng Part, nên mọi mốc theo phần chỉ là khuyến nghị.',
  'Mốc tham khảo cho người mới: 12–15 phút cho Part 5, 8–10 phút cho Part 6, phần còn lại cho Part 7.',
  'Đừng ép tốc độ quá sớm — giai đoạn đầu cần chậm đủ để phân tích chính xác, rồi mới rút dần thời gian.',
  'Một câu Part 5 không nên tốn thời gian ngang một nhóm ba văn bản. Không chắc thì chọn phương án tốt nhất và đi tiếp.',
]

export const MISCONCEPTIONS: { wrong: string; right: string }[] = [
  { wrong: 'Chiến thuật có thể thay thế nền tảng.', right: 'Chiến lược giúp phân bổ chú ý, nhưng không giúp hiểu một từ hoàn toàn chưa biết hay tạo một câu đúng khi chưa nắm cấu trúc.' },
  { wrong: 'Listening và Reading cao thì Speaking và Writing sẽ tự cao.', right: 'Các kỹ năng có quan hệ với nhau, nhưng nhiệm vụ sản sinh đòi hỏi truy hồi, tổ chức và kiểm soát ngôn ngữ theo thời gian thực. Phải luyện trực tiếp.' },
  { wrong: 'Nói càng giống người bản ngữ càng tốt.', right: 'Mục tiêu căn bản là lời nói dễ hiểu, phù hợp và đầy đủ. Giọng địa phương không tự động đồng nghĩa với giao tiếp kém.' },
  { wrong: 'Bài luận đủ 300 từ sẽ đạt điểm tốt.', right: 'ETS chỉ mô tả độ dài thường thấy của một bài hiệu quả. Bài 300 từ nhưng lạc đề, lặp ý hoặc tổ chức yếu vẫn không đạt tiêu chí.' },
  { wrong: 'Làm càng nhiều đề càng tiến bộ.', right: 'Số đề chỉ có nghĩa khi đi kèm phân tích và chuyển giao. Lặp cùng một lỗi qua nhiều đề chỉ củng cố thói quen sai.' },
  { wrong: 'Có một bảng quy đổi số câu đúng sang điểm áp dụng cố định.', right: 'Điểm Listening and Reading được chuẩn hoá, nên các bảng bên ngoài không phải bảng chính thức dùng cho mọi mã đề.' },
]

export interface GrammarFrameRow {
  topic: string
  fn: string
  example: string
}

export const GRAMMAR_FRAME: GrammarFrameRow[] = [
  { topic: 'Cấu trúc chủ ngữ và động từ', fn: 'Xác định ai hoặc điều gì thực hiện hành động', example: 'The maintenance team checks the equipment every month.' },
  { topic: 'Hiện tại đơn', fn: 'Mô tả lịch trình, thói quen, chính sách', example: 'The store opens at nine.' },
  { topic: 'Hiện tại tiếp diễn', fn: 'Mô tả hành động đang xảy ra hoặc sắp xếp tạm thời', example: 'Several customers are waiting near the counter.' },
  { topic: 'Quá khứ đơn', fn: 'Kể lại sự việc đã hoàn tất', example: 'The supplier delivered the order yesterday.' },
  { topic: 'Hiện tại hoàn thành', fn: 'Kinh nghiệm, thay đổi hoặc kết quả liên quan hiện tại', example: 'We have updated the reservation system.' },
  { topic: 'Tương lai với will và be going to', fn: 'Dự định, dự đoán hoặc quyết định', example: 'I will send the revised document this afternoon.' },
  { topic: 'Động từ khuyết thiếu', fn: 'Khả năng, nghĩa vụ, đề nghị và lời khuyên', example: 'Could you confirm the delivery address?' },
  { topic: 'Bị động', fn: 'Đặt trọng tâm vào đối tượng hoặc kết quả', example: 'All applications must be submitted online.' },
  { topic: 'Danh từ đếm được và không đếm được', fn: 'Kiểm soát số, lượng từ và động từ', example: 'The information is available on our website.' },
  { topic: 'Mạo từ', fn: 'Đánh dấu thông tin mới, đã xác định hoặc khái quát', example: 'A technician will inspect the printer. The inspection will take an hour.' },
  { topic: 'Đại từ và từ sở hữu', fn: 'Duy trì tham chiếu trong văn bản', example: 'Ms. Lee received the package, but she has not opened it yet.' },
  { topic: 'Tính từ và trạng từ', fn: 'Mô tả danh từ hoặc cách thức hành động', example: 'The new system processes requests efficiently.' },
  { topic: 'Giới từ thời gian và nơi chốn', fn: 'Xác định mốc, khoảng và vị trí', example: 'The meeting will be held in Room 3 at 2 p.m.' },
  { topic: 'Liên từ đẳng lập', fn: 'Nối các ý ngang hàng', example: 'The room is small, but it is well equipped.' },
  { topic: 'Liên từ phụ thuộc', fn: 'Nguyên nhân, điều kiện, thời gian và nhượng bộ', example: 'Because the flight was delayed, the meeting started late.' },
  { topic: 'Mệnh đề quan hệ', fn: 'Bổ sung thông tin về người hoặc vật', example: 'The employee who answered the call was very helpful.' },
  { topic: 'So sánh', fn: 'So sánh lựa chọn, giá, tốc độ hoặc chất lượng', example: 'The online option is more convenient than the paper form.' },
  { topic: 'Động từ nguyên mẫu và danh động từ', fn: 'Hoàn thành mẫu của động từ hoặc diễn đạt mục đích', example: 'We plan to expand the service. / The company recommends booking early.' },
]

export const GRAMMAR_FRAME_RULE = 'Một chủ điểm chỉ được xem là “đã học” khi bạn nhận diện được nó trong Listening và Reading, ĐỒNG THỜI tự tạo được câu của mình trong Speaking và Writing.'

export interface PhraseField {
  field: string
  items: { en: string; vi: string }[]
}

export const PHRASE_FIELDS: PhraseField[] = [
  {
    field: 'Lịch và cuộc hẹn',
    items: [
      { en: 'schedule a meeting', vi: 'lên lịch cuộc họp' },
      { en: 'confirm an appointment', vi: 'xác nhận cuộc hẹn' },
      { en: 'change the date', vi: 'đổi ngày' },
      { en: 'be available', vi: 'có thể tham gia' },
      { en: 'cancel at short notice', vi: 'huỷ sát giờ' },
    ],
  },
  {
    field: 'Văn phòng',
    items: [
      { en: 'submit a report', vi: 'nộp báo cáo' },
      { en: 'attend a meeting', vi: 'dự họp' },
      { en: 'review a document', vi: 'xem lại tài liệu' },
      { en: 'meet a deadline', vi: 'hoàn thành đúng hạn' },
      { en: 'update a file', vi: 'cập nhật tệp' },
    ],
  },
  {
    field: 'Tuyển dụng',
    items: [
      { en: 'apply for a position', vi: 'ứng tuyển một vị trí' },
      { en: 'attend an interview', vi: 'tham dự phỏng vấn' },
      { en: 'meet the qualifications', vi: 'đáp ứng yêu cầu về trình độ' },
      { en: 'hire a candidate', vi: 'tuyển một ứng viên' },
      { en: 'receive training', vi: 'được đào tạo' },
    ],
  },
  {
    field: 'Mua hàng',
    items: [
      { en: 'place an order', vi: 'đặt hàng' },
      { en: 'make a payment', vi: 'thanh toán' },
      { en: 'receive a discount', vi: 'được giảm giá' },
      { en: 'request a refund', vi: 'yêu cầu hoàn tiền' },
      { en: 'keep the receipt', vi: 'giữ lại biên lai' },
    ],
  },
  {
    field: 'Giao hàng',
    items: [
      { en: 'shipping address', vi: 'địa chỉ giao hàng' },
      { en: 'delivery date', vi: 'ngày giao hàng' },
      { en: 'track a package', vi: 'theo dõi bưu kiện' },
      { en: 'experience a delay', vi: 'bị chậm trễ' },
      { en: 'arrive on time', vi: 'đến đúng giờ' },
    ],
  },
  {
    field: 'Du lịch',
    items: [
      { en: 'book a flight', vi: 'đặt vé máy bay' },
      { en: 'check in', vi: 'làm thủ tục' },
      { en: 'boarding pass', vi: 'thẻ lên máy bay' },
      { en: 'departure gate', vi: 'cửa khởi hành' },
      { en: 'public transportation', vi: 'giao thông công cộng' },
    ],
  },
  {
    field: 'Khách sạn',
    items: [
      { en: 'make a reservation', vi: 'đặt chỗ' },
      { en: 'single room', vi: 'phòng đơn' },
      { en: 'front desk', vi: 'quầy lễ tân' },
      { en: 'check-out time', vi: 'giờ trả phòng' },
      { en: 'complimentary breakfast', vi: 'bữa sáng miễn phí' },
    ],
  },
  {
    field: 'Sự kiện',
    items: [
      { en: 'register for a conference', vi: 'đăng ký hội nghị' },
      { en: 'admission fee', vi: 'phí tham dự' },
      { en: 'change the venue', vi: 'đổi địa điểm' },
      { en: 'give a presentation', vi: 'thuyết trình' },
      { en: 'provide refreshments', vi: 'phục vụ đồ ăn nhẹ và thức uống' },
    ],
  },
  {
    field: 'Dịch vụ khách hàng',
    items: [
      { en: 'respond to an inquiry', vi: 'phản hồi yêu cầu thông tin' },
      { en: 'file a complaint', vi: 'gửi đơn khiếu nại' },
      { en: 'resolve a problem', vi: 'giải quyết vấn đề' },
      { en: 'apologize for the inconvenience', vi: 'xin lỗi vì sự bất tiện' },
      { en: 'provide assistance', vi: 'hỗ trợ' },
    ],
  },
  {
    field: 'Thiết bị và bảo trì',
    items: [
      { en: 'install software', vi: 'cài đặt phần mềm' },
      { en: 'repair a machine', vi: 'sửa máy' },
      { en: 'perform an inspection', vi: 'tiến hành kiểm tra' },
      { en: 'replace a part', vi: 'thay linh kiện' },
      { en: 'out of service', vi: 'ngừng hoạt động' },
    ],
  },
  {
    field: 'Tài chính thường ngày',
    items: [
      { en: 'bank account', vi: 'tài khoản ngân hàng' },
      { en: 'monthly fee', vi: 'phí hằng tháng' },
      { en: 'issue an invoice', vi: 'xuất hoá đơn' },
      { en: 'approve a budget', vi: 'phê duyệt ngân sách' },
      { en: 'payment is due', vi: 'đến hạn thanh toán' },
    ],
  },
  {
    field: 'Sức khoẻ và lịch hẹn',
    items: [
      { en: 'medical appointment', vi: 'lịch khám' },
      { en: 'fill a prescription', vi: 'lấy thuốc theo đơn' },
      { en: 'reschedule a visit', vi: 'đổi lịch khám' },
      { en: 'health insurance', vi: 'bảo hiểm y tế' },
      { en: 'waiting room', vi: 'phòng chờ' },
    ],
  },
]

export const PHRASE_RULE = 'Mỗi cụm nên được học qua ít nhất bốn biểu hiện: nghĩa, âm thanh, một câu bạn tiếp nhận và một câu bạn tự tạo. Ví dụ với meet a deadline: nghe một hội thoại có cụm này, đọc một email nhắc hạn, nói về cách hoàn thành công việc đúng hạn, rồi viết một câu đề xuất đổi lịch.'

export const EXAM_DAY: { title: string; body: string }[] = [
  { title: 'Khi nào nên làm đề đầy đủ', body: 'Đề đầy đủ kiểm tra sức bền và quản lý thời gian, nhưng ở giai đoạn rất sớm nó tạo nhiều lỗi hơn khả năng chữa. Bắt đầu bằng bộ rút gọn rồi tăng dần. Một đề được phân tích kỹ có thể cung cấp chương trình học cho nhiều ngày; ba đề không chữa thì lãng phí dữ liệu.' },
  { title: 'Điều kiện mô phỏng', body: 'Thời gian liên tục, không dừng âm thanh, không tra từ, không ghi chú. Speaking dùng tai nghe và micrô, Writing gõ trực tiếp. Quy định không ghi chú trong sổ tay ETS 2025 áp dụng cho cả bốn kỹ năng — mọi thao tác đánh dấu trên giấy chỉ dành cho buổi học và giai đoạn chữa bài.' },
  { title: 'Trong bài Listening và Reading', body: 'Bỏ lỡ một chi tiết thì chọn phương án tốt nhất và chuyển ngay sang câu tiếp theo, tránh nghĩ tiếp khi âm thanh mới đã bắt đầu. Reading bám các mốc thời gian đã thử nghiệm trước; không đổi toàn bộ chiến lược vào ngày thi.' },
  { title: 'Trong Speaking và Writing', body: 'Nói ngay sau tín hiệu, quên từ thì diễn đạt lại, mắc lỗi thì sửa ngắn rồi tiếp tục — phục hồi là một phần của năng lực giao tiếp. Writing: đừng bấm chuyển câu trước khi kiểm tra, vì ở một số giao diện đã chuyển thì không quay lại được.' },
  { title: 'Trước ngày thi', body: 'Không phải lúc học một lượng lớn từ mới. Xem lại lỗi tần suất cao, các mẫu cấu trúc đã dùng ổn định, giấy tờ và yêu cầu đăng ký. Thông tin về giấy tờ và quy định phòng thi có thể thay đổi, phải kiểm tra thông báo hiện hành của IIG Việt Nam hoặc điểm thi.' },
]

export const GUIDE_SOURCE = 'Nội dung phần Cẩm nang, Speaking và Writing được biên soạn từ tài liệu "Hướng dẫn căn bản về TOEIC bốn kỹ năng" (The Forum Center, 31/07/2026), đối chiếu với thông tin chính thức của ETS và IIG Việt Nam. Các câu hỏi, hội thoại và văn bản trong bộ đề là nội dung nguyên bản, không phải đề thi thật.'
