import { type WeekPlan } from './vocabCore'
import { ZH_UNITS } from './chineseCore'
import { ZH_PRON_GROUPS } from './chinesePronunciation'
import { PRON_PASS } from './englishPronunciation'

const unitName = (id: string): string => ZH_UNITS.find((u) => u.id === id)?.name ?? id

const unitSize = (id: string): number => ZH_UNITS.find((u) => u.id === id)?.words.length ?? 0

const vocab = (week: number, seq: number, unitId: string) => ({
  id: `zw${week}-v${seq}`,
  kind: 'vocab' as const,
  unitId,
  pct: 100,
  label: `Thuộc toàn bộ "${unitName(unitId)}" (${unitSize(unitId)} từ)`,
})

const quiz = (week: number) => ({
  id: `zw${week}-quiz`,
  kind: 'quiz' as const,
  passPct: 70,
  label: 'Kiểm tra tuần đạt từ 70%',
})

const bank = (week: number, targetTotal: number, note = '') => ({
  id: `zw${week}-bank`,
  kind: 'total' as const,
  targetTotal,
  label: `Kho từ đạt ${targetTotal}${note}`,
})

const video = (week: number, n: number) => ({
  id: `zw${week}-video`,
  kind: 'video' as const,
  n,
  label: `Xem ${n} video tiếng Trung + bấm từ mới trong phụ đề để lưu thẻ`,
})

const review = (week: number, n: number) => ({
  id: `zw${week}-review`,
  kind: 'review' as const,
  n,
  label: `Vào Ôn tập (SRS) ít nhất ${n} ngày trong tuần`,
})

const pron = (week: number, groupId: string) => {
  const g = ZH_PRON_GROUPS.find((x) => x.id === groupId)
  return {
    id: `zw${week}-pron`,
    kind: 'pron' as const,
    groupId,
    label: `Phát âm: ${g?.title ?? groupId} (kiểm tra đạt ≥ ${PRON_PASS}%)`,
  }
}

const speak = (week: number, topic: string) => ({
  id: `zw${week}-speak`,
  kind: 'speak' as const,
  label: `Luyện nói 1 buổi với AI: ${topic}`,
})

