// Phần tính giờ học (hàm thuần, kiểm thử được) dùng cho useStudyClock

export const STUDY_VIEWS = new Set([
  'learn', 'library', 'myvideos', 'flashcards', 'vocab', 'speaking', 'tutor', 'english', 'toeic',
  'korean', 'topik', 'chinese', 'hsk', 'path', 'courses', 'lingo',
])

export const IDLE_MS = 90_000
export const TICK_MS = 5_000
// Gửi theo lô vài phút một lần cho đỡ gọi API; backend chặn tối đa 120 phút mỗi lần
export const FLUSH_EVERY_SEC = 120
export const MAX_FLUSH_MIN = 5

export interface Signals {
  visible: boolean
  studyView: boolean
  media: boolean
  lastInput: number
}

// Hàm thuần: cộng dt giây nếu đang học thật
export function tick(sec: number, now: number, dtSec: number, s: Signals): number {
  const active = s.visible && s.studyView && (s.media || now - s.lastInput <= IDLE_MS)
  return active ? sec + dtSec : sec
}

// Tách số phút trọn vẹn để gửi, phần lẻ giữ lại; mỗi lần gửi không quá MAX_FLUSH_MIN
export function takeMinutes(sec: number, max = MAX_FLUSH_MIN): [number, number] {
  const minutes = Math.min(max, Math.floor(sec / 60))
  return [minutes, sec - minutes * 60]
}

// Trình phát YouTube nằm trong iframe nên không thấy thẻ <video>; hook trình phát báo trạng thái về đây
const ytPlaying = new Set<string>()

export function setYoutubePlaying(id: string, playing: boolean): void {
  if (playing) ytPlaying.add(id)
  else ytPlaying.delete(id)
}

export function youtubePlaying(): boolean {
  return ytPlaying.size > 0
}
