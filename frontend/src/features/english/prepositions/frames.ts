// Điền in / on / at (hoặc không cần giới từ). Chỉ chọn câu mà Anh – Mỹ dùng giống nhau,
// bỏ những chỗ hai bên khác nhau (at / on the weekend, in / at a bank, in / at the airport…).

export type PrepGroup = 'time' | 'place'
export type Prep = 'in' | 'on' | 'at' | '-'

export interface Frame {
  id: string
  en: string
  vi: string
  answer: Prep
  group: PrepGroup
  why: string
  options: Prep[]
}

export const PREPS: Prep[] = ['in', 'on', 'at', '-']
export const prepLabel = (p: Prep) => (p === '-' ? 'không cần' : p)

const W = {
  part: 'Buổi trong ngày dùng in: in the morning / afternoon / evening (riêng at night).',
  night: 'at night là cụm cố định (còn in the morning / evening).',
  clock: 'Giờ cụ thể dùng at: at 8 o\'clock, at 3:30, at noon, at midnight.',
  month: 'Tháng, năm, mùa, thập niên dùng in: in July, in 1998, in winter, in the 1990s.',
  day: 'Thứ và ngày cụ thể dùng on: on Monday, on Sunday mornings, on 5 May, on Christmas Day.',
  next: 'Trước next / last / this / every / yesterday / tomorrow không dùng giới từ.',
  within: 'in + khoảng thời gian = "sau … nữa": in two weeks, in a minute.',
  point: 'at cho một thời điểm: at lunchtime, at the same time, at noon.',
  surface: 'on: nằm trên bề mặt — on the table, on the wall, on the sofa, on the ceiling.',
  inside: 'in: ở bên trong một không gian — in the kitchen, in the fridge, in the bottle, in bed.',
  spot: 'at: một điểm, một địa chỉ — at the bus stop, at the door, at the traffic lights, at 25 Tran Hung Dao Street.',
  city: 'Thành phố, quốc gia dùng in: in Hanoi, in Vietnam.',
  vehicle: 'Xe buýt, tàu, máy bay dùng on (on the bus); ô tô, taxi dùng in (in the car).',
  media: 'on TV, on the radio, on the internet; nhưng in the newspaper, in the photo, in the book.',
  floor: 'Tầng và phía dùng on: on the third floor, on your left.',
  home: 'at home (ở nhà) — nhưng go home, come home thì không có giới từ.',
  top: 'Điểm đầu / cuối của một con đường, một trang: at the end of the street, at the bottom of the page.',
}

// Cờ cuối = người Mỹ hay bỏ hẳn giới từ trước thứ / ngày (See you Monday) nên không đưa phương án "không cần"
type Raw = [string, string, Prep, PrepGroup, keyof typeof W, true?]

