// Mệnh đề quan hệ: who / which / whose / where / when và mệnh đề có dấu phẩy. Mỗi câu chỉ một phương án đúng:
// câu không có dấu phẩy không đưa that làm phương án sai (that thay được who/which), chỗ trống ở đó luôn ở vị trí
// chủ ngữ hoặc trước một mệnh đề đã đủ thành phần (nơi which sai hẳn), không dùng con vật hay danh từ tập thể.
// Không đưa where làm phương án sai cho the day / the time (văn nói vẫn dùng), không để when sau "This is …"
// (đọc được kiểu chú thích ảnh: This is the café when we first met).

export type RelativeGroup = 'who' | 'which' | 'whose' | 'where' | 'comma'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: RelativeGroup
}

export const GROUPS: Record<RelativeGroup, { name: string; form: string; rule: string; ex: string }> = {
  who: {
    name: 'who — chỉ người',
    form: 'người + who + động từ',
    rule: 'who thay cho người: the man, a friend, someone, anyone. Không dùng which cho người, và không được bỏ who khi nó làm chủ ngữ.',
    ex: 'That\'s the woman who helped me find my phone.',
  },
  which: {
    name: 'which — chỉ vật',
    form: 'vật / sự việc + which + động từ (hoặc chủ ngữ + động từ)',
    rule: 'which thay cho đồ vật, sự việc: the bus, a phone, the email. Không dùng who cho vật. Câu không có dấu phẩy thì that cũng được; which làm tân ngữ (the laptop which I bought) thì bỏ được.',
    ex: 'The laptop which I bought last month is already broken.',
  },
  whose: {
    name: 'whose — sở hữu',
    form: 'danh từ + whose + danh từ',
    rule: 'whose = "của người / vật đó", luôn đứng liền trước một danh từ: whose father, whose roof. Đừng nhầm với who\'s = who is / who has.',
    ex: 'I have a friend whose father is a pilot.',
  },
  where: {
    name: 'where / when — nơi chốn, thời gian',
    form: 'nơi chốn + where, thời gian + when + câu đã đủ thành phần',
    rule: 'where = ở nơi đó, when = vào lúc đó; theo sau là một câu đã đủ thành phần (we first met). Mệnh đề còn thiếu tân ngữ thì vẫn dùng which: the city which I visited.',
    ex: 'Da Lat is the city where my parents got married.',
  },
  comma: {
    name: 'Mệnh đề có dấu phẩy',
    form: 'dấu phẩy + who / which / whose, không dùng that',
    rule: 'Thông tin thêm về người / vật đã rõ (tên riêng, mẹ tôi…) tách bằng dấu phẩy: dùng who / which / whose, không dùng that và không được lược đại từ. which sau dấu phẩy còn thay được cho cả mệnh đề phía trước.',
    ex: 'Ha Long Bay, which is in Quang Ninh, attracts millions of tourists.',
  },
}

type Raw = [string, string, [string, string, string] | [string, string, string, string], RelativeGroup]

