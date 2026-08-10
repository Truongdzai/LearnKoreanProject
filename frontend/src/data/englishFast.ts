import type { IconName } from '@/core/components/Icon'
import type { AppView } from '@/core/constants/enum'

export type FastLetter = 'F' | 'A' | 'S' | 'T'

export type SkillId = 'read' | 'listen' | 'speak' | 'write'

export type FastStage = 'a1a2' | 'a2b1'

export interface FastPillar {
  letter: FastLetter
  en: string
  vi: string
  tone: string
  icon: IconName
  claim: string
  points: string[]
}

export const FAST_PILLARS: FastPillar[] = [
  {
    letter: 'F',
    en: 'Focus',
    vi: 'Tập trung đúng chỗ',
    tone: 'tone-a',
    icon: 'target',
    claim: 'Học 20% mang lại 80% kết quả: phát âm, ngữ pháp nói, từ vựng tần suất cao.',
    points: [
      'Phát âm trước tiên — nói sai thì vốn từ nhiều tới đâu người nghe cũng không hiểu.',
      'Ngữ pháp nói chỉ cần 7 điểm lõi, đủ cho 80–90% hội thoại hằng ngày.',
      'Từ vựng đi theo tần suất, không học tràn lan: 3000 từ lõi hiểu ~90% lời nói đời thường.',
    ],
  },
  {
    letter: 'A',
    en: 'Associate',
    vi: 'Liên tưởng để hiểu & nhớ',
    tone: 'tone-c',
    icon: 'sparkles',
    claim: 'Thông tin + cảm xúc = trí nhớ dài hạn. Học từ trong ngữ cảnh, không học từ trần trụi.',
    points: [
      'Ngữ cảnh: mỗi từ gắn với một tình huống thật bạn sẽ gặp, không phải một dòng trong danh sách.',
      'Vừa sức & thích thú: tài liệu hiểu được ~95%, chỉ 4–5% là từ mới. Chán là não ngừng ghi.',
      'Chủ động: tự đặt câu, tự kể lại, dạy người khác — dùng ngay thay vì đọc đi đọc lại.',
    ],
  },
  {
    letter: 'S',
    en: 'System',
    vi: 'Hệ thống hoá để luyện đều',
    tone: 'tone-e',
    icon: 'chart',
    claim: 'Chia thời gian cho 4 kỹ năng theo tỉ lệ đúng với trình độ, rồi lặp lại mỗi tuần.',
    points: [
      'Mới bắt đầu thì Đọc chiếm nhiều nhất — đọc là nơi vốn từ lớn lên nhanh nhất.',
      'Giờ nghe được chia nhỏ: vừa đọc vừa nghe, nhại theo, chép chính tả, hội thoại, nghe giải trí.',
      'Kế hoạch tuần cố định quan trọng hơn một buổi học hăng máu rồi bỏ.',
    ],
  },
  {
    letter: 'T',
    en: 'Timely feedback',
    vi: 'Phản hồi kịp thời',
    tone: 'tone-b',
    icon: 'bell',
    claim: 'Lỗi không được sửa sớm sẽ hoá thạch — sửa mất gấp nhiều lần so với học đúng từ đầu.',
    points: [
      'Ghi lại lỗi ngay khi phát hiện, đừng tin vào trí nhớ.',
      'Mỗi tuần soi lại sổ lỗi một lần, chọn 3 lỗi để chữa dứt điểm.',
      'Nhờ người trình độ C1 trở lên nghe bạn nói 1–2 buổi/tuần — không nhất thiết phải là người bản xứ.',
    ],
  },
]

export const MINDSET: { icon: IconName; wrong: string; right: string }[] = [
  {
    icon: 'frog',
    wrong: 'Tiếng Anh là môn học, học thuộc là xong.',
    right: 'Tiếng Anh là kỹ năng cơ bắp. Biết luật chơi bóng đá không làm bạn đá được bóng — phải ra sân.',
  },
  {
    icon: 'flame',
    wrong: 'Phải nói đúng ngữ pháp rồi mới dám mở miệng.',
    right: 'Phản xạ trước, chuẩn xác sau. Nói sai mà người ta hiểu vẫn hơn nói đúng sau 10 giây im lặng.',
  },
  {
    icon: 'clock',
    wrong: 'Học dồn cuối tuần 5 tiếng cho bằng anh bằng em.',
    right: 'Mỗi ngày 45 phút thắng mỗi tuần 5 tiếng. Não cần lặp lại nhiều lần, không cần một lần thật lâu.',
  },
  {
    icon: 'target',
    wrong: 'Học hết từ điển rồi mới đi giao tiếp.',
    right: 'Dùng gì học nấy. Chọn đúng 20% cần cho đời sống của bạn rồi dùng ngay hôm đó.',
  },
]

