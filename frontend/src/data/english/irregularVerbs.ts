// Động từ bất quy tắc thông dụng: V1 (nguyên mẫu) · V2 (quá khứ đơn) · V3 (quá khứ phân từ).
// Phần tử đầu của v2 / v3 là dạng chính để hỏi; các dạng sau cũng đúng (Anh – Mỹ) và luôn được chấp nhận.
// level 1 = gặp hằng ngày, 2 = thường gặp, 3 = ít hơn.

export type VerbGroup = 'AAA' | 'ABB' | 'ABA' | 'ABC'

export interface IrregularVerb {
  v1: string
  v2: string[]
  v3: string[]
  vi: string
  group: VerbGroup
  level: 1 | 2 | 3
  note?: string
}

const V = (v1: string, v2: string | string[], v3: string | string[], vi: string, level: 1 | 2 | 3 = 1): Omit<IrregularVerb, 'group'> => ({
  v1, v2: Array.isArray(v2) ? v2 : [v2], v3: Array.isArray(v3) ? v3 : [v3], vi, level,
})

function group(v: Omit<IrregularVerb, 'group'>): VerbGroup {
  const [a, b, c] = [v.v1, v.v2[0], v.v3[0]]
  if (a === b && b === c) return 'AAA'
  if (b === c) return 'ABB'
  if (a === c) return 'ABA'
  return 'ABC'
}

