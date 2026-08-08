
export type SpeakSection = 'read' | 'picture' | 'question' | 'info' | 'opinion'

export interface SpeakSectionMeta {
  id: SpeakSection
  range: string
  name: string
  vi: string
  timing: string
  criteria: string[]
  how: string[]
  traps: string[]
  check: string[]
}

export interface InfoTable {
  title: string
  headers: string[]
  rows: string[][]
}

export interface SpeakTask {
  id: string
  set: number
  n: number
  section: SpeakSection
  prepSec: number
  answerSec: number
  prepNote?: string
  intro?: string
  text?: string
  chunks?: string
  stress?: string[]
  img?: string
  imgAlt?: string
  table?: InfoTable
  prompt?: string
  twice?: boolean
  sample: string
  why: string
}

export const SPEAK_SECTIONS: SpeakSectionMeta[] = [
  {
    id: 'read',
    range: 'Câu 1–2',
    name: 'Read a Text Aloud',
    vi: 'Đọc thành tiếng một văn bản',
    timing: '45 giây chuẩn bị · 45 giây đọc',
    criteria: ['Phát âm', 'Ngữ điệu', 'Trọng âm'],
    how: [
      'Dùng 45 giây chuẩn bị để chia văn bản thành nhóm ý theo dấu câu, không phải để đọc thầm cả bài.',
      'Đánh dấu bằng mắt các từ dài, tên riêng, số và ngày — đây là chỗ hay vấp.',
      'Chọn từ nội dung cần nhấn (danh từ, động từ chính, tính từ, trạng từ mang thông tin).',
      'Khi ghi âm: giữ tốc độ ổn định quan trọng hơn đọc nhanh.',
    ],
    traps: [
      'Đọc đều từng từ và ngắt sai chỗ khiến người nghe phải tự dựng lại câu.',
      'Phát âm sai một từ rồi dừng lâu hoặc quay lại đọc cả câu — hại hơn chính lỗi ban đầu.',
      'Ngắt máy móc sau mỗi hai ba từ theo một nhịp cố định.',
      'Bỏ âm cuối ở worked, needs, first làm mất dấu hiệu thì và số.',
    ],
    check: [
      'Đọc hết bài trong thời gian cho phép, không bỏ dở',
      'Ngắt theo nhóm nghĩa, không ngắt giữa cụm',
      'Âm cuối của các từ quan trọng nghe rõ',
      'Từ nội dung được nhấn nổi hơn từ chức năng',
      'Vấp dưới hai lần và không dừng lâu để sửa',
    ],
  },
  {
    id: 'picture',
    range: 'Câu 3–4',
    name: 'Describe a Picture',
    vi: 'Mô tả một bức tranh',
    timing: '45 giây chuẩn bị · 30 giây trả lời',
    criteria: ['Phát âm', 'Ngữ điệu', 'Trọng âm', 'Ngữ pháp', 'Từ vựng', 'Tính liên kết'],
    how: [
      'Chọn trật tự mô tả trong 45 giây: bối cảnh chung → người hoặc vật nổi bật → hành động → chi tiết nền.',
      'Mở bằng một câu định vị: This picture was taken in what looks like a small office.',
      'Nối các câu bằng while, and, next to, behind hoặc đại từ thay vì liệt kê rời rạc.',
      'Không biết tên chính xác một vật thì dùng danh từ khái quát: a piece of equipment, some documents.',
    ],
    traps: [
      'Nói quá cụ thể so với bằng chứng: They are discussing a contract khi ảnh chỉ cho thấy họ nhìn giấy.',
      'Im lặng để cố nhớ một từ hiếm — mất nhiều giây hơn giá trị của từ đó.',
      'Liệt kê mọi vật trong ảnh mà không có liên kết giữa các câu.',
      'Năm câu hiện tại tiếp diễn giống hệt nhau, đúng ngữ pháp nhưng rời rạc.',
    ],
    check: [
      'Có câu định vị bối cảnh chung ở đầu',
      'Nêu được đối tượng chính và hành động của họ',
      'Có ít nhất một chi tiết vị trí (in the foreground, next to, behind…)',
      'Chỉ nói điều quan sát được, suy đoán có đánh dấu (seem to, look like)',
      'Nói liên tục gần hết 30 giây, không đứt quãng dài',
    ],
  },
  {
    id: 'question',
    range: 'Câu 5–7',
    name: 'Respond to Questions',
    vi: 'Trả lời câu hỏi phỏng vấn',
    timing: 'Câu 5–6: 3 giây chuẩn bị · 15 giây trả lời — Câu 7: 3 giây · 30 giây',
    criteria: ['Phát âm', 'Ngữ điệu', 'Trọng âm', 'Ngữ pháp', 'Từ vựng', 'Tính liên kết', 'Mức độ liên quan', 'Độ đầy đủ nội dung'],
    how: [
      'Trả lời thẳng vào thông tin chính ngay câu đầu, rồi mới bổ sung một chi tiết hoặc lý do.',
      'Câu 7 cần phát triển: nêu lựa chọn → lý do → một ví dụ cụ thể.',
      'Chuẩn bị sẵn vốn trải nghiệm thật về giao thông, mua sắm, công nghệ, giải trí, nhà ở, học tập, công việc để xoay cho nhiều đề.',
      'Câu hỏi phủ định hay lựa chọn vẫn trả lời trực tiếp: Yes, I usually do, because…',
    ],
    traps: [
      'Mở đầu dài dòng rồi hết giờ trước khi trả lời được câu hỏi.',
      'Lặp lại ý câu hỏi thay cho lý do: because it is very convenient.',
      'Trả lời một vế khi câu hỏi có hai vế (…, and why?).',
      'Cố ghép một cấu trúc ngữ pháp phức tạp làm mất nội dung.',
    ],
    check: [
      'Câu đầu tiên đã trả lời trực tiếp câu hỏi',
      'Trả lời đủ tất cả các vế được hỏi',
      'Có ít nhất một lý do hoặc chi tiết cụ thể, không nói chung chung',
      'Dùng hết phần lớn thời gian được cho',
      'Không có khoảng im lặng trên hai giây',
    ],
  },
  {
    id: 'info',
    range: 'Câu 8–10',
    name: 'Respond Using Information Provided',
    vi: 'Trả lời dựa trên thông tin cho sẵn',
    timing: '45 giây đọc bảng · 3 giây trước mỗi câu — Câu 8–9: 15 giây, Câu 10: 30 giây (đọc hai lần)',
    criteria: ['Phát âm', 'Ngữ điệu', 'Trọng âm', 'Ngữ pháp', 'Từ vựng', 'Tính liên kết', 'Mức độ liên quan', 'Độ đầy đủ nội dung'],
    how: [
      'Dùng 45 giây để nắm cấu trúc bảng: tiêu đề, ngày, các cột, tên riêng, ngoại lệ và ghi chú — không đọc thành câu từng ô.',
      'Đóng gói dữ liệu thành câu hoàn chỉnh đúng ngữ cảnh gọi điện, đừng chỉ đọc trống trơn “9:30, Conference Room B”.',
      'Câu 10 được phát hai lần: lượt đầu nghe để xác định nhiệm vụ, lượt hai để kiểm tra chi tiết.',
      'Nếu người gọi hiểu sai, lịch sự sửa lại: Actually, there is a twenty-dollar registration fee…',
    ],
    traps: [
      'Cung cấp dữ liệu sai — nói trôi chảy nhưng nhầm ngày là không hoàn thành nhiệm vụ.',
      'Bỏ sót một vế của câu hỏi (hỏi giờ và địa điểm nhưng chỉ trả lời giờ).',
      'Câu 10 chỉ nêu một dòng trong khi đề yêu cầu tổng hợp nhiều dòng.',
      'Đọc bảng thành câu từng ô trong lúc chuẩn bị nên hết 45 giây mà chưa nắm cấu trúc.',
    ],
    check: [
      'Mọi số liệu, tên và giờ đều khớp với bảng',
      'Trả lời bằng câu hoàn chỉnh, không đọc trống dữ liệu',
      'Trả lời đủ mọi vế được hỏi',
      'Câu 10 tổng hợp đủ các dòng liên quan',
      'Sửa lại thông tin sai của người gọi một cách lịch sự (nếu có)',
    ],
  },
  {
    id: 'opinion',
    range: 'Câu 11',
    name: 'Express an Opinion',
    vi: 'Trình bày quan điểm',
    timing: '45 giây chuẩn bị · 60 giây nói',
    criteria: ['Phát âm', 'Ngữ điệu', 'Trọng âm', 'Ngữ pháp', 'Từ vựng', 'Tính liên kết', 'Mức độ liên quan', 'Độ đầy đủ nội dung'],
    how: [
      'Một phút đủ cho một luận điểm rõ và hai lý do có giải thích, hoặc một lý do được phát triển sâu bằng ví dụ.',
      'Lập dàn ý bằng năm nhãn ngắn trong đầu: lập trường – lý do 1 – ví dụ – lý do 2 – kết luận.',
      'Nêu lập trường ngay câu đầu, đừng dành 15 giây cho lời mở đầu rỗng.',
      'Một nhượng bộ ngắn ở cuối (Of course…, but…) làm lập luận chắc hơn.',
    ],
    traps: [
      'Nêu quan điểm nhưng không giải thích cơ chế, chỉ lặp lại đánh giá.',
      'Chèn thành ngữ và từ hàn lâm không kiểm soát được.',
      'Đổi lập trường giữa chừng làm người nghe mất hướng.',
      'Hết ý ở giây thứ 30 rồi im lặng đến hết giờ.',
    ],
    check: [
      'Lập trường rõ ngay câu đầu và giữ nguyên đến cuối',
      'Có ít nhất hai lý do, hoặc một lý do được giải thích sâu',
      'Có ví dụ cụ thể, không chỉ nói chung',
      'Các ý nối với nhau bằng quan hệ rõ ràng',
      'Nói gần hết 60 giây',
    ],
  },
]

