
import { type WeekPlan } from './vocabCore'
import { KO_UNITS } from './koreanCore'
import { KO_PRON_GROUPS } from './koreanPronunciation'
import { PRON_PASS } from './englishPronunciation'

export const KO_TARGET_WORDS = 800

const unitName = (id: string): string => KO_UNITS.find((u) => u.id === id)?.name ?? id

const unitSize = (id: string): number => KO_UNITS.find((u) => u.id === id)?.words.length ?? 0

const vocab = (week: number, seq: number, unitId: string) => ({
  id: `kw${week}-v${seq}`,
  kind: 'vocab' as const,
  unitId,
  pct: 100,
  label: `Thuộc toàn bộ "${unitName(unitId)}" (${unitSize(unitId)} từ)`,
})

const quiz = (week: number) => ({
  id: `kw${week}-quiz`,
  kind: 'quiz' as const,
  passPct: 70,
  label: 'Kiểm tra tuần đạt từ 70%',
})

const bank = (week: number, targetTotal: number, note = '') => ({
  id: `kw${week}-bank`,
  kind: 'total' as const,
  targetTotal,
  label: `Kho từ đạt ${targetTotal}${note}`,
})

const video = (week: number, n: number) => ({
  id: `kw${week}-video`,
  kind: 'video' as const,
  n,
  label: `Xem ${n} video tiếng Hàn + bấm từ mới trong phụ đề để lưu thẻ`,
})

const review = (week: number, n: number) => ({
  id: `kw${week}-review`,
  kind: 'review' as const,
  n,
  label: `Vào Ôn tập (SRS) ít nhất ${n} ngày trong tuần`,
})

const pron = (week: number, groupId: string) => {
  const g = KO_PRON_GROUPS.find((x) => x.id === groupId)
  return {
    id: `kw${week}-pron`,
    kind: 'pron' as const,
    groupId,
    label: `Phát âm: ${g?.title ?? groupId} (kiểm tra đạt ≥ ${PRON_PASS}%)`,
  }
}

const speak = (week: number, topic: string) => ({
  id: `kw${week}-speak`,
  kind: 'speak' as const,
  label: `Luyện nói 1 buổi với AI: ${topic}`,
})