const RAW: Omit<IrregularVerb, 'group'>[] = [
  // Ba dạng giống nhau
  V('cut', 'cut', 'cut', 'cắt'),
  V('put', 'put', 'put', 'đặt, để'),
  V('let', 'let', 'let', 'để cho, cho phép'),
  V('hit', 'hit', 'hit', 'đánh, đụng'),
  V('set', 'set', 'set', 'đặt, cài đặt', 2),
  V('cost', 'cost', 'cost', 'có giá, tốn'),
  V('hurt', 'hurt', 'hurt', 'làm đau, đau'),
  V('shut', 'shut', 'shut', 'đóng', 2),
  V('quit', 'quit', 'quit', 'bỏ (việc, thói quen)', 2),
  V('read', 'read', 'read', 'đọc'),
  V('spread', 'spread', 'spread', 'trải ra, lan ra', 3),
  V('bet', 'bet', 'bet', 'cá cược', 3),
  V('upset', 'upset', 'upset', 'làm buồn lòng', 3),

  // V2 = V3
  V('buy', 'bought', 'bought', 'mua'),
  V('bring', 'brought', 'brought', 'mang đến'),
  V('think', 'thought', 'thought', 'nghĩ'),
  V('teach', 'taught', 'taught', 'dạy'),
  V('catch', 'caught', 'caught', 'bắt, bắt kịp'),
  V('fight', 'fought', 'fought', 'đánh nhau, chiến đấu', 2),
  V('seek', 'sought', 'sought', 'tìm kiếm', 3),
  V('keep', 'kept', 'kept', 'giữ'),
  V('sleep', 'slept', 'slept', 'ngủ'),
  V('feel', 'felt', 'felt', 'cảm thấy'),
  V('leave', 'left', 'left', 'rời đi, để lại'),
  V('meet', 'met', 'met', 'gặp'),
  V('send', 'sent', 'sent', 'gửi'),
  V('spend', 'spent', 'spent', 'tiêu (tiền), dành (thời gian)'),
  V('lend', 'lent', 'lent', 'cho mượn', 2),
  V('build', 'built', 'built', 'xây'),
  V('bend', 'bent', 'bent', 'uốn cong, cúi', 3),
  V('tell', 'told', 'told', 'kể, bảo'),
  V('sell', 'sold', 'sold', 'bán'),
  V('find', 'found', 'found', 'tìm thấy'),
  V('have', 'had', 'had', 'có'),
  V('make', 'made', 'made', 'làm, tạo ra'),
  V('say', 'said', 'said', 'nói'),
  V('pay', 'paid', 'paid', 'trả (tiền)'),
  V('lay', 'laid', 'laid', 'đặt nằm, bày', 3),
  V('hear', 'heard', 'heard', 'nghe thấy'),
  V('stand', 'stood', 'stood', 'đứng'),
  V('understand', 'understood', 'understood', 'hiểu'),
  V('sit', 'sat', 'sat', 'ngồi'),
  V('win', 'won', 'won', 'thắng'),
  V('hold', 'held', 'held', 'cầm, tổ chức'),
  V('lose', 'lost', 'lost', 'mất, thua'),
  V('mean', 'meant', 'meant', 'có nghĩa là'),
  V('shoot', 'shot', 'shot', 'bắn, quay (phim)', 2),
  V('feed', 'fed', 'fed', 'cho ăn', 2),
  V('lead', 'led', 'led', 'dẫn dắt', 2),
  V('dig', 'dug', 'dug', 'đào', 3),
  V('hang', 'hung', 'hung', 'treo', 2),
  V('stick', 'stuck', 'stuck', 'dán, mắc kẹt', 3),
  V('light', 'lit', 'lit', 'thắp, châm lửa', 3),
  V('sweep', 'swept', 'swept', 'quét', 3),
  V('learn', ['learned', 'learnt'], ['learned', 'learnt'], 'học'),
  V('spell', ['spelled', 'spelt'], ['spelled', 'spelt'], 'đánh vần', 2),
  V('burn', ['burned', 'burnt'], ['burned', 'burnt'], 'đốt, cháy', 2),
  V('dream', ['dreamed', 'dreamt'], ['dreamed', 'dreamt'], 'mơ', 2),
  V('smell', ['smelled', 'smelt'], ['smelled', 'smelt'], 'ngửi, có mùi', 3),

  // V3 giống V1
  V('come', 'came', 'come', 'đến'),
  V('become', 'became', 'become', 'trở thành'),
  V('run', 'ran', 'run', 'chạy'),

  // Ba dạng khác nhau
  V('be', ['was', 'were'], 'been', 'thì, là, ở'),
  V('go', 'went', 'gone', 'đi'),
  V('do', 'did', 'done', 'làm'),
  V('see', 'saw', 'seen', 'nhìn thấy'),
  V('eat', 'ate', 'eaten', 'ăn'),
  V('give', 'gave', 'given', 'đưa, cho'),
  V('take', 'took', 'taken', 'lấy, cầm, đi (xe)'),
  V('write', 'wrote', 'written', 'viết'),
  V('drive', 'drove', 'driven', 'lái xe'),
  V('ride', 'rode', 'ridden', 'cưỡi, đi (xe đạp, xe máy)'),
  V('rise', 'rose', 'risen', 'mọc, tăng lên', 2),
  V('speak', 'spoke', 'spoken', 'nói (ngôn ngữ)'),
  V('break', 'broke', 'broken', 'làm vỡ, làm gãy'),
  V('choose', 'chose', 'chosen', 'chọn'),
  V('steal', 'stole', 'stolen', 'ăn trộm', 2),
  V('wake', 'woke', 'woken', 'thức dậy, đánh thức'),
  V('forget', 'forgot', ['forgotten', 'forgot'], 'quên'),
  V('get', 'got', ['got', 'gotten'], 'nhận được, trở nên'),
  V('know', 'knew', 'known', 'biết'),
  V('grow', 'grew', 'grown', 'lớn lên, trồng'),
  V('throw', 'threw', 'thrown', 'ném'),
  V('blow', 'blew', 'blown', 'thổi', 2),
  V('fly', 'flew', 'flown', 'bay'),
  V('draw', 'drew', 'drawn', 'vẽ'),
  V('show', 'showed', ['shown', 'showed'], 'chỉ, cho xem'),
  V('wear', 'wore', 'worn', 'mặc, đeo'),
  V('tear', 'tore', 'torn', 'xé', 3),
  V('begin', 'began', 'begun', 'bắt đầu'),
  V('drink', 'drank', 'drunk', 'uống'),
  V('sing', 'sang', 'sung', 'hát'),
  V('swim', 'swam', 'swum', 'bơi'),
  V('ring', 'rang', 'rung', 'reo, gọi điện', 2),
  V('sink', 'sank', 'sunk', 'chìm', 3),
  V('fall', 'fell', 'fallen', 'ngã, rơi'),
  V('forgive', 'forgave', 'forgiven', 'tha thứ', 2),
  V('hide', 'hid', 'hidden', 'giấu, trốn', 2),
  V('bite', 'bit', 'bitten', 'cắn', 2),
  V('beat', 'beat', 'beaten', 'đánh bại, đập', 2),
  V('shake', 'shook', 'shaken', 'lắc, rung', 2),
  V('mistake', 'mistook', 'mistaken', 'nhầm lẫn', 3),
  V('freeze', 'froze', 'frozen', 'đóng băng', 2),
  V('lie', 'lay', 'lain', 'nằm', 3),
  V('swear', 'swore', 'sworn', 'thề, chửi thề', 3),
]