export const SPEAK_SELF_REVIEW: { title: string; body: string }[] = [
  { title: 'Lượt 1 — Nhiệm vụ', body: 'Chỉ hỏi một điều: câu trả lời có đúng nhiệm vụ và đủ thông tin không? Chưa xét ngôn ngữ.' },
  { title: 'Lượt 2 — Tính dễ hiểu', body: 'Có từ nào khó nhận ra, đoạn nào quá nhanh, chỗ ngắt nào gây khó cho người nghe?' },
  { title: 'Lượt 3 — Ngữ pháp & từ vựng', body: 'Đến lúc này mới soát lỗi. Chép lại nguyên văn bài nói của mình sẽ lộ câu bỏ dở, lặp từ, thiếu động từ.' },
  { title: 'Chọn mục tiêu', body: 'Mỗi lần ghi tiếp theo chỉ sửa một đến ba mục tiêu. Sửa quá nhiều thứ cùng lúc thì không tự động hoá được.' },
]

export const SPEAK_TASKS: SpeakTask[] = [
  {
    id: 's1-1', set: 1, n: 1, section: 'read', prepSec: 45, answerSec: 45,
    text: 'Thank you for visiting the North Harbor Design Museum. The second-floor gallery will close at four o’clock today for a private event. Visitors who wish to see the industrial design collection should go there before three thirty. All other galleries, including the new exhibition on sustainable packaging, will remain open until six.',
    chunks: 'Thank you for visiting / the North Harbor Design Museum. // The second-floor gallery / will close at four o’clock today / for a private event. // Visitors who wish to see / the industrial design collection / should go there / before three thirty. // All other galleries, / including the new exhibition / on sustainable packaging, / will remain open until six.',
    stress: ['North Harbor Design Museum', 'second-floor gallery', 'close', 'four o’clock', 'private event', 'industrial design collection', 'three thirty', 'remain open', 'six'],
    sample: 'Đọc đúng nhịp trên, giữ tốc độ đều, nhấn các từ nội dung và đọc rõ âm cuối ở close, galleries, packaging.',
    why: 'Bài này nhiều tên riêng và mốc giờ. Chia nhóm ý trước giúp bạn không ngắt giữa cụm the industrial design collection và không vấp ở sustainable packaging.',
  },
  {
    id: 's1-2', set: 1, n: 2, section: 'read', prepSec: 45, answerSec: 45,
    text: 'Starting next Monday, employees may order lunch through the company portal until ten thirty each morning. Orders will be delivered to the staff café at noon. Please check your order carefully before submitting it because changes cannot be made after the daily deadline.',
    chunks: 'Starting next Monday, / employees may order lunch / through the company portal / until ten thirty each morning. // Orders will be delivered / to the staff café / at noon. // Please check your order carefully / before submitting it / because changes cannot be made / after the daily deadline.',
    stress: ['next Monday', 'order lunch', 'company portal', 'ten thirty', 'delivered', 'staff café', 'noon', 'check', 'carefully', 'cannot be made', 'daily deadline'],
    sample: 'Nhấn rõ cannot ở câu cuối vì đó là thông tin quan trọng nhất của thông báo; ngắt nhẹ sau dấu phẩy đầu câu.',
    why: 'Thông báo nội bộ luôn có một điều kiện quan trọng ở cuối. Nếu đọc đều đều tới đó, người nghe không nhận ra ràng buộc về thời gian.',
  },
  {
    id: 's1-3', set: 1, n: 3, section: 'picture', prepSec: 45, answerSec: 30,
    img: '/img/toeic/p1-14.webp',
    imgAlt: 'Hai người ngồi làm việc tại bàn với máy tính xách tay và tài liệu',
    sample: 'This picture was taken in what looks like an office or a meeting area. In the foreground, two people are sitting at a wooden table and working on a document together. One of them is holding a pen and writing on a sheet of paper, while the other person is pointing at the same page. There are two open laptops on the table, and a few pens are lying next to the document. It seems that they are reviewing some notes or figures.',
    why: 'Mẫu này đi từ bối cảnh chung đến người, hành động rồi chi tiết nền, dùng while và next to để nối câu, và đánh dấu suy đoán bằng It seems that thay vì khẳng định họ đang bàn hợp đồng.',
  },
  {
    id: 's1-4', set: 1, n: 4, section: 'picture', prepSec: 45, answerSec: 30,
    img: '/img/toeic/p1-12.webp',
    imgAlt: 'Hành khách đứng chờ trên sân ga có thang cuốn phía sau',
    sample: 'This picture was taken at a train station, probably on a subway platform. In the middle of the picture, a group of passengers are standing near the platform doors and waiting for a train. Several of them are carrying backpacks, and one man is pulling a suitcase. On the left, a man is looking at his phone. In the background, I can see an escalator and a sign above it.',
    why: 'Ảnh đông người thì đừng tả từng người. Nhóm lại (a group of passengers), chọn hai ba cá nhân nổi bật, rồi đóng bằng chi tiết nền.',
  },
  {
    id: 's1-5', set: 1, n: 5, section: 'question', prepSec: 3, answerSec: 15,
    intro: 'Imagine that a workplace research company is conducting a telephone interview in your country. You have agreed to participate in an interview about where people prefer to do work that requires concentration.',
    prompt: 'Where do you usually work when you need to concentrate?',
    sample: 'When I need to concentrate, I usually work at the desk in my bedroom. It is quiet there, and I can close the door so that nobody interrupts me.',
    why: 'Câu đầu trả lời thẳng địa điểm. Câu sau nêu lý do cụ thể. Trong 15 giây, hai câu như vậy đã đủ đầy.',
  },
  {
    id: 's1-6', set: 1, n: 6, section: 'question', prepSec: 3, answerSec: 15,
    intro: 'Imagine that a workplace research company is conducting a telephone interview in your country. You have agreed to participate in an interview about where people prefer to do work that requires concentration.',
    prompt: 'What time of day are you most productive, and why?',
    sample: 'I am most productive in the early morning, usually between six and nine. My mind is clearer at that time, and there are almost no messages or phone calls yet.',
    why: 'Câu hỏi có hai vế: thời điểm và lý do. Trả lời thiếu vế why là mất điểm độ đầy đủ dù nói rất trôi chảy.',
  },
  {
    id: 's1-7', set: 1, n: 7, section: 'question', prepSec: 3, answerSec: 30,
    intro: 'Imagine that a workplace research company is conducting a telephone interview in your country. You have agreed to participate in an interview about where people prefer to do work that requires concentration.',
    prompt: 'What is one change an employer could make to help people concentrate better at work?',
    sample: 'I think employers should create a few quiet rooms where people can work without interruptions. In many offices, everyone sits in one open space, so a single phone call can distract ten people at the same time. For example, my cousin works in an open office, and he says he can only finish reports after everyone else goes home. A small quiet area would let people do that kind of work during normal hours.',
    why: 'Đây là câu 30 giây nên cần lý do có giải thích cơ chế và một ví dụ thật. Nếu chỉ nói because it helps people focus thì mới lặp lại câu hỏi.',
  },
  {
    id: 's1-8', set: 1, n: 8, section: 'info', prepSec: 45, answerSec: 15,
    prepNote: '45 giây đọc bảng cho cả nhóm câu 8–10, sau đó 3 giây trước mỗi câu.',
    intro: 'Hello. I am registered for the Digital Service Workshop next Tuesday, but I have lost the program. I hope you can answer a few questions.',
    table: {
      title: 'Digital Service Workshop',
      headers: ['Time', 'Session', 'Trainer', 'Room'],
      rows: [
        ['9:00–9:40', 'Protecting Customer Data', 'Elena Park', 'Cedar'],
        ['9:50–10:30', 'Writing Clear Support Messages', 'Noah Bell', 'Cedar'],
        ['10:45–11:25', 'Using the New Ticket Dashboard', 'Priya Shah', 'Maple'],
        ['11:30–12:00', 'Questions and Practice', 'All trainers', 'Maple'],
      ],
    },
    prompt: 'What time does the workshop begin, and who leads the first session?',
    sample: 'The workshop begins at nine o’clock, and the first session, Protecting Customer Data, is led by Elena Park.',
    why: 'Một câu hoàn chỉnh chứa cả hai dữ kiện được hỏi. Nói trống “Nine, Elena Park” truyền được dữ liệu nhưng chưa thể hiện năng lực giao tiếp.',
  },
  {
    id: 's1-9', set: 1, n: 9, section: 'info', prepSec: 3, answerSec: 15,
    intro: 'Hello. I am registered for the Digital Service Workshop next Tuesday, but I have lost the program. I hope you can answer a few questions.',
    table: {
      title: 'Digital Service Workshop',
      headers: ['Time', 'Session', 'Trainer', 'Room'],
      rows: [
        ['9:00–9:40', 'Protecting Customer Data', 'Elena Park', 'Cedar'],
        ['9:50–10:30', 'Writing Clear Support Messages', 'Noah Bell', 'Cedar'],
        ['10:45–11:25', 'Using the New Ticket Dashboard', 'Priya Shah', 'Maple'],
        ['11:30–12:00', 'Questions and Practice', 'All trainers', 'Maple'],
      ],
    },
    prompt: 'I want to improve the emails I send to customers. Which session should I attend?',
    sample: 'You should attend Writing Clear Support Messages. It runs from nine fifty to ten thirty in the Cedar Room, and it is led by Noah Bell.',
    why: 'Câu hỏi chỉ hỏi phiên nào, nhưng thêm giờ và phòng là thông tin người gọi chắc chắn cần. Đây là chỗ ghi điểm độ đầy đủ mà không lạc đề.',
  },
  {
    id: 's1-10', set: 1, n: 10, section: 'info', prepSec: 3, answerSec: 30, twice: true,
    intro: 'Hello. I am registered for the Digital Service Workshop next Tuesday, but I have lost the program. I hope you can answer a few questions.',
    table: {
      title: 'Digital Service Workshop',
      headers: ['Time', 'Session', 'Trainer', 'Room'],
      rows: [
        ['9:00–9:40', 'Protecting Customer Data', 'Elena Park', 'Cedar'],
        ['9:50–10:30', 'Writing Clear Support Messages', 'Noah Bell', 'Cedar'],
        ['10:45–11:25', 'Using the New Ticket Dashboard', 'Priya Shah', 'Maple'],
        ['11:30–12:00', 'Questions and Practice', 'All trainers', 'Maple'],
      ],
    },
    prompt: 'Could you tell me what is scheduled after ten thirty, including the rooms and presenters?',
    sample: 'Certainly. After ten thirty there are two more sessions, and both of them are in the Maple Room. From ten forty-five to eleven twenty-five, Priya Shah will present Using the New Ticket Dashboard. Then, from eleven thirty to twelve o’clock, all the trainers will lead a session called Questions and Practice.',
    why: 'Câu 10 luôn yêu cầu tổng hợp nhiều dòng. Nêu trước tổng quan (hai phiên, cùng phòng Maple) rồi mới đi từng dòng giúp người nghe theo kịp.',
  },
  {
    id: 's1-11', set: 1, n: 11, section: 'opinion', prepSec: 45, answerSec: 60,
    prompt: 'Some companies allow new employees to work from home during their first month. Do you think new employees should work mainly from home or mainly at the workplace during this period? Give reasons and examples to support your opinion.',
    sample: 'I believe new employees should work mainly at the workplace during their first month. The first reason is that new staff learn a lot from short, informal conversations. When someone sits near an experienced colleague, they can ask a small question immediately instead of waiting for a reply by email. For example, my friend joined a logistics company last year, and she said she understood the order system in one week simply by listening to the people around her. In addition, being in the office helps managers notice problems early. A manager can see that a new employee is struggling with a task and step in before a mistake becomes expensive. Of course, a company can still allow one or two days at home each week, but the first month is when face-to-face support matters most.',
    why: 'Có lập trường ngay câu đầu, hai lý do được giải thích bằng cơ chế, một ví dụ thật và một nhượng bộ ngắn ở cuối. Từ vựng không hiếm nhưng quan hệ giữa các ý rất rõ.',
  },

  {
    id: 's2-1', set: 2, n: 1, section: 'read', prepSec: 45, answerSec: 45,
    text: 'Good afternoon, and welcome to the Fairview Community Library. The reading room on the ground floor will be reserved for a school program between two and four o’clock. Members who need a quiet space during those hours may use the study booths on the third floor. Our returns desk stays open as usual until eight.',
    chunks: 'Good afternoon, / and welcome to the Fairview Community Library. // The reading room / on the ground floor / will be reserved for a school program / between two and four o’clock. // Members who need a quiet space / during those hours / may use the study booths / on the third floor. // Our returns desk / stays open as usual / until eight.',
    stress: ['Fairview Community Library', 'reading room', 'ground floor', 'reserved', 'school program', 'two', 'four', 'quiet space', 'study booths', 'third floor', 'returns desk', 'eight'],
    sample: 'Ngắt sau welcome to the Fairview Community Library, giữ nguyên nhịp ở between two and four o’clock, đọc rõ âm cuối của booths và stays.',
    why: 'Bài có hai mốc giờ và hai địa điểm. Nếu ngắt sai, người nghe dễ gán nhầm giờ cho tầng ba.',
  },
  {
    id: 's2-2', set: 2, n: 2, section: 'read', prepSec: 45, answerSec: 45,
    text: 'Attention, shoppers. The customer service counter near the main entrance will move to the second floor beginning on the first of next month. Until then, you can still exchange items and collect online orders at the current location. If you need help finding a department, please ask any staff member wearing a blue badge.',
    chunks: 'Attention, shoppers. // The customer service counter / near the main entrance / will move to the second floor / beginning on the first of next month. // Until then, / you can still exchange items / and collect online orders / at the current location. // If you need help / finding a department, / please ask any staff member / wearing a blue badge.',
    stress: ['customer service counter', 'main entrance', 'move', 'second floor', 'first of next month', 'exchange items', 'collect online orders', 'current location', 'staff member', 'blue badge'],
    sample: 'Nhấn still ở câu thứ ba vì nó chứa thông tin trấn an khách; ngắt nhẹ sau Until then.',
    why: 'Thông báo bán lẻ hay có cặp thay đổi và ngoại lệ. Nhấn đúng từ still giúp người nghe hiểu ngay là chưa cần đổi thói quen.',
  },
  {
    id: 's2-3', set: 2, n: 3, section: 'picture', prepSec: 45, answerSec: 30,
    img: '/img/toeic/p1-05.webp',
    imgAlt: 'Nhà bếp nhà hàng với đầu bếp đứng ở quầy, phía trên có đèn treo và chồng đĩa',
    sample: 'This picture was taken in the kitchen of a restaurant. In the foreground, a man in a white shirt and a dark apron is standing at a metal counter with his back to the camera. Behind him, another worker in a cap is preparing food near the stove. Several lamps are hanging above the work area, and a lot of white plates have been stacked on the shelf on the right.',
    why: 'Ảnh này có hai vùng rõ rệt. Dùng In the foreground và Behind him để dẫn người nghe đi từ vùng gần đến vùng xa thay vì nhảy qua lại.',
  },
  {
    id: 's2-4', set: 2, n: 4, section: 'picture', prepSec: 45, answerSec: 30,
    img: '/img/toeic/p1-06.webp',
    imgAlt: 'Người phụ nữ đeo ba lô đẩy xe hàng đi qua quầy trái cây trong siêu thị',
    sample: 'This picture was taken in a market or a large grocery store. On the right side, a woman with a small backpack is pushing a shopping cart along an aisle. She is looking down at the products, so she is probably choosing something to buy. On the left, there is a display of fresh fruit, and I can see several pineapples arranged in boxes. In the background, the shelves and the other customers look blurred.',
    why: 'Chỉ có một người rõ nên mở rộng sang hàng hoá và hậu cảnh để giữ lời nói đủ 30 giây, đồng thời dùng probably để đánh dấu suy đoán.',
  },
  {
    id: 's2-5', set: 2, n: 5, section: 'question', prepSec: 3, answerSec: 15,
    intro: 'Imagine that a training magazine is doing research in your country. You have agreed to take part in a telephone interview about how people learn new skills for work.',
    prompt: 'When was the last time you learned a new skill for your work or study?',
    sample: 'The last time was about two months ago, when I learned how to make simple charts in a spreadsheet. I needed it for a report at school.',
    why: 'Câu hỏi về thời điểm nên câu đầu phải có mốc thời gian. Câu thứ hai nêu lý do để câu trả lời không quá cụt.',
  },
  {
    id: 's2-6', set: 2, n: 6, section: 'question', prepSec: 3, answerSec: 15,
    intro: 'Imagine that a training magazine is doing research in your country. You have agreed to take part in a telephone interview about how people learn new skills for work.',
    prompt: 'Do you prefer to learn a new skill from a video or from a written guide, and why?',
    sample: 'I prefer videos, because I can see exactly where to click and copy the steps. With a written guide I often lose my place and have to start again.',
    why: 'Đề có hai lựa chọn và một vế why. Chọn dứt khoát một bên rồi giải thích sẽ gọn hơn là cố nói cả hai đều tốt.',
  },
  {
    id: 's2-7', set: 2, n: 7, section: 'question', prepSec: 3, answerSec: 30,
    intro: 'Imagine that a training magazine is doing research in your country. You have agreed to take part in a telephone interview about how people learn new skills for work.',
    prompt: 'What is the best way for a company to help employees keep their skills up to date?',
    sample: 'I think the best way is to give employees a fixed amount of paid time for learning every month. Many people want to take a course, but they never start because their normal work fills the whole day. For example, my sister works at a bank, and her team gets four hours a month for training. Because the time is already in the schedule, almost everyone actually uses it. A budget for courses is useful too, but without protected time the money is often wasted.',
    why: 'Nêu một giải pháp cụ thể, giải thích vì sao giải pháp khác thất bại, đưa ví dụ thật rồi so sánh ngắn. Đủ cho 30 giây mà không lan man.',
  },
  {
    id: 's2-8', set: 2, n: 8, section: 'info', prepSec: 45, answerSec: 15,
    prepNote: '45 giây đọc bảng cho cả nhóm câu 8–10, sau đó 3 giây trước mỗi câu.',
    intro: 'Hi, this is Daniel Ortiz. I signed up for the Riverside Safety Training Day on Thursday, but my copy of the schedule is at the office. Could I ask you a few questions?',
    table: {
      title: 'Riverside Safety Training Day — Thursday',
      headers: ['Time', 'Session', 'Presenter', 'Location'],
      rows: [
        ['8:30–9:15', 'Equipment Check Basics', 'Hana Ito', 'Workshop A'],
        ['9:30–10:15', 'Reporting an Incident', 'Marcus Reed', 'Workshop A'],
        ['10:30–11:30', 'Fire Drill (outdoors)', 'Safety Team', 'North Yard'],
        ['11:30–12:15', 'Lunch', '—', 'Staff Canteen'],
        ['13:00–14:00', 'Written Assessment', 'Hana Ito', 'Room 2B'],
      ],
    },
    prompt: 'What time does the training day start, and where is the first session held?',
    sample: 'The training day starts at eight thirty in the morning, and the first session, Equipment Check Basics, is held in Workshop A.',
    why: 'Trả lời gọn cả hai vế trong một câu, giữ nguyên tên phiên và tên phòng đúng như bảng.',
  },
  {
    id: 's2-9', set: 2, n: 9, section: 'info', prepSec: 3, answerSec: 15,
    intro: 'Hi, this is Daniel Ortiz. I signed up for the Riverside Safety Training Day on Thursday, but my copy of the schedule is at the office. Could I ask you a few questions?',
    table: {
      title: 'Riverside Safety Training Day — Thursday',
      headers: ['Time', 'Session', 'Presenter', 'Location'],
      rows: [
        ['8:30–9:15', 'Equipment Check Basics', 'Hana Ito', 'Workshop A'],
        ['9:30–10:15', 'Reporting an Incident', 'Marcus Reed', 'Workshop A'],
        ['10:30–11:30', 'Fire Drill (outdoors)', 'Safety Team', 'North Yard'],
        ['11:30–12:15', 'Lunch', '—', 'Staff Canteen'],
        ['13:00–14:00', 'Written Assessment', 'Hana Ito', 'Room 2B'],
      ],
    },
    prompt: 'I heard that the whole day takes place indoors. Is that right?',
    sample: 'Actually, that is not quite right. The fire drill from ten thirty to eleven thirty takes place outdoors, in the North Yard, so you may want to bring a jacket. All the other sessions are indoors.',
    why: 'Đây là dạng sửa giả định sai. Sửa lịch sự bằng Actually, nêu đúng dòng gây ra khác biệt, rồi xác nhận phần còn lại.',
  },
  {
    id: 's2-10', set: 2, n: 10, section: 'info', prepSec: 3, answerSec: 30, twice: true,
    intro: 'Hi, this is Daniel Ortiz. I signed up for the Riverside Safety Training Day on Thursday, but my copy of the schedule is at the office. Could I ask you a few questions?',
    table: {
      title: 'Riverside Safety Training Day — Thursday',
      headers: ['Time', 'Session', 'Presenter', 'Location'],
      rows: [
        ['8:30–9:15', 'Equipment Check Basics', 'Hana Ito', 'Workshop A'],
        ['9:30–10:15', 'Reporting an Incident', 'Marcus Reed', 'Workshop A'],
        ['10:30–11:30', 'Fire Drill (outdoors)', 'Safety Team', 'North Yard'],
        ['11:30–12:15', 'Lunch', '—', 'Staff Canteen'],
        ['13:00–14:00', 'Written Assessment', 'Hana Ito', 'Room 2B'],
      ],
    },
    prompt: 'Could you tell me everything that Hana Ito is responsible for that day, including the times and the rooms?',
    sample: 'Of course. Hana Ito leads two parts of the day. First, she presents Equipment Check Basics from eight thirty to nine fifteen in Workshop A. Then, after lunch, she runs the Written Assessment from one o’clock to two o’clock in Room 2B.',
    why: 'Câu hỏi lọc theo một người, không theo thứ tự dòng. Nêu số lượng trước (two parts) rồi liệt kê theo thứ tự thời gian là cách tổ chức rõ nhất.',
  },
  {
    id: 's2-11', set: 2, n: 11, section: 'opinion', prepSec: 45, answerSec: 60,
    prompt: 'Some people think that a company should hire someone with a lot of practical experience, while others think a strong academic background is more important. Which do you think a company should value more when hiring? Give reasons and examples to support your opinion.',
    sample: 'In my opinion, a company should usually value practical experience more, especially for positions that require immediate job performance. The first reason is that experience shows whether a person can actually apply knowledge in real situations. An experienced customer-service employee already knows how to calm an upset client, record the problem and choose a suitable solution. The second reason is cost. Someone with experience needs less training, so the team can rely on that person within a few weeks instead of a few months. For example, a small company I know hired a candidate with three years of experience, and she was handling clients alone after ten days. Of course, formal qualifications still matter in jobs that need specialised knowledge, such as engineering or accounting.',
    why: 'Lập trường có điều kiện (usually, especially for…) an toàn hơn khẳng định tuyệt đối, hai lý do có cơ chế khác nhau (năng lực và chi phí), và phần nhượng bộ chỉ đúng một phạm vi hẹp nên không phá lập luận.',
  },
]

