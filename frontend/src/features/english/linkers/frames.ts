// Liên từ & từ nối: and / but / so / because / or, although / despite / however, because of / so that / to,
// when / while / until / as soon as. Mỗi câu chỉ một phương án đúng: không đưa ra cặp dùng thay nhau được
// (although / even though, when / while với thì tiếp diễn, so / so that chỉ mục đích), không đưa But làm
// phương án sai khi đáp án là However (But đầu câu vẫn đúng), không đưa Although, đứng một mình đầu câu.

export type LinkerGroup = 'basic' | 'contrast' | 'reason' | 'time'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  group: LinkerGroup
  why: string
}

export const GROUPS: Record<LinkerGroup, { name: string; form: string; rule: string; ex: string }> = {
  basic: {
    name: 'Năm từ nối cơ bản',
    form: 'and · but · so · because · or',
    rule: 'Chọn theo quan hệ nghĩa giữa hai vế: and thêm ý cùng chiều, but nêu ý trái ngược, so đứng trước kết quả, because đứng trước lý do, or đưa ra lựa chọn (trà hay cà phê) hoặc mang nghĩa "không thì" sau câu mệnh lệnh. so và because ngược chiều nhau: It rained, so we stayed home — We stayed home because it rained.',
    ex: 'I was tired, so I went to bed early.',
  },
  contrast: {
    name: 'Tương phản: although, despite, however',
    form: 'although it rained · despite the rain · However, …',
    rule: 'although / even though + mệnh đề (có chủ ngữ và động từ): although it was raining. despite / in spite of + danh từ hoặc V-ing: despite the rain, despite being tired, không có "despite of". but nối hai vế trong một câu; however thì không nối được hai vế như vậy mà đứng đầu câu mới, có dấu phẩy theo sau (However, …), hoặc chen giữa câu, giữa hai dấu phẩy (The service, however, was slow). Không ghép although với but như "tuy… nhưng…" của tiếng Việt.',
    ex: 'It was very cold. However, we went swimming.',
  },
  reason: {
    name: 'Lý do, kết quả, mục đích',
    form: 'because it rained · because of the rain · so that / to + V',
    rule: 'because + mệnh đề (because it was raining), because of + danh từ (because of the rain). so nêu kết quả. Muốn nói "để làm gì" thì dùng to + V nguyên mẫu (to get a better job) hoặc so that + mệnh đề (so that I can…); không nói for get, for getting khi nói mình làm gì để làm gì. Câu đã có because thì vế sau không thêm so như "vì… nên…" của tiếng Việt.',
    ex: 'The flight was delayed because of the storm.',
  },
  time: {
    name: 'Thời gian: when, while, until…',
    form: 'when · while · until · before · after · as soon as',
    rule: 'when = khi (việc ngắn, một thời điểm), while = trong lúc (việc đang kéo dài), until = cho đến khi, as soon as = ngay khi. Các từ này đi với mệnh đề; before, after, until đi được cả với danh từ, còn during chỉ đi với danh từ: during the film. Nói về tương lai thì sau when / until / as soon as dùng hiện tại đơn, không dùng will. Sau before / after / while có thể dùng V-ing: before eating.',
    ex: 'Wait here until I come back.',
  },
}

type Raw = [string, string, string[], LinkerGroup, string]