export const ZH_PLAN_12_WEEKS: WeekPlan[] = [
  {
    week: 1, month: 1, phase: 'Compress', title: 'Chào hỏi & xưng hô',
    focus: 'Mở lời, tự giới thiệu và gọi đúng tên từng người trong nhà — cộng bốn thanh điệu, thứ quyết định người ta có hiểu bạn không.',
    rhythm: 'Ngày 1–2: chào hỏi · Ngày 3: đại từ xưng hô · Ngày 4–5: gia đình · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS.',
    quizUnits: ['zh-greetings', 'zh-people', 'zh-family'],
    tasks: [
      vocab(1, 1, 'zh-greetings'),
      vocab(1, 2, 'zh-people'),
      vocab(1, 3, 'zh-family'),
      pron(1, 'zh-four-tones'),
      quiz(1),
      bank(1, 36),
      video(1, 2),
      review(1, 3),
    ],
    patterns: [
      { pattern: '我是 + N', vi: 'Tôi là N', ex: '我是越南人。', exVi: 'Tôi là người Việt Nam.' },
      { pattern: '你叫什么名字？', vi: 'Bạn tên là gì?', ex: '你好，你叫什么名字？', exVi: 'Xin chào, bạn tên là gì?' },
      { pattern: '这是我的 + N', vi: 'Đây là N của tôi', ex: '这是我的朋友。', exVi: 'Đây là bạn của tôi.' },
    ],
  },
  {
    week: 2, month: 1, phase: 'Compress', title: 'Con số, câu hỏi & lượng từ',
    focus: 'Hỏi được mọi thứ và đếm được mọi thứ. Lượng từ là nét lạ nhất với người Việt nên học sớm cho quen tay.',
    rhythm: 'Ngày 1–2: số đếm · Ngày 3–4: từ để hỏi · Ngày 5: lượng từ · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['zh-numbers', 'zh-questions', 'zh-measure'],
    tasks: [
      vocab(2, 1, 'zh-numbers'),
      vocab(2, 2, 'zh-questions'),
      vocab(2, 3, 'zh-measure'),
      pron(2, 'zh-tone-2-3'),
      quiz(2),
      bank(2, 72),
      video(2, 2),
      review(2, 3),
    ],
    patterns: [
      { pattern: 'Số + lượng từ + N', vi: 'Đếm vật: luôn phải có lượng từ ở giữa', ex: '我有两个哥哥。', exVi: 'Tôi có hai anh trai.' },
      { pattern: '…多少钱？', vi: 'Bao nhiêu tiền?', ex: '这个多少钱？', exVi: 'Cái này bao nhiêu tiền?' },
      { pattern: '…几 + lượng từ + N？', vi: 'Mấy N? (hỏi số nhỏ)', ex: '你们家有几个人？', exVi: 'Nhà bạn có mấy người?' },
    ],
  },
  {
    week: 3, month: 1, phase: 'Compress', title: 'Động từ gốc & việc thường ngày',
    focus: 'Mười hai động từ lõi ghép ra vô số câu, cộng chuỗi việc trong ngày để kể được một ngày của mình.',
    rhythm: 'Ngày 1–3: động từ · Ngày 4–5: sinh hoạt hằng ngày · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['zh-verbs', 'zh-daily'],
    tasks: [
      vocab(3, 1, 'zh-verbs'),
      vocab(3, 2, 'zh-daily'),
      pron(3, 'zh-retroflex'),
      quiz(3),
      bank(3, 96),
      video(3, 2),
      review(3, 3),
    ],
    patterns: [
      { pattern: '我在 + V', vi: 'Tôi đang làm gì đó', ex: '我在吃饭。', exVi: 'Tôi đang ăn cơm.' },
      { pattern: 'V + 了', vi: 'Đã làm xong việc gì', ex: '我买了一本书。', exVi: 'Tôi đã mua một quyển sách.' },
      { pattern: '我想 + V', vi: 'Tôi muốn làm gì', ex: '我想去中国。', exVi: 'Tôi muốn đi Trung Quốc.' },
    ],
  },
  {
    week: 4, month: 1, phase: 'Compress', title: 'Thời gian & nơi chốn',
    focus: 'Hẹn được giờ, nói được chỗ. Hết tháng 1 bạn đã đủ vốn để nói câu hoàn chỉnh về mình.',
    rhythm: 'Ngày 1–3: thời gian · Ngày 4–5: nơi chốn · Ngày 6: kiểm tra · Ngày 7: luyện nói hẹn gặp.',
    quizUnits: ['zh-time', 'zh-places'],
    tasks: [
      vocab(4, 1, 'zh-time'),
      vocab(4, 2, 'zh-places'),
      pron(4, 'zh-jqx'),
      quiz(4),
      bank(4, 120),
      speak(4, 'hẹn bạn đi chơi cuối tuần'),
      video(4, 2),
      review(4, 3),
    ],
    patterns: [
      { pattern: '…什么时候…？', vi: 'Khi nào thì…?', ex: '你什么时候来？', exVi: 'Khi nào bạn tới?' },
      { pattern: '在 + nơi chốn + V', vi: 'Làm gì ở đâu (nơi chốn đứng TRƯỚC động từ)', ex: '我在家看电视。', exVi: 'Tôi xem tivi ở nhà.' },
      { pattern: '从 A 到 B', vi: 'Từ A đến B', ex: '从早上到晚上。', exVi: 'Từ sáng đến tối.' },
    ],
  },
  {
    week: 5, month: 2, phase: 'Compile', title: 'Ăn uống & nhà hàng',
    focus: 'Vào quán gọi món một mình, khen chê được món ăn — tình huống bạn gặp ngay ngày đầu ở Trung Quốc.',
    rhythm: 'Ngày 1–3: đồ ăn thức uống · Ngày 4–5: nhà hàng · Ngày 6: kiểm tra · Ngày 7: luyện nói gọi món.',
    quizUnits: ['zh-food', 'zh-restaurant'],
    tasks: [
      vocab(5, 1, 'zh-food'),
      vocab(5, 2, 'zh-restaurant'),
      pron(5, 'zh-u-umlaut'),
      quiz(5),
      bank(5, 144),
      speak(5, 'gọi món ở nhà hàng Trung Quốc'),
      video(5, 2),
      review(5, 3),
    ],
    patterns: [
      { pattern: '我要 + N', vi: 'Cho tôi N (gọi món, mua đồ)', ex: '我要一碗米饭。', exVi: 'Cho tôi một bát cơm.' },
      { pattern: '太 + adj + 了', vi: 'Quá … (khen hoặc chê)', ex: '这个菜太好吃了！', exVi: 'Món này ngon quá!' },
      { pattern: '好吃 / 好喝', vi: 'Ngon (đồ ăn) / ngon (đồ uống) — không dùng lẫn', ex: '这个茶很好喝。', exVi: 'Trà này rất ngon.' },
    ],
  },
  {
    week: 6, month: 2, phase: 'Compile', title: 'Mua sắm & tiền bạc',
    focus: 'Hỏi giá, mặc cả, trả tiền, xin hoá đơn — và hiểu khi người bán nói nhanh.',
    rhythm: 'Ngày 1–3: mua sắm · Ngày 4–5: tiền bạc, ngân hàng · Ngày 6: kiểm tra · Ngày 7: luyện nói mặc cả.',
    quizUnits: ['zh-shopping', 'zh-money'],
    tasks: [
      vocab(6, 1, 'zh-shopping'),
      vocab(6, 2, 'zh-money'),
      pron(6, 'zh-n-ng'),
      quiz(6),
      bank(6, 168),
      speak(6, 'mặc cả khi mua đồ ở chợ'),
      video(6, 2),
      review(6, 3),
    ],
    patterns: [
      { pattern: '太贵了，便宜一点吧', vi: 'Đắt quá, rẻ chút đi (câu mặc cả)', ex: '太贵了，便宜一点吧。', exVi: 'Đắt quá, rẻ một chút đi.' },
      { pattern: '可以 + V + 吗？', vi: 'Có thể … được không?', ex: '可以刷卡吗？', exVi: 'Có quẹt thẻ được không?' },
      { pattern: '一共 + số + 块', vi: 'Tổng cộng … đồng', ex: '一共三十五块。', exVi: 'Tổng cộng ba mươi lăm đồng.' },
    ],
  },
  {
    week: 7, month: 2, phase: 'Compile', title: 'Nối câu & tính từ',
    focus: 'Tuần bản lề: học các từ nối để câu dài ra, thay vì nói từng câu cụt lủn.',
    rhythm: 'Ngày 1–3: từ nối & khung câu · Ngày 4: tính từ · Ngày 5: từ thông dụng · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['zh-particles', 'zh-adjectives', 'zh-common'],
    tasks: [
      vocab(7, 1, 'zh-particles'),
      vocab(7, 2, 'zh-adjectives'),
      vocab(7, 3, 'zh-common'),
      pron(7, 'zh-aspirate'),
      quiz(7),
      bank(7, 204),
      video(7, 2),
      review(7, 4),
    ],
    patterns: [
      { pattern: '因为 A，所以 B', vi: 'Vì A nên B (hai vế luôn đi cặp)', ex: '因为下雨，所以我没去。', exVi: 'Vì trời mưa nên tôi đã không đi.' },
      { pattern: 'A 比 B + adj', vi: 'A … hơn B', ex: '今天比昨天热。', exVi: 'Hôm nay nóng hơn hôm qua.' },
      { pattern: '很 + adj', vi: 'Tính từ luôn cần 很 đứng trước, không nói trống không', ex: '我很好。', exVi: 'Tôi rất khoẻ.' },
    ],
  },
  {
    week: 8, month: 2, phase: 'Compile', title: 'Thời tiết & sức khoẻ',
    focus: 'Câu mở chuyện dễ nhất (thời tiết) và tình huống cần nhất khi ở xa nhà (đi khám, mua thuốc).',
    rhythm: 'Ngày 1–2: thời tiết, bốn mùa · Ngày 3–5: cơ thể, đi khám · Ngày 6: kiểm tra · Ngày 7: luyện nói ở hiệu thuốc.',
    quizUnits: ['zh-weather', 'zh-body'],
    tasks: [
      vocab(8, 1, 'zh-weather'),
      vocab(8, 2, 'zh-body'),
      pron(8, 'zh-r'),
      quiz(8),
      bank(8, 228),
      speak(8, 'tả triệu chứng và mua thuốc'),
      video(8, 2),
      review(8, 4),
    ],
    patterns: [
      { pattern: '今天天气 + adj', vi: 'Hôm nay thời tiết thế nào', ex: '今天天气很好。', exVi: 'Hôm nay thời tiết rất đẹp.' },
      { pattern: 'N + 疼', vi: 'Đau ở đâu', ex: '我头疼。', exVi: 'Tôi đau đầu.' },
      { pattern: '应该 + V', vi: 'Nên làm gì (khuyên nhủ)', ex: '你应该多休息。', exVi: 'Bạn nên nghỉ ngơi nhiều hơn.' },
    ],
  },
  {
    week: 9, month: 3, phase: 'Consolidate', title: 'Đi lại & hỏi đường',
    focus: 'Tự đi lại một mình: bắt xe, hỏi đường, hiểu người ta chỉ đường bằng trái phải trước sau.',
    rhythm: 'Ngày 1–3: phương tiện · Ngày 4–5: phương hướng · Ngày 6: kiểm tra · Ngày 7: luyện nói hỏi đường.',
    quizUnits: ['zh-transport', 'zh-directions'],
    tasks: [
      vocab(9, 1, 'zh-transport'),
      vocab(9, 2, 'zh-directions'),
      pron(9, 'zh-neutral'),
      quiz(9),
      bank(9, 240),
      speak(9, 'hỏi đường tới ga tàu điện ngầm'),
      video(9, 2),
      review(9, 4),
    ],
    patterns: [
      { pattern: '坐 / 骑 + xe + 去 + nơi chốn', vi: 'Đi tới đâu bằng phương tiện gì (xe hai bánh dùng 骑)', ex: '我坐地铁去公司。', exVi: 'Tôi đi tàu điện ngầm tới công ty.' },
      { pattern: '…怎么走？', vi: 'Đi thế nào? (hỏi đường)', ex: '请问，火车站怎么走？', exVi: 'Xin hỏi, ga tàu đi thế nào ạ?' },
      { pattern: '往左 / 往右拐', vi: 'Rẽ trái / rẽ phải', ex: '一直走，然后往右拐。', exVi: 'Đi thẳng, sau đó rẽ phải.' },
    ],
  },
  {
    week: 10, month: 3, phase: 'Consolidate', title: 'Nhà cửa & quần áo',
    focus: 'Thuê phòng, tả chỗ ở, mua quần áo đúng cỡ đúng màu.',
    rhythm: 'Ngày 1–3: nhà cửa, đồ đạc · Ngày 4–5: quần áo, màu sắc · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['zh-home', 'zh-clothes'],
    tasks: [
      vocab(10, 1, 'zh-home'),
      vocab(10, 2, 'zh-clothes'),
      pron(10, 'zh-sandhi'),
      quiz(10),
      bank(10, 264),
      speak(10, 'hỏi thuê phòng và xem nhà'),
      video(10, 2),
      review(10, 4),
    ],
    patterns: [
      { pattern: 'N + 在 + nơi chốn + 上/里', vi: 'N ở trên/trong đâu đó', ex: '书在桌子上。', exVi: 'Sách ở trên bàn.' },
      { pattern: '帮我 + V', vi: 'Giúp tôi làm gì đó', ex: '请帮我开门。', exVi: 'Xin giúp tôi mở cửa.' },
      { pattern: '有点儿 + adj', vi: 'Hơi … (chê nhẹ, lịch sự)', ex: '这条裤子有点儿长。', exVi: 'Cái quần này hơi dài.' },
    ],
  },
  {
    week: 11, month: 3, phase: 'Consolidate', title: 'Trường lớp & công việc',
    focus: 'Nói về nghề nghiệp, chỗ làm, chuyện học hành — phần lớn cuộc trò chuyện với người mới quen nằm ở đây.',
    rhythm: 'Ngày 1–3: lớp học, tiếng Trung · Ngày 4–5: công việc, văn phòng · Ngày 6: kiểm tra · Ngày 7: luyện nói giới thiệu công việc.',
    quizUnits: ['zh-school', 'zh-work'],
    tasks: [
      vocab(11, 1, 'zh-school'),
      vocab(11, 2, 'zh-work'),
      quiz(11),
      bank(11, 288),
      speak(11, 'giới thiệu công việc và chỗ làm'),
      video(11, 3),
      review(11, 4),
    ],
    patterns: [
      { pattern: '我在 + nơi + 工作 / 学习', vi: 'Tôi làm việc / học ở đâu', ex: '我在一家公司工作。', exVi: 'Tôi làm việc ở một công ty.' },
      { pattern: '会 + V', vi: 'Biết làm gì (do học mà biết)', ex: '我会说一点汉语。', exVi: 'Tôi biết nói một chút tiếng Trung.' },
      { pattern: '已经 + V + 了', vi: 'Đã làm xong việc gì rồi', ex: '我已经学了三个月了。', exVi: 'Tôi đã học được ba tháng rồi.' },
    ],
  },
  {
    week: 12, month: 3, phase: 'Consolidate', title: 'Sở thích & du lịch',
    focus: 'Tuần chốt: kể được sở thích, lên kế hoạch một chuyến đi — và tự tin bắt chuyện với người lạ.',
    rhythm: 'Ngày 1–3: sở thích, giải trí · Ngày 4–5: du lịch, khách sạn · Ngày 6: kiểm tra cuối · Ngày 7: nhìn lại 90 ngày.',
    quizUnits: ['zh-hobby', 'zh-travel'],
    tasks: [
      vocab(12, 1, 'zh-hobby'),
      vocab(12, 2, 'zh-travel'),
      quiz(12),
      bank(12, 300, ' — chốt 90 ngày, đủ vốn từ HSK 2'),
      speak(12, 'kể về sở thích và chuyến đi sắp tới'),
      video(12, 3),
      review(12, 4),
    ],
    patterns: [
      { pattern: '我喜欢 + V/N', vi: 'Tôi thích gì đó', ex: '我喜欢看电影。', exVi: 'Tôi thích xem phim.' },
      { pattern: '如果 A，就 B', vi: 'Nếu A thì B', ex: '如果有时间，我就去旅游。', exVi: 'Nếu có thời gian thì tôi sẽ đi du lịch.' },
      { pattern: '一起 + V + 吧', vi: 'Cùng nhau làm gì đi (rủ rê)', ex: '我们一起去吧。', exVi: 'Chúng ta cùng đi nhé.' },
    ],
  },
]

export const ZH_PLAN_TASK_TOTAL = ZH_PLAN_12_WEEKS.reduce((s, w) => s + w.tasks.length, 0)