export type WriteSection = 'sentence' | 'email' | 'essay'

export interface WriteSectionMeta {
  id: WriteSection
  range: string
  name: string
  vi: string
  timing: string
  criteria: string[]
  how: string[]
  traps: string[]
}

export interface WriteTask {
  id: string
  set: number
  n: number
  section: WriteSection
  minutes: number
  img?: string
  imgAlt?: string
  words?: [string, string]
  mail?: { from: string; to: string; subject: string; body: string }
  brief: string
  minWords?: number
  sample: string
  why: string
  check: string[]
}

export const WRITE_SECTIONS: WriteSectionMeta[] = [
  {
    id: 'sentence',
    range: 'Câu 1–5',
    name: 'Write a Sentence Based on a Picture',
    vi: 'Viết một câu theo tranh',
    timing: '8 phút cho cả năm câu',
    criteria: ['Ngữ pháp', 'Mức độ phù hợp với hình ảnh'],
    how: [
      'Xác định ba thành phần trước khi viết: đối tượng chính, hành động hoặc trạng thái, quan hệ với hai từ bắt buộc.',
      'Được phép đổi dạng từ (park → parked) và dùng theo bất kỳ thứ tự nào.',
      'Nhịp luyện tham khảo: 20–30 giây lập cấu trúc, 30–40 giây viết, phần còn lại kiểm tra.',
      'Làm nhanh câu dễ để dành thời gian cho ảnh khó — cả năm câu dùng chung tám phút.',
    ],
    traps: [
      'Viết thành hai câu trong khi đề yêu cầu đúng một câu.',
      'Nối hai mệnh đề độc lập chỉ bằng dấu phẩy (run-on sentence).',
      'Ép một nghĩa không phù hợp cho từ bắt buộc, ví dụ dùng park như danh từ “công viên” khi ảnh không có công viên.',
      'Thêm chi tiết không có trong ảnh để câu trông phức tạp hơn.',
    ],
  },
  {
    id: 'email',
    range: 'Câu 6–7',
    name: 'Respond to a Written Request',
    vi: 'Trả lời một email',
    timing: '10 phút cho mỗi email',
    criteria: ['Chất lượng và sự đa dạng của câu', 'Từ vựng', 'Tổ chức'],
    how: [
      'Trước khi viết, chuyển yêu cầu của đề thành một danh sách nội dung cụ thể: hai câu hỏi là đúng hai câu hỏi.',
      'Cấu trúc căn bản: lời mở đầu ngắn → mục đích → trả lời từng yêu cầu → câu kết → lời chào.',
      'Đa dạng câu xuất phát từ nhu cầu nghĩa: because nêu lý do, if nêu điều kiện, which bổ sung thông tin.',
      'Phân bổ 10 phút: khoảng 2 phút đọc và gạch yêu cầu, 6 phút viết, 2 phút kiểm tra.',
    ],
    traps: [
      'Chỉ thực hiện một trong hai yêu cầu rồi giải thích rất dài cho yêu cầu đó.',
      'Viết câu lịch sự nhưng không thật sự hỏi dữ liệu nào (không thay được một câu hỏi).',
      'Giọng điệu quá trực tiếp: Send me the schedule thay vì Could you please send me the updated schedule?',
      'Toàn bộ email là câu ghép nhiều tầng nên tăng lỗi và khó đọc.',
    ],
  },
  {
    id: 'essay',
    range: 'Câu 8',
    name: 'Write an Opinion Essay',
    vi: 'Viết bài luận nêu quan điểm',
    timing: '30 phút',
    criteria: ['Quan điểm được hỗ trợ bằng lý do hoặc ví dụ', 'Ngữ pháp', 'Từ vựng', 'Tổ chức'],
    how: [
      'Bốn đoạn là điểm khởi đầu dễ kiểm soát: mở bài nêu lập trường, hai đoạn thân bài, kết luận.',
      'Mỗi đoạn thân bài có một ý trung tâm, phần giải thích cơ chế và một ví dụ cụ thể.',
      'Mở bài đi thẳng vào vấn đề, không cần tuyên bố rộng kiểu Since the beginning of human history.',
      'Kết luận diễn đạt lại lập trường theo cách khác và tổng hợp lý do, không thêm ý mới.',
    ],
    traps: [
      'Đếm từ thay vì phát triển ý — ETS chỉ mô tả bài hiệu quả thường có tối thiểu khoảng 300 từ.',
      'Lặp lại đánh giá mà không giải thích: Experience is important because it is useful.',
      'Chèn firstly, moreover, therefore nhưng các câu không phát triển cùng một ý.',
      'Dùng on the other hand khi chưa hề có hai mặt đối chiếu.',
    ],
  },
]

