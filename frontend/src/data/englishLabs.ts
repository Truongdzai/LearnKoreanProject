import type { LabKey } from '@/core/labScores'
import type { WeekPlan, WeekTask } from './vocabCore'

// Nhiệm vụ phòng luyện của lộ trình tiếng Anh, tách riêng để trang chủ đọc được mà không phải nạp cả bộ từ vựng.

export type EnPlanMode = 'lite' | 'boot'

const lab = (prefix: string, week: number, key: LabKey, modes: string[], label: string, passPct = 80): WeekTask => ({
  id: `${prefix}${week}-${key}-${modes.join('')}`,
  kind: 'lab',
  lab: key,
  modes,
  passPct,
  label,
})

const V2 = 'Động từ bất quy tắc: chế độ Chọn V2 đạt 80% (went, saw, bought… để kể chuyện đã qua)'
const V3 = 'Động từ bất quy tắc: chế độ Chọn V3 đạt 80% (gone, seen, written — dùng sau have / has)'
const TYPE = 'Động từ bất quy tắc: tự gõ đủ V2 + V3 đạt 80% (không còn phương án để đoán)'
const O_EASY = 'Ghép câu: lượt trộn cấp Câu ngắn đạt 80% (câu hỏi do / does, phủ định, tính từ trước danh từ, very well, too)'
const O_HARD = 'Ghép câu: lượt trộn cấp Câu dài đạt 80% (nơi chốn – thời gian, always / never, sở hữu \'s, enough)'
const P_TIME = 'in / on / at: nhóm Thời gian đạt 80% (at 8 o\'clock, on Monday, in July, không dùng giới từ trước next / last)'
const P_PLACE = 'in / on / at: nhóm Nơi chốn đạt 80% (on the bus / in the car, at the bus stop, on TV)'
const P_BOTH = 'in / on / at: cả hai nhóm Thời gian và Nơi chốn đạt 80%'
const T_MIX = 'Chọn thì: một lượt trộn đủ các thì đạt 80% (nhìn dấu hiệu yesterday, since, now, every day…)'
const C_MIX = 'Từ dễ nhầm: một lượt trộn đạt 80% (borrow / lend, say / tell, make / do, bored / boring…)'
const CMP = 'So sánh: một lượt đạt 80% (cheaper, more expensive, better, the best — không nói more cheaper)'
const N_READ = 'Số đếm & giờ giấc: chế độ Đọc số đạt 80% (giá tiền, năm, giờ "a quarter to", ngày tháng)'
const N_LISTEN = 'Số đếm & giờ giấc: chế độ Nghe số đạt 80% (phân biệt 13 / 30, 7:15 / 7:45)'
const N_TYPE = 'Số đếm & giờ giấc: nghe & gõ số đạt 80% (chép lại giá tiền, giờ hẹn khi nghe)'

export const EN_LAB_TASKS: Record<EnPlanMode, Record<number, WeekTask[]>> = {
  // Đặt theo nội dung tuần: con số và giới từ ở tuần 3, ghép câu đơn ở tuần 5, quá khứ đơn ở tuần 6, hiện tại hoàn thành ở tuần 9
  lite: {
    3: [lab('w', 3, 'ennumbers', ['read'], N_READ), lab('w', 3, 'enprep', ['time'], P_TIME)],
    5: [lab('w', 5, 'enorder', ['easy'], O_EASY)],
    6: [lab('w', 6, 'enirregular', ['v2'], V2)],
    7: [lab('w', 7, 'enprep', ['place'], P_PLACE), lab('w', 7, 'ennumbers', ['listen'], N_LISTEN)],
    8: [lab('w', 8, 'encompare', ['mix'], CMP), lab('w', 8, 'enorder', ['hard'], O_HARD)],
    9: [lab('w', 9, 'enirregular', ['v3'], V3), lab('w', 9, 'entense', ['mix'], T_MIX)],
    10: [lab('w', 10, 'ennumbers', ['type'], N_TYPE), lab('w', 10, 'enconfuse', ['mix'], C_MIX)],
    11: [lab('w', 11, 'enirregular', ['type'], TYPE)],
  },
  boot: {
    2: [lab('bw', 2, 'ennumbers', ['read'], N_READ)],
    3: [lab('bw', 3, 'enirregular', ['v2'], V2)],
    4: [lab('bw', 4, 'ennumbers', ['listen'], N_LISTEN), lab('bw', 4, 'enorder', ['easy'], O_EASY)],
    5: [lab('bw', 5, 'encompare', ['mix'], CMP), lab('bw', 5, 'enorder', ['hard'], O_HARD)],
    6: [lab('bw', 6, 'enprep', ['time', 'place'], P_BOTH)],
    7: [lab('bw', 7, 'enirregular', ['v3'], V3), lab('bw', 7, 'entense', ['mix'], T_MIX)],
    8: [lab('bw', 8, 'enirregular', ['type'], TYPE), lab('bw', 8, 'enconfuse', ['mix'], C_MIX)],
    9: [lab('bw', 9, 'ennumbers', ['type'], N_TYPE)],
  },
}

// Chèn nhiệm vụ phòng luyện ngay sau bài ngữ pháp cuối cùng của tuần
export function withLabs(weeks: WeekPlan[], mode: EnPlanMode): WeekPlan[] {
  return weeks.map((w) => {
    const extra = EN_LAB_TASKS[mode][w.week]
    if (!extra?.length) return w
    const tasks = [...w.tasks]
    let at = -1
    tasks.forEach((t, k) => { if (t.kind === 'grammar') at = k })
    tasks.splice(at < 0 ? tasks.length : at + 1, 0, ...extra)
    return { ...w, tasks }
  })
}

// Chế độ lộ trình đang chọn (lưu cục bộ bởi trang Tiếng Anh)
export function readEnMode(): EnPlanMode {
  try {
    const raw = localStorage.getItem('vyling.en.mode')
    return raw && (JSON.parse(raw) as { mode?: string } | null)?.mode === 'boot' ? 'boot' : 'lite'
  } catch {
    return 'lite'
  }
}