export const KO_PLAN_12_WEEKS: WeekPlan[] = [
  {
    week: 1, month: 1, phase: 'Compress', title: 'Chào hỏi & gia đình',
    focus: 'Câu cửa miệng và cách gọi người thân — thứ bạn dùng ngay trong 10 giây đầu của mọi cuộc gặp.',
    rhythm: 'Ngày 1–3: cụm chào hỏi · Ngày 4–5: gia đình & xưng hô · Ngày 6: kiểm tra tuần · Ngày 7: ôn SRS.',
    quizUnits: ['greetings', 'family', 'honorific'],
    tasks: [
      vocab(1, 1, 'greetings'),
      vocab(1, 2, 'family'),
      vocab(1, 3, 'honorific'),
      vocab(1, 4, 'particles'),
      vocab(1, 5, 'social'),
      pron(1, 'ko-aspirate'),
      quiz(1),
      bank(1, 60),
      video(1, 2),
      review(1, 3),
    ],
    patterns: [
      { pattern: 'N + 이에요/예요', vi: 'Là N (câu giới thiệu cơ bản)', ex: '저는 학생이에요.', exVi: 'Tôi là học sinh.' },
      { pattern: 'N + 이/가 뭐예요?', vi: 'N là gì vậy?', ex: '이름이 뭐예요?', exVi: 'Tên bạn là gì?' },
      { pattern: '만나서 반갑습니다', vi: 'Rất vui được gặp bạn', ex: '안녕하세요, 만나서 반갑습니다.', exVi: 'Xin chào, rất vui được gặp bạn.' },
    ],
  },
  {
    week: 2, month: 1, phase: 'Compress', title: 'Hỏi han & nơi chốn',
    focus: 'Bộ 5W1H tiếng Hàn cộng các địa điểm hay tới — đủ để hỏi đường và hẹn chỗ gặp.',
    rhythm: 'Ngày 1–2: từ để hỏi · Ngày 3–5: nơi chốn · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['questions', 'places', 'connectors'],
    tasks: [
      vocab(2, 1, 'questions'),
      vocab(2, 2, 'places'),
      vocab(2, 3, 'connectors'),
      vocab(2, 4, 'conj2'),
      vocab(2, 5, 'street'),
      pron(2, 'ko-tense'),
      quiz(2),
      bank(2, 120),
      video(2, 2),
      review(2, 3),
    ],
    patterns: [
      { pattern: 'N + 이/가 어디예요?', vi: 'N ở đâu vậy?', ex: '화장실이 어디예요?', exVi: 'Nhà vệ sinh ở đâu ạ?' },
      { pattern: 'N + 에 가요', vi: 'Đi tới N', ex: '지금 학교에 가요.', exVi: 'Bây giờ tôi đi học.' },
      { pattern: '이거/그거/저거', vi: 'Cái này / cái đó / cái kia', ex: '이거 얼마예요?', exVi: 'Cái này bao nhiêu tiền ạ?' },
    ],
  },
  {
    week: 3, month: 1, phase: 'Compress', title: 'Động từ gốc & ăn uống',
    focus: '12 động từ ghép được vô số câu, cộng bộ từ ăn uống để đi quán một mình không cần chỉ tay.',
    rhythm: 'Ngày 1–3: động từ · Ngày 4–5: ăn uống · Ngày 6: kiểm tra · Ngày 7: luyện nói gọi món.',
    quizUnits: ['verbs', 'food', 'fruit'],
    tasks: [
      vocab(3, 1, 'verbs'),
      vocab(3, 2, 'food'),
      vocab(3, 3, 'fruit'),
      vocab(3, 4, 'hada'),
      vocab(3, 5, 'taste'),
      pron(3, 'ko-eo-o'),
      quiz(3),
      bank(3, 180),
      speak(3, 'gọi món ở quán ăn Hàn'),
      review(3, 3),
    ],
    patterns: [
      { pattern: 'N + 을/를 + V-아요/어요', vi: 'Làm gì đó với N (câu hiện tại lịch sự)', ex: '밥을 먹어요.', exVi: 'Tôi ăn cơm.' },
      { pattern: 'N + 주세요', vi: 'Cho tôi N', ex: '물 주세요.', exVi: 'Cho tôi nước ạ.' },
      { pattern: '안 + V', vi: 'Không làm gì đó', ex: '저는 커피를 안 마셔요.', exVi: 'Tôi không uống cà phê.' },
    ],
  },
  {
    week: 4, month: 1, phase: 'Compress', title: 'Thời gian & hai hệ số đếm',
    focus: 'Hàn có HAI hệ số: thuần Hàn (하나·둘·셋) đếm đồ vật và giờ, Hán–Hàn (일·이·삼) cho tiền, phút, ngày tháng.',
    rhythm: 'Ngày 1–2: mốc thời gian · Ngày 3–5: số Hán–Hàn & tiền · Ngày 6: kiểm tra chốt tháng 1 · Ngày 7: ôn SRS.',
    quizUnits: ['timenum', 'sinonum', 'purehan', 'time2'],
    tasks: [
      vocab(4, 1, 'timenum'),
      vocab(4, 2, 'sinonum'),
      vocab(4, 3, 'purehan'),
      vocab(4, 4, 'time2'),
      vocab(4, 5, 'order'),
      vocab(4, 6, 'daily2'),
      pron(4, 'ko-eu-u'),
      quiz(4),
      bank(4, 250, ' — chốt tháng 1'),
      video(4, 2),
    ],
    patterns: [
      { pattern: '지금 + 몇 시예요?', vi: 'Bây giờ mấy giờ?', ex: '지금 몇 시예요?', exVi: 'Bây giờ mấy giờ ạ?' },
      { pattern: '(số thuần Hàn) 시 + (số Hán–Hàn) 분', vi: 'Giờ dùng số thuần Hàn, phút dùng số Hán–Hàn', ex: '세 시 십 분이에요.', exVi: 'Ba giờ mười phút ạ.' },
      { pattern: 'N + 원이에요', vi: 'Giá N won', ex: '이거 오천 원이에요.', exVi: 'Cái này năm nghìn won.' },
    ],
  },
  {
    week: 5, month: 2, phase: 'Compile', title: 'Cơ thể & tính từ cơ bản',
    focus: 'Nói được chỗ đau và mô tả to–nhỏ, đắt–rẻ. Bắt đầu ghép câu có tính từ.',
    rhythm: 'Ngày 1–2: cơ thể · Ngày 3–5: tính từ · Ngày 6: kiểm tra · Ngày 7: ôn SRS + nghe lại từ khó.',
    quizUnits: ['body', 'adjectives', 'state'],
    tasks: [
      vocab(5, 1, 'body'),
      vocab(5, 2, 'adjectives'),
      vocab(5, 3, 'state'),
      vocab(5, 4, 'body2'),
      vocab(5, 5, 'feeling2'),
      pron(5, 'ko-e-ae'),
      quiz(5),
      bank(5, 310),
      video(5, 2),
      review(5, 3),
    ],
    patterns: [
      { pattern: 'N + 이/가 아파요', vi: 'N bị đau', ex: '머리가 아파요.', exVi: 'Tôi bị đau đầu.' },
      { pattern: 'A + 아요/어요', vi: 'Câu tả trạng thái', ex: '이 가방은 너무 커요.', exVi: 'Cái túi này to quá.' },
      { pattern: 'A + -(으)ㄴ + N', vi: 'Tính từ đứng trước danh từ', ex: '작은 가방을 샀어요.', exVi: 'Tôi đã mua cái túi nhỏ.' },
    ],
  },
  {
    week: 6, month: 2, phase: 'Compile', title: 'Sinh hoạt trong nhà',
    focus: 'Chuỗi hành động một ngày (dậy, rửa, ngồi, mở, đóng) và đồ đạc trong nhà.',
    rhythm: 'Ngày 1–3: động từ sinh hoạt · Ngày 4–5: nhà cửa · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['verbs2', 'home', 'kitchen'],
    tasks: [
      vocab(6, 1, 'verbs2'),
      vocab(6, 2, 'home'),
      vocab(6, 3, 'kitchen'),
      vocab(6, 4, 'house2'),
      vocab(6, 5, 'irregular'),
      pron(6, 'ko-batchim-stop'),
      quiz(6),
      bank(6, 370),
      video(6, 2),
      review(6, 3),
    ],
    patterns: [
      { pattern: 'V + -고 싶어요', vi: 'Muốn làm gì đó', ex: '집에서 쉬고 싶어요.', exVi: 'Tôi muốn nghỉ ở nhà.' },
      { pattern: 'V + -(으)세요', vi: 'Mời/hãy làm gì đó (lịch sự)', ex: '여기 앉으세요.', exVi: 'Mời bạn ngồi đây.' },
      { pattern: 'V + -고 + V', vi: 'Làm việc này rồi làm việc kia', ex: '손을 씻고 밥을 먹어요.', exVi: 'Tôi rửa tay rồi ăn cơm.' },
    ],
  },
  {
    week: 7, month: 2, phase: 'Compile', title: 'Vị trí & màu sắc',
    focus: 'Trên–dưới–trong–ngoài–trái–phải và bảng màu — hai bộ từ dùng suốt khi chỉ đường, mua đồ.',
    rhythm: 'Ngày 1–3: vị trí & phương hướng · Ngày 4–5: màu sắc · Ngày 6: kiểm tra · Ngày 7: luyện nói hỏi đường.',
    quizUnits: ['directions', 'colors', 'city'],
    tasks: [
      vocab(7, 1, 'directions'),
      vocab(7, 2, 'colors'),
      vocab(7, 3, 'city'),
      vocab(7, 4, 'nature'),
      vocab(7, 5, 'safety'),
      pron(7, 'ko-batchim-nasal'),
      quiz(7),
      bank(7, 430),
      speak(7, 'hỏi đường tới một địa điểm'),
      review(7, 3),
    ],
    patterns: [
      { pattern: 'N1 + 은/는 + N2 + 에 있어요', vi: 'N1 ở tại N2', ex: '책이 책상 위에 있어요.', exVi: 'Quyển sách ở trên bàn.' },
      { pattern: 'N + (으)로 가세요', vi: 'Hãy đi về phía N', ex: '왼쪽으로 가세요.', exVi: 'Bạn đi về phía bên trái nhé.' },
      { pattern: '무슨 + N', vi: 'N loại gì', ex: '무슨 색깔을 좋아해요?', exVi: 'Bạn thích màu gì?' },
    ],
  },
  {
    week: 8, month: 2, phase: 'Compile', title: 'Thời tiết, cảm xúc & muôn loài',
    focus: 'Chủ đề mở đầu câu chuyện an toàn nhất với người Hàn, cộng cách nói ra cảm giác của mình.',
    rhythm: 'Ngày 1–2: thời tiết · Ngày 3–4: cảm xúc · Ngày 5: động vật & cây cỏ · Ngày 6: kiểm tra chốt tháng 2 · Ngày 7: ôn SRS.',
    quizUnits: ['weather', 'emotions', 'animals', 'character'],
    tasks: [
      vocab(8, 1, 'weather'),
      vocab(8, 2, 'emotions'),
      vocab(8, 3, 'animals'),
      vocab(8, 4, 'character'),
      vocab(8, 5, 'event'),
      vocab(8, 6, 'media'),
      pron(8, 'ko-batchim-l'),
      quiz(8),
      bank(8, 500, ' — chốt tháng 2'),
      video(8, 2),
      review(8, 3),
    ],
    patterns: [
      { pattern: 'A/V + -아서/어서', vi: 'Vì … nên …', ex: '날씨가 좋아서 산책했어요.', exVi: 'Vì thời tiết đẹp nên tôi đã đi dạo.' },
      { pattern: 'N + 을/를 좋아해요', vi: 'Thích N', ex: '저는 고양이를 좋아해요.', exVi: 'Tôi thích mèo.' },
      { pattern: 'A/V + -지 않아요', vi: 'Không … (dạng phủ định dài)', ex: '오늘은 춥지 않아요.', exVi: 'Hôm nay không lạnh.' },
    ],
  },
  {
    week: 9, month: 3, phase: 'Consolidate', title: 'Trạng từ & động từ giao tiếp',
    focus: 'Rất – hơi – luôn luôn, cộng biết/không biết, hẹn gặp, gọi điện: đủ chất liệu cho hội thoại thật.',
    rhythm: 'Ngày 1–2: trạng từ · Ngày 3–4: động từ giao tiếp · Ngày 5: tính từ mô tả · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['adverbs', 'verbs3', 'adjectives2', 'phonecall'],
    tasks: [
      vocab(9, 1, 'adverbs'),
      vocab(9, 2, 'verbs3'),
      vocab(9, 3, 'adjectives2'),
      vocab(9, 4, 'phonecall'),
      vocab(9, 5, 'adverbs2'),
      vocab(9, 6, 'tech2'),
      pron(9, 'ko-linking'),
      quiz(9),
      bank(9, 570),
      speak(9, 'gọi điện hẹn gặp bạn'),
      review(9, 4),
    ],
    patterns: [
      { pattern: 'V + -(으)ㄹ 수 있어요/없어요', vi: 'Có thể / không thể làm gì', ex: '한국어를 조금 할 수 있어요.', exVi: 'Tôi nói được một chút tiếng Hàn.' },
      { pattern: 'V + -(으)ㄹ게요', vi: 'Tôi sẽ làm (hứa với người nghe)', ex: '이따가 전화할게요.', exVi: 'Lát nữa tôi sẽ gọi điện.' },
      { pattern: 'V + -아/어 주세요', vi: 'Làm giúp tôi việc gì đó', ex: '천천히 말해 주세요.', exVi: 'Bạn nói chậm lại giúp tôi với.' },
    ],
  },
  {
    week: 10, month: 3, phase: 'Consolidate', title: 'Mua sắm & nhà hàng',
    focus: 'Trọn vẹn một buổi đi chợ và một bữa ăn ngoài: hỏi giá, mặc cả, gọi món, thanh toán.',
    rhythm: 'Ngày 1–3: mua sắm & thanh toán · Ngày 4–5: nhà hàng · Ngày 6: kiểm tra · Ngày 7: luyện nói mua sắm.',
    quizUnits: ['shopping', 'restaurant', 'hobby', 'sports'],
    tasks: [
      vocab(10, 1, 'shopping'),
      vocab(10, 2, 'restaurant'),
      vocab(10, 3, 'hobby'),
      vocab(10, 4, 'sports'),
      vocab(10, 5, 'market'),
      vocab(10, 6, 'online'),
      pron(10, 'ko-nasalize'),
      quiz(10),
      bank(10, 640),
      speak(10, 'mua đồ và hỏi giá ở chợ'),
      review(10, 4),
    ],
    patterns: [
      { pattern: 'N + 얼마예요?', vi: 'N bao nhiêu tiền?', ex: '이 옷 얼마예요?', exVi: 'Bộ đồ này bao nhiêu tiền ạ?' },
      { pattern: 'N + 하나 더 주세요', vi: 'Cho tôi thêm một N nữa', ex: '반찬 하나 더 주세요.', exVi: 'Cho tôi thêm một món ăn kèm nữa ạ.' },
      { pattern: 'V + -아도 돼요?', vi: 'Tôi làm … được không ạ?', ex: '여기서 사진 찍어도 돼요?', exVi: 'Chụp ảnh ở đây có được không ạ?' },
    ],
  },
  {
    week: 11, month: 3, phase: 'Consolidate', title: 'Đi lại, lớp học & sức khoẻ',
    focus: 'Ba tình huống bắt buộc khi sống ở Hàn: bắt xe, đi học, đi khám bệnh hoặc mua thuốc.',
    rhythm: 'Ngày 1–2: giao thông · Ngày 3–4: lớp học · Ngày 5: sức khoẻ · Ngày 6: kiểm tra · Ngày 7: ôn SRS.',
    quizUnits: ['transport', 'school', 'health', 'bank'],
    tasks: [
      vocab(11, 1, 'transport'),
      vocab(11, 2, 'school'),
      vocab(11, 3, 'health'),
      vocab(11, 4, 'bank'),
      vocab(11, 5, 'exam'),
      vocab(11, 6, 'post'),
      pron(11, 'ko-palatal'),
      quiz(11),
      bank(11, 720),
      video(11, 3),
      speak(11, 'khám bệnh ở phòng khám'),
    ],
    patterns: [
      { pattern: 'N + 을/를 타고 가요', vi: 'Đi bằng phương tiện N', ex: '지하철을 타고 가요.', exVi: 'Tôi đi bằng tàu điện ngầm.' },
      { pattern: 'V + -(으)러 가요', vi: 'Đi để làm gì đó', ex: '약을 사러 약국에 가요.', exVi: 'Tôi đi hiệu thuốc để mua thuốc.' },
      { pattern: 'V + -아야 해요', vi: 'Phải làm gì đó', ex: '약을 먹어야 해요.', exVi: 'Tôi phải uống thuốc.' },
    ],
  },
  {
    week: 12, month: 3, phase: 'Consolidate', title: 'Công việc, công nghệ & du lịch',
    focus: 'Ba mảng của người trưởng thành: chỗ làm, điện thoại–internet, và một chuyến đi trọn vẹn. Chốt 90 ngày.',
    rhythm: 'Ngày 1–2: quần áo · Ngày 3: công nghệ · Ngày 4: công việc · Ngày 5: du lịch · Ngày 6: kiểm tra tổng · Ngày 7: ôn toàn bộ SRS.',
    quizUnits: ['clothing', 'tech', 'work', 'office', 'travel'],
    tasks: [
      vocab(12, 1, 'clothing'),
      vocab(12, 2, 'tech'),
      vocab(12, 3, 'work'),
      vocab(12, 4, 'office'),
      vocab(12, 5, 'travel'),
      vocab(12, 6, 'work2'),
      vocab(12, 7, 'travel2'),
      pron(12, 'ko-intonation'),
      quiz(12),
      bank(12, KO_TARGET_WORDS, ' — chốt 90 ngày'),
      speak(12, 'giới thiệu bản thân và công việc'),
      review(12, 4),
    ],
    patterns: [
      { pattern: 'N + 에서 일해요', vi: 'Làm việc tại N', ex: '저는 회사에서 일해요.', exVi: 'Tôi làm việc ở công ty.' },
      { pattern: 'V + -(으)ㄹ 거예요', vi: 'Sẽ làm gì đó (tương lai)', ex: '다음 달에 여행을 갈 거예요.', exVi: 'Tháng sau tôi sẽ đi du lịch.' },
      { pattern: 'V + -지 마세요', vi: 'Đừng làm gì đó', ex: '너무 걱정하지 마세요.', exVi: 'Bạn đừng lo lắng quá.' },
    ],
  },
]

export const KO_PLAN_TASK_TOTAL = KO_PLAN_12_WEEKS.reduce((s, w) => s + w.tasks.length, 0)
