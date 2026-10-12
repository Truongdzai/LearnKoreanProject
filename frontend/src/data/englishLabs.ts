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
const N_READ = 'Số đếm & giờ giấc: chế độ Đọc số đạt 80% (giá tiền, năm, giờ "a quarter to", ngày tháng)'
const N_LISTEN = 'Số đếm & giờ giấc: chế độ Nghe số đạt 80% (phân biệt 13 / 30, 7:15 / 7:45)'
const N_TYPE = 'Số đếm & giờ giấc: nghe & gõ số đạt 80% (chép lại giá tiền, giờ hẹn khi nghe)'

export const EN_LAB_TASKS: Record<EnPlanMode, Record<number, WeekTask[]>> = {
  // Số đếm ở tuần 3 (con số & thời gian), quá khứ đơn ở tuần 6, hiện tại hoàn thành ở tuần 9
  lite: {
    3: [lab('w', 3, 'ennumbers', ['read'], N_READ)],
    6: [lab('w', 6, 'enirregular', ['v2'], V2)],
    7: [lab('w', 7, 'ennumbers', ['listen'], N_LISTEN)],
    9: [lab('w', 9, 'enirregular', ['v3'], V3)],
    10: [lab('w', 10, 'ennumbers', ['type'], N_TYPE)],
    11: [lab('w', 11, 'enirregular', ['type'], TYPE)],
  },
  boot: {
    2: [lab('bw', 2, 'ennumbers', ['read'], N_READ)],
    3: [lab('bw', 3, 'enirregular', ['v2'], V2)],
    4: [lab('bw', 4, 'ennumbers', ['listen'], N_LISTEN)],
    7: [lab('bw', 7, 'enirregular', ['v3'], V3)],
    8: [lab('bw', 8, 'enirregular', ['type'], TYPE)],
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
