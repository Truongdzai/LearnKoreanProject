// Cụm động từ (phrasal verbs): chọn đúng tiểu từ theo nghĩa gợi ý trong ngoặc, và đặt đại từ đúng chỗ.
// Mỗi câu chỉ một phương án đúng: không đưa những cặp người bản ngữ dùng thay nhau (get on with / get along with,
// put on / turn on đèn, turn up / turn on âm lượng); phương án sai thì sai ngữ pháp hoặc trái hẳn nghĩa gợi ý.

export type PhrasalGroup = 'look' | 'get' | 'everyday' | 'object'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: PhrasalGroup
  // Cụm gốc của đáp án, để tra nghĩa trong VERBS
  verb: string
}

export const GROUPS: Record<PhrasalGroup, { name: string; words: string; rule: string; ex: string }> = {
  look: {
    name: 'Nhóm look',
    words: 'look after · look for · look up · look forward to · look out',
    rule: 'Cùng là look nhưng đổi tiểu từ là đổi nghĩa: look after = chăm sóc, look for = tìm, look up = tra, look forward to = mong chờ, look out = coi chừng. look forward to luôn giữ to, sau nó là danh từ hoặc V-ing.',
    ex: 'I\'m looking for a cheap hotel near the beach.',
  },
  get: {
    name: 'Nhóm get',
    words: 'get up · get on · get off · get along with · get over',
    rule: 'get up = thức dậy; get on / get off = lên / xuống xe buýt, tàu, máy bay, xe máy (ô tô, taxi thì dùng get in / get out of); get along with = hợp với ai (không có người đi sau thì bỏ with); get over = khỏi bệnh, vượt qua chuyện buồn.',
    ex: 'We got off the bus near the night market.',
  },
  everyday: {
    name: 'Cụm thường ngày',
    words: 'put on · take off · turn on / off · pick up · give up · find out · run out of · come across · turn down · put off',
    rule: 'Nghĩa của cả cụm thường khác hẳn động từ gốc nên phải học theo cụm: give up = bỏ, run out of = hết, put off = hoãn, turn down = từ chối, find out = biết được, tìm ra (thông tin) — còn find + đồ vật là tìm thấy (find my keys).',
    ex: 'Put on your helmet before you get on the motorbike.',
  },
  object: {
    name: 'Vị trí tân ngữ',
    words: 'turn it off · pick me up · look after them',
    rule: 'Cụm tách được (turn off, pick up, take off, try on, look up): tân ngữ là đại từ (it, them, me, him) bắt buộc đứng giữa — turn it off, không nói turn off it; tân ngữ là danh từ thì đứng giữa hay sau đều được (turn the TV off / turn off the TV). Cụm không tách được (look after, look for, come across, look forward to): tân ngữ luôn đứng sau cả cụm — look after them.',
    ex: 'If you don\'t need the light, turn it off.',
  },
}

// Nghĩa từng cụm; sep: true = tách được (đại từ đứng giữa), false = không tách được
export const VERBS: Record<string, { vi: string; sep?: boolean }> = {
  'look after': { vi: 'chăm sóc, trông nom', sep: false },
  'look for': { vi: 'tìm, đi tìm', sep: false },
  'look up': { vi: 'tra (từ điển, trên mạng)', sep: true },
  'look forward to': { vi: 'mong chờ, háo hức đợi', sep: false },
  'look out': { vi: 'coi chừng, cẩn thận (look out for + điều cần tránh)' },
  'get up': { vi: 'thức dậy, ra khỏi giường' },
  'get on': { vi: 'lên (xe buýt, tàu, máy bay)', sep: false },
  'get off': { vi: 'xuống (xe buýt, tàu, máy bay)', sep: false },
  'get along with': { vi: 'hợp, hoà thuận với ai (không có người đi sau thì bỏ with)', sep: false },
  'get over': { vi: 'khỏi (bệnh), vượt qua (chuyện buồn)', sep: false },
  'put on': { vi: 'mặc, đội, đeo vào', sep: true },
  'take off': { vi: 'cởi ra; với máy bay là cất cánh', sep: true },
  'try on': { vi: 'mặc thử, đi thử', sep: true },
  'turn on': { vi: 'bật (đèn, máy)', sep: true },
  'turn off': { vi: 'tắt (đèn, máy)', sep: true },
  'turn down': { vi: 'vặn nhỏ; từ chối (lời mời, đề nghị)', sep: true },
  'pick up': { vi: 'đón (ai đó); nhặt lên', sep: true },
  'give up': { vi: 'bỏ (việc, thói quen); bỏ cuộc', sep: true },
  'find out': { vi: 'biết được, tìm ra (thông tin)' },
  'run out of': { vi: 'hết, cạn (tiền, thời gian, gạo…)', sep: false },
  'come across': { vi: 'tình cờ thấy, tình cờ gặp', sep: false },
  'put off': { vi: 'hoãn lại', sep: true },
}