const RAW: Raw[] = [
  ['I was very hungry, ___ I ate two bowls of pho.', 'Tôi đói quá nên đã ăn hết hai bát phở.', ['so', 'but', 'or'], 'basic', 'Đói (nguyên nhân) → ăn hai bát phở (kết quả). Vế sau là kết quả → so.'],
  ['This motorbike is old, ___ it still runs well.', 'Chiếc xe máy này cũ rồi nhưng vẫn chạy tốt.', ['but', 'so', 'because', 'or'], 'basic', 'Cũ mà vẫn chạy tốt: hai ý trái nhau → but.'],
  ['We can\'t go to the beach today ___ it\'s raining heavily.', 'Hôm nay chúng tôi không đi biển được vì trời mưa to.', ['because', 'so', 'but', 'or'], 'basic', 'Mưa to là lý do không đi biển được. Vế sau là lý do → because.'],
  ['My sister can speak English ___ French.', 'Chị tôi nói được tiếng Anh và tiếng Pháp.', ['and', 'but', 'so', 'because'], 'basic', 'Thêm một thứ cùng chiều (biết cả hai thứ tiếng) → and.'],
  ['Hurry up, ___ you\'ll miss the bus.', 'Nhanh lên, không thì bạn sẽ lỡ xe buýt.', ['or', 'and', 'so'], 'basic', 'Sau câu mệnh lệnh, or mang nghĩa "không thì": Hurry up, or you\'ll miss the bus.'],
  ['I called you twice, ___ you didn\'t answer.', 'Tôi gọi cho bạn hai lần nhưng bạn không nghe máy.', ['but', 'so', 'or'], 'basic', 'Gọi hai lần mà không ai nghe: hai ý trái nhau → but.'],
  ['I\'m going to bed early tonight ___ I have to get up at 5 a.m.', 'Tối nay tôi đi ngủ sớm vì 5 giờ sáng phải dậy.', ['because', 'so', 'but', 'or'], 'basic', 'Phải dậy lúc 5 giờ là lý do đi ngủ sớm. Vế sau là lý do → because.'],
  ['Do you want to eat out ___ cook at home tonight?', 'Tối nay bạn muốn ăn ngoài hay nấu ở nhà?', ['or', 'and', 'but', 'so'], 'basic', 'Hỏi chọn một trong hai (ăn ngoài hay nấu ở nhà) → or.'],
  ['My phone battery was dead, ___ I couldn\'t call you.', 'Điện thoại tôi hết pin nên tôi không gọi cho bạn được.', ['so', 'but', 'because', 'or'], 'basic', 'Hết pin (nguyên nhân) → không gọi được (kết quả). Vế sau là kết quả → so.'],
  ['You can pay in cash ___ by card.', 'Bạn có thể trả bằng tiền mặt hoặc bằng thẻ.', ['or', 'but', 'so', 'because'], 'basic', 'Hai cách trả, chọn một trong hai → or.'],
  ['I bought a shirt ___ a pair of jeans at Ben Thanh Market.', 'Tôi mua một chiếc áo sơ mi và một chiếc quần jeans ở chợ Bến Thành.', ['and', 'but', 'so', 'because'], 'basic', 'Mua cả hai món, nối hai danh từ cùng chiều → and.'],
  ['My husband ___ I both work at a bank.', 'Chồng tôi và tôi đều làm việc ở ngân hàng.', ['and', 'or', 'but', 'so'], 'basic', 'Cả hai người (both) → and. or chỉ chọn một người nên không đi với both.'],

  ['___ the rain, we went out for dinner.', 'Dù trời mưa, chúng tôi vẫn ra ngoài ăn tối.', ['Despite', 'Although', 'However', 'Even though'], 'contrast', 'the rain là danh từ, không phải mệnh đề → Despite. Although / even though cần mệnh đề (although it was raining); However không đứng trước danh từ.'],
  ['___ it was late, we kept working.', 'Dù đã muộn, chúng tôi vẫn tiếp tục làm việc.', ['Although', 'Despite', 'However', 'In spite of'], 'contrast', 'it was late là mệnh đề (có chủ ngữ it và động từ was) → Although. Despite / in spite of chỉ đi với danh từ hoặc V-ing.'],
  ['It was very cold. ___, we went swimming.', 'Trời rất lạnh. Tuy vậy, chúng tôi vẫn đi bơi.', ['However', 'Despite', 'Even though'], 'contrast', 'Đầu câu mới, ngay sau là dấu phẩy, ý trái với câu trước → However,. Despite cần danh từ đi sau, even though cần cả một mệnh đề.'],
  ['The food was delicious. The service, ___, was very slow.', 'Đồ ăn rất ngon. Tuy nhiên, phục vụ lại rất chậm.', ['however', 'but', 'although', 'despite'], 'contrast', 'however chen được vào giữa câu, đứng giữa hai dấu phẩy. but, although, despite không đứng một mình như vậy.'],
  ['I\'d love to help you. ___, I\'m too busy this week.', 'Tôi rất muốn giúp bạn. Tuy nhiên, tuần này tôi bận quá.', ['However', 'Despite', 'Because of'], 'contrast', 'Câu mới nêu ý trái với câu trước, từ nối đứng đầu và có dấu phẩy → However,. Despite, because of phải có danh từ đi sau.'],
  ['___ his age, my grandfather still rides a motorbike.', 'Dù đã lớn tuổi, ông tôi vẫn đi xe máy.', ['Despite', 'Although', 'However', 'Even though'], 'contrast', 'his age là danh từ → Despite his age. Although / even though cần mệnh đề: although he is old.'],
  ['Despite ___ tired, she finished the report.', 'Dù mệt, cô ấy vẫn làm xong bản báo cáo.', ['being', 'she was', 'be', 'of being'], 'contrast', 'Sau despite dùng danh từ hoặc V-ing → despite being tired. Không nói despite of, cũng không đặt mệnh đề (she was) sau despite.'],
  ['Although ___, we enjoyed our trip to Ha Long Bay.', 'Dù thời tiết xấu, chúng tôi vẫn rất thích chuyến đi vịnh Hạ Long.', ['the weather was bad', 'the bad weather', 'of the bad weather'], 'contrast', 'Sau although phải là mệnh đề có chủ ngữ và động từ: although the weather was bad. Muốn dùng danh từ thì đổi sang despite the bad weather.'],
  ['Although the hotel was cheap, ___ was very clean.', 'Tuy khách sạn rẻ nhưng phòng rất sạch.', ['the room', 'but the room', 'so the room'], 'contrast', 'Tiếng Việt nói "tuy… nhưng…", tiếng Anh chỉ dùng một từ nối: đầu câu đã có although thì vế sau không thêm but (hay so).'],
  ['This phone is expensive ___ it takes great photos.', 'Điện thoại này đắt nhưng chụp ảnh rất đẹp.', ['but', 'however', 'despite'], 'contrast', 'Nối hai vế trong cùng một câu → but. however không nối hai vế như but, phải tách thành câu mới (… expensive. However, it…); despite không đi với mệnh đề.'],
  ['We arrived on time ___ the heavy traffic.', 'Dù đường kẹt xe nặng, chúng tôi vẫn đến đúng giờ.', ['despite', 'despite of', 'although', 'however'], 'contrast', 'despite + danh từ, không có of: despite the heavy traffic (nói in spite of the heavy traffic cũng được). although / however không đứng trước danh từ.'],
  ['She went to work ___ she had a bad cold.', 'Cô ấy vẫn đi làm dù đang bị cảm nặng.', ['even though', 'despite', 'however', 'in spite of'], 'contrast', 'she had a bad cold là mệnh đề → even though (giống although, nhấn mạnh hơn). despite / in spite of chỉ đi với danh từ hoặc V-ing.'],

  ['The flight was delayed ___ the storm.', 'Chuyến bay bị hoãn vì bão.', ['because of', 'because', 'so', 'so that'], 'reason', 'the storm là danh từ → because of. because phải đi với mệnh đề: because there was a storm.'],
  ['I couldn\'t sleep ___ the room was too hot.', 'Tôi không ngủ được vì phòng nóng quá.', ['because', 'because of', 'so', 'so that'], 'reason', 'the room was too hot là mệnh đề nêu lý do → because. because of chỉ đi với danh từ: because of the heat.'],
  ['I couldn\'t hear you ___ the noise.', 'Tôi không nghe được bạn nói vì ồn quá.', ['because of', 'because', 'so', 'although'], 'reason', 'the noise là danh từ → because of the noise. because cần mệnh đề: because it was noisy.'],
  ['Because it was raining, ___ stayed at home.', 'Vì trời mưa nên chúng tôi ở nhà.', ['we', 'so we', 'but we'], 'reason', 'Tiếng Việt nói "vì… nên…", tiếng Anh chỉ dùng một từ nối: đã có because thì vế sau không thêm so. Hoặc nói: It was raining, so we stayed at home.'],
  ['I\'m saving money ___ I can buy a new laptop.', 'Tôi đang tiết kiệm tiền để mua laptop mới.', ['so that', 'to', 'because of'], 'reason', 'Chỉ mục đích, sau chỗ trống là mệnh đề có chủ ngữ (I can buy) → so that. to chỉ đi với động từ nguyên mẫu: to buy a new laptop.'],
  ['She went to the bank ___ some money.', 'Cô ấy ra ngân hàng để rút ít tiền.', ['to get', 'for get', 'for getting', 'to getting'], 'reason', 'Nói "để làm gì" → to + V nguyên mẫu: to get. Không dùng for + V như for get hay for getting.'],
  ['Take an umbrella ___ you don\'t get wet.', 'Mang theo ô để khỏi bị ướt.', ['so that', 'to', 'for'], 'reason', 'Chỉ mục đích, sau chỗ trống là mệnh đề (you don\'t get wet) → so that. to phải đi với động từ nguyên mẫu (to stay dry), còn for không dùng để nói mục đích trước một mệnh đề.'],
  ['The bus was full, ___ I took a taxi.', 'Xe buýt chật kín nên tôi đi taxi.', ['so', 'because', 'because of', 'to'], 'reason', 'Xe buýt chật (nguyên nhân) → đi taxi (kết quả). Vế sau là kết quả → so.'],
  ['He\'s learning English ___ get a better job.', 'Anh ấy học tiếng Anh để tìm được việc tốt hơn.', ['to', 'for', 'so that', 'because'], 'reason', 'Mục đích + động từ nguyên mẫu → to get. Không nói for get; so that phải đi với mệnh đề có chủ ngữ (so that he can get…).'],
  ['I didn\'t go to the party ___ I had a headache.', 'Tôi không đi dự tiệc vì bị đau đầu.', ['because', 'because of', 'so', 'so that'], 'reason', 'I had a headache là mệnh đề nêu lý do → because. because of chỉ đi với danh từ: because of a headache.'],
  ['Many people come to Da Lat ___ its cool weather.', 'Nhiều người đến Đà Lạt vì khí hậu mát mẻ.', ['because of', 'because', 'so', 'although'], 'reason', 'its cool weather là danh từ → because of. because cần mệnh đề: because the weather is cool.'],
  ['It\'s late, ___ let\'s go home.', 'Muộn rồi, mình về thôi.', ['so', 'because', 'so that', 'because of'], 'reason', 'Muộn rồi (lý do) → về thôi (kết quả, lời đề nghị) → so.'],

  ['Wait here ___ I come back.', 'Đứng đợi ở đây cho đến khi tôi quay lại nhé.', ['until', 'while', 'when', 'after'], 'time', 'Đợi cho đến lúc tôi quay lại → until (cho đến khi).'],
  ['I didn\'t know about it ___ yesterday.', 'Mãi đến hôm qua tôi mới biết chuyện đó.', ['until', 'when', 'while', 'as soon as'], 'time', 'not … until = mãi đến … mới. Chỉ until đi được với mốc thời gian (yesterday); when, while, as soon as cần mệnh đề.'],
  ['I\'ll send you the photos ___ I get home.', 'Về đến nhà là tôi gửi ảnh cho bạn ngay.', ['as soon as', 'while', 'until', 'during'], 'time', 'Ngay khi về đến nhà → as soon as. Vế sau dùng hiện tại đơn (I get home) dù nói về tương lai.'],
  ['I fell asleep ___ the film.', 'Tôi ngủ gật trong lúc xem phim.', ['during', 'while', 'when', 'as soon as'], 'time', 'the film là danh từ → during. while, when, as soon as phải đi với mệnh đề: while I was watching the film.'],
  ['Someone stole my wallet ___ I was sleeping on the train.', 'Có người lấy trộm ví của tôi trong lúc tôi đang ngủ trên tàu.', ['while', 'during', 'until'], 'time', 'I was sleeping là mệnh đề, việc đang kéo dài → while. during chỉ đi với danh từ: during the trip.'],
  ['___ I arrived at the party, Lan had already gone home.', 'Khi tôi đến bữa tiệc thì Lan đã về rồi.', ['When', 'While', 'During', 'Until'], 'time', 'arrived là việc xảy ra trong chốc lát → When. While dùng cho việc đang kéo dài (while I was waiting); During đi với danh từ.'],
  ['___ breakfast, we checked out of the hotel.', 'Ăn sáng xong, chúng tôi trả phòng khách sạn.', ['After', 'While', 'When', 'As soon as'], 'time', 'breakfast là danh từ → After breakfast. While, when, as soon as phải đi với mệnh đề (as soon as we had breakfast).'],
  ['We got to the station just ___ the train left, so we didn\'t miss it.', 'Chúng tôi đến ga ngay trước khi tàu chạy nên không bị lỡ tàu.', ['before', 'after', 'until', 'while'], 'time', 'Đến trước giờ tàu chạy nên kịp tàu → before. Đến after the train left thì đã lỡ tàu.'],
  ['I\'ll call you as soon as I ___ at the hotel.', 'Đến khách sạn là tôi gọi cho bạn ngay.', ['arrive', 'will arrive', 'arriving', 'arrived'], 'time', 'Sau as soon as / when / until, nói về tương lai vẫn dùng hiện tại đơn: as soon as I arrive, không dùng will.'],
  ['Always wash your hands before ___.', 'Luôn rửa tay trước khi ăn.', ['eating', 'eat', 'to eat'], 'time', 'Sau before (và after) dùng V-ing: before eating, hoặc một mệnh đề: before you eat. Không nói before to eat.'],
  ['Don\'t use your phone while ___.', 'Đừng dùng điện thoại khi đang lái xe.', ['driving', 'drive', 'to drive'], 'time', 'while + V-ing khi hai việc cùng một chủ ngữ: while driving (= while you are driving).'],
  ['Let\'s grab a coffee ___ the meeting.', 'Mình đi uống cà phê trước giờ họp nhé.', ['before', 'while', 'when', 'as soon as'], 'time', 'the meeting là danh từ → before the meeting. while, when, as soon as phải đi với mệnh đề.'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, group, why]) => ({ id: en, en, vi, options: opts, answer: opts[0], group, why }))

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

// Câu đã điền (bỏ luôn gợi ý trong ngoặc nếu có)
export const filled = (f: Frame) => f.en.replace(/___(\s*\([^)]*\))?/, f.answer)