export const WRITE_REVISION: { title: string; body: string }[] = [
  { title: 'Lượt 1 — Nhiệm vụ', body: 'Bài có trả lời đúng câu hỏi, đủ số yêu cầu và giữ đúng vai trò người viết không?' },
  { title: 'Lượt 2 — Tổ chức', body: 'Thứ tự ý có hợp lý, mỗi đoạn có một trọng tâm và người đọc theo dõi được không?' },
  { title: 'Lượt 3 — Ngôn ngữ', body: 'Động từ, số ít số nhiều, mạo từ, giới từ, từ loại, chính tả và dấu câu.' },
  { title: 'Đọc đề trước khi đọc bài', body: 'Khi kiểm tra, đọc lại đề trước rồi mới đọc bài của mình — đó là cách nhanh nhất để phát hiện nội dung bị thiếu.' },
]

const SENT_CHECK = [
  'Đúng một câu, không phải hai câu',
  'Dùng đủ cả hai từ bắt buộc (được đổi dạng từ)',
  'Có chủ ngữ và động từ chia đúng',
  'Nội dung khớp với điều nhìn thấy trong ảnh',
  'Không thêm chi tiết mà ảnh không cho thấy',
]

const MAIL_CHECK = [
  'Hoàn thành đủ mọi hành động đề yêu cầu (đếm lại)',
  'Có mở đầu, phần trả lời từng yêu cầu, câu kết và lời chào',
  'Giọng điệu lịch sự, phù hợp quan hệ công việc',
  'Kết hợp câu ngắn nêu hành động và câu phức giải thích lý do',
  'Đã soát thì động từ, số ít số nhiều, mạo từ và dấu câu',
]