const NOTES: Record<string, string> = {
  read: 'Viết giống nhau nhưng V2, V3 đọc là /red/ (như "red"), còn V1 đọc /riːd/.',
  lie: 'lie (nằm) – lay – lain. Còn lie (nói dối) là động từ có quy tắc: lie – lied – lied. Đừng nhầm với lay (đặt) – laid – laid.',
  lay: 'lay (đặt, bày) – laid – laid. Đừng nhầm với lie (nằm) – lay – lain.',
  hang: 'hang (treo đồ) – hung – hung. Nghĩa "treo cổ" thì có quy tắc: hanged.',
  get: 'Anh dùng got, Mỹ hay dùng gotten cho V3 (I have got / have gotten).',
  learn: 'Mỹ dùng learned, Anh dùng cả learnt — đều đúng.',
  be: 'Quá khứ: I / he / she / it was, you / we / they were.',
  forget: 'V3 chuẩn là forgotten; tiếng Mỹ nói thân mật đôi khi dùng forgot.',
  show: 'V3 hay dùng shown; showed cũng được chấp nhận.',
  buy: 'Đừng nhầm bought (mua) với brought (mang, của bring).',
  bring: 'Đừng nhầm brought (mang) với bought (mua, của buy).',
  fall: 'fall – fell – fallen (ngã). Đừng nhầm với feel – felt – felt (cảm thấy).',
  feel: 'feel – felt – felt. Đừng nhầm với fall – fell – fallen (ngã).',
}

export const IRREGULAR_VERBS: IrregularVerb[] = RAW.map((v) => ({ ...v, group: group(v), ...(NOTES[v.v1] ? { note: NOTES[v.v1] } : {}) }))

export const GROUP_INFO: Record<VerbGroup, { title: string; desc: string }> = {
  AAA: { title: 'Ba dạng giống nhau', desc: 'Không đổi gì cả: cut – cut – cut. Chỉ cần nhớ đây là động từ bất quy tắc, đừng thêm -ed (cutted).' },
  ABB: { title: 'Quá khứ = phân từ', desc: 'V2 và V3 giống nhau: buy – bought – bought. Học một dạng là có cả hai. Nhóm -ought / -aught (bought, thought, taught, caught) rất hay gặp.' },
  ABA: { title: 'Phân từ giống nguyên mẫu', desc: 'Chỉ có 3 động từ: come – came – come, become – became – become, run – ran – run.' },
  ABC: { title: 'Ba dạng khác nhau', desc: 'Phải nhớ riêng từng dạng. Mẹo: nhiều V3 tận cùng -en / -n (eaten, given, known), và nhóm i – a – u (begin – began – begun, drink – drank – drunk).' },
}