type Raw = [string, string, string[], PhrasalGroup, string]

const RAW: Raw[] = [
  ['Who will ___ (chăm sóc) the kids while you\'re away?', 'Ai sẽ trông bọn trẻ khi bạn đi vắng?', ['look after', 'look for', 'look at', 'look forward to'], 'look', 'look after'],
  ['My mother ___ (trông nom) our baby while we\'re at work.', 'Mẹ tôi trông con giúp chúng tôi trong giờ đi làm.', ['looks after', 'looks at', 'looks for', 'looks forward to'], 'look', 'look after'],
  ['I\'m ___ (tìm) my keys. Have you seen them?', 'Tôi đang tìm chùm chìa khoá. Bạn có thấy đâu không?', ['looking for', 'looking after', 'looking up', 'looking forward to'], 'look', 'look for'],
  ['Excuse me, I\'m ___ (tìm) the bus station.', 'Xin lỗi, tôi đang tìm bến xe buýt.', ['looking for', 'looking after', 'looking forward to'], 'look', 'look for'],
  ['I always ___ (tra) new words in a dictionary.', 'Tôi luôn tra từ mới trong từ điển.', ['look up', 'look after', 'look forward to'], 'look', 'look up'],
  ['Can you ___ (tra) the opening hours of the museum?', 'Bạn tra giúp giờ mở cửa của bảo tàng được không?', ['look up', 'look after', 'look forward to'], 'look', 'look up'],
  ['I\'m really ___ (mong chờ) the weekend.', 'Tôi rất mong đến cuối tuần.', ['looking forward to', 'looking forward', 'looking for', 'looking up'], 'look', 'look forward to'],
  ['The children are ___ (háo hức chờ) Tet.', 'Bọn trẻ đang háo hức chờ Tết.', ['looking forward to', 'looking forward', 'looking after', 'looking for'], 'look', 'look forward to'],
  ['We ___ (mong) seeing you again soon.', 'Chúng tôi mong sớm được gặp lại bạn.', ['look forward to', 'look forward', 'look for', 'look after'], 'look', 'look forward to'],
  ['___ (coi chừng)! A motorbike is coming!', 'Coi chừng! Có xe máy tới kìa!', ['Look out', 'Look after', 'Look for', 'Look forward to'], 'look', 'look out'],
  ['___ (cẩn thận) for pickpockets at the market.', 'Cẩn thận kẻ móc túi ở chợ nhé.', ['Look out', 'Look after', 'Look up', 'Look forward'], 'look', 'look out'],

  ['I ___ (thức dậy), brushed my teeth and made some coffee.', 'Tôi dậy, đánh răng rồi pha cà phê.', ['got up', 'got over', 'got along', 'got on'], 'get', 'get up'],
  ['My father ___ (thức dậy) at five every morning.', 'Sáng nào bố tôi cũng dậy lúc năm giờ.', ['gets up', 'gets over', 'gets along with'], 'get', 'get up'],
  ['The bus is here. Let\'s ___ (lên xe).', 'Xe buýt tới rồi. Lên xe thôi.', ['get on', 'get off', 'get over'], 'get', 'get on'],
  ['I ___ (lên) the wrong bus and ended up in District 7.', 'Tôi lên nhầm xe buýt, thế là lạc sang tận Quận 7.', ['got on', 'got off', 'got over', 'got up'], 'get', 'get on'],
  ['We ___ (xuống) the train in Hue and took a taxi to our hotel.', 'Chúng tôi xuống tàu ở Huế rồi đi taxi về khách sạn.', ['got off', 'got on', 'got over', 'got up'], 'get', 'get off'],
  ['This is my stop — I need to ___ (xuống xe).', 'Đến trạm của tôi rồi — tôi phải xuống xe.', ['get off', 'get on', 'get over'], 'get', 'get off'],
  ['Do you ___ (hợp tính với) your colleagues?', 'Bạn có hợp tính với đồng nghiệp không?', ['get along with', 'get along', 'get over', 'get up'], 'get', 'get along with'],
  ['My sister and I don\'t ___ (hợp nhau) very well.', 'Chị em tôi không hợp nhau lắm.', ['get along', 'get along with', 'get over'], 'get', 'get along with'],
  ['She\'s friendly and ___ (hoà đồng với) everyone in the office.', 'Cô ấy thân thiện và hoà đồng với mọi người trong văn phòng.', ['gets along with', 'gets along', 'gets over', 'gets up'], 'get', 'get along with'],
  ['It took me two weeks to ___ (khỏi) the flu.', 'Tôi mất hai tuần mới khỏi cúm.', ['get over', 'get off', 'get up', 'get along with'], 'get', 'get over'],
  ['He was sad for months, but he finally ___ (vượt qua) it.', 'Anh ấy buồn mấy tháng trời, nhưng cuối cùng cũng vượt qua được.', ['got over', 'got off', 'got up', 'got along with'], 'get', 'get over'],

  ['It\'s cold outside. ___ (mặc vào) your jacket.', 'Ngoài trời lạnh đấy. Mặc áo khoác vào đi.', ['Put on', 'Take off', 'Put off'], 'everyday', 'put on'],
  ['It\'s hot in here. Can I ___ (cởi) my coat?', 'Trong này nóng quá. Tôi cởi áo khoác ra được không?', ['take off', 'put on', 'turn off', 'put off'], 'everyday', 'take off'],
  ['Our plane ___ (cất cánh) at 7:15 tomorrow morning.', 'Sáng mai máy bay của chúng tôi cất cánh lúc 7 giờ 15.', ['takes off', 'gets off', 'turns off', 'puts off'], 'everyday', 'take off'],
  ['It\'s dark in here. Can you ___ (bật) the light?', 'Trong này tối quá. Bạn bật đèn lên được không?', ['turn on', 'turn off', 'turn down', 'take off'], 'everyday', 'turn on'],
  ['Please ___ (tắt) your phones during the film.', 'Vui lòng tắt điện thoại trong khi chiếu phim.', ['turn off', 'turn on', 'take off', 'put on'], 'everyday', 'turn off'],
  ['The exam was hard, but she didn\'t ___ (bỏ cuộc).', 'Bài thi khó, nhưng cô ấy không bỏ cuộc.', ['give up', 'put off', 'pick up', 'find out'], 'everyday', 'give up'],
  ['He ___ (bỏ) his job to open a small coffee shop.', 'Anh ấy bỏ việc để mở một quán cà phê nhỏ.', ['gave up', 'took off', 'put off', 'turned off'], 'everyday', 'give up'],
  ['Who\'s going to ___ (đón) Grandma at the station?', 'Ai sẽ ra ga đón bà?', ['pick up', 'give up', 'take off', 'put on'], 'everyday', 'pick up'],
  ['When did you ___ (biết được) about the party?', 'Bạn biết chuyện bữa tiệc từ lúc nào?', ['find out', 'find', 'pick up', 'look up'], 'everyday', 'find out'],
  ['Hurry up — we\'re ___ (sắp hết) time!', 'Nhanh lên — sắp hết giờ rồi!', ['running out of', 'running out', 'running off'], 'everyday', 'run out of'],
  ['We\'ve ___ (hết) rice, so I\'ll go to the shop.', 'Nhà hết gạo rồi, để tôi ra cửa hàng mua.', ['run out of', 'run out', 'run off'], 'everyday', 'run out of'],
  ['I ___ (tình cờ thấy) an old photo of my parents in a drawer.', 'Tôi tình cờ thấy một tấm ảnh cũ của bố mẹ trong ngăn kéo.', ['came across', 'found out', 'came over', 'came up'], 'everyday', 'come across'],
  ['She ___ (từ chối) the job offer because the pay was too low.', 'Cô ấy từ chối lời mời làm việc vì lương quá thấp.', ['turned down', 'turned off', 'turned up', 'took off'], 'everyday', 'turn down'],
  ['They ___ (hoãn) the meeting until Monday because of the storm.', 'Họ hoãn cuộc họp đến thứ Hai vì bão.', ['put off', 'put on', 'turned off', 'took off'], 'everyday', 'put off'],

  ['The TV is still on. Turn ___ (tắt) before you go to bed.', 'TV vẫn còn bật. Tắt đi trước khi đi ngủ nhé.', ['it off', 'off it', 'on it'], 'object', 'turn off'],
  ['The radio is too loud. Could you turn ___ (vặn nhỏ) a little?', 'Đài to quá. Bạn vặn nhỏ một chút được không?', ['it down', 'down it', 'it up'], 'object', 'turn down'],
  ['My flight lands at six. Can you pick ___ (đón) at the airport?', 'Chuyến bay của tôi hạ cánh lúc sáu giờ. Bạn ra sân bay đón tôi được không?', ['me up', 'up me', 'I up'], 'object', 'pick up'],
  ['The kids finish school at four. Can you pick ___ (đón)?', 'Bọn trẻ tan học lúc bốn giờ. Bạn đón chúng được không?', ['them up', 'up them', 'they up'], 'object', 'pick up'],
  ['Your boots are muddy. Please take ___ (cởi) at the door.', 'Đôi ủng của bạn dính bùn rồi. Cởi ra ngoài cửa nhé.', ['them off', 'off them', 'it off'], 'object', 'take off'],
  ['These sandals look nice. Can I try ___ (đi thử)?', 'Đôi xăng-đan này đẹp quá. Tôi đi thử được không?', ['them on', 'on them', 'it on'], 'object', 'try on'],
  ['I don\'t know this word. I\'ll look ___ (tra) in the dictionary.', 'Tôi không biết từ này. Để tôi tra từ điển.', ['it up', 'up it', 'up'], 'object', 'look up'],
  ['Our new teacher is from Canada. Last night I looked ___ (tra) online.', 'Thầy giáo mới của chúng tôi là người Canada. Tối qua tôi đã tra thông tin về thầy trên mạng.', ['him up', 'up him', 'he up'], 'object', 'look up'],
  ['My grandparents are old, so I look ___ (chăm sóc) every weekend.', 'Ông bà tôi đã già nên cuối tuần nào tôi cũng chăm sóc ông bà.', ['after them', 'them after', 'after they'], 'object', 'look after'],
  ['I can\'t find my glasses. Can you help me look ___ (tìm)?', 'Tôi không tìm thấy kính. Bạn giúp tôi tìm với?', ['for them', 'them for', 'for it'], 'object', 'look for'],
  ['Our trip to Sa Pa is next week — we\'re really looking ___ (mong chờ).', 'Tuần sau là đi Sa Pa rồi — chúng tôi mong lắm.', ['forward to it', 'forward it', 'it forward to'], 'object', 'look forward to'],
  ['I lost my ring last year, and today I came ___ (tình cờ thấy) in a drawer.', 'Năm ngoái tôi làm mất chiếc nhẫn, hôm nay tình cờ thấy nó trong ngăn kéo.', ['across it', 'it across', 'across'], 'object', 'come across'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, group, verb]) => ({ id: en, en, vi, options: opts, answer: opts[0], group, verb }))

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

export const filled = (f: Frame) => f.en.replace(/___\s*\([^)]*\)/, f.answer)