const RAW: Raw[] = [
  ['I usually get up early ___ the morning.', 'Tôi thường dậy sớm vào buổi sáng.', 'in', 'time', 'part'],
  ['We don\'t work ___ night.', 'Chúng tôi không làm việc vào ban đêm.', 'at', 'time', 'night'],
  ['The class starts ___ 8 o\'clock.', 'Lớp học bắt đầu lúc 8 giờ.', 'at', 'time', 'clock'],
  ['My birthday is ___ July.', 'Sinh nhật tôi vào tháng Bảy.', 'in', 'time', 'month'],
  ['She was born ___ 1998.', 'Cô ấy sinh năm 1998.', 'in', 'time', 'month'],
  ['See you ___ Monday!', 'Hẹn gặp bạn thứ Hai nhé!', 'on', 'time', 'day', true],
  ['The shop is closed ___ Sunday mornings.', 'Cửa hàng đóng cửa vào các sáng Chủ nhật.', 'on', 'time', 'day', true],
  ['He was born ___ the 5th of May.', 'Anh ấy sinh ngày 5 tháng 5.', 'on', 'time', 'day', true],
  ['It\'s very cold here ___ winter.', 'Mùa đông ở đây rất lạnh.', 'in', 'time', 'month'],
  ['I\'ll call you ___ lunchtime.', 'Tôi sẽ gọi cho bạn vào giờ ăn trưa.', 'at', 'time', 'point'],
  ['They got married ___ Christmas Day.', 'Họ cưới nhau vào ngày Giáng sinh.', 'on', 'time', 'day', true],
  ['Let\'s meet ___ next Friday.', 'Thứ Sáu tuần sau mình gặp nhau nhé.', '-', 'time', 'next'],
  ['I saw him ___ yesterday.', 'Hôm qua tôi gặp anh ấy.', '-', 'time', 'next'],
  ['We\'ll finish the project ___ two weeks.', 'Hai tuần nữa chúng tôi sẽ làm xong dự án.', 'in', 'time', 'within'],
  ['The film starts ___ midnight.', 'Phim bắt đầu lúc nửa đêm.', 'at', 'time', 'clock'],
  ['I have lunch ___ noon.', 'Tôi ăn trưa lúc 12 giờ trưa.', 'at', 'time', 'clock'],
  ['Mobile phones were rare ___ the 1990s.', 'Những năm 1990 điện thoại di động còn hiếm.', 'in', 'time', 'month'],
  ['I\'m meeting her ___ this afternoon.', 'Chiều nay tôi gặp cô ấy.', '-', 'time', 'next'],
  ['We play football ___ every Saturday.', 'Thứ Bảy nào chúng tôi cũng đá bóng.', '-', 'time', 'next'],
  ['My exam is ___ Friday morning.', 'Bài thi của tôi vào sáng thứ Sáu.', 'on', 'time', 'day', true],
  ['The meeting is ___ 3:30.', 'Cuộc họp lúc 3 giờ 30.', 'at', 'time', 'clock'],
  ['The museum opened ___ 2010.', 'Bảo tàng mở cửa năm 2010.', 'in', 'time', 'month'],
  ['We arrived ___ the same time.', 'Chúng tôi đến cùng lúc.', 'at', 'time', 'point'],
  ['I\'ll be back ___ a minute.', 'Một phút nữa tôi quay lại.', 'in', 'time', 'within'],
  ['Shops are closed ___ New Year\'s Day.', 'Ngày mùng 1 Tết Dương lịch các cửa hàng đóng cửa.', 'on', 'time', 'day', true],
  ['She goes jogging ___ the evening.', 'Cô ấy chạy bộ vào buổi tối.', 'in', 'time', 'part'],
  ['I\'m going to Da Nang ___ tomorrow.', 'Ngày mai tôi đi Đà Nẵng.', '-', 'time', 'next'],

  ['The keys are ___ the table.', 'Chìa khóa ở trên bàn.', 'on', 'place', 'surface'],
  ['There\'s a picture ___ the wall.', 'Có một bức tranh trên tường.', 'on', 'place', 'surface'],
  ['My mother is ___ the kitchen.', 'Mẹ tôi đang ở trong bếp.', 'in', 'place', 'inside'],
  ['I\'ll wait for you ___ the bus stop.', 'Tôi sẽ đợi bạn ở trạm xe buýt.', 'at', 'place', 'spot'],
  ['She lives ___ Hanoi.', 'Cô ấy sống ở Hà Nội.', 'in', 'place', 'city'],
  ['Make yourself ___ home!', 'Cứ tự nhiên như ở nhà nhé!', 'at', 'place', 'home'],
  ['Someone is ___ the door.', 'Có ai đó đang ở ngoài cửa.', 'at', 'place', 'spot'],
  ['He\'s still ___ bed.', 'Anh ấy vẫn còn nằm trên giường.', 'in', 'place', 'inside'],
  ['I met her ___ the bus.', 'Tôi gặp cô ấy trên xe buýt.', 'on', 'place', 'vehicle'],
  ['She\'s sitting ___ the car.', 'Cô ấy đang ngồi trong xe ô tô.', 'in', 'place', 'vehicle'],
  ['Our office is ___ the third floor.', 'Văn phòng chúng tôi ở tầng ba.', 'on', 'place', 'floor'],
  ['Turn right and the bank is ___ your left.', 'Rẽ phải, ngân hàng ở bên tay trái bạn.', 'on', 'place', 'floor'],
  ['I saw the news ___ TV.', 'Tôi xem tin đó trên ti vi.', 'on', 'place', 'media'],
  ['I read about it ___ the newspaper.', 'Tôi đọc chuyện đó trên báo.', 'in', 'place', 'media'],
  ['Who is the girl ___ this photo?', 'Cô gái trong bức ảnh này là ai?', 'in', 'place', 'media'],
  ['You can find everything ___ the internet.', 'Trên mạng có đủ mọi thứ.', 'on', 'place', 'media'],
  ['Let\'s meet ___ the main entrance.', 'Mình gặp nhau ở cổng chính nhé.', 'at', 'place', 'spot'],
  ['There\'s no water ___ the bottle.', 'Trong chai hết nước rồi.', 'in', 'place', 'inside'],
  ['The cat is sleeping ___ the sofa.', 'Con mèo đang ngủ trên ghế sofa.', 'on', 'place', 'surface'],
  ['Turn left ___ the end of the street.', 'Đến cuối phố thì rẽ trái.', 'at', 'place', 'top'],
  ['Put the milk ___ the fridge, please.', 'Cất sữa vào tủ lạnh giúp mình.', 'in', 'place', 'inside'],
  ['We live ___ 25 Tran Hung Dao Street.', 'Chúng tôi sống ở số 25 phố Trần Hưng Đạo.', 'at', 'place', 'spot'],
  ['Stop ___ the traffic lights.', 'Dừng lại ở chỗ đèn giao thông.', 'at', 'place', 'spot'],
  ['There\'s a spider ___ the ceiling.', 'Có con nhện trên trần nhà.', 'on', 'place', 'surface'],
  ['I\'m tired. Let\'s go ___ home.', 'Mệt rồi. Về nhà thôi.', '-', 'place', 'home'],
  ['My parents live ___ Vietnam.', 'Bố mẹ tôi sống ở Việt Nam.', 'in', 'place', 'city'],
  ['We went to the hotel ___ a taxi.', 'Chúng tôi đi taxi về khách sạn.', 'in', 'place', 'vehicle'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, answer, group, why, dropOk]) => ({
  id: en, en, vi, answer, group, why: W[why], options: dropOk ? ['in', 'on', 'at'] : PREPS,
}))

export const GROUPS: { id: PrepGroup; label: string; desc: string }[] = [
  { id: 'time', label: 'Thời gian', desc: 'at 8 o\'clock, on Monday, in July — và khi nào không cần giới từ (next week, yesterday).' },
  { id: 'place', label: 'Nơi chốn', desc: 'in the kitchen, on the wall, at the bus stop, on the bus / in the car, on TV.' },
]

export const ROUND = 10

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildRound(group: PrepGroup, weak: string[]): Frame[] {
  const pool = FRAMES.filter((f) => f.group === group)
  const w = shuffle(pool.filter((f) => weak.includes(f.id))).slice(0, Math.ceil(ROUND / 2))
  const rest = shuffle(pool.filter((f) => !weak.includes(f.id)))
  return shuffle([...w, ...rest].slice(0, ROUND))
}

// Câu đã điền (bỏ chỗ trống nếu không cần giới từ)
export const filled = (f: Frame) => (f.answer === '-' ? f.en.replace(' ___', '') : f.en.replace('___', f.answer))