export const PRON_PRIORITY: { title: string; why: string; groupIds: string[] }[] = [
  {
    title: 'Âm cuối',
    why: 'Người Việt quen nuốt âm cuối. Mất âm cuối là mất luôn số nhiều, thì quá khứ và ranh giới giữa các từ.',
    groupIds: ['end-stop', 'end-s', 'end-ed'],
  },
  {
    title: 'Âm /r/ và các âm gần nó',
    why: 'Cong lưỡi không chạm vòm miệng. Lẫn /r/ với /l/, /n/ làm người nghe hiểu sang từ khác.',
    groupIds: ['l-n-r'],
  },
  {
    title: 'Trọng âm & nối âm',
    why: 'Tiếng Anh có nhạc điệu. Nhấn sai chỗ hoặc tách rời từng từ khiến câu đúng vẫn nghe rất khó hiểu.',
    groupIds: ['stress', 'linking', 'rhythm'],
  },
]

export const PRON_SIGNATURE = {
  en: 'There were three patterns over here.',
  vi: 'Có ba khuôn mẫu ở đây.',
  why: 'Một câu gói trọn ba lỗi nặng nhất: âm "th" (There, three), âm /r/ (were, three, patterns, over, here) và âm cuối /z/, /n/, /s/. Đọc trôi câu này là qua được cửa ải khó nhất.',
}

export const SPOKEN_GRAMMAR_CORE = ['e01', 'e03', 'e04', 'e08', 'e09', 'e12', 'e15']

export const SPOKEN_GRAMMAR_NOTE =
  'Bảy bài này là "ngữ pháp nói" — ba thì đơn (hiện tại, quá khứ, tương lai), hiện tại tiếp diễn, và các trợ động từ be / do / have / can / will / should. Nắm chắc bấy nhiêu đã đủ 80–90% hội thoại hằng ngày. 11 bài còn lại làm cho câu văn đẹp hơn, học sau cũng chưa muộn.'

export interface VocabCircle {
  id: 'read' | 'listen' | 'say'
  name: string
  sub: string
  target: number
  desc: string
  tone: string
}

export const VOCAB_CIRCLES: VocabCircle[] = [
  {
    id: 'read',
    name: 'Vòng Đọc',
    sub: 'Nhìn là hiểu',
    target: 3000,
    desc: 'Vòng rộng nhất. Gặp trên giấy thì hiểu, nhưng chưa chắc nghe ra và chưa tự bật ra được.',
    tone: 'tone-a',
  },
  {
    id: 'listen',
    name: 'Vòng Nghe',
    sub: 'Nghe là bắt được',
    target: 2000,
    desc: 'Hẹp hơn vòng Đọc. Từ chỉ vào được đây khi bạn đã nghe nó vang lên nhiều lần ở tốc độ thật.',
    tone: 'tone-c',
  },
  {
    id: 'say',
    name: 'Vòng Nói & Viết',
    sub: 'Tự bật ra được',
    target: 1200,
    desc: 'Vòng lõi. Đây mới là vốn từ thật của bạn — từ tự đến khi cần, không phải nghĩ mới ra.',
    tone: 'tone-e',
  },
]

export const VOCAB_CIRCLE_NOTE =
  'Việc của bạn không phải nhồi thêm từ mới vào vòng ngoài, mà là kéo từ đã biết từ vòng Đọc vào vòng Nghe, rồi vào vòng Nói. Một từ dùng được đáng giá hơn năm từ nhìn thấy quen quen.'

export interface StageSpec {
  id: FastStage
  name: string
  range: string
  desc: string
  budget: Record<SkillId, number>
}

export const STAGES: StageSpec[] = [
  {
    id: 'a1a2',
    name: 'Mới bắt đầu',
    range: 'A1 → A2',
    desc: 'Vốn từ còn mỏng. Ưu tiên nạp vào: đọc nhiều để vốn từ lớn nhanh, nghe để quen âm, nói viết vừa đủ để không sợ.',
    budget: { read: 50, listen: 30, speak: 10, write: 10 },
  },
  {
    id: 'a2b1',
    name: 'Đã có nền',
    range: 'A2 → B1',
    desc: 'Đã hiểu kha khá. Giờ phải đẩy từ vòng ngoài vào vòng trong: tăng gấp đôi giờ nói và viết.',
    budget: { read: 30, listen: 30, speak: 20, write: 20 },
  },
]

export const SKILLS: { id: SkillId; name: string; icon: IconName; tone: string; hint: string }[] = [
  { id: 'read', name: 'Đọc', icon: 'book', tone: 'tone-a', hint: 'Nơi vốn từ lớn nhanh nhất — đọc thứ hiểu được ~95%.' },
  { id: 'listen', name: 'Nghe', icon: 'headphones', tone: 'tone-c', hint: 'Chia nhỏ thành 5 việc, đừng chỉ bật cho có.' },
  { id: 'speak', name: 'Nói', icon: 'mic', tone: 'tone-e', hint: 'Kéo từ vào vòng lõi. Nói với AI mỗi ngày, với người 1–2 buổi/tuần.' },
  { id: 'write', name: 'Viết', icon: 'note', tone: 'tone-b', hint: 'Viết là nói chậm — có thời gian nghĩ nên sửa được lỗi tận gốc.' },
]