const RAW: Raw[] = [
  ['The man ___ lives next door is a doctor.', 'Người đàn ông sống cạnh nhà tôi là bác sĩ.', ['who', 'which', 'whose', 'where'], 'who'],
  ['I thanked the woman ___ found my wallet.', 'Tôi cảm ơn người phụ nữ đã nhặt được ví của tôi.', ['who', 'which', 'whose', 'where'], 'who'],
  ['Do you know the girl ___ is talking to Minh?', 'Bạn có biết cô gái đang nói chuyện với Minh không?', ['who', 'which', 'whose', 'where'], 'who'],
  ['We need someone ___ can speak Japanese.', 'Chúng tôi cần một người nói được tiếng Nhật.', ['who', 'which', 'whose', 'where'], 'who'],
  ['The taxi driver ___ took us to the airport was very friendly.', 'Bác tài taxi chở chúng tôi ra sân bay rất thân thiện.', ['who', 'which', 'whose', 'when'], 'who'],
  ['Students ___ arrive late must wait outside.', 'Học sinh nào đến muộn phải đợi bên ngoài.', ['who', 'which', 'whose', 'where'], 'who'],
  ['I have a friend ___ works for a bank in Da Nang.', 'Tôi có một người bạn làm ngân hàng ở Đà Nẵng.', ['who', 'which', 'where', 'whose'], 'who'],
  ['The nurse ___ looked after my grandmother was very kind.', 'Cô y tá chăm sóc bà tôi rất tận tình.', ['who', 'which', 'whose', 'when'], 'who'],
  ['Anyone ___ wants to join the trip should tell me by Friday.', 'Ai muốn tham gia chuyến đi thì báo tôi trước thứ Sáu.', ['who', 'which', 'whose', 'where'], 'who'],

  ['The bus ___ goes to the airport leaves every 30 minutes.', 'Xe buýt ra sân bay cứ 30 phút có một chuyến.', ['which', 'who', 'whose', 'where'], 'which'],
  ['I bought a phone ___ takes great photos.', 'Tôi đã mua một chiếc điện thoại chụp ảnh rất đẹp.', ['which', 'who', 'whose', 'where'], 'which'],
  ['This is the medicine ___ helped me sleep.', 'Đây là loại thuốc đã giúp tôi ngủ được.', ['which', 'who', 'whose', 'where'], 'which'],
  ['Pho is a dish ___ is popular all over Vietnam.', 'Phở là món ăn được yêu thích khắp Việt Nam.', ['which', 'who', 'whose', 'where'], 'which'],
  ['The email ___ arrived this morning was from my boss.', 'Email đến sáng nay là của sếp tôi.', ['which', 'who', 'whose', 'where'], 'which'],
  ['We stayed in a hotel ___ had a pool on the roof.', 'Chúng tôi ở một khách sạn có hồ bơi trên sân thượng.', ['which', 'where', 'who', 'whose'], 'which'],
  ['The museum ___ opened last month is already very popular.', 'Bảo tàng mới mở tháng trước đã rất đông khách.', ['which', 'where', 'who', 'when'], 'which'],
  ['I can\'t find the key ___ opens the back door.', 'Tôi không tìm thấy chìa khóa mở cửa sau.', ['which', 'who', 'whose', 'where'], 'which'],
  ['The film ___ won the award is about life in Saigon.', 'Bộ phim đoạt giải kể về cuộc sống ở Sài Gòn.', ['which', 'who', 'whose', 'where'], 'which'],

  ['I have a colleague ___ husband is a police officer.', 'Tôi có một chị đồng nghiệp có chồng là cảnh sát.', ['whose', 'who\'s', 'who', 'which'], 'whose'],
  ['The man ___ car was stolen called the police.', 'Người đàn ông bị trộm mất ô tô đã gọi cảnh sát.', ['whose', 'who\'s', 'who', 'which'], 'whose'],
  ['That\'s the girl ___ brother works with me.', 'Đó là cô gái có anh trai làm cùng chỗ với tôi.', ['whose', 'who\'s', 'who', 'which'], 'whose'],
  ['I talked to a woman ___ son is studying in Australia.', 'Tôi đã nói chuyện với một chị có con trai đang du học ở Úc.', ['whose', 'who\'s', 'who', 'which'], 'whose'],
  ['He\'s the doctor ___ clinic is near the market.', 'Ông ấy là bác sĩ có phòng khám gần chợ.', ['whose', 'who\'s', 'who', 'which'], 'whose'],
  ['Do you know anyone ___ name starts with Q?', 'Bạn có biết ai có tên bắt đầu bằng chữ Q không?', ['whose', 'who\'s', 'who', 'which'], 'whose'],
  ['The customer ___ order was late got a free coffee.', 'Vị khách có đơn hàng bị giao trễ được tặng một ly cà phê.', ['whose', 'who\'s', 'who', 'which'], 'whose'],
  ['This is the house ___ roof was damaged in the storm.', 'Đây là ngôi nhà bị bão làm hỏng mái.', ['whose', 'which', 'who\'s', 'who'], 'whose'],
  ['I bought a laptop ___ battery lasts all day.', 'Tôi đã mua một chiếc laptop có pin dùng được cả ngày.', ['whose', 'which', 'who\'s', 'who'], 'whose'],

  ['This is the café ___ we first met.', 'Đây là quán cà phê nơi chúng tôi gặp nhau lần đầu.', ['where', 'which', 'whose', 'who'], 'where'],
  ['Hoi An is the city ___ we spent our honeymoon.', 'Hội An là thành phố nơi vợ chồng tôi đi hưởng tuần trăng mật.', ['where', 'which', 'when', 'who'], 'where'],
  ['I want to visit the village ___ my father grew up.', 'Tôi muốn về thăm ngôi làng nơi bố tôi lớn lên.', ['where', 'which', 'whose', 'who'], 'where'],
  ['Is there a shop near here ___ I can buy a SIM card?', 'Gần đây có cửa hàng nào để tôi mua thẻ SIM không?', ['where', 'which', 'when', 'who'], 'where'],
  ['The hotel ___ we stayed had a beautiful view of the sea.', 'Khách sạn chúng tôi ở nhìn ra biển rất đẹp.', ['where', 'which', 'who', 'whose'], 'where'],
  ['This is the office ___ my mother works.', 'Đây là văn phòng nơi mẹ tôi làm việc.', ['where', 'which', 'whose', 'who'], 'where'],
  ['The hospital ___ I was born has been rebuilt.', 'Bệnh viện nơi tôi chào đời đã được xây lại.', ['where', 'which', 'whose', 'who'], 'where'],
  ['We found a quiet beach ___ we could swim all day.', 'Chúng tôi tìm được một bãi biển yên tĩnh, nơi chúng tôi có thể bơi suốt cả ngày.', ['where', 'which', 'who', 'whose'], 'where'],
  ['I\'ll never forget the day ___ I started my first job.', 'Tôi sẽ không bao giờ quên ngày tôi bắt đầu công việc đầu tiên.', ['when', 'which', 'who', 'whose'], 'where'],
  ['Tet is the time ___ families get together.', 'Tết là dịp các gia đình sum họp.', ['when', 'which', 'who', 'whose'], 'where'],
  ['The year ___ I moved to Saigon was the hardest of my life.', 'Năm tôi chuyển vào Sài Gòn là năm vất vả nhất đời tôi.', ['when', 'which', 'who', 'whose'], 'where'],

  ['My mother, ___ is 60, still works.', 'Mẹ tôi năm nay 60 tuổi mà vẫn đi làm.', ['who', 'that', 'which', 'whose'], 'comma'],
  ['Phu Quoc, ___ is an island in the south, is famous for its beaches.', 'Phú Quốc, một hòn đảo ở phía nam, nổi tiếng với những bãi biển đẹp.', ['which', 'that', 'who', 'where'], 'comma'],
  ['My boss, ___ lives in Thu Duc, drives to work every day.', 'Sếp tôi sống ở Thủ Đức, ngày nào cũng lái xe đi làm.', ['who', 'that', 'which', 'whose'], 'comma'],
  ['Mr Nam, ___ son is in my class, teaches music.', 'Chú Nam, người có con trai học cùng lớp với tôi, là giáo viên dạy nhạc.', ['whose', 'that', 'who', 'which'], 'comma'],
  ['The Mekong, ___ flows through six countries, is very important to farmers.', 'Sông Mê Kông chảy qua sáu nước và rất quan trọng với nông dân.', ['which', 'that', 'who', 'where'], 'comma'],
  ['My sister, ___ studied in Japan, speaks Japanese very well.', 'Chị tôi, người từng du học ở Nhật, nói tiếng Nhật rất giỏi.', ['who', 'that', 'which', 'whose'], 'comma'],
  ['Hanoi, ___ is the capital of Vietnam, has a lot of lakes.', 'Hà Nội, thủ đô của Việt Nam, có rất nhiều hồ.', ['which', 'that', 'where', 'who'], 'comma'],
  ['I sold my old motorbike, ___ I had used for ten years.', 'Tôi đã bán chiếc xe máy cũ, chiếc xe tôi đã đi suốt mười năm.', ['which', 'that', 'who', 'where'], 'comma'],
  ['He passed the exam, ___ surprised everyone.', 'Anh ấy thi đỗ, điều này làm mọi người bất ngờ.', ['which', 'what', 'who', 'whose'], 'comma'],
  ['Our English teacher, ___ is from Canada, makes every lesson fun.', 'Thầy dạy tiếng Anh của chúng tôi, người Canada, khiến buổi học nào cũng vui.', ['who', 'that', 'which', 'whose'], 'comma'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, group]) => ({ id: en, en, vi, options: opts, answer: opts[0], group }))

export const ROUND = 10

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildRound(weak: string[]): (Frame & { shuffled: string[] })[] {
  // Câu từng sai chiếm tối đa nửa lượt; nếu câu mới không đủ thì lấy thêm câu sai còn lại để lượt luôn đủ số câu
  const ws = shuffle(FRAMES.filter((f) => weak.includes(f.id)))
  const half = Math.ceil(ROUND / 2)
  const rest = shuffle(FRAMES.filter((f) => !weak.includes(f.id)))
  return shuffle([...ws.slice(0, half), ...rest, ...ws.slice(half)].slice(0, ROUND)).map((f) => ({ ...f, shuffled: shuffle(f.options) }))
}

// Câu không có gợi ý trong ngoặc, nhưng vẫn bỏ "(…)" nếu có để giống các phòng khác
export const filled = (f: Frame) => f.en.replace(/___(\s*\([^)]*\))?/, f.answer)