const ESSAY_CHECK = [
  'Lập trường rõ ở mở bài và nhất quán đến hết bài',
  'Mỗi đoạn thân bài có một ý trung tâm',
  'Mỗi lý do có giải thích cơ chế, không chỉ lặp lại đánh giá',
  'Có ít nhất một ví dụ cụ thể có hành động',
  'Kết luận tổng hợp lý do, không đưa ý mới',
  'Đã dành thời gian soát ngữ pháp và liên kết đoạn',
]

export const WRITE_TASKS: WriteTask[] = [
  {
    id: 'w1-1', set: 1, n: 1, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-14.webp',
    imgAlt: 'Hai người ngồi làm việc tại bàn với máy tính xách tay và tài liệu',
    words: ['discuss', 'document'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'Two colleagues are discussing a document at a table.',
    why: 'Câu dùng cả hai từ ở dạng tự nhiên, có chủ ngữ và động từ rõ, và chỉ nói điều ảnh chứng minh được.',
    check: SENT_CHECK,
  },
  {
    id: 'w1-2', set: 1, n: 2, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-01.webp',
    imgAlt: 'Người phụ nữ gõ máy tính xách tay bên bàn có tách cà phê',
    words: ['type', 'while'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'A woman is typing on a laptop while she sits at a table with a cup of coffee.',
    why: 'While nối hai mệnh đề trong cùng một câu nên không tạo thành hai câu; cả hai hành động đều nhìn thấy được trong ảnh.',
    check: SENT_CHECK,
  },
  {
    id: 'w1-3', set: 1, n: 3, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-04.webp',
    imgAlt: 'Chiếc xe đạp có giỏ dựng cạnh bức tường đá trong con phố hẹp',
    words: ['park', 'beside'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'A bicycle has been parked beside a stone wall.',
    why: 'Park được đổi sang dạng phân từ parked, đúng với trạng thái tĩnh trong ảnh. Nếu dùng park như danh từ “công viên” thì lệch hẳn khỏi bức ảnh.',
    check: SENT_CHECK,
  },
  {
    id: 'w1-4', set: 1, n: 4, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-07.webp',
    imgAlt: 'Người ngồi trên ghế băng gỗ, cầm tờ báo mở rộng trước mặt',
    words: ['hold', 'newspaper'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'A person is holding an open newspaper in front of his face.',
    why: 'Hiện tại tiếp diễn phù hợp với hành động đang diễn ra; in front of thêm quan hệ vị trí mà ảnh chứng minh được.',
    check: SENT_CHECK,
  },
  {
    id: 'w1-5', set: 1, n: 5, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-11.webp',
    imgAlt: 'Người đàn ông quỳ sơn tường, bên cạnh có thang và thùng sơn',
    words: ['ladder', 'next to'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'A ladder has been set up next to a man who is painting a wall.',
    why: 'Mệnh đề quan hệ ngắn giúp đưa cả cái thang và người thợ vào một câu duy nhất mà vẫn đúng ngữ pháp.',
    check: SENT_CHECK,
  },
  {
    id: 'w1-6', set: 1, n: 6, section: 'email', minutes: 10,
    mail: {
      from: 'Events Team',
      to: 'Workshop Participant',
      subject: 'Updated workshop schedule',
      body: 'Thank you for registering for the Customer Experience Workshop on September 18. We are finalizing the schedule and will send the complete program next week. Please contact us if you need any information before then.',
    },
    brief: 'Viết email với tư cách người tham dự. Trong email, hãy đặt hai câu hỏi về chương trình, địa điểm hoặc những thứ cần chuẩn bị.',
    sample: 'Dear Events Team,\n\nThank you for the update about the Customer Experience Workshop on September 18. I am looking forward to attending, but I would like to ask two questions before the program is released.\n\nFirst, could you tell me what time the workshop begins and ends? I need to book a train ticket this week, so an approximate schedule would be very helpful. Second, is there anything that participants should bring or prepare in advance, such as a laptop or examples from our own customer cases?\n\nThank you for your help. I look forward to receiving the complete program.\n\nBest regards,\nMinh Tran',
    why: 'Đề chỉ yêu cầu hai câu hỏi, và bài mẫu đặt đúng hai câu hỏi thật sự yêu cầu dữ liệu. Mỗi câu hỏi kèm một lý do ngắn nên email không cụt.',
    check: MAIL_CHECK,
  },
  {
    id: 'w1-7', set: 1, n: 7, section: 'email', minutes: 10,
    mail: {
      from: 'Jordan Miles',
      to: 'City Bicycle Service',
      subject: 'Membership problem',
      body: 'I renewed my annual membership yesterday, but the mobile application still says that my account has expired. I need to rent a bicycle for a client visit tomorrow morning. Could you help me solve this problem?',
    },
    brief: 'Viết email với tư cách nhân viên dịch vụ khách hàng. Trong email, hãy xin lỗi, đưa ra hai hành động cụ thể để giải quyết vấn đề và cho biết bước tiếp theo mà khách hàng cần thực hiện.',
    sample: 'Dear Mr. Miles,\n\nThank you for contacting City Bicycle Service, and I am sorry for the trouble with your membership. Your renewal was received, but the payment has not been linked to your account in our application yet.\n\nI have already done two things to solve this. First, I have reactivated your membership manually, so your account is valid again from today until the same date next year. Second, I have added a temporary rental code to your profile, which will let you unlock a bicycle even if the application still shows an old status.\n\nCould you please sign out of the application and sign in again this evening? The updated status should appear within a few minutes. If it does not, please reply to this message and I will arrange a bicycle for you at the Central Station point before nine tomorrow morning.\n\nBest regards,\nLan Pham\nCustomer Service, City Bicycle Service',
    why: 'Bài mẫu làm đủ ba việc đề yêu cầu: xin lỗi, hai hành động cụ thể đã thực hiện, và một bước tiếp theo rõ ràng cho khách. Không có yêu cầu nào bị nuốt mất.',
    check: MAIL_CHECK,
  },
  {
    id: 'w1-8', set: 1, n: 8, section: 'essay', minutes: 30, minWords: 300,
    brief: 'Some employers provide professional training entirely online, while others require employees to attend in person. Which approach is more effective for most workplace training? Give reasons and examples to support your opinion.',
    sample: 'Companies today can choose between online courses and traditional classroom sessions when they train their staff. In my view, online training is more effective for most workplace learning, although some kinds of training still need to be done in person.\n\nThe first reason is flexibility. Online courses let employees learn at the moment when the knowledge is actually needed. If a customer-service agent has to use a new refund system on Monday, she can watch the relevant lesson on Friday afternoon and repeat the difficult part twice. In a classroom, the same content is delivered once, at a fixed time, and everyone must follow the same speed. As a result, online training usually fits real work much better.\n\nThe second reason is cost and coverage. A company with several branches has to pay for travel, rooms and a trainer every time it organises a face-to-face session, so the training is repeated only once or twice a year. An online course can be recorded once and used by every branch, including new employees who join later. For example, a logistics company I read about replaced its yearly safety class with short online modules and was able to train drivers in six cities in the same week.\n\nOf course, some skills are difficult to develop through a screen. Practical tasks such as operating machinery, handling equipment or practising a difficult conversation with a manager are better learned in person, because the trainer can correct the learner immediately.\n\nIn conclusion, online training is more effective for most workplace learning because it fits individual schedules and reaches many people at a low cost. Companies should still keep in-person sessions for practical skills, but for general knowledge and procedures, online courses give better results for the same investment.',
    why: 'Bài có lập trường rõ ở mở bài, hai đoạn thân bài với cơ chế khác nhau (tính linh hoạt và chi phí), một đoạn nhượng bộ, và kết luận tổng hợp lại lý do. Từ vựng thông dụng nhưng dùng chính xác.',
    check: ESSAY_CHECK,
  },

  {
    id: 'w2-1', set: 2, n: 1, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-06.webp',
    imgAlt: 'Người phụ nữ đeo ba lô đẩy xe hàng đi qua quầy trái cây trong siêu thị',
    words: ['push', 'cart'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'A woman is pushing a shopping cart past a display of fruit.',
    why: 'Một câu duy nhất, hành động đang diễn ra nhìn thấy rõ, và chi tiết cuối câu lấy trực tiếp từ ảnh.',
    check: SENT_CHECK,
  },
  {
    id: 'w2-2', set: 2, n: 2, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-09.webp',
    imgAlt: 'Hai người đầu bếp đang bày thức ăn lên các đĩa trắng xếp thành hàng',
    words: ['arrange', 'plate'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'Food is being arranged on several white plates.',
    why: 'Bị động hiện tại tiếp diễn hợp lý ở đây vì ảnh cho thấy có người đang thực hiện hành động lên các đĩa.',
    check: SENT_CHECK,
  },
  {
    id: 'w2-3', set: 2, n: 3, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-02.webp',
    imgAlt: 'Nhiều thùng các-tông xếp chồng cạnh gian bếp',
    words: ['box', 'stack'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'Several cardboard boxes have been stacked next to a kitchen.',
    why: 'Ảnh chỉ chứng minh trạng thái, không chứng minh ai đang xếp, nên hiện tại hoàn thành bị động an toàn hơn are being stacked.',
    check: SENT_CHECK,
  },
  {
    id: 'w2-4', set: 2, n: 4, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-12.webp',
    imgAlt: 'Hành khách đứng chờ trên sân ga có thang cuốn phía sau',
    words: ['wait', 'platform'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'A group of passengers is waiting on a station platform.',
    why: 'Danh từ tập hợp a group of passengers cho phép mô tả cả đám đông trong một câu ngắn mà vẫn hoà hợp chủ vị.',
    check: SENT_CHECK,
  },
  {
    id: 'w2-5', set: 2, n: 5, section: 'sentence', minutes: 8,
    img: '/img/toeic/p1-03.webp',
    imgAlt: 'Hai người phụ nữ ngồi đối diện nhau bên bàn tròn cạnh cửa sổ',
    words: ['sit', 'across from'],
    brief: 'Viết đúng một câu mô tả bức ảnh, dùng cả hai từ bắt buộc. Bạn được đổi dạng từ và dùng theo thứ tự bất kỳ.',
    sample: 'Two women are sitting across from each other at a round table.',
    why: 'Across from each other diễn đạt đúng quan hệ vị trí trong ảnh, và cả câu vẫn chỉ có một mệnh đề chính.',
    check: SENT_CHECK,
  },
  {
    id: 'w2-6', set: 2, n: 6, section: 'email', minutes: 10,
    mail: {
      from: 'Priya Shah, Office Manager',
      to: 'All department heads',
      subject: 'Ideas for the new staff room',
      body: 'We will renovate the staff room on the third floor next month and we would like your input. Please tell us what your team currently misses in that space, and suggest how the room could be used outside lunch hours.',
    },
    brief: 'Viết email với tư cách trưởng một bộ phận. Trong email, hãy nêu một vấn đề hiện tại của phòng nghỉ và đề xuất hai cách sử dụng căn phòng ngoài giờ ăn trưa.',
    sample: 'Dear Ms. Shah,\n\nThank you for asking for our opinion about the new staff room. I have discussed the question with my team, and I would like to share one problem and two suggestions.\n\nThe main problem at the moment is noise. The room has only one large table, so a short conversation between two people can be heard by everyone who is having lunch. Many colleagues therefore eat at their desks instead.\n\nOutside lunch hours, the room could be used in two ways. First, I suggest keeping two small tables free for short internal meetings, because our department often needs a fifteen-minute discussion and the meeting rooms are usually booked. Second, the room could host a weekly training session, which would give new employees a regular place to ask questions.\n\nI hope these ideas are useful. Please let me know if you would like more details.\n\nBest regards,\nDaniel Ortiz',
    why: 'Đề yêu cầu một vấn đề và hai đề xuất — bài mẫu tách rõ ba phần đó và mỗi đề xuất đều kèm lý do, nên người đọc thấy ngay là đã trả lời đủ.',
    check: MAIL_CHECK,
  },
  {
    id: 'w2-7', set: 2, n: 7, section: 'email', minutes: 10,
    mail: {
      from: 'Elena Park',
      to: 'Northgate Office Supplies',
      subject: 'Order 4482 — wrong items',
      body: 'We received order 4482 this morning, but the box contains twelve desk lamps instead of the twelve office chairs we ordered. Our new staff start on Monday and they have nowhere to sit. Please tell me what you can do.',
    },
    brief: 'Viết email với tư cách nhân viên chăm sóc khách hàng của Northgate Office Supplies. Trong email, hãy xin lỗi, giải thích chuyện gì đã xảy ra, đưa ra hai giải pháp và hỏi khách một câu hỏi để xử lý tiếp.',
    sample: 'Dear Ms. Park,\n\nThank you for letting us know about order 4482, and I am very sorry that you received the wrong items. After checking our system, I can see that your order was packed with the delivery for a different customer, which is why the desk lamps arrived instead of the chairs.\n\nWe can solve this in two ways. If you need the chairs before Monday, we can deliver twelve chairs from our city warehouse tomorrow afternoon and collect the lamps at the same time. Alternatively, if a short delay is acceptable, we can send the original chairs you ordered on Tuesday and add a ten percent refund to your account for the inconvenience.\n\nCould you please tell me which option suits your team better? As soon as I hear from you, I will confirm the delivery time in writing.\n\nBest regards,\nTom Brennan\nCustomer Care, Northgate Office Supplies',
    why: 'Bốn yêu cầu của đề đều xuất hiện đúng một lần: xin lỗi, giải thích nguyên nhân, hai giải pháp có điều kiện khác nhau, và một câu hỏi thật sự cần khách trả lời.',
    check: MAIL_CHECK,
  },
  {
    id: 'w2-8', set: 2, n: 8, section: 'essay', minutes: 30, minWords: 300,
    brief: 'When companies choose a new employee, some believe that practical work experience is more important than academic qualifications, while others disagree. What is your opinion? Give reasons and examples to support your answer.',
    sample: 'Employers consider several factors when choosing a new employee. In my view, practical experience is generally more important than academic qualifications for positions that require immediate job performance, although qualifications remain essential in some professions.\n\nPractical experience can show whether an applicant is able to apply knowledge in real situations. For instance, an experienced customer-service employee may already know how to calm an upset client, document the problem and choose an appropriate solution. As a result, the company can evaluate the applicant through evidence of previous performance rather than relying only on academic results, which describe what a person has studied but not how that person behaves under pressure.\n\nExperience also reduces the cost of training. A new employee who has done similar work before usually needs a few weeks to become productive, while a graduate without experience may need several months of supervision. In a small company, that difference is significant, because an experienced colleague has to spend part of every day answering questions instead of doing his or her own work.\n\nHowever, qualifications cannot be ignored. Some professions, such as accounting, engineering and medicine, require formal knowledge and an official certificate, and no amount of practical experience can replace it. In those fields, a degree is the minimum condition rather than an advantage.\n\nIn conclusion, work experience often gives employers clearer evidence of an applicant’s practical ability and can reduce the amount of initial training required. Nevertheless, companies should still consider formal qualifications when a position depends on specialised knowledge or professional certification.',
    why: 'Mở bài nêu lập trường có điều kiện, hai đoạn thân bài giải thích cơ chế chứ không lặp lại đánh giá, đoạn thứ ba nhượng bộ trong phạm vi hẹp, và kết luận diễn đạt lại lập trường bằng cách khác.',
    check: ESSAY_CHECK,
  },
]

export const SPEAK_SETS = [...new Set(SPEAK_TASKS.map((t) => t.set))]
export const WRITE_SETS = [...new Set(WRITE_TASKS.map((t) => t.set))]

export function speakSection(id: SpeakSection): SpeakSectionMeta {
  return SPEAK_SECTIONS.find((s) => s.id === id) ?? SPEAK_SECTIONS[0]
}

export function writeSection(id: WriteSection): WriteSectionMeta {
  return WRITE_SECTIONS.find((s) => s.id === id) ?? WRITE_SECTIONS[0]
}

export function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

export function usesWord(text: string, word: string): boolean {
  const base = word.toLowerCase().trim()
  const body = text.toLowerCase()
  if (base.includes(' ')) return body.includes(base)
  const stem = base.replace(/(e|y)$/, '')
  return new RegExp(`\\b${stem}[a-z]*\\b`, 'i').test(body)
}