export interface ListenTask {
  id: string
  label: string
  pct: number
  desc: string
  view: AppView | null
  cta: string
}

export const LISTEN_SPLIT: ListenTask[] = [
  {
    id: 'readlisten',
    label: 'Vừa đọc vừa nghe',
    pct: 30,
    desc: 'Bật phụ đề, mắt bám chữ, tai bám tiếng. Đây là cầu nối kéo từ ở vòng Đọc sang vòng Nghe.',
    view: 'library',
    cta: 'Mở kho video',
  },
  {
    id: 'shadowing',
    label: 'Nhại theo (shadowing)',
    pct: 20,
    desc: 'Nói đè lên người bản xứ, chậm hơn họ nửa giây. Học nhịp và nối âm bằng miệng chứ không bằng mắt.',
    view: 'library',
    cta: 'Luyện nhại theo',
  },
  {
    id: 'dictation',
    label: 'Chép chính tả',
    pct: 20,
    desc: 'Nghe 2 phút, chép lại, dò sai ở đâu. Chỗ chép sai chính là chỗ tai bạn đang thủng.',
    view: 'library',
    cta: 'Chép chính tả',
  },
  {
    id: 'conversation',
    label: 'Hội thoại',
    pct: 20,
    desc: 'Nghe để trả lời, không nghe để hiểu suông. Áp lực phải đáp lại mới ép tai làm việc thật.',
    view: 'speaking',
    cta: 'Nói với AI',
  },
  {
    id: 'enjoy',
    label: 'Nghe giải trí',
    pct: 10,
    desc: 'Xem thứ bạn thích, không ghi chép, không tra từ. Giữ lửa và cho não quen môi trường tiếng Anh.',
    view: null,
    cta: '',
  },
]

export interface ErrorKind {
  id: string
  label: string
  icon: IconName
  tone: string
  hint: string
}

export const ERROR_KINDS: ErrorKind[] = [
  { id: 'pron', label: 'Phát âm', icon: 'mic', tone: 'tone-e', hint: 'Từ đọc sai, âm cuối rơi, nhấn sai trọng âm.' },
  { id: 'grammar', label: 'Ngữ pháp', icon: 'book', tone: 'tone-a', hint: 'Sai thì, thiếu "s", quên trợ động từ.' },
  { id: 'word', label: 'Từ vựng', icon: 'cards', tone: 'tone-c', hint: 'Dùng sai từ, dịch word-by-word từ tiếng Việt.' },
  { id: 'fluency', label: 'Trôi chảy', icon: 'trending', tone: 'tone-b', hint: 'Ngập ngừng, lặp từ đệm, ngắt câu sai chỗ.' },
]

export const FEEDBACK_LOOP: { n: number; title: string; desc: string }[] = [
  { n: 1, title: 'Bắt lỗi ngay', desc: 'Vừa nói xong, vừa bị chấm phát âm, vừa bị AI sửa câu — ghi vào sổ trong vòng 1 phút.' },
  { n: 2, title: 'Xếp loại lỗi', desc: 'Phát âm, ngữ pháp, từ vựng hay trôi chảy? Xếp đúng loại mới thấy được mình yếu ở đâu nhất.' },
  { n: 3, title: 'Chữa 3 lỗi mỗi tuần', desc: 'Đừng chữa hết. Ưu tiên 3 lỗi nằm trong sổ lâu nhất — chính chúng đang hoá thạch dần.' },
  { n: 4, title: 'Đóng sổ khi đã sạch', desc: 'Nói lại đúng 3 lần liên tiếp thì đánh dấu đã chữa. Sổ ngắn lại là bằng chứng bạn đang tiến.' },
]

export const WEEK_MINUTES_PRESETS = [150, 300, 450, 900]

const SKILL_IDS: SkillId[] = ['read', 'listen', 'speak', 'write']

export function budgetMinutes(total: number, budget: Record<SkillId, number>): Record<SkillId, number> {
  const exact = SKILL_IDS.map((id) => (total * budget[id]) / 100)
  const mins = exact.map(Math.floor)
  let rest = Math.round(total) - mins.reduce((a, b) => a + b, 0)

  const byRemainder = SKILL_IDS.map((_, i) => i).sort((a, b) => (exact[b] - mins[b]) - (exact[a] - mins[a]))
  for (const i of byRemainder) {
    if (rest <= 0) break
    mins[i] += 1
    rest -= 1
  }

  return {
    read: mins[0],
    listen: mins[1],
    speak: mins[2],
    write: mins[3],
  }
}

export function stageOf(id: FastStage): StageSpec {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]
}

export function fmtMinutes(m: number): string {
  if (m < 60) return `${m} phút`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} giờ ${r} phút` : `${h} giờ`
}
